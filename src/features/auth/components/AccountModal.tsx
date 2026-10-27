import React from 'react';
import { LoginForm } from './LoginForm';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email?: string; phone?: string } | null;
  onLoginSuccess: (user: { name: string; email?: string; phone?: string }) => void;
  onLogout: () => void;
}

/**
 * AccountModal — Light theme two-column modal matching the prototype screenshot:
 * Left: Uruli with jasmine blossoms & bilingual Adwika logo
 * Right: Light theme phone OTP login with "Welcome" cursive script and chocolate brown CTA
 */
export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fadeIn">
      {/* Atmospheric backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Content */}
      <div className="relative z-10 w-full max-w-4xl shadow-2xl animate-scaleIn">
        <LoginForm
          currentUser={currentUser}
          onSuccess={onLoginSuccess}
          onClose={onClose}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};
