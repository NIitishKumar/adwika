export interface ReviewUser {
  id?: string;
  name?: string;
  avatar?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    [key: string]: number;
  };
}

export interface ProductReview {
  id: string;
  uniqueId?: string;
  _id?: string;
  productId: string;
  userId?: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  hasVotedHelpful?: boolean;
  user?: ReviewUser;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewDto {
  productId: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'highest' | 'lowest' | 'helpful';
}

export interface ProductReviewsResponse {
  stats: ReviewStats;
  reviews: ProductReview[];
}
