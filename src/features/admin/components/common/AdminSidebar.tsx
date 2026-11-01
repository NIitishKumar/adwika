import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Scissors,
  Palette,
  Layers,
  Boxes,
  Images,
  FolderTree,
  FolderGit2,
  Tag,
  ArrowLeft,
  X,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { isLight, toggleTheme } = useAdminTheme();

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/products',
      label: 'Products Catalog',
      icon: Layers,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-variants',
      label: 'Product Variants',
      icon: Boxes,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-images',
      label: 'Product Images',
      icon: Images,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-attributes',
      label: 'Product Attributes',
      icon: Tag,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-categories',
      label: 'Product Categories',
      icon: FolderTree,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-sub-categories',
      label: 'Sub-Categories',
      icon: FolderGit2,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/fit-sizes',
      label: 'Fit Sizes',
      icon: Scissors,
      badge: 'Active CRUD',
    },
    {
      to: '/admin/product-colors',
      label: 'Product Colors',
      icon: Palette,
      badge: 'Active CRUD',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 border-r flex flex-col justify-between transition-all duration-300 ease-in-out',
          isLight
            ? 'bg-white border-[#e8e4de] shadow-xs'
            : 'bg-[#0f0e0d] border-[#26221f] shadow-lg',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top: Brand Hallmark */}
        <div>
          <div
            className={cn(
              'h-16 px-6 border-b flex items-center justify-between transition-colors',
              isLight ? 'border-[#e8e4de]' : 'border-[#26221f]'
            )}
          >
            <Link to="/admin" className="flex items-center group select-none py-1">
              <div
                className="relative h-9 sm:h-10 overflow-hidden flex items-center shrink-0"
                style={{ aspectRatio: '2.28 / 1' }}
              >
                <img
                  src="/images/adwika-logo.png"
                  alt="Adwika"
                  className={cn(
                    'h-full max-w-none w-auto object-left object-contain transition-all duration-200 group-hover:scale-105',
                    isLight
                      ? 'filter invert grayscale contrast-175 mix-blend-multiply'
                      : 'mix-blend-screen brightness-110'
                  )}
                  style={{ clipPath: 'inset(0 43% 0 0)' }}
                />
              </div>
            </Link>
            <button
              onClick={onClose}
              className={cn(
                'lg:hidden p-1 rounded transition-colors',
                isLight
                  ? 'text-neutral-500 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-white'
              )}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-4">
            <p
              className={cn(
                'px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-mono font-semibold',
                isLight ? 'text-neutral-400' : 'text-neutral-500'
              )}
            >
              Catalog Master
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2.5 rounded text-xs tracking-wider transition-all duration-150',
                        isActive
                          ? isLight
                            ? 'bg-[#f5efe8] text-[#54382c] font-medium border border-[#d6c4b2]'
                            : 'bg-[#29221b] text-[#c9a87c] font-medium border border-[#4d3a2b]'
                          : isLight
                          ? 'text-neutral-600 hover:text-neutral-900 hover:bg-[#f8f7f4]'
                          : 'text-neutral-400 hover:text-white hover:bg-[#1a1715]'
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={isLight ? 'text-[#8b633b]' : 'text-[#c9a87c]'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
                          isLight
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Theme Switch & Storefront Return */}
        <div
          className={cn(
            'p-4 border-t space-y-2.5 transition-colors',
            isLight ? 'border-[#e8e4de] bg-[#fdfcfb]' : 'border-[#26221f] bg-[#0c0b0a]'
          )}
        >
          {/* Theme Quick Switcher in Sidebar */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded text-xs transition-colors border shadow-2xs cursor-pointer',
              isLight
                ? 'bg-white hover:bg-[#f5efe8] text-neutral-700 border-[#e8e4de]'
                : 'bg-[#141210] hover:bg-[#1a1715] text-neutral-300 border-[#26221f]'
            )}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
          >
            <div className="flex items-center gap-2">
              {isLight ? (
                <>
                  <Moon size={14} className="text-[#54382c]" />
                  <span>Theme: Light</span>
                </>
              ) : (
                <>
                  <Sun size={14} className="text-[#c9a87c]" />
                  <span>Theme: Dark</span>
                </>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded',
                isLight ? 'bg-[#f5efe8] text-[#54382c]' : 'bg-[#241c16] text-[#c9a87c]'
              )}
            >
              Toggle
            </span>
          </button>

          {/* Storefront Link */}
          <Link
            to="/"
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded text-xs transition-colors border shadow-2xs',
              isLight
                ? 'text-neutral-700 hover:text-neutral-900 bg-white hover:bg-[#f5efe8] border-[#e8e4de]'
                : 'text-neutral-300 hover:text-white bg-[#141210] hover:bg-[#1a1715] border-[#26221f]'
            )}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft size={14} />
              <span>Client Storefront</span>
            </div>
            <ExternalLink size={12} className="opacity-60" />
          </Link>

          {/* Version Hallmark */}
          <div className="px-3 pt-1 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
            <span>Adwika Console</span>
            <span className="text-emerald-500 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
