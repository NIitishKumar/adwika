import React, { useState } from 'react';
import { ProductReview } from '../types/review.types';
import { RatingStars } from './RatingStars';
import { reviewService } from '../services/review.service';
import { ThumbsUp, ShieldCheck, Trash2, Edit3 } from 'lucide-react';
import { showToast } from '@/config/toast.config';
import { isLoggedIn } from '@/config/auth.config';

interface ReviewCardProps {
  review: ProductReview;
  currentUserId?: string | null;
  onEdit?: (review: ProductReview) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes || 0);
  const [isHelpful, setIsHelpful] = useState(Boolean(review.hasVotedHelpful));
  const [isVoting, setIsVoting] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  const isAuthor =
    Boolean(currentUserId) &&
    (currentUserId === review.userId || currentUserId === review.user?.id);

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleToggleHelpful = async () => {
    if (!isLoggedIn()) {
      showToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to vote on patron appraisals.',
      });
      window.dispatchEvent(new CustomEvent('adwika:open-account-modal'));
      return;
    }
    setIsVoting(true);
    try {
      const res = await reviewService.toggleHelpful(review.id);
      setHelpfulVotes(res.helpfulVotes);
      setIsHelpful(res.isHelpful);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.message || 'Unable to register helpful vote.',
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-[#121113]/70 border border-neutral-900 p-5 sm:p-6 space-y-4 transition-colors hover:border-neutral-800">
      {/* Header: Rating + Date + Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <RatingStars rating={review.rating} size={15} />
          <h4 className="font-serif text-sm uppercase tracking-wide text-neutral-100 mt-1.5 font-medium">
            {review.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="text-[11px] font-mono text-neutral-500">{formattedDate}</span>

          {isAuthor && (
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="p-1 text-neutral-500 hover:text-[#c9a87c] transition-colors"
                  title="Edit Review"
                  aria-label="Edit Review"
                >
                  <Edit3 size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(review.id)}
                  className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                  title="Delete Review"
                  aria-label="Delete Review"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Body */}
      <p className="text-xs text-neutral-300 leading-relaxed font-sans">{review.comment}</p>

      {/* Customer Images Gallery */}
      {review.images && review.images.length > 0 && (
        <div className="flex items-center gap-2 pt-1 overflow-x-auto">
          {review.images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImagePreview(imgUrl)}
              className="relative w-14 h-14 rounded border border-neutral-800 overflow-hidden shrink-0 group cursor-pointer focus:outline-none"
            >
              <img
                src={imgUrl}
                alt={`Patron view ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer: Patron Info + Verified Badge + Helpful Vote */}
      <div className="pt-3 border-t border-neutral-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-800 text-[#c9a87c] font-serif text-[10px] flex items-center justify-center uppercase">
            {review.user?.name ? review.user.name.charAt(0) : 'P'}
          </div>
          <span className="text-xs font-serif text-neutral-200 uppercase tracking-wide">
            {review.user?.name || 'Verified Patron'}
          </span>

          {review.isVerifiedPurchase && (
            <span className="inline-flex items-center gap-1 text-[10px] font-sans text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              <ShieldCheck size={11} />
              <span>Verified Patron</span>
            </span>
          )}
        </div>

        {/* Helpful Vote Button */}
        <button
          type="button"
          disabled={isVoting}
          onClick={handleToggleHelpful}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded transition-colors ${
            isHelpful
              ? 'bg-[#c9a87c]/15 text-[#c9a87c] border border-[#c9a87c]/40 font-medium'
              : 'text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-900'
          }`}
          title="Mark review as helpful"
        >
          <ThumbsUp size={11} className={isHelpful ? 'fill-[#c9a87c]' : ''} />
          <span>Helpful ({helpfulVotes})</span>
        </button>
      </div>

      {/* Image Preview Modal */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#121113] border border-neutral-800 p-2">
            <img
              src={activeImagePreview}
              alt="Enlarged patron reflection"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="text-center text-[11px] font-mono text-neutral-400 mt-2 uppercase tracking-widest">
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
