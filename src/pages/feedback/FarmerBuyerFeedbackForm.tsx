import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StarRatingInput } from '../../components/feedback/StarRatingInput';
import { QuickTagSelector } from '../../components/feedback/QuickTagSelector';
import { Send, ArrowLeft, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { FeedbackRatings } from '../../types/feedback';
import { analyzeFeedback } from '../../services/feedbackAiService';

const FARMER_TAGS = [
  'Paid promptly', 'Good communication', 'Last minute cancellation',
  'Repeat canceller', 'Professional', 'Cooperated with pickup',
  'Unclear requirements', 'Difficult to contact',
];

interface FarmerBuyerFeedbackFormProps {
  orderId?: string;
  buyerName?: string;
  productName?: string;
  onClose: () => void;
}

export const FarmerBuyerFeedbackForm: React.FC<FarmerBuyerFeedbackFormProps> = ({
  orderId = 'ORD-2024-001',
  buyerName = 'Buyer',
  productName = 'Product',
  onClose,
}) => {
  const { feedbackItems, submitFeedback } = useApp() as any;
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState<FeedbackRatings>({
    communication: 0,
    paymentReliability: 0,
    orderReliability: 0,
    cancellationBehaviour: 0,
    pickupCooperation: 0,
    overallBuyerExperience: 0,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const RATING_FIELDS: { key: keyof FeedbackRatings; label: string }[] = [
    { key: 'communication',       label: 'Communication' },
    { key: 'paymentReliability',  label: 'Payment Reliability' },
    { key: 'orderReliability',    label: 'Order Reliability' },
    { key: 'cancellationBehaviour', label: 'Cancellation Behaviour' },
    { key: 'pickupCooperation',   label: 'Pickup Cooperation' },
    { key: 'overallBuyerExperience', label: 'Overall Experience' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));

    const analysis = analyzeFeedback(
      comment,
      tags,
      ratings as Record<string, number | undefined>,
      feedbackItems || [],
      undefined,
      undefined,
      undefined
    );

    if (submitFeedback) {
      submitFeedback({
        userId: 'current-farmer',
        userType: 'farmer' as const,
        orderId,
        buyerName,
        productName,
        ratings,
        comment,
        tags,
        category: analysis.categories[0] || 'buyer_reliability',
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
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-base font-bold text-[#01472e] mb-2">Feedback Submitted!</h3>
        <p className="text-xs text-[#5c7065] mb-3">Your private feedback helps maintain a trustworthy marketplace.</p>
        <div className="text-xs bg-[#eaf4ec] rounded-xl px-4 py-2 text-[#01472e] border border-[#a3b18a]/30">
          🔒 This feedback is private and used only for platform trust analysis.
        </div>
        <button onClick={onClose} className="mt-4 px-6 py-2 bg-[#01472e] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#003b25] transition">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#ccd5ae]/40 bg-[#fefae0]/60">
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#ccd5ae]/20 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-[#5c7065]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#eaf4ec] flex items-center justify-center">
            <User className="w-4 h-4 text-[#01472e]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#01472e]">Rate This Buyer</h2>
            <p className="text-[10px] text-[#5c7065]">{buyerName} · Order #{orderId}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Privacy note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <strong>Private feedback:</strong> Your ratings will not be visible to the buyer. They are used for platform trust analysis and admin review only.
          </p>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4 space-y-3">
          <p className="text-xs font-semibold text-[#01472e] mb-1">Rate the buyer across these dimensions:</p>
          {RATING_FIELDS.map(({ key, label }) => (
            <StarRatingInput
              key={key}
              value={(ratings as any)[key] || 0}
              onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
              label={label}
            />
          ))}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
          <p className="text-xs font-medium text-[#4a6350] mb-2">Quick Tags</p>
          <QuickTagSelector tags={FARMER_TAGS} selected={tags} onChange={setTags} />
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
          <p className="text-xs font-medium text-[#4a6350] mb-2">Additional comments (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience with this buyer..."
            rows={3}
            className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 p-2.5 resize-none focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.values(ratings).filter((v) => v && v > 0).length < 3}
          className="w-full py-3 bg-[#01472e] text-white rounded-2xl font-medium text-sm hover:bg-[#003b25] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Submitting...</>
          ) : (
            <><Send className="w-4 h-4" />Submit Private Feedback</>
          )}
        </button>
      </div>
    </div>
  );
};
