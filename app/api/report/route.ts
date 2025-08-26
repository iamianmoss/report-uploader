// app/api/report/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ ok: false, message: 'Missing "question" string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const webhook = process.env.N8N_WEBHOOK_URL;
    if (!webhook) {
      return new Response(
        JSON.stringify({ ok: false, message: 'N8N_WEBHOOK_URL not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // optional: only if you enabled Header Auth in the n8n Webhook node
        ...(process.env.N8N_SHARED_SECRET
          ? { 'x-n8n-secret': process.env.N8N_SHARED_SECRET }
          : {}),
      },
      body: JSON.stringify({ question }),
    });

    const text = await res.text();
    const ok = res.ok;

    return new Response(
      JSON.stringify({
        ok,
        status: res.status,
        statusText: res.statusText,
        n8nResponse: safelyParseJSON(text) ?? text,
      }),
      { status: ok ? 200 : 502, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, message: err?.message ?? 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// tiny helper so we don’t crash if n8n returns plain text
function safelyParseJSON(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
