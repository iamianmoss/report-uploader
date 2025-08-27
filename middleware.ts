import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const PUBLIC_PATHS = [
  '/login',
  '/api/build',             // your n8n kickoff
  '/api/build/complete',    // n8n callback
  '/api/build/result',      // UI polling (if used)
  '/api/upload',            // if n8n uploads HTML here
  '/favicon.ico','/robots.txt','/sitemap.xml'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public + Next internals
  if (
    pathname.startsWith('/_next/') ||
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  ) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  if (session) return res;

  // no session → redirect to login
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!_next/static|_next/image|assets).*)'] };