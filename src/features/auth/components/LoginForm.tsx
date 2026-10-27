import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ArrowRight, Lock, Phone, Mail, CheckCircle2, RotateCcw } from 'lucide-react';
import { validateWithZod } from '@/lib/validation/zod-formik';
import {
  phoneLoginSchema,
  otpVerificationSchema,
  emailLoginSchema,
  PhoneLoginFormData,
  OtpVerificationFormData,
  EmailLoginFormData,
} from '../schemas/auth.schema';

interface LoginFormProps {
  onSuccess: (user: { name: string; email?: string; phone?: string }) => void;
  onClose?: () => void;
  currentUser?: { name: string; email?: string; phone?: string } | null;
  onLogout?: () => void;
}

type AuthMode = 'phone' | 'otp' | 'email';


export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onClose,
  currentUser,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [phoneForOtp, setPhoneForOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Countdown timer for OTP
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [authMode, countdown]);

  // Handle phone submit -> generate mock OTP
  const handlePhoneSubmit = async (
    values: PhoneLoginFormData,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    setSubmitting(true);
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setPhoneForOtp(`${values.countryCode} ${values.phone}`);
    setCountdown(30);
    setAuthMode('otp');
  };

  // Handle OTP verification
  const handleOtpSubmit = async (
    values: OtpVerificationFormData,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);

    setSuccessToast('Verification successful. Welcome to Adwika!');
    setTimeout(() => {
      onSuccess({
        name: `Patron ${phoneForOtp.slice(-4)}`,
        phone: phoneForOtp,
      });
      if (onClose) onClose();
    }, 900);
  };

  // Handle Email login submit
  const handleEmailSubmit = async (
    values: EmailLoginFormData,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);

    const extractedName = values.email.split('@')[0];
    const formattedName =
      extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

    setSuccessToast(`Welcome back, ${formattedName}!`);
    setTimeout(() => {
      onSuccess({
        name: formattedName,
        email: values.email,
      });
      if (onClose) onClose();
    }, 900);
  };

  // If already logged in, show user patron details
  if (currentUser) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#fcfbfa] text-neutral-900 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#f4ede4] border border-[#e2d6c7] flex items-center justify-center text-[#54382c] mb-4">
          <span className="font-serif text-2xl font-light">
            {currentUser.name.charAt(0)}
          </span>
        </div>
        <h3 className="font-serif text-2xl text-neutral-900 tracking-wide font-normal mb-1">
          {currentUser.name}
        </h3>
        <p className="text-xs text-neutral-500 font-sans mb-6">
          {currentUser.phone || currentUser.email}
        </p>

        <div className="w-full max-w-sm bg-[#faf8f5] border border-[#e8e4dc] p-5 text-left mb-6 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Membership Tier</span>
            <span className="font-medium text-[#54382c] tracking-wider uppercase">
              Patrons Circle
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Concierge Access</span>
            <span className="text-neutral-700">Dedicated Priority</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500">Curated Dispatch</span>
            <span className="text-neutral-700">Insured Worldwide</span>
          </div>
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
      {/* LEFT COLUMN: Editorial uruli still life matching prototype */}
      <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 overflow-hidden min-h-[580px] select-none">
        {/* Background photo: vintage brass uruli with floating jasmine in haveli */}
        <img
          src="/images/login-uruli.jpg"
          alt="Adwika Heritage Uruli with Jasmine"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-105"
        />

        {/* Soft warm vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/50" />

        {/* Top spacer */}
        <div className="relative z-10" />

        {/* Center: Brand hallmark & tagline */}
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

        {/* Bottom Tagline verbatim from prototype */}
        <div className="relative z-10 text-center pt-6 border-t border-white/20">
          <p className="text-[9px] tracking-[0.25em] uppercase text-neutral-300 font-mono">
            TRADITION &nbsp;|&nbsp; CRAFT &nbsp;|&nbsp; CONTEMPORARY
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Light Theme Form matching prototype */}
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
            {/* Header Titles matching prototype */}
            <div className="mb-8">
              <span className="font-serif italic text-2xl text-[#8d674f] block leading-none mb-1">
                Welcome
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#231f1d] font-normal tracking-tight">
                {authMode === 'phone'
                  ? 'Login to Adwika'
                  : authMode === 'otp'
                  ? 'Enter Verification Code'
                  : 'Sign in with Email'}
              </h2>
              <p className="text-xs sm:text-sm text-[#6e6863] font-sans font-light mt-2 leading-relaxed">
                {authMode === 'phone'
                  ? 'Continue with your phone number to receive a one time password (OTP).'
                  : authMode === 'otp'
                  ? `Enter the 6-digit OTP sent to ${phoneForOtp}`
                  : 'Enter your email and password to access your curated heirlooms.'}
              </p>
            </div>

            {/* 1. Phone Number Step (Default from prototype) */}
            {authMode === 'phone' && (
              <Formik<PhoneLoginFormData>
                initialValues={{ countryCode: '+91', phone: '' }}
                validate={validateWithZod(phoneLoginSchema)}
                onSubmit={handlePhoneSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-[#4a4541] mb-2 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="flex border border-[#dfdad2] bg-[#faf8f5] focus-within:border-[#54382c] transition-colors shadow-inner">
                        {/* Fixed Indian Country Badge matching prototype */}
                        <div className="flex items-center gap-1.5 bg-transparent text-xs sm:text-sm font-sans px-3.5 py-3 border-r border-[#dfdad2] text-neutral-800 select-none">
                          <span className="text-base leading-none">🇮🇳</span>
                          <span className="font-medium">+91</span>
                        </div>

                        {/* Phone Number Input */}
                        <Field
                          type="tel"
                          name="phone"
                          placeholder="98765 43210"
                          maxLength={10}
                          className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 font-sans"
                        />
                      </div>
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-xs text-red-600 mt-1 font-sans"
                      />
                    </div>

                    {/* SEND OTP Button matching prototype: rich brown button with arrow */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#54382c] hover:bg-[#3e271d] text-white py-3.5 px-6 text-xs tracking-widest uppercase font-sans font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'SENDING OTP...' : 'SEND OTP'}</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* OR Divider */}
                    <div className="relative flex items-center justify-center my-6">
                      <div className="border-t border-[#e8e4dc] w-full" />
                      <span className="bg-[#fcfbfa] px-3 text-[10px] uppercase tracking-widest text-[#938d87] font-mono absolute">
                        OR
                      </span>
                    </div>

                    {/* CONTINUE WITH EMAIL Button matching prototype */}
                    <button
                      type="button"
                      onClick={() => setAuthMode('email')}
                      className="w-full bg-[#f8f6f2] hover:bg-[#efebe4] text-[#4a4541] hover:text-[#231f1d] border border-[#dfdad2] py-3 px-6 text-xs tracking-widest uppercase font-sans font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Lock size={13} className="text-[#8d674f]" />
                      <span>CONTINUE WITH EMAIL</span>
                    </button>
                  </Form>
                )}
              </Formik>
            )}

            {/* 2. OTP Verification Step */}
            {authMode === 'otp' && (
              <Formik<OtpVerificationFormData>
                initialValues={{ otp: '' }}
                validate={validateWithZod(otpVerificationSchema)}
                onSubmit={handleOtpSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6 animate-fadeIn">
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

                    {/* Resend & Change Number */}
                    <div className="flex items-center justify-between text-xs text-[#6e6863] pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('phone')}
                        className="hover:text-neutral-900 transition-colors underline underline-offset-4"
                      >
                        Change Phone
                      </button>

                      {countdown > 0 ? (
                        <span className="font-mono text-neutral-500">
                          Resend in 0:{countdown < 10 ? `0${countdown}` : countdown}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCountdown(30)}
                          className="text-[#54382c] font-medium hover:underline flex items-center gap-1"
                        >
                          <RotateCcw size={12} />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* 3. Email Login Step */}
            {authMode === 'email' && (
              <Formik<EmailLoginFormData>
                initialValues={{ email: '', password: '' }}
                validate={validateWithZod(emailLoginSchema)}
                onSubmit={handleEmailSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-5 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-medium text-[#4a4541] mb-1.5 uppercase tracking-wider">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        placeholder="client@adwika.in"
                        className="w-full border border-[#dfdad2] bg-[#faf8f5] px-4 py-3 text-sm text-neutral-900 outline-none focus:border-[#54382c] transition-colors"
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-xs text-red-600 mt-1 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#4a4541] mb-1.5 uppercase tracking-wider">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full border border-[#dfdad2] bg-[#faf8f5] px-4 py-3 text-sm text-neutral-900 outline-none focus:border-[#54382c] transition-colors"
                      />
                      <ErrorMessage
                        name="password"
                        component="p"
                        className="text-xs text-red-600 mt-1 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#54382c] hover:bg-[#3e271d] text-white py-3.5 px-6 text-xs tracking-widest uppercase font-sans font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'SIGNING IN...' : 'SIGN IN WITH EMAIL'}</span>
                      <ArrowRight size={14} />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('phone')}
                        className="text-xs text-[#54382c] hover:underline flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Phone size={12} />
                        <span>Sign in with Phone OTP instead</span>
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        )}

        {/* Footer Legal Terms matching prototype */}
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
