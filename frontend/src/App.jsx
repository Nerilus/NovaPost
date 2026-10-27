import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import TabBar from './components/Tabs/TabBar';
import RequestBar from './components/Editor/RequestBar';
import RequestConfig from './components/Editor/RequestConfig';
import ResponseViewer from './components/Response/ResponseViewer';
import EnvironmentModal from './components/Modals/EnvironmentModal';
import CollectionRunnerModal from './components/Modals/CollectionRunnerModal';
import CodeSnippetModal from './components/Modals/CodeSnippetModal';
import ImportExportModal from './components/Modals/ImportExportModal';
import SaveRequestModal from './components/Modals/SaveRequestModal';

import {
  loadCollections,
  saveCollections,
  loadEnvironments,
  saveEnvironments,
  loadActiveEnvId,
  saveActiveEnvId,
  loadHistory,
  saveHistory,
  loadTabs,
  saveTabs,
  loadActiveTabId,
  saveActiveTabId,
  loadSettings,
  saveSettings,
} from './utils/storage';
import { executeRequest } from './utils/httpClient';
import { INITIAL_REQUEST } from './utils/defaultData';

export default function App() {
  // Application Data States
  const [collections, setCollections] = useState(loadCollections);
  const [environments, setEnvironments] = useState(loadEnvironments);
  const [activeEnvId, setActiveEnvId] = useState(loadActiveEnvId);
  const [history, setHistory] = useState(loadHistory);
  const [tabs, setTabs] = useState(loadTabs);
  const [activeTabId, setActiveTabId] = useState(loadActiveTabId);
  const [settings, setSettings] = useState(loadSettings);

  // Runtime Execution States
  const [responses, setResponses] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [layoutMode, setLayoutMode] = useState('vertical'); // 'vertical' or 'horizontal'

  // Modals
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isRunnerModalOpen, setIsRunnerModalOpen] = useState(false);
  const [selectedRunnerCollection, setSelectedRunnerCollection] = useState(null);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Synchronize state with LocalStorage
  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  useEffect(() => {
    saveEnvironments(environments);
  }, [environments]);

  useEffect(() => {
    saveActiveEnvId(activeEnvId);
  }, [activeEnvId]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveTabs(tabs);
  }, [tabs]);

  useEffect(() => {
    saveActiveTabId(activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    saveSettings(settings);
    if (settings.theme === 'light') {
      document.body.className = 'theme-light';
    } else {
      document.body.className = 'theme-dark';
    }
  }, [settings]);

  // Current Active Tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0] || INITIAL_REQUEST;
  const activeResponse = responses[activeTab.id] || null;
  const isLoading = loadingMap[activeTab.id] || false;

  // Active Environment Variables
  const activeEnv = environments.find(e => e.id === activeEnvId);
  const activeEnvVars = activeEnv?.variables || [];

  // Tab Handlers
  const handleSelectTab = (id) => {
    setActiveTabId(id);
  };

  const handleNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      ...INITIAL_REQUEST,
      id: newTabId,
      name: 'Untitled Request',
      url: '',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  const handleCloseTab = (id) => {
    if (tabs.length === 1) {
      // If closing the only tab, reset it
      const resetTab = { ...INITIAL_REQUEST, id: `tab-${Date.now()}` };
      setTabs([resetTab]);
      setActiveTabId(resetTab.id);
      return;
    }

    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const handleUpdateActiveTab = (updatedTab) => {
    setTabs(prev => prev.map(t => (t.id === updatedTab.id ? updatedTab : t)));
  };

  // Execute Current Request
  const handleSendRequest = useCallback(async () => {
    if (!activeTab || isLoading) return;

    setLoadingMap(prev => ({ ...prev, [activeTab.id]: true }));

    const res = await executeRequest(activeTab, {
      envVariables: activeEnvVars,
      useProxy: settings.useProxy,
      proxyUrl: settings.proxyUrl,
      timeoutMs: settings.timeoutMs,
    });

    setResponses(prev => ({ ...prev, [activeTab.id]: res }));
    setLoadingMap(prev => ({ ...prev, [activeTab.id]: false }));

    // Append to History
    const historyItem = {
      id: `hist-${Date.now()}`,
      method: activeTab.method || 'GET',
      url: activeTab.url,
      status: res.status,
      timeMs: res.timeMs,
      timestamp: Date.now(),
      request: { ...activeTab },
    };
    setHistory(prev => [historyItem, ...prev]);
  }, [activeTab, isLoading, activeEnvVars, settings]);

  const handleCancelRequest = () => {
    setLoadingMap(prev => ({ ...prev, [activeTab.id]: false }));
  };

  // Keyboard shortcut for Cmd/Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSendRequest]);

  // Collection Handlers
  const handleCreateCollection = (name) => {
    const newCol = {
      id: `col-${Date.now()}`,
      name,
      items: [],
    };
    setCollections(prev => [...prev, newCol]);
  };

  const handleDeleteCollection = (colId) => {
    setCollections(prev => prev.filter(c => c.id !== colId));
  };

  const handleAddRequestToCollection = (colId) => {
    const newReq = {
      ...INITIAL_REQUEST,
      id: `req-${Date.now()}`,
      name: 'New Request',
      url: 'https://jsonplaceholder.typicode.com/posts',
    };
    setCollections(prev =>
      prev.map(c => (c.id === colId ? { ...c, items: [...(c.items || []), newReq] } : c))
    );
    // Open in new tab
    setTabs(prev => [...prev, newReq]);
    setActiveTabId(newReq.id);
  };

  const handleDeleteRequest = (colId, reqId) => {
    setCollections(prev =>
      prev.map(c =>
        c.id === colId ? { ...c, items: (c.items || []).filter(i => i.id !== reqId) } : c
      )
    );
  };

  const handleSelectRequest = (req) => {
    // Check if already open in a tab
    const existing = tabs.find(t => t.id === req.id);
    if (existing) {
      setActiveTabId(req.id);
    } else {
      setTabs(prev => [...prev, { ...req }]);
      setActiveTabId(req.id);
    }
  };

  const handleSelectHistoryItem = (item) => {
    if (item.request) {
      const restored = {
        ...item.request,
        id: `tab-${Date.now()}`,
        name: `${item.request.method} ${item.request.url.split('?')[0].slice(-20)}`,
      };
      setTabs(prev => [...prev, restored]);
      setActiveTabId(restored.id);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Environment Handlers
  const handleCreateEnv = (name) => {
    const newEnv = {
      id: `env-${Date.now()}`,
      name,
      variables: [
        { key: 'baseUrl', value: 'https://api.example.com', enabled: true },
        { key: 'apiKey', value: 'secret-key-123', enabled: true },
      ],
    };
    setEnvironments(prev => [...prev, newEnv]);
    setActiveEnvId(newEnv.id);
  };

  const handleDeleteEnv = (id) => {
    setEnvironments(prev => prev.filter(e => e.id !== id));
    if (activeEnvId === id) {
      setActiveEnvId(environments[0]?.id || '');
    }
  };

  const handleSaveEnvironment = (updatedEnv) => {
    setEnvironments(prev => prev.map(e => (e.id === updatedEnv.id ? updatedEnv : e)));
  };

  // Import Handlers
  const handleImportCurl = (parsedRequest) => {
    const newTab = {
      ...INITIAL_REQUEST,
      ...parsedRequest,
      id: `tab-${Date.now()}`,
      name: parsedRequest.url ? parsedRequest.url.replace(/^https?:\/\//, '').split('?')[0] : 'Imported cURL',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleImportCollection = (newCollection) => {
    setCollections(prev => [...prev, newCollection]);
  };

  const handleExportCollection = (col) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(col, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${col.name.toLowerCase().replace(/\s+/g, '-')}.postman_collection.json`);
    dlAnchor.click();
  };

  // Save to Collection handler
  const handleSaveToCollection = (colId, requestToSave) => {
    setCollections(prev =>
      prev.map(c => {
        if (c.id === colId) {
          const existingIdx = (c.items || []).findIndex(i => i.id === requestToSave.id);
          let newItems;
          if (existingIdx >= 0) {
            newItems = [...c.items];
            newItems[existingIdx] = requestToSave;
          } else {
            newItems = [...(c.items || []), requestToSave];
          }
          return { ...c, items: newItems };
        }
        return c;
      })
    );
    // Also update current tab name
    handleUpdateActiveTab({ ...activeTab, name: requestToSave.name });
  };

  // Quick sample endpoint runner for empty response state
  const handleQuickTest = (url, method = 'GET') => {
    const updated = {
      ...activeTab,
      url,
      method,
    };
    handleUpdateActiveTab(updated);
    setTimeout(() => {
      handleSendRequest();
    }, 100);
  };

  const handleToggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleOpenRunnerForCollection = (col) => {
    setSelectedRunnerCollection(col);
    setIsRunnerModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        environments={environments}
        activeEnvId={activeEnvId}
        onSelectEnv={setActiveEnvId}
        onOpenEnvModal={() => setIsEnvModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenRunnerModal={() => {
          setSelectedRunnerCollection(collections[0] || null);
          setIsRunnerModalOpen(true);
        }}
        theme={settings.theme || 'dark'}
        onToggleTheme={handleToggleTheme}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Main Workspace */}
      <div className="main-layout">
        {/* Left Sidebar */}
        <Sidebar
          collections={collections}
          history={history}
          environments={environments}
          activeEnvId={activeEnvId}
          onSelectRequest={handleSelectRequest}
          onCreateCollection={handleCreateCollection}
          onAddRequestToCollection={handleAddRequestToCollection}
          onDeleteCollection={handleDeleteCollection}
          onDeleteRequest={handleDeleteRequest}
          onRunCollection={handleOpenRunnerForCollection}
          onExportCollection={handleExportCollection}
          onSelectHistoryItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory}
          onSelectEnv={setActiveEnvId}
          onCreateEnv={handleCreateEnv}
          onDeleteEnv={handleDeleteEnv}
          onEditEnv={(env) => {
            setActiveEnvId(env.id);
            setIsEnvModalOpen(true);
          }}
        />

        {/* Center Request/Response Workspace Area */}
        <div className="workspace-area">
          {/* Open Tabs Bar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
          />

          {/* Request Editor & Response Split View */}
          <div className="editor-container">
            {/* URL Input Bar */}
            <RequestBar
              request={activeTab}
              onChange={handleUpdateActiveTab}
              onSend={handleSendRequest}
              onCancel={handleCancelRequest}
              loading={isLoading}
              onSaveToCollection={() => setIsSaveModalOpen(true)}
              onOpenSnippet={() => setIsSnippetModalOpen(true)}
            />

            {/* Split Panes (Request Config on top/left, Response on bottom/right) */}
            <div className={`pane-split ${layoutMode}`}>
              {/* Request Configuration Pane */}
              <div className="request-pane">
                <RequestConfig
                  request={activeTab}
                  onChange={handleUpdateActiveTab}
                />
              </div>

              {/* Splitter bar */}
              <div className="pane-divider" />

              {/* Response Viewer Pane */}
              <div className="response-pane">
                <ResponseViewer
                  response={activeResponse}
                  loading={isLoading}
                  onQuickTest={handleQuickTest}
                  layoutMode={layoutMode}
                  onToggleLayout={() =>
                    setLayoutMode(prev => (prev === 'vertical' ? 'horizontal' : 'vertical'))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        environment={activeEnv}
        onSaveEnvironment={handleSaveEnvironment}
      />

      <CollectionRunnerModal
        isOpen={isRunnerModalOpen}
        onClose={() => setIsRunnerModalOpen(false)}
        collection={selectedRunnerCollection || collections[0]}
        envVariables={activeEnvVars}
        settings={settings}
      />

      <CodeSnippetModal
        isOpen={isSnippetModalOpen}
        onClose={() => setIsSnippetModalOpen(false)}
        request={activeTab}
        envVariables={activeEnvVars}
      />

      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        collections={collections}
        onImportCurl={handleImportCurl}
        onImportCollection={handleImportCollection}
      />

      <SaveRequestModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        request={activeTab}
        collections={collections}
        onSave={handleSaveToCollection}
      />
    </div>
  );
}
