import { useState, useEffect, useMemo } from 'react';
import {
  ProductAttribute,
  ProductAttributeSortField,
} from '../../types/productAttribute.types';
import { ProductAttributeFormData } from '../../schemas/productAttribute.schema';
import { productAttributeService } from '../../services/productAttribute.service';
import { Product } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useProductAttribute() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedNameFilter, setSelectedNameFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<ProductAttributeSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingAttribute, setDeletingAttribute] = useState<ProductAttribute | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [attrRes, prodRes] = await Promise.all([
        productAttributeService.getAll(),
        productService.getAll(),
      ]);

      setAttributes(attrRes.data);
      setIsLiveApi(attrRes.fromApi);
      setProducts(prodRes.data);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load product attributes', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Product lookup map
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      map.set(p.id, p);
      if (p.slug) map.set(p.slug, p);
      if (p.productId) map.set(p.productId, p);
    });
    return map;
  }, [products]);

  // Unique attribute names for filter pills
  const uniqueAttributeNames = useMemo(() => {
    const names = new Set<string>();
    attributes.forEach((a) => {
      if (a.name) names.add(a.name);
    });
    return Array.from(names);
  }, [attributes]);

  // Filtered and sorted attributes
  const filteredAttributes = useMemo(() => {
    return attributes
      .filter((attr) => {
        const query = searchQuery.trim().toLowerCase();
        const prod = attr.product || productMap.get(attr.productId);
        const prodName = prod?.name || '';
        const prodSlug = prod?.slug || '';

        const matchesQuery =
          !query ||
          attr.name.toLowerCase().includes(query) ||
          attr.value.toLowerCase().includes(query) ||
          prodName.toLowerCase().includes(query) ||
          prodSlug.toLowerCase().includes(query);

        const matchesProduct =
          selectedProduct === 'ALL' ||
          attr.productId === selectedProduct ||
          attr.product?.id === selectedProduct;

        const matchesName =
          selectedNameFilter === 'ALL' || attr.name === selectedNameFilter;

        return matchesQuery && matchesProduct && matchesName;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'value') {
          comp = a.value.localeCompare(b.value);
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
    attributes,
    searchQuery,
    selectedProduct,
    selectedNameFilter,
    sortField,
    sortDirection,
    productMap,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAttribute(null);
  };

  const handleOpenDelete = (attribute: ProductAttribute) => {
    setDeletingAttribute(attribute);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAttribute(null);
  };

  // Form submit
  const handleFormSubmit = async (values: ProductAttributeFormData) => {
    try {
      const parentProd = productMap.get(values.productId);

      if (editingAttribute) {
        // Update
        const res = await productAttributeService.update(editingAttribute.id, values);
        const itemToStore: ProductAttribute = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
          } : undefined),
        };

        setAttributes((prev) =>
          prev.map((item) => (item.id === editingAttribute.id ? itemToStore : item))
        );
        showToast(
          'success',
          res.message || `Attribute "${res.data.name}" updated successfully`,
          'Attribute Updated'
        );
      } else {
        // Create
        const res = await productAttributeService.create(values);
        const itemToStore: ProductAttribute = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
          } : undefined),
        };

        setAttributes((prev) => [itemToStore, ...prev]);
        showToast(
          'success',
          res.message || `Attribute "${res.data.name}" added successfully`,
          'Attribute Created'
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product attribute';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deletingAttribute) return;
    setIsDeleting(true);
    try {
      const res = await productAttributeService.delete(deletingAttribute.id);
      setAttributes((prev) => prev.filter((item) => item.id !== deletingAttribute.id));
      showToast(
        'success',
        res.message || `Deleted "${deletingAttribute.name}" attribute successfully.`,
        'Attribute Deleted'
      );
      setIsDeleteModalOpen(false);
      setDeletingAttribute(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete attribute.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const totalCount = attributes.length;
  const uniqueProductsCount = new Set(attributes.map((a) => a.productId)).size;
  const uniqueNamesCount = uniqueAttributeNames.length;

  return {
    attributes,
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
  };
}
