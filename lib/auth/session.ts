import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { User, UserRole } from '@/db/schema/users';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'your-secret-key-min-32-characters-long'
);

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds
const COOKIE_NAME = 'session';

export interface SessionPayload {
  userId: string;
  role: UserRole;
  expiresAt: Date;
}

/**
 * Create a JWT token
 */
async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ... payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET_KEY);
}

/**
 * Verify and decode a JWT token
 */
async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a new session for a user
 */
export async function createSession(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  const payload:  SessionPayload = {
    userId: user.id,
    role: user.role,
    expiresAt,
  };

  const token = await createToken(payload);

  // Store session in database
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: token, // In production, hash this
    expiresAt,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Verify session from request (for middleware)
 */
export async function verifySession(
  request: NextRequest
): Promise<{ user: User } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  // Check if session is expired
  if (new Date(payload.expiresAt) < new Date()) {
    return null;
  }

  // Get user from database
  const [user] = await db
    . select()
    .from(users)
    .where(and(eq(users.id, payload.userId), eq(users.isActive, true)))
    .limit(1);

  if (!user) {
    return null;
  }

  return { user };
}

/**
 * Get current user from cookies (for server components)
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  if (new Date(payload.expiresAt) < new Date()) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, payload.userId), eq(users.isActive, true)))
    .limit(1);

  return user || null;
}

/**
 * Get session payload without DB lookup (for quick checks)
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Destroy current session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    // Remove from database
    await db.delete(sessions).where(eq(sessions.tokenHash, token));
  }

  // Clear cookie
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Refresh session (extend expiration)
 */
export async function refreshSession(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await destroySession();
    await createSession(user);
  }
}