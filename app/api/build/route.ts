import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing "prompt"' }, { status: 400 });
    }

    const url = process.env.N8N_WEBHOOK_URL;
    const secret = process.env.N8N_SHARED_SECRET || '';

    if (!url) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK_URL is not configured on the server' },
        { status: 500 }
      );
    }

    // Build the payload your n8n Webhook node expects.
    // Adjust keys if your workflow uses different field names.
    const payload = {
      question: prompt,        // ← your workflow’s main input
      source: 'web',           // optional metadata
      ts: Date.now(),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': secret, // match your Webhook node “Header Auth”
      },
      body: JSON.stringify(payload),
      // If your webhook responds immediately and the workflow continues,
      // you’ll still get a JSON body here. Ideally include html_url in the response.
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || 'n8n returned an error', details: data },
        { status: res.status }
      );
    }

    // Return a normalized shape the UI understands.
    return NextResponse.json({
      success: true,
      html_url: data?.html_url || data?.url || data?.report_url, // try common keys
      filename: data?.filename,
      message: data?.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}