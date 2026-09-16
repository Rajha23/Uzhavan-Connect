import React from 'react';
import { FarmerBadgeType, FarmerTrustProfile } from '../../types/feedback';

const BADGE_CONFIG: Record<FarmerBadgeType, { emoji: string; label: string; color: string; bg: string }> = {
  TRUSTED_FARMER:    { emoji: '🌱', label: 'Trusted Farmer',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  TOP_RATED:         { emoji: '⭐', label: 'Top Rated',           color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  FRESHNESS_CHAMPION:{ emoji: '🥬', label: 'Freshness Champion', color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200' },
  QUALITY_CHAMPION:  { emoji: '🏆', label: 'Quality Champion',   color: 'text-yellow-700',  bg: 'bg-yellow-50 border-yellow-200' },
  RELIABLE_SUPPLIER: { emoji: '🚚', label: 'Reliable Supplier',  color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  RISING_STAR:       { emoji: '🌟', label: 'Rising Star',         color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
};

interface FarmerTrustBadgeProps {
  badge: FarmerBadgeType;
  size?: 'sm' | 'md';
}

export const FarmerTrustBadge: React.FC<FarmerTrustBadgeProps> = ({ badge, size = 'sm' }) => {
  const c = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${c.bg} ${c.color} ${size === 'md' ? 'text-xs px-3 py-1' : 'text-[10px]'} font-medium`}>
      <span>{c.emoji}</span>
      <span>{c.label}</span>
    </span>
  );
};

// ─── Farmer Trust Card ────────────────────────────────────────────────────────

interface FarmerTrustCardProps {
  profile: FarmerTrustProfile;
}

const trendIcon = (trend: string) =>
  trend === 'improving' ? '📈' : trend === 'worsening' ? '📉' : '➡️';

export const FarmerTrustCard: React.FC<FarmerTrustCardProps> = ({ profile }) => (
  <div className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-semibold text-[#01472e] text-sm">{profile.farmerName}</h4>
        <p className="text-xs text-[#788c80]">{profile.area} · {profile.totalReviews} reviews</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
        ⭐ {profile.avgOverallRating.toFixed(1)}
        <span className="text-base ml-1">{trendIcon(profile.trend)}</span>
      </div>
    </div>

    {/* Mini rating bars */}
    <div className="space-y-1.5 mb-3">
      {[
        { label: 'Quality',   value: profile.avgQualityRating },
        { label: 'Freshness', value: profile.avgFreshnessRating },
        { label: 'Delivery',  value: profile.avgDeliveryRating },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[10px] text-[#788c80] w-14">{label}</span>
          <div className="flex-1 h-1.5 bg-[#eaf4ec] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#01472e] rounded-full transition-all"
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-[#01472e] w-6 text-right">{value.toFixed(1)}</span>
        </div>
      ))}
    </div>

    {/* Badges */}
    {profile.badges.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {profile.badges.map((b) => <FarmerTrustBadge key={b} badge={b} />)}
      </div>
    )}
    {profile.badges.length === 0 && (
      <div className="text-[10px] text-[#788c80] italic">
        {profile.complaintCount > 10
          ? '⚠️ Under performance review'
          : 'Building track record...'}
      </div>
    )}
  </div>
);
