import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FeedbackItem, PatternAlert } from '../types/feedback';
import {
  INITIAL_PATTERN_ALERTS,
  FARMER_TRUST_PROFILES,
  AREA_FEEDBACK_SUMMARY,
  MONTHLY_TREND_DATA,
  CATEGORY_PERFORMANCE,
} from '../data/feedbackMockData';
import { AiInsightsFeed } from '../components/feedback/AiInsightsFeed';
import { FarmerTrustCard } from '../components/feedback/FarmerTrustBadge';
import { FeedbackStatusBadge, PriorityBadge } from '../components/feedback/FeedbackBadges';
import { SentimentBadge } from '../components/feedback/SentimentBadge';
import { StarDisplay } from '../components/feedback/StarRatingInput';
import { getSentimentSummary, getAverageRating } from '../services/feedbackAiService';
import { YouSaidWeImproved } from './feedback/YouSaidWeImproved';
import {
  BarChart3, MessageSquare, AlertTriangle, TrendingUp, Users,
  MapPin, Star, Lightbulb, Award, RefreshCw, Eye, CheckCircle2,
  Clock, Search, Filter, ChevronRight, Sparkles, ArrowUpRight,
  ArrowDownRight, Minus, Package
} from 'lucide-react';

// ─── Helper: Mini SVG trend line ─────────────────────────────────────────────

const TrendLine: React.FC<{ data: number[]; color?: string; height?: number }> = ({
  data, color = '#01472e', height = 36,
}) => {
  if (data.length < 2) return null;
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts.join(' ')} />
    </svg>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPICard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: 'up' | 'down' | 'flat'; trendVal?: string;
}> = ({ label, value, sub, icon, color, trend, trendVal }) => (
  <div className={`rounded-2xl p-4 border shadow-sm ${color} flex flex-col gap-2`}>
    <div className="flex items-start justify-between">
      <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">{icon}</div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
          trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
          trend === 'down' ? 'bg-rose-100 text-rose-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {trendVal}
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-[#01472e]">{value}</p>
      <p className="text-xs font-medium text-[#5c7065]">{label}</p>
      {sub && <p className="text-[10px] text-[#788c80] mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Sentiment Donut (CSS-based) ──────────────────────────────────────────────

const SentimentBar: React.FC<{ positive: number; neutral: number; negative: number; mixed: number }> = ({
  positive, neutral, negative, mixed,
}) => (
  <div className="space-y-2">
    {[
      { label: 'Positive', value: positive, color: 'bg-emerald-500' },
      { label: 'Neutral',  value: neutral,  color: 'bg-amber-400' },
      { label: 'Mixed',    value: mixed,    color: 'bg-purple-400' },
      { label: 'Negative', value: negative, color: 'bg-rose-500' },
    ].map(({ label, value, color }) => (
      <div key={label} className="flex items-center gap-2">
        <span className="text-[10px] text-[#788c80] w-14">{label}</span>
        <div className="flex-1 h-2 bg-[#eaf4ec] rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-[10px] font-bold text-[#01472e] w-8 text-right">{value}%</span>
      </div>
    ))}
  </div>
);

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type FITab = 'overview' | 'ai-insights' | 'complaints' | 'trends' | 'farmers' | 'locations' | 'you-said';

const TABS: { id: FITab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',       icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'ai-insights', label: 'AI Insights',    icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'complaints',  label: 'Complaints',     icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: 'trends',      label: 'Trends',         icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'farmers',     label: 'Farmers',        icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'locations',   label: 'Locations',      icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'you-said',    label: 'You Said, We Improved', icon: <Award className="w-3.5 h-3.5" /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const FeedbackIntelligencePage: React.FC = () => {
  const {
    feedbackItems,
    updateComplaintStatus,
    updateFeedbackStatusAndNotes,
    respondToFeedback,
    currentUser,
    currentRole
  } = useApp() as any;

  const [activeTab, setActiveTab] = useState<FITab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('ALL');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Admin response & internal note state
  const [replyText, setReplyText] = useState('');
  const [internalNoteDraft, setInternalNoteDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Sync internal notes when selected feedback changes
  React.useEffect(() => {
    if (selectedFeedback) {
      setInternalNoteDraft(selectedFeedback.internalNotes || '');
      setReplyText('');
    }
  }, [selectedFeedback]);

  // Filter feedback items according to role scope
  const allFeedback: FeedbackItem[] = useMemo(() => {
    const raw = (feedbackItems || []) as FeedbackItem[];
    if (currentRole === 'LOGISTICS') {
      return raw.filter(
        (f) =>
          f.category === 'delivery' ||
          f.structuredCategory === 'Delivery' ||
          f.targetRole === 'LOGISTICS' ||
          f.submittedByRole === 'LOGISTICS' ||
          f.comment?.toLowerCase().includes('transit') ||
          f.comment?.toLowerCase().includes('delivery') ||
          f.comment?.toLowerCase().includes('driver') ||
          f.comment?.toLowerCase().includes('damage')
      );
    }
    if (currentRole === 'FPO_AGGREGATOR') {
      return raw.filter(
        (f) =>
          f.category === 'product_quality' ||
          f.structuredCategory === 'Product Quality' ||
          f.targetRole === 'FPO_AGGREGATOR' ||
          f.submittedByRole === 'FPO_AGGREGATOR' ||
          Boolean(f.microHubId) ||
          f.comment?.toLowerCase().includes('hub') ||
          f.comment?.toLowerCase().includes('grade') ||
          f.comment?.toLowerCase().includes('freshness')
      );
    }
    return raw;
  }, [feedbackItems, currentRole]);

  const visibleTabs = useMemo(() => {
    if (currentRole === 'LOGISTICS') {
      return TABS.filter((t) => ['overview', 'ai-insights', 'complaints', 'trends', 'locations'].includes(t.id));
    }
    if (currentRole === 'FPO_AGGREGATOR') {
      return TABS.filter((t) => ['overview', 'ai-insights', 'complaints', 'trends', 'farmers', 'locations'].includes(t.id));
    }
    return TABS;
  }, [currentRole]);

  const headerTitle =
    currentRole === 'LOGISTICS'
      ? 'Logistics & Fleet Feedback Intelligence'
      : currentRole === 'FPO_AGGREGATOR'
      ? 'Micro-Hub & FPO Feedback Intelligence'
      : 'Feedback Intelligence Operations Center';

  const headerSubtitle =
    currentRole === 'LOGISTICS'
      ? `AI-powered delivery & cold-chain transit feedback · ${allFeedback.length} logistics items`
      : currentRole === 'FPO_AGGREGATOR'
      ? `AI-powered aggregation & farmer quality feedback · ${allFeedback.length} hub items`
      : `AI-powered feedback analysis · ${allFeedback.length} total feedback items · Central Administration`;

  // Calculated metrics
  const avgRating = useMemo(() => {
    if (allFeedback.length === 0) return '0.0';
    const total = allFeedback.reduce((sum, f) => sum + (f.rating || f.ratings?.overall || 4), 0);
    return (total / allFeedback.length).toFixed(1);
  }, [allFeedback]);

  const positiveCount = useMemo(() => {
    return allFeedback.filter(f => (f.rating || f.ratings?.overall || 0) >= 4 || f.sentiment === 'positive').length;
  }, [allFeedback]);

  const negativeCount = useMemo(() => {
    return allFeedback.filter(f => (f.rating || f.ratings?.overall || 0) <= 2 || f.sentiment === 'negative').length;
  }, [allFeedback]);

  const positivePercent = allFeedback.length > 0 ? Math.round((positiveCount / allFeedback.length) * 100) : 0;
  const negativePercent = allFeedback.length > 0 ? Math.round((negativeCount / allFeedback.length) * 100) : 0;

  const openIssuesCount = useMemo(() => {
    return allFeedback.filter(f => {
      const isIssue = (f.issueType && f.issueType !== 'No issue') || f.feedbackType === 'complaint';
      const isResolved = ['RESOLVED', 'USER_CONFIRMED', 'CLOSED'].includes(f.status);
      return isIssue && !isResolved;
    }).length;
  }, [allFeedback]);

  const resolvedIssuesCount = useMemo(() => {
    return allFeedback.filter(f => {
      const isIssue = (f.issueType && f.issueType !== 'No issue') || f.feedbackType === 'complaint';
      const isResolved = ['RESOLVED', 'USER_CONFIRMED', 'CLOSED'].includes(f.status);
      return isIssue && isResolved;
    }).length;
  }, [allFeedback]);

  // 1 to 5 Star Distribution
  const ratingDistribution = useMemo(() => {
    const counts: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allFeedback.forEach(f => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || f.ratings?.overall || 4)));
      counts[r] = (counts[r] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: counts[star],
      percent: allFeedback.length > 0 ? Math.round((counts[star] / allFeedback.length) * 100) : 0
    }));
  }, [allFeedback]);

  // Role Breakdown
  const roleBreakdown = useMemo(() => {
    const roles: { [key: string]: number } = { FARMER: 0, BUYER: 0, LOGISTICS: 0, FPO: 0 };
    allFeedback.forEach(f => {
      const role = f.submittedByRole || (f.userType === 'farmer' ? 'FARMER' : f.userType === 'buyer' ? 'BUYER' : 'OTHER');
      if (role.includes('FARMER')) roles.FARMER = (roles.FARMER || 0) + 1;
      else if (role.includes('BUYER')) roles.BUYER = (roles.BUYER || 0) + 1;
      else if (role.includes('LOGISTICS')) roles.LOGISTICS = (roles.LOGISTICS || 0) + 1;
      else if (role.includes('FPO')) roles.FPO = (roles.FPO || 0) + 1;
      else roles.BUYER = (roles.BUYER || 0) + 1;
    });
    return [
      { label: 'Farmers', count: roles.FARMER, color: 'bg-emerald-500' },
      { label: 'Buyers / Retailers', count: roles.BUYER, color: 'bg-blue-500' },
      { label: 'Logistics', count: roles.LOGISTICS, color: 'bg-amber-500' },
      { label: 'FPOs', count: roles.FPO, color: 'bg-purple-500' },
    ];
  }, [allFeedback]);

  // Common Issue Breakdown
  const issueBreakdown = useMemo(() => {
    const issues: { [key: string]: number } = {};
    allFeedback.forEach(f => {
      if (f.issueType && f.issueType !== 'No issue') {
        issues[f.issueType] = (issues[f.issueType] || 0) + 1;
      } else if (f.feedbackType === 'complaint') {
        const cat = f.category === 'delivery' ? 'Delivery delay' : f.category === 'product_quality' ? 'Quality issue' : 'Other';
        issues[cat] = (issues[cat] || 0) + 1;
      }
    });
    return Object.entries(issues)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [allFeedback]);

  const sentiment = getSentimentSummary(allFeedback);

  // Filtered feedback for Complaints / Management tab
  const filteredFeedbackList = useMemo(() => {
    return allFeedback.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.feedbackId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whatWentWell?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.whatCouldBeImproved?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shipmentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submittedByName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === 'ALL' ||
        item.submittedByRole === roleFilter ||
        (roleFilter === 'FARMER' && item.userType === 'farmer') ||
        (roleFilter === 'BUYER' && item.userType === 'buyer');

      const itemRating = Math.round(item.rating || item.ratings?.overall || 0);
      const matchRating = ratingFilter === 'ALL' || itemRating.toString() === ratingFilter;

      const matchCategory =
        categoryFilter === 'ALL' ||
        item.structuredCategory === categoryFilter ||
        item.category === categoryFilter.toLowerCase().replace(/ /g, '_');

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      const matchIssueType =
        issueTypeFilter === 'ALL' ||
        item.issueType === issueTypeFilter ||
        (issueTypeFilter === 'HAS_ISSUE' && item.issueType && item.issueType !== 'No issue');

      return matchSearch && matchRole && matchRating && matchCategory && matchStatus && matchIssueType;
    });
  }, [allFeedback, searchQuery, roleFilter, ratingFilter, categoryFilter, statusFilter, issueTypeFilter]);

  const handleStatusChange = (feedbackId: string, newStatus: string) => {
    if (updateFeedbackStatusAndNotes) {
      updateFeedbackStatusAndNotes(feedbackId, newStatus, internalNoteDraft);
    } else if (updateComplaintStatus) {
      updateComplaintStatus(feedbackId, newStatus);
    }
    if (selectedFeedback && selectedFeedback.feedbackId === feedbackId) {
      setSelectedFeedback({ ...selectedFeedback, status: newStatus as any });
    }
  };

  const handleSaveInternalNotes = () => {
    if (!selectedFeedback) return;
    setIsSavingNotes(true);
    try {
      if (updateFeedbackStatusAndNotes) {
        updateFeedbackStatusAndNotes(selectedFeedback.feedbackId, selectedFeedback.status, internalNoteDraft);
      }
      setSelectedFeedback({ ...selectedFeedback, internalNotes: internalNoteDraft });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSendReply = () => {
    if (!selectedFeedback || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const responderName = currentUser?.name || 'Central Support & Operations';
      const responderRole = currentRole || 'ADMIN';
      if (respondToFeedback) {
        respondToFeedback(selectedFeedback.feedbackId, replyText.trim(), responderName, responderRole);
      }
      const newResponse = {
        responseId: 'RESP-' + Date.now(),
        responderName,
        responderRole,
        message: replyText.trim(),
        createdAt: new Date().toISOString(),
      };
      setSelectedFeedback({
        ...selectedFeedback,
        status: 'RESPONDED',
        responses: [...(selectedFeedback.responses || []), newResponse]
      });
      setReplyText('');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#01472e] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#01472e]">{headerTitle}</h1>
          </div>
          <p className="text-xs text-[#788c80]">
            {headerSubtitle}
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#ccd5ae]/60 rounded-xl text-xs font-medium text-[#5c7065] hover:border-[#01472e]/40 transition cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#01472e] text-white shadow-sm'
                : 'bg-white text-[#5c7065] border border-[#ccd5ae]/60 hover:border-[#01472e]/30'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'ai-insights' && INITIAL_PATTERN_ALERTS.filter((a) => a.isNew).length > 0 && (
              <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                activeTab === tab.id ? 'bg-white text-[#01472e]' : 'bg-rose-500 text-white'
              }`}>
                {INITIAL_PATTERN_ALERTS.filter((a) => a.isNew).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Requirement 7: 6 Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard
              label="Total Feedback"
              value={allFeedback.length}
              icon={<MessageSquare className="w-5 h-5 text-[#01472e]" />}
              color="bg-[#eaf4ec] border-[#a3b18a]/40"
              trend="up"
              trendVal="12%"
              sub="All transactions"
            />
            <KPICard
              label="Average Rating"
              value={`${avgRating} ★`}
              icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
              color="bg-amber-50 border-amber-200"
              trend="up"
              trendVal="0.3"
              sub="Out of 5.0"
            />
            <KPICard
              label="Positive Feedback"
              value={`${positivePercent}%`}
              icon={<span className="text-xl">🟢</span>}
              color="bg-emerald-50 border-emerald-200"
              sub={`${positiveCount} items (4–5★)`}
            />
            <KPICard
              label="Negative Feedback"
              value={`${negativePercent}%`}
              icon={<span className="text-xl">🔴</span>}
              color="bg-rose-50 border-rose-200"
              sub={`${negativeCount} items (1–2★)`}
            />
            <KPICard
              label="Open Issues"
              value={openIssuesCount}
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
              color="bg-orange-50 border-orange-200"
              sub="Needs resolution"
            />
            <KPICard
              label="Resolved Issues"
              value={resolvedIssuesCount}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              color="bg-teal-50 border-teal-200"
              sub="Closed with solution"
            />
          </div>

          {/* Rating Distribution (1 to 5 Stars) & Role Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1 to 5 Star Distribution */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rating Distribution (1–5 Stars)
                </span>
                <span className="text-xs text-[#788c80] font-normal">Based on {allFeedback.length} reviews</span>
              </h3>
              <div className="space-y-2.5">
                {ratingDistribution.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 font-bold text-[#01472e] flex items-center gap-0.5">
                      {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-3 bg-[#eaf4ec] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-medium text-[#5c7065]">{count}</span>
                    <span className="w-10 text-right font-bold text-[#01472e] text-[11px]">{percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Breakdown */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#01472e]" /> Role Breakdown
                </span>
                <span className="text-xs text-[#788c80] font-normal">Feedback submitters</span>
              </h3>
              <div className="space-y-3">
                {roleBreakdown.map((r) => {
                  const pct = allFeedback.length > 0 ? Math.round((r.count / allFeedback.length) * 100) : 0;
                  return (
                    <div key={r.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-[#01472e]">{r.label}</span>
                        <span className="text-[#5c7065] font-semibold">{r.count} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-[#eaf4ec] rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Common Issues Breakdown & Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Issues Breakdown */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" /> Common Issues & Bottlenecks
              </h3>
              {issueBreakdown.length === 0 ? (
                <p className="text-xs text-emerald-700 py-4 text-center">🎉 No outstanding issues reported!</p>
              ) : (
                <div className="space-y-2">
                  {issueBreakdown.slice(0, 5).map(({ type, count }) => (
                    <div key={type} className="flex items-center justify-between p-2 rounded-xl bg-[#fafaf8] border border-[#ccd5ae]/30 text-xs">
                      <span className="font-medium text-[#01472e] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> {type}
                      </span>
                      <span className="font-bold text-rose-700 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                        {count} {count === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Category Performance
              </h3>
              <div className="space-y-2">
                {CATEGORY_PERFORMANCE.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5c7065] w-28 truncate">{cat.category}</span>
                    <div className="flex-1 h-2 bg-[#eaf4ec] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        cat.avgRating >= 4.5 ? 'bg-emerald-500' :
                        cat.avgRating >= 4.0 ? 'bg-teal-500' :
                        cat.avgRating >= 3.5 ? 'bg-amber-400' : 'bg-rose-500'
                      }`} style={{ width: `${(cat.avgRating / 5) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#01472e] w-8">{cat.avgRating}</span>
                    <span className={`text-[9px] ${
                      cat.trend === 'improving' ? 'text-emerald-600' :
                      cat.trend === 'worsening' ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {cat.trend === 'improving' ? '↑' : cat.trend === 'worsening' ? '↓' : '→'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trend Mini Chart */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Feedback Trend Over Time
            </h3>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {MONTHLY_TREND_DATA.map((d) => (
                <div key={d.period} className="text-center">
                  <div className="relative h-16 flex items-end justify-center">
                    <div
                      className="w-4 bg-[#01472e] rounded-t-md"
                      style={{ height: `${(d.count / 250) * 100}%` }}
                      title={`${d.count} feedback`}
                    />
                  </div>
                  <p className="text-[9px] text-[#788c80] mt-1">{d.period}</p>
                  <p className="text-[9px] font-bold text-[#01472e]">{d.count}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#ccd5ae]/30">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#01472e]" />
                <span className="text-[10px] text-[#788c80]">Total Feedback</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">
                ✅ Feedback volume increased 163% over 6 months. Platform engagement is growing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: AI INSIGHTS ─────────────────────────────────────────────────── */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#01472e]">AI Pattern Detection & Insights</h2>
            <span className="text-xs text-[#788c80]">{INITIAL_PATTERN_ALERTS.length} alerts detected</span>
          </div>
          {/* Root Cause Flow */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Root Cause Analysis — Delivery Delays
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Negative Feedback', color: 'bg-rose-100 text-rose-700' },
                { label: '→', color: '' },
                { label: 'Delivery Category', color: 'bg-amber-100 text-amber-700' },
                { label: '→', color: '' },
                { label: 'Late Delivery (avg +2.1h)', color: 'bg-orange-100 text-orange-700' },
                { label: '→', color: '' },
                { label: 'Peak Hour Congestion', color: 'bg-purple-100 text-purple-700' },
                { label: '→', color: '' },
                { label: 'Hub 03 Under-Capacity', color: 'bg-rose-100 text-rose-700' },
              ].map((item, i) => (
                item.color ? (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${item.color}`}>{item.label}</span>
                ) : (
                  <span key={i} className="text-[#788c80] font-bold text-sm">{item.label}</span>
                )
              ))}
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700">
                <strong>💡 Suggested Action:</strong> Add one additional delivery vehicle at Micro Hub 03 during 3-7 PM peak window. Estimated impact: 40% reduction in late deliveries.
              </p>
            </div>
          </div>
          <AiInsightsFeed alerts={INITIAL_PATTERN_ALERTS} maxShow={10} />
        </div>
      )}

      {/* ── TAB: COMPLAINTS / FEEDBACK MANAGEMENT ────────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Multi-Filters Bar */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#788c80]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order, shipment, comments, names..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 focus:outline-none focus:border-[#01472e]/40 text-[#01472e] placeholder-[#a3b18a]"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="FARMER">Farmer</option>
                <option value="BUYER">Buyer / Retailer</option>
                <option value="LOGISTICS">Logistics</option>
                <option value="FPO">FPO Aggregator</option>
              </select>

              {/* Rating Filter (1 to 5 Stars) */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars ★★★★★</option>
                <option value="4">4 Stars ★★★★☆</option>
                <option value="3">3 Stars ★★★☆☆</option>
                <option value="2">2 Stars ★★☆☆☆</option>
                <option value="1">1 Star ★☆☆☆☆</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Product Quality">Product Quality</option>
                <option value="Delivery">Delivery</option>
                <option value="Communication">Communication</option>
                <option value="Pricing">Pricing</option>
                <option value="Packaging">Packaging</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESPONDED">Responded</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              {/* Issue Type Filter */}
              <select
                value={issueTypeFilter}
                onChange={(e) => setIssueTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#fafaf8] rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Issue Types</option>
                <option value="HAS_ISSUE">Any Reported Issue</option>
                <option value="Quality issue">Quality issue</option>
                <option value="Quantity issue">Quantity issue</option>
                <option value="Delivery delay">Delivery delay</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong product">Wrong product</option>
                <option value="Payment issue">Payment issue</option>
                <option value="Communication issue">Communication issue</option>
                <option value="Other">Other issue</option>
                <option value="No issue">No issue</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-xs text-[#788c80] pt-1 border-t border-[#ccd5ae]/30">
              <span>Showing <strong>{filteredFeedbackList.length}</strong> matching transaction feedback records</span>
              {(roleFilter !== 'ALL' || ratingFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || issueTypeFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('ALL');
                    setRatingFilter('ALL');
                    setCategoryFilter('ALL');
                    setStatusFilter('ALL');
                    setIssueTypeFilter('ALL');
                  }}
                  className="text-xs text-[#01472e] hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Feedback & Issues List */}
          <div className="space-y-2">
            {filteredFeedbackList.map((item) => {
              const stars = Math.round(item.rating || item.ratings?.overall || 4);
              const isIssue = (item.issueType && item.issueType !== 'No issue') || item.feedbackType === 'complaint';
              return (
                <div
                  key={item.feedbackId}
                  className="bg-white rounded-2xl border border-[#ccd5ae]/60 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFeedback(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#01472e] font-mono">#{item.feedbackId}</span>
                        <FeedbackStatusBadge status={item.status} />
                        {isIssue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {item.issueType || 'Issue Reported'}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#eaf4ec] text-[#01472e]">
                          {item.structuredCategory || item.category?.replace(/_/g, ' ')}
                        </span>
                        {item.responses && item.responses.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                            💬 {item.responses.length} {item.responses.length === 1 ? 'Response' : 'Responses'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#01472e] font-medium line-clamp-2">
                        {item.whatWentWell ? `✓ ${item.whatWentWell}. ` : ''}
                        {item.whatCouldBeImproved ? `⚠ ${item.whatCouldBeImproved}. ` : ''}
                        {item.comment || item.additionalComments || 'No additional comment provided.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#788c80]">
                        <span className="font-semibold text-[#01472e]">
                          By: {item.submittedByName || item.userType || 'User'} ({item.submittedByRole || 'Participant'})
                        </span>
                        {item.orderId && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            Order: {item.orderId}
                          </span>
                        )}
                        {item.shipmentId && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            Shipment: {item.shipmentId}
                          </span>
                        )}
                        {item.productName && <span>🌾 {item.productName}</span>}
                        <span><Clock className="w-3 h-3 inline mr-0.5" />{new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                        {item.internalNotes && (
                          <span className="text-purple-700 font-semibold flex items-center gap-0.5">
                            🔒 Internal notes saved
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#5c7065]">{stars}.0 / 5.0</span>
                      </div>
                      <Eye className="w-4 h-4 text-[#a3b18a] hover:text-[#01472e]" />
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredFeedbackList.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#ccd5ae]/60">
                <p className="text-sm font-medium text-[#01472e]">No feedback found matching current filters</p>
                <p className="text-xs text-[#788c80] mt-1">Try relaxing your search terms or filter selection.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: TRENDS ──────────────────────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly feedback volume */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-4">Monthly Feedback Volume</h3>
              <div className="flex items-end gap-2 h-28">
                {MONTHLY_TREND_DATA.map((d) => (
                  <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center h-20">
                      <div
                        className="w-full max-w-[32px] bg-[#01472e] rounded-t-md hover:bg-[#003b25] transition-colors cursor-pointer"
                        style={{ height: `${(d.count / 250) * 100}%` }}
                        title={`${d.count}`}
                      />
                    </div>
                    <span className="text-[9px] text-[#788c80]">{d.period}</span>
                    <span className="text-[9px] font-bold text-[#01472e]">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint trend */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-1">Complaint Trend</h3>
              <p className="text-xs text-emerald-600 font-medium mb-4">📉 Complaints decreased 46% over 6 months</p>
              <div className="flex items-end gap-2 h-28">
                {MONTHLY_TREND_DATA.map((d) => (
                  <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center h-20">
                      <div
                        className="w-full max-w-[32px] bg-rose-400 rounded-t-md"
                        style={{ height: `${(d.complaints / 35) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-[#788c80]">{d.period}</span>
                    <span className="text-[9px] font-bold text-rose-600">{d.complaints}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avg rating trend */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <h3 className="font-semibold text-[#01472e] text-sm mb-4">Average Rating Over Time</h3>
            <div className="flex items-center gap-4 mb-3">
              {MONTHLY_TREND_DATA.map((d) => (
                <div key={d.period} className="text-center flex-1">
                  <div className="flex justify-center mb-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-amber-600">{d.avgRating}</p>
                  <p className="text-[9px] text-[#788c80]">{d.period}</p>
                </div>
              ))}
            </div>
            <TrendLine data={MONTHLY_TREND_DATA.map((d) => d.avgRating)} color="#f59e0b" height={48} />
          </div>

          {/* Category comparison */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <h3 className="font-semibold text-[#01472e] text-sm mb-4">Category Performance Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORY_PERFORMANCE.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-xl bg-[#fafaf8] border border-[#ccd5ae]/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-xs font-medium text-[#01472e] truncate">{cat.category}</p>
                      <span className={`text-[9px] font-bold ${
                        cat.trend === 'improving' ? 'text-emerald-600' :
                        cat.trend === 'worsening' ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {cat.trend === 'improving' ? '↑ Improving' : cat.trend === 'worsening' ? '↓ Worsening' : '→ Stable'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#788c80]">
                      <span className="text-emerald-600">✅ {cat.positive}%</span>
                      <span className="text-rose-600">❌ {cat.negative}%</span>
                      <span>{cat.complaints} complaints</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-[#01472e]">{cat.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: FARMERS ─────────────────────────────────────────────────────── */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#01472e]">Farmer Trust & Recognition</h2>
            <span className="text-xs text-[#788c80]">{FARMER_TRUST_PROFILES.length} farmers tracked</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FARMER_TRUST_PROFILES.map((profile) => (
              <FarmerTrustCard key={profile.farmerId} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: LOCATIONS ───────────────────────────────────────────────────── */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#01472e]">Location-Based Feedback Intelligence</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs text-amber-800 font-medium">
              💡 AI Insight: Area B (Tirupur — Zone B) has frequent quality issues. Area C (Erode — Zone C) has persistent delivery delays.
              Recommend targeted audits for both zones.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#eaf4ec] border-b border-[#ccd5ae]/40">
                  <th className="text-left px-4 py-3 font-semibold text-[#01472e]">Area</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#01472e]">Hub</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#01472e]">Avg Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#01472e]">Delivery</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#01472e]">Complaints</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#01472e]">Main Issue</th>
                  <th className="text-center px-4 py-3 font-semibold text-[#01472e]">Trend</th>
                </tr>
              </thead>
              <tbody>
                {AREA_FEEDBACK_SUMMARY.map((area) => (
                  <tr key={area.area} className="border-b border-[#ccd5ae]/20 hover:bg-[#fafaf8] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#01472e]">{area.area}</p>
                      <p className="text-[10px] text-[#788c80]">{area.zone}</p>
                    </td>
                    <td className="px-4 py-3 text-[#5c7065]">{area.microHub}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className={`w-3 h-3 ${area.avgRating >= 4 ? 'fill-amber-400 text-amber-400' : 'fill-rose-400 text-rose-400'}`} />
                        <span className={`font-bold ${area.avgRating >= 4 ? 'text-emerald-700' : area.avgRating >= 3.5 ? 'text-amber-700' : 'text-rose-700'}`}>
                          {area.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${area.deliveryRating >= 4 ? 'text-emerald-600' : area.deliveryRating >= 3.5 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {area.deliveryRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${area.complaintCount > 25 ? 'text-rose-600' : area.complaintCount > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {area.complaintCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5c7065]">{area.mainIssue}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold ${
                        area.trend === 'improving' ? 'text-emerald-600' :
                        area.trend === 'worsening' ? 'text-rose-600' : 'text-slate-500'
                      }`}>
                        {area.trend === 'improving' ? '↑ Improving' :
                         area.trend === 'worsening' ? '↓ Worsening' : '→ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: YOU SAID ────────────────────────────────────────────────────── */}
      {activeTab === 'you-said' && <YouSaidWeImproved />}

      {/* ── ACTIONABLE FEEDBACK & COMPLAINTS MANAGEMENT DRAWER / MODAL ─────── */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-[#ccd5ae]/40 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#01472e]">Transaction Feedback Review</h3>
                  <span className="text-xs font-mono font-bold text-[#5c7065] bg-[#eaf4ec] px-2 py-0.5 rounded-md">
                    #{selectedFeedback.feedbackId}
                  </span>
                </div>
                <p className="text-xs text-[#788c80] mt-0.5">
                  Submitted on {new Date(selectedFeedback.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Status and Issue Indicators */}
              <div className="flex flex-wrap items-center gap-2">
                <FeedbackStatusBadge status={selectedFeedback.status} />
                {selectedFeedback.issueType && selectedFeedback.issueType !== 'No issue' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {selectedFeedback.issueType}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30">
                  📁 {selectedFeedback.structuredCategory || selectedFeedback.category?.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  👤 By: {selectedFeedback.submittedByName || selectedFeedback.userType} ({selectedFeedback.submittedByRole || 'User'})
                </span>
              </div>

              {/* Verified Transaction Context Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <Package className="w-3.5 h-3.5 text-[#01472e]" /> Verified Transaction Context
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Completed & Linked
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Order ID</p>
                    <p className="font-mono font-bold text-[#01472e] mt-0.5 truncate">{selectedFeedback.orderId || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Shipment ID</p>
                    <p className="font-mono font-bold text-[#01472e] mt-0.5 truncate">{selectedFeedback.shipmentId || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Crop / Produce</p>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">{selectedFeedback.productName || '—'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Transaction Date</p>
                    <p className="font-medium text-slate-700 mt-0.5 truncate">
                      {selectedFeedback.transactionDate
                        ? new Date(selectedFeedback.transactionDate).toLocaleDateString('en-IN')
                        : new Date(selectedFeedback.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-500">Farmer: </span>
                    <span className="font-medium text-slate-800">{selectedFeedback.farmerName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Buyer: </span>
                    <span className="font-medium text-slate-800">{selectedFeedback.buyerName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Carrier: </span>
                    <span className="font-medium text-slate-800">{selectedFeedback.carrierName || 'Tamil Nadu Agri Logistics'}</span>
                  </div>
                </div>
              </div>

              {/* Rating & Structured Review Details */}
              <div className="bg-[#fafaf8] rounded-2xl p-4 border border-[#ccd5ae]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#01472e]">Rating & Feedback Content</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(selectedFeedback.rating || selectedFeedback.ratings?.overall || 4)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#01472e]">
                      {Math.round(selectedFeedback.rating || selectedFeedback.ratings?.overall || 4)}.0 / 5.0
                    </span>
                  </div>
                </div>

                {selectedFeedback.whatWentWell && (
                  <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">What went well</p>
                    <p className="text-xs text-emerald-950 font-medium">{selectedFeedback.whatWentWell}</p>
                  </div>
                )}

                {selectedFeedback.whatCouldBeImproved && (
                  <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5">What could be improved</p>
                    <p className="text-xs text-amber-950 font-medium">{selectedFeedback.whatCouldBeImproved}</p>
                  </div>
                )}

                <div className="bg-white rounded-xl p-3 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detailed Remarks</p>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {selectedFeedback.comment || selectedFeedback.additionalComments || 'No detailed comments added.'}
                  </p>
                </div>
              </div>

              {/* Private Staff / Internal Notes (Requirement 8 - Private & Protected) */}
              <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    🔒 Internal Investigation Notes <span className="text-[10px] font-normal text-purple-700">(Staff Only · Never visible to customer)</span>
                  </h4>
                  <button
                    onClick={handleSaveInternalNotes}
                    disabled={isSavingNotes}
                    className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-medium hover:bg-purple-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  value={internalNoteDraft}
                  onChange={(e) => setInternalNoteDraft(e.target.value)}
                  placeholder="Record root cause findings, supplier follow-up details, cold-storage checks, or internal notes..."
                  rows={2}
                  className="w-full p-2.5 bg-white rounded-xl border border-purple-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Official Public Responses Thread (Requirement 8 - Public to User) */}
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  💬 Official Resolution Thread <span className="text-[10px] font-normal text-blue-700">(Visible to User in My Feedback)</span>
                </h4>

                {/* Existing responses list */}
                {selectedFeedback.responses && selectedFeedback.responses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFeedback.responses.map((resp: any, i: number) => (
                      <div key={resp.responseId || i} className="bg-white rounded-xl p-3 border border-blue-100 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#01472e]">{resp.responderName} ({resp.responderRole})</span>
                          <span className="text-slate-400">{new Date(resp.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-xs text-slate-700">{resp.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-blue-700 italic">No official responses posted yet.</p>
                )}

                {/* Compose new response */}
                <div className="space-y-2 pt-1 border-t border-blue-100">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write an official response or resolution message to the user..."
                    rows={2}
                    className="w-full p-2.5 bg-white rounded-xl border border-blue-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyText.trim()}
                      className="px-4 py-1.5 bg-[#01472e] text-white rounded-xl text-xs font-medium hover:bg-[#003b25] transition disabled:opacity-40 cursor-pointer"
                    >
                      {isSendingReply ? 'Sending...' : 'Send Official Response'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Update & Resolution Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-[#01472e]">Update Processing Status</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedFeedback.feedbackId, 'UNDER_REVIEW')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                      selectedFeedback.status === 'UNDER_REVIEW'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedFeedback.feedbackId, 'RESPONDED')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl transition cursor-pointer ${
                      selectedFeedback.status === 'RESPONDED'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Mark Responded
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedFeedback.feedbackId, 'RESOLVED')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      selectedFeedback.status === 'RESOLVED'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
