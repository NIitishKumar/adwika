import type { AuthUser } from '@/features/auth/types/auth.types';

const AUTH_SESSION_KEY = 'adwika_auth_session';

/** 2 days in milliseconds */
const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000;

interface AuthSession {
  user: AuthUser;
  token: string;
  /** Unix-ms timestamp when this session expires */
  expiresAt: number;
}

/**
 * Persist the auth session into sessionStorage with a 2-day expiration.
 */
export function saveAuthSession(user: AuthUser, token: string): void {
  const session: AuthSession = {
    user,
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

/**
 * Retrieve the stored auth session if it exists and has not expired.
 * Returns `null` if missing or expired (and clears stale data).
 */
export function getAuthSession(): AuthSession | null {
  const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return null;

  try {
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearAuthSession();
      return null;
    }
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

/**
 * Check whether the user is currently logged in (valid, non-expired session).
 */
export function isLoggedIn(): boolean {
  return getAuthSession() !== null;
}

/**
 * Get the current authenticated user, or `null` if not logged in.
 */
export function getCurrentUser(): AuthUser | null {
  return getAuthSession()?.user ?? null;
}

/**
 * Get the stored JWT token, or `null` if not logged in.
 */
export function getAuthToken(): string | null {
  return getAuthSession()?.token ?? null;
}

/**
 * Clear the auth session (logout).
 */
export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

