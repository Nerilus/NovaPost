import React from 'react';
import { Plus, X } from 'lucide-react';

export default function TabBar({ tabs = [], activeTabId, onSelectTab, onCloseTab, onNewTab }) {
  return (
    <div className="request-tabs-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const method = tab.method || 'GET';
        const title = tab.name || (tab.url ? tab.url.replace(/^https?:\/\//, '').split('?')[0] : 'Untitled');

        return (
          <div
            key={tab.id}
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            title={tab.url || tab.name}
          >
            <span className={`method-badge method-${method}`}>{method}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </span>

            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              title="Close Tab"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <button className="tab-new-btn" onClick={onNewTab} title="New Request Tab">
        <Plus size={14} />
      </button>
    </div>
  );
}
