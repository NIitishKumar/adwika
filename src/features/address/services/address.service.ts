import { authFetch, API_BASE_URL } from '@/config/api.config';
import {
  UserAddress,
  CreateAddressDto,
  UpdateAddressDto,
} from '../types/address.types';

/**
 * Normalizes an address object from the API response
 */
function normalizeAddress(item: any): UserAddress {
  return {
    id: String(item?.id || item?._id || item?.uniqueId || ''),
    _id: item?._id,
    uniqueId: item?.uniqueId || item?.id || item?._id,
    userId: item?.userId,
    name: item?.name || '',
    phone: item?.phone || '',
    alternatePhone: item?.alternatePhone,
    addressLine1: item?.addressLine1 || '',
    addressLine2: item?.addressLine2,
    landmark: item?.landmark,
    city: item?.city || '',
    state: item?.state || '',
    postalCode: item?.postalCode || '',
    country: item?.country || 'India',
    addressType: item?.addressType || 'HOME',
    isDefault: Boolean(item?.isDefault),
    createdAt: item?.createdAt,
    updatedAt: item?.updatedAt,
  };
}

/**
 * Extracts list from API response
 */
function extractAddresses(resData: any): UserAddress[] {
  if (!resData) return [];
  const list = resData.data?.data || resData.data || resData;
  if (Array.isArray(list)) {
    return list.map(normalizeAddress);
  }
  return [];
}

export const addressService = {
  /**
   * GET /api/v1/user-addresses (or /addresses)
   * Fetches all addresses for the authenticated user from the API
   */
  async getAddresses(): Promise<UserAddress[]> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses`);

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses`);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch addresses.');
    }

    const data = await res.json();
    return extractAddresses(data);
  },

  /**
   * GET /api/v1/user-addresses/default
   * Retrieves the current user's default delivery address
   */
  async getDefaultAddress(): Promise<UserAddress | null> {
    try {
      let res = await authFetch(`${API_BASE_URL}/user-addresses/default`);
      if (res.status === 404) {
        res = await authFetch(`${API_BASE_URL}/addresses/default`);
      }

      if (res.ok) {
        const data = await res.json();
        const candidate = data.data?.data || data.data || data;
        if (candidate && (candidate.id || candidate._id || candidate.uniqueId)) {
          return normalizeAddress(candidate);
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback: lookup from user addresses list
    const list = await this.getAddresses().catch(() => []);
    if (list.length === 0) return null;
    return list.find((a) => a.isDefault) || list[0] || null;
  },

  /**
   * GET /api/v1/user-addresses/:id
   */
  async getAddressById(id: string): Promise<UserAddress> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses/${id}`);
    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses/${id}`);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch address.');
    }

    const data = await res.json();
    return normalizeAddress(data.data?.data || data.data || data);
  },

  /**
   * POST /api/v1/user-addresses (or /addresses)
   * Creates a new address in the backend
   */
  async createAddress(dto: CreateAddressDto): Promise<UserAddress> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to create address.');
    }

    const data = await res.json();
    return normalizeAddress(data.data?.data || data.data || data);
  },

  /**
   * PATCH /api/v1/user-addresses/:id
   */
  async updateAddress(id: string, dto: UpdateAddressDto): Promise<UserAddress> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to update address.');
    }

    const data = await res.json();
    return normalizeAddress(data.data?.data || data.data || data);
  },

  /**
   * PATCH /api/v1/user-addresses/:id/default (or set-default)
   */
  async setDefaultAddress(id: string): Promise<UserAddress> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses/${id}/default`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/user-addresses/${id}/set-default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to set default address.');
    }

    const data = await res.json();
    return normalizeAddress(data.data?.data || data.data || data);
  },

  /**
   * DELETE /api/v1/user-addresses/:id
   */
  async deleteAddress(id: string): Promise<void> {
    let res = await authFetch(`${API_BASE_URL}/user-addresses/${id}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'DELETE',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to delete address.');
    }
  },
};
