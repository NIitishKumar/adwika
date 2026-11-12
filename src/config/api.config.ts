import { showToast } from './toast.config';
import { getAuthToken, clearAuthSession } from './auth.config';

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
 *
 * Automatically handles:
 * 1. Offline / Network error -> shows Toast "No internet connection..."
 * 2. 401 Unauthorized -> shows Toast "Authentication token missing. Please log in.",
 *    clears auth session, and dispatches an 'adwika:unauthorized' event.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Check if browser is currently offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    showToast({
      type: 'error',
      title: 'No Internet Connection',
      message: 'Unable to connect to server. Please check your internet connection.',
    });
    throw new Error('No internet connection. Please check your network.');
  }

  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (error: any) {
    // Catch fetch/network errors (connection refused, DNS failure, dropped connection, offline)
    showToast({
      type: 'error',
      title: 'No Internet Connection',
      message: 'Unable to reach the server. Please check your internet connection.',
    });
    throw error;
  }

  // If server rejects with 401 Unauthorized
  if (response.status === 401) {
    clearAuthSession();

    let errorMessage = 'Authentication token missing. Please log in.';
    try {
      const cloned = response.clone();
      const body = await cloned.json();
      if (body?.message) {
        errorMessage = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // response body was not valid JSON
    }

    showToast({
      type: 'error',
      title: 'Unauthorized',
      message: errorMessage,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('adwika:unauthorized', { detail: { message: errorMessage } })
      );
    }
  }

  return response;
}
