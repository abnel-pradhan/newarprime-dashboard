import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // 1. If user is NOT logged in, block access to these pages:
  if (!session && (
      req.nextUrl.pathname.startsWith('/dashboard') || 
      req.nextUrl.pathname.startsWith('/profile') || 
      req.nextUrl.pathname.startsWith('/settings') ||
      req.nextUrl.pathname.startsWith('/leaderboard') ||
      req.nextUrl.pathname.startsWith('/admin') ||
      req.nextUrl.pathname.startsWith('/courses')
  )) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. If user IS logged in, don't let them see Login/Register again
  if (session && (
      req.nextUrl.pathname === '/login' || 
      req.nextUrl.pathname === '/register'
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*', 
    '/settings/:path*', 
    '/leaderboard/:path*',
    '/admin/:path*', 
    '/courses/:path*',
    '/login',
    '/register'
  ],
};