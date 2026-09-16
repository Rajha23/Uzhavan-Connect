import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackItem, ComplaintStatus } from '../../types/feedback';
import { FeedbackStatusBadge, StatusStepper } from '../../components/feedback/FeedbackBadges';
import { PriorityBadge } from '../../components/feedback/FeedbackBadges';
import { SentimentBadge } from '../../components/feedback/SentimentBadge';
import {
  Search, Package, Clock, MessageSquare, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

const SAMPLE_ADMIN_RESPONSES: Record<string, string> = {
  UNDER_REVIEW: 'Our quality team is currently reviewing your complaint.',
  ASSIGNED: 'Your complaint has been assigned to the Quality Management team for immediate action.',
  ACTION_TAKEN: 'We have taken action on your complaint. A refund has been initiated and the farmer has been notified.',
  RESOLVED: 'Your complaint has been successfully resolved. We apologize for the inconvenience and have taken steps to prevent recurrence.',
};

export const ComplaintTracker: React.FC = () => {
  const { feedbackItems, currentUser, currentRole, setActiveTab } = useApp() as any;
  const [searchId, setSearchId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only show complaints relevant to the user/role
  const complaints = React.useMemo(() => {
    const raw = ((feedbackItems || []) as FeedbackItem[]).filter(
      (f) => f.feedbackType === 'complaint'
    );
    if (currentRole === 'ADMIN') return raw;
    if (currentRole === 'RETAIL_BUYER' || currentRole === 'BULK_BUYER') {
      const userComplaints = raw.filter(
        (c) =>
          c.buyerId === currentUser?.id ||
          c.userId === currentUser?.id ||
          c.userType === 'buyer'
      );
      return userComplaints.length > 0 ? userComplaints : raw;
    }
    if (currentRole === 'FARMER') {
      const farmerComplaints = raw.filter(
        (c) =>
          c.farmerId === currentUser?.id ||
          c.userId === currentUser?.id ||
          c.userType === 'farmer'
      );
      return farmerComplaints.length > 0 ? farmerComplaints : raw;
    }
    return raw;
  }, [feedbackItems, currentRole, currentUser]);

  const filtered = searchId
    ? complaints.filter(
        (c) =>
          c.feedbackId.toLowerCase().includes(searchId.toLowerCase()) ||
          c.orderId?.toLowerCase().includes(searchId.toLowerCase())
      )
    : complaints;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#01472e] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[#01472e]">My Complaints</h2>
            <p className="text-xs text-[#788c80]">Track status and updates on your complaints</p>
          </div>
        </div>
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('report-problem')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#01472e] text-white rounded-xl text-xs font-semibold hover:bg-[#01472e]/90 transition cursor-pointer shadow-sm"
          >
            + File Complaint
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#788c80]" />
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Search by Complaint ID or Order ID..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white rounded-2xl border border-[#ccd5ae]/60 focus:outline-none focus:border-[#01472e]/40 text-[#01472e] placeholder-[#a3b18a]"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-[#ccd5ae] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#5c7065]">
            {searchId ? 'No complaints found for this ID' : 'No complaints yet'}
          </p>
          <p className="text-xs text-[#788c80] mt-1">
            {searchId ? 'Try a different search term' : 'All good! No issues reported.'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((complaint) => {
          const isExpanded = expandedId === complaint.feedbackId;
          const adminResp = complaint.adminResponse || SAMPLE_ADMIN_RESPONSES[complaint.status] || '';
          return (
            <div
              key={complaint.feedbackId}
              className="bg-white rounded-2xl border border-[#ccd5ae]/60 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div
                className="flex items-start justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : complaint.feedbackId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-[#01472e] font-mono">
                      #{complaint.feedbackId}
                    </span>
                    <FeedbackStatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                  <p className="text-sm font-medium text-[#01472e] truncate">
                    {complaint.comment?.slice(0, 80)}...
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-[#788c80]">
                    {complaint.orderId && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {complaint.orderId}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(complaint.createdAt)}
                    </span>
                    {complaint.assignedTeam && (
                      <span className="text-violet-600 font-medium">{complaint.assignedTeam}</span>
                    )}
                  </div>
                </div>
                <button className="p-1 text-[#788c80] hover:text-[#01472e] cursor-pointer shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-[#ccd5ae]/30 p-4 space-y-4 bg-[#fafaf8]">
                  {/* Status stepper */}
                  <div>
                    <p className="text-[10px] font-medium text-[#788c80] uppercase tracking-wider mb-3">Complaint Progress</p>
                    <StatusStepper currentStatus={complaint.status} />
                  </div>

                  {/* AI classification */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-xl p-3 border border-[#ccd5ae]/40">
                      <p className="text-[10px] text-[#788c80] mb-1">AI Classification</p>
                      <div className="flex flex-wrap gap-1">
                        <SentimentBadge sentiment={complaint.sentiment} />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#ccd5ae]/40">
                      <p className="text-[10px] text-[#788c80] mb-1">Category</p>
                      <p className="text-xs font-medium text-[#01472e] capitalize">
                        {complaint.category.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* AI Recommended Action */}
                  {complaint.aiAnalysis?.recommendedAction && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">AI Recommended Action</p>
                        <p className="text-xs text-blue-700 mt-0.5">{complaint.aiAnalysis.recommendedAction}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Response */}
                  {adminResp && (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Team Response</p>
                        <p className="text-xs text-emerald-700 mt-0.5">{adminResp}</p>
                      </div>
                    </div>
                  )}

                  {/* Resolution */}
                  {complaint.resolution && (
                    <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-xl border border-teal-200">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-teal-600 font-medium uppercase tracking-wider">Resolution</p>
                        <p className="text-xs text-teal-700 mt-0.5">{complaint.resolution}</p>
                      </div>
                    </div>
                  )}

                  {/* User confirmation for RESOLVED */}
                  {complaint.status === 'RESOLVED' && (
                    <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Resolution — Mark as Done
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
