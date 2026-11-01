import { useState, useEffect, useMemo } from 'react';
import {
  ProductCategory,
  ProductCategoryStatusFilter,
  ProductCategorySortField,
} from '../../types/productCategory.types';
import { ProductCategoryFormData } from '../../schemas/productCategory.schema';
import { productCategoryService } from '../../services/productCategory.service';
import { ToastItem } from '../../components/common/AdminToast';
import { SortDirection } from '../../types/fitSize.types';

export function useProductCategory() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProductCategoryStatusFilter>('ALL');
  const [sortField, setSortField] = useState<ProductCategorySortField>('orderBy');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Categories from backend API (/api/v1/product-categories)
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await productCategoryService.getAll();
      setCategories(res.data);
      setIsLiveApi(res.fromApi);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load product categories from server', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          cat.title.toLowerCase().includes(query) ||
          cat.categoryId.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && cat.isActive) ||
          (statusFilter === 'INACTIVE' && !cat.isActive);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'orderBy') {
          comp = a.orderBy - b.orderBy;
        } else if (sortField === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (sortField === 'categoryId') {
          comp = a.categoryId.localeCompare(b.categoryId);
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [categories, searchQuery, statusFilter, sortField, sortDirection]);

  // Next Order By helper
  const nextOrderBy = useMemo(() => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.orderBy), 0) + 1;
  }, [categories]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
  };

  const handleOpenDelete = (category: ProductCategory) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  // Form submit -> calls POST /api/v1/product-categories or PATCH /api/v1/product-categories/:id
  const handleFormSubmit = async (values: ProductCategoryFormData) => {
    try {
      if (editingCategory) {
        // Update
        const targetId = editingCategory.id || editingCategory.categoryId;
        const res = await productCategoryService.update(targetId, values);
        setCategories((prev) =>
          prev.map((item) =>
            item.id === res.data.id || item.categoryId === res.data.categoryId ? res.data : item
          )
        );
        showToast(
          'success',
          res.message || `Category "${res.data.title}" updated successfully`,
          'Category Updated'
        );
      } else {
        // Create
        const res = await productCategoryService.create({
          id: values.id,
          title: values.title,
          description: values.description,
          image_url: values.image_url,
          banner_image_url: values.banner_image_url,
          order_by: values.order_by,
          is_active: values.is_active,
        });
        setCategories((prev) => [...prev, res.data]);
        showToast(
          'success',
          res.message || `Category "${res.data.title}" created successfully`,
          'Category Created'
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save product category to server';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete -> calls DELETE /api/v1/product-categories/:id
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const targetId = deletingCategory.id || deletingCategory.categoryId;
      const res = await productCategoryService.delete(targetId);
      setCategories((prev) =>
        prev.filter((item) => item.id !== deletingCategory.id && item.categoryId !== deletingCategory.categoryId)
      );
      showToast('success', res.message || `Deleted "${deletingCategory.title}" successfully.`, 'Category Deleted');
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete category.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status toggle
  const handleToggleActive = async (id: string) => {
    const current = categories.find((c) => c.id === id || c.categoryId === id);
    if (!current) return;

    try {
      const targetId = current.id || current.categoryId;
      const res = await productCategoryService.toggleActive(targetId, current.isActive);
      setCategories((prev) =>
        prev.map((item) =>
          item.id === id || item.categoryId === id ? res.data : item
        )
      );
      showToast(
        'success',
        `"${res.data.title}" is now ${res.data.isActive ? 'Active' : 'Inactive'}.`,
        'Status Changed'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle status.', 'Error');
    }
  };

  // Display Order Swap
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = filteredCategories.findIndex((c) => c.id === id || c.categoryId === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredCategories.length) return;

    const currentItem = filteredCategories[currentIndex];
    const targetItem = filteredCategories[targetIndex];

    try {
      const resCurrent = await productCategoryService.update(currentItem.id || currentItem.categoryId, {
        order_by: targetItem.orderBy,
      });
      const resTarget = await productCategoryService.update(targetItem.id || targetItem.categoryId, {
        order_by: currentItem.orderBy,
      });

      setCategories((prev) =>
        prev.map((item) => {
          if (item.id === resCurrent.data.id || item.categoryId === resCurrent.data.categoryId) {
            return resCurrent.data;
          }
          if (item.id === resTarget.data.id || item.categoryId === resTarget.data.categoryId) {
            return resTarget.data;
          }
          return item;
        })
      );
      showToast('info', `Order priority updated for ${currentItem.title}.`, 'Reordered');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reorder categories.');
    }
  };

  // Stats
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return {
    categories,
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
  };
}
