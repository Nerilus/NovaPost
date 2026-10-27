import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, RotateCcw, Clock, Check } from 'lucide-react';
import { executeRequest } from '../../utils/httpClient';

export default function CollectionRunnerModal({
  isOpen,
  onClose,
  collection,
  envVariables = [],
  settings = {},
}) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  if (!isOpen || !collection) return null;

  const items = collection.items || [];

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    setCurrentIndex(0);

    const tempResults = [];

    for (let i = 0; i < items.length; i++) {
      setCurrentIndex(i);
      const req = items[i];
      try {
        const res = await executeRequest(req, {
          envVariables,
          useProxy: settings.useProxy,
          proxyUrl: settings.proxyUrl,
          timeoutMs: settings.timeoutMs,
        });

        const testResults = res.testResults || [];
        const passedCount = testResults.filter(t => t.passed).length;

        tempResults.push({
          id: req.id,
          name: req.name || req.url,
          method: req.method || 'GET',
          status: res.status,
          statusText: res.statusText,
          timeMs: res.timeMs,
          testsPassed: passedCount,
          testsTotal: testResults.length,
          success: res.success && res.status >= 200 && res.status < 400,
        });
      } catch (err) {
        tempResults.push({
          id: req.id,
          name: req.name || req.url,
          method: req.method || 'GET',
          status: 0,
          statusText: 'Failed',
          timeMs: 0,
          testsPassed: 0,
          testsTotal: (req.tests || []).length,
          success: false,
        });
      }
      setResults([...tempResults]);
    }

    setRunning(false);
    setCurrentIndex(-1);
  };

  const totalPassed = results.reduce((acc, r) => acc + r.testsPassed, 0);
  const totalTests = results.reduce((acc, r) => acc + r.testsTotal, 0);
  const totalDuration = results.reduce((acc, r) => acc + r.timeMs, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={16} color="var(--brand-orange)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Collection Runner — {collection.name}
            </h3>
          </div>
          <button
            className="btn-ghost"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls & Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div>Requests: <strong style={{ color: 'var(--text-main)' }}>{items.length}</strong></div>
              {results.length > 0 && (
                <>
                  <div>
                    Passed Tests: <strong style={{ color: '#10b981' }}>{totalPassed}/{totalTests}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <strong style={{ color: 'var(--text-main)' }}>{totalDuration} ms</strong>
                  </div>
                </>
              )}
            </div>

            <button
              className="btn btn-primary"
              disabled={running || items.length === 0}
              onClick={runAll}
              style={{ padding: '6px 14px' }}
            >
              {running ? (
                <>Running ({currentIndex + 1}/{items.length})...</>
              ) : results.length > 0 ? (
                <><RotateCcw size={13} /> Run Again</>
              ) : (
                <><Play size={13} /> Run Collection</>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {running && (
            <div style={{ height: '4px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--brand-orange)',
                  width: `${((currentIndex + 1) / items.length) * 100}%`,
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          )}

          {/* Execution Table */}
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="kv-table">
              <thead className="kv-header">
                <tr>
                  <th style={{ width: '80px' }}>Method</th>
                  <th>Request Name</th>
                  <th style={{ width: '90px' }}>Status</th>
                  <th style={{ width: '80px' }}>Time</th>
                  <th style={{ width: '100px' }}>Tests</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const res = results.find(r => r.id === item.id);
                  const isCurrent = running && currentIndex === idx;
                  const method = item.method || 'GET';

                  return (
                    <tr
                      key={item.id}
                      className="kv-row"
                      style={{
                        background: isCurrent ? 'rgba(255, 108, 55, 0.08)' : 'transparent',
                      }}
                    >
                      <td className="kv-cell">
                        <span className={`method-badge method-${method}`}>{method}</span>
                      </td>
                      <td className="kv-cell" style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {item.name || item.url}
                      </td>
                      <td className="kv-cell font-mono">
                        {res ? (
                          <span style={{ color: res.success ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                            {res.status > 0 ? res.status : 'Error'}
                          </span>
                        ) : isCurrent ? (
                          <span style={{ color: 'var(--brand-orange)' }}>Running...</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>Queued</span>
                        )}
                      </td>
                      <td className="kv-cell font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {res ? `${res.timeMs} ms` : '-'}
                      </td>
                      <td className="kv-cell">
                        {res && res.testsTotal > 0 ? (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: res.testsPassed === res.testsTotal ? '#10b981' : '#ef4444',
                            }}
                          >
                            {res.testsPassed}/{res.testsTotal}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={running}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
