import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Headphones, Mail, Copy, Check, ArrowLeft, Sprout, ShieldCheck } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { setActiveTab, isAuthenticated, currentRole } = useApp();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const supportEmail = 'uzhavanconnect@gmail.com';

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(supportEmail);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = supportEmail;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleOpenEmail = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  const handleReturn = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      if (isAuthenticated) {
        if (currentRole === 'FPO_AGGREGATOR') setActiveTab('fpo');
        else if (currentRole === 'BULK_BUYER') setActiveTab('bulk-buyer');
        else if (currentRole === 'RETAIL_BUYER') setActiveTab('buyer');
        else if (currentRole === 'LOGISTICS') setActiveTab('logistics');
        else if (currentRole === 'ADMIN') setActiveTab('admin');
        else setActiveTab('farmer');
      } else {
        setActiveTab('home');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-[28px] border border-[#ccd5ae]/50 shadow-soft overflow-hidden p-7 sm:p-9 text-center space-y-6">
        {/* Subtle Agricultural Forest-Green Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#01472e] via-[#025a3b] to-[#a3b18a]" />

        {/* Support Icon with subtle agricultural sprout badge */}
        <div className="pt-2">
          <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-b from-[#eaf4ec] to-[#f4f7f2] border border-[#a3b18a]/30 flex items-center justify-center shadow-xs">
            <Headphones className="w-9 h-9 text-[#01472e]" />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#01472e] text-[#e9edc9] flex items-center justify-center border-2 border-white shadow-xs"
              title="Uzhavan Agricultural Assistance"
            >
              <Sprout className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#01472e]">
            {t('support.pageTitle', 'Support & Assistance')}
          </h1>
          <p className="text-sm font-semibold text-[#01472e]/90">
            {t('support.subtitle', 'Need help with Uzhavan Connect?')}
          </p>
          <p className="text-xs text-[#01472e]/70 leading-relaxed max-w-xs mx-auto font-normal">
            {t(
              'support.description',
              'Have questions, facing an issue, or need assistance with the platform? Our support team is here to help.'
            )}
          </p>
        </div>

        {/* Email / Contact Box with Copy Button & Confirmation Toast */}
        <div className="space-y-2">
          <div className="relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#faf9f5] border border-[#ccd5ae]/50 hover:border-[#a3b18a] transition shadow-xs group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#01472e] truncate">
                {supportEmail}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label={t('support.copyEmail', 'Copy email address')}
              title={t('support.copyEmail', 'Copy email address')}
              className="p-2 rounded-xl text-[#01472e]/70 hover:text-[#01472e] hover:bg-white transition cursor-pointer shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Copy Confirmation Toast */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              copied ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 shadow-xs">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{t('support.copiedToast', 'Email copied')}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleOpenEmail}
            className="w-full bg-[#01472e] hover:bg-[#025a3b] active:scale-[0.99] text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#e9edc9]" />
            <span>{t('support.openEmailClient', 'Open Email Client')}</span>
          </button>
        </div>

        {/* Secondary Action: Return to Previous Page */}
        <div>
          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#01472e]/70 hover:text-[#01472e] transition cursor-pointer py-1 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{t('support.returnPreviousPage', 'Return to Previous Page')}</span>
          </button>
        </div>

        {/* Subtle Agricultural Trust Badge */}
        <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-center gap-1.5 text-[11px] text-[#01472e]/60 font-normal">
          <ShieldCheck className="w-3.5 h-3.5 text-[#a3b18a]" />
          <span>{t('support.trustBadge', 'Uzhavan Connect Helpdesk • Direct Farmer & Buyer Support')}</span>
        </div>
      </div>
    </div>
  );
};
