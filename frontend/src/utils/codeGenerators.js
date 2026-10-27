// Generates executable code snippets for the active request

export function generateSnippet(req, lang = 'curl', envVariables = []) {
  if (!req) return '';

  // Interpolate variables
  let url = req.url || '';
  if (envVariables && envVariables.length > 0) {
    envVariables.forEach(v => {
      if (v.enabled && v.key) {
        url = url.replaceAll(`{{${v.key}}}`, v.value);
      }
    });
  }

  const method = req.method || 'GET';
  const headers = (req.headers || []).filter(h => h.enabled && h.key);
  
  // Apply Auth
  const finalHeaders = [...headers];
  if (req.auth?.type === 'bearer' && req.auth.bearerToken) {
    let token = req.auth.bearerToken;
    envVariables.forEach(v => {
      if (v.enabled && v.key) token = token.replaceAll(`{{${v.key}}}`, v.value);
    });
    finalHeaders.push({ key: 'Authorization', value: `Bearer ${token}` });
  } else if (req.auth?.type === 'basic' && (req.auth.basicUser || req.auth.basicPass)) {
    const creds = btoa(`${req.auth.basicUser || ''}:${req.auth.basicPass || ''}`);
    finalHeaders.push({ key: 'Authorization', value: `Basic ${creds}` });
  } else if (req.auth?.type === 'apikey' && req.auth.apiKeyLocation === 'header' && req.auth.apiKeyName) {
    finalHeaders.push({ key: req.auth.apiKeyName, value: req.auth.apiKeyValue || '' });
  }

  let body = '';
  if (req.body?.type === 'raw' && req.body.raw) {
    body = req.body.raw;
  } else if (req.body?.type === 'urlencoded') {
    const pairs = (req.body.urlEncoded || []).filter(i => i.enabled && i.key);
    body = pairs.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  }

  switch (lang) {
    case 'curl': {
      let cmd = `curl --request ${method} \\\n  --url '${url}'`;
      finalHeaders.forEach(h => {
        cmd += ` \\\n  --header '${h.key}: ${h.value}'`;
      });
      if (body && method !== 'GET' && method !== 'HEAD') {
        cmd += ` \\\n  --data '${body.replace(/'/g, "'\\''")}'`;
      }
      return cmd;
    }

    case 'fetch': {
      const headerObj = {};
      finalHeaders.forEach(h => {
        headerObj[h.key] = h.value;
      });

      let options = {
        method,
        headers: headerObj,
      };

      if (body && method !== 'GET' && method !== 'HEAD') {
        options.body = body.startsWith('{') || body.startsWith('[') ? 'JSON_BODY_PLACEHOLDER' : body;
      }

      let jsonStr = JSON.stringify(options, null, 2);
      if (options.body === 'JSON_BODY_PLACEHOLDER') {
        jsonStr = jsonStr.replace('"JSON_BODY_PLACEHOLDER"', `JSON.stringify(${body.trim()})`);
      }

      return `// JavaScript (Fetch API)
fetch('${url}', ${jsonStr})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
    }

    case 'axios': {
      const headerObj = {};
      finalHeaders.forEach(h => {
        headerObj[h.key] = h.value;
      });

      return `// JavaScript (Axios)
import axios from 'axios';

const config = {
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headerObj, null, 2)},
  ${body && method !== 'GET' ? `data: ${body},` : ''}
};

axios(config)
  .then(response => {
    console.log(JSON.stringify(response.data));
  })
  .catch(error => {
    console.error(error);
  });`;
    }

    case 'python': {
      let pyHeaders = '';
      if (finalHeaders.length > 0) {
        pyHeaders = `headers = {\n${finalHeaders.map(h => `    '${h.key}': '${h.value}'`).join(',\n')}\n}\n`;
      }

      let pyBody = '';
      if (body && method !== 'GET') {
        pyBody = `data = """${body}"""\n`;
      }

      return `# Python (requests)
import requests

url = "${url}"
${pyHeaders}${pyBody}
response = requests.${method.toLowerCase()}(
    url,
    ${pyHeaders ? 'headers=headers,' : ''}
    ${pyBody ? 'data=data,' : ''}
)

print(response.status_code)
print(response.text)`;
    }

    case 'go': {
      let goHeaders = '';
      finalHeaders.forEach(h => {
        goHeaders += `\treq.Header.Add("${h.key}", "${h.value}")\n`;
      });

      let bodyReader = 'nil';
      let importStrings = '';
      if (body && method !== 'GET') {
        importStrings = `\t"strings"\n`;
        bodyReader = `strings.NewReader(\`${body}\`)`;
      }

      return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
${importStrings})

func main() {
\tclient := &http.Client{}
\treq, err := http.NewRequest("${method}", "${url}", ${bodyReader})
\tif err != nil {
\t\tpanic(err)
\t}

${goHeaders}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tbodyText, err := io.ReadAll(resp.Body)
\tif err != nil {
\t\tpanic(err)
\t}
\tfmt.Printf("%s\\n", bodyText)
}`;
    }

    default:
      return '';
  }
}
