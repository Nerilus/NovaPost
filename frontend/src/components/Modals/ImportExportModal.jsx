import React, { useState } from 'react';
import { X, Upload, Download, Terminal, FileCode, Check } from 'lucide-react';
import { parseCurl } from '../../utils/curlParser';

export default function ImportExportModal({
  isOpen,
  onClose,
  collections = [],
  onImportCurl,
  onImportCollection,
}) {
  const [activeTab, setActiveTab] = useState('curl'); // 'curl', 'postman', 'export'
  const [curlText, setCurlText] = useState('');
  const [postmanJson, setPostmanJson] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleImportCurl = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!curlText.trim()) return;

    const parsed = parseCurl(curlText);
    if (!parsed) {
      setErrorMsg('Failed to parse cURL command. Please ensure it starts with "curl".');
      return;
    }

    onImportCurl(parsed);
    setSuccessMsg('cURL request imported successfully!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleImportPostmanJson = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!postmanJson.trim()) return;

    try {
      const data = JSON.parse(postmanJson);
      // Basic validation for Postman collection
      const collectionName = data.info?.name || data.name || 'Imported Collection';
      const items = (data.item || []).map((it, idx) => {
        const req = it.request || {};
        const urlStr = typeof req.url === 'string' ? req.url : req.url?.raw || '';
        return {
          id: `imported-${Date.now()}-${idx}`,
          name: it.name || `Request ${idx + 1}`,
          method: (req.method || 'GET').toUpperCase(),
          url: urlStr,
          headers: (req.header || []).map(h => ({ key: h.key, value: h.value, enabled: true })),
          params: [],
          auth: { type: 'none' },
          body: {
            type: req.body?.mode === 'raw' ? 'raw' : 'none',
            raw: req.body?.raw || '',
            rawType: 'json',
          },
          tests: [],
        };
      });

      const newCol = {
        id: `col-imported-${Date.now()}`,
        name: collectionName,
        items,
      };

      onImportCollection(newCol);
      setSuccessMsg(`Collection "${collectionName}" imported with ${items.length} requests!`);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (e) {
      setErrorMsg('Invalid JSON format: ' + e.message);
    }
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collections, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `novapost-collections-${Date.now()}.json`);
    dlAnchor.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={16} color="var(--brand-orange)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Import / Export Data
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

        {/* Tab Selection */}
        <div className="sidebar-tabs" style={{ background: 'var(--bg-input)', padding: '4px 12px' }}>
          <button
            className={`sidebar-tab-btn ${activeTab === 'curl' ? 'active' : ''}`}
            onClick={() => { setActiveTab('curl'); setErrorMsg(null); }}
          >
            <Terminal size={13} />
            <span>Raw cURL</span>
          </button>

          <button
            className={`sidebar-tab-btn ${activeTab === 'postman' ? 'active' : ''}`}
            onClick={() => { setActiveTab('postman'); setErrorMsg(null); }}
          >
            <FileCode size={13} />
            <span>Postman JSON</span>
          </button>

          <button
            className={`sidebar-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => { setActiveTab('export'); setErrorMsg(null); }}
          >
            <Download size={13} />
            <span>Export Collections</span>
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} />
              {successMsg}
            </div>
          )}

          {activeTab === 'curl' && (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Paste a cURL command below to automatically populate the URL, headers, and request body:
              </p>
              <textarea
                className="font-mono kv-input"
                rows={8}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  resize: 'vertical',
                  fontSize: '12px',
                }}
                placeholder={`curl --request POST 'https://api.example.com/login' --header 'Content-Type: application/json' --data '{"email":"test@domain.com"}'`}
                value={curlText}
                onChange={(e) => setCurlText(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'postman' && (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Paste a Postman Collection JSON (v2.0 or v2.1) export:
              </p>
              <textarea
                className="font-mono kv-input"
                rows={8}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  resize: 'vertical',
                  fontSize: '12px',
                }}
                placeholder='{ "info": { "name": "My API Collection" }, "item": [...] }'
                value={postmanJson}
                onChange={(e) => setPostmanJson(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'export' && (
            <div style={{ padding: '16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                Export all your current collections ({collections.length} collections) as a portable JSON file.
              </p>
              <button className="btn btn-primary" onClick={handleExportAll}>
                <Download size={14} /> Download Collections JSON
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {activeTab === 'curl' && (
            <button className="btn btn-primary" onClick={handleImportCurl}>
              Import cURL
            </button>
          )}
          {activeTab === 'postman' && (
            <button className="btn btn-primary" onClick={handleImportPostmanJson}>
              Import Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
