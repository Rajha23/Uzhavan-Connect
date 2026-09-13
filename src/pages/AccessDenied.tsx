import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AccessDenied: React.FC<{ attemptedFeature?: string }> = ({ attemptedFeature }) => {
  const { currentRole, setActiveTab } = useApp();
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
            {t('accessDenied.subtitle', 'HTTP 403 • FORBIDDEN')}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mt-2">
            {t('accessDenied.title', 'Access Denied')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('accessDenied.message', 'Your authenticated role ({role}) does not have authorization to view {feature}.', {
              role: currentRole,
              feature: attemptedFeature || 'this protected module'
            })}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left">
          <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('accessDenied.securityPolicy', 'RBAC Security Policy')}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {t('accessDenied.securityDesc', 'Each role in Uzhavan Connect maintains isolated permissions. Unauthorized URL routing is blocked to prevent data exposure.')}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('accessDenied.returnDashboard', 'Return to {role} Dashboard', { role: currentRole })}</span>
        </button>
      </div>
    </div>
  );
};
