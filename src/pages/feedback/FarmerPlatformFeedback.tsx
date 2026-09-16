import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StarRatingInput } from '../../components/feedback/StarRatingInput';
import { QuickTagSelector } from '../../components/feedback/QuickTagSelector';
import { Send, CheckCircle2, Sprout } from 'lucide-react';
import { FeedbackRatings } from '../../types/feedback';
import { analyzeFeedback } from '../../services/feedbackAiService';

const PLATFORM_TAGS = [
  'Easy to use', 'Good price recommendations', 'Helpful demand forecast',
  'Pickup timing needs improvement', 'Payment is fast', 'Need more buyers',
  'App is slow', 'Language support needed', 'FPO hub is helpful',
  'Communication is clear', 'Need better crop advice',
];

const RATING_FIELDS: { key: keyof FeedbackRatings; label: string; category: string }[] = [
  { key: 'orderProcess',        label: 'Order Process',         category: 'Platform' },
  { key: 'paymentProcess',      label: 'Payment Process',       category: 'Platform' },
  { key: 'pickupDelivery',      label: 'Pickup / Delivery',     category: 'Operations' },
  { key: 'communication',       label: 'Communication',         category: 'Platform' },
  { key: 'cropRecommendations', label: 'Crop Recommendations',  category: 'Intelligence' },
  { key: 'priceRecommendations',label: 'Price Recommendations', category: 'Intelligence' },
  { key: 'fpoHubExperience',    label: 'FPO / Hub Experience',  category: 'Operations' },
  { key: 'overallPlatform',     label: 'Overall Platform',      category: 'Overall' },
];

export const FarmerPlatformFeedback: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { feedbackItems, submitFeedback } = useApp() as any;
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState<FeedbackRatings>({});
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const analysis = analyzeFeedback(comment, tags, ratings as Record<string, number | undefined>, feedbackItems || []);

    if (submitFeedback) {
      submitFeedback({
        userId: 'current-farmer',
        userType: 'farmer' as const,
        ratings,
        comment,
        tags,
        category: analysis.categories[0] || 'app_experience',
        sentiment: analysis.sentiment,
        feedbackType: analysis.feedbackType,
        priority: analysis.priority,
        aiConfidence: analysis.confidence,
        aiAnalysis: analysis,
        status: 'SUBMITTED' as const,
        pointsAwarded: 5,
      });
    }
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-[#01472e] mb-2">Thank you!</h3>
        <p className="text-sm text-[#5c7065] max-w-xs">Your platform feedback helps us build a better Uzhavan Connect for every farmer.</p>
        {onClose && (
          <button onClick={onClose} className="mt-6 px-6 py-2 bg-[#01472e] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#003b25] transition">
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#01472e] flex items-center justify-center">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-[#01472e]">Platform Feedback</h2>
          <p className="text-xs text-[#788c80]">Tell us how we can improve Uzhavan Connect for farmers like you</p>
        </div>
      </div>

      {/* Ratings by section */}
      {['Platform', 'Operations', 'Intelligence', 'Overall'].map((section) => {
        const fields = RATING_FIELDS.filter((f) => f.category === section);
        return (
          <div key={section} className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#788c80] uppercase tracking-wider mb-3">{section}</p>
            <div className="space-y-3">
              {fields.map(({ key, label }) => (
                <StarRatingInput
                  key={key}
                  value={(ratings as any)[key] || 0}
                  onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
                  label={label}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick tags */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
        <p className="text-xs font-medium text-[#4a6350] mb-2">Quick Feedback Tags</p>
        <QuickTagSelector tags={PLATFORM_TAGS} selected={tags} onChange={setTags} />
      </div>

      {/* Comment */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
        <p className="text-xs font-medium text-[#4a6350] mb-2">Suggestions or concerns (optional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share any specific suggestions, problems, or improvements you'd like to see..."
          rows={4}
          className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 p-3 resize-none focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || Object.values(ratings).filter((v) => v && v > 0).length < 2}
        className="w-full py-3.5 bg-[#01472e] text-white rounded-2xl font-semibold text-sm hover:bg-[#003b25] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Submitting...</>
        ) : (
          <><Send className="w-4 h-4" /> Submit Platform Feedback</>
        )}
      </button>
    </div>
  );
};
