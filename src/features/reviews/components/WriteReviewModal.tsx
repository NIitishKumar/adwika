import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from '@/components/ui';
import { RatingStars } from './RatingStars';
import { ProductReview, CreateReviewDto, UpdateReviewDto } from '../types/review.types';
import { reviewService } from '../services/review.service';
import { showToast } from '@/config/toast.config';
import { isLoggedIn } from '@/config/auth.config';
import {
  Sparkles,
  Loader2,
  X,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link2,
  Plus,
} from 'lucide-react';
import { uploadService } from '@/features/admin/services/upload.service';

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
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isManualUrlMode, setIsManualUrlMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadError(null);
    setUploadSuccess(false);
    setIsDragging(false);
    setImageUrlInput('');
    setIsUploadingImages(false);
  }, [initialData, isOpen]);

  const handleFilesProcess = async (fileList: FileList | File[]) => {
    setUploadError(null);
    setUploadSuccess(false);

    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    if (images.length + filesArray.length > 6) {
      setUploadError(`You can attach a maximum of 6 photographs (currently ${images.length}).`);
      return;
    }

    // Validate size and format using uploadService.validateFile (matches Add Product page)
    for (const f of filesArray) {
      const val = uploadService.validateFile(f);
      if (!val.valid) {
        setUploadError(val.error || `Invalid image: ${f.name}`);
        return;
      }
    }

    setIsUploadingImages(true);
    try {
      if (filesArray.length === 1) {
        const res = await uploadService.uploadImage(filesArray[0], { folder: 'reviews' });
        setImages((prev) => [...prev, res.secureUrl]);
      } else {
        const res = await uploadService.uploadMultipleImages(filesArray, { folder: 'reviews' });
        const newUrls = res.data.map((item) => item.secureUrl).filter(Boolean);
        setImages((prev) => [...prev, ...newUrls]);
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload photograph. Please try again.');
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesProcess(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting && !isUploadingImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSubmitting || isUploadingImages) return;
    if (e.dataTransfer.files) {
      handleFilesProcess(e.dataTransfer.files);
    }
  };

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
    if (images.length >= 6) {
      showToast({
        type: 'error',
        title: 'Limit Reached',
        message: 'Maximum 6 photographs allowed per appraisal.',
      });
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setUploadError(null);
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
      className="max-h-[92vh] overflow-y-auto"
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

        {/* Images Upload / Attachment (Reference from Add Product Page) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs uppercase tracking-wider text-neutral-300 font-medium">
              Attach Photographs (Optional)
              {images.length > 0 && (
                <span className="ml-1.5 font-mono text-[10px] text-[#c9a87c]">
                  ({images.length}/6)
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => {
                setIsManualUrlMode((prev) => !prev);
                setUploadError(null);
              }}
              disabled={isSubmitting || isUploadingImages}
              className="text-[11px] font-mono text-[#c9a87c] hover:text-[#e4cfb5] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Link2 size={12} />
              <span>{isManualUrlMode ? 'Upload from Device' : 'Paste Image URL'}</span>
            </button>
          </div>

          {/* Hidden Native File Input (supports single or multiple photo selection) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
            onChange={handleFileSelect}
            disabled={isSubmitting || isUploadingImages || images.length >= 6}
            className="hidden"
          />

          {isManualUrlMode ? (
            /* Manual URL Input Fallback Mode */
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.example.com/photo.jpg"
                  disabled={isSubmitting || isUploadingImages || images.length >= 6}
                  className="w-full bg-[#18171a] border border-neutral-800 focus:border-[#c9a87c] rounded px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleAddImage}
                disabled={isSubmitting || isUploadingImages || images.length >= 6}
                className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 rounded uppercase tracking-wider transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                Add URL
              </button>
            </div>
          ) : (
            /* Cloudinary Drag-and-Drop Dropzone (matching Add Product page styling) */
            images.length < 6 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isSubmitting && !isUploadingImages && images.length < 6) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 select-none ${
                  isDragging
                    ? 'border-[#c9a87c] bg-[#2a221b]/40 scale-[0.99]'
                    : 'border-[#38332e] bg-[#1a1816]/70 hover:border-[#c9a87c]/70 hover:bg-[#1f1d1a]'
                } ${isSubmitting || isUploadingImages ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isUploadingImages ? (
                  <div className="py-2 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={22} className="text-[#c9a87c] animate-spin" />
                    <p className="text-xs font-mono text-[#c9a87c]">
                      Uploading photograph(s) directly to Cloudinary...
                    </p>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      Preserving authentic weave details & high dynamic range
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                    <div className="w-9 h-9 rounded-full bg-[#24211e] border border-[#3d332a] flex items-center justify-center text-[#c9a87c]">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-200">
                        <span className="text-[#c9a87c] underline underline-offset-2">Click to upload</span> or drag & drop photographs
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        JPEG, PNG, WEBP, AVIF up to 10MB (select multiple)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Upload Status Banners */}
          {uploadError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 px-3 py-2 rounded">
              <AlertCircle size={13} className="shrink-0" />
              <span className="font-sans leading-tight">{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-2 rounded">
              <CheckCircle2 size={13} className="shrink-0" />
              <span className="font-sans">Photograph uploaded successfully!</span>
            </div>
          )}

          {/* Attached Images Gallery Preview */}
          {images.length > 0 && (
            <div className="pt-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                <span>Attached Photos ({images.length}/6)</span>
                {images.length >= 6 && (
                  <span className="text-amber-400 font-normal">Maximum photos attached</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-md border border-[#38332e] bg-[#121110] overflow-hidden group shadow-md"
                  >
                    <img
                      src={img}
                      alt={`Attached review preview ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1 py-0.2 rounded bg-black/75 text-neutral-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-1 bg-black/85 rounded-full text-white hover:text-rose-400 hover:bg-black transition-colors cursor-pointer"
                      title="Remove Image"
                      aria-label="Remove Image"
                    >
                      <X size={11} />
                    </button>
                    <a
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-1 right-1 p-1 bg-black/75 rounded text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View full-size photo"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                    </a>
                  </div>
                ))}

                {/* Add More Tile if < 6 and in file upload mode */}
                {images.length < 6 && !isManualUrlMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting || isUploadingImages}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-md border border-dashed border-[#38332e] hover:border-[#c9a87c] bg-[#181615] flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-[#c9a87c] transition-colors cursor-pointer disabled:opacity-50"
                    title="Add another photo"
                  >
                    <Plus size={16} />
                    <span className="text-[9px] font-mono uppercase tracking-wider">Add</span>
                  </button>
                )}
              </div>
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
