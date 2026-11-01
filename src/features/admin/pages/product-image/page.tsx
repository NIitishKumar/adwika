import React from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Image as ImageIcon,
  Images,
  Tag,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  ProductImageFilterType,
  ProductImageSortField,
} from '../../types/productImage.types';
import {
  ProductImageTable,
  ProductImageModal,
  DeleteProductImageModal,
} from './components';
import { AdminToastContainer } from '../../components/common/AdminToast';
import { useProductImage } from './useProductImage';

export const ProductImagePage: React.FC = () => {
  const {
    filteredImages,
    products,
    productMap,
    nextDisplayOrder,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    filterType,
    setFilterType,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    primaryCount,
    uniqueProductsCount,
    isFormModalOpen,
    editingImage,
    isDeleteModalOpen,
    deletingImage,
    isDeleting,
    toasts,
    dismissToast,
    loadData,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseFormModal,
    handleOpenDelete,
    handleCloseDeleteModal,
    handleFormSubmit,
    handleDeleteConfirm,
    handleTogglePrimary,
    handleMoveOrder,
  } = useProductImage();

  return (
    <div className="space-y-6">
      {/* High-Fidelity Floating Toast Container */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Title & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Images size={14} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#c9a87c]">
              Catalog Visuals
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-100 font-normal tracking-tight">
            Product Images
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Curate high-resolution imagery, set primary hero covers for the storefront showcase, and arrange visual display order per garment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Images from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Visual</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Images */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total Visual Assets
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">curated photos</span>
          </div>
        </div>

        {/* Primary Covers */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-amber-500/80 block mb-1">
            Lead Cover Photos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-amber-400">{primaryCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">primary covers active</span>
          </div>
        </div>

        {/* Garments Visualized */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#c9a87c] block mb-1">
            Garments With Media
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-[#c9a87c]">{uniqueProductsCount}</span>
            <span className="text-[11px] text-neutral-500 font-sans">
              of {products.length} garments styled
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by alt text, garment name, or slug..."
              className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Product Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <Tag size={13} className="text-[#c9a87c]" />
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Garments</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1b1917]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Field Selector */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <SlidersHorizontal size={13} className="text-[#c9a87c]" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as ProductImageSortField)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
              >
                <option value="displayOrder" className="bg-[#1b1917]">Display Sequence</option>
                <option value="product" className="bg-[#1b1917]">Garment Name</option>
                <option value="createdAt" className="bg-[#1b1917]">Latest Added</option>
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

        {/* Bottom Filter Row: Type Pills (All / Primary / Gallery) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#26221f]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1">Visual Type:</span>
            <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
              {(['ALL', 'PRIMARY', 'GALLERY'] as ProductImageFilterType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                    filterType === type
                      ? 'bg-[#29221b] text-[#e0cfba] font-medium border border-[#4d3a2b]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Images' : type === 'PRIMARY' ? '★ Primary Cover' : 'Gallery Only'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            Showing <strong className="text-neutral-300">{filteredImages.length}</strong> of{' '}
            <strong className="text-neutral-300">{totalCount}</strong> visuals
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ProductImageTable
        images={filteredImages}
        productMap={productMap}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePrimary={handleTogglePrimary}
        onMoveOrder={handleMoveOrder}
        isLoading={isLoading}
      />

      {/* Form Modal (Create / Edit) */}
      <ProductImageModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingImage}
        products={products}
        nextDisplayOrder={nextDisplayOrder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductImageModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        image={deletingImage}
        product={deletingImage ? productMap.get(deletingImage.productId) : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
};
export default ProductImagePage;
