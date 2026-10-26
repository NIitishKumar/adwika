import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-neutral-400 pt-20 pb-12 px-6 md:px-12 border-t border-neutral-900">
      <div className="max-w-[1560px] mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-16 border-b border-neutral-900 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Authentic bilingual brand logo with red dot */}
            <div className="mb-3">
              <img
                src="/images/adwika-logo.png"
                alt="Adwika | अद्विका"
                className="h-10 sm:h-12 w-auto object-contain mix-blend-screen filter contrast-125 brightness-110"
              />
            </div>
            <p className="text-xs text-neutral-500 font-sans mt-2 max-w-sm">
              Modern heirlooms, rooted in India. Considered silhouettes, expressive craft, and pieces made to feel like you.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors border border-neutral-800 px-5 py-3 hover:border-neutral-600"
          >
            <span>Back to Summit</span>
            <ArrowUp size={14} />
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 border-b border-neutral-900 text-xs">
          <div>
            <h4 className="uppercase tracking-widest text-neutral-200 font-serif mb-4">Collections</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleLink('/kurtis')} className="hover:text-white transition-colors">
                  Kurtis & Tunics
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/suits')} className="hover:text-white transition-colors">
                  Suits & Anarkalis
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/coords')} className="hover:text-white transition-colors">
                  Co-ord Sets
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/shirts')} className="hover:text-white transition-colors">
                  Handloom Shirts
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/sarees')} className="hover:text-amber-200 transition-colors flex items-center gap-1.5">
                  <span>Sarees</span>
                  <span className="text-[8px] font-mono px-1 py-0.2 bg-amber-900/60 text-amber-300">Soon</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-neutral-200 font-serif mb-4">Atelier & Story</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-white transition-colors">
                  About Adwika
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/journal')} className="hover:text-white transition-colors">
                  The Journal Chronicles
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/craft')} className="hover:text-white transition-colors">
                  Artisan Communities
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-white transition-colors">
                  Conscious Handloom Pledge
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-neutral-200 font-serif mb-4">Client Concierge</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-white transition-colors">
                  Bespoke Sizing & Fittings
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/craft')} className="hover:text-white transition-colors">
                  Textile Care Guide
                </button>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
                  Worldwide Insured Dispatch
                </a>
              </li>
              <li>
                <a href="#returns" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">
                  Complimentary Exchanges
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-neutral-200 font-serif mb-4">Sanctuaries</h4>
            <p className="text-neutral-500 mb-3 leading-relaxed">
              Flagship Atelier: The Dhan Mill, 100 Feet Road, Chhatarpur, New Delhi 110074.
            </p>
            <p className="text-neutral-500">
              Inquiries: <span className="text-neutral-300">concierge@adwika.in</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-600 gap-4">
          <p>© {new Date().getFullYear()} ADWIKA HEIRLOOMS PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-neutral-400">Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-neutral-400">Terms of Service</a>
            <a href="#authenticity" onClick={(e) => e.preventDefault()} className="hover:text-neutral-400">GI Craft Guarantee</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
