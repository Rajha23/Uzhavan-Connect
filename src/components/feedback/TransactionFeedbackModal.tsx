import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  WorkflowOrder,
  Shipment,
  FeedbackItem,
  StructuredFeedbackCategory,
  FeedbackIssueType
} from '../../types';
import { feedbackService } from '../../services/feedbackService';
import {
  Star,
  X,
  CheckCircle2,
  Package,
  Truck,
  User,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Send,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransactionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: WorkflowOrder | null;
  shipment?: Shipment | null;
  existingFeedback?: FeedbackItem | null;
  onSuccess?: (feedback: FeedbackItem) => void;
}

const CATEGORIES: StructuredFeedbackCategory[] = [
  'Product Quality',
  'Delivery',
  'Communication',
  'Pricing',
  'Packaging',
  'Service',
  'Other'
];

const ISSUE_TYPES: FeedbackIssueType[] = [
  'No issue',
  'Quality issue',
  'Quantity issue',
  'Delivery delay',
  'Damaged product',
  'Wrong product',
  'Payment issue',
  'Communication issue',
  'Other'
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor — Needs urgent improvement',
  2: 'Fair — Below expectations',
  3: 'Good — Met standard expectations',
  4: 'Very Good — High quality & smooth execution',
  5: 'Excellent — Exceeded expectations!'
};

export const TransactionFeedbackModal: React.FC<TransactionFeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
  shipment,
  existingFeedback,
  onSuccess
}) => {
  const { currentUser, currentRole, submitTransactionFeedback } = useApp();
  const { t, formatNumber } = useLanguage();

  // Determine transaction metadata from order or shipment
  const orderId = order?.id || shipment?.orderId || 'ORD-TXN-UNKNOWN';
  const shipmentId = shipment?.id || (order?.transportDetails?.vehicleNumber ? `SHP-${order.id.replace('ORD-', '')}` : undefined);
  const crop = order?.crop || shipment?.crop || 'Produce';
  const variety = order?.variety || shipment?.variety || 'Standard';
  const quantityKg = order?.quantityKg || shipment?.quantityKg || 0;
  const farmerName = order?.farmerName || shipment?.farmerName || 'Producer';
  const buyerName = order?.buyerName || shipment?.buyerName || 'Buyer';
  const logisticsName = order?.transportDetails?.carrierName || shipment?.carrierName || 'Refrigerated Fleet';
  const txnDate = order?.date || shipment?.pickupDate || new Date().toLocaleDateString('en-GB');

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<StructuredFeedbackCategory>('Product Quality');
  const [whatWentWell, setWhatWentWell] = useState<string>('');
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState<string>('');
  const [issueType, setIssueType] = useState<FeedbackIssueType>('No issue');
  const [additionalComments, setAdditionalComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Load existing feedback if present
  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || existingFeedback.ratings.overall || 5);
      setCategory(existingFeedback.structuredCategory || 'Product Quality');
      setWhatWentWell(existingFeedback.whatWentWell || '');
      setWhatCouldBeImproved(existingFeedback.whatCouldBeImproved || '');
      setIssueType(existingFeedback.issueType || 'No issue');
      setAdditionalComments(existingFeedback.additionalComments || existingFeedback.comment || '');
    } else {
      // Check if user has already submitted feedback for this transaction
      const found = feedbackService.getFeedbackForTransaction(orderId, currentUser.id);
      if (found) {
        setRating(found.rating || found.ratings.overall || 5);
        setCategory(found.structuredCategory || 'Product Quality');
        setWhatWentWell(found.whatWentWell || '');
        setWhatCouldBeImproved(found.whatCouldBeImproved || '');
        setIssueType(found.issueType || 'No issue');
        setAdditionalComments(found.additionalComments || found.comment || '');
      } else {
        // Reset defaults
        setRating(5);
        setCategory(
          currentRole === 'LOGISTICS' ? 'Delivery' : currentRole === 'FARMER' ? 'Communication' : 'Product Quality'
        );
        setWhatWentWell('');
        setWhatCouldBeImproved('');
        setIssueType('No issue');
        setAdditionalComments('');
      }
    }
  }, [isOpen, existingFeedback, orderId, currentUser.id, currentRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackPayload = {
      feedbackId: existingFeedback?.feedbackId,
      userId: currentUser.id,
      userType: (currentRole === 'FARMER'
        ? 'farmer'
        : currentRole === 'LOGISTICS'
        ? 'logistics'
        : currentRole === 'FPO_AGGREGATOR'
        ? 'fpo'
        : currentRole === 'BULK_BUYER'
        ? 'bulk_buyer'
        : 'buyer') as any,
      submittedByRole: currentRole,
      submittedByName: currentUser.name,
      orderId,
      transactionId: orderId,
      shipmentId,
      productName: `${crop} (${variety})`,
      farmerId: order?.farmerId || shipment?.farmerId || 'farmer_id',
      farmerName,
      buyerId: order?.buyerId || shipment?.buyerId || 'buyer_id',
      buyerName,
      logisticsProvider: logisticsName,
      rating,
      ratings: {
        overall: rating,
        quality: category === 'Product Quality' ? rating : 4,
        delivery: category === 'Delivery' ? rating : 4,
        packaging: category === 'Packaging' ? rating : 4,
        communication: category === 'Communication' ? rating : 4
      },
      category: (category === 'Product Quality'
        ? 'product_quality'
        : category === 'Delivery'
        ? 'delivery'
        : category === 'Pricing'
        ? 'pricing'
        : category === 'Packaging'
        ? 'packaging'
        : category === 'Communication'
        ? 'communication'
        : 'other') as any,
      structuredCategory: category,
      whatWentWell,
      whatCouldBeImproved,
      issueType,
      additionalComments,
      comment: additionalComments || whatWentWell || whatCouldBeImproved,
      transactionDate: txnDate,
      responses: existingFeedback?.responses || []
    };

    const saved = submitTransactionFeedback(feedbackPayload);
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setSubmittedSuccess(true);
    setIsSubmitting(false);

    if (onSuccess) onSuccess(saved);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#faf9f5] to-white">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Transaction Feedback</span>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {existingFeedback ? 'Edit Verified Feedback' : 'Give Transaction Feedback'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Context Card (Auto-Associated Data) */}
          <div className="p-3.5 rounded-2xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Linked Order:</span>
              <span className="font-mono font-bold text-[#01472e]">{orderId}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Produce / Load</span>
                <strong className="text-slate-800 block truncate">{crop} ({formatNumber(quantityKg)} kg)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Seller</span>
                <strong className="text-slate-800 block truncate">{farmerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Buyer</span>
                <strong className="text-slate-800 block truncate">{buyerName}</strong>
              </div>
              {shipmentId && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Shipment ID</span>
                  <span className="font-mono text-indigo-700 font-semibold">{shipmentId}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px]">Logistics Carrier</span>
                <span className="text-slate-700 truncate block">{logisticsName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Transaction Date</span>
                <span className="text-slate-700">{txnDate}</span>
              </div>
            </div>
          </div>

          {/* 1. Star Rating */}
          <div className="space-y-1.5 text-center p-3 bg-amber-50/50 rounded-2xl border border-amber-100">
            <label className="block text-xs font-bold text-slate-800">
              Overall Transaction Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 transition-transform hover:scale-115 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-none'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-[#01472e]">
              {RATING_LABELS[hoverRating !== null ? hoverRating : rating]}
            </p>
          </div>

          {/* 2. Structured Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Feedback Category <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    category === cat
                      ? 'bg-[#01472e] text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. What Went Well & What Could Be Improved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                What went well? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                placeholder="e.g. Excellent firmness, accurate sorting, friendly driver..."
                className="w-full p-2.5 text-xs bg-[#faf9f5] border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#01472e] focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                What could be improved? <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={whatCouldBeImproved}
                onChange={(e) => setWhatCouldBeImproved(e.target.value)}
                placeholder="e.g. Advance pickup notice by 1 hour, lighter crates..."
                className="w-full p-2.5 text-xs bg-[#faf9f5] border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#01472e] focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* 4. Issue Type Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Issue Type / Problem Encountered
              </label>
              {issueType !== 'No issue' && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Will alert Admin Support
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ISSUE_TYPES.map((it) => (
                <button
                  key={it}
                  type="button"
                  onClick={() => setIssueType(it)}
                  className={`p-2 rounded-xl text-[11px] text-center font-medium transition cursor-pointer truncate ${
                    issueType === it
                      ? it === 'No issue'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-red-600 text-white font-semibold'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={it}
                >
                  {it}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Additional Comments */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Additional Detailed Comments <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Provide any additional context or instructions..."
              className="w-full p-2.5 text-xs bg-[#faf9f5] border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#01472e] focus:outline-none text-slate-800"
            />
          </div>

          {/* Existing Responses Section (if editing/viewing) */}
          {existingFeedback && existingFeedback.responses && existingFeedback.responses.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#01472e]" />
                <span>Responses from Staff & Counterparty ({existingFeedback.responses.length})</span>
              </h4>
              <div className="space-y-2">
                {existingFeedback.responses.map((resp) => (
                  <div key={resp.id} className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-[#01472e]">{resp.responderName} ({resp.responderRole})</span>
                      <span>{resp.createdAt}</span>
                    </div>
                    <p className="text-slate-700 text-xs">{resp.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              Submitting as: <strong>{currentUser.name} ({currentRole})</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submittedSuccess}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#01472e] hover:bg-[#025a3b] rounded-xl shadow-soft cursor-pointer flex items-center gap-1.5 transition"
              >
                {submittedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Feedback Saved!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{existingFeedback ? 'Update Feedback' : 'Submit Feedback'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
