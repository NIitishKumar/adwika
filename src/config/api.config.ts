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

/**
 * Safely extracts an array of items from various backend response shapes:
 * 1. Array directly: [...]
 * 2. Nested pagination response: { data: { data: [...] } } (NestJS / Express paginated response)
 * 3. Standard response: { data: [...] }
 * 4. Named items: { data: { items: [...] } } or { data: { products: [...] } }
 * 5. Root items: { items: [...] } or { results: [...] }
 */
export function extractApiDataList<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data?.data?.data)) return json.data.data.data;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.data?.products)) return json.data.products;
  if (Array.isArray(json?.data?.categories)) return json.data.categories;
  if (Array.isArray(json?.data?.results)) return json.data.results;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.results)) return json.results;
  return [];
}

/**
 * Safely extracts a single entity object from various response shapes:
 * 1. Nested: { data: { data: { ... } } }
 * 2. Standard: { data: { ... } }
 * 3. Root: { ... }
 */
export function extractApiDataObject<T = any>(json: any): T | null {
  if (!json) return null;
  if (json?.data?.data && typeof json.data.data === 'object' && !Array.isArray(json.data.data)) {
    return json.data.data;
  }
  if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
    return json.data;
  }
  return json;
}

