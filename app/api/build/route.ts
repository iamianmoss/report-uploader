// app/api/build/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const CORS = {
  'Access-Control-Allow-Origin': '*', // or lock to 'https://selectstart.ai'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-n8n-secret',
  'Cache-Control': 'no-store',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = (body?.prompt ?? '').toString().trim();
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing "prompt"' },
        { status: 400, headers: CORS }
      );
    }

    // ---- call n8n webhook (keep your existing logic here) ----
    const url = process.env.N8N_WEBHOOK_URL!;
    const secret = process.env.N8N_SHARED_SECRET!;

    const payload = {
      prompt,
      source: 'web',
      ts: Date.now(),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': secret,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || 'n8n returned an error', details: data, status: res.status },
        { status: res.status, headers: CORS }
      );
    }

    // normalize common keys your UI expects
    return NextResponse.json(
      {
        success: true,
        html_url: data.html_url || data.url || data.report_url,
        filename: data.filename,
        message: data.message,
      },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown server error' },
      { status: 500, headers: CORS }
    );
  }
}