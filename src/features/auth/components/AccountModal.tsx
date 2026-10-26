import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Modal, Button } from '@/components/ui';
import { FormikInput } from '@/components/common/fields';
import { validateWithZod } from '@/lib/validation/zod-formik';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '../schemas/auth.schema';
import { CheckCircle2, User } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string } | null;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (values: LoginFormData, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    // Simulated API call
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    const mockName = values.email.split('@')[0];
    onLoginSuccess({
      name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
      email: values.email,
    });
    setSuccessMessage(`Welcome back, ${mockName}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleRegisterSubmit = async (values: RegisterFormData, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    onLoginSuccess({
      name: values.fullName,
      email: values.email,
    });
    setSuccessMessage(`Account created for ${values.fullName}. Welcome to Adwika.`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser ? 'Client Profile' : tab === 'signin' ? 'Client Sign In' : 'Client Registration'}
      maxWidth="max-w-md"
    >
      {currentUser ? (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-adwika-sand">
            <User size={30} />
          </div>
          <div>
            <h3 className="font-serif text-lg tracking-wider text-neutral-100">{currentUser.name}</h3>
            <p className="text-xs text-neutral-400 font-sans">{currentUser.email}</p>
          </div>

          <div className="w-full bg-[#141418] border border-neutral-800 p-4 text-left my-2 text-xs flex flex-col gap-2">
            <div className="flex justify-between text-neutral-400">
              <span>Client Status</span>
              <span className="text-adwika-sand font-medium uppercase tracking-wider">Patron</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Saved Heirlooms</span>
              <span className="text-neutral-200">2 Items</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Concierge Service</span>
              <span className="text-neutral-200">Dedicated</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full mt-2"
          >
            Sign Out
          </Button>
        </div>
      ) : successMessage ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center animate-fadeIn">
          <CheckCircle2 size={44} className="text-adwika-sand" />
          <p className="text-sm font-serif text-neutral-200">{successMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Authentic Bilingual Logo with Red Dot */}
          <div className="flex justify-center pt-1 pb-2">
            <img
              src="/images/adwika-logo.png"
              alt="Adwika | अद्विका"
              className="h-9 w-auto object-contain mix-blend-screen"
            />
          </div>
          {/* Tabs */}
          <div className="flex border-b border-neutral-800">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest transition-all ${
                tab === 'signin'
                  ? 'border-b-2 border-adwika-sand text-white font-medium'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 pb-3 text-xs uppercase tracking-widest transition-all ${
                tab === 'register'
                  ? 'border-b-2 border-adwika-sand text-white font-medium'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {tab === 'signin' ? (
            <Formik<LoginFormData>
              initialValues={{ email: '', password: '' }}
              validate={validateWithZod(loginSchema)}
              onSubmit={handleLoginSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4">
                  <FormikInput
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    required
                  />
                  <FormikInput
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    required
                  />

                  <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded bg-neutral-900 border-neutral-700" />
                      <span>Remember credentials</span>
                    </label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="hover:text-adwika-sand underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    variant="filled"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full mt-3"
                  >
                    Sign In to Sanctuary
                  </Button>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik<RegisterFormData>
              initialValues={{ fullName: '', email: '', phone: '', password: '' }}
              validate={validateWithZod(registerSchema)}
              onSubmit={handleRegisterSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-3.5">
                  <FormikInput
                    name="fullName"
                    label="Full Name"
                    placeholder="Devi Sharma"
                    required
                  />
                  <FormikInput
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="devi@example.com"
                    required
                  />
                  <FormikInput
                    name="phone"
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    required
                  />
                  <FormikInput
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Create secure password"
                    required
                  />

                  <p className="text-[10px] text-neutral-500 mt-1">
                    By registering, you agree to receive private collection previews and bespoke bespoke trunkshow invitations.
                  </p>

                  <Button
                    type="submit"
                    variant="filled"
                    size="md"
                    isLoading={isSubmitting}
                    className="w-full mt-2"
                  >
                    Join The Patrons Circle
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      )}
    </Modal>
  );
};
