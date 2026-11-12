export interface SendOtpPayload {
  email: string;
}

export interface SendOtpResponseData {
  id: string;
  email: string;
  isNewUser: boolean;
  expiresAt?: string;
}

export interface SendOtpResponse {
  message: string;
  data: SendOtpResponseData;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface VerifyOtpResponseData {
  user: AuthUser;
  token: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: VerifyOtpResponseData;
}
