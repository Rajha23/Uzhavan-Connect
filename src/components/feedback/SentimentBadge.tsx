import React from 'react';
import { FeedbackSentiment } from '../../types/feedback';

interface SentimentBadgeProps {
  sentiment: FeedbackSentiment;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const CONFIG: Record<FeedbackSentiment, { emoji: string; label: string; classes: string }> = {
  positive: { emoji: '🟢', label: 'Positive', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  neutral:  { emoji: '🟡', label: 'Neutral',  classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  negative: { emoji: '🔴', label: 'Negative', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
  mixed:    { emoji: '🟣', label: 'Mixed',    classes: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, showLabel = true, size = 'sm' }) => {
  const c = CONFIG[sentiment];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${c.classes} ${size === 'md' ? 'text-sm px-3 py-1' : ''}`}>
      <span>{c.emoji}</span>
      {showLabel && <span>{c.label}</span>}
    </span>
  );
};
