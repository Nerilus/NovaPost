import React, { useState, useMemo } from 'react';
import { Copy, Check, Search } from 'lucide-react';

export default function JsonViewer({ content }) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formattedJson = useMemo(() => {
    if (!content) return '';
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content, null, 2);
      } catch {
        return String(content);
      }
    }
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  }, [content]);

  const lines = useMemo(() => {
    return formattedJson ? formattedJson.split('\n') : [];
  }, [formattedJson]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax colorizer for a line of JSON
  const renderLineContent = (line) => {
    if (!line) return <span>&nbsp;</span>;

    // Quick regex highlighting for JSON
    // Key: "key":
    // String: "value"
    // Number: 1234
    // Boolean/null: true, false, null
    const parts = [];
    let remaining = line;
    let keyIdx = 0;

    const regex = /(".*?"(?=\s*:)|".*?"|\btrue\b|\bfalse\b|\bnull\b|-?\b\d+(?:\.\d+)?\b)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={keyIdx++} style={{ color: '#94a3b8' }}>
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const val = match[0];
      let color = '#38bdf8'; // string default cyan

      if (val.endsWith(':') || line.substring(match.index + val.length).trim().startsWith(':')) {
        color = '#f97316'; // key orange
      } else if (val === 'true' || val === 'false') {
        color = '#10b981'; // boolean green
      } else if (val === 'null') {
        color = '#ef4444'; // null red
      } else if (!isNaN(Number(val))) {
        color = '#a855f7'; // number purple
      } else {
        color = '#38bdf8'; // string cyan
      }

      // Check search match
      const isSearchMatch = searchTerm && val.toLowerCase().includes(searchTerm.toLowerCase());

      parts.push(
        <span
          key={keyIdx++}
          style={{
            color,
            backgroundColor: isSearchMatch ? 'rgba(234, 179, 8, 0.35)' : 'transparent',
            borderRadius: isSearchMatch ? '2px' : '0',
          }}
        >
          {val}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(
        <span key={keyIdx++} style={{ color: '#94a3b8' }}>
          {line.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span>{line}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Viewer toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
            }}
          >
            <Search size={12} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Find in response..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '11px',
                outline: 'none',
                width: '130px',
              }}
            />
          </div>
          <span>{lines.length} lines</span>
        </div>

        <button
          className="btn btn-ghost"
          style={{ padding: '3px 8px', fontSize: '11px', height: '24px' }}
          onClick={handleCopy}
          title="Copy formatted JSON"
        >
          {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code body with line numbers */}
      <div
        className="font-mono"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px 0',
          backgroundColor: 'var(--bg-code)',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', userSelect: 'text' }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} style={{ verticalAlign: 'top' }}>
                <td
                  style={{
                    width: '45px',
                    textAlign: 'right',
                    padding: '0 12px 0 8px',
                    color: 'var(--text-dim)',
                    userSelect: 'none',
                    borderRight: '1px solid var(--border-subtle)',
                  }}
                >
                  {idx + 1}
                </td>
                <td style={{ padding: '0 16px', whiteSpace: 'pre' }}>
                  {renderLineContent(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
