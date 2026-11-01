import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Palette,
  Layers,
  Boxes,
  Images,
  FolderTree,
  FolderGit2,
  Tag,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { cn } from '@/lib/utils';

export const AdminDashboardPage: React.FC = () => {
  const { isLight } = useAdminTheme();

  const modules = [
    {
      to: '/admin/product-categories',
      title: 'Categories',
      description: 'Collection hierarchies (Kurtis, Suits, Co-ords, etc.), slugs, banner images, and sequencing.',
      icon: FolderTree,
    },
    {
      to: '/admin/product-sub-categories',
      title: 'Sub-Categories',
      description: 'Refined style mappings (e.g. Kurtas & Suits, Anarkali Sets) linked under primary collections.',
      icon: FolderGit2,
    },
    {
      to: '/admin/products',
      title: 'Garments Catalog',
      description: 'Complete inventory (Kurtas, Suits, Co-ords, Shirts), silhouettes, INR pricing, and SEO metadata.',
      icon: Layers,
    },
    {
      to: '/admin/product-variants',
      title: 'Product Variants',
      description: 'Multi-dimensional SKU matrix: link silhouettes & colors, set INR prices, and manage real-time stock levels.',
      icon: Boxes,
    },
    {
      to: '/admin/product-images',
      title: 'Product Images',
      description: 'High-resolution lookbook assets, primary storefront cover flags, alt descriptions, and display orders.',
      icon: Images,
    },
    {
      to: '/admin/product-attributes',
      title: 'Attributes',
      description: 'Garment specifications, fabric compositions, handloom weaves, and luxury care instructions.',
      icon: Tag,
    },
    {
      to: '/admin/fit-sizes',
      title: 'Fit Sizes',
      description: 'Silhouette cuts (Regular, Slim, Relaxed, Oversized), short codes, priority display order, and active storefront flags.',
      icon: Scissors,
    },
    {
      to: '/admin/product-colors',
      title: 'Product Colors',
      description: 'Artisanal colorways (e.g. Midnight Blue, Gulabi Pink), shorthand codes (MID-BLU), swatches, and active status.',
      icon: Palette,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Welcome Banner */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden border p-6 sm:p-10 shadow-xs transition-colors duration-200',
          isLight
            ? 'border-[#e8e4de] bg-gradient-to-r from-white via-[#faf7f2] to-[#f4ede4]'
            : 'border-[#2e2823] bg-gradient-to-r from-[#171513] via-[#1d1916] to-[#25201b]'
        )}
      >
        <div className="relative z-10 max-w-2xl">
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-3 font-semibold border transition-colors',
              isLight
                ? 'bg-[#f5efe8] border-[#d6c4b2] text-[#54382c]'
                : 'bg-[#29221b] border-[#4d3a2b] text-[#c9a87c]'
            )}
          >
            <Sparkles size={12} className={isLight ? 'text-[#8b633b]' : 'text-[#c9a87c]'} />
            <span>Studio Management</span>
          </div>
          <h1
            className={cn(
              'font-serif text-3xl sm:text-4xl font-normal tracking-tight transition-colors',
              isLight ? 'text-neutral-900' : 'text-neutral-100'
            )}
          >
            Adwika Master Console
          </h1>
          <p
            className={cn(
              'text-xs sm:text-sm font-sans mt-2.5 leading-relaxed font-light transition-colors',
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            )}
          >
            Welcome to the centralized catalog master management portal. Configure product categories, garment silhouettes, fit codes, and color palettes.
          </p>

          <div className="pt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/admin/product-categories"
              className="px-5 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
            >
              <FolderTree size={15} />
              <span>Manage Categories</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/admin/fit-sizes"
              className={cn(
                'px-4 py-2.5 rounded text-xs uppercase tracking-wider font-sans font-medium transition-colors border shadow-2xs',
                isLight
                  ? 'bg-white hover:bg-[#f5efe8] text-neutral-700 border-[#e8e4de]'
                  : 'bg-[#181615] hover:bg-[#24201c] text-neutral-300 border-[#332e29]'
              )}
            >
              Fit Sizes
            </Link>
            <Link
              to="/"
              className={cn(
                'px-4 py-2.5 rounded text-xs uppercase tracking-wider font-sans font-medium transition-colors border shadow-2xs',
                isLight
                  ? 'bg-white hover:bg-[#f5efe8] text-neutral-700 border-[#e8e4de]'
                  : 'bg-[#181615] hover:bg-[#24201c] text-neutral-300 border-[#332e29]'
              )}
            >
              View Storefront
            </Link>
          </div>
        </div>

        {/* Ambient watermark */}
        <div className="absolute right-6 -bottom-6 opacity-15 select-none pointer-events-none hidden md:block">
          <span className="font-serif text-9xl tracking-widest text-[#c9a87c]">ADWIKA</span>
        </div>
      </div>

      {/* Catalog Entities Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className={cn(
              'font-serif text-xl transition-colors',
              isLight ? 'text-neutral-900' : 'text-neutral-100'
            )}
          >
            Catalog Master Entities
          </h2>
          <span className="text-xs text-neutral-500 font-mono">8 MODULES</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                className={cn(
                  'group p-6 rounded-xl transition-all duration-200 flex flex-col justify-between',
                  isLight
                    ? 'bg-white hover:bg-[#faf8f5] border border-[#e8e4de] hover:border-[#8b633b]/60 shadow-2xs hover:shadow-md'
                    : 'bg-[#141414] hover:bg-[#181615] border border-[#2e2a27] hover:border-[#c9a87c]/60 shadow-lg'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={cn(
                        'p-3 rounded-lg border group-hover:scale-105 transition-transform',
                        isLight
                          ? 'bg-[#f7f2ea] text-[#8b633b] border-[#dfd2c4]'
                          : 'bg-[#271f19] text-[#c9a87c] border-[#483727]'
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border flex items-center gap-1',
                        isLight
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full animate-pulse',
                          isLight ? 'bg-emerald-500' : 'bg-emerald-400'
                        )}
                      />
                      Active CRUD
                    </span>
                  </div>
                  <h3
                    className={cn(
                      'font-serif text-lg transition-colors',
                      isLight
                        ? 'text-neutral-900 group-hover:text-[#54382c]'
                        : 'text-neutral-100 group-hover:text-[#c9a87c]'
                    )}
                  >
                    {mod.title}
                  </h3>
                  <p
                    className={cn(
                      'text-xs font-sans mt-1.5 leading-relaxed',
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    )}
                  >
                    {mod.description}
                  </p>
                </div>

                <div
                  className={cn(
                    'pt-5 mt-4 border-t flex items-center justify-between text-xs font-mono uppercase tracking-wider transition-colors',
                    isLight
                      ? 'border-[#f0ece6] text-[#8b633b] group-hover:text-[#54382c]'
                      : 'border-[#26221f] text-[#c9a87c]'
                  )}
                >
                  <span>Enter Console</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* API Connectivity status */}
      <div
        className={cn(
          'p-4 rounded-xl border flex items-center justify-between text-xs shadow-2xs transition-colors',
          isLight
            ? 'bg-white border-[#e8e4de] text-neutral-700'
            : 'bg-[#121110] border-[#26221f] text-neutral-400'
        )}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2
            size={16}
            className={isLight ? 'text-emerald-600' : 'text-emerald-400'}
          />
          <span>
            API Gateway: NestJS backend (
            <code
              className={cn(
                'font-mono px-1.5 py-0.5 rounded',
                isLight
                  ? 'text-[#54382c] bg-[#f5efe8]'
                  : 'text-[#c9a87c] bg-[#1e1b18]'
              )}
            >
              http://localhost:3000/api/v1
            </code>
            ) via Vite proxy
          </span>
        </div>
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:block">
          STATUS: READY
        </div>
      </div>
    </div>
  );
};
