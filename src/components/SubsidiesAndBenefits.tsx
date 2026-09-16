import React from 'react';
import { Landmark, CheckCircle2, ChevronRight, ShieldCheck, TrendingUp, HandCoins, Truck } from 'lucide-react';
import { SUBSIDIES_DATA } from '../data/subsidiesData';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  role: UserRole;
  className?: string;
}

export const SubsidiesAndBenefits: React.FC<Props> = ({ role, className = '' }) => {
  const { t } = useLanguage();
  const data = SUBSIDIES_DATA.filter(subsidy => subsidy.role.includes(role));

  if (!data || data.length === 0) return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden p-6 text-center ${className}`}>
      <p className="text-slate-500 text-sm">{t('subsidies.noneAvailable', 'No subsidies available for this role.')}</p>
    </div>
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INCOME SUPPORT':
      case 'CASH FLOW':
      case 'CAPITAL BASE':
      case 'CREDIT':
      case 'CREDIT ACCESS':
        return <HandCoins className="w-5 h-5 text-emerald-600" />;
      case 'RISK COVER':
      case 'FORMALISATION':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'CAPEX':
      case 'INFRASTRUCTURE':
      case 'COLD CHAIN':
      case 'VEHICLES & INFRASTRUCTURE':
      case 'STATE PROGRAMMES':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'VALUE ADD':
      case 'PROCESSING':
      case 'EXPORT':
      case 'MARKET ACCESS':
      case 'TRANSITION':
      case 'DIVERSIFICATION':
      case 'INSTITUTION BUILDING':
      case 'INPUTS':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Landmark className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-[#01472e] to-[#016a44] px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <HandCoins className="w-5 h-5 text-emerald-100" />
          <h2 className="font-bold text-lg">{t('subsidies.title', 'Subsidies & Benefits Framework')}</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full tracking-wide">
          {role.replace('_', ' ')}
        </span>
      </div>
      
      <div className="p-6">
        <p className="text-sm text-slate-600 mb-6">
          {t('subsidies.subtitle', 'Uzhavan Connect is an intelligent assistant that identifies the benefits each participant is likely eligible for and explains why.')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((subsidy) => (
            <div key={subsidy.id} className="group flex flex-col bg-slate-50 rounded-lg p-5 border border-slate-100 hover:border-[#ccd5ae] hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  {getCategoryIcon(subsidy.category)}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    {subsidy.category}
                  </span>
                  <h3 className="font-bold text-[#01472e] text-sm leading-tight mt-0.5">
                    {subsidy.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed mb-4 flex-grow">
                {subsidy.description}
              </p>
              
              <div className="bg-white p-3 rounded-lg border border-slate-100 mt-auto">
                <h4 className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t('subsidies.keyDetails', 'Key Details')}
                </h4>
                <ul className="space-y-1.5">
                  {subsidy.details.map((detail, idx) => (
                    <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200/60">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 block mb-0.5">
                {t('subsidies.eligibilityNoticeTitle', 'Eligibility varies by state and category')}
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                {t('subsidies.eligibilityNoticeText', 'The platform always shows "Potentially Eligible". Final eligibility for any scheme must always be verified through the concerned official authority.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
