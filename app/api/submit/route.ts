import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // send to n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL!;
    const n8nSecret = process.env.N8N_SHARED_SECRET!;

    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-shared-secret": n8nSecret,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return NextResponse.json({ reportId: data.id || "unknown" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
