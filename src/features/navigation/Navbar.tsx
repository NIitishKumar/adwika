import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
interface NavbarProps {
  onOpenAccountModal: () => void;
  onOpenSearchModal: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAccountModal,
  onOpenSearchModal,
  onOpenCart,
  cartCount,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; path: string; badge?: string }[] = [
    { label: 'KURTIS', path: '/kurtis' },
    { label: 'SUITS', path: '/suits' },
    { label: 'CO-ORDS', path: '/coords' },
    { label: 'SHIRTS', path: '/shirts' },
    { label: 'SAREES', path: '/sarees', badge: 'SOON' },
    { label: 'JOURNAL', path: '/journal' },
    { label: 'ABOUT', path: '/about' },
  ];

  const handleLinkClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled || location.pathname !== '/'
          ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5 shadow-2xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
      )}
    >
      <div className="max-w-[1560px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.path)}
                className={cn(
                  'text-[11px] tracking-luxury uppercase transition-colors duration-200 relative group py-1 flex items-center gap-1.5',
                  isActive ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[8px] font-mono tracking-wider px-1 py-0.2 bg-amber-900/60 text-amber-200 border border-amber-600/40 rounded-none">
                    {link.badge}
                  </span>
                )}
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-[1px] bg-adwika-sand transition-all duration-300',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* Medium screens (lg) condensed nav */}
        <nav className="hidden lg:flex xl:hidden items-center gap-5" aria-label="Main Navigation Condensed">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.path)}
                className={cn(
                  'text-[10px] tracking-wider uppercase transition-colors duration-200 relative group py-1',
                  isActive ? 'text-white font-medium' : 'text-neutral-300 hover:text-white'
                )}
              >
                <span>{link.label}</span>
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-[1px] bg-adwika-sand transition-all duration-300',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* Mobile menu hamburger */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-neutral-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Center: Brand Identity - Authentic Bilingual Logo (English + Hindi with Red Dot) */}
        <div
          className="flex flex-col items-center cursor-pointer group py-1"
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Adwika | अद्विका — Return to Home"
        >
          <img
            src="/images/adwika-logo.png"
            alt="Adwika | अद्विका"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain mix-blend-screen filter contrast-125 brightness-110 transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
          />
        </div>

        {/* Right Navigation / Controls - matching prototype */}
        <div className="flex items-center gap-5 sm:gap-6 md:gap-7">
          {/* Search */}
          <button
            onClick={onOpenSearchModal}
            className="text-neutral-300 hover:text-white transition-colors p-1 flex items-center gap-1.5 text-[11px] tracking-luxury uppercase"
            aria-label="Search Collection"
            title="Search Archive"
          >
            <Search size={15} />
            <span className="hidden xl:inline">SEARCH</span>
          </button>

          {/* Account */}
          <button
            onClick={onOpenAccountModal}
            className="text-neutral-300 hover:text-white transition-colors p-1 flex items-center gap-1.5 text-[11px] tracking-luxury uppercase"
            aria-label="Account Login"
            title="Client Sanctuary"
          >
            <User size={15} />
            <span className="hidden lg:inline">ACCOUNT</span>
          </button>

          {/* Shopping Bag */}
          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-neutral-300 hover:text-white transition-colors group"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <span className="hidden md:inline">BAG</span>
            <div className="relative">
              <ShoppingBag size={14} className="group-hover:text-adwika-sand transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-adwika-bindi text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-neutral-400 group-hover:text-white">({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-b border-neutral-800 px-6 py-8 animate-fadeIn text-center">
          {/* Mobile menu bilingual logo */}
          <div className="flex justify-center mb-6 pb-4 border-b border-neutral-900">
            <img
              src="/images/adwika-logo.png"
              alt="Adwika | अद्विका"
              className="h-9 w-auto object-contain mix-blend-screen"
            />
          </div>
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.path)}
                className="text-sm tracking-widest uppercase text-neutral-300 hover:text-adwika-sand transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-neutral-800 flex justify-center">
              <button
                onClick={() => {
                  onOpenAccountModal();
                  setMobileMenuOpen(false);
                }}
                className="text-xs tracking-wider uppercase text-neutral-400 hover:text-white flex items-center gap-2"
              >
                <User size={14} />
                <span>Client Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
