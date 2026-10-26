import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Authentic Adwika Brand Logo component.
 * Uses the authentic brand insignia image with bilingual "Adwika | अद्विका"
 * and red bindi dot, optimized with mix-blend-screen for dark luxury aesthetics.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  variant = 'dark',
  showTagline = false,
  className = '',
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Height mappings for responsive, pixel-crisp display
  const heightClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9 md:h-10',
    md: 'h-11 sm:h-12 md:h-14',
    lg: 'h-16 sm:h-20 md:h-24',
    xl: 'h-20 sm:h-24 md:h-32',
  }[size];

  return (
    <div
      onClick={handleClick}
      className={`inline-flex flex-col items-center cursor-pointer group select-none transition-transform duration-300 ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Adwika Home"
    >
      <div className="relative flex items-center justify-center">
        <img
          src="/images/adwika-logo.png"
          alt="Adwika | अद्विका"
          className={`${heightClasses} w-auto object-contain filter contrast-125 brightness-105 transition-all duration-300 group-hover:brightness-125 group-hover:scale-[1.02] ${
            variant === 'light'
              ? 'invert contrast-200'
              : 'mix-blend-screen drop-shadow-[0_2px_12px_rgba(203,175,148,0.2)]'
          }`}
        />
      </div>

      {showTagline && (
        <span
          className={`text-[8px] md:text-[9px] tracking-[0.35em] uppercase font-sans mt-1 transition-opacity ${
            variant === 'light'
              ? 'text-neutral-500 group-hover:text-neutral-900'
              : 'text-adwika-sand/80 group-hover:text-adwika-sand'
          }`}
        >
          CONTEMPORARY INDIAN DESIGN
        </span>
      )}
    </div>
  );
};
