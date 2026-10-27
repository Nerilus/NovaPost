import React, { useState } from 'react';
import ParamsEditor from './ParamsEditor';
import HeadersEditor from './HeadersEditor';
import AuthEditor from './AuthEditor';
import BodyEditor from './BodyEditor';
import TestsEditor from './TestsEditor';

export default function RequestConfig({ request, onChange }) {
  const [activeTab, setActiveTab] = useState('params'); // 'params', 'headers', 'auth', 'body', 'tests'

  const activeParamsCount = (request.params || []).filter(p => p.enabled && p.key).length;
  const activeHeadersCount = (request.headers || []).filter(h => h.enabled && h.key).length;
  const testsCount = (request.tests || []).length;
  const hasBody = request.body && request.body.type !== 'none';
  const hasAuth = request.auth && request.auth.type !== 'none';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sub-tabs header */}
      <div className="sub-tabs-header">
        <div className="sub-tabs-list">
          <button
            className={`sub-tab-btn ${activeTab === 'params' ? 'active' : ''}`}
            onClick={() => setActiveTab('params')}
          >
            Params
            {activeParamsCount > 0 && <span className="badge-count">{activeParamsCount}</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
            {activeHeadersCount > 0 && <span className="badge-count">{activeHeadersCount}</span>}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            Authorization
            {hasAuth && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-orange)',
                  display: 'inline-block',
                }}
              />
            )}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            Body
            {hasBody && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-orange)',
                  display: 'inline-block',
                }}
              />
            )}
          </button>

          <button
            className={`sub-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Tests
            {testsCount > 0 && <span className="badge-count">{testsCount}</span>}
          </button>
        </div>
      </div>

      {/* Sub-tab view */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'params' && (
          <ParamsEditor
            params={request.params || []}
            onChange={(params) => onChange({ ...request, params })}
          />
        )}

        {activeTab === 'headers' && (
          <HeadersEditor
            headers={request.headers || []}
            onChange={(headers) => onChange({ ...request, headers })}
          />
        )}

        {activeTab === 'auth' && (
          <AuthEditor
            auth={request.auth || { type: 'none' }}
            onChange={(auth) => onChange({ ...request, auth })}
          />
        )}

        {activeTab === 'body' && (
          <BodyEditor
            body={request.body || { type: 'none', raw: '', rawType: 'json' }}
            onChange={(body) => onChange({ ...request, body })}
          />
        )}

        {activeTab === 'tests' && (
          <TestsEditor
            tests={request.tests || []}
            onChange={(tests) => onChange({ ...request, tests })}
          />
        )}
      </div>
    </div>
  );
}
