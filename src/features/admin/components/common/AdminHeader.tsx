import React from 'react';
import { Menu, ShieldCheck, Home, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  breadcrumbs?: { label: string; to?: string }[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  breadcrumbs = [{ label: 'Admin', to: '/admin' }, { label: 'Fit Sizes' }],
}) => {
  const { isLight, toggleTheme } = useAdminTheme();

  return (
    <header
      className={cn(
        'h-16 px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-30 flex items-center justify-between backdrop-blur-md transition-colors duration-200',
        isLight
          ? 'bg-white/95 border-[#e8e4de]'
          : 'bg-[#0f0e0d]/95 border-[#26221f]'
      )}
    >
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={cn(
            'lg:hidden p-2 rounded transition-colors',
            isLight
              ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          )}
          aria-label="Open navigation sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/"
            className={cn(
              'transition-colors flex items-center gap-1',
              isLight
                ? 'text-neutral-500 hover:text-[#8b633b]'
                : 'text-neutral-500 hover:text-[#c9a87c]'
            )}
          >
            <Home size={13} />
            <span className="hidden sm:inline">Store</span>
          </Link>
          <span className={isLight ? 'text-neutral-300' : 'text-neutral-600'}>/</span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className={cn(
                      'transition-colors uppercase tracking-wider',
                      isLight
                        ? 'text-neutral-500 hover:text-neutral-800'
                        : 'text-neutral-500 hover:text-neutral-300'
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'uppercase tracking-wider font-semibold',
                      isLight ? 'text-[#8b633b]' : 'text-[#c9a87c]'
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <span className={isLight ? 'text-neutral-300' : 'text-neutral-600'}>/</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Theme Toggle Button & Admin Patron Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border cursor-pointer select-none',
            isLight
              ? 'bg-[#fbf9f6] hover:bg-[#f5efe8] text-neutral-800 border-[#e8e4de] hover:border-[#d6c4b2] shadow-2xs'
              : 'bg-[#181615] hover:bg-[#24201c] text-[#c9a87c] border-[#332e29] hover:border-[#c9a87c]/60 shadow-2xs'
          )}
        >
          {isLight ? (
            <>
              <Moon size={14} className="text-[#54382c]" />
              <span className="hidden sm:inline text-[11px] font-medium tracking-wide">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={14} className="text-[#c9a87c]" />
              <span className="hidden sm:inline text-[11px] font-medium tracking-wide">Light Mode</span>
            </>
          )}
        </button>

        {/* Master Console Badge */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs shadow-xs transition-colors',
            isLight
              ? 'bg-[#fbf9f6] border-[#e8e4de] text-neutral-700'
              : 'bg-[#141210] border-[#2e2620] text-neutral-300'
          )}
        >
          <ShieldCheck
            size={14}
            className={isLight ? 'text-[#8b633b]' : 'text-[#c9a87c]'}
          />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            Adwika Master Console
          </span>
        </div>

        {/* User Avatar */}
        <div
          className={cn(
            'w-8 h-8 rounded-full border flex items-center justify-center font-serif text-sm font-medium shadow-xs transition-colors',
            isLight
              ? 'bg-[#f5efe8] border-[#d6c4b2] text-[#54382c]'
              : 'bg-[#29221b] border-[#4a3a2c] text-[#c9a87c]'
          )}
        >
          A
        </div>
      </div>
    </header>
  );
};
