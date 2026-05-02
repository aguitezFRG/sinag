import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sinag-dev-secret-change-in-production'
);

export type UserRole = 'student' | 'adviser' | 'coordinator' | 'admin';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: TokenPayload): Promise<string> {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'sinag-dev-secret-change-in-production')
  ) {
    throw new Error('JWT_SECRET is not configured securely for production');
  }

  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${secure}`;
}

export function clearAuthCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secure}`;
}
