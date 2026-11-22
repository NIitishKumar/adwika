import {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '../types/auth.types';
import { API_BASE_URL, authFetch } from '@/config/api.config';
import { clearAuthSession } from '@/config/auth.config';
import { showToast } from '@/config/toast.config';

export const authService = {
  /**
   * Request an OTP for email login
   * POST /api/v1/users/send-otp
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast({
        type: 'error',
        title: 'No Internet Connection',
        message: 'Unable to connect to server. Please check your internet connection.',
      });
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const payload: SendOtpPayload = { email: email.trim() };

    try {
      const response = await fetch(`${API_BASE_URL}/users/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
          'Failed to send OTP. Please check your email and try again.';
        throw new Error(errorMessage);
      }

      return data as SendOtpResponse;
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        showToast({
          type: 'error',
          title: 'No Internet Connection',
          message: 'Unable to reach the server. Please check your internet connection.',
        });
        throw new Error('No internet connection. Please check your network and try again.');
      }
      throw err;
    }
  },

  /**
   * Verify OTP and receive JWT cookie + token
   * POST /api/v1/users/verify-otp
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast({
        type: 'error',
        title: 'No Internet Connection',
        message: 'Unable to connect to server. Please check your internet connection.',
      });
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const payload: VerifyOtpPayload = { email: email.trim(), otp: otp.trim() };

    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: allows the browser to receive & store the HttpOnly Set-Cookie
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
          'Invalid OTP. Please try again.';
        throw new Error(errorMessage);
      }

      return data as VerifyOtpResponse;
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        showToast({
          type: 'error',
          title: 'No Internet Connection',
          message: 'Unable to reach the server. Please check your internet connection.',
        });
        throw new Error('No internet connection. Please check your network and try again.');
      }
      throw err;
    }
  },

  /**
   * Register with name, email, password, optional phone
   * POST /api/v1/users/signup (or /auth/signup)
   */
  async signup(payload: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
  }): Promise<any> {
    let response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to sign up.');
    }
    return data;
  },

  /**
   * Login with email or phone + password
   * POST /api/v1/users/login (or /auth/login)
   */
  async login(payload: {
    email?: string;
    phone?: string;
    password?: string;
  }): Promise<any> {
    let response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to log in.');
    }
    return data;
  },

  /**
   * Get current logged-in user profile
   * GET /api/v1/users/me (or /auth/me)
   */
  async getMe(): Promise<any> {
    let response = await authFetch(`${API_BASE_URL}/users/me`);
    if (response.status === 404) {
      response = await authFetch(`${API_BASE_URL}/auth/me`);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to fetch user profile.');
    }
    return data;
  },

  /**
   * Clear cookies & logout session
   * POST /api/v1/users/logout (or /auth/logout)
   */
  async logout(): Promise<void> {
    try {
      let response = await authFetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST',
      });
      if (response.status === 404) {
        await authFetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
        });
      }
    } catch {
      // Best-effort server notification
    } finally {
      clearAuthSession();
    }
  },
};
