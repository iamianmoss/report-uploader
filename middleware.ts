// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

// Paths that should skip auth middleware
const PUBLIC_PATHS = [
  '/login',
  '/api/build',     // UI -> n8n kick-off
  '/api/upload',    // n8n -> Vercel Blob
  '/report',        // your UI page
  '/favicon.ico',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths and static
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|txt)$/)
  ) {
    return NextResponse.next();
  }

  // Simple cookie gate (mirror your current check)
  const ok = req.cookies.get('app_auth')?.value === process.env.APP_PASSWORD;
  if (ok) return NextResponse.next();

  // Not authenticated → redirect to /login
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  // run on everything except the asset folder
  matcher: ['/((?!.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|txt)$).*)'],
};