'use client';
import { useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const supabase = sbBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined
      }
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: '6rem auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Sign in</h1>
      {!sent ? (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@domain.com"
            style={{ width:'100%', padding:12, border:'1px solid #ddd', borderRadius:8, marginBottom:12 }}
          />
          <button style={{ padding:'10px 14px', borderRadius:8, border:0, background:'#111', color:'#fff' }}>
            Send magic link
          </button>
          {err && <p style={{ color:'#b00020', marginTop:8 }}>{err}</p>}
        </form>
      ) : (
        <p>Check your email for the sign-in link.</p>
      )}
    </main>
  );
}