import { put } from '@vercel/blob';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

function cleanKey(raw: string) {
  // strip leading slashes, spaces; collapse spaces; remove ../
  let key = raw.replace(/^\/*/, '').replace(/\s+/g, '-').replace(/\.\.(\/|\\)/g, '');
  // ensure we always put files under reports/
  if (!key.startsWith('reports/')) key = `reports/${key}`;
  // default extension
  if (!/\.(html?|htm)$/i.test(key)) key = `${key}.html`;
  return key;
}

export async function POST(req: NextRequest) {
  try {
    // --- shared secret (case-insensitive header) ---
    const headerNames = ['x-n8n-secret', 'X-N8N-Secret', 'x-N8N-Secret'];
    let provided = '';
    for (const h of headerNames) {
      const v = req.headers.get(h);
      if (v) { provided = v; break; }
    }
    const expected = process.env.N8N_SHARED_SECRET;
    if (!expected) {
      return new Response(JSON.stringify({ error: 'Server misconfigured: N8N_SHARED_SECRET is not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!provided || provided !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized: bad or missing x-n8n-secret' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- filename from query ---
    const url = new URL(req.url);
    const rawFilename = url.searchParams.get('filename') || `report-${Date.now()}.html`;
    const key = cleanKey(rawFilename);

    // --- read body (allow any text/* but prefer text/html) ---
    const ct = req.headers.get('content-type') || '';
    if (!/^text\/html/i.test(ct)) {
      // We’ll still accept it, but this helps you see misconfig quickly.
      // If you want to hard-fail, turn this into a 415.
      // return new Response(JSON.stringify({ error: `Unsupported Content-Type: ${ct}` }), { status: 415 });
    }
    const html = await req.text();

    if (!html || html.trim() === '') {
      return new Response(JSON.stringify({ error: 'Empty body: expected HTML string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- store in Vercel Blob ---
    const { url: publicUrl } = await put(key, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      token: process.env.REPORTS_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      cacheControlMaxAge: 3600,
    });

    return new Response(JSON.stringify({ ok: true, url: publicUrl, key }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}