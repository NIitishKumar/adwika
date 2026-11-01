import { useState, useEffect, useMemo } from 'react';
import {
  FitSize,
  FitSizeStatusFilter,
  FitSizeSortField,
  SortDirection,
} from '../../types/fitSize.types';
import { FitSizeFormData } from '../../schemas/fitSize.schema';
import { fitSizeService } from '../../services/fitSize.service';
import { ToastItem } from '../../components/common/AdminToast';

export function useFitSize() {
  const [fitSizes, setFitSizes] = useState<FitSize[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FitSizeStatusFilter>('ALL');
  const [sortField, setSortField] = useState<FitSizeSortField>('displayOrder');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingFitSize, setEditingFitSize] = useState<FitSize | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingFitSize, setDeletingFitSize] = useState<FitSize | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // High-Fidelity Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load Fit Sizes from backend API (/api/v1/fit-sizes)
  const loadFitSizes = async () => {
    setIsLoading(true);
    try {
      const res = await fitSizeService.getAll();
      setFitSizes(res.data);
      setIsLiveApi(res.fromApi);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load fit sizes from server', 'Load Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFitSizes();
  }, []);

  // Filtered & Sorted Fit Sizes calculation
  const filteredFitSizes = useMemo(() => {
    return fitSizes
      .filter((fit) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          fit.name.toLowerCase().includes(query) ||
          fit.fitCode.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && fit.isActive) ||
          (statusFilter === 'INACTIVE' && !fit.isActive);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'displayOrder') {
          comp = a.displayOrder - b.displayOrder;
        } else if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'fitCode') {
          comp = a.fitCode.localeCompare(b.fitCode);
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [fitSizes, searchQuery, statusFilter, sortField, sortDirection]);

  // Next Display Order helper
  const nextDisplayOrder = useMemo(() => {
    if (fitSizes.length === 0) return 1;
    return Math.max(...fitSizes.map((f) => f.displayOrder), 0) + 1;
  }, [fitSizes]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingFitSize(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (fit: FitSize) => {
    setEditingFitSize(fit);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingFitSize(null);
  };

  const handleOpenDelete = (fit: FitSize) => {
    setDeletingFitSize(fit);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingFitSize(null);
  };

  // Form submit -> calls POST /api/v1/fit-sizes or PATCH /api/v1/fit-sizes/:id
  const handleFormSubmit = async (values: FitSizeFormData) => {
    try {
      if (editingFitSize) {
        // Update
        const res = await fitSizeService.update(editingFitSize.id, {
          name: values.name,
          fitCode: values.fitCode,
          displayOrder: values.displayOrder,
          isActive: Boolean(values.isActive ?? true),
        });
        setFitSizes((prev) => prev.map((item) => (item.id === res.data.id ? res.data : item)));
        showToast('success', res.message || `Fit size "${res.data.name}" updated successfully`, 'Updated');
      } else {
        // Create
        const res = await fitSizeService.create({
          name: values.name,
          fitCode: values.fitCode,
          displayOrder: values.displayOrder,
          isActive: Boolean(values.isActive ?? true),
        });
        setFitSizes((prev) => [...prev, res.data]);
        showToast('success', res.message || `Fit size "${res.data.name}" created successfully`, 'Created');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save fit size to server';
      showToast('error', msg, 'Server Error');
      throw err;
    }
  };

  // Delete -> calls DELETE /api/v1/fit-sizes/:id
  const handleDeleteConfirm = async () => {
    if (!deletingFitSize) return;
    setIsDeleting(true);
    try {
      const res = await fitSizeService.delete(deletingFitSize.id);
      setFitSizes((prev) => prev.filter((item) => item.id !== deletingFitSize.id));
      showToast('success', res.message || `Deleted "${deletingFitSize.name}" successfully.`, 'Deleted');
      setIsDeleteModalOpen(false);
      setDeletingFitSize(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete fit size.', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status toggle
  const handleToggleActive = async (id: string) => {
    const current = fitSizes.find((f) => f.id === id);
    if (!current) return;

    try {
      const res = await fitSizeService.toggleActive(id, current.isActive);
      setFitSizes((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      showToast(
        'success',
        `"${res.data.name}" is now ${res.data.isActive ? 'Active' : 'Inactive'}.`,
        'Status Changed'
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to toggle status.', 'Error');
    }
  };

  // Display Order Swap
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = filteredFitSizes.findIndex((f) => f.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredFitSizes.length) return;

    const currentItem = filteredFitSizes[currentIndex];
    const targetItem = filteredFitSizes[targetIndex];

    try {
      const resCurrent = await fitSizeService.update(currentItem.id, {
        displayOrder: targetItem.displayOrder,
      });
      const resTarget = await fitSizeService.update(targetItem.id, {
        displayOrder: currentItem.displayOrder,
      });

      setFitSizes((prev) =>
        prev.map((item) => {
          if (item.id === resCurrent.data.id) return resCurrent.data;
          if (item.id === resTarget.data.id) return resTarget.data;
          return item;
        })
      );
      showToast('info', `Order priority updated for ${currentItem.name}.`, 'Reordered');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reorder items.');
    }
  };

  // Stats
  const totalCount = fitSizes.length;
  const activeCount = fitSizes.filter((f) => f.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return {
    // Data & filtering states
    fitSizes,
    filteredFitSizes,
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

    // Computed numbers
    totalCount,
    activeCount,
    inactiveCount,
    nextDisplayOrder,

    // Modal states
    isFormModalOpen,
    editingFitSize,
    isDeleteModalOpen,
    deletingFitSize,
    isDeleting,

    // Toast state
    toasts,
    dismissToast,

    // Action functions
    loadFitSizes,
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
