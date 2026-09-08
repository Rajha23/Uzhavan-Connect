import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export interface AiInsightProps {
  type?: 'recommendation' | 'insight' | 'warning' | 'market';
  badgeText?: string;
  title: string;
  description?: string;
  subtitle?: string;
  recommendation?: string;
  metrics?: { label: string; value: string; positive?: boolean; trend?: string }[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'light' | 'dark';
}

export const AiInsightCard: React.FC<AiInsightProps> = ({
  type = 'insight',
  badgeText = '✦ Smart AI Insight',
  title,
  description,
  subtitle,
  recommendation,
  metrics,
  actionLabel,
  onAction,
  className = '',
  variant = 'light'
}) => {
  const descText = description || [subtitle, recommendation].filter(Boolean).join(' ');
  if (variant === 'dark') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-5 border border-emerald-500/20 shadow-sm ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>
            <h4 className="text-base font-semibold text-white tracking-tight">{title}</h4>
            {descText && <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{descText}</p>}

            {metrics && metrics.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {metrics.map((m, idx) => (
                  <div key={idx} className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-medium">{m.label}</span>
                    <strong className="text-sm font-semibold text-emerald-300">{m.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-xs self-start shrink-0 cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-5 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-300/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{badgeText}</span>
          </div>
          <h4 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h4>
          {descText && <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{descText}</p>}

          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1.5">
              {metrics.map((m, idx) => (
                <div key={idx} className="bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">{m.label}</span>
                  <strong className={`text-sm font-semibold ${m.positive !== false ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {m.value}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="btn-primary self-start shrink-0 text-xs"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
