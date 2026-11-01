import React from 'react';
import {
  Plus,
  Search,
  Layers,
  SlidersHorizontal,
  RefreshCw,
  FolderTree,
  FolderGit2,
} from 'lucide-react';
import {
  ProductStatusFilter,
  ProductGenderFilter,
  ProductSortField,
} from '../../types/product.types';
import {
  ProductTable,
  ProductModal,
  DeleteProductModal,
  ProductDetailModal,
} from './components';
import { AdminToastContainer } from '../../components/common/AdminToast';
import { useProduct } from './useProduct';

export const ProductPage: React.FC = () => {
  const {
    filteredProducts,
    categories,
    subCategories,
    fitSizes,
    categoryMap,
    subCategoryMap,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    genderFilter,
    setGenderFilter,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    activeCount,
    draftCount,
    isFormModalOpen,
    editingProduct,
    isDeleteModalOpen,
    deletingProduct,
    isDeleting,
    isDetailModalOpen,
    selectedProductDetail,
    isLoadingDetail,
    detailError,
    toasts,
    dismissToast,
    loadData,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleOpenViewDetail,
    handleCloseViewDetail,
    handleFormSubmit,
    handleDeleteConfirm,
    handleToggleStatus,
  } = useProduct();

  // Filter available sub-categories in filter dropdown if a category is selected
  const availableFilterSubCategories = subCategories.filter(
    (s) => selectedCategory === 'ALL' || s.categoryId === selectedCategory
  );

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
              Catalog Inventory
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-100 font-normal tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Manage luxury garments, assign category hierarchies, silhouettes, base prices in INR, and storefront publication.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Products from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Garments */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total Garments
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">registered items</span>
          </div>
        </div>

        {/* Active Storefront */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80 block mb-1">
            Active Storefront
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-emerald-400">{activeCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">available to order</span>
          </div>
        </div>

        {/* Inactive / Draft */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Inactive / Draft
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-400">{draftCount}</span>
            <span className="text-[11px] text-neutral-500 font-sans">hidden from clients</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723] space-y-3">
        {/* Top Filter Row: Search & Dropdowns */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments by name, fit, slug, category..."
              className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <FolderTree size={13} className="text-[#c9a87c]" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory('ALL');
                }}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Collections</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1b1917]">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <FolderGit2 size={13} className="text-[#c9a87c]" />
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Sub-Categories</option>
                {availableFilterSubCategories.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#1b1917]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <SlidersHorizontal size={13} className="text-[#c9a87c]" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as ProductSortField)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
              >
                <option value="createdAt" className="bg-[#1b1917]">Latest Added</option>
                <option value="name" className="bg-[#1b1917]">Name</option>
                <option value="basePrice" className="bg-[#1b1917]">Base Price</option>
                <option value="fit" className="bg-[#1b1917]">Silhouette Fit</option>
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

        {/* Bottom Filter Row: Gender & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#26221f]">
          {/* Gender Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1">Gender:</span>
            <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
              {(['ALL', 'WOMEN', 'MEN', 'UNISEX'] as ProductGenderFilter[]).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setGenderFilter(gender)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                    genderFilter === gender
                      ? 'bg-[#29221b] text-[#e0cfba] font-medium border border-[#4d3a2b]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1">Status:</span>
            <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
              {(['ALL', 'ACTIVE', 'DRAFT', 'INACTIVE'] as ProductStatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                    statusFilter === status
                      ? 'bg-[#29221b] text-[#e0cfba] font-medium border border-[#4d3a2b]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <ProductTable
        products={filteredProducts}
        categoryMap={categoryMap}
        subCategoryMap={subCategoryMap}
        onViewDetail={handleOpenViewDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
        subCategories={subCategories}
        fitSizes={fitSizes}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        product={deletingProduct}
        isDeleting={isDeleting}
      />

      {/* View Product Detail Modal (GET /api/v1/products/:id) */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseViewDetail}
        product={selectedProductDetail}
        isLoading={isLoadingDetail}
        error={detailError}
        onEdit={(prod) => {
          handleCloseViewDetail();
          handleOpenEdit(prod);
        }}
        categoryMap={categoryMap}
        subCategoryMap={subCategoryMap}
      />
    </div>
  );
};

export default ProductPage;
