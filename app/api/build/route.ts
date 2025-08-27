import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing "prompt"' }, { status: 400 });
    }

    const webhook = process.env.N8N_WEBHOOK_URL;
    const secret  = process.env.N8N_SHARED_SECRET || '';
    if (!webhook || !secret) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Create a job id the UI can poll on
    const request_id = crypto.randomUUID();

    // (optional but nice) write a pending status blob now
    const key = `statuses/${request_id}.json`;
    await put(key, JSON.stringify({ ready: false, ts: Date.now(), prompt }), {
      access: 'public',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      token: process.env.REPORTS_READ_WRITE_TOKEN,
    });

    // Fire-and-forget call to n8n (do NOT await completion)
    fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': secret,
      },
      body: JSON.stringify({
        content: prompt,     // matches your n8n flow’s expected field
        request_id,
        source: 'web',
        ts: Date.now(),
      }),
    }).catch(() => { /* ignore */ });

    const status_url = `/api/status?request_id=${encodeURIComponent(request_id)}`;
    return NextResponse.json(
      { accepted: true, request_id, status_url },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}