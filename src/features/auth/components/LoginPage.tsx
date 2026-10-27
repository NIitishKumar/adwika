import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  currentUser: { name: string; email?: string; phone?: string } | null;
  onLoginSuccess: (user: { name: string; email?: string; phone?: string }) => void;
  onLogout: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-neutral-900 pt-24 pb-16 px-4 sm:px-6 md:px-8 flex flex-col justify-between items-center relative">
      {/* Top back navigation */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-600 hover:text-neutral-950 transition-colors font-sans"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Current brand logo display in light theme */}
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer flex flex-col items-center"
        >
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-8 w-auto object-contain invert contrast-200"
          />
        </div>

        <div className="w-12" />
      </div>

      {/* Main Login Card matching prototype in light theme */}
      <div className="w-full max-w-4xl my-auto flex justify-center animate-fadeIn">
        <LoginForm
          currentUser={currentUser}
          onSuccess={onLoginSuccess}
          onLogout={onLogout}
          onClose={() => navigate('/')}
        />
      </div>

      {/* Footer subtle imprint */}
      <div className="pt-8 text-center text-[10px] tracking-widest uppercase text-neutral-400 font-mono">
        ADWIKA · CONTEMPORARY INDIAN DESIGN · HEIRLOOMS
      </div>
    </div>
  );
};
