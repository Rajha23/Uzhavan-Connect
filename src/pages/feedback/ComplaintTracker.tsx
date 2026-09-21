import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackItem, FeedbackProcessingStatus } from '../../types/feedback';
import { feedbackService } from '../../services/feedbackService';
import { TransactionFeedbackModal } from '../../components/feedback/TransactionFeedbackModal';
import {
  Search,
  Package,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  Building2,
  Truck,
  User,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';

export const ComplaintTracker: React.FC = () => {
  const { currentUser, currentRole, setActiveTab } = useApp();

  const [activeTab, setActiveTabFilter] = useState<'ALL' | 'RATINGS' | 'ISSUES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit modal
  const [selectedForEdit, setSelectedForEdit] = useState<FeedbackItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load user feedbacks
  const [allUserFeedbacks, setAllUserFeedbacks] = useState<FeedbackItem[]>(() =>
    feedbackService.getFeedbacksForUser(currentUser.id, currentRole)
  );

  const refreshList = () => {
    setAllUserFeedbacks(feedbackService.getFeedbacksForUser(currentUser.id, currentRole));
  };

  React.useEffect(() => {
    refreshList();
    const handleUpdated = () => refreshList();
    window.addEventListener('transaction-feedback-updated', handleUpdated);
    window.addEventListener('storage', handleUpdated);
    return () => {
      window.removeEventListener('transaction-feedback-updated', handleUpdated);
      window.removeEventListener('storage', handleUpdated);
    };
  }, [currentUser.id, currentRole]);

  // Filtered by tab, search, and status
  const filtered = useMemo(() => {
    return allUserFeedbacks.filter((item) => {
      // Tab filter
      if (activeTab === 'RATINGS') {
        if (item.issueType && item.issueType !== 'No issue') return false;
      } else if (activeTab === 'ISSUES') {
        if (!item.issueType || item.issueType === 'No issue') return false;
      }

      // Status filter
      const itemStatus = item.processingStatus || (item.status === 'RESOLVED' ? 'Resolved' : item.status === 'UNDER_REVIEW' ? 'Under Review' : 'Submitted');
      if (statusFilter !== 'ALL' && itemStatus !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.feedbackId.toLowerCase().includes(q) ||
          (item.orderId && item.orderId.toLowerCase().includes(q)) ||
          (item.transactionId && item.transactionId.toLowerCase().includes(q)) ||
          (item.productName && item.productName.toLowerCase().includes(q)) ||
          (item.comment && item.comment.toLowerCase().includes(q)) ||
          (item.structuredCategory && item.structuredCategory.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [allUserFeedbacks, activeTab, statusFilter, searchQuery]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Responded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Resolved':
        return 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/60 font-semibold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#01472e] flex items-center justify-center text-[#fefae0] shadow-soft shrink-0">
            <MessageSquare className="w-6 h-6 text-[#fefae0]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              My Feedback & Complaints
            </h1>
            <p className="text-xs text-slate-500">
              Track your ratings, verified transaction reviews, and support responses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#01472e] text-[#fefae0] rounded-xl text-xs font-semibold hover:bg-[#025a3b] transition cursor-pointer shadow-soft"
            >
              <Plus className="w-4 h-4" />
              <span>Review Completed Orders</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Segmented Tabs & Filters ── */}
      <div className="bg-white rounded-3xl p-4 border border-[#ccd5ae]/40 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented View Selector */}
          <div className="flex p-1 bg-[#faf9f5] rounded-2xl border border-slate-200/80">
            {[
              { id: 'ALL', label: `All Activity (${allUserFeedbacks.length})` },
              {
                id: 'RATINGS',
                label: `Ratings (${allUserFeedbacks.filter((f) => !f.issueType || f.issueType === 'No issue').length})`
              },
              {
                id: 'ISSUES',
                label: `Issues (${allUserFeedbacks.filter((f) => f.issueType && f.issueType !== 'No issue').length})`
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#01472e] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-[#01472e] focus:outline-none text-[#01472e] font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Responded">Responded</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Transaction ID, Crop, Category, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f5] rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#01472e] text-slate-800"
          />
        </div>
      </div>

      {/* ── Feedback List ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ccd5ae]/40 shadow-soft space-y-2">
          <CheckCircle2 className="w-12 h-12 text-[#a3b18a] mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">
            {searchQuery ? 'No matching feedback records found' : 'No feedback submissions yet'}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Completed transaction reviews and filed complaints will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.feedbackId;
            const currentStatus =
              item.processingStatus ||
              (item.status === 'RESOLVED' ? 'Resolved' : item.status === 'UNDER_REVIEW' ? 'Under Review' : 'Submitted');
            const itemRating = item.rating || item.ratings.overall || 5;

            return (
              <div
                key={item.feedbackId}
                className="bg-white rounded-3xl border border-[#ccd5ae]/50 shadow-soft overflow-hidden transition hover:shadow-md"
              >
                {/* Header Row */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.feedbackId)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#01472e] bg-[#faf9f5] px-2.5 py-0.5 rounded-lg border border-[#ccd5ae]/40">
                        {item.feedbackId}
                      </span>
                      {item.orderId && (
                        <span className="text-[11px] font-mono text-slate-500">
                          Order: <strong>{item.orderId}</strong>
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          currentStatus
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{currentStatus}</span>
                      </span>
                      {item.structuredCategory && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {item.structuredCategory}
                        </span>
                      )}
                      {item.issueType && item.issueType !== 'No issue' && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          {item.issueType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= itemRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {item.productName || item.orderId || 'Consignment'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {item.whatWentWell || item.comment || item.whatCouldBeImproved || 'No comments provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
                    <button className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#ccd5ae]/30 bg-[#faf9f5]/50 space-y-4 text-xs text-slate-700">
                    {/* Transaction Context */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Seller</span>
                        <strong className="text-slate-800 block truncate">{item.farmerName || 'Producer'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Buyer</span>
                        <strong className="text-slate-800 block truncate">{item.buyerName || 'Buyer'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Carrier</span>
                        <span className="text-slate-700 block truncate">{item.logisticsProvider || 'Reefer Freight'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date</span>
                        <span className="text-slate-700">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* What Went Well & What Could Be Improved */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {item.whatWentWell && (
                        <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                            What Went Well
                          </span>
                          <p className="text-xs text-slate-800">{item.whatWentWell}</p>
                        </div>
                      )}
                      {item.whatCouldBeImproved && (
                        <div className="p-3 bg-white rounded-2xl border border-amber-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                            Areas for Improvement
                          </span>
                          <p className="text-xs text-slate-800">{item.whatCouldBeImproved}</p>
                        </div>
                      )}
                    </div>

                    {item.additionalComments && (
                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Detailed Comments
                        </span>
                        <p className="text-xs text-slate-800">{item.additionalComments}</p>
                      </div>
                    )}

                    {/* Responses Thread */}
                    {item.responses && item.responses.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold text-[#01472e] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Staff & Counterparty Responses ({item.responses.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {item.responses.map((resp) => (
                            <div
                              key={resp.id}
                              className="p-3 bg-white rounded-2xl border border-indigo-100 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-indigo-900">
                                  {resp.responderName} ({resp.responderRole})
                                </span>
                                <span className="text-slate-400 text-[10px]">{resp.createdAt}</span>
                              </div>
                              <p className="text-slate-700 text-xs leading-relaxed">{resp.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 text-center text-xs">
                        No responses posted yet. Our support team and counterparties monitor all feedback.
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] text-slate-400">
                        Verified via Uzhavan Transparency Protocol
                      </span>
                      <button
                        onClick={() => {
                          setSelectedForEdit(item);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-[#01472e] bg-white border border-[#ccd5ae]/60 hover:bg-[#faf9f5] rounded-xl transition cursor-pointer"
                      >
                        Edit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedForEdit && (
        <TransactionFeedbackModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedForEdit(null);
          }}
          existingFeedback={selectedForEdit}
          onSuccess={() => {
            refreshList();
          }}
        />
      )}
    </div>
  );
};
