'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin'|'signup'|'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMsg('Check your email for a login link.');
        return;
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created. You can sign in now.');
        setMode('signin');
        return;
      }

      // signin
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/'); // go back to the app
    } catch (e: any) {
      setErr(e?.message ?? 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{maxWidth: 420, margin: '60px auto', padding: 20}}>
      <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 10}}>Sign in</h1>
      <p style={{opacity: .75, marginBottom: 20}}>
        Use email + password or a one-click magic link.
      </p>

      <form onSubmit={handleSubmit} style={{display:'grid', gap:12}}>
        <label>Email
          <input
            type="email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:6}}
          />
        </label>

        {mode !== 'magic' && (
          <label>Password
            <input
              type="password"
              required={mode !== 'magic'}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:6}}
            />
          </label>
        )}

        <button
          disabled={busy}
          style={{padding:'10px 14px', borderRadius:8, border:'1px solid #111', background:'#111', color:'#fff'}}
        >
          {busy ? 'Working…' :
           mode === 'magic' ? 'Send magic link' :
           mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        {err && <div style={{color:'#b00020', padding:'8px 0'}}>{err}</div>}
        {msg && <div style={{color:'#0a7', padding:'8px 0'}}>{msg}</div>}
      </form>

      <div style={{display:'flex', gap:10, marginTop:16, fontSize:14}}>
        <button onClick={()=>setMode('signin')} style={{textDecoration: mode==='signin'?'underline':'none'}}>Sign in</button>
        <span>·</span>
        <button onClick={()=>setMode('signup')} style={{textDecoration: mode==='signup'?'underline':'none'}}>Sign up</button>
        <span>·</span>
        <button onClick={()=>setMode('magic')} style={{textDecoration: mode==='magic'?'underline':'none'}}>Magic link</button>
      </div>
    </main>
  );
}