// Parser to convert cURL command into NovaPost request object

export function parseCurl(curlString) {
  if (!curlString || typeof curlString !== 'string') return null;

  const cleaned = curlString.trim().replace(/\\\n/g, ' ').replace(/\n/g, ' ');
  if (!cleaned.toLowerCase().startsWith('curl')) return null;

  // Tokenize preserving quotes
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2] !== undefined ? match[2] : match[0]);
  }

  let method = 'GET';
  let url = '';
  const headers = [];
  let rawBody = '';
  let auth = { type: 'none' };

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      if (tokens[i + 1]) {
        method = tokens[++i].toUpperCase();
      }
    } else if (token === '-H' || token === '--header') {
      if (tokens[i + 1]) {
        const headerLine = tokens[++i];
        const colonIdx = headerLine.indexOf(':');
        if (colonIdx > -1) {
          const key = headerLine.slice(0, colonIdx).trim();
          const value = headerLine.slice(colonIdx + 1).trim();

          // Check if Authorization header
          if (key.toLowerCase() === 'authorization' && value.toLowerCase().startsWith('bearer ')) {
            auth = {
              type: 'bearer',
              bearerToken: value.slice(7).trim(),
            };
          } else {
            headers.push({ key, value, enabled: true });
          }
        }
      }
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      if (tokens[i + 1]) {
        rawBody = tokens[++i];
        if (method === 'GET') method = 'POST';
      }
    } else if (token === '-u' || token === '--user') {
      if (tokens[i + 1]) {
        const userPass = tokens[++i];
        const [u, p] = userPass.split(':');
        auth = {
          type: 'basic',
          basicUser: u || '',
          basicPass: p || '',
        };
      }
    } else if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  // Parse query params from URL
  const params = [];
  let baseUrl = url;
  if (url.includes('?')) {
    const [path, queryString] = url.split('?');
    baseUrl = path;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams.entries()) {
      params.push({ key, value, description: '', enabled: true });
    }
  }
  if (params.length === 0) {
    params.push({ key: '', value: '', description: '', enabled: true });
  }

  let bodyType = 'none';
  let rawType = 'json';
  if (rawBody) {
    bodyType = 'raw';
    try {
      JSON.parse(rawBody);
      rawType = 'json';
    } catch {
      rawType = 'text';
    }
  }

  headers.push({ key: '', value: '', enabled: true });

  return {
    method,
    url,
    params,
    headers,
    auth,
    body: {
      type: bodyType,
      rawType,
      raw: rawBody,
      formData: [{ key: '', value: '', type: 'text', enabled: true }],
      urlEncoded: [{ key: '', value: '', enabled: true }],
    },
  };
}
