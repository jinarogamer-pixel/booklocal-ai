import { NextResponse, NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  /^\/(onboarding|analytics|admin|payments|chat|profile|dashboard|projects|providers)(\/|$)/
];

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const needsAuth = PROTECTED_ROUTES.some((re) => re.test(url.pathname));
  const hasToken = req.cookies.get('sb-access-token')?.value;

  // Add security headers
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (needsAuth && !hasToken) {
    const redirectTo = new URL('/signin', req.url);
    redirectTo.searchParams.set('next', url.pathname);
    return NextResponse.redirect(redirectTo);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next|api|assets|favicon.ico|hdr|textures|models).*)']
};
