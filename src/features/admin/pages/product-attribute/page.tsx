import React from 'react';
import {
  Plus,
  Search,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  Tag,
} from 'lucide-react';
import { ProductAttributeSortField } from '../../types/productAttribute.types';
import {
  ProductAttributeTable,
  ProductAttributeModal,
  DeleteProductAttributeModal,
} from './components';
import { AdminToastContainer } from '../../components/common/AdminToast';
import { useProductAttribute } from './useProductAttribute';

export const ProductAttributePage: React.FC = () => {
  const {
    filteredAttributes,
    products,
    productMap,
    uniqueAttributeNames,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    selectedNameFilter,
    setSelectedNameFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    uniqueProductsCount,
    uniqueNamesCount,
    isFormModalOpen,
    editingAttribute,
    isDeleteModalOpen,
    deletingAttribute,
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
  } = useProductAttribute();

  return (
    <div className="space-y-6">
      {/* High-Fidelity Floating Toast Container */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Page Title & Add Button Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#26221f]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#29221b] text-[#c9a87c] border border-[#4d3a2b]">
              <Sparkles size={14} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#c9a87c]">
              Catalog Specifications
            </span>
            {isLiveApi && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-[10px] font-mono uppercase text-emerald-300 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-100 font-normal tracking-tight">
            Product Attributes
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-1 max-w-xl">
            Configure garment specifications, fabric weaves, handloom origins, and luxury care instructions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 text-neutral-400 hover:text-white bg-[#191715] hover:bg-[#24201c] border border-[#332e29] rounded transition-colors"
            title="Refresh Attributes from API"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#54382c] hover:bg-[#3e271d] text-white rounded text-xs uppercase tracking-widest font-sans font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Attribute</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Attributes */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Total Specifications
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-100">{totalCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">registered attributes</span>
          </div>
        </div>

        {/* Unique Products */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80 block mb-1">
            Garments Configured
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-emerald-400">{uniqueProductsCount}</span>
            <span className="text-[11px] text-neutral-400 font-sans">with specifications</span>
          </div>
        </div>

        {/* Attribute Keys */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#2b2723]">
          <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 block mb-1">
            Specification Types
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-neutral-400">{uniqueNamesCount}</span>
            <span className="text-[11px] text-neutral-500 font-sans">unique keys (Fabric, Weave...)</span>
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
            placeholder="Search by attribute name, value, or product..."
            className="w-full bg-[#1b1917] border border-[#332e29] focus:border-[#c9a87c] rounded pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Product Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
            <Layers size={13} className="text-[#c9a87c]" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL" className="bg-[#1b1917]">All Garments</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1b1917]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attribute Name Filter */}
          {uniqueAttributeNames.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
              <Tag size={13} className="text-[#c9a87c]" />
              <select
                value={selectedNameFilter}
                onChange={(e) => setSelectedNameFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="ALL" className="bg-[#1b1917]">All Keys</option>
                {uniqueAttributeNames.map((name) => (
                  <option key={name} value={name} className="bg-[#1b1917]">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#1b1917] border border-[#332e29] rounded px-3 py-1.5 text-xs text-neutral-300">
            <SlidersHorizontal size={13} className="text-[#c9a87c]" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as ProductAttributeSortField)}
              className="bg-transparent text-xs text-neutral-200 outline-none cursor-pointer"
            >
              <option value="createdAt" className="bg-[#1b1917]">Recorded Date</option>
              <option value="name" className="bg-[#1b1917]">Attribute Name</option>
              <option value="value" className="bg-[#1b1917]">Value</option>
              <option value="product" className="bg-[#1b1917]">Product Name</option>
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

      {/* Attribute Table */}
      <ProductAttributeTable
        attributes={filteredAttributes}
        productMap={productMap}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
      />

      {/* Add / Edit Modal */}
      <ProductAttributeModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingAttribute}
        products={products}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductAttributeModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        attribute={deletingAttribute}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductAttributePage;
