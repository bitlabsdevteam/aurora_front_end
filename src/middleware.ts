import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.has('auth'); // You can replace this with your actual auth check
  const isLoginPage = request.nextUrl.pathname === '/';

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 