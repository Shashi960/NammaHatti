import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole, UserSession } from '@/types/auth';

const SECRET_KEY = process.env.JWT_SECRET || 'localmesh-dev-secret-super-secure-key-at-least-32-chars-long!';
const encodedKey = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = 'lm_session';

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}
