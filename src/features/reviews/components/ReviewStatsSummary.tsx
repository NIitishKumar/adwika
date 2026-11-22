import React from 'react';
import { ReviewStats } from '../types/review.types';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui';
import { Award, PenLine, LogIn } from 'lucide-react';
import { showToast } from '@/config/toast.config';

interface ReviewStatsSummaryProps {
  stats: ReviewStats;
  onOpenWriteModal: () => void;
  isLoggedIn: boolean;
}

export const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({
  stats,
  onOpenWriteModal,
  isLoggedIn,
}) => {
  const { averageRating, totalReviews, distribution } = stats;

  return (
    <div className="bg-[#121113] border border-neutral-800/90 p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 text-center md:text-left md:border-r border-neutral-800 md:pr-8">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
              {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              / 5.0
            </span>
          </div>

          <div className="mt-2.5 flex justify-center md:justify-start">
            <RatingStars rating={averageRating || 5} size={18} />
          </div>

          <p className="text-xs text-neutral-400 mt-2 font-sans">
            Based on{' '}
            <strong className="text-neutral-200 font-mono">
              {totalReviews} {totalReviews === 1 ? 'patron reflection' : 'patron reflections'}
            </strong>
          </p>

          <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-center md:justify-start gap-2 text-[11px] text-[#c9a87c]">
            <Award size={14} className="shrink-0" />
            <span className="uppercase tracking-wider font-sans">100% Authentic Handloom Appraisals</span>
          </div>
        </div>

        {/* Middle: 5-Star Breakdown Bars */}
        <div className="md:col-span-5 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-[11px] font-mono text-neutral-400 shrink-0 text-right">
                  {stars} ★
                </span>
                <div className="flex-1 h-2 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-[#c9a87c] transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-[10px] font-mono text-neutral-500 shrink-0 text-left">
                  {percentage}% ({count})
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Write Review CTA (For Logged-In Users Only) */}
        <div className="md:col-span-3 flex flex-col items-center justify-center text-center md:border-l border-neutral-800 md:pl-8">
          <p className="text-xs text-neutral-300 font-serif uppercase tracking-wider mb-2">
            Cherish an Adwika Heirloom?
          </p>
          <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">
            Share your reflection on texture, drape, and master craftsmanship.
          </p>
          {isLoggedIn ? (
            <Button
              variant="outline"
              size="md"
              onClick={onOpenWriteModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-[#3d332a] text-[#c9a87c] hover:bg-[#1a1714] text-xs py-2.5 px-5 uppercase tracking-widest cursor-pointer"
            >
              <PenLine size={14} />
              <span>Write an Appraisal</span>
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Authentication Required',
                    message: 'Please sign in to write an appraisal for this heirloom piece.',
                  });
                  window.dispatchEvent(new CustomEvent('adwika:open-account-modal'));
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border-neutral-800 text-neutral-300 hover:text-white hover:border-[#c9a87c] hover:bg-[#1a1714] text-xs py-2.5 px-4 uppercase tracking-widest cursor-pointer"
              >
                <LogIn size={13} className="text-[#c9a87c]" />
                <span>Sign In to Review</span>
              </Button>
              <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                Exclusively for registered patrons
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
