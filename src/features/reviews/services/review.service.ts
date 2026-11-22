import { authFetch, API_BASE_URL } from '@/config/api.config';
import {
  ProductReview,
  ReviewStats,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryParams,
  ProductReviewsResponse,
} from '../types/review.types';

function normalizeReview(item: any): ProductReview {
  return {
    id: String(item?.id || item?._id || item?.uniqueId || ''),
    uniqueId: item?.uniqueId || item?.id || item?._id,
    _id: item?._id,
    productId: String(item?.productId || item?.product_id || item?.product?.id || item?.product?._id || ''),
    userId: item?.userId || item?.user_id || item?.user?.id,
    rating: Number(item?.rating ?? 5),
    title: item?.title || '',
    comment: item?.comment || item?.description || '',
    images: Array.isArray(item?.images) ? item.images : item?.image ? [item.image] : [],
    isVerifiedPurchase: Boolean(item?.isVerifiedPurchase ?? item?.is_verified_purchase ?? item?.verified),
    helpfulVotes: Number(item?.helpfulVotes ?? item?.helpful_votes ?? item?.likesCount ?? 0),
    hasVotedHelpful: Boolean(item?.hasVotedHelpful ?? item?.isHelpful),
    user: {
      id: item?.user?.id || item?.user?._id || item?.userId,
      name: item?.user?.name || item?.userName || item?.user_name || 'Valued Patron',
      avatar: item?.user?.avatar || item?.user?.imageUrl,
    },
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
    updatedAt: item?.updatedAt || item?.updated_at,
  };
}

function normalizeStats(stats: any, fallbackReviews: ProductReview[]): ReviewStats {
  if (stats && typeof stats === 'object') {
    const rawDist = stats.distribution || {};
    return {
      averageRating: Number(stats.averageRating ?? stats.average ?? 0),
      totalReviews: Number(stats.totalReviews ?? stats.total ?? 0),
      distribution: {
        1: Number(rawDist['1'] ?? rawDist[1] ?? 0),
        2: Number(rawDist['2'] ?? rawDist[2] ?? 0),
        3: Number(rawDist['3'] ?? rawDist[3] ?? 0),
        4: Number(rawDist['4'] ?? rawDist[4] ?? 0),
        5: Number(rawDist['5'] ?? rawDist[5] ?? 0),
      },
    };
  }

  // Derive stats if not directly provided in payload
  const total = fallbackReviews.length;
  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  fallbackReviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
    distribution[rounded] = (distribution[rounded] || 0) + 1;
    sum += r.rating;
  });

  return {
    averageRating: Number((sum / total).toFixed(1)),
    totalReviews: total,
    distribution,
  };
}

export const reviewService = {
  /**
   * POST /api/v1/product-reviews (or /reviews)
   * Create a new product review (auto-detects verified purchase)
   */
  async createReview(dto: CreateReviewDto): Promise<ProductReview> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to submit review.');
    }

    const data = await res.json();
    const candidate = data.data?.data || data.data || data;
    return normalizeReview(candidate);
  },

  /**
   * GET /api/v1/product-reviews/product/:productId
   * Fetches reviews and rating stats (distribution & average) for a product
   */
  async getProductReviews(
    productId: string,
    params?: ReviewQueryParams
  ): Promise<ProductReviewsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString() ? `?${query.toString()}` : '';

    let res = await authFetch(`${API_BASE_URL}/product-reviews/product/${encodeURIComponent(productId)}${qs}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/product/${encodeURIComponent(productId)}${qs}`, {
        headers: { Accept: 'application/json' },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch reviews.');
    }

    const data = await res.json();
    const payload = data.data?.data || data.data || data;

    const rawReviews = Array.isArray(payload?.reviews)
      ? payload.reviews
      : Array.isArray(payload)
      ? payload
      : [];

    const reviews = rawReviews.map(normalizeReview);
    const stats = normalizeStats(payload?.stats, reviews);

    return { stats, reviews };
  },

  /**
   * GET /api/v1/product-reviews/my-reviews
   * Fetches all reviews submitted by the logged-in user
   */
  async getMyReviews(): Promise<ProductReview[]> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews/my-reviews`, {
      headers: { Accept: 'application/json' },
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers: { Accept: 'application/json' },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch your reviews.');
    }

    const data = await res.json();
    const list = data.data?.data || data.data || data;
    if (Array.isArray(list)) {
      return list.map(normalizeReview);
    }
    return [];
  },

  /**
   * GET /api/v1/product-reviews/:id
   */
  async getReviewById(id: string): Promise<ProductReview> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/${encodeURIComponent(id)}`);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to fetch review details.');
    }

    const data = await res.json();
    return normalizeReview(data.data?.data || data.data || data);
  },

  /**
   * PATCH /api/v1/product-reviews/:id
   */
  async updateReview(id: string, dto: UpdateReviewDto): Promise<ProductReview> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to update review.');
    }

    const data = await res.json();
    return normalizeReview(data.data?.data || data.data || data);
  },

  /**
   * DELETE /api/v1/product-reviews/:id
   */
  async deleteReview(id: string): Promise<void> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to delete review.');
    }
  },

  /**
   * POST /api/v1/product-reviews/:id/helpful
   * Toggles helpful upvote
   */
  async toggleHelpful(id: string): Promise<{ helpfulVotes: number; isHelpful: boolean }> {
    let res = await authFetch(`${API_BASE_URL}/product-reviews/${encodeURIComponent(id)}/helpful`, {
      method: 'POST',
    });

    if (res.status === 404) {
      res = await authFetch(`${API_BASE_URL}/reviews/${encodeURIComponent(id)}/helpful`, {
        method: 'POST',
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Failed to vote on review.');
    }

    const data = await res.json();
    const result = data.data?.data || data.data || data;
    return {
      helpfulVotes: Number(result?.helpfulVotes ?? result?.helpful_votes ?? result?.count ?? 0),
      isHelpful: Boolean(result?.isHelpful ?? result?.voted ?? true),
    };
  },
};
