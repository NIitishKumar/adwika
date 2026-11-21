import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { ArrowRight, Mail, CheckCircle2, RotateCcw, AlertCircle, Bell, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  emailLoginSchema,
  otpVerificationSchema,
  EmailLoginFormData,
  OtpVerificationFormData,
} from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { AuthUser } from '../types/auth.types';
import { saveAuthSession } from '@/config/auth.config';
import { stockNotificationApi, StockNotification } from '@/services/stockNotification';

interface LoginFormProps {
  onSuccess: (user: AuthUser) => void;
  onClose?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

type AuthStep = 'email' | 'otp';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onClose,
  currentUser,
  onLogout,
}) => {
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [emailForOtp, setEmailForOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Subscriptions state for logged-in user
  const [subscriptions, setSubscriptions] = useState<StockNotification[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState<boolean>(false);
  const [showSubscriptions, setShowSubscriptions] = useState<boolean>(false);
  const [unsubscribingId, setUnsubscribingId] = useState<string | null>(null);

  // Fetch subscriptions when user is logged in
  useEffect(() => {
    if (currentUser?.email) {
      setIsLoadingSubs(true);
      stockNotificationApi
        .getMySubscriptions(currentUser.email)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setSubscriptions(res.data);
          }
        })
        .catch(() => {
          setSubscriptions([]);
        })
        .finally(() => {
          setIsLoadingSubs(false);
        });
    }
  }, [currentUser?.email]);

  const handleCancelSub = async (sub: StockNotification) => {
    if (!currentUser?.email) return;
    setUnsubscribingId(sub.id);
    try {
      await stockNotificationApi.unsubscribe({
        email: currentUser.email,
        productId: sub.productId,
        variantId: sub.variantId,
      });
      setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id));
    } catch {
      // Ignored
    } finally {
      setUnsubscribingId(null);
    }
  };

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStep === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [authStep, countdown]);

  // Handle email submit -> calls backend API POST /api/v1/users/send-otp
  const handleEmailSubmit = async (
    values: EmailLoginFormData,
    { setSubmitting, setFieldError }: FormikHelpers<EmailLoginFormData>
  ) => {
    setSubmitting(true);
    setServerError(null);

    try {
      await authService.sendOtp(values.email);
      setEmailForOtp(values.email);
      setCountdown(30);
      setAuthStep('otp');
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP. Please try again.';
      setServerError(message);
      setFieldError('email', message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resending OTP via backend API
  const handleResendOtp = async () => {
    if (!emailForOtp || isResending) return;
    setIsResending(true);
    setServerError(null);

    try {
      await authService.sendOtp(emailForOtp);
      setCountdown(30);
    } catch (err: any) {
      setServerError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP verification -> calls backend API POST /api/v1/users/verify-otp
  const handleOtpSubmit = async (
    values: OtpVerificationFormData,
    { setSubmitting, setFieldError }: FormikHelpers<OtpVerificationFormData>
  ) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const response = await authService.verifyOtp(emailForOtp, values.otp);
      const { user, token } = response.data;

      // Persist session to sessionStorage with 2-day expiry
      saveAuthSession(user, token);

      setSuccessToast('Verification successful. Welcome to Adwika!');
      setTimeout(() => {
        onSuccess(user);
        if (onClose) onClose();
      }, 900);
    } catch (err: any) {
      const message = err.message || 'Invalid OTP. Please try again.';
      setServerError(message);
      setFieldError('otp', message);
    } finally {
      setSubmitting(false);
    }
  };

  // If already logged in, show user details
  if (currentUser) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#fcfbfa] text-neutral-900 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#f4ede4] border border-[#e2d6c7] flex items-center justify-center text-[#54382c] mb-4">
          <span className="font-serif text-2xl font-light">
            {currentUser.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="font-serif text-2xl text-neutral-900 tracking-wide font-normal mb-1">
          {currentUser.email.split('@')[0]}
        </h3>
        <p className="text-xs text-neutral-500 font-sans mb-6">
          {currentUser.email}
        </p>

        <div className="w-full max-w-sm bg-[#faf8f5] border border-[#e8e4dc] p-5 text-left mb-6 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Account Status</span>
            <span className="font-medium text-[#54382c] tracking-wider uppercase">
              {currentUser.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Role</span>
            <span className="text-neutral-700 capitalize">
              {currentUser.role.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Restock Alerts Section */}
        <div className="w-full max-w-sm bg-[#faf8f5] border border-[#e8e4dc] p-4 text-left mb-6">
          <button
            type="button"
            onClick={() => setShowSubscriptions(!showSubscriptions)}
            className="w-full flex items-center justify-between text-xs text-neutral-800 font-medium"
          >
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-[#54382c]" />
              <span>Restock Alerts</span>
              <span className="px-1.5 py-0.2 bg-[#f4ede4] text-[#54382c] rounded text-[10px] font-mono">
                {subscriptions.length}
              </span>
            </div>
            {showSubscriptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showSubscriptions && (
            <div className="mt-3 pt-3 border-t border-[#e8e4dc] space-y-2 max-h-48 overflow-y-auto">
              {isLoadingSubs ? (
                <div className="flex items-center justify-center py-3 text-neutral-400 text-xs gap-2">
                  <Loader2 size={13} className="animate-spin text-neutral-500" />
                  <span>Loading alerts...</span>
                </div>
              ) : subscriptions.length === 0 ? (
                <p className="text-[11px] text-neutral-500 py-1 text-center font-sans">
                  No active restock alerts.
                </p>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-2.5 bg-white border border-[#eae6df] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-serif text-neutral-900 truncate">
                        {sub.product?.name || 'Heirloom Garment'}
                      </p>
                      {(sub.variant?.color || sub.variant?.size) && (
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {sub.variant.color && `${sub.variant.color} `}
                          {sub.variant.size && `· ${sub.variant.size}`}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={unsubscribingId === sub.id}
                      onClick={() => handleCancelSub(sub)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Cancel restock alert"
                      aria-label="Cancel alert"
                    >
                      {unsubscribingId === sub.id ? (
                        <Loader2 size={13} className="animate-spin text-neutral-500" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full max-w-sm py-3 text-xs tracking-widest uppercase text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-500 transition-colors bg-white font-medium"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 w-full max-w-4xl bg-[#fcfbfa] shadow-2xl overflow-hidden border border-[#e8e4dc]">
      {/* LEFT COLUMN: Editorial uruli still life */}
      <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 overflow-hidden min-h-[580px] select-none">
        <img
          src="/images/login-uruli.jpg"
          alt="Adwika Heritage Uruli with Jasmine"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/50" />
        <div className="relative z-10" />
        <div className="relative z-10 text-center flex flex-col items-center px-4">
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-10 w-auto object-contain mix-blend-screen filter contrast-125 brightness-110 mb-4"
          />
          <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-200/90 font-sans font-light leading-relaxed">
            MORE THAN FASHION<br />
            A STORY OF YOU
          </p>
        </div>
        <div className="relative z-10 text-center pt-6 border-t border-white/20">
          <p className="text-[9px] tracking-[0.25em] uppercase text-neutral-300 font-mono">
            TRADITION &nbsp;|&nbsp; CRAFT &nbsp;|&nbsp; CONTEMPORARY
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-[#fcfbfa] text-neutral-900">
        {/* Close Button if modal */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-800 transition-colors p-1"
            aria-label="Close dialog"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        )}

        {/* Success toast */}
        {successToast ? (
          <div className="my-auto py-12 text-center flex flex-col items-center justify-center animate-fadeIn">
            <CheckCircle2 size={48} className="text-[#54382c] mb-3 animate-bounce" />
            <p className="font-serif text-xl text-neutral-900 mb-1">
              {successToast}
            </p>
            <p className="text-xs text-neutral-500 font-sans">
              Connecting you to your sanctuary...
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-8">
              <span className="font-serif italic text-2xl text-[#8d674f] block leading-none mb-1">
                Welcome
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#231f1d] font-normal tracking-tight">
                {authStep === 'email'
                  ? 'Login to Adwika'
                  : 'Enter Verification Code'}
              </h2>
              <p className="text-xs sm:text-sm text-[#6e6863] font-sans font-light mt-2 leading-relaxed">
                {authStep === 'email'
                  ? 'Enter your email address to receive a one-time password (OTP).'
                  : `Enter the 6-digit OTP sent to ${emailForOtp}`}
              </p>
            </div>

            {/* 1. Email Step */}
            {authStep === 'email' && (
              <Formik<EmailLoginFormData>
                initialValues={{ email: '' }}
                validate={validateWithZod(emailLoginSchema)}
                onSubmit={handleEmailSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    {serverError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0 text-red-500" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#4a4541] mb-2 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="flex border border-[#dfdad2] bg-[#faf8f5] focus-within:border-[#54382c] transition-colors shadow-inner">
                        <div className="flex items-center px-3.5 py-3 border-r border-[#dfdad2] text-neutral-500">
                          <Mail size={16} />
                        </div>
                        <Field
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 font-sans"
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-xs text-red-600 mt-1 font-sans"
                      />
                    </div>

                    {/* SEND OTP Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#54382c] hover:bg-[#3e271d] text-white py-3.5 px-6 text-xs tracking-widest uppercase font-sans font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'SENDING OTP...' : 'SEND OTP'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </Form>
                )}
              </Formik>
            )}

            {/* 2. OTP Verification Step */}
            {authStep === 'otp' && (
              <Formik<OtpVerificationFormData>
                initialValues={{ otp: '' }}
                validate={validateWithZod(otpVerificationSchema)}
                onSubmit={handleOtpSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6 animate-fadeIn">
                    {serverError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0 text-red-500" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#4a4541] mb-2 uppercase tracking-wider">
                        6-Digit OTP
                      </label>
                      <Field
                        type="text"
                        name="otp"
                        placeholder="••••••"
                        maxLength={6}
                        autoFocus
                        className="w-full border border-[#dfdad2] bg-[#faf8f5] px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-neutral-900 outline-none focus:border-[#54382c] transition-colors"
                      />
                      <ErrorMessage
                        name="otp"
                        component="p"
                        className="text-xs text-red-600 mt-1 font-sans"
                      />
                    </div>

                    {/* Verify button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#54382c] hover:bg-[#3e271d] text-white py-3.5 px-6 text-xs tracking-widest uppercase font-sans font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'VERIFYING...' : 'CONFIRM & LOGIN'}</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Resend & Change Email */}
                    <div className="flex items-center justify-between text-xs text-[#6e6863] pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setServerError(null);
                          setAuthStep('email');
                        }}
                        className="hover:text-neutral-900 transition-colors underline underline-offset-4"
                      >
                        Change Email
                      </button>

                      {countdown > 0 ? (
                        <span className="font-mono text-neutral-500">
                          Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="text-[#54382c] font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          <RotateCcw size={12} className={isResending ? 'animate-spin' : ''} />
                          <span>{isResending ? 'Sending...' : 'Resend OTP'}</span>
                        </button>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        )}

        {/* Footer Legal Terms */}
        <div className="mt-8 pt-4 border-t border-[#e8e4dc] text-center">
          <p className="text-[11px] text-[#7d7770] font-sans leading-relaxed">
            By continuing, you agree to our{' '}
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="text-[#4a4541] underline underline-offset-2 hover:text-[#231f1d]"
            >
              Terms of Use
            </a>{' '}
            and{' '}
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="text-[#4a4541] underline underline-offset-2 hover:text-[#231f1d]"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
