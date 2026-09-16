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
  const { feedbackItems, updateComplaintStatus, currentRole } = useApp() as any;
  const [activeTab, setActiveTab] = useState<FITab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  // Filter feedback items according to role scope
  const allFeedback: FeedbackItem[] = useMemo(() => {
    const raw = (feedbackItems || []) as FeedbackItem[];
    if (currentRole === 'LOGISTICS') {
      return raw.filter(
        (f) =>
          f.category === 'delivery' ||
          f.category === 'packaging' ||
          (f.ratings && f.ratings.delivery !== undefined && f.ratings.delivery < 5) ||
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
          f.category === 'pricing' ||
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

  const complaints = allFeedback.filter((f) => f.feedbackType === 'complaint');
  const openComplaints = complaints.filter((f) => !['RESOLVED', 'USER_CONFIRMED', 'CLOSED'].includes(f.status));
  const highPriority = openComplaints.filter((f) => f.priority === 'high');
  const resolved = complaints.filter((f) => ['RESOLVED', 'USER_CONFIRMED'].includes(f.status));

  const avgRating = getAverageRating(allFeedback);
  const sentiment = getSentimentSummary(allFeedback);
  const resolutionRate = complaints.length > 0 ? Math.round((resolved.length / complaints.length) * 100) : 100;

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch = !searchQuery ||
        c.feedbackId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.buyerName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter.toLowerCase();
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [complaints, searchQuery, priorityFilter, statusFilter]);

  const handleStatusChange = (feedbackId: string, newStatus: string) => {
    if (updateComplaintStatus) updateComplaintStatus(feedbackId, newStatus);
    setSelectedFeedback(null);
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
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard label="Total Feedback" value={allFeedback.length} icon={<MessageSquare className="w-5 h-5 text-[#01472e]" />} color="bg-[#eaf4ec] border-[#a3b18a]/40" trend="up" trendVal="12%" sub="This month" />
            <KPICard label="Average Rating" value={`${avgRating} / 5`} icon={<Star className="w-5 h-5 text-amber-500" />} color="bg-amber-50 border-amber-200" trend="up" trendVal="0.3" sub="vs. last month" />
            <KPICard label="Open Complaints" value={openComplaints.length} icon={<AlertTriangle className="w-5 h-5 text-rose-600" />} color="bg-rose-50 border-rose-200" trend="down" trendVal="18%" />
            <KPICard label="Resolution Rate" value={`${resolutionRate}%`} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50 border-emerald-200" trend="up" trendVal="5%" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard label="Positive Feedback" value={`${sentiment.positive}%`} icon={<span className="text-xl">🟢</span>} color="bg-emerald-50 border-emerald-200" />
            <KPICard label="Neutral Feedback" value={`${sentiment.neutral}%`} icon={<span className="text-xl">🟡</span>} color="bg-amber-50 border-amber-200" />
            <KPICard label="Negative Feedback" value={`${sentiment.negative}%`} icon={<span className="text-xl">🔴</span>} color="bg-rose-50 border-rose-200" />
            <KPICard label="High Priority Issues" value={highPriority.length} icon={<Lightbulb className="w-5 h-5 text-orange-600" />} color="bg-orange-50 border-orange-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sentiment distribution */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Sentiment Distribution
              </h3>
              <SentimentBar
                positive={sentiment.positive}
                neutral={sentiment.neutral}
                negative={sentiment.negative}
                mixed={sentiment.mixed}
              />
            </div>

            {/* Category performance */}
            <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
              <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Category Performance
              </h3>
              <div className="space-y-2">
                {CATEGORY_PERFORMANCE.slice(0, 6).map((cat) => (
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

          {/* Trend mini chart */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <h3 className="font-semibold text-[#01472e] text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Monthly Trend
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

          {/* Quick AI insights */}
          <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#01472e] text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Insights Summary
              </h3>
              <button onClick={() => setActiveTab('ai-insights')} className="text-xs text-[#01472e] hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <AiInsightsFeed alerts={INITIAL_PATTERN_ALERTS} maxShow={3} compact />
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

      {/* ── TAB: COMPLAINTS ──────────────────────────────────────────────────── */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#788c80]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-xl border border-[#ccd5ae]/60 focus:outline-none focus:border-[#01472e]/40 text-[#01472e] placeholder-[#a3b18a]"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white rounded-xl border border-[#ccd5ae]/60 text-[#5c7065] cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="text-xs text-[#788c80]">{filteredComplaints.length} complaints found</div>

          {/* Complaint list */}
          <div className="space-y-2">
            {filteredComplaints.map((c) => (
              <div
                key={c.feedbackId}
                className="bg-white rounded-2xl border border-[#ccd5ae]/60 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedFeedback(c)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#01472e] font-mono">#{c.feedbackId}</span>
                      <FeedbackStatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      <SentimentBadge sentiment={c.sentiment} />
                    </div>
                    <p className="text-xs text-[#01472e] font-medium truncate">{c.comment?.slice(0, 100)}...</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-[#788c80]">
                      <span>{c.userType === 'farmer' ? '👨‍🌾 Farmer' : '🛒 Buyer'}</span>
                      {c.orderId && <span><Package className="w-3 h-3 inline mr-0.5" />{c.orderId}</span>}
                      {c.farmerName && <span>🌾 {c.farmerName}</span>}
                      {c.area && <span><MapPin className="w-3 h-3 inline mr-0.5" />{c.area}</span>}
                      <span><Clock className="w-3 h-3 inline mr-0.5" />{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      {c.aiAnalysis?.repeatedIssueFlag && (
                        <span className="text-rose-600 font-medium">🔁 Repeated Issue</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.ratings.overall && <StarDisplay value={c.ratings.overall} size="xs" />}
                    <Eye className="w-4 h-4 text-[#a3b18a] hover:text-[#01472e]" />
                  </div>
                </div>
              </div>
            ))}
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

      {/* ── FEEDBACK DETAIL MODAL ────────────────────────────────────────────── */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFeedback(null)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b border-[#ccd5ae]/40 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-bold text-[#01472e]">Feedback Detail</h3>
                <p className="text-xs text-[#788c80] font-mono">#{selectedFeedback.feedbackId}</p>
              </div>
              <button onClick={() => setSelectedFeedback(null)} className="p-2 rounded-xl hover:bg-[#eaf4ec] cursor-pointer text-[#788c80]">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2">
                <FeedbackStatusBadge status={selectedFeedback.status} />
                <PriorityBadge priority={selectedFeedback.priority} />
                <SentimentBadge sentiment={selectedFeedback.sentiment} />
                {selectedFeedback.aiAnalysis?.repeatedIssueFlag && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">🔁 REPEATED ISSUE</span>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'User Type', value: selectedFeedback.userType },
                  { label: 'Order ID', value: selectedFeedback.orderId || '—' },
                  { label: 'Farmer', value: selectedFeedback.farmerName || '—' },
                  { label: 'Buyer', value: selectedFeedback.buyerName || '—' },
                  { label: 'Product', value: selectedFeedback.productName || '—' },
                  { label: 'Hub', value: selectedFeedback.microHubName || '—' },
                  { label: 'Area', value: selectedFeedback.area || '—' },
                  { label: 'Category', value: selectedFeedback.category.replace(/_/g, ' ') },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#fafaf8] rounded-xl p-2.5 border border-[#ccd5ae]/30">
                    <p className="text-[10px] text-[#788c80] uppercase tracking-wide">{label}</p>
                    <p className="font-medium text-[#01472e] capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Comment */}
              <div className="bg-[#fafaf8] rounded-xl p-3 border border-[#ccd5ae]/40">
                <p className="text-[10px] text-[#788c80] mb-1">Comment</p>
                <p className="text-sm text-[#01472e]">{selectedFeedback.comment}</p>
              </div>

              {/* Tags */}
              {selectedFeedback.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedFeedback.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-[#eaf4ec] rounded-full text-[10px] text-[#5c7065] border border-[#a3b18a]/30">{tag}</span>
                  ))}
                </div>
              )}

              {/* AI Analysis */}
              <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200 space-y-2">
                <p className="text-xs font-bold text-violet-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Analysis
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-violet-500">Type: </span>
                    <span className="font-medium text-violet-800 capitalize">{selectedFeedback.aiAnalysis?.feedbackType}</span>
                  </div>
                  <div>
                    <span className="text-violet-500">Confidence: </span>
                    <span className="font-medium text-violet-800">{Math.round((selectedFeedback.aiConfidence || 0) * 100)}%</span>
                  </div>
                </div>
                <div className="text-[10px]">
                  <p className="text-violet-500 mb-0.5">Possible Root Cause:</p>
                  <p className="text-violet-800 font-medium">{selectedFeedback.aiAnalysis?.possibleRootCause}</p>
                </div>
                <div className="text-[10px]">
                  <p className="text-violet-500 mb-0.5">Recommended Action:</p>
                  <p className="text-violet-800 font-medium">{selectedFeedback.aiAnalysis?.recommendedAction}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#01472e]">Admin Actions</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Mark Under Review', status: 'UNDER_REVIEW', color: 'bg-blue-600' },
                    { label: 'Assign to Team', status: 'ASSIGNED', color: 'bg-violet-600' },
                    { label: 'Action Taken', status: 'ACTION_TAKEN', color: 'bg-amber-600' },
                    { label: 'Resolve', status: 'RESOLVED', color: 'bg-emerald-600' },
                  ].map(({ label, status, color }) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedFeedback.feedbackId, status)}
                      className={`px-3 py-1.5 ${color} text-white text-xs font-medium rounded-xl hover:opacity-90 transition cursor-pointer`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
