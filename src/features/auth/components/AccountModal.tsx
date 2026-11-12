import React from 'react';
import { LoginForm } from './LoginForm';
import { AuthUser } from '../types/auth.types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
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
