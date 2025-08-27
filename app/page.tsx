'use client';

import React, { useState } from 'react';

type BuildResponse = {
  success?: boolean;
  html_url?: string;
  filename?: string;
  message?: string;
  error?: string;
};

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<BuildResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setState('loading');
    setResult(null);

    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data: BuildResponse = await res.json();

      if (!res.ok) {
        setResult({ error: data.error || 'Request failed' });
        setState('error');
        return;
      }

      setResult(data);
      setState('done');
    } catch (err) {
      setResult({ error: (err as Error).message });
      setState('error');
    }
  }

  function reset() {
    setPrompt('');
    setResult(null);
    setState('idle');
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 16px', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
        Report Builder
      </h1>
      <p style={{ color: '#555', marginBottom: 28 }}>
        Paste a problem or idea. We’ll generate a report and upload the HTML for you.
      </p>

      {/* IDLE (input) */}
      {state === 'idle' && (
        <form onSubmit={handleSubmit} style={cardStyle}>
          <label htmlFor="prompt" style={labelStyle}>
            Describe your problem or idea
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I need to improve conversion rates on my product landing page"
            rows={6}
            style={textareaStyle}
          />
          <button type="submit" style={buttonStyle}>
            Build Report
          </button>
        </form>
      )}

      {/* LOADING */}
      {state === 'loading' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Spinner />
            <div>
              <div style={{ fontWeight: 700 }}>Building your report…</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                This can take a minute while we analyze context and upload the HTML.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {state === 'done' && (
        <div style={cardStyle}>
          {result?.html_url ? (
            <>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Report ready ✅</div>
              <p style={{ marginBottom: 16 }}>
                Your HTML report has been uploaded. Click below to view it.
              </p>
              <a href={result.html_url} target="_blank" rel="noopener noreferrer" style={linkButtonStyle}>
                Open Report
              </a>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Request completed</div>
              <p style={{ marginBottom: 16 }}>
                We didn’t receive a direct report URL in the response. If your workflow publishes the
                link later, you can refresh this page once it’s ready.
              </p>
            </>
          )}

          <div style={{ marginTop: 20 }}>
            <button onClick={reset} style={secondaryButtonStyle}>
              Build another report
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {state === 'error' && (
        <div style={cardStyle}>
          <div style={{ color: '#b00020', fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
          <pre style={preStyle}>{result?.error || 'Unknown error'}</pre>
          <button onClick={reset} style={secondaryButtonStyle}>
            Try again
          </button>
        </div>
      )}

      <p style={{ color: '#888', fontSize: 12, marginTop: 28 }}>
        Calls your n8n workflow via a server route. Protected by a shared secret.
      </p>
    </main>
  );
}

/** Styles (quick inline so you can paste and go) */
const cardStyle: React.CSSProperties = {
  border: '1px solid #eee',
  borderRadius: 12,
  padding: 20,
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: 8,
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  resize: 'vertical',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 15,
  outline: 'none',
  marginBottom: 14,
};

const buttonStyle: React.CSSProperties = {
  background: '#111',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  background: '#f3f4f6',
  color: '#111',
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  cursor: 'pointer',
  fontWeight: 600,
};

const linkButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#111',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 700,
};

const preStyle: React.CSSProperties = {
  background: '#f9fafb',
  border: '1px solid #eee',
  padding: 12,
  borderRadius: 8,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

function Spinner() {
  return (
    <span
      aria-label="loading"
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: '2px solid #ddd',
        borderTopColor: '#111',
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}