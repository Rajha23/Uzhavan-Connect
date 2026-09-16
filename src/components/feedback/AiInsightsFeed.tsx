import React from 'react';
import { PatternAlert } from '../../types/feedback';
import { AlertTriangle, Info, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react';

interface AiInsightsFeedProps {
  alerts: PatternAlert[];
  maxShow?: number;
  compact?: boolean;
}

const SEVERITY_CONFIG = {
  high:   { bg: 'bg-rose-50',    border: 'border-rose-200',   icon: AlertTriangle, iconColor: 'text-rose-600',    dot: 'bg-rose-500',    prefix: '⚠️' },
  medium: { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: AlertTriangle, iconColor: 'text-amber-600',   dot: 'bg-amber-500',   prefix: '⚠️' },
  low:    { bg: 'bg-blue-50',    border: 'border-blue-200',   icon: Info,          iconColor: 'text-blue-600',    dot: 'bg-blue-500',    prefix: '💡' },
};

export const AiInsightsFeed: React.FC<AiInsightsFeedProps> = ({
  alerts,
  maxShow = 5,
  compact = false,
}) => {
  const shown = alerts.slice(0, maxShow);

  if (shown.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-700">No critical alerts detected</p>
          <p className="text-xs text-emerald-600">Platform is performing within normal parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shown.map((alert) => {
        const cfg = SEVERITY_CONFIG[alert.severity];
        const Icon = cfg.icon;
        return (
          <div
            key={alert.alertId}
            className={`flex items-start gap-3 p-3.5 ${cfg.bg} border ${cfg.border} rounded-2xl relative overflow-hidden`}
          >
            {alert.isNew && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                NEW
              </span>
            )}
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-[#01472e] leading-snug">{alert.title}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 ${
                  alert.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                  alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{alert.severity}</span>
              </div>
              {!compact && (
                <p className="text-xs text-[#5c7065] mt-0.5 leading-relaxed">{alert.description}</p>
              )}
              <div className="flex items-start gap-1 mt-1.5">
                <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#4a6350] font-medium leading-snug">{alert.suggestedAction}</p>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#788c80]">
                <span>{alert.affectedEntity}</span>
                <span>·</span>
                <span>{alert.occurrenceCount} occurrences</span>
                <span>·</span>
                <span>{alert.timeframe}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Positive insight synthetic entry */}
      <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-700">✅ Positive Insight</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Farmer Anbu Arasan maintains a 4.9 average rating across 124 orders with 98% positive feedback.
            Consider awarding Quality Champion recognition.
          </p>
        </div>
      </div>
    </div>
  );
};
