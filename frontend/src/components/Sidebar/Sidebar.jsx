import React, { useState } from 'react';
import { Folder, Clock, Globe, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import CollectionsTab from './CollectionsTab';
import HistoryTab from './HistoryTab';
import EnvironmentsTab from './EnvironmentsTab';

export default function Sidebar({
  collections,
  history,
  environments,
  activeEnvId,
  onSelectRequest,
  onCreateCollection,
  onAddRequestToCollection,
  onDeleteCollection,
  onDeleteRequest,
  onRunCollection,
  onExportCollection,
  onSelectHistoryItem,
  onClearHistory,
  onSelectEnv,
  onCreateEnv,
  onDeleteEnv,
  onEditEnv,
}) {
  const [activeTab, setActiveTab] = useState('collections'); // 'collections', 'history', 'environments'
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div
        className="sidebar collapsed"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '12px',
        }}
      >
        <button
          className="btn-ghost"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={() => setCollapsed(false)}
          title="Expand Sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>

        <div style={{ height: '1px', width: '28px', background: 'var(--border-subtle)' }} />

        <button
          className={`tab-new-btn ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => { setCollapsed(false); setActiveTab('collections'); }}
          title="Collections"
        >
          <Folder size={16} color={activeTab === 'collections' ? 'var(--brand-orange)' : 'var(--text-muted)'} />
        </button>

        <button
          className={`tab-new-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => { setCollapsed(false); setActiveTab('history'); }}
          title="History"
        >
          <Clock size={16} color={activeTab === 'history' ? 'var(--brand-orange)' : 'var(--text-muted)'} />
        </button>

        <button
          className={`tab-new-btn ${activeTab === 'environments' ? 'active' : ''}`}
          onClick={() => { setCollapsed(false); setActiveTab('environments'); }}
          title="Environments"
        >
          <Globe size={16} color={activeTab === 'environments' ? 'var(--brand-orange)' : 'var(--text-muted)'} />
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Sidebar Navigation Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab-btn ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <Folder size={13} />
          <span>Collections</span>
        </button>

        <button
          className={`sidebar-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={13} />
          <span>History</span>
        </button>

        <button
          className={`sidebar-tab-btn ${activeTab === 'environments' ? 'active' : ''}`}
          onClick={() => setActiveTab('environments')}
        >
          <Globe size={13} />
          <span>Env</span>
        </button>

        <button
          className="btn-ghost"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={() => setCollapsed(true)}
          title="Collapse Sidebar"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="sidebar-content">
        {activeTab === 'collections' && (
          <CollectionsTab
            collections={collections}
            onSelectRequest={onSelectRequest}
            onCreateCollection={onCreateCollection}
            onAddRequestToCollection={onAddRequestToCollection}
            onDeleteCollection={onDeleteCollection}
            onDeleteRequest={onDeleteRequest}
            onRunCollection={onRunCollection}
            onExportCollection={onExportCollection}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            onSelectHistoryItem={onSelectHistoryItem}
            onClearHistory={onClearHistory}
          />
        )}

        {activeTab === 'environments' && (
          <EnvironmentsTab
            environments={environments}
            activeEnvId={activeEnvId}
            onSelectEnv={onSelectEnv}
            onCreateEnv={onCreateEnv}
            onDeleteEnv={onDeleteEnv}
            onEditEnv={onEditEnv}
          />
        )}
      </div>
    </div>
  );
}
