import React, { useState, useEffect } from 'react';
import {
  Flame,
  Globe,
  Eye,
  Upload,
  Play,
  Sun,
  Moon,
  Server,
  Settings,
  Check,
} from 'lucide-react';

export default function Navbar({
  environments = [],
  activeEnvId,
  onSelectEnv,
  onOpenEnvModal,
  onOpenImportModal,
  onOpenRunnerModal,
  theme,
  onToggleTheme,
  settings,
  onUpdateSettings,
}) {
  const [backendOnline, setBackendOnline] = useState(false);

  // Ping Go backend health
  useEffect(() => {
    let mounted = true;
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          if (mounted) setBackendOnline(true);
        } else {
          if (mounted) setBackendOnline(false);
        }
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeEnv = environments.find(e => e.id === activeEnvId);

  const toggleProxy = () => {
    onUpdateSettings({
      ...settings,
      useProxy: !settings.useProxy,
    });
  };

  return (
    <header className="top-nav">
      {/* Brand Logo & Name */}
      <div className="brand-section">
        <div className="brand-logo">
          <Flame size={17} />
        </div>
        <div className="brand-title">
          <span>NovaPost</span>
          <span className="brand-badge">Go + React</span>
        </div>
      </div>

      {/* Global Actions */}
      <div className="nav-actions">
        {/* Environment Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div className="env-selector" title="Active Environment">
            <Globe size={13} color="var(--brand-orange)" />
            <select
              value={activeEnvId || ''}
              onChange={(e) => onSelectEnv(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: 'var(--bg-surface)' }}>
                No Environment
              </option>
              {environments.map(env => (
                <option key={env.id} value={env.id} style={{ background: 'var(--bg-surface)' }}>
                  {env.name}
                </option>
              ))}
            </select>
          </div>

          {activeEnv && (
            <button
              className="btn btn-secondary btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={onOpenEnvModal}
              title="Quick view environment variables"
            >
              <Eye size={13} />
            </button>
          )}
        </div>

        {/* Go Backend Proxy Indicator & Toggle */}
        <button
          className="status-pill"
          onClick={toggleProxy}
          style={{
            cursor: 'pointer',
            borderColor: settings.useProxy ? 'var(--brand-orange)' : 'var(--border-default)',
            background: settings.useProxy ? 'rgba(255, 108, 55, 0.1)' : 'var(--bg-surface)',
          }}
          title={
            settings.useProxy
              ? 'Requests are routed through the Go Backend Proxy (/api/proxy) to bypass browser CORS'
              : 'Direct browser fetch mode (click to enable Go Backend Proxy)'
          }
        >
          <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
          <Server size={12} color={backendOnline ? '#10b981' : 'var(--text-muted)'} />
          <span>{settings.useProxy ? 'Go Proxy: ON' : 'Direct Fetch'}</span>
        </button>

        {/* Import / Export Modal Trigger */}
        <button
          className="btn btn-secondary"
          style={{ height: '30px', fontSize: '11px', padding: '0 10px' }}
          onClick={onOpenImportModal}
          title="Import cURL or Postman collection"
        >
          <Upload size={13} />
          <span>Import</span>
        </button>

        {/* Collection Runner Trigger */}
        <button
          className="btn btn-secondary"
          style={{ height: '30px', fontSize: '11px', padding: '0 10px' }}
          onClick={onOpenRunnerModal}
          title="Run Collections Runner"
        >
          <Play size={13} color="#10b981" />
          <span>Runner</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          className="btn btn-ghost btn-icon"
          style={{ width: '30px', height: '30px' }}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
