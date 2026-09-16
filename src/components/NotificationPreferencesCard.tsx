import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Check,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Package,
  Truck,
  Scale,
  QrCode,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { NotificationPreferences } from '../types';

export const NotificationPreferencesCard: React.FC = () => {
  const { t } = useLanguage();
  const {
    notificationPreferences,
    updateNotificationPreferences,
    resetNotificationPreferences,
    setActiveTab
  } = useApp();

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === 'system') return; // Cannot disable system/security alerts
    updateNotificationPreferences({ [key]: !notificationPreferences[key] });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleReset = () => {
    resetNotificationPreferences();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const categories = [
    {
      key: 'marketDemand' as const,
      icon: TrendingUp,
      title: t('profile.marketDemandTitle', 'Market & Direct Demand'),
      description: t('profile.marketDemandDesc', 'Matching buyer demands, wholesale pricing spikes, and regional aggregation pools'),
      enabled: notificationPreferences.marketDemand,
      locked: false
    },
    {
      key: 'orders' as const,
      icon: Package,
      title: t('profile.ordersTitle', 'Order Lifecycle & Procurement'),
      description: t('profile.ordersDesc', 'Order placement, farm-gate collection notices, packaging, and buyer delivery acceptance'),
      enabled: notificationPreferences.orders,
      locked: false
    },
    {
      key: 'logistics' as const,
      icon: Truck,
      title: t('profile.logisticsTitle', 'Cold-Chain & Fleet Telematics'),
      description: t('profile.logisticsDesc', 'Pickup schedules, vehicle dispatches, temperature sensor pings, and delivery tracking'),
      enabled: notificationPreferences.logistics,
      locked: false
    },
    {
      key: 'payments' as const,
      icon: Scale,
      title: t('profile.paymentsTitle', 'Payments & Direct Settlement'),
      description: t('profile.paymentsDesc', 'Direct bank credits, e-RUPI programmable escrow settlements, and statutory cess audits'),
      enabled: notificationPreferences.payments,
      locked: false
    },
    {
      key: 'traceability' as const,
      icon: QrCode,
      title: t('profile.traceabilityTitle', 'Traceability & Quality Grading'),
      description: t('profile.traceabilityDesc', 'Sugar brix & firmness test certifications, residue lab results, and QR batch passports'),
      enabled: notificationPreferences.traceability,
      locked: false
    },
    {
      key: 'advisory' as const,
      icon: Sparkles,
      title: t('profile.advisoryTitle', 'AI Advisory & Harvest Reminders'),
      description: t('profile.advisoryDesc', 'AI Farmer Mentor suggestions, upcoming harvest readiness windows, and price trends'),
      enabled: notificationPreferences.advisory,
      locked: false
    },
    {
      key: 'system' as const,
      icon: ShieldCheck,
      title: t('profile.systemTitle', 'Platform Governance & Security'),
      description: t('profile.systemDesc', 'Mandatory statutory compliance, apex audit alerts, and security-protected account notices'),
      enabled: true,
      locked: true
    }
  ];

  return (
    <div className="bg-white rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center shadow-2xs shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#01472e] uppercase tracking-wider flex items-center gap-2">
              <span>{t('profile.notificationPreferences', 'Notification & Alert Preferences')}</span>
              {savedFeedback && (
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 normal-case animate-in fade-in">
                  <Check className="w-3 h-3 text-emerald-700" />
                  {t('profile.preferencesSaved', 'Preferences Saved')}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('profile.controlAlerts', 'Control which operational alert streams you receive. Settings are preserved across all sessions.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#ccd5ae] hover:bg-[#faf9f5] text-slate-700 font-semibold text-xs transition cursor-pointer"
            title="Restore default recommended notification settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('profile.resetDefaults', 'Reset Defaults')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold text-xs shadow-soft transition cursor-pointer"
          >
            <span>{t('profile.openNotificationCenter', 'Open Notification Center')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e9edc9]" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                cat.locked
                  ? 'bg-[#faf9f5] border-[#ccd5ae]/60'
                  : cat.enabled
                  ? 'bg-white border-[#01472e]/30 shadow-2xs hover:border-[#01472e]/60'
                  : 'bg-slate-50/70 border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    cat.locked
                      ? 'bg-[#01472e] text-[#fefae0]'
                      : cat.enabled
                      ? 'bg-[#eaf4ec] text-[#01472e]'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-[#01472e]">{cat.title}</h4>
                    {cat.locked && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40 uppercase tracking-wider">
                        <Lock className="w-2.5 h-2.5 text-[#01472e]" />
                        {t('profile.mandatory', 'Mandatory')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="shrink-0 pt-0.5">
                {cat.locked ? (
                  <div
                    className="w-11 h-6 bg-[#01472e] rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-90"
                    title="Platform security alerts cannot be disabled"
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-xs flex items-center justify-center text-[8px] font-bold text-[#01472e]">
                      <Check className="w-3 h-3 text-[#01472e]" />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cat.enabled}
                    onClick={() => handleToggle(cat.key)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      cat.enabled ? 'bg-[#01472e] justify-end' : 'bg-slate-300 justify-start'
                    }`}
                    title={cat.enabled ? `Disable ${cat.title}` : `Enable ${cat.title}`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
