import { NextResponse } from 'next/server';

const COOKIE = 'ss-session';

export async function POST(req: Request) {
  const { password, next } = await req.json().catch(() => ({}));

  if (!process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'APP_PASSWORD not set' }, { status: 500 });
  }
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, redirectTo: next || '/' });
  // very simple session cookie
  res.cookies.set(COOKIE, 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
