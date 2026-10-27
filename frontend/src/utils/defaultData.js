// Initial collections and environments for NovaPost

export const DEFAULT_ENVIRONMENTS = [
  {
    id: 'env-dev',
    name: 'Development',
    variables: [
      { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
      { key: 'httpbin', value: 'https://httpbin.org', enabled: true },
      { key: 'localApi', value: 'http://localhost:8080/api', enabled: true },
      { key: 'token', value: 'bearer-demo-token-xyz123', enabled: true },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    variables: [
      { key: 'baseUrl', value: 'https://api.example.com/v1', enabled: true },
      { key: 'token', value: 'prod-secret-token-live', enabled: true },
    ],
  },
];

export const DEFAULT_COLLECTIONS = [
  {
    id: 'col-jsonplaceholder',
    name: 'JSONPlaceholder API',
    description: 'Free fake REST API for testing and prototyping',
    items: [
      {
        id: 'req-jp-1',
        name: 'Get All Posts',
        method: 'GET',
        url: '{{baseUrl}}/posts?_limit=5',
        params: [
          { key: '_limit', value: '5', description: 'Limit number of results', enabled: true },
        ],
        headers: [
          { key: 'Accept', value: 'application/json', enabled: true },
        ],
        auth: { type: 'none' },
        body: { type: 'none', raw: '', rawType: 'json' },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
          { type: 'response_time', maxMs: 1500, description: 'Response time < 1500ms' },
          { type: 'has_property', property: '0.title', description: 'First post has a title' },
        ],
      },
      {
        id: 'req-jp-2',
        name: 'Get Post by ID',
        method: 'GET',
        url: '{{baseUrl}}/posts/1',
        params: [],
        headers: [
          { key: 'Accept', value: 'application/json', enabled: true },
        ],
        auth: { type: 'none' },
        body: { type: 'none', raw: '', rawType: 'json' },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
          { type: 'has_property', property: 'id', description: 'Response contains id' },
        ],
      },
      {
        id: 'req-jp-3',
        name: 'Create New Post',
        method: 'POST',
        url: '{{baseUrl}}/posts',
        params: [],
        headers: [
          { key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        auth: { type: 'none' },
        body: {
          type: 'raw',
          rawType: 'json',
          raw: JSON.stringify({
            title: 'Testing NovaPost Client',
            body: 'Built with React and Go! High-performance API testing.',
            userId: 1,
          }, null, 2),
        },
        tests: [
          { type: 'status_code', expected: '201', description: 'Status is 201 Created' },
        ],
      },
    ],
  },
  {
    id: 'col-httpbin',
    name: 'HTTPBin Test Suite',
    description: 'HTTP Request & Response service for debugging',
    items: [
      {
        id: 'req-hb-1',
        name: 'Inspect Headers (GET)',
        method: 'GET',
        url: '{{httpbin}}/headers',
        params: [],
        headers: [
          { key: 'X-Custom-Client', value: 'NovaPost-Desktop', enabled: true },
        ],
        auth: { type: 'none' },
        body: { type: 'none', raw: '', rawType: 'json' },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
        ],
      },
      {
        id: 'req-hb-2',
        name: 'Echo JSON Body (POST)',
        method: 'POST',
        url: '{{httpbin}}/post',
        params: [],
        headers: [
          { key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        auth: { type: 'bearer', token: '{{token}}' },
        body: {
          type: 'raw',
          rawType: 'json',
          raw: JSON.stringify({
            message: 'Hello from NovaPost!',
            timestamp: new Date().toISOString(),
            status: 'operational',
          }, null, 2),
        },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
          { type: 'has_property', property: 'json.message', description: 'Echoed json message matches' },
        ],
      },
      {
        id: 'req-hb-3',
        name: 'Simulate Delayed Response (GET)',
        method: 'GET',
        url: '{{httpbin}}/delay/1',
        params: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none', raw: '', rawType: 'json' },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
        ],
      },
    ],
  },
  {
    id: 'col-local-go',
    name: 'Local Go Backend API',
    description: 'Endpoints served by the Go server',
    items: [
      {
        id: 'req-go-1',
        name: 'Health Check',
        method: 'GET',
        url: 'http://localhost:8080/api/health',
        params: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none', raw: '', rawType: 'json' },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
          { type: 'has_property', property: 'status', description: 'Health status is ok' },
        ],
      },
      {
        id: 'req-go-2',
        name: 'Echo Test',
        method: 'POST',
        url: 'http://localhost:8080/api/echo',
        params: [],
        headers: [
          { key: 'Content-Type', value: 'application/json', enabled: true },
        ],
        auth: { type: 'none' },
        body: {
          type: 'raw',
          rawType: 'json',
          raw: JSON.stringify({
            source: 'NovaPost Frontend',
            time: '2026-10-27',
          }, null, 2),
        },
        tests: [
          { type: 'status_code', expected: '200', description: 'Status is 200 OK' },
        ],
      },
    ],
  },
];

export const INITIAL_REQUEST = {
  id: 'tab-initial',
  name: 'New Request',
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  params: [
    { key: '', value: '', description: '', enabled: true },
  ],
  headers: [
    { key: 'Accept', value: 'application/json', enabled: true },
    { key: '', value: '', enabled: true },
  ],
  auth: {
    type: 'none',
    bearerToken: '',
    basicUser: '',
    basicPass: '',
    apiKeyName: '',
    apiKeyValue: '',
    apiKeyLocation: 'header', // 'header' or 'query'
  },
  body: {
    type: 'none', // 'none', 'raw', 'form-data', 'urlencoded'
    rawType: 'json', // 'json', 'text', 'xml', 'html'
    raw: '',
    formData: [
      { key: '', value: '', type: 'text', enabled: true },
    ],
    urlEncoded: [
      { key: '', value: '', enabled: true },
    ],
  },
  tests: [
    { type: 'status_code', expected: '200', description: 'Status code is 200' },
    { type: 'response_time', maxMs: 1000, description: 'Response time is less than 1000ms' },
  ],
};
