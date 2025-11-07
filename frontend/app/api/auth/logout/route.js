import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// For server-side API routes in Docker, use the service name 'backend'
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/logout
 * Proxy logout request to backend and clear cookie
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Call backend logout endpoint if token exists
    if (accessToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `access_token=${accessToken}`,
          },
        });
      } catch (error) {
        // Continue even if backend call fails
        console.error('Backend logout error:', error);
      }
    }

    // Clear the cookie
    cookieStore.delete('access_token');

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

