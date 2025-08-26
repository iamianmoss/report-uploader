'use client';

import { useState } from 'react';

type StartResp = {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [keywords, setKeywords] = useState(''); // comma separated
  const [namespace, setNamespace] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<StartResp | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    const kw = keywords
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const r = await fetch('/api/start-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, keywords: kw, namespace }),
      });
      const j = await r.json();
      setResp(j);
    } catch (err: any) {
      setResp({ ok: false, status: 0, error: err?.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  }

  // Try to find a URL that n8n returns (we’ve used html_url, url in your flows)
  const reportUrl =
    (resp?.data && (resp.data.html_url || resp.data.url)) || '';

  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Report Uploader</h1>
      <p style={{ marginTop: 0, color: '#666' }}>
        Enter an HMW prompt (question), optional keywords, and (optional) namespace. We’ll send it to n8n and show the link when it’s ready.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14, marginTop: 24 }}>
        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>How Might We (question)</div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="How might we…"
            rows={4}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Keywords (comma separated)</div>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="banking, canada, onboarding"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Namespace (optional)</div>
          <input
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="260825-general"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#111827',
            color: 'white',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending to n8n…' : 'Build Report'}
        </button>
      </form>

      {resp && (
        <div style={{ marginTop: 28, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Result</div>
          {!resp.ok && (
            <div style={{ color: '#b91c1c', marginBottom: 8 }}>
              Error (status {resp.status}): {resp.error || JSON.stringify(resp.data)}
            </div>
          )}

          {reportUrl ? (
            <div>
              <div style={{ marginBottom: 6 }}>Report URL:</div>
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                {reportUrl}
              </a>
            </div>
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {JSON.stringify(resp.data ?? resp, null, 2)}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}
