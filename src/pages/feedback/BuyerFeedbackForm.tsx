import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StarRatingInput } from '../../components/feedback/StarRatingInput';
import { QuickTagSelector } from '../../components/feedback/QuickTagSelector';
import {
  Camera, Send, AlertCircle, Lightbulb, MessageSquare,
  CheckCircle2, Package, ArrowLeft, Truck, Star
} from 'lucide-react';
import { FeedbackRatings, FeedbackType, BuyerFeedbackFormState } from '../../types/feedback';
import { analyzeFeedback } from '../../services/feedbackAiService';

const QUICK_TAGS = [
  'Very fresh', 'Good quality', 'Quantity issue', 'Late delivery',
  'Damaged packaging', 'Wrong product', 'Poor communication',
  'Good value', 'Excellent service', 'On time', 'Friendly farmer',
  'Missing items',
];

const RATING_FIELDS: { key: keyof FeedbackRatings; label: string }[] = [
  { key: 'quality',          label: 'Product Quality' },
  { key: 'freshness',        label: 'Freshness' },
  { key: 'quantity',         label: 'Quantity Accuracy' },
  { key: 'packaging',        label: 'Packaging' },
  { key: 'delivery',         label: 'Delivery' },
  { key: 'value',            label: 'Value for Money' },
  { key: 'farmerReliability',label: 'Farmer Reliability' },
  { key: 'overall',          label: 'Overall Experience' },
];

interface BuyerFeedbackFormProps {
  orderId?: string;
  farmerName?: string;
  productName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BuyerFeedbackForm: React.FC<BuyerFeedbackFormProps> = ({
  orderId = 'ORD-2024-001',
  farmerName = 'Farmer',
  productName = 'Product',
  onClose,
  onSuccess,
}) => {
  const { feedbackItems, submitFeedback } = useApp() as any;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [form, setForm] = useState<BuyerFeedbackFormState>({
    orderId,
    ratings: {},
    selectedTags: [],
    comment: '',
    feedbackType: 'feedback',
    photoFile: null,
    deliveryOnTime: true,
    deliveryDamaged: false,
    deliveryPackagingOk: true,
    deliveryProfessional: true,
    orderComplete: true,
  });

  const setRating = (key: keyof FeedbackRatings, value: number) => {
    setForm((f) => ({ ...f, ratings: { ...f.ratings, [key]: value } }));
  };

  const avgRating =
    Object.values(form.ratings).filter(Boolean).reduce((a: number, b) => a + (b as number), 0) /
    (Object.values(form.ratings).filter(Boolean).length || 1);

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const analysis = analyzeFeedback(
      form.comment,
      form.selectedTags,
      form.ratings as Record<string, number | undefined>,
      feedbackItems || [],
      undefined,
      undefined,
      undefined
    );

    if (submitFeedback) {
      submitFeedback({
        userId: 'current-user',
        userType: 'buyer' as const,
        orderId: form.orderId,
        farmerName,
        productName,
        ratings: form.ratings,
        comment: form.comment,
        tags: form.selectedTags,
        category: analysis.categories[0] || 'other',
        sentiment: analysis.sentiment,
        feedbackType: analysis.feedbackType,
        priority: analysis.priority,
        aiConfidence: analysis.confidence,
        aiAnalysis: analysis,
        status: 'SUBMITTED' as const,
        deliveryOnTime: form.deliveryOnTime,
        deliveryDamaged: form.deliveryDamaged,
        deliveryPackagingOk: form.deliveryPackagingOk,
        deliveryProfessional: form.deliveryProfessional,
        orderComplete: form.orderComplete,
        pointsAwarded: 10,
      });
    }

    setIsAnalyzing(false);
    setSubmitted(true);
    setTimeout(() => { onSuccess?.(); onClose(); }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-[#01472e] mb-2">Thank you for your feedback!</h3>
        <p className="text-sm text-[#5c7065] mb-4">Your response helps improve Uzhavan Connect for everyone.</p>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <span className="text-amber-600">🎉</span>
          <span className="text-sm font-medium text-amber-700">+10 Loyalty Points Earned!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#ccd5ae]/40 bg-[#fefae0]/60">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#ccd5ae]/20 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-[#5c7065]" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#01472e]">Rate Your Order</h2>
          <p className="text-[10px] text-[#5c7065]">Order #{orderId}</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-6 h-1 rounded-full transition-colors ${step >= s ? 'bg-[#01472e]' : 'bg-[#ccd5ae]'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step 1: Ratings */}
        {step === 1 && (
          <>
            <div className="text-center mb-2">
              <p className="text-sm text-[#5c7065]">How was your experience with <strong>{farmerName}</strong>?</p>
              <p className="text-xs text-[#788c80]">{productName}</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4 space-y-3">
              {RATING_FIELDS.map(({ key, label }) => (
                <StarRatingInput
                  key={key}
                  value={form.ratings[key] || 0}
                  onChange={(v) => setRating(key, v)}
                  label={label}
                />
              ))}
            </div>

            {/* Feedback type toggle */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
              <p className="text-xs font-medium text-[#4a6350] mb-2">What kind of feedback is this?</p>
              <div className="flex gap-2">
                {([
                  { v: 'feedback', emoji: '💬', label: 'Feedback' },
                  { v: 'complaint', emoji: '⚠️', label: 'Complaint' },
                  { v: 'suggestion', emoji: '💡', label: 'Suggestion' },
                ] as const).map(({ v, emoji, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, feedbackType: v }))}
                    className={`flex-1 flex flex-col items-center py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      form.feedbackType === v
                        ? 'border-[#01472e] bg-[#eaf4ec] text-[#01472e]'
                        : 'border-[#ccd5ae] bg-white text-[#5c7065] hover:border-[#a3b18a]'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={Object.values(form.ratings).filter(Boolean).length < 3}
              className="w-full py-3 bg-[#01472e] text-white rounded-2xl font-medium text-sm hover:bg-[#003b25] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Continue →
            </button>
          </>
        )}

        {/* Step 2: Tags & Comment */}
        {step === 2 && (
          <>
            <div className="text-center mb-2">
              <p className="text-sm text-[#5c7065]">What best describes your experience?</p>
              <p className="text-xs text-[#788c80]">Select all that apply</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
              <QuickTagSelector
                tags={QUICK_TAGS}
                selected={form.selectedTags}
                onChange={(tags) => setForm((f) => ({ ...f, selectedTags: tags }))}
              />
            </div>

            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
              <label className="text-xs font-medium text-[#4a6350] block mb-2">
                Share more details (optional)
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Describe your experience..."
                rows={3}
                className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 p-2.5 resize-none focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
              />
            </div>

            {/* Photo upload */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4">
              <label className="text-xs font-medium text-[#4a6350] block mb-2">
                <Camera className="w-3.5 h-3.5 inline mr-1" /> Add Photo Evidence (optional)
              </label>
              <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#ccd5ae] rounded-xl cursor-pointer hover:border-[#01472e]/40 hover:bg-[#eaf4ec]/30 transition">
                <Camera className="w-6 h-6 text-[#788c80]" />
                <span className="text-xs text-[#788c80]">Tap to upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setForm((f) => ({ ...f, photoFile: e.target.files?.[0] || null }))}
                />
              </label>
              {form.photoFile && (
                <p className="text-xs text-emerald-600 mt-2">📷 {form.photoFile.name} selected</p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white border border-[#ccd5ae] text-[#5c7065] rounded-2xl font-medium text-sm hover:bg-[#eaf4ec] transition cursor-pointer">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#01472e] text-white rounded-2xl font-medium text-sm hover:bg-[#003b25] transition cursor-pointer">
                Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Delivery + Submit */}
        {step === 3 && (
          <>
            <div className="text-center mb-2">
              <Truck className="w-8 h-8 text-[#01472e] mx-auto mb-1" />
              <p className="text-sm font-semibold text-[#01472e]">How was your delivery?</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#ccd5ae]/50 p-4 space-y-3">
              {/* Delivery timing */}
              <div>
                <p className="text-xs font-medium text-[#4a6350] mb-2">Delivery timing</p>
                <div className="flex gap-2">
                  {[
                    { v: true, emoji: '🟢', label: 'On time' },
                    { v: false, emoji: '🔴', label: 'Delayed' },
                  ].map(({ v, emoji, label }) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, deliveryOnTime: v }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                        form.deliveryOnTime === v ? 'border-[#01472e] bg-[#eaf4ec] text-[#01472e]' : 'border-[#ccd5ae] bg-white text-[#5c7065]'
                      }`}
                    >
                      <span>{emoji}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery checkboxes */}
              {([
                { key: 'deliveryDamaged',      label: 'Was the product damaged during delivery?',   reverse: true  },
                { key: 'deliveryPackagingOk',  label: 'Was the packaging proper?',                   reverse: false },
                { key: 'deliveryProfessional', label: 'Was the delivery professional/courteous?',    reverse: false },
                { key: 'orderComplete',        label: 'Was the order complete (no missing items)?',  reverse: false },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-[#4a6350]">{label}</span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (form as any)[key] ? 'bg-[#01472e]' : 'bg-[#ccd5ae]'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      (form as any)[key] ? 'left-5' : 'left-1'
                    }`} />
                  </button>
                </label>
              ))}
            </div>

            {/* Summary card */}
            <div className="bg-[#eaf4ec] rounded-2xl p-4 border border-[#a3b18a]/30">
              <p className="text-xs font-semibold text-[#01472e] mb-2">Your Feedback Summary</p>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-[#01472e]">{avgRating.toFixed(1)} / 5.0</span>
              </div>
              {form.selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.selectedTags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-white rounded-full border border-[#a3b18a]/40 text-[#5c7065]">{tag}</span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700">
                <span>🎉</span>
                <span className="font-medium">You'll earn 10 loyalty points for completing this feedback!</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white border border-[#ccd5ae] text-[#5c7065] rounded-2xl font-medium text-sm hover:bg-[#eaf4ec] transition cursor-pointer">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex-1 py-3 bg-[#01472e] text-white rounded-2xl font-medium text-sm hover:bg-[#003b25] transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
