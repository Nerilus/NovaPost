import React from 'react';
import { Trash2, Plus, Sparkles } from 'lucide-react';

const COMMON_HEADERS = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Origin',
  'User-Agent',
  'X-Requested-With',
  'X-Api-Key',
];

const PRESETS = {
  json: [
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ],
  form: [
    { key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true },
  ],
  nocache: [
    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate', enabled: true },
    { key: 'Pragma', value: 'no-cache', enabled: true },
  ],
};

export default function HeadersEditor({ headers = [], onChange }) {
  const updateRow = (index, field, value) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-add empty row at bottom if needed
    const lastRow = updated[updated.length - 1];
    if (lastRow && (lastRow.key || lastRow.value)) {
      updated.push({ key: '', value: '', enabled: true });
    }

    onChange(updated);
  };

  const removeRow = (index) => {
    if (headers.length === 1) {
      onChange([{ key: '', value: '', enabled: true }]);
      return;
    }
    const updated = headers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addRow = () => {
    onChange([...headers, { key: '', value: '', enabled: true }]);
  };

  const applyPreset = (presetKey) => {
    const presetHeaders = PRESETS[presetKey] || [];
    const existing = headers.filter(h => h.key || h.value);
    
    // Merge without duplicates
    const merged = [...existing];
    presetHeaders.forEach(p => {
      const idx = merged.findIndex(m => m.key.toLowerCase() === p.key.toLowerCase());
      if (idx >= 0) {
        merged[idx] = { ...p };
      } else {
        merged.push({ ...p });
      }
    });

    merged.push({ key: '', value: '', enabled: true });
    onChange(merged);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <datalist id="common-headers-list">
        {COMMON_HEADERS.map(h => (
          <option key={h} value={h} />
        ))}
      </datalist>

      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Presets:</span>
          <button
            className="btn btn-ghost"
            style={{ padding: '2px 6px', fontSize: '10px', height: '20px', border: '1px solid var(--border-subtle)' }}
            onClick={() => applyPreset('json')}
          >
            <Sparkles size={10} color="var(--brand-orange)" /> JSON
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '2px 6px', fontSize: '10px', height: '20px', border: '1px solid var(--border-subtle)' }}
            onClick={() => applyPreset('form')}
          >
            Form URL
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: '2px 6px', fontSize: '10px', height: '20px', border: '1px solid var(--border-subtle)' }}
            onClick={() => applyPreset('nocache')}
          >
            No Cache
          </button>
        </div>

        <button
          className="btn btn-ghost"
          style={{ padding: '2px 8px', fontSize: '11px', height: '22px' }}
          onClick={addRow}
        >
          <Plus size={12} /> Add Header
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table className="kv-table">
          <thead className="kv-header">
            <tr>
              <th style={{ width: '38px', textAlign: 'center' }}></th>
              <th style={{ width: '45%' }}>Header Key</th>
              <th>Header Value</th>
              <th style={{ width: '38px' }}></th>
            </tr>
          </thead>
          <tbody>
            {headers.map((item, idx) => (
              <tr key={idx} className="kv-row">
                <td style={{ textAlign: 'center', padding: '4px' }}>
                  <input
                    type="checkbox"
                    checked={item.enabled ?? true}
                    onChange={(e) => updateRow(idx, 'enabled', e.target.checked)}
                    style={{ accentColor: 'var(--brand-orange)', cursor: 'pointer' }}
                  />
                </td>
                <td className="kv-cell">
                  <input
                    type="text"
                    list="common-headers-list"
                    className="kv-input font-mono"
                    placeholder="Header Key (e.g. Content-Type)"
                    value={item.key || ''}
                    onChange={(e) => updateRow(idx, 'key', e.target.value)}
                  />
                </td>
                <td className="kv-cell">
                  <input
                    type="text"
                    className="kv-input font-mono"
                    placeholder="Header Value"
                    value={item.value || ''}
                    onChange={(e) => updateRow(idx, 'value', e.target.value)}
                  />
                </td>
                <td style={{ textAlign: 'center', padding: '4px' }}>
                  {(item.key || item.value) && (
                    <button
                      className="btn-ghost"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => removeRow(idx)}
                      title="Delete header"
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
    </div>
  );
}
