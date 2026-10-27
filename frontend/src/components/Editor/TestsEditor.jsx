import React from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function TestsEditor({ tests = [], onChange }) {
  const addSnippet = (type) => {
    let newTest;
    if (type === 'status_200') {
      newTest = { type: 'status_code', expected: '200', description: 'Status code is 200' };
    } else if (type === 'status_201') {
      newTest = { type: 'status_code', expected: '201', description: 'Status code is 201' };
    } else if (type === 'time_500') {
      newTest = { type: 'response_time', maxMs: 500, description: 'Response time is less than 500ms' };
    } else if (type === 'has_property') {
      newTest = { type: 'has_property', property: 'id', description: 'Response contains property "id"' };
    }
    onChange([...tests, newTest]);
  };

  const updateTest = (idx, field, val) => {
    const list = [...tests];
    list[idx] = { ...list[idx], [field]: val };
    onChange(list);
  };

  const removeTest = (idx) => {
    onChange(tests.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Test List Area */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={16} color="var(--brand-orange)" />
          Test Assertions
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Tests execute automatically when a response is received and display pass/fail metrics in the Response panel.
        </p>

        {tests.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              border: '1px dashed var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            No tests added yet. Click a snippet on the right to add an assertion.
          </div>
        ) : (
          tests.map((test, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  className="kv-input"
                  style={{ fontWeight: 600, color: 'var(--text-main)' }}
                  placeholder="Test description"
                  value={test.description || ''}
                  onChange={(e) => updateTest(idx, 'description', e.target.value)}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Type: <strong>{test.type}</strong></span>

                  {test.type === 'status_code' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Expected Status:</span>
                      <input
                        type="number"
                        className="kv-input font-mono"
                        style={{ width: '70px', padding: '2px 6px' }}
                        value={test.expected || '200'}
                        onChange={(e) => updateTest(idx, 'expected', e.target.value)}
                      />
                    </div>
                  )}

                  {test.type === 'response_time' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Max Latency (ms):</span>
                      <input
                        type="number"
                        className="kv-input font-mono"
                        style={{ width: '80px', padding: '2px 6px' }}
                        value={test.maxMs || 1000}
                        onChange={(e) => updateTest(idx, 'maxMs', e.target.value)}
                      />
                    </div>
                  )}

                  {test.type === 'has_property' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>JSON Property:</span>
                      <input
                        type="text"
                        className="kv-input font-mono"
                        style={{ width: '120px', padding: '2px 6px' }}
                        value={test.property || ''}
                        onChange={(e) => updateTest(idx, 'property', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn-ghost"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
                onClick={() => removeTest(idx)}
                title="Remove assertion"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Snippets Sidebar */}
      <div
        style={{
          width: '220px',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '16px',
          background: 'var(--bg-input)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          One-Click Snippets
        </div>

        <button
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 8px' }}
          onClick={() => addSnippet('status_200')}
        >
          <Plus size={12} color="var(--brand-orange)" /> Status code: is 200
        </button>

        <button
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 8px' }}
          onClick={() => addSnippet('status_201')}
        >
          <Plus size={12} color="var(--brand-orange)" /> Status code: is 201
        </button>

        <button
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 8px' }}
          onClick={() => addSnippet('time_500')}
        >
          <Plus size={12} color="var(--brand-orange)" /> Response time &lt; 500ms
        </button>

        <button
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', fontSize: '11px', padding: '6px 8px' }}
          onClick={() => addSnippet('has_property')}
        >
          <Plus size={12} color="var(--brand-orange)" /> JSON: Contains property
        </button>
      </div>
    </div>
  );
}
