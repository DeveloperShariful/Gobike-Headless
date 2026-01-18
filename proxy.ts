//proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/constants';

/* --- Middleware Logic --- */
export function proxy(request: NextRequest) {
    
  const secretKey = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/account')) {
    console.log(`[MIDDLEWARE] Checking access for: ${pathname}`);
    console.log(`[MIDDLEWARE] Cookie Name: ${AUTH_COOKIE_NAME}`);
    console.log(`[MIDDLEWARE] Secret Key Found: ${secretKey ? 'YES' : 'NO'}`);
    
    if (!secretKey) {
      console.log(`[MIDDLEWARE] Access Denied -> Redirecting to Login`);
    } else {
      console.log(`[MIDDLEWARE] Access Granted`);
    }
  }
  // --- DEBUG LOG END ---

  if (pathname.startsWith('/account')) {
    if (!secretKey) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/* --- Matcher Config --- */
export const config = {
  matcher: ['/account/:path*'],
};