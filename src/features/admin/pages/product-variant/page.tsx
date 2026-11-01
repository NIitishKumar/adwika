import React from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Boxes,
  Scissors,
  Palette,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import {
  ProductVariantStatusFilter,
  ProductVariantSortField,
} from '../../types/productVariant.types';
import {
  ProductVariantTable,
  ProductVariantModal,
  DeleteProductVariantModal,
  ProductVariantDetailModal,
} from './components';
import { AdminToastContainer } from '../../components/common/AdminToast';
import { useProductVariant } from './useProductVariant';

export const ProductVariantPage: React.FC = () => {
  const {
    variants,
    filteredVariants,
    products,
    fitSizes,
    colors,
    productMap,
    fitSizeMap,
    colorMap,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    selectedFitSize,
    setSelectedFitSize,
    selectedColor,
    setSelectedColor,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    activeCount,
    inactiveCount,
    lowStockCount,
    outOfStockCount,
    totalUnits,
    isFormModalOpen,
    editingVariant,
    isDeleteModalOpen,
    deletingVariant,
    isDeleting,
    isDetailModalOpen,
    selectedVariantDetail,
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
  } = useProductVariant();

  return (
    <div className="space-y-6">
      {/* High-Fidelity Floating Toast Container */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Title & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Boxes size={14} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#c9a87c]">
              Inventory Variants & SKUs
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-100 font-normal tracking-tight">
            Product Variants
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Configure matrix combinations of garments, silhouette cuts, and artisanal colorways with bespoke SKUs, prices in INR, and inventory stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Variants from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Variant</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKU Variants */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total SKU Variants
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">registered SKUs</span>
          </div>
        </div>

        {/* Active Storefront */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80 block mb-1">
            Active Storefront
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-emerald-400">{activeCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">available to purchase</span>
          </div>
        </div>

        {/* Total Physical Units */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#c9a87c] block mb-1">
            Total Inventory Units
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-[#c9a87c]">{totalUnits}</span>
            <span className="text-[11px] text-neutral-400 font-sans">units in studio stock</span>
          </div>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-rose-400/80 block mb-1">
            Inventory Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-rose-400">
              {lowStockCount + outOfStockCount}
            </span>
            <span className="text-[11px] text-neutral-400 font-sans">
              ({lowStockCount} low, {outOfStockCount} zero)
            </span>
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
              placeholder="Search by SKU, garment, silhouette, or color..."
              className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Garment Product Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <Tag size={13} className="text-[#c9a87c]" />
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Garments</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1b1917]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fit Silhouette Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <Scissors size={13} className="text-[#c9a87c]" />
              <select
                value={selectedFitSize}
                onChange={(e) => setSelectedFitSize(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[120px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Fits</option>
                {fitSizes.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#1b1917]">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Colorway Filter */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <Palette size={13} className="text-[#c9a87c]" />
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[120px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Colors</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1b1917]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <SlidersHorizontal size={13} className="text-[#c9a87c]" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as ProductVariantSortField)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
              >
                <option value="createdAt" className="bg-[#1b1917]">Latest Added</option>
                <option value="sku" className="bg-[#1b1917]">SKU Code</option>
                <option value="product" className="bg-[#1b1917]">Garment Name</option>
                <option value="price" className="bg-[#1b1917]">Price (INR)</option>
                <option value="stock" className="bg-[#1b1917]">Stock Level</option>
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

        {/* Bottom Filter Row: Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#26221f]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-neutral-500 mr-1">Status:</span>
            <div className="inline-flex rounded border border-[#332e29] p-0.5 bg-[#171513]">
              {(['ALL', 'ACTIVE', 'INACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'] as ProductVariantStatusFilter[]).map((status) => (
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
                  {status === 'ALL'
                    ? 'All'
                    : status === 'ACTIVE'
                    ? 'Active'
                    : status === 'INACTIVE'
                    ? 'Draft'
                    : status === 'LOW_STOCK'
                    ? 'Low Stock (≤5)'
                    : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-500">
            Showing <strong className="text-neutral-300">{filteredVariants.length}</strong> of{' '}
            <strong className="text-neutral-300">{totalCount}</strong> variants
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ProductVariantTable
        variants={filteredVariants}
        productMap={productMap}
        fitSizeMap={fitSizeMap}
        colorMap={colorMap}
        onViewDetail={handleOpenViewDetail}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Form Modal (Create / Edit) */}
      <ProductVariantModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingVariant}
        products={products}
        fitSizes={fitSizes}
        colors={colors}
      />

      {/* View Detail Modal */}
      <ProductVariantDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseViewDetail}
        variant={selectedVariantDetail}
        product={selectedVariantDetail ? productMap.get(selectedVariantDetail.productId) : undefined}
        fitSize={selectedVariantDetail ? fitSizeMap.get(selectedVariantDetail.fitSizeId) : undefined}
        productColor={selectedVariantDetail ? colorMap.get(selectedVariantDetail.productColorId) : undefined}
        isLoading={isLoadingDetail}
        error={detailError}
        onEdit={(v) => {
          handleCloseViewDetail();
          handleOpenEdit(v);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductVariantModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        variant={deletingVariant}
        product={deletingVariant ? productMap.get(deletingVariant.productId) : undefined}
        fitSize={deletingVariant ? fitSizeMap.get(deletingVariant.fitSizeId) : undefined}
        productColor={deletingVariant ? colorMap.get(deletingVariant.productColorId) : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductVariantPage;
