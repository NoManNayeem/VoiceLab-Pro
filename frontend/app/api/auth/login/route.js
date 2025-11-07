import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// For server-side API routes in Docker, use the service name 'backend'
// For client-side, NEXT_PUBLIC_API_URL will be used (which should be localhost:8000)
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/login
 * Proxy login request to backend and set cookie
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Call backend login endpoint
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Login failed' },
        { status: response.status }
      );
    }

    // Set HTTP-only cookie with the access token
    const cookieStore = await cookies();
    cookieStore.set('access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data (without token in response body for security)
    return NextResponse.json({
      user: data.user,
      message: data.message,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

