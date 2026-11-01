import { useState, useEffect, useMemo } from 'react';
import {
  ProductVariant,
  ProductVariantStatusFilter,
  ProductVariantSortField,
} from '../../types/productVariant.types';
import { ProductVariantFormData } from '../../schemas/productVariant.schema';
import { productVariantService } from '../../services/productVariant.service';
import { Product } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { FitSize } from '../../types/fitSize.types';
import { fitSizeService } from '../../services/fitSize.service';
import { ProductColor } from '../../types/productColor.types';
import { productColorService } from '../../services/productColor.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useProductVariant() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fitSizes, setFitSizes] = useState<FitSize[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedFitSize, setSelectedFitSize] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<ProductVariantStatusFilter>('ALL');
  const [sortField, setSortField] = useState<ProductVariantSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedVariantDetail, setSelectedVariantDetail] = useState<ProductVariant | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data using existing APIs
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [varRes, prodRes, fitRes, colRes] = await Promise.all([
        productVariantService.getAll(),
        productService.getAll(),
        fitSizeService.getAll(),
        productColorService.getAll(),
      ]);

      setVariants(varRes.data);
      setIsLiveApi(varRes.fromApi);
      setProducts(prodRes.data);
      setFitSizes(fitRes.data);
      setColors(colRes.data);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load product variants', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lookup maps for fast resolution
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      map.set(p.id, p);
      if (p.uniqueId) map.set(p.uniqueId, p);
      if (p.productId) map.set(p.productId, p);
    });
    return map;
  }, [products]);

  const fitSizeMap = useMemo(() => {
    const map = new Map<string, FitSize>();
    fitSizes.forEach((f) => {
      map.set(f.id, f);
      if (f.uniqueId) map.set(f.uniqueId, f);
    });
    return map;
  }, [fitSizes]);

  const colorMap = useMemo(() => {
    const map = new Map<string, ProductColor>();
    colors.forEach((c) => {
      map.set(c.id, c);
      if (c.uniqueId) map.set(c.uniqueId, c);
    });
    return map;
  }, [colors]);

  // Filtered & sorted variants
  const filteredVariants = useMemo(() => {
    return variants
      .filter((v) => {
        const query = searchQuery.trim().toLowerCase();
        const prod = v.product || productMap.get(v.productId);
        const fit = v.fitSize || fitSizeMap.get(v.fitSizeId);
        const col = v.productColor || colorMap.get(v.productColorId);

        const prodName = prod?.name || '';
        const prodSlug = prod?.slug || '';
        const fitName = fit?.name || '';
        const fitCode = fit?.fitCode || '';
        const colName = col?.name || '';
        const colCode = col?.code || '';

        const matchesQuery =
          !query ||
          v.sku.toLowerCase().includes(query) ||
          prodName.toLowerCase().includes(query) ||
          prodSlug.toLowerCase().includes(query) ||
          fitName.toLowerCase().includes(query) ||
          fitCode.toLowerCase().includes(query) ||
          colName.toLowerCase().includes(query) ||
          colCode.toLowerCase().includes(query);

        const matchesProduct =
          selectedProduct === 'ALL' ||
          v.productId === selectedProduct ||
          v.product?.id === selectedProduct;

        const matchesFit =
          selectedFitSize === 'ALL' ||
          v.fitSizeId === selectedFitSize ||
          v.fitSize?.id === selectedFitSize;

        const matchesColor =
          selectedColor === 'ALL' ||
          v.productColorId === selectedColor ||
          v.productColor?.id === selectedColor;

        let matchesStatus = true;
        if (statusFilter === 'ACTIVE') {
          matchesStatus = v.isActive;
        } else if (statusFilter === 'INACTIVE') {
          matchesStatus = !v.isActive;
        } else if (statusFilter === 'LOW_STOCK') {
          matchesStatus = v.stockQuantity > 0 && v.stockQuantity <= 5;
        } else if (statusFilter === 'OUT_OF_STOCK') {
          matchesStatus = v.stockQuantity === 0;
        }

        return matchesQuery && matchesProduct && matchesFit && matchesColor && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'sku') {
          comp = a.sku.localeCompare(b.sku);
        } else if (sortField === 'price') {
          comp = a.price - b.price;
        } else if (sortField === 'stock') {
          comp = a.stockQuantity - b.stockQuantity;
        } else if (sortField === 'product') {
          const prodA = a.product?.name || productMap.get(a.productId)?.name || '';
          const prodB = b.product?.name || productMap.get(b.productId)?.name || '';
          comp = prodA.localeCompare(prodB);
        } else if (sortField === 'createdAt') {
          comp = (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    variants,
    searchQuery,
    selectedProduct,
    selectedFitSize,
    selectedColor,
    statusFilter,
    sortField,
    sortDirection,
    productMap,
    fitSizeMap,
    colorMap,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingVariant(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingVariant(null);
  };

  const handleOpenDelete = (variant: ProductVariant) => {
    setDeletingVariant(variant);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingVariant(null);
  };

  // View Detail Handlers
  const handleOpenViewDetail = async (variant: ProductVariant) => {
    setIsDetailModalOpen(true);
    setSelectedVariantDetail(variant);
    setIsLoadingDetail(true);
    setDetailError(null);

    const targetId = variant.id || variant.uniqueId || variant.variantId || '';
    if (!targetId) {
      setIsLoadingDetail(false);
      return;
    }

    try {
      const res = await productVariantService.getById(targetId);
      const parentProd = productMap.get(res.data.productId) || variant.product;
      const parentFit = fitSizeMap.get(res.data.fitSizeId) || variant.fitSize;
      const parentCol = colorMap.get(res.data.productColorId) || variant.productColor;

      const fullDetail: ProductVariant = {
        ...res.data,
        product: res.data.product || (parentProd ? {
          id: parentProd.id,
          uniqueId: parentProd.uniqueId,
          name: parentProd.name,
          slug: parentProd.slug,
          basePrice: parentProd.basePrice,
        } : undefined),
        fitSize: res.data.fitSize || (parentFit ? {
          id: parentFit.id,
          uniqueId: parentFit.uniqueId,
          name: parentFit.name,
          fitCode: parentFit.fitCode,
          displayOrder: parentFit.displayOrder,
        } : undefined),
        productColor: res.data.productColor || (parentCol ? {
          id: parentCol.id,
          uniqueId: parentCol.uniqueId,
          name: parentCol.name,
          code: parentCol.code,
        } : undefined),
      };

      setSelectedVariantDetail(fullDetail);
    } catch (err: any) {
      setDetailError(err?.message || 'Failed to fetch variant details.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseViewDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedVariantDetail(null);
    setDetailError(null);
  };

  // Form submit -> calls POST /api/v1/product-variants or PATCH /api/v1/product-variants/:id
  const handleFormSubmit = async (values: ProductVariantFormData) => {
    try {
      const parentProd = productMap.get(values.productId);
      const parentFit = fitSizeMap.get(values.fitSizeId);
      const parentCol = colorMap.get(values.productColorId);

      if (editingVariant) {
        // Update
        const res = await productVariantService.update(editingVariant.id, values);
        const itemToStore: ProductVariant = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
            basePrice: parentProd.basePrice,
          } : undefined),
          fitSize: res.data.fitSize || (parentFit ? {
            id: parentFit.id,
            uniqueId: parentFit.uniqueId,
            name: parentFit.name,
            fitCode: parentFit.fitCode,
            displayOrder: parentFit.displayOrder,
          } : undefined),
          productColor: res.data.productColor || (parentCol ? {
            id: parentCol.id,
            uniqueId: parentCol.uniqueId,
            name: parentCol.name,
            code: parentCol.code,
          } : undefined),
        };

        setVariants((prev) =>
          prev.map((v) => (v.id === editingVariant.id ? itemToStore : v))
        );
        showToast('success', res.message || 'Product variant updated successfully', 'Variant Updated');
      } else {
        // Create
        const res = await productVariantService.create(values);
        const itemToStore: ProductVariant = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
            basePrice: parentProd.basePrice,
          } : undefined),
          fitSize: res.data.fitSize || (parentFit ? {
            id: parentFit.id,
            uniqueId: parentFit.uniqueId,
            name: parentFit.name,
            fitCode: parentFit.fitCode,
            displayOrder: parentFit.displayOrder,
          } : undefined),
          productColor: res.data.productColor || (parentCol ? {
            id: parentCol.id,
            uniqueId: parentCol.uniqueId,
            name: parentCol.name,
            code: parentCol.code,
          } : undefined),
        };

        setVariants((prev) => [itemToStore, ...prev]);
        showToast('success', res.message || 'Product variant created successfully', 'Variant Created');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product variant';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deletingVariant) return;
    setIsDeleting(true);
    try {
      const res = await productVariantService.delete(deletingVariant.id);
      setVariants((prev) => prev.filter((v) => v.id !== deletingVariant.id));
      showToast('success', res.message || 'Deleted variant successfully.', 'Variant Deleted');
      setIsDeleteModalOpen(false);
      setDeletingVariant(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete variant.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await productVariantService.toggleStatus(id, currentStatus);
      setVariants((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isActive: updated.isActive } : v))
      );
      showToast(
        'success',
        `Variant status updated to ${updated.isActive ? 'Active' : 'Inactive'}.`,
        'Status Changed'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle variant status.');
    }
  };

  // Aggregate stats
  const totalCount = variants.length;
  const activeCount = variants.filter((v) => v.isActive).length;
  const inactiveCount = variants.filter((v) => !v.isActive).length;
  const lowStockCount = variants.filter((v) => v.stockQuantity > 0 && v.stockQuantity <= 5).length;
  const outOfStockCount = variants.filter((v) => v.stockQuantity === 0).length;
  const totalUnits = variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);

  return {
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
  };
}
