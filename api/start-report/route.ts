import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Minimal shape; pass through anything else you include in the UI
    const payload = {
      question: body.question ?? '',
      keywords: body.keywords ?? [],
      namespace: body.namespace ?? '',
      // add anything else your n8n flow expects here
    };

    // Fire n8n webhook
    const res = await fetch(process.env.N8N_WEBHOOK_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': process.env.N8N_SHARED_SECRET || '',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    // Bubble up n8n status & any urls it returns (html_url, url, etc.)
    return new Response(JSON.stringify({
      ok: res.ok,
      status: res.status,
      data,
    }), { status: res.ok ? 200 : res.status, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
