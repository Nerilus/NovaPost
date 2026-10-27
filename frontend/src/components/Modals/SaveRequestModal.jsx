import React, { useState } from 'react';
import { X, Save, Folder } from 'lucide-react';

export default function SaveRequestModal({
  isOpen,
  onClose,
  request,
  collections = [],
  onSave,
}) {
  const [name, setName] = useState(request?.name || 'My Request');
  const [collectionId, setCollectionId] = useState(collections[0]?.id || '');

  if (!isOpen || !request) return null;

  const handleSave = () => {
    if (!collectionId) return;
    onSave(collectionId, {
      ...request,
      name: name.trim() || 'Untitled Request',
      id: request.id?.startsWith('tab-') ? `req-${Date.now()}` : request.id,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} color="var(--brand-orange)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Save Request to Collection
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

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Request Name</label>
            <input
              type="text"
              className="kv-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Get User Profile"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                padding: '8px 12px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-main)',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              {collections.map(col => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.items?.length || 0} items)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!collectionId}>
            Save Request
          </button>
        </div>
      </div>
    </div>
  );
}
