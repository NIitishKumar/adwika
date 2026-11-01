import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProductCategoryPage } from './pages/product-category';
import { ProductSubCategoryPage } from './pages/product-sub-category';
import { ProductPage } from './pages/product';
import { ProductAttributePage } from './pages/product-attribute';
import { ProductImagePage } from './pages/product-image';
import { ProductVariantPage } from './pages/product-variant';
import { FitSizePage } from './pages/fit-size';
import { ProductColorListPage } from './pages/ProductColorListPage';

export const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="product-variants" element={<ProductVariantPage />} />
        <Route path="product-images" element={<ProductImagePage />} />
        <Route path="product-attributes" element={<ProductAttributePage />} />
        <Route path="product-categories" element={<ProductCategoryPage />} />
        <Route path="product-sub-categories" element={<ProductSubCategoryPage />} />
        <Route path="fit-sizes" element={<FitSizePage />} />
        <Route path="product-colors" element={<ProductColorListPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/fit-sizes" replace />} />
      </Routes>
    </AdminLayout>
  );
};
