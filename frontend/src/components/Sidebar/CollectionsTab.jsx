import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderPlus, Plus, Play, Trash2, Download } from 'lucide-react';

export default function CollectionsTab({
  collections = [],
  onSelectRequest,
  onCreateCollection,
  onAddRequestToCollection,
  onDeleteCollection,
  onDeleteRequest,
  onRunCollection,
  onExportCollection,
}) {
  const [expanded, setExpanded] = useState({ 'col-jsonplaceholder': true, 'col-httpbin': true });
  const [searchTerm, setSearchTerm] = useState('');
  const [newColName, setNewColName] = useState('');
  const [showNewColInput, setShowNewColInput] = useState(false);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateCollection = () => {
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim());
    setNewColName('');
    setShowNewColInput(false);
  };

  const filteredCollections = collections.map(col => {
    const matchingItems = (col.items || []).filter(item =>
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.url || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...col, filteredItems: matchingItems };
  }).filter(col => col.filteredItems.length > 0 || col.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search and Action Bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <input
          type="text"
          className="kv-input"
          placeholder="Filter collections & requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            fontSize: '11px',
            padding: '5px 8px',
          }}
        />
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setShowNewColInput(true)}
          title="New Collection"
        >
          <FolderPlus size={14} />
        </button>
      </div>

      {/* New Collection Input Popover */}
      {showNewColInput && (
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
            placeholder="Collection name..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCollection();
              if (e.key === 'Escape') setShowNewColInput(false);
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '11px', padding: '2px 8px', height: '22px' }}
              onClick={() => setShowNewColInput(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '11px', padding: '2px 8px', height: '22px' }}
              onClick={handleCreateCollection}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filteredCollections.map(col => {
          const isExp = expanded[col.id] ?? false;
          const items = col.filteredItems || col.items || [];

          return (
            <div key={col.id} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {/* Collection Row Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: isExp ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                }}
                className="sidebar-tab-btn"
                onClick={() => toggleExpand(col.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  {isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  <Folder size={14} color="var(--brand-orange)" />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: 'var(--text-main)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    ({(col.items || []).length})
                  </span>
                </div>

                {/* Actions on hover */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-ghost"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                    onClick={() => onRunCollection(col)}
                    title="Run Collection"
                  >
                    <Play size={12} color="#10b981" />
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                    onClick={() => onAddRequestToCollection(col.id)}
                    title="Add Request"
                  >
                    <Plus size={12} />
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                    onClick={() => onExportCollection(col)}
                    title="Export Collection JSON"
                  >
                    <Download size={12} />
                  </button>

                  <button
                    className="btn-ghost"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '3px', cursor: 'pointer' }}
                    onClick={() => onDeleteCollection(col.id)}
                    title="Delete Collection"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Items Inside Collection */}
              {isExp && (
                <div style={{ paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {items.map(req => {
                    const method = req.method || 'GET';
                    return (
                      <div
                        key={req.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-xs)',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)',
                        }}
                        className="sidebar-tab-btn"
                        onClick={() => onSelectRequest(req)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span className={`method-badge method-${method}`} style={{ fontSize: '10px' }}>
                            {method}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {req.name || req.url}
                          </span>
                        </div>

                        <button
                          className="btn-ghost"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            padding: '2px',
                            cursor: 'pointer',
                            opacity: 0.6,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(col.id, req.id);
                          }}
                          title="Delete Request"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '6px 8px', fontStyle: 'italic' }}>
                      No requests inside this collection.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredCollections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-dim)', fontSize: '11px' }}>
            No matching collections found.
          </div>
        )}
      </div>
    </div>
  );
}
