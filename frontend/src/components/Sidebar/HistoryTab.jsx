import React, { useState } from 'react';
import { Trash2, Clock } from 'lucide-react';

export default function HistoryTab({ history = [], onSelectHistoryItem, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item =>
    (item.url || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.method || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search and Clear */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <input
          type="text"
          className="kv-input"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            fontSize: '11px',
            padding: '5px 8px',
          }}
        />
        {history.length > 0 && (
          <button
            className="btn btn-secondary btn-icon"
            onClick={onClearHistory}
            title="Clear History"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* History Items */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filteredHistory.map((item, idx) => {
          const method = item.method || 'GET';
          const isSuccess = item.status >= 200 && item.status < 300;

          return (
            <div
              key={idx}
              className="sidebar-tab-btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                gap: '4px',
              }}
              onClick={() => onSelectHistoryItem(item)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`method-badge method-${method}`} style={{ fontSize: '10px' }}>
                    {method}
                  </span>
                  {item.status ? (
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: isSuccess ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {item.status}
                    </span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-dim)' }}>
                  <Clock size={10} />
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>

              <div
                className="font-mono"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
              >
                {item.url}
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-dim)', fontSize: '11px' }}>
            {history.length === 0 ? 'No request history yet.' : 'No matching history found.'}
          </div>
        )}
      </div>
    </div>
  );
}
