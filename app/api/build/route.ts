import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const url = process.env.N8N_WEBHOOK_URL!;
    const secret = process.env.N8N_SHARED_SECRET!;
    if (!url || !secret) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // fire-and-forget with a short timeout so we return fast
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 5000);

    // send minimal payload; n8n will do the heavy work and callback later
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': secret,
      },
      body: JSON.stringify({
        prompt,
        source: 'web',
        ts: Date.now(),
      }),
      signal: ac.signal,
    }).catch(() => { /* ignore: we just need to trigger */ });

    clearTimeout(t);

    // tell the UI we accepted the job
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch (err:any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}