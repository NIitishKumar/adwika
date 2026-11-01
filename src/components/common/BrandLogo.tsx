import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  englishOnly?: boolean;
}

/**
 * Authentic Adwika Brand Logo component.
 * Displays "Adwika" in pure luxury typography, optimized with mix-blend modes
 * for both light and dark aesthetics.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  variant = 'dark',
  showTagline = false,
  className = '',
  onClick,
  englishOnly = true,
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
      <div
        className={`relative flex items-center justify-center overflow-hidden ${
          englishOnly ? 'shrink-0' : ''
        }`}
        style={englishOnly ? { aspectRatio: '2.25 / 1' } : undefined}
      >
        <img
          src="/images/adwika-logo.png"
          alt="Adwika"
          className={`${heightClasses} transition-all duration-300 group-hover:scale-[1.02] ${
            englishOnly ? 'h-full max-w-none w-auto object-left object-contain' : 'w-auto object-contain'
          } ${
            variant === 'light'
              ? 'filter invert grayscale contrast-175 mix-blend-multiply'
              : 'mix-blend-screen drop-shadow-[0_2px_12px_rgba(203,175,148,0.2)] brightness-110'
          }`}
          style={englishOnly ? { clipPath: 'inset(0 44% 0 0)' } : undefined}
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
