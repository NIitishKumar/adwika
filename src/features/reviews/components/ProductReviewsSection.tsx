import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductReview, ReviewStats } from '../types/review.types';
import { reviewService } from '../services/review.service';
import { ReviewStatsSummary } from './ReviewStatsSummary';
import { ReviewCard } from './ReviewCard';
import { WriteReviewModal } from './WriteReviewModal';
import { Button } from '@/components/ui';
import { Loader2, MessageSquare, ArrowUpDown, PenLine, LogIn } from 'lucide-react';
import { showToast } from '@/config/toast.config';
import { getCurrentUser, isLoggedIn } from '@/config/auth.config';
import type { AuthUser } from '@/features/auth/types/auth.types';

interface ProductReviewsSectionProps {
  productId: string;
  productName?: string;
  onOpenAuthModal?: () => void;
  className?: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName = 'Adwika Piece',
  onOpenAuthModal,
  className = '',
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const displayedReviews = useMemo(() => {
    if (!selectedRating) return reviews;
    return reviews.filter((r) => Math.round(Number(r.rating) || 5) === selectedRating);
  }, [reviews, selectedRating]);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const isUserLoggedIn = Boolean(currentUser) && isLoggedIn();

  // Listen for auth state changes so UI dynamically reacts when user logs in/out
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('adwika:auth-change', handleAuthChange);
    window.addEventListener('adwika:unauthorized', handleAuthChange);
    return () => {
      window.removeEventListener('adwika:auth-change', handleAuthChange);
      window.removeEventListener('adwika:unauthorized', handleAuthChange);
    };
  }, []);

  const handleOpenWriteModal = () => {
    if (!isLoggedIn()) {
      showToast({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please sign in to write an appraisal for this heirloom piece.',
      });
      window.dispatchEvent(new CustomEvent('adwika:open-account-modal'));
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setEditingReview(null);
    setIsWriteModalOpen(true);
  };

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const data = await reviewService.getProductReviews(productId, { sortBy });
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you wish to withdraw this reflection?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      showToast({
        type: 'success',
        title: 'Appraisal Withdrawn',
        message: 'Your review has been removed.',
      });
      fetchReviews();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.message || 'Could not delete review.',
      });
    }
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setIsWriteModalOpen(true);
  };

  const handleSuccess = () => {
    setEditingReview(null);
    fetchReviews();
  };

  return (
    <div id="patron-reviews-section" className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-900">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#c9a87c]">
            Patron Reflections & Appraisals
          </span>
          <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-wider text-neutral-100 mt-1">
            Customer Reviews
          </h2>
        </div>

        {/* Sort Filter Selector */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 flex items-center gap-1 font-mono text-[11px] uppercase">
              <ArrowUpDown size={12} />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#121113] border border-neutral-800 text-neutral-200 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-[#c9a87c]"
            >
              <option value="newest">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Review Aggregate Summary Bar */}
      <ReviewStatsSummary
        stats={stats}
        onOpenWriteModal={handleOpenWriteModal}
        isLoggedIn={isUserLoggedIn}
        selectedRating={selectedRating}
        onSelectRating={setSelectedRating}
      />

      {/* Selected Rating Filter Banner */}
      {selectedRating && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded bg-[#181614] border border-[#3d332a] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-300">
              Showing appraisals with <strong className="text-[#c9a87c]">{selectedRating} ★</strong>
            </span>
            <span className="font-mono text-neutral-500">
              ({displayedReviews.length} {displayedReviews.length === 1 ? 'reflection' : 'reflections'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRating(null)}
            className="text-[11px] font-mono text-[#c9a87c] hover:underline cursor-pointer"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 size={24} className="animate-spin text-[#c9a87c]" />
          <span className="text-xs uppercase tracking-widest font-sans">
            Retrieving Patron Appraisals...
          </span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-14 px-6 border border-dashed border-neutral-800 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#181614] border border-[#3d332a] text-[#c9a87c] flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <h3 className="font-serif text-base uppercase tracking-wider text-neutral-200">
            Be the First to Appraise This Piece
          </h3>
          <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
            Every Adwika heirloom carries generations of craft lineage. Share your appraisal to guide fellow connoisseurs.
          </p>
          {isUserLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenWriteModal}
              className="mt-2 border-[#3d332a] text-[#c9a87c] hover:bg-[#1a1714] text-xs uppercase tracking-widest cursor-pointer"
            >
              <PenLine size={13} className="mr-1.5" />
              <span>Write the First Review</span>
            </Button>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenWriteModal}
                className="border-neutral-800 text-neutral-300 hover:text-white hover:border-[#c9a87c] hover:bg-[#1a1714] text-xs uppercase tracking-widest cursor-pointer"
              >
                <LogIn size={13} className="mr-1.5 text-[#c9a87c]" />
                <span>Sign In to Review</span>
              </Button>
              <span className="text-[10px] text-neutral-500 font-mono">
                Patron reflections require sign-in
              </span>
            </div>
          )}
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="py-12 px-6 border border-dashed border-neutral-800 text-center flex flex-col items-center gap-2">
          <p className="text-xs text-neutral-400">No {selectedRating}-star appraisals found.</p>
          <button
            type="button"
            onClick={() => setSelectedRating(null)}
            className="text-xs text-[#c9a87c] underline cursor-pointer"
          >
            Show all appraisals ({reviews.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUser?.id}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))}
        </div>
      )}

      {/* Write / Edit Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingReview(null);
        }}
        productId={productId}
        productName={productName}
        initialData={editingReview}
        onSuccess={handleSuccess}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
