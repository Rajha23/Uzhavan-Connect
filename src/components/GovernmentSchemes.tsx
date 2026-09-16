import React from 'react';
import { Landmark, CheckCircle2, ChevronRight } from 'lucide-react';
import { SCHEMES_DATA } from '../data/schemesData';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  role: UserRole;
  className?: string;
}

export const GovernmentSchemes: React.FC<Props> = ({ role, className = '' }) => {
  const { t } = useLanguage();
  const data = SCHEMES_DATA[role];

  if (!data) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Landmark className="w-5 h-5 text-emerald-100" />
          <h2 className="font-bold text-lg">{t('schemes.title', undefined, 'Government Schemes & Support')}</h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full tracking-wide">
          {data.role}
        </span>
      </div>
      
      <div className="p-6">
        <p className="text-sm text-slate-600 mb-6">
          {t('schemes.subtitle', undefined, 'Uzhavan Connect acts as a digital bridge that helps you discover and use relevant existing schemes for your role.')}
        </p>

        <div className="space-y-4">
          {data.schemes.map((scheme) => (
            <div key={scheme.id} className="group relative bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="pr-8">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>
                <div className="absolute right-4 top-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                {t('schemes.keyBenefits', undefined, 'Key Benefits')}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {data.keyBenefits}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
