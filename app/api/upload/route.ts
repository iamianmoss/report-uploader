import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function handleUpload(req: NextRequest) {
  try {
    const filenameParam =
      new URL(req.url).searchParams.get('filename') ||
      `report-${Date.now()}.html`;

    let key = filenameParam.replace(/^\/+/, '');
    if (!key.startsWith('reports/')) key = `reports/${key}`;

    const html = await req.text();

    const { url } = await put(key, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
      token: process.env.REPORTS_READ_WRITE_TOKEN,
      cacheControlMaxAge: 3600
    });

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Upload failed', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: NextRequest) { return handleUpload(req); }
export async function PUT(req: NextRequest)  { return handleUpload(req); }
export async function OPTIONS()              { return new Response(null, { status: 200 }); }
