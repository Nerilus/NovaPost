import React, { useState } from 'react';
import { Plus, Globe, Check, Edit2, Trash2 } from 'lucide-react';

export default function EnvironmentsTab({
  environments = [],
  activeEnvId,
  onSelectEnv,
  onCreateEnv,
  onDeleteEnv,
  onEditEnv,
}) {
  const [newEnvName, setNewEnvName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleCreate = () => {
    if (!newEnvName.trim()) return;
    onCreateEnv(newEnvName.trim());
    setNewEnvName('');
    setShowInput(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Environments
        </span>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setShowInput(true)}
          title="New Environment"
        >
          <Plus size={14} />
        </button>
      </div>

      {showInput && (
        <div
          style={{
            padding: '8px',
            marginBottom: '8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--brand-orange)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <input
            type="text"
            className="kv-input"
            autoFocus
            placeholder="Environment name (e.g. Staging)..."
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setShowInput(false);
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '11px', padding: '2px 8px', height: '22px' }}
              onClick={() => setShowInput(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '11px', padding: '2px 8px', height: '22px' }}
              onClick={handleCreate}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Environments List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {environments.map(env => {
          const isActive = env.id === activeEnvId;

          return (
            <div
              key={env.id}
              className={`sidebar-tab-btn ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
              onClick={() => onSelectEnv(env.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={14} color={isActive ? 'var(--brand-orange)' : 'var(--text-muted)'} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: 'var(--text-main)' }}>
                    {env.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {(env.variables || []).filter(v => v.enabled && v.key).length} variables
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isActive && <Check size={14} color="var(--brand-orange)" />}
                <button
                  className="btn-ghost"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEnv(env);
                  }}
                  title="Edit Variables"
                >
                  <Edit2 size={12} />
                </button>
                {environments.length > 1 && (
                  <button
                    className="btn-ghost"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEnv(env.id);
                    }}
                    title="Delete Environment"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
