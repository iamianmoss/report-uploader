// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'ss-session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public assets, favicon, Next internals, and the auth endpoints/pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/upload') // allow programmatic access (we’ll still check header inside the route)
  ) {
    return NextResponse.next();
  }

  // check session cookie
  const session = req.cookies.get(COOKIE)?.value;
  if (session === 'ok') {
    return NextResponse.next();
  }

  // not logged in → redirect to /login?next=<original>
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname || '/');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api/.*).*)', '/api/upload'], // run on all pages and upload API (upload still checks header)
};
