import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function handleUpload(req: NextRequest) {
  // --- Security: require secret header ---
  const headerSecret = req.headers.get('x-n8n-secret');
  if (!process.env.N8N_SHARED_SECRET || headerSecret !== process.env.N8N_SHARED_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // --- Parse filename from query string ---
    const filenameParam =
      new URL(req.url).searchParams.get('filename') ||
      `report-${Date.now()}.html`;

    // strip any leading slashes
    let key = filenameParam.replace(/^\/+/, '');
    // ensure it lives under "reports/"
    if (!key.startsWith('reports/')) key = `reports/${key}`;

    // --- Read HTML body ---
    const html = await req.text();

    // --- Upload to Blob store ---
    const { url } = await put(key, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
      cacheControlMaxAge: 3600,
      token: process.env.REPORTS_READ_WRITE_TOKEN, // Vercel provides this
    });

    // --- Return JSON with the blob URL ---
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// --- Support POST & PUT ---
export async function POST(req: NextRequest) {
  return handleUpload(req);
}
export async function PUT(req: NextRequest) {
  return handleUpload(req);
}
// --- Allow CORS preflight ---
export async function OPTIONS() {
  return new Response(null, { status: 200 });
}
