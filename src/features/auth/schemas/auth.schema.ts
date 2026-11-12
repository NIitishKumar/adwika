import { z } from 'zod';

export const emailLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(6, 'Please enter the complete 6-digit OTP')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;
