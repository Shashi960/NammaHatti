import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserSession } from '@/types/auth';
import { getCurrentSession, verifySessionToken, getSessionCookieName } from './session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get(getSessionCookieName())?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function requireRole(allowedRoles: UserRole[], session: UserSession | null): { allowed: boolean; error?: string } {
  if (!session) {
    return { allowed: false, error: 'Unauthorized: Please log in' };
  }
  if (session.status === 'SUSPENDED') {
    return { allowed: false, error: 'Account suspended. Contact support.' };
  }
  if (!allowedRoles.includes(session.role)) {
    return { allowed: false, error: `Forbidden: Requires role ${allowedRoles.join(' or ')}` };
  }
  return { allowed: true };
}
