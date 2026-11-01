export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponseData {
  id: string;
  phone: string;
  isNewUser: boolean;
  otp?: string;
  expiresAt?: string;
}

export interface SendOtpResponse {
  message: string;
  data: SendOtpResponseData;
}

export interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}
