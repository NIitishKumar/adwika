import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 - 5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  showScore?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  interactive = false,
  onChange,
  className = '',
  showScore = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = activeRating >= starValue;
          const isHalf = !isFilled && activeRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`p-0 bg-transparent border-0 transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-110 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              }`}
              aria-label={`${starValue} star`}
            >
              <Star
                size={size}
                className={
                  isFilled
                    ? 'fill-[#c9a87c] text-[#c9a87c]'
                    : isHalf
                    ? 'fill-[#c9a87c]/60 text-[#c9a87c]'
                    : 'fill-transparent text-neutral-600'
                }
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-mono text-[#c9a87c] tracking-wider ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
