import React from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function ParamsEditor({ params = [], onChange }) {
  const updateRow = (index, field, value) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-add empty row at bottom if last row is filled
    const lastRow = updated[updated.length - 1];
    if (lastRow && (lastRow.key || lastRow.value)) {
      updated.push({ key: '', value: '', description: '', enabled: true });
    }

    onChange(updated);
  };

  const removeRow = (index) => {
    if (params.length === 1) {
      // Just clear the single row
      onChange([{ key: '', value: '', description: '', enabled: true }]);
      return;
    }
    const updated = params.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addRow = () => {
    onChange([...params, { key: '', value: '', description: '', enabled: true }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
        <span>Query Parameters (auto-synced with request URL)</span>
        <button
          className="btn btn-ghost"
          style={{ padding: '2px 8px', fontSize: '11px', height: '22px' }}
          onClick={addRow}
        >
          <Plus size={12} /> Add Parameter
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table className="kv-table">
          <thead className="kv-header">
            <tr>
              <th style={{ width: '38px', textAlign: 'center' }}></th>
              <th style={{ width: '35%' }}>Key</th>
              <th style={{ width: '35%' }}>Value</th>
              <th>Description</th>
              <th style={{ width: '38px' }}></th>
            </tr>
          </thead>
          <tbody>
            {params.map((item, idx) => (
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
                    className="kv-input"
                    placeholder="Key"
                    value={item.key || ''}
                    onChange={(e) => updateRow(idx, 'key', e.target.value)}
                  />
                </td>
                <td className="kv-cell">
                  <input
                    type="text"
                    className="kv-input"
                    placeholder="Value"
                    value={item.value || ''}
                    onChange={(e) => updateRow(idx, 'value', e.target.value)}
                  />
                </td>
                <td className="kv-cell">
                  <input
                    type="text"
                    className="kv-input"
                    placeholder="Description (optional)"
                    value={item.description || ''}
                    onChange={(e) => updateRow(idx, 'description', e.target.value)}
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
                      title="Delete parameter"
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
