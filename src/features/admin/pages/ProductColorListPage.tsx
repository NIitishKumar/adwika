import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Palette,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ProductColor,
  ProductColorStatusFilter,
  ProductColorSortField,
} from '../types/productColor.types';
import { SortDirection } from '../types/fitSize.types';
import { ProductColorFormData } from '../schemas/productColor.schema';
import { productColorService } from '../services/productColor.service';
import { ProductColorTable } from '../components/product-color/ProductColorTable';
import { ProductColorModal } from '../components/product-color/ProductColorModal';
import { DeleteProductColorModal } from '../components/product-color/DeleteProductColorModal';
import { AdminToastContainer, ToastItem } from '../components/common/AdminToast';

export const ProductColorListPage: React.FC = () => {
  const [productColors, setProductColors] = useState<ProductColor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProductColorStatusFilter>('ALL');
  const [sortField, setSortField] = useState<ProductColorSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingColor, setDeletingColor] = useState<ProductColor | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // High-Fidelity Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Product Colors from API (/api/v1/product-colors)
  const loadProductColors = async () => {
    setIsLoading(true);
    try {
      const res = await productColorService.getAll();
      setProductColors(res.data);
      setIsLiveApi(res.fromApi);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load product colors from server', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductColors();
  }, []);

  // Filter & Sort
  const filteredColors = useMemo(() => {
    return productColors
      .filter((color) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          color.name.toLowerCase().includes(query) ||
          color.code.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && color.isActive) ||
          (statusFilter === 'INACTIVE' && !color.isActive);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'code') {
          comp = a.code.localeCompare(b.code);
        } else if (sortField === 'createdAt') {
          comp = (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [productColors, searchQuery, statusFilter, sortField, sortDirection]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingColor(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (color: ProductColor) => {
    setEditingColor(color);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (color: ProductColor) => {
    setDeletingColor(color);
    setIsDeleteModalOpen(true);
  };

  // Form submit -> calls POST /api/v1/product-colors or PATCH /api/v1/product-colors/:id
  const handleFormSubmit = async (values: ProductColorFormData) => {
    try {
      if (editingColor) {
        // Update
        const res = await productColorService.update(editingColor.id, values);
        setProductColors((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
        showToast('success', res.message || `Product color "${res.data.name}" updated successfully`, 'Updated');
      } else {
        // Create
        const res = await productColorService.create(values);
        setProductColors((prev) => [...prev, res.data]);
        showToast('success', res.message || `Product color "${res.data.name}" created successfully`, 'Created');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product color to server';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete -> calls DELETE /api/v1/product-colors/:id
  const handleDeleteConfirm = async () => {
    if (!deletingColor) return;
    setIsDeleting(true);
    try {
      const res = await productColorService.delete(deletingColor.id);
      setProductColors((prev) => prev.filter((item) => item.id !== deletingColor.id));
      showToast('success', res.message || `Deleted "${deletingColor.name}" successfully.`, 'Deleted');
      setIsDeleteModalOpen(false);
      setDeletingColor(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete product color.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status toggle
  const handleToggleActive = async (id: string) => {
    const current = productColors.find((c) => c.id === id);
    if (!current) return;

    try {
      const res = await productColorService.toggleActive(id, current.isActive);
      setProductColors((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      showToast(
        'success',
        `"${res.data.name}" is now ${res.data.isActive ? 'Active' : 'Inactive'}.`,
        'Status Changed'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle status.', 'Error');
    }
  };

  // Stats
  const totalCount = productColors.length;
  const activeCount = productColors.filter((c) => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-6">
      {/* High-Fidelity Floating Toast Container */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Title & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Palette size={14} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#c9a87c]">
              Catalog Hierarchy
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-100 font-normal tracking-tight">
            Product Colors (Colorways)
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Configure artisanal dye master palettes, color shorthand codes (e.g., MID-BLU, GLB-PNK), and storefront variant availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadProductColors}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Product Colors from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Color</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Colors */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total Palette Shades
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">registered shades</span>
          </div>
        </div>

        {/* Active Colors */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80 block mb-1">
            Active Storefront Shades
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-emerald-400">{activeCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">selectable on garments</span>
          </div>
        </div>

        {/* Inactive Colors */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Inactive / Seasonal Drafts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-400">{inactiveCount}</span>
            <span className="text-[11px] text-neutral-500 font-sans">hidden from clients</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by color name or code (e.g. Midnight Blue, MID-BLU)..."
            className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as ProductColorStatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors ${
                  statusFilter === status
                    ? 'bg-[#29221b] text-[#e0cfba] font-medium border border-[#4d3a2b]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
            <SlidersHorizontal size={13} className="text-[#c9a87c]" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as ProductColorSortField)}
              className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
            >
              <option value="name" className="bg-[#1b1917]">Name</option>
              <option value="code" className="bg-[#1b1917]">Color Code</option>
              <option value="createdAt" className="bg-[#1b1917]">Date Created</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
              title={`Sort direction: ${sortDirection.toUpperCase()}`}
              className="text-[10px] font-mono uppercase text-[#c9a87c] px-1 hover:text-white"
            >
              {sortDirection}
            </button>
          </div>
        </div>
      </div>

      {/* Product Color Table */}
      <ProductColorTable
        productColors={filteredColors}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleActive={handleToggleActive}
        isLoading={isLoading}
      />

      {/* Add / Edit Modal */}
      <ProductColorModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingColor}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductColorModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productColor={deletingColor}
        isDeleting={isDeleting}
      />
    </div>
  );
};
