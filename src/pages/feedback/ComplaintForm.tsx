import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, Send, AlertCircle, ArrowLeft, CheckCircle2, Zap } from 'lucide-react';
import { FeedbackCategory } from '../../types/feedback';
import { analyzeFeedback } from '../../services/feedbackAiService';

const CATEGORIES: { value: FeedbackCategory; label: string; emoji: string }[] = [
  { value: 'freshness',        label: 'Rotten / Damaged Vegetables', emoji: '🥬' },
  { value: 'product_quality',  label: 'Wrong / Poor Quality Product', emoji: '❌' },
  { value: 'delivery',         label: 'Delivery Problem',             emoji: '🚚' },
  { value: 'packaging',        label: 'Packaging Damage',             emoji: '📦' },
  { value: 'payment',          label: 'Payment Issue',                emoji: '💳' },
  { value: 'pricing',          label: 'Pricing Dispute',              emoji: '💰' },
  { value: 'farmer_reliability', label: 'Farmer Behaviour',          emoji: '👤' },
  { value: 'buyer_reliability',  label: 'Buyer Behaviour',           emoji: '🧑' },
  { value: 'communication',    label: 'Communication Problem',        emoji: '📞' },
  { value: 'app_experience',   label: 'App / Platform Issue',        emoji: '📱' },
  { value: 'other',            label: 'Other',                        emoji: '❓' },
];

const URGENCY_OPTIONS = [
  { value: 'immediate',    label: 'Immediate — Urgent issue',         emoji: '🔴' },
  { value: 'within_24h',  label: 'Within 24 hours',                   emoji: '🟡' },
  { value: 'within_week', label: 'Within a week',                     emoji: '🟢' },
] as const;

interface ComplaintFormProps {
  prefillOrderId?: string;
  onClose?: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ prefillOrderId = '', onClose }) => {
  const { feedbackItems, submitFeedback } = useApp() as any;
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState(prefillOrderId);
  const [urgency, setUrgency] = useState<'immediate' | 'within_24h' | 'within_week'>('within_24h');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [contactRequested, setContactRequested] = useState(false);

  const handleSubmit = async () => {
    if (!category || !description) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    const analysis = analyzeFeedback(
      description,
      [title],
      {},
      feedbackItems || [],
      undefined,
      undefined,
      undefined
    );

    const cid = `CMP-${Date.now().toString(36).toUpperCase()}`;
    setComplaintId(cid);

    if (submitFeedback) {
      submitFeedback({
        feedbackId: cid,
        userId: 'current-user',
        userType: 'buyer' as const,
        orderId: orderId || undefined,
        ratings: {},
        comment: `${title}: ${description}`,
        tags: [title],
        category: category as FeedbackCategory,
        sentiment: 'negative' as const,
        feedbackType: 'complaint' as const,
        priority: urgency === 'immediate' ? 'high' : urgency === 'within_24h' ? 'medium' : 'low',
        aiConfidence: analysis.confidence,
        aiAnalysis: { ...analysis, feedbackType: 'complaint', priority: urgency === 'immediate' ? 'high' : 'medium' },
        status: 'SUBMITTED' as const,
        escalated: urgency === 'immediate',
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
        <h3 className="text-base font-bold text-[#01472e] mb-1">Complaint Submitted!</h3>
        <p className="text-xs text-[#5c7065] mb-3">Our team will review your complaint and respond shortly.</p>
        <div className="bg-[#eaf4ec] rounded-2xl px-6 py-4 border border-[#a3b18a]/30 mb-4">
          <p className="text-[10px] text-[#788c80] uppercase tracking-wider mb-1">Your Complaint ID</p>
          <p className="font-bold text-[#01472e] text-lg tracking-wider">{complaintId}</p>
          <p className="text-[10px] text-[#5c7065] mt-1">Use this ID to track your complaint status</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="px-6 py-2 bg-[#01472e] text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-[#003b25] transition">
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#ccd5ae]/20 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-[#5c7065]" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="font-bold text-[#01472e]">Report a Problem</h2>
            <p className="text-xs text-[#788c80]">We take all complaints seriously</p>
          </div>
        </div>
      </div>

      {/* Urgency */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#4a6350] mb-2">How urgent is this?</p>
        <div className="space-y-2">
          {URGENCY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition hover:bg-[#eaf4ec]/50">
              <input
                type="radio"
                name="urgency"
                value={opt.value}
                checked={urgency === opt.value}
                onChange={() => setUrgency(opt.value)}
                className="accent-[#01472e]"
              />
              <span className="text-base">{opt.emoji}</span>
              <span className="text-sm text-[#01472e]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#4a6350] mb-2">What is the problem about?</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                category === cat.value
                  ? 'border-[#01472e] bg-[#eaf4ec] text-[#01472e]'
                  : 'border-[#ccd5ae] bg-white text-[#5c7065] hover:border-[#a3b18a]'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span className="leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-medium text-[#4a6350] block mb-1">Short complaint title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Received rotten tomatoes"
            className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 px-3 py-2 focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4a6350] block mb-1">Describe the problem in detail</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened, including any relevant details..."
            rows={4}
            className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 p-3 resize-none focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4a6350] block mb-1">Order ID (if applicable)</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-2024-001"
            className="w-full text-sm text-[#01472e] bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/50 px-3 py-2 focus:outline-none focus:border-[#01472e]/40 placeholder-[#a3b18a]"
          />
        </div>
      </div>

      {/* Photo upload */}
      <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm">
        <p className="text-xs font-medium text-[#4a6350] mb-2">
          📷 Photo Evidence <span className="text-[#788c80] font-normal">(highly recommended for product issues)</span>
        </p>
        <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#ccd5ae] rounded-xl cursor-pointer hover:border-[#01472e]/40 hover:bg-[#eaf4ec]/20 transition">
          <Camera className="w-6 h-6 text-[#788c80]" />
          <span className="text-xs text-[#788c80]">Tap to upload photo</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </label>
        {photoFile && <p className="text-xs text-emerald-600 mt-2">✅ {photoFile.name} attached</p>}
      </div>

      {/* Contact request */}
      <label className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#ccd5ae]/60 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-[#01472e]">Request a callback</p>
          <p className="text-xs text-[#788c80]">Our team will contact you to resolve this</p>
        </div>
        <button
          type="button"
          onClick={() => setContactRequested(!contactRequested)}
          className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${contactRequested ? 'bg-[#01472e]' : 'bg-[#ccd5ae]'}`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${contactRequested ? 'left-5' : 'left-1'}`} />
        </button>
      </label>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !category || !description.trim()}
        className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-semibold text-sm hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Submitting Complaint...</>
        ) : (
          <><Send className="w-4 h-4" />Submit Complaint</>
        )}
      </button>

      <p className="text-center text-[11px] text-[#788c80]">
        🔒 All complaints are recorded and handled confidentially by our team.
      </p>
    </div>
  );
};
