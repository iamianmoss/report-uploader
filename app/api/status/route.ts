import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const request_id = req.nextUrl.searchParams.get('request_id');
  if (!request_id) {
    return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
  }

  // Public blob url — Vercel Blob serves it on the same domain
  const url = `https://${req.headers.get('host')}/statuses/${encodeURIComponent(request_id)}.json`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ ready: false }, { status: 200 });
  }
  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}