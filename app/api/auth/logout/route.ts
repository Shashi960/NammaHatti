import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
