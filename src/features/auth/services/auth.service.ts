import {
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '../types/auth.types';
import { API_BASE_URL } from '@/config/api.config';

export const authService = {
  /**
   * Request an OTP for email login
   * POST /api/v1/users/send-otp
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    const payload: SendOtpPayload = { email: email.trim() };

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
  },

  /**
   * Verify OTP and receive JWT cookie + token
   * POST /api/v1/users/verify-otp
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const payload: VerifyOtpPayload = { email: email.trim(), otp: otp.trim() };

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
  },
};
