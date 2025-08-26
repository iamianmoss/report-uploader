'use client';

import { useState } from 'react';

export default function Home() {
  const [problem, setProblem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResultUrl(null);
    setError(null);

    try {
      // Call your n8n webhook (use the PRODUCTION webhook).
      // Put this in Vercel env: NEXT_PUBLIC_N8N_WEBHOOK_URL
      const webhook = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: problem }),
      });

      // Try JSON first; fall back to raw text
      let data: any = null;
      const text = await res.text();
      try { data = JSON.parse(text); } catch (_) {}

      if (!res.ok) {
        throw new Error(data?.message || text || 'Request failed');
      }

      // Accept either {url} or {html_url} or {link}
      const link = data?.url || data?.html_url || data?.link || null;
      setResultUrl(link);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="wrap">
        <header className="hero">
          <h1>Report Builder</h1>
          <p className="sub">
            Paste a problem or idea. We’ll generate a report and upload the HTML for you.
          </p>
        </header>

        <form className="card" onSubmit={handleSubmit}>
          <label htmlFor="problem">Describe your problem or idea</label>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., How might we increase conversion from the pricing page?"
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Building…' : 'Build Report'}
          </button>

          {resultUrl && (
            <p className="success">
              ✅ Report uploaded. <a href={resultUrl} target="_blank">Open report</a>
            </p>
          )}
          {error && <p className="error">⚠️ {error}</p>}
        </form>

        <footer className="fineprint">
          Calls your n8n workflow via the production webhook.
        </footer>
      </section>

      <style jsx>{`
        :root {
          --fg: #0f172a;       /* slate-900 */
          --muted: #475569;    /* slate-600 */
          --bg: #f8fafc;       /* slate-50 */
          --card: #ffffff;
          --border: #e2e8f0;   /* slate-200 */
          --accent: #1e40af;   /* blue-800 */
          --accentFg: #ffffff;
          --accentHover: #1d4ed8; /* blue-700 */
          --success: #0a7d27;
          --error: #b91c1c;
        }
        main {
          min-height: 100dvh;
          background: radial-gradient(1200px 600px at 70% -10%, #e0f2fe 0, transparent 60%), var(--bg);
          color: var(--fg);
        }
        .wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 20px 64px;
        }
        .hero {
          margin-bottom: 24px;
          text-align: left;
        }
        h1 {
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.15;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .sub {
          margin: 0;
          color: var(--muted);
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 30px rgba(2,6,23,0.06);
        }
        label {
          display: block;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 8px;
        }
        textarea {
          width: 100%;
          min-height: 140px;
          font: inherit;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          resize: vertical;
          background: #fff;
          outline: none;
        }
        textarea:focus {
          border-color: #93c5fd; /* blue-300 */
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
        }
        button {
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: var(--accent);
          color: var(--accentFg);
          font-weight: 600;
          cursor: pointer;
        }
        button:hover { background: var(--accentHover); }
        button[disabled] {
          opacity: 0.6;
          cursor: progress;
        }
        .success, .error {
          margin-top: 12px;
          font-size: 14px;
        }
        .success a {
          color: var(--accent);
          text-decoration: underline;
        }
        .error { color: var(--error); }
        .fineprint {
          margin-top: 18px;
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </main>
  );
}
