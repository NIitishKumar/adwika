import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductReview } from '../types/review.types';
import { reviewService } from '../services/review.service';
import { RatingStars } from './RatingStars';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  X,
} from 'lucide-react';

interface HomeReviewsSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const HomeReviewsSection: React.FC<HomeReviewsSectionProps> = ({
  className = '',
  title = 'Reflections From Connoisseurs',
  subtitle = 'Authentic appraisals celebrating the weave density, drape silhouette, and heirloom craftsmanship of Adwika.',
}) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeReviews = async () => {
      setIsLoading(true);
      try {
        const data = await reviewService.getAllReviews(12);
        if (isMounted) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to load home reviews:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHomeReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 380;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // If loading is done and there are 0 reviews in database, do not render an empty section
  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <section
      id="home-patron-reviews"
      className={`bg-[#080809] text-neutral-100 py-20 px-6 md:px-12 border-t border-neutral-900 relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#c9a87c]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1560px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a87c]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c9a87c]">
                Voices of Our Patrons · Verified Appraisals
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider font-normal text-neutral-100 leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans mt-2 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Controls: Rating Badge & Navigation Arrows */}
          <div className="flex items-center gap-4 shrink-0">
            {reviews.length > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded bg-[#121113] border border-neutral-800 text-xs">
                <RatingStars rating={Number(calculateAverageRating())} size={14} />
                <span className="font-serif font-light text-white text-sm">
                  {calculateAverageRating()}
                </span>
                <span className="text-neutral-500 font-mono text-[11px]">
                  ({reviews.length} {reviews.length === 1 ? 'reflection' : 'reflections'})
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full border border-neutral-800 bg-[#121110] hover:border-[#c9a87c] hover:bg-[#1a1714] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                aria-label="Previous reviews"
                title="Previous reviews"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full border border-neutral-800 bg-[#121110] hover:border-[#c9a87c] hover:bg-[#1a1714] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                aria-label="Next reviews"
                title="Next reviews"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Carousel Track */}
        <div className="relative mt-8">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
          >
            {isLoading ? (
              /* Skeleton Loading Placeholders */
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[320px] sm:w-[380px] shrink-0 snap-start bg-[#121113]/70 border border-neutral-900 p-6 rounded-sm space-y-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-neutral-800 rounded" />
                    <div className="w-16 h-3 bg-neutral-800 rounded" />
                  </div>
                  <div className="w-48 h-5 bg-neutral-800 rounded" />
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-neutral-800/60 rounded" />
                    <div className="w-5/6 h-3 bg-neutral-800/60 rounded" />
                    <div className="w-3/4 h-3 bg-neutral-800/60 rounded" />
                  </div>
                  <div className="pt-4 border-t border-neutral-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800" />
                    <div className="w-28 h-3 bg-neutral-800 rounded" />
                  </div>
                </div>
              ))
            ) : (
              /* Review Cards */
              reviews.map((review) => {
                const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const patronName = review.user?.name || 'Valued Patron';
                const patronInitials = patronName
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'AP';

                const targetProductId = review.productSlug || review.productId;

                return (
                  <div
                    key={review.id}
                    className="w-[320px] sm:w-[380px] shrink-0 snap-start bg-[#121113]/90 border border-neutral-800/80 hover:border-[#c9a87c]/60 p-6 rounded-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 group select-none"
                  >
                    <div>
                      {/* Rating & Verified Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <RatingStars rating={review.rating} size={14} />
                        <span className="text-[10px] font-mono text-neutral-500">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Review Title */}
                      <h3 className="font-serif text-sm uppercase tracking-wide text-neutral-100 mt-3 font-medium line-clamp-1 group-hover:text-[#c9a87c] transition-colors">
                        {review.title}
                      </h3>

                      {/* Review Comment */}
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed line-clamp-4 mt-2 italic font-light">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      {/* Attached Customer Photos */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-neutral-900">
                          {review.images.slice(0, 3).map((imgUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewImage(imgUrl)}
                              className="relative w-12 h-12 rounded border border-neutral-800 overflow-hidden hover:border-[#c9a87c] transition-all cursor-zoom-in shrink-0 group/thumb"
                              title="Inspect patron photography"
                            >
                              <img
                                src={imgUrl}
                                alt={`Review photo ${idx + 1}`}
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                              />
                            </button>
                          ))}
                          {review.images.length > 3 && (
                            <span className="text-[10px] font-mono text-neutral-500 pl-1">
                              +{review.images.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Patron & Associated Garment */}
                    <div className="mt-5 pt-4 border-t border-neutral-900/90 space-y-3">
                      {/* Patron Info */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1b1917] border border-[#3d332a] text-[#c9a87c] font-mono text-[10px] flex items-center justify-center font-bold tracking-wider">
                            {patronInitials}
                          </div>
                          <div>
                            <span className="text-xs font-sans text-neutral-200 font-medium block">
                              {patronName}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-[#c9a87c] font-sans">
                              <ShieldCheck size={11} className="shrink-0" />
                              <span>Verified Patron</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                          <Sparkles size={11} className="text-[#c9a87c]" />
                          <span>Adwika Archive</span>
                        </div>
                      </div>

                      {/* Associated Garment Preview Link (if available) */}
                      {review.productName && targetProductId && (
                        <div
                          onClick={() => navigate(`/product/${targetProductId}`)}
                          className="flex items-center justify-between p-2 rounded bg-[#0d0c0e] border border-neutral-900 hover:border-neutral-700 transition-colors cursor-pointer group/garment"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {review.productImageUrl && (
                              <img
                                src={review.productImageUrl}
                                alt={review.productName}
                                className="w-7 h-7 rounded object-cover border border-neutral-800 shrink-0"
                              />
                            )}
                            <span className="text-[11px] font-serif uppercase tracking-wider text-neutral-300 truncate group-hover/garment:text-white transition-colors">
                              {review.productName}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#c9a87c] flex items-center gap-0.5 group-hover/garment:translate-x-0.5 transition-transform shrink-0">
                            View <ArrowUpRight size={11} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal for Patron Review Images */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Close photo preview"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] p-1 bg-neutral-900 border border-neutral-800 rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Patron Review Fullsize"
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </section>
  );
};
