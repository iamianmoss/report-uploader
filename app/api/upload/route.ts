import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // get ?filename=... or fallback
    const filenameParam =
      new URL(req.url).searchParams.get('filename') ||
      `report-${Date.now()}.html`;

    // strip leading slashes
    let key = filenameParam.replace(/^\/+/, '');

    // force into reports/ namespace
    if (!key.startsWith('reports/')) {
      key = `reports/${key}`;
    }

    // read the HTML body from request
    const html = await req.text();

    // store into vercel blob
    const { url } = await put(key, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
      cacheControlMaxAge: 3600,
      token: process.env.REPORTS_READ_WRITE_TOKEN, // from Vercel env
    });

    // ✅ send JSON instead of forcing download
    return new Response(JSON.stringify({ url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Upload failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
