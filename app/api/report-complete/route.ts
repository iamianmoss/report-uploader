import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('x-n8n-secret') || '';
    if (!process.env.N8N_SHARED_SECRET || auth !== process.env.N8N_SHARED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request_id, html_url, filename, message } = await req.json();
    if (!request_id || !html_url) {
      return NextResponse.json({ error: 'Missing request_id or html_url' }, { status: 400 });
    }

    const key = `statuses/${request_id}.json`;
    await put(
      key,
      JSON.stringify({
        ready: true,
        html_url,
        filename: filename || null,
        message: message || 'done',
        ts: Date.now(),
      }),
      {
        access: 'public',
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        token: process.env.REPORTS_READ_WRITE_TOKEN,
      }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}