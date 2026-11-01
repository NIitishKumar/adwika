import { SendOtpPayload, SendOtpResponse } from '../types/auth.types';
import { API_BASE_URL } from '@/config/api.config';

export const authService = {
  /**
   * Request an OTP for phone login or user registration
   * POST /api/v1/users/send-otp
   */
  async sendOtp(phone: string): Promise<SendOtpResponse> {
    const payload: SendOtpPayload = { phone: phone.trim() };

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
        'Failed to process OTP request. Please check your phone number and try again.';
      throw new Error(errorMessage);
    }

    return data as SendOtpResponse;
  },
};
