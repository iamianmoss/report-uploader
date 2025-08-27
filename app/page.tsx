'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type BuildResponse = {
  success?: boolean;
  html_url?: string;
  filename?: string;
  message?: string;
  error?: string;
};

export default function Page() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<BuildResponse | null>(null);

  // 🔑 Supabase session check (this is the “inside your component” part)
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login'); // redirect to login if no session
      }
    };
    checkSession();
  }, [router]);

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
      setResult({ error: 'Unknown server error' });
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your problem or idea"
      />
      <button type="submit">Build Report</button>
    </form>
  );
}