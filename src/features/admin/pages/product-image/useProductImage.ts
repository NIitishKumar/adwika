import { useState, useEffect, useMemo } from 'react';
import {
  ProductImage,
  ProductImageFilterType,
  ProductImageSortField,
} from '../../types/productImage.types';
import { ProductImageFormData } from '../../schemas/productImage.schema';
import { productImageService } from '../../services/productImage.service';
import { Product } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useProductImage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<ProductImageFilterType>('ALL');
  const [sortField, setSortField] = useState<ProductImageSortField>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingImage, setDeletingImage] = useState<ProductImage | null>(null);
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
      const [imgRes, prodRes] = await Promise.all([
        productImageService.getAll(),
        productService.getAll(),
      ]);

      setImages(imgRes.data);
      setIsLiveApi(imgRes.fromApi);
      setProducts(prodRes.data);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load product images', 'Load Error');
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

  // Next Display Order for selected product
  const nextDisplayOrder = useMemo(() => {
    const targetImages =
      selectedProduct === 'ALL'
        ? images
        : images.filter((img) => img.productId === selectedProduct);
    if (targetImages.length === 0) return 1;
    return Math.max(...targetImages.map((i) => i.displayOrder), 0) + 1;
  }, [images, selectedProduct]);

  // Filtered and sorted images
  const filteredImages = useMemo(() => {
    return images
      .filter((img) => {
        const query = searchQuery.trim().toLowerCase();
        const prod = img.product || productMap.get(img.productId);
        const prodName = prod?.name || '';
        const prodSlug = prod?.slug || '';

        const matchesQuery =
          !query ||
          img.altText.toLowerCase().includes(query) ||
          prodName.toLowerCase().includes(query) ||
          prodSlug.toLowerCase().includes(query);

        const matchesProduct =
          selectedProduct === 'ALL' ||
          img.productId === selectedProduct ||
          img.product?.id === selectedProduct;

        const matchesType =
          filterType === 'ALL' ||
          (filterType === 'PRIMARY' && img.isPrimary) ||
          (filterType === 'GALLERY' && !img.isPrimary);

        return matchesQuery && matchesProduct && matchesType;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'displayOrder') {
          comp = a.displayOrder - b.displayOrder;
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
    images,
    searchQuery,
    selectedProduct,
    filterType,
    sortField,
    sortDirection,
    productMap,
  ]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingImage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (image: ProductImage) => {
    setEditingImage(image);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingImage(null);
  };

  const handleOpenDelete = (image: ProductImage) => {
    setDeletingImage(image);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingImage(null);
  };

  // Form submit -> calls POST /api/v1/product-images or PATCH /api/v1/product-images/:id
  const handleFormSubmit = async (values: ProductImageFormData) => {
    try {
      const parentProd = productMap.get(values.productId);

      if (editingImage) {
        // Update
        const res = await productImageService.update(editingImage.id, values);
        const itemToStore: ProductImage = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
          } : undefined),
        };

        setImages((prev) =>
          prev.map((img) => {
            if (img.id === editingImage.id) return itemToStore;
            if (itemToStore.isPrimary && img.productId === itemToStore.productId) {
              return { ...img, isPrimary: false };
            }
            return img;
          })
        );
        showToast('success', res.message || 'Product image updated successfully', 'Image Updated');
      } else {
        // Create
        const res = await productImageService.create(values);
        const itemToStore: ProductImage = {
          ...res.data,
          product: res.data.product || (parentProd ? {
            id: parentProd.id,
            uniqueId: parentProd.uniqueId,
            name: parentProd.name,
            slug: parentProd.slug,
          } : undefined),
        };

        setImages((prev) => {
          let updated = [...prev];
          if (itemToStore.isPrimary) {
            updated = updated.map((img) =>
              img.productId === itemToStore.productId ? { ...img, isPrimary: false } : img
            );
          }
          return [itemToStore, ...updated];
        });

        showToast('success', res.message || 'Product image added successfully', 'Image Added');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product image';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deletingImage) return;
    setIsDeleting(true);
    try {
      const res = await productImageService.delete(deletingImage.id);
      setImages((prev) => prev.filter((img) => img.id !== deletingImage.id));
      showToast('success', res.message || 'Deleted product image successfully.', 'Image Deleted');
      setIsDeleteModalOpen(false);
      setDeletingImage(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete image.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Set as Primary cover
  const handleTogglePrimary = async (id: string, productId: string) => {
    try {
      const res = await productImageService.togglePrimary(id, productId);
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) return { ...img, isPrimary: true };
          if (img.productId === productId) return { ...img, isPrimary: false };
          return img;
        })
      );
      showToast('success', 'Selected image is now set as the primary cover photo.', 'Cover Updated');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to set primary image.', 'Error');
    }
  };

  // Reorder display order
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = filteredImages.findIndex((img) => img.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredImages.length) return;

    const currentItem = filteredImages[currentIndex];
    const targetItem = filteredImages[targetIndex];

    try {
      const resCurrent = await productImageService.update(currentItem.id, {
        display_order: targetItem.displayOrder,
      });
      const resTarget = await productImageService.update(targetItem.id, {
        display_order: currentItem.displayOrder,
      });

      setImages((prev) =>
        prev.map((img) => {
          if (img.id === resCurrent.data.id) return resCurrent.data;
          if (img.id === resTarget.data.id) return resTarget.data;
          return img;
        })
      );
      showToast('info', 'Display sequence updated.', 'Reordered');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reorder images.');
    }
  };

  // Stats
  const totalCount = images.length;
  const primaryCount = images.filter((i) => i.isPrimary).length;
  const uniqueProductsCount = new Set(images.map((i) => i.productId)).size;

  return {
    images,
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
  };
}
