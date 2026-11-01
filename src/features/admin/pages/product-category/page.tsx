import React from 'react';
import {
  Plus,
  Search,
  Layers,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import {
  ProductCategoryStatusFilter,
  ProductCategorySortField,
} from '../../types/productCategory.types';
import { ProductCategoryTable } from './ProductCategoryTable';
import { ProductCategoryModal } from './ProductCategoryModal';
import { DeleteProductCategoryModal } from './DeleteProductCategoryModal';
import { AdminToastContainer } from '../../components/common/AdminToast';
import { useProductCategory } from './useProductCategory';

export const ProductCategoryPage: React.FC = () => {
  const {
    filteredCategories,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    activeCount,
    inactiveCount,
    nextOrderBy,
    isFormModalOpen,
    editingCategory,
    isDeleteModalOpen,
    deletingCategory,
    isDeleting,
    toasts,
    dismissToast,
    loadCategories,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleFormSubmit,
    handleDeleteConfirm,
    handleToggleActive,
    handleMoveOrder,
  } = useProductCategory();

  return (
    <div className="space-y-6">
      {/* High-Fidelity Floating Toast Container */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Title & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Layers size={14} />
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
            Product Categories (Collections)
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Configure luxury collections, custom slug routes, banner visuals, and storefront priority order.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadCategories}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Categories from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Categories */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total Collections
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">registered categories</span>
          </div>
        </div>

        {/* Active Categories */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80 block mb-1">
            Active Storefront
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-emerald-400">{activeCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">live on navigation</span>
          </div>
        </div>

        {/* Inactive / Draft */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Inactive / Draft
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
            placeholder="Search by collection title, slug, or description..."
            className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as ProductCategoryStatusFilter[]).map((status) => (
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
              onChange={(e) => setSortField(e.target.value as ProductCategorySortField)}
              className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
            >
              <option value="orderBy" className="bg-[#1b1917]">Priority #</option>
              <option value="title" className="bg-[#1b1917]">Title</option>
              <option value="categoryId" className="bg-[#1b1917]">Slug / ID</option>
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

      {/* Product Category Table */}
      <ProductCategoryTable
        categories={filteredCategories}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleActive={handleToggleActive}
        onMoveOrder={handleMoveOrder}
        isLoading={isLoading}
      />

      {/* Add / Edit Modal */}
      <ProductCategoryModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        nextOrderBy={nextOrderBy}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        category={deletingCategory}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductCategoryPage;
