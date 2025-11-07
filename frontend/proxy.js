import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy function for Next.js 16 App Router
 * Handles route protection and authentication redirects
 * 
 * Note: Authentication checks should also be implemented in components
 * and API routes for security. This proxy provides basic route protection.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/about'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth');
  
  // Check for access token in cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Protected routes
  const protectedRoutes = ['/providers', '/tts', '/stt'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If accessing a protected route without token, redirect to login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing login page while authenticated, redirect to providers
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/providers', request.url));
  }
  
  return NextResponse.next();
}

