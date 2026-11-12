/**
 * Adwika API Configuration
 * Centralized resolution of the API Base URL.
 * Automatically guarantees the '/api/v1' prefix is included,
 * avoiding duplicate prefixes (e.g. '/api/v1/api/v1') or missing prefixes.
 */
function resolveApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // If no environment variable is provided, default to local relative '/api/v1'
  if (!envUrl) {
    return '/api/v1';
  }

  // Remove trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, '');

  // If it already ends with '/api/v1', return it; otherwise append '/api/v1'
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Authenticated fetch wrapper for admin API calls.
 * Automatically injects `Authorization: Bearer <token>` and `credentials: 'include'`
 * (for the HttpOnly cookie) on every request.
 * Throws on 401 so callers can handle session expiry.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Lazy import to avoid circular dependency
  const { getAuthToken, clearAuthSession } = await import('@/config/auth.config');

  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  // If server rejects with 401, clear stale session
  if (response.status === 401) {
    clearAuthSession();
  }

  return response;
}
