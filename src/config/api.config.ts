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
