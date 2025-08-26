'use client';

import { useState } from 'react';

export default function LoginPage({
  searchParams,
}: { searchParams?: { next?: string } }) {
  const next = searchParams?.next || '/';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, next }),
      });
      if (r.ok) {
        const { redirectTo } = await r.json();
        window.location.href = redirectTo || '/';
      } else {
        const { error } = await r.json().catch(() => ({ error: 'Login failed' }));
        setError(error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', padding: 24 }}>
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: 10, width: '100%' }}
        />
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
      </form>
    </main>
  );
}
