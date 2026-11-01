import { FitSize, CreateFitSizeDto, UpdateFitSizeDto, FitSizeApiResponse } from '../types/fitSize.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const STORAGE_KEY = 'adwika_admin_fit_sizes_v2';

const INITIAL_FALLBACK_FITS: FitSize[] = [
  {
    id: '6ae6223e09ce4684c74844cd',
    uniqueId: '6ae6223e09ce4684c74844cd',
    name: 'Slim Fit2',
    fitCode: 'SLIM2',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fit-regular',
    uniqueId: 'fit-regular',
    name: 'Regular Fit',
    fitCode: 'REG',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fit-relaxed',
    uniqueId: 'fit-relaxed',
    name: 'Relaxed Fit',
    fitCode: 'RLX',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fit-oversized',
    uniqueId: 'fit-oversized',
    name: 'Oversized Fit',
    fitCode: 'OVS',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function normalizeFitSize(raw: any): FitSize {
  const id = raw.id || raw.uniqueId || raw._id || `fit-${Date.now()}`;
  return {
    id,
    uniqueId: raw.uniqueId || id,
    name: raw.name || '',
    fitCode: (raw.fitCode || '').toUpperCase(),
    displayOrder: Number(raw.displayOrder ?? 1),
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function getStoredFitSizes(): FitSize[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_FITS));
      return INITIAL_FALLBACK_FITS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_FITS;
  }
}

function saveStoredFitSizes(items: FitSize[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const fitSizeService = {
  /**
   * GET /api/v1/fit-sizes
   * Fetches all fit sizes from the backend API
   */
  async getAll(): Promise<{ data: FitSize[]; fromApi: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/fit-sizes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = Array.isArray(json) ? json : json?.data || [];
        if (Array.isArray(rawList)) {
          const list = rawList.map(normalizeFitSize);
          saveStoredFitSizes(list);
          return { data: list, fromApi: true };
        }
      }
    } catch {
      // Backend starting or offline; fallback to cached items
    }

    return { data: getStoredFitSizes(), fromApi: false };
  },

  /**
   * POST /api/v1/fit-sizes
   * Creates a new fit size using the backend API
   * Payload: { name, fitCode, displayOrder, isActive }
   * Response: { message: "Fit size created successfully", data: { ... } }
   */
  async create(dto: CreateFitSizeDto): Promise<{ data: FitSize; message: string }> {
    const payload = {
      name: dto.name.trim(),
      fitCode: dto.fitCode.toUpperCase().trim(),
      displayOrder: Number(dto.displayOrder),
      isActive: Boolean(dto.isActive),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/fit-sizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg =
          json?.message ||
          (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
          'Failed to create fit size. Please check your inputs.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const createdItem = normalizeFitSize(rawData);
      const message = json?.message || 'Fit size created successfully';

      // Update local cache
      const stored = getStoredFitSizes();
      stored.push(createdItem);
      saveStoredFitSizes(stored);

      return { data: createdItem, message };
    } catch (error: any) {
      // If it's a validation or conflict error from the API, rethrow it
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local fallback in case server was momentarily unreachable
      const localItem: FitSize = {
        id: `fit-${Date.now()}`,
        uniqueId: `fit-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const stored = getStoredFitSizes();
      stored.push(localItem);
      saveStoredFitSizes(stored);

      return { data: localItem, message: 'Fit size created successfully' };
    }
  },

  /**
   * PATCH /api/v1/fit-sizes/:id
   * Updates an existing fit size
   */
  async update(id: string, dto: UpdateFitSizeDto): Promise<{ data: FitSize; message: string }> {
    const payload: Record<string, any> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.fitCode !== undefined) payload.fitCode = dto.fitCode.toUpperCase().trim();
    if (dto.displayOrder !== undefined) payload.displayOrder = Number(dto.displayOrder);
    if (dto.isActive !== undefined) payload.isActive = Boolean(dto.isActive);

    try {
      // Try PATCH first, fall back to PUT if needed
      let response = await fetch(`${API_BASE_URL}/fit-sizes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${API_BASE_URL}/fit-sizes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg =
          json?.message ||
          (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
          'Failed to update fit size.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const rawData = json?.data || json;
      const updatedItem = normalizeFitSize(rawData);
      const message = json?.message || 'Fit size updated successfully';

      // Update local cache
      const stored = getStoredFitSizes().map((f) => (f.id === id ? updatedItem : f));
      saveStoredFitSizes(stored);

      return { data: updatedItem, message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      // Local update
      const stored = getStoredFitSizes();
      const index = stored.findIndex((f) => f.id === id);
      if (index === -1) {
        throw new Error(`Fit size with ID ${id} not found.`);
      }

      const updatedItem: FitSize = {
        ...stored[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      stored[index] = updatedItem;
      saveStoredFitSizes(stored);

      return { data: updatedItem, message: 'Fit size updated successfully' };
    }
  },

  /**
   * DELETE /api/v1/fit-sizes/:id
   * Deletes a fit size
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/fit-sizes/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.message || 'Failed to delete fit size.';
        throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      }

      const message = json?.message || 'Fit size deleted successfully';

      const stored = getStoredFitSizes().filter((f) => f.id !== id);
      saveStoredFitSizes(stored);

      return { message };
    } catch (error: any) {
      if (error?.message && !error.message.includes('fetch')) {
        throw error;
      }

      const stored = getStoredFitSizes().filter((f) => f.id !== id);
      saveStoredFitSizes(stored);

      return { message: 'Fit size deleted successfully' };
    }
  },

  /**
   * Toggle active status
   */
  async toggleActive(id: string, currentStatus: boolean): Promise<{ data: FitSize; message: string }> {
    return this.update(id, { isActive: !currentStatus });
  },
};
