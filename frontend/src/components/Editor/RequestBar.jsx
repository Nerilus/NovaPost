import React from 'react';
import { Send, Save, Code2, Loader2, Square } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function RequestBar({
  request,
  onChange,
  onSend,
  onCancel,
  loading,
  onSaveToCollection,
  onOpenSnippet,
}) {
  const method = request.method || 'GET';

  const handleMethodChange = (newMethod) => {
    onChange({ ...request, method: newMethod });
  };

  const handleUrlChange = (newUrl) => {
    // When URL is manually typed, parse query params to update params table
    let updatedParams = [...(request.params || [])];
    if (newUrl.includes('?')) {
      try {
        const [, query] = newUrl.split('?');
        const searchParams = new URLSearchParams(query);
        const parsed = [];
        for (const [k, v] of searchParams.entries()) {
          parsed.push({ key: k, value: v, description: '', enabled: true });
        }
        if (parsed.length > 0) {
          parsed.push({ key: '', value: '', description: '', enabled: true });
          updatedParams = parsed;
        }
      } catch {
        // ignore partial query parsing errors
      }
    }
    onChange({ ...request, url: newUrl, params: updatedParams });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="url-bar-container">
      <div className="url-input-group">
        {/* Method selector */}
        <select
          className={`method-select method-${method}`}
          value={method}
          onChange={(e) => handleMethodChange(e.target.value)}
        >
          {METHODS.map((m) => (
            <option key={m} value={m} className={`method-${m}`}>
              {m}
            </option>
          ))}
        </select>

        {/* URL Input */}
        <input
          type="text"
          className="url-input"
          placeholder="Enter request URL or paste cURL (e.g. https://jsonplaceholder.typicode.com/posts/1)"
          value={request.url || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {loading ? (
          <button className="btn btn-secondary" onClick={onCancel} title="Cancel Request">
            <Square size={13} color="#ef4444" fill="#ef4444" />
            <span>Cancel</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onSend}
            title="Send Request (⌘+Enter / Ctrl+Enter)"
          >
            <Send size={13} />
            <span>Send</span>
          </button>
        )}

        <button
          className="btn btn-secondary"
          onClick={onSaveToCollection}
          title="Save request to a collection"
        >
          <Save size={13} />
          <span>Save</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenSnippet}
          title="Generate Code Snippet (cURL, JS, Python, Go...)"
        >
          <Code2 size={13} />
          <span>Code</span>
        </button>
      </div>
    </div>
  );
}
