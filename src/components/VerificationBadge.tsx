import React, { useState } from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';
import { QualityVerificationStatus, getVerificationDisplayInfo } from '../types/quality';
import { useLanguage } from '../context/LanguageContext';

interface VerificationBadgeProps {
  status?: QualityVerificationStatus | 'MIXED' | string;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status = 'SELF_DECLARED',
  size = 'sm',
  showTooltip = true,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const info = getVerificationDisplayInfo(status);

  const label = (() => {
    switch (info.status) {
      case 'COLLECTION_VERIFIED':
        return t('quality.collectionVerified', 'Collection-verified');
      case 'BUYER_CONFIRMED':
        return t('quality.buyerConfirmed', 'Buyer-confirmed');
      case 'MIXED':
        return t('quality.mixedStatus', 'Mixed verification status');
      case 'REVIEW_REQUIRED':
        return t('quality.underReview', 'Under Review');
      case 'SELF_DECLARED':
      default:
        return t('quality.farmerDeclared', 'Farmer-declared');
    }
  })();

  const meaning = (() => {
    switch (info.status) {
      case 'COLLECTION_VERIFIED':
        return t('quality.collectionVerifiedDesc', 'Information checked during the collection process, with the verification scope documented.');
      case 'BUYER_CONFIRMED':
        return t('quality.buyerConfirmedDesc', 'The buyer has confirmed the specified details or receipt upon physical handover.');
      case 'MIXED':
        return t('quality.mixedStatusDesc', 'Aggregated supply lot composed of multiple farmer contributions with varying verification levels.');
      case 'REVIEW_REQUIRED':
        return t('quality.underReviewDesc', 'Verification in progress by field agent or aggregation hub inspector.');
      case 'SELF_DECLARED':
      default:
        return t('quality.farmerDeclaredDesc', 'Information provided by the farmer but not independently verified.');
    }
  })();

  const getIcon = () => {
    switch (info.iconType) {
      case 'verified':
        return <ShieldCheck className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
      case 'buyer':
        return <CheckCircle2 className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
      case 'mixed':
        return <Layers className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
      case 'pending':
        return <AlertTriangle className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
      case 'self':
      default:
        return <UserCheck className={size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />;
    }
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1.5 gap-2'
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`inline-flex items-center font-medium rounded-full border shadow-2xs transition-colors cursor-pointer select-none ${info.badgeBg} ${info.badgeBorder} ${info.badgeText} ${sizeStyles}`}
        onClick={(e) => {
          e.stopPropagation();
          if (showTooltip) setIsOpen(!isOpen);
        }}
        onMouseEnter={() => { if (showTooltip) setIsOpen(true); }}
        onMouseLeave={() => { if (showTooltip) setIsOpen(false); }}
        title={meaning}
      >
        {getIcon()}
        <span className="font-semibold tracking-tight">{label}</span>
        {showTooltip && (
          <Info className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity ml-0.5" />
        )}
      </div>

      {showTooltip && isOpen && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 animate-fadeIn pointer-events-none"
          style={{ minWidth: '220px' }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            {getIcon()}
            <span>{label}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal">
            {meaning}
          </p>
          <div className="pt-1 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Audit: Uzhavan Trust Standard</span>
            <span className="font-mono uppercase">{info.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};
