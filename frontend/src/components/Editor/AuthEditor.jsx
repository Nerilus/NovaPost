import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Shield, User } from 'lucide-react';

export default function AuthEditor({ auth = { type: 'none' }, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const setType = (type) => {
    onChange({ ...auth, type });
  };

  const updateField = (field, val) => {
    onChange({ ...auth, [field]: val });
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Auth Type Selector Column */}
      <div
        style={{
          width: '180px',
          borderRight: '1px solid var(--border-subtle)',
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'var(--bg-input)',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
          Auth Type
        </div>

        <button
          className={`sidebar-tab-btn ${auth.type === 'none' ? 'active' : ''}`}
          style={{ justifyContent: 'flex-start', padding: '6px 10px' }}
          onClick={() => setType('none')}
        >
          No Auth
        </button>

        <button
          className={`sidebar-tab-btn ${auth.type === 'bearer' ? 'active' : ''}`}
          style={{ justifyContent: 'flex-start', padding: '6px 10px' }}
          onClick={() => setType('bearer')}
        >
          <Shield size={13} color="var(--brand-orange)" />
          Bearer Token
        </button>

        <button
          className={`sidebar-tab-btn ${auth.type === 'basic' ? 'active' : ''}`}
          style={{ justifyContent: 'flex-start', padding: '6px 10px' }}
          onClick={() => setType('basic')}
        >
          <User size={13} color="var(--accent-blue)" />
          Basic Auth
        </button>

        <button
          className={`sidebar-tab-btn ${auth.type === 'apikey' ? 'active' : ''}`}
          style={{ justifyContent: 'flex-start', padding: '6px 10px' }}
          onClick={() => setType('apikey')}
        >
          <KeyRound size={13} color="var(--method-get)" />
          API Key
        </button>
      </div>

      {/* Auth Configuration Panel */}
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {auth.type === 'none' && (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            This request does not use any authorization headers.
          </div>
        )}

        {auth.type === 'bearer' && (
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Bearer Token Authentication
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              The token will be sent in the <code>Authorization: Bearer &lt;token&gt;</code> header.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Token</label>
              <input
                type="text"
                className="kv-input font-mono"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  padding: '8px 12px',
                }}
                placeholder="Paste token or use {{variable}}"
                value={auth.bearerToken || ''}
                onChange={(e) => updateField('bearerToken', e.target.value)}
              />
            </div>
          </div>
        )}

        {auth.type === 'basic' && (
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Basic Authentication
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Username and password will be Base64-encoded in the <code>Authorization: Basic</code> header.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                className="kv-input font-mono"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  padding: '8px 12px',
                }}
                placeholder="Username or {{userVar}}"
                value={auth.basicUser || ''}
                onChange={(e) => updateField('basicUser', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="kv-input font-mono"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    padding: '8px 12px',
                    paddingRight: '36px',
                    width: '100%',
                  }}
                  placeholder="Password or {{passVar}}"
                  value={auth.basicPass || ''}
                  onChange={(e) => updateField('basicPass', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {auth.type === 'apikey' && (
          <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              API Key Authentication
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Key Name</label>
              <input
                type="text"
                className="kv-input font-mono"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  padding: '8px 12px',
                }}
                placeholder="e.g. X-API-KEY or api_key"
                value={auth.apiKeyName || ''}
                onChange={(e) => updateField('apiKeyName', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Value</label>
              <input
                type="text"
                className="kv-input font-mono"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  padding: '8px 12px',
                }}
                placeholder="Key value or {{apiKey}}"
                value={auth.apiKeyValue || ''}
                onChange={(e) => updateField('apiKeyValue', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Add To</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    checked={(auth.apiKeyLocation || 'header') === 'header'}
                    onChange={() => updateField('apiKeyLocation', 'header')}
                    style={{ accentColor: 'var(--brand-orange)' }}
                  />
                  Header
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="apiKeyLocation"
                    checked={auth.apiKeyLocation === 'query'}
                    onChange={() => updateField('apiKeyLocation', 'query')}
                    style={{ accentColor: 'var(--brand-orange)' }}
                  />
                  Query Params
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
