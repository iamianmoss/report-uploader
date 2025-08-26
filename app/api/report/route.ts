import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return Response.json({ message: 'Missing question' }, { status: 400 });
    }

    const url = process.env.N8N_WEBHOOK_URL;          // PRODUCTION webhook URL
    const secret = process.env.N8N_SHARED_SECRET || ''; // same header you check in n8n (optional)

    if (!url) {
      return Response.json({ message: 'N8N_WEBHOOK_URL not set' }, { status: 500 });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-SS-Shared-Secret': secret } : {}),
      },
      body: JSON.stringify({ question }),
      // n8n cloud is HTTPS; no extra options needed
    });

    // Try to parse JSON, but also capture non-200s
    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch { /* not JSON */ }

    if (!res.ok) {
      return Response.json({ message: data?.message || text || 'n8n error' }, { status: res.status });
    }

    return Response.json(data ?? { ok: true });
  } catch (err: any) {
    return Response.json({ message: err?.message || 'Server error' }, { status: 500 });
  }
}
