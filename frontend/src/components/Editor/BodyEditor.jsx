import React, { useState } from 'react';
import { Sparkles, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function BodyEditor({ body = { type: 'none', raw: '', rawType: 'json' }, onChange }) {
  const [jsonError, setJsonError] = useState(null);

  const setBodyType = (type) => {
    onChange({ ...body, type });
  };

  const setRawType = (rawType) => {
    onChange({ ...body, rawType });
  };

  const setRawContent = (val) => {
    onChange({ ...body, raw: val });
    if (body.rawType === 'json') {
      try {
        if (val.trim()) JSON.parse(val);
        setJsonError(null);
      } catch (e) {
        setJsonError(e.message);
      }
    }
  };

  const beautifyJson = () => {
    try {
      const parsed = JSON.parse(body.raw || '{}');
      const pretty = JSON.stringify(parsed, null, 2);
      onChange({ ...body, raw: pretty });
      setJsonError(null);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  // Form Data handlers
  const updateFormDataRow = (idx, field, val) => {
    const list = [...(body.formData || [])];
    list[idx] = { ...list[idx], [field]: val };
    const last = list[list.length - 1];
    if (last && (last.key || last.value)) {
      list.push({ key: '', value: '', type: 'text', enabled: true });
    }
    onChange({ ...body, formData: list });
  };

  const removeFormDataRow = (idx) => {
    const list = (body.formData || []).filter((_, i) => i !== idx);
    onChange({ ...body, formData: list.length ? list : [{ key: '', value: '', type: 'text', enabled: true }] });
  };

  // URL Encoded handlers
  const updateUrlEncodedRow = (idx, field, val) => {
    const list = [...(body.urlEncoded || [])];
    list[idx] = { ...list[idx], [field]: val };
    const last = list[list.length - 1];
    if (last && (last.key || last.value)) {
      list.push({ key: '', value: '', enabled: true });
    }
    onChange({ ...body, urlEncoded: list });
  };

  const removeUrlEncodedRow = (idx) => {
    const list = (body.urlEncoded || []).filter((_, i) => i !== idx);
    onChange({ ...body, urlEncoded: list.length ? list : [{ key: '', value: '', enabled: true }] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Type selection radio bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {['none', 'raw', 'form-data', 'urlencoded'].map((t) => (
            <label
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: body.type === t ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: body.type === t ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="bodyType"
                checked={body.type === t}
                onChange={() => setBodyType(t)}
                style={{ accentColor: 'var(--brand-orange)' }}
              />
              {t === 'none' && 'none'}
              {t === 'raw' && 'raw'}
              {t === 'form-data' && 'form-data'}
              {t === 'urlencoded' && 'x-www-form-urlencoded'}
            </label>
          ))}
        </div>

        {body.type === 'raw' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={body.rawType || 'json'}
              onChange={(e) => setRawType(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '11px',
                padding: '2px 8px',
                outline: 'none',
              }}
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
              <option value="html">HTML</option>
            </select>

            {body.rawType === 'json' && (
              <button
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: '11px', height: '22px' }}
                onClick={beautifyJson}
                title="Format JSON payload"
              >
                <Sparkles size={12} color="var(--brand-orange)" /> Format JSON
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {body.type === 'none' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            This request does not have a body.
          </div>
        )}

        {body.type === 'raw' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <textarea
              className="font-mono"
              placeholder={`Enter ${body.rawType || 'raw'} content here...`}
              value={body.raw || ''}
              onChange={(e) => setRawContent(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-main)',
                border: 'none',
                resize: 'none',
                fontSize: '12px',
                lineHeight: '1.6',
                outline: 'none',
                tabSize: 2,
              }}
            />
            {jsonError && body.rawType === 'json' && (
              <div
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={13} />
                <span>Invalid JSON: {jsonError}</span>
              </div>
            )}
          </div>
        )}

        {body.type === 'form-data' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="kv-table">
              <thead className="kv-header">
                <tr>
                  <th style={{ width: '38px', textAlign: 'center' }}></th>
                  <th style={{ width: '40%' }}>Key</th>
                  <th>Value</th>
                  <th style={{ width: '38px' }}></th>
                </tr>
              </thead>
              <tbody>
                {(body.formData || [{ key: '', value: '', type: 'text', enabled: true }]).map((row, idx) => (
                  <tr key={idx} className="kv-row">
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      <input
                        type="checkbox"
                        checked={row.enabled ?? true}
                        onChange={(e) => updateFormDataRow(idx, 'enabled', e.target.checked)}
                        style={{ accentColor: 'var(--brand-orange)' }}
                      />
                    </td>
                    <td className="kv-cell">
                      <input
                        type="text"
                        className="kv-input font-mono"
                        placeholder="Key"
                        value={row.key || ''}
                        onChange={(e) => updateFormDataRow(idx, 'key', e.target.value)}
                      />
                    </td>
                    <td className="kv-cell">
                      <input
                        type="text"
                        className="kv-input font-mono"
                        placeholder="Value"
                        value={row.value || ''}
                        onChange={(e) => updateFormDataRow(idx, 'value', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      {(row.key || row.value) && (
                        <button
                          className="btn-ghost"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                          onClick={() => removeFormDataRow(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {body.type === 'urlencoded' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="kv-table">
              <thead className="kv-header">
                <tr>
                  <th style={{ width: '38px', textAlign: 'center' }}></th>
                  <th style={{ width: '40%' }}>Key</th>
                  <th>Value</th>
                  <th style={{ width: '38px' }}></th>
                </tr>
              </thead>
              <tbody>
                {(body.urlEncoded || [{ key: '', value: '', enabled: true }]).map((row, idx) => (
                  <tr key={idx} className="kv-row">
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      <input
                        type="checkbox"
                        checked={row.enabled ?? true}
                        onChange={(e) => updateUrlEncodedRow(idx, 'enabled', e.target.checked)}
                        style={{ accentColor: 'var(--brand-orange)' }}
                      />
                    </td>
                    <td className="kv-cell">
                      <input
                        type="text"
                        className="kv-input font-mono"
                        placeholder="Key"
                        value={row.key || ''}
                        onChange={(e) => updateUrlEncodedRow(idx, 'key', e.target.value)}
                      />
                    </td>
                    <td className="kv-cell">
                      <input
                        type="text"
                        className="kv-input font-mono"
                        placeholder="Value"
                        value={row.value || ''}
                        onChange={(e) => updateUrlEncodedRow(idx, 'value', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      {(row.key || row.value) && (
                        <button
                          className="btn-ghost"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                          onClick={() => removeUrlEncodedRow(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
