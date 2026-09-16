import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  label,
  size = 'md',
  readonly = false,
  showValue = true,
}) => {
  const [hovered, setHovered] = useState(0);

  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  const active = hovered || value;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-[#4a6350] min-w-[110px]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange(star)}
            className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= active
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-[#ccd5ae]'
              }`}
            />
          </button>
        ))}
        {showValue && value > 0 && (
          <span className="text-xs text-[#5c7065] ml-1 min-w-[60px]">{RATING_LABELS[value]}</span>
        )}
      </div>
    </div>
  );
};

// ─── Display-only compact star row ───────────────────────────────────────────

interface StarDisplayProps {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export const StarDisplay: React.FC<StarDisplayProps> = ({ value, max = 5, size = 'sm' }) => {
  const starSize = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-[#ccd5ae]'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-[#5c7065]">{value.toFixed(1)}</span>
    </span>
  );
};
