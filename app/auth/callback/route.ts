import { NextRequest, NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/', req.url));
  const supabase = sbServer();

  // This reads the code/hash in the URL and sets cookies
  await supabase.auth.exchangeCodeForSession(req.url);
  return res;
}
