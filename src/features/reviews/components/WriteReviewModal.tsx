import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { RatingStars } from './RatingStars';
import { ProductReview, CreateReviewDto, UpdateReviewDto } from '../types/review.types';
import { reviewService } from '../services/review.service';
import { showToast } from '@/config/toast.config';
import { isLoggedIn } from '@/config/auth.config';
import { Sparkles, Loader2, X, Lock } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName?: string;
  initialData?: ProductReview | null;
  onSuccess: () => void;
  onOpenAuthModal?: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName = 'Adwika Heirloom',
  initialData,
  onSuccess,
  onOpenAuthModal,
}) => {
  const [rating, setRating] = useState<number>(initialData?.rating || 5);
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [comment, setComment] = useState<string>(initialData?.comment || '');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loggedIn = isLoggedIn();
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setTitle(initialData.title);
      setComment(initialData.comment);
      setImages(initialData.images || []);
    } else {
      setRating(5);
      setTitle('');
      setComment('');
      setImages([]);
    }
  }, [initialData, isOpen]);

  const handleAddImage = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      showToast({
        type: 'error',
        title: 'Invalid URL',
        message: 'Please enter a valid image URL (https://...).',
      });
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loggedIn) {
      showToast({
        type: 'error',
        title: 'Sign In Required',
        message: 'Please sign in to submit a verified patron appraisal.',
      });
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (!title.trim()) {
      showToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please provide a headline for your appraisal.',
      });
      return;
    }

    if (!comment.trim()) {
      showToast({
        type: 'error',
        title: 'Feedback Required',
        message: 'Please provide your reflections on this heirloom piece.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        const updatePayload: UpdateReviewDto = {
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        };
        await reviewService.updateReview(initialData.id, updatePayload);
        showToast({
          type: 'success',
          title: 'Appraisal Updated',
          message: 'Your reflection has been updated successfully.',
        });
      } else {
        const createPayload: CreateReviewDto = {
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        };
        await reviewService.createReview(createPayload);
        showToast({
          type: 'success',
          title: 'Appraisal Submitted',
          message: 'Thank you for documenting your heirloom appraisal.',
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: err?.message || 'Could not submit your review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOpen && !loggedIn) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Patron Sign-In Required"
        maxWidth="max-w-md"
      >
        <div className="p-4 sm:p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#181614] border border-[#3d332a] text-[#c9a87c] mx-auto flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-serif text-base uppercase tracking-wider text-neutral-100">
              Sign In to Appraise
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              To preserve authentic heirloom reflections, writing and updating product appraisals is reserved exclusively for registered patrons.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Button
              variant="filled"
              size="sm"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('adwika:open-account-modal'));
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="bg-[#c9a87c] text-black border-transparent hover:bg-[#d6b589] font-medium"
            >
              Sign In Now
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Patron Appraisal' : 'Write a Patron Appraisal'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-2 sm:p-4">
        {/* Subtitle */}
        <div className="pb-3 border-b border-neutral-800">
          <p className="text-xs text-neutral-400 font-sans">
            Reviewing:{' '}
            <strong className="text-neutral-100 font-serif uppercase tracking-wider">
              {productName}
            </strong>
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Verified purchases automatically earn the heirloom verified patron badge.
          </p>
        </div>

        {/* Rating Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
            Overall Rating
          </label>
          <div className="flex items-center gap-3">
            <RatingStars
              rating={rating}
              size={22}
              interactive={true}
              onChange={(newRating) => setRating(newRating)}
            />
            <span className="text-xs font-mono text-[#c9a87c]">
              {rating === 5
                ? '5.0 — Flawless Craftsmanship'
                : rating === 4
                ? '4.0 — High Quality'
                : rating === 3
                ? '3.0 — Met Expectations'
                : rating === 2
                ? '2.0 — Below Expectations'
                : '1.0 — Unsatisfactory'}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
            Headline / Appraisal Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stunning Silk Saree! Border work exceeded expectations"
            required
            className="w-full bg-[#18171a] border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[#c9a87c] transition-colors"
          />
        </div>

        {/* Review Comment */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
            Detailed Reflections *
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on the weave density, drape silhouette, artisanal texture, and unboxing..."
            required
            className="w-full bg-[#18171a] border border-neutral-800 rounded px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[#c9a87c] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Images Upload / Attachment */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
            Attach Heirloom Photos (Optional)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.example.com/photo.jpg"
                className="w-full bg-[#18171a] border border-neutral-800 rounded px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[#c9a87c] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 rounded uppercase tracking-wider transition-colors shrink-0"
            >
              Add URL
            </button>
          </div>

          {/* Attached Images List */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((img, i) => (
                <div key={i} className="relative w-14 h-14 rounded border border-neutral-800 overflow-hidden group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-white hover:text-rose-400"
                    title="Remove Image"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="filled"
            size="md"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>{isEditing ? 'Update Appraisal' : 'Submit Appraisal'}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
