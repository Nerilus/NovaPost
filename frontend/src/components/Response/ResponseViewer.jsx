import React, { useState } from 'react';
import { Download, Copy, Check, CheckCircle2, XCircle, Clock, Database, Split, AlertTriangle, Play } from 'lucide-react';
import JsonViewer from './JsonViewer';

export default function ResponseViewer({ response, loading, onQuickTest, layoutMode, onToggleLayout }) {
  const [activeTab, setActiveTab] = useState('body'); // 'body', 'headers', 'cookies', 'tests'
  const [bodyMode, setBodyMode] = useState('pretty'); // 'pretty', 'raw', 'preview'
  const [copiedHeaders, setCopiedHeaders] = useState(false);

  // Status badge class
  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 300 && status < 400) return 'status-3xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    if (status >= 500) return 'status-5xx';
    return 'status-5xx';
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    if (!response || !response.body) return;
    const blob = new Blob([typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllHeaders = () => {
    if (!response?.headers) return;
    const text = Object.entries(response.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 2000);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          gap: '14px',
          background: 'var(--bg-surface)',
        }}
      >
        <div
          className="loading-pulse"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '3px solid var(--brand-orange)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>
          Sending Request...
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Awaiting response from endpoint
        </div>
      </div>
    );
  }

  // 2. Empty State (No response yet)
  if (!response) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--brand-orange)',
          }}
        >
          <Play size={24} style={{ marginLeft: '3px' }} />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
          Ready to send request
        </h3>
        <p style={{ fontSize: '12px', maxWidth: '340px', lineHeight: 1.5, marginBottom: '20px' }}>
          Enter a URL and click <strong>Send</strong> or press <code className="font-mono" style={{ background: 'var(--bg-input)', padding: '2px 5px', borderRadius: '4px' }}>⌘+Enter</code> to inspect status, headers, and payload.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => onQuickTest && onQuickTest('https://jsonplaceholder.typicode.com/posts/1')}
          >
            Load Sample GET
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onQuickTest && onQuickTest('https://httpbin.org/post', 'POST')}
          >
            Load Sample POST
          </button>
        </div>
      </div>
    );
  }

  // 3. Response Received
  const testResults = response.testResults || [];
  const passedTests = testResults.filter(t => t.passed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Response Header Status Bar */}
      <div className="response-status-bar">
        <div className="status-metrics">
          {response.status > 0 ? (
            <span className={`status-badge ${getStatusClass(response.status)}`}>
              {response.status} {response.statusText}
            </span>
          ) : (
            <span className="status-badge status-5xx" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> {response.statusText || 'Error'}
            </span>
          )}

          <div className="metric-item" title="Response latency">
            <Clock size={13} />
            <span className="val">{response.timeMs} ms</span>
          </div>

          <div className="metric-item" title="Response payload size">
            <Database size={13} />
            <span className="val">{formatSize(response.size)}</span>
          </div>

          {testResults.length > 0 && (
            <div
              className="metric-item"
              style={{
                color: passedTests === testResults.length ? 'var(--status-2xx)' : 'var(--status-5xx)',
                fontWeight: 600,
              }}
            >
              {passedTests === testResults.length ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{passedTests}/{testResults.length} Tests Passed</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
            onClick={handleDownload}
            title="Download Response Body"
          >
            <Download size={13} />
            <span>Save</span>
          </button>

          <button
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
            onClick={onToggleLayout}
            title={layoutMode === 'vertical' ? 'Switch to horizontal split' : 'Switch to vertical split'}
          >
            <Split size={13} />
          </button>
        </div>
      </div>

      {/* Response Sub-Tabs Header */}
      <div className="sub-tabs-header" style={{ padding: '0 12px' }}>
        <div className="sub-tabs-list">
          <button
            className={`sub-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
            onClick={() => setActiveTab('body')}
          >
            Body
          </button>
          <button
            className={`sub-tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
            onClick={() => setActiveTab('headers')}
          >
            Headers
            <span className="badge-count">
              {Object.keys(response.headers || {}).length}
            </span>
          </button>
          <button
            className={`sub-tab-btn ${activeTab === 'cookies' ? 'active' : ''}`}
            onClick={() => setActiveTab('cookies')}
          >
            Cookies
          </button>
          <button
            className={`sub-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Test Results
            {testResults.length > 0 && (
              <span
                className="badge-count"
                style={{
                  background: passedTests === testResults.length ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: passedTests === testResults.length ? '#10b981' : '#ef4444',
                }}
              >
                {passedTests}/{testResults.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'body' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className={`btn btn-ghost ${bodyMode === 'pretty' ? 'active' : ''}`}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                height: '24px',
                background: bodyMode === 'pretty' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: bodyMode === 'pretty' ? 'var(--text-main)' : 'var(--text-muted)',
              }}
              onClick={() => setBodyMode('pretty')}
            >
              Pretty
            </button>
            <button
              className={`btn btn-ghost ${bodyMode === 'raw' ? 'active' : ''}`}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                height: '24px',
                background: bodyMode === 'raw' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: bodyMode === 'raw' ? 'var(--text-main)' : 'var(--text-muted)',
              }}
              onClick={() => setBodyMode('raw')}
            >
              Raw
            </button>
            <button
              className={`btn btn-ghost ${bodyMode === 'preview' ? 'active' : ''}`}
              style={{
                padding: '2px 8px',
                fontSize: '11px',
                height: '24px',
                background: bodyMode === 'preview' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: bodyMode === 'preview' ? 'var(--text-main)' : 'var(--text-muted)',
              }}
              onClick={() => setBodyMode('preview')}
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Response Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* BODY TAB */}
        {activeTab === 'body' && (
          <>
            {response.isCors && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Browser CORS Restriction Detected:</strong>
                  <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                    {response.error}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    💡 Tip: Enable the Go Backend Proxy in settings or top bar to forward requests through a local server without browser cross-origin limits.
                  </div>
                </div>
              </div>
            )}

            {bodyMode === 'pretty' && <JsonViewer content={response.body} />}

            {bodyMode === 'raw' && (
              <div
                className="font-mono"
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'var(--bg-code)',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontSize: '12px',
                  overflow: 'auto',
                }}
              >
                {typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body}
              </div>
            )}

            {bodyMode === 'preview' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <iframe
                  title="Response Preview"
                  srcDoc={typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#ffffff',
                  }}
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px', height: '24px' }}
                onClick={copyAllHeaders}
              >
                {copiedHeaders ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedHeaders ? 'Headers Copied' : 'Copy All'}</span>
              </button>
            </div>
            <table className="kv-table">
              <thead className="kv-header">
                <tr>
                  <th style={{ width: '40%' }}>Header Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers || {}).map(([key, val], idx) => (
                  <tr key={idx} className="kv-row">
                    <td className="kv-cell font-mono" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      {key}
                    </td>
                    <td className="kv-cell font-mono" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {val}
                    </td>
                  </tr>
                ))}
                {Object.keys(response.headers || {}).length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No response headers returned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* COOKIES TAB */}
        {activeTab === 'cookies' && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '12px' }}>
              No cookies were captured for this response.
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Browsers manage cookies automatically via the Set-Cookie security sandbox.
            </p>
          </div>
        )}

        {/* TEST RESULTS TAB */}
        {activeTab === 'tests' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {testResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>
                  No tests configured for this request
                </p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>
                  Go to the <strong>Tests</strong> tab under the URL bar to add assertion checks.
                </p>
              </div>
            ) : (
              testResults.map((test, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: test.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${test.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}
                >
                  {test.passed ? (
                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {test.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {test.message}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      background: test.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: test.passed ? '#10b981' : '#ef4444',
                    }}
                  >
                    {test.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
