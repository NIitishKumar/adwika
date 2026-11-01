import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './components/common/AdminSidebar';
import { AdminHeader } from './components/common/AdminHeader';
import { AdminThemeProvider, useAdminTheme } from './context/AdminThemeContext';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isLight } = useAdminTheme();

  const getBreadcrumbs = () => {
    if (location.pathname.includes('/admin/product-attributes')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Attributes' },
      ];
    }
    if (location.pathname.includes('/admin/product-sub-categories')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Sub-Categories' },
      ];
    }
    if (location.pathname.includes('/admin/product-categories')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Categories' },
      ];
    }
    if (location.pathname.includes('/admin/fit-sizes')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Fit Sizes' },
      ];
    }
    if (location.pathname.includes('/admin/product-colors')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Colors' },
      ];
    }
    if (location.pathname.includes('/admin/product-variants')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Variants' },
      ];
    }
    if (location.pathname.includes('/admin/product-images')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Product Images' },
      ];
    }
    if (location.pathname.includes('/admin/products')) {
      return [
        { label: 'Catalog Master', to: '/admin' },
        { label: 'Products Catalog' },
      ];
    }
    return [{ label: 'Admin Console' }];
  };

  return (
    <div
      className={cn(
        'min-h-screen flex font-sans transition-colors duration-200',
        isLight
          ? 'admin-portal-white bg-[#f8f7f5] text-neutral-900 selection:bg-[#54382c] selection:text-white'
          : 'bg-[#0a0a0a] text-neutral-100 selection:bg-[#c9a87c] selection:text-black'
      )}
    >
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          breadcrumbs={getBreadcrumbs()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
};
