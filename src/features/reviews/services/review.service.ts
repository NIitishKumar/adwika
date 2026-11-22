import { authFetch, API_BASE_URL } from '@/config/api.config';
import { productService } from '@/features/admin/services/product.service';
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
    productName: item?.productName || item?.product?.name || item?.product?.title || '',
    productSlug: item?.productSlug || item?.product?.slug || '',
    productImageUrl: item?.productImageUrl || item?.product?.imageUrl || item?.product?.image || '',
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
  // 1. Calculate fallback distribution from the actual reviews list
  const computedDistribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let computedSum = 0;
  fallbackReviews.forEach((r) => {
    const rawVal = Number(r.rating);
    const star = Math.min(5, Math.max(1, Math.round(isNaN(rawVal) ? 5 : rawVal))) as 1 | 2 | 3 | 4 | 5;
    computedDistribution[star] = (computedDistribution[star] || 0) + 1;
    computedSum += Number(r.rating) || star;
  });

  const computedTotal = fallbackReviews.length;
  const computedAverage = computedTotal > 0 ? Number((computedSum / computedTotal).toFixed(1)) : 0;

  // 2. Extract distribution from backend stats if available
  const rawDist =
    stats?.distribution ||
    stats?.ratingDistribution ||
    stats?.ratingsDistribution ||
    stats?.breakdown ||
    stats?.ratingBreakdown ||
    stats?.stars ||
    stats?.counts ||
    null;

  const extractedDistribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let hasExtractedNonZero = false;

  if (Array.isArray(rawDist)) {
    // Array format: [ { rating: 5, count: 10 }, ... ] or [ { star: 5, count: 10 } ]
    rawDist.forEach((item) => {
      const star = Number(item?.rating ?? item?.star ?? item?._id ?? item?.stars);
      const count = Number(item?.count ?? item?.total ?? item?.value ?? 0);
      if (star >= 1 && star <= 5 && !isNaN(count)) {
        extractedDistribution[star as 1 | 2 | 3 | 4 | 5] = count;
        if (count > 0) hasExtractedNonZero = true;
      }
    });
  } else if (rawDist && typeof rawDist === 'object') {
    // Object format: { '5': 10, '4': 2, ... } or { star5: 10, ... }
    ([1, 2, 3, 4, 5] as const).forEach((star) => {
      const val =
        rawDist[String(star)] ??
        rawDist[star] ??
        rawDist[`star${star}`] ??
        rawDist[`${star}_star`] ??
        rawDist[`${star}Star`] ??
        0;
      const count = Number(val);
      if (!isNaN(count) && count > 0) {
        extractedDistribution[star] = count;
        hasExtractedNonZero = true;
      }
    });
  }

  // 3. Resolve final distribution: If backend returned valid non-zero distribution counts, use it.
  // Otherwise, fallback to the distribution computed from the actual reviews list.
  const finalDistribution = hasExtractedNonZero ? extractedDistribution : computedDistribution;

  const distSum =
    finalDistribution[1] +
    finalDistribution[2] +
    finalDistribution[3] +
    finalDistribution[4] +
    finalDistribution[5];

  const totalReviews = Math.max(
    Number(stats?.totalReviews ?? stats?.total ?? stats?.count ?? 0),
    distSum,
    computedTotal
  );

  let averageRating = Number(stats?.averageRating ?? stats?.average ?? stats?.rating ?? 0);
  if (averageRating <= 0 || isNaN(averageRating)) {
    if (distSum > 0) {
      const weightedSum =
        finalDistribution[1] * 1 +
        finalDistribution[2] * 2 +
        finalDistribution[3] * 3 +
        finalDistribution[4] * 4 +
        finalDistribution[5] * 5;
      averageRating = Number((weightedSum / distSum).toFixed(1));
    } else {
      averageRating = computedAverage;
    }
  }

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
    distribution: finalDistribution,
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
   * GET /api/v1/product-reviews
   * Fetches customer reviews for the storefront / home page
   */
  async getAllReviews(limit = 12): Promise<ProductReview[]> {
    try {
      let res = await authFetch(`${API_BASE_URL}/product-reviews?limit=${limit}&sortBy=newest`, {
        headers: { Accept: 'application/json' },
      });

      if (res.status === 404) {
        res = await authFetch(`${API_BASE_URL}/reviews?limit=${limit}&sortBy=newest`, {
          headers: { Accept: 'application/json' },
        });
      }

      if (res.ok) {
        const json = await res.json();
        const payload = json.data?.data || json.data || json;
        const rawList = Array.isArray(payload?.reviews)
          ? payload.reviews
          : Array.isArray(payload)
          ? payload
          : [];

        if (rawList.length > 0) {
          return rawList.map(normalizeReview);
        }
      }
    } catch {
      // Continue to product reviews aggregation
    }

    // Direct aggregation across active products
    try {
      const prodRes = await productService.getAll({ status: 'ACTIVE' });
      const products = prodRes?.data || [];
      const collected: ProductReview[] = [];

      for (const prod of products.slice(0, 10)) {
        try {
          const revRes = await this.getProductReviews(prod.id || prod.productId || prod.slug, { limit: 4 });
          if (revRes.reviews && revRes.reviews.length > 0) {
            revRes.reviews.forEach((r) => {
              if (!collected.some((existing) => existing.id === r.id)) {
                collected.push({
                  ...r,
                  productName: r.productName || prod.name,
                  productSlug: r.productSlug || prod.slug,
                  productImageUrl: r.productImageUrl || prod.imageUrl,
                });
              }
            });
          }
        } catch {
          // ignore individual product review fetch errors
        }
        if (collected.length >= limit) break;
      }

      return collected.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.error('Failed to load reviews for home page:', err);
      return [];
    }
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
