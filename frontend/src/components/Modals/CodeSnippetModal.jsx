import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';
import { generateSnippet } from '../../utils/codeGenerators';

const LANGUAGES = [
  { id: 'curl', label: 'cURL' },
  { id: 'fetch', label: 'JavaScript (Fetch)' },
  { id: 'axios', label: 'JavaScript (Axios)' },
  { id: 'python', label: 'Python (requests)' },
  { id: 'go', label: 'Go (net/http)' },
];

export default function CodeSnippetModal({ isOpen, onClose, request, envVariables = [] }) {
  const [lang, setLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    if (!request) return '';
    return generateSnippet(request, lang, envVariables);
  }, [request, lang, envVariables]);

  if (!isOpen || !request) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} color="var(--brand-orange)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Generate Code Snippet
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

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Language selector tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                className={`btn ${lang === l.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px', height: '26px' }}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Snippet box */}
          <div style={{ position: 'relative' }}>
            <pre
              className="code-viewer"
              style={{
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                maxHeight: '380px',
              }}
            >
              {snippet}
            </pre>

            <button
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                fontSize: '11px',
                height: '24px',
              }}
              onClick={handleCopy}
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
