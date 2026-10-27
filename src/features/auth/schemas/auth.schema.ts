import { z } from 'zod';

export const phoneLoginSchema = z.object({
  countryCode: z.string().default('+91'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, 'Please enter the complete 6-digit OTP')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

export const emailLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
