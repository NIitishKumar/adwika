import { useState, useEffect, useMemo } from 'react';
import {
  ProductSubCategory,
  ProductSubCategoryStatusFilter,
  ProductSubCategorySortField,
} from '../../types/productSubCategory.types';
import { ProductSubCategoryFormData } from '../../schemas/productSubCategory.schema';
import { productSubCategoryService } from '../../services/productSubCategory.service';
import { ProductCategory } from '../../types/productCategory.types';
import { productCategoryService } from '../../services/productCategory.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useProductSubCategory() {
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProductSubCategoryStatusFilter>('ALL');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<ProductSubCategorySortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] = useState<ProductSubCategory | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingSubCategory, setDeletingSubCategory] = useState<ProductSubCategory | null>(null);
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

  // Load Sub-Categories & Parent Categories
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subRes, catRes] = await Promise.all([
        productSubCategoryService.getAll(),
        productCategoryService.getAll(),
      ]);
      setSubCategories(subRes.data);
      setIsLiveApi(subRes.fromApi);
      setParentCategories(catRes.data);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load sub-categories from server', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category title resolver helper map
  const categoryMap = useMemo(() => {
    const map = new Map<string, ProductCategory>();
    parentCategories.forEach((cat) => {
      map.set(cat.id, cat);
      if (cat.categoryId) map.set(cat.categoryId, cat);
    });
    return map;
  }, [parentCategories]);

  // Filtered & Sorted Sub-Categories
  const filteredSubCategories = useMemo(() => {
    return subCategories
      .filter((sub) => {
        const query = searchQuery.trim().toLowerCase();
        const parentTitle =
          sub.category?.title || categoryMap.get(sub.categoryId)?.title || '';

        const matchesQuery =
          !query ||
          sub.name.toLowerCase().includes(query) ||
          sub.slug.toLowerCase().includes(query) ||
          parentTitle.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && sub.isActive) ||
          (statusFilter === 'INACTIVE' && !sub.isActive);

        const matchesParent =
          selectedParentCategory === 'ALL' ||
          sub.categoryId === selectedParentCategory ||
          sub.category?.id === selectedParentCategory;

        return matchesQuery && matchesStatus && matchesParent;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'slug') {
          comp = a.slug.localeCompare(b.slug);
        } else if (sortField === 'category') {
          const catA = a.category?.title || categoryMap.get(a.categoryId)?.title || '';
          const catB = b.category?.title || categoryMap.get(b.categoryId)?.title || '';
          comp = catA.localeCompare(catB);
        } else if (sortField === 'createdAt') {
          comp = (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [
    subCategories,
    searchQuery,
    statusFilter,
    selectedParentCategory,
    sortField,
    sortDirection,
    categoryMap,
  ]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingSubCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (subCategory: ProductSubCategory) => {
    setEditingSubCategory(subCategory);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingSubCategory(null);
  };

  const handleOpenDelete = (subCategory: ProductSubCategory) => {
    setDeletingSubCategory(subCategory);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingSubCategory(null);
  };

  // Form submit -> calls POST /api/v1/product-sub-categories or PATCH /api/v1/product-sub-categories/:id
  const handleFormSubmit = async (values: ProductSubCategoryFormData) => {
    try {
      const parentCat = categoryMap.get(values.categoryId);

      if (editingSubCategory) {
        // Update
        const targetId = editingSubCategory.id || editingSubCategory.slug;
        const res = await productSubCategoryService.update(targetId, values);

        // Augment with parent category info if missing in response
        const itemToStore: ProductSubCategory = {
          ...res.data,
          category: res.data.category || (parentCat ? {
            id: parentCat.id,
            uniqueId: parentCat.uniqueId,
            title: parentCat.title,
            imageUrl: parentCat.imageUrl,
          } : undefined),
        };

        setSubCategories((prev) =>
          prev.map((item) =>
            item.id === targetId || item.slug === targetId ? itemToStore : item
          )
        );
        showToast(
          'success',
          res.message || `Sub-category "${res.data.name}" updated successfully`,
          'Sub-Category Updated'
        );
      } else {
        // Create
        const res = await productSubCategoryService.create({
          categoryId: values.categoryId,
          name: values.name,
          slug: values.slug,
          image_url: values.image_url,
          is_active: values.is_active,
        });

        const itemToStore: ProductSubCategory = {
          ...res.data,
          category: res.data.category || (parentCat ? {
            id: parentCat.id,
            uniqueId: parentCat.uniqueId,
            title: parentCat.title,
            imageUrl: parentCat.imageUrl,
          } : undefined),
        };

        setSubCategories((prev) => [...prev, itemToStore]);
        showToast(
          'success',
          res.message || `Sub-category "${res.data.name}" created successfully`,
          'Sub-Category Created'
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save sub-category to server';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete -> calls DELETE /api/v1/product-sub-categories/:id
  const handleDeleteConfirm = async () => {
    if (!deletingSubCategory) return;
    setIsDeleting(true);
    try {
      const targetId = deletingSubCategory.id || deletingSubCategory.slug;
      const res = await productSubCategoryService.delete(targetId);
      setSubCategories((prev) =>
        prev.filter((item) => item.id !== targetId && item.slug !== targetId)
      );
      showToast(
        'success',
        res.message || `Deleted "${deletingSubCategory.name}" successfully.`,
        'Sub-Category Deleted'
      );
      setIsDeleteModalOpen(false);
      setDeletingSubCategory(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete sub-category.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status toggle
  const handleToggleActive = async (id: string) => {
    const current = subCategories.find((s) => s.id === id || s.slug === id);
    if (!current) return;

    try {
      const targetId = current.id || current.slug;
      const res = await productSubCategoryService.toggleActive(targetId, current.isActive);
      setSubCategories((prev) =>
        prev.map((item) =>
          item.id === id || item.slug === id ? { ...item, isActive: res.data.isActive } : item
        )
      );
      showToast(
        'success',
        `"${current.name}" is now ${!current.isActive ? 'Active' : 'Inactive'}.`,
        'Status Changed'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle status.', 'Error');
    }
  };

  // Stats
  const totalCount = subCategories.length;
  const activeCount = subCategories.filter((s) => s.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return {
    subCategories,
    filteredSubCategories,
    parentCategories,
    categoryMap,
    isLoading,
    isLiveApi,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedParentCategory,
    setSelectedParentCategory,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    totalCount,
    activeCount,
    inactiveCount,
    isFormModalOpen,
    editingSubCategory,
    isDeleteModalOpen,
    deletingSubCategory,
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
    handleToggleActive,
  };
}
