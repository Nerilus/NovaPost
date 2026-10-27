// Unified HTTP execution engine for NovaPost (Direct Browser + Go Proxy)

export function interpolate(text, envVariables = []) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  if (Array.isArray(envVariables)) {
    envVariables.forEach(v => {
      if (v.enabled && v.key) {
        result = result.replaceAll(`{{${v.key}}}`, v.value ?? '');
      }
    });
  }
  return result;
}

export async function executeRequest(req, options = {}) {
  const {
    envVariables = [],
    useProxy = false,
    proxyUrl = '/api/proxy',
    timeoutMs = 15000,
  } = options;

  const startTime = performance.now();

  // 1. Prepare URL & Query Parameters
  let url = interpolate(req.url || '', envVariables);
  const activeParams = (req.params || []).filter(p => p.enabled && p.key.trim());

  if (activeParams.length > 0) {
    try {
      const urlObj = new URL(url);
      activeParams.forEach(p => {
        urlObj.searchParams.set(interpolate(p.key, envVariables), interpolate(p.value, envVariables));
      });
      url = urlObj.toString();
    } catch {
      // If URL has no protocol or is partial
      const queryStr = activeParams
        .map(p => `${encodeURIComponent(interpolate(p.key, envVariables))}=${encodeURIComponent(interpolate(p.value, envVariables))}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + queryStr;
    }
  }

  // 2. Prepare Headers
  const headerMap = {};
  (req.headers || []).forEach(h => {
    if (h.enabled && h.key.trim()) {
      headerMap[interpolate(h.key.trim(), envVariables)] = interpolate(h.value || '', envVariables);
    }
  });

  // 3. Apply Auth
  if (req.auth) {
    if (req.auth.type === 'bearer' && req.auth.bearerToken) {
      const token = interpolate(req.auth.bearerToken, envVariables);
      headerMap['Authorization'] = `Bearer ${token}`;
    } else if (req.auth.type === 'basic' && (req.auth.basicUser || req.auth.basicPass)) {
      const user = interpolate(req.auth.basicUser || '', envVariables);
      const pass = interpolate(req.auth.basicPass || '', envVariables);
      headerMap['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
    } else if (req.auth.type === 'apikey' && req.auth.apiKeyName) {
      const keyName = interpolate(req.auth.apiKeyName, envVariables);
      const keyVal = interpolate(req.auth.apiKeyValue || '', envVariables);
      if (req.auth.apiKeyLocation === 'query') {
        url += (url.includes('?') ? '&' : '?') + `${encodeURIComponent(keyName)}=${encodeURIComponent(keyVal)}`;
      } else {
        headerMap[keyName] = keyVal;
      }
    }
  }

  // 4. Prepare Body
  let bodyData = null;
  const method = (req.method || 'GET').toUpperCase();

  if (method !== 'GET' && method !== 'HEAD' && req.body) {
    if (req.body.type === 'raw' && req.body.raw) {
      bodyData = interpolate(req.body.raw, envVariables);
      if (!headerMap['Content-Type']) {
        if (req.body.rawType === 'json') headerMap['Content-Type'] = 'application/json';
        else if (req.body.rawType === 'xml') headerMap['Content-Type'] = 'application/xml';
        else if (req.body.rawType === 'html') headerMap['Content-Type'] = 'text/html';
        else headerMap['Content-Type'] = 'text/plain';
      }
    } else if (req.body.type === 'urlencoded') {
      const formParams = new URLSearchParams();
      (req.body.urlEncoded || []).forEach(item => {
        if (item.enabled && item.key) {
          formParams.append(interpolate(item.key, envVariables), interpolate(item.value, envVariables));
        }
      });
      bodyData = formParams.toString();
      headerMap['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (req.body.type === 'form-data') {
      const formData = new FormData();
      (req.body.formData || []).forEach(item => {
        if (item.enabled && item.key) {
          formData.append(interpolate(item.key, envVariables), interpolate(item.value, envVariables));
        }
      });
      bodyData = formData;
      // Fetch will automatically set multipart/form-data boundary
      delete headerMap['Content-Type'];
    }
  }

  // Helper for abort controller
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let responseObj;

    // Execute via Go Proxy or Direct Browser Fetch
    if (useProxy) {
      responseObj = await executeViaProxy(proxyUrl, {
        method,
        url,
        headers: headerMap,
        body: typeof bodyData === 'string' ? bodyData : null,
      }, controller.signal);
    } else {
      responseObj = await executeDirect(method, url, headerMap, bodyData, controller.signal);
    }

    clearTimeout(timer);
    const endTime = performance.now();
    const duration = Math.round(responseObj.timeMs || (endTime - startTime));

    // Run Test Assertions
    const testResults = runAssertions(req.tests || [], responseObj, duration);

    return {
      success: true,
      status: responseObj.status,
      statusText: responseObj.statusText || 'OK',
      headers: responseObj.headers || {},
      body: responseObj.body,
      size: responseObj.size || calculateSize(responseObj.body),
      timeMs: duration,
      testResults,
      cookies: responseObj.cookies || [],
      url,
      method,
    };
  } catch (err) {
    clearTimeout(timer);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    let isCors = false;
    let message = err.message || 'Request failed';

    if (err.name === 'AbortError') {
      message = `Request timed out after ${timeoutMs}ms`;
    } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      isCors = true;
      message = 'Failed to fetch. This may be due to browser CORS restriction, an invalid SSL certificate, or an unreachable host. You can toggle the Go Backend Proxy to bypass browser CORS.';
    }

    return {
      success: false,
      status: 0,
      statusText: isCors ? 'CORS / Network Error' : 'Error',
      headers: {},
      body: message,
      size: 0,
      timeMs: duration,
      isCors,
      error: message,
      testResults: [
        {
          name: 'Request Completed',
          passed: false,
          message: `Request failed: ${message}`,
        },
      ],
      url,
      method,
    };
  }
}

async function executeDirect(method, url, headers, body, signal) {
  const fetchOptions = {
    method,
    headers,
    signal,
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = body;
  }

  const res = await fetch(url, fetchOptions);

  // Extract headers
  const respHeaders = {};
  res.headers.forEach((val, key) => {
    respHeaders[key] = val;
  });

  const rawText = await res.text();

  return {
    status: res.status,
    statusText: res.statusText,
    headers: respHeaders,
    body: rawText,
    size: new Blob([rawText]).size,
  };
}

async function executeViaProxy(proxyUrl, payload, signal) {
  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Proxy error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    status: data.status,
    statusText: data.statusText,
    headers: data.headers || {},
    body: data.body || '',
    timeMs: data.timeMs,
    size: data.size || (data.body ? new Blob([data.body]).size : 0),
    cookies: data.cookies || [],
  };
}

function calculateSize(body) {
  if (!body) return 0;
  return new Blob([typeof body === 'string' ? body : JSON.stringify(body)]).size;
}

function runAssertions(tests, response, duration) {
  if (!tests || tests.length === 0) return [];

  let parsedJson = null;
  try {
    parsedJson = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  } catch {
    parsedJson = null;
  }

  return tests.map(test => {
    switch (test.type) {
      case 'status_code': {
        const expected = parseInt(test.expected, 10);
        const passed = response.status === expected;
        return {
          name: test.description || `Status code is ${expected}`,
          passed,
          message: passed
            ? `Status code is ${response.status}`
            : `Expected status ${expected} but received ${response.status}`,
        };
      }

      case 'response_time': {
        const max = parseInt(test.maxMs, 10) || 1000;
        const passed = duration <= max;
        return {
          name: test.description || `Response time < ${max}ms`,
          passed,
          message: passed
            ? `Response time was ${duration}ms`
            : `Expected < ${max}ms but took ${duration}ms`,
        };
      }

      case 'has_property': {
        const prop = test.property;
        let exists = false;
        if (parsedJson && prop) {
          try {
            const parts = prop.split('.');
            let curr = parsedJson;
            for (const p of parts) {
              if (curr && typeof curr === 'object' && p in curr) {
                curr = curr[p];
                exists = true;
              } else {
                exists = false;
                break;
              }
            }
          } catch {
            exists = false;
          }
        }
        return {
          name: test.description || `Response has property '${prop}'`,
          passed: exists,
          message: exists
            ? `Property '${prop}' exists in response body`
            : `Property '${prop}' was not found in response`,
        };
      }

      default:
        return {
          name: test.description || 'Custom Test',
          passed: true,
          message: 'Passed',
        };
    }
  });
}
