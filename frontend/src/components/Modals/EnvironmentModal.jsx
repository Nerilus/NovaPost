import React from 'react';
import { X, Plus, Trash2, Globe } from 'lucide-react';

export default function EnvironmentModal({ isOpen, onClose, environment, onSaveEnvironment }) {
  if (!isOpen || !environment) return null;

  const variables = environment.variables || [];

  const updateVariable = (idx, field, val) => {
    const list = [...variables];
    list[idx] = { ...list[idx], [field]: val };
    const last = list[list.length - 1];
    if (last && (last.key || last.value)) {
      list.push({ key: '', value: '', enabled: true });
    }
    onSaveEnvironment({ ...environment, variables: list });
  };

  const removeVariable = (idx) => {
    const list = variables.filter((_, i) => i !== idx);
    onSaveEnvironment({
      ...environment,
      variables: list.length ? list : [{ key: '', value: '', enabled: true }],
    });
  };

  const addVariable = () => {
    onSaveEnvironment({
      ...environment,
      variables: [...variables, { key: '', value: '', enabled: true }],
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} color="var(--brand-orange)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Environment Variables — {environment.name}
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

        <div className="modal-body">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Reference variables in your request URLs, headers, or body using double braces syntax, e.g. <code>&#123;&#123;baseUrl&#125;&#125;</code> or <code>&#123;&#123;token&#125;&#125;</code>.
          </p>

          <table className="kv-table">
            <thead className="kv-header">
              <tr>
                <th style={{ width: '38px', textAlign: 'center' }}></th>
                <th style={{ width: '40%' }}>Variable Name</th>
                <th>Current Value</th>
                <th style={{ width: '38px' }}></th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v, idx) => (
                <tr key={idx} className="kv-row">
                  <td style={{ textAlign: 'center', padding: '4px' }}>
                    <input
                      type="checkbox"
                      checked={v.enabled ?? true}
                      onChange={(e) => updateVariable(idx, 'enabled', e.target.checked)}
                      style={{ accentColor: 'var(--brand-orange)' }}
                    />
                  </td>
                  <td className="kv-cell">
                    <input
                      type="text"
                      className="kv-input font-mono"
                      placeholder="e.g. baseUrl"
                      value={v.key || ''}
                      onChange={(e) => updateVariable(idx, 'key', e.target.value)}
                    />
                  </td>
                  <td className="kv-cell">
                    <input
                      type="text"
                      className="kv-input font-mono"
                      placeholder="e.g. https://api.example.com"
                      value={v.value || ''}
                      onChange={(e) => updateVariable(idx, 'value', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>
                    {(v.key || v.value) && (
                      <button
                        className="btn-ghost"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                        onClick={() => removeVariable(idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={addVariable}
            >
              <Plus size={12} /> Add Variable
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
