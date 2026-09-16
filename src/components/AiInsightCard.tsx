import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  onClick?: () => void;
}

export const AiInsightCard: React.FC<AiInsightProps> = ({
  type = 'insight',
  badgeText,
  title,
  description,
  subtitle,
  recommendation,
  metrics,
  actionLabel,
  onAction,
  className = '',
  variant = 'light',
  onClick
}) => {
  const { t } = useLanguage();
  const effectiveBadgeText = badgeText || t('ai.smartInsightBadge', '✦ Smart AI Insight');
  const descText = description || [subtitle, recommendation].filter(Boolean).join(' ');
  const cardClick = onClick || onAction;

  if (variant === 'dark') {
    return (
      <div 
        onClick={cardClick}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white p-6 border border-[#a3b18a]/30 shadow-forest ${cardClick ? 'cursor-pointer hover:shadow-forest/20 transition-all' : ''} ${className}`}
      >
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fefae0]/15 text-[#fefae0] border border-[#fefae0]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{effectiveBadgeText}</span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
            {descText && <p className="text-xs text-emerald-100/85 leading-relaxed max-w-2xl font-normal">{descText}</p>}

            {metrics && metrics.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {metrics.map((m, idx) => (
                  <div key={idx} className="bg-white/10 px-3.5 py-1.5 rounded-2xl border border-white/15 backdrop-blur-xs">
                    <span className="text-[10px] text-emerald-200 uppercase tracking-wider block font-semibold">{m.label}</span>
                    <span className="text-sm font-bold font-mono text-[#fefae0]">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#fefae0] hover:bg-white text-[#01472e] transition-all shadow-soft self-start shrink-0 cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#01472e]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={cardClick}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eaf4ec]/70 via-[#faf9f5] to-[#fefae0]/40 p-6 border border-[#ccd5ae]/50 shadow-soft hover:border-[#a3b18a] transition-all ${cardClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/50">
            <Sparkles className="w-3.5 h-3.5 text-[#01472e]" />
            <span>{effectiveBadgeText}</span>
          </div>
          <h4 className="text-base font-bold text-[#01472e] tracking-tight">{title}</h4>
          {descText && <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-normal">{descText}</p>}

          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1.5">
              {metrics.map((m, idx) => (
                <div key={idx} className="bg-white px-3.5 py-1.5 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">{m.label}</span>
                  <span className={`text-sm font-bold font-mono ${m.positive !== false ? 'text-[#01472e]' : 'text-slate-800'}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {actionLabel && (
          <button
            onClick={onAction}
            className="btn-primary self-start shrink-0 text-xs py-2 px-4 rounded-xl shadow-soft"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
