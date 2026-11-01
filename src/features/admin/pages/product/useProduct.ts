import { useState, useEffect, useMemo } from 'react';
import {
  Product,
  ProductStatusFilter,
  ProductGenderFilter,
  ProductSortField,
  ProductStatus,
} from '../../types/product.types';
import { ProductFormData } from '../../schemas/product.schema';
import { productService } from '../../services/product.service';
import { ProductCategory } from '../../types/productCategory.types';
import { productCategoryService } from '../../services/productCategory.service';
import { ProductSubCategory } from '../../types/productSubCategory.types';
import { productSubCategoryService } from '../../services/productSubCategory.service';
import { FitSize } from '../../types/fitSize.types';
import { fitSizeService } from '../../services/fitSize.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [fitSizes, setFitSizes] = useState<FitSize[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL');
  const [genderFilter, setGenderFilter] = useState<ProductGenderFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<ProductSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
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

  // Load All Master Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, subRes, fitRes] = await Promise.all([
        productService.getAll(),
        productCategoryService.getAll(),
        productSubCategoryService.getAll(),
        fitSizeService.getAll(),
      ]);

      setProducts(prodRes.data);
      setIsLiveApi(prodRes.fromApi);
      setCategories(catRes.data);
      setSubCategories(subRes.data);
      setFitSizes(fitRes.data);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load products from server', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick lookup maps
  const categoryMap = useMemo(() => {
    const map = new Map<string, ProductCategory>();
    categories.forEach((c) => {
      map.set(c.id, c);
      if (c.categoryId) map.set(c.categoryId, c);
    });
    return map;
  }, [categories]);

  const subCategoryMap = useMemo(() => {
    const map = new Map<string, ProductSubCategory>();
    subCategories.forEach((s) => {
      map.set(s.id, s);
      if (s.slug) map.set(s.slug, s);
    });
    return map;
  }, [subCategories]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const query = searchQuery.trim().toLowerCase();
        const catTitle = prod.category?.title || categoryMap.get(prod.categoryId)?.title || '';
        const subName =
          prod.subCategory?.name || (prod.subCategoryId ? subCategoryMap.get(prod.subCategoryId)?.name : '') || '';

        const matchesQuery =
          !query ||
          prod.name.toLowerCase().includes(query) ||
          prod.slug.toLowerCase().includes(query) ||
          prod.fit.toLowerCase().includes(query) ||
          catTitle.toLowerCase().includes(query) ||
          subName.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' || prod.status === statusFilter;

        const matchesGender =
          genderFilter === 'ALL' || prod.gender === genderFilter;

        const matchesCategory =
          selectedCategory === 'ALL' ||
          prod.categoryId === selectedCategory ||
          prod.category?.id === selectedCategory;

        const matchesSubCategory =
          selectedSubCategory === 'ALL' ||
          prod.subCategoryId === selectedSubCategory ||
          prod.subCategory?.id === selectedSubCategory;

        return (
          matchesQuery &&
          matchesStatus &&
          matchesGender &&
          matchesCategory &&
          matchesSubCategory
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'basePrice') {
          comp = a.basePrice - b.basePrice;
        } else if (sortField === 'fit') {
          comp = a.fit.localeCompare(b.fit);
        } else if (sortField === 'createdAt') {
          comp = (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    products,
    searchQuery,
    statusFilter,
    genderFilter,
    selectedCategory,
    selectedSubCategory,
    sortField,
    sortDirection,
    categoryMap,
    subCategoryMap,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
  };

  // Form submit -> calls POST /api/v1/products or PATCH /api/v1/products/:id
  const handleFormSubmit = async (values: ProductFormData) => {
    try {
      const parentCat = categoryMap.get(values.categoryId);
      const parentSub = values.subCategoryId ? subCategoryMap.get(values.subCategoryId) : undefined;

      if (editingProduct) {
        // Update
        const targetId = editingProduct.id || editingProduct.slug || editingProduct.productId || '';
        if (!targetId) {
          throw new Error('Unable to update product: identifier is missing.');
        }
        const res = await productService.update(targetId, values);

        const itemToStore: Product = {
          ...res.data,
          category: res.data.category || (parentCat ? {
            id: parentCat.id,
            uniqueId: parentCat.uniqueId,
            title: parentCat.title,
            imageUrl: parentCat.imageUrl,
          } : undefined),
          subCategory: res.data.subCategory || (parentSub ? {
            id: parentSub.id,
            uniqueId: parentSub.uniqueId,
            name: parentSub.name,
            slug: parentSub.slug,
            imageUrl: parentSub.imageUrl,
          } : undefined),
        };

        setProducts((prev) =>
          prev.map((item) =>
            item.id === targetId || item.slug === targetId || item.productId === targetId
              ? itemToStore
              : item
          )
        );
        showToast(
          'success',
          res.message || `Product "${res.data.name}" updated successfully`,
          'Product Updated'
        );
      } else {
        // Create
        const res = await productService.create(values);

        const itemToStore: Product = {
          ...res.data,
          category: res.data.category || (parentCat ? {
            id: parentCat.id,
            uniqueId: parentCat.uniqueId,
            title: parentCat.title,
            imageUrl: parentCat.imageUrl,
          } : undefined),
          subCategory: res.data.subCategory || (parentSub ? {
            id: parentSub.id,
            uniqueId: parentSub.uniqueId,
            name: parentSub.name,
            slug: parentSub.slug,
            imageUrl: parentSub.imageUrl,
          } : undefined),
        };

        setProducts((prev) => [itemToStore, ...prev]);
        showToast(
          'success',
          res.message || `Product "${res.data.name}" created successfully`,
          'Product Created'
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product to server';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const targetId = deletingProduct.id || deletingProduct.slug || deletingProduct.productId || '';
      if (!targetId) {
        throw new Error('Unable to delete product: identifier is missing.');
      }
      const res = await productService.delete(targetId);
      setProducts((prev) =>
        prev.filter(
          (item) =>
            item.id !== targetId &&
            item.slug !== targetId &&
            item.productId !== targetId
        )
      );
      showToast(
        'success',
        res.message || `Deleted "${deletingProduct.name}" successfully.`,
        'Product Deleted'
      );
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete product.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: string, currentStatus: ProductStatus) => {
    try {
      const res = await productService.toggleStatus(id, currentStatus);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id || item.slug === id || item.productId === id
            ? { ...item, status: res.data.status }
            : item
        )
      );
      showToast(
        'success',
        `Product status changed to ${res.data.status}.`,
        'Status Updated'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle status.', 'Error');
    }
  };

  // View Detail (/api/v1/products/:id)
  const handleOpenViewDetail = async (product: Product) => {
    setIsDetailModalOpen(true);
    setSelectedProductDetail(product);
    setIsLoadingDetail(true);
    setDetailError(null);

    try {
      const targetId = product.id || product.productId || product.uniqueId || product.slug || '';
      if (!targetId) {
        throw new Error('Garment product identifier is missing.');
      }
      const res = await productService.getById(targetId);
      setSelectedProductDetail(res.data);
    } catch (err: any) {
      console.error('Failed to load product detail from /:id', err);
      setDetailError(err?.message || 'Failed to fetch product details.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseViewDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedProductDetail(null);
    setDetailError(null);
  };

  // Stats
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const draftCount = products.filter((p) => p.status === 'DRAFT' || p.status === 'INACTIVE').length;

  return {
    products,
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
  };
}
