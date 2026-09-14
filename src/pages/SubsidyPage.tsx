import React from 'react';
import { useApp } from '../context/AppContext';
import { SubsidiesAndBenefits } from '../components/SubsidiesAndBenefits';
import { HandCoins } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SubsidyPage: React.FC = () => {
  const { currentUser } = useApp();
  const { t } = useLanguage();

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#01472e] tracking-tight">
            {t('subsidies.pageTitle', 'Subsidy & Benefits Framework')}
          </h2>
          <p className="text-sm text-[#5c7065] mt-1.5 flex items-center gap-1.5">
            <HandCoins className="w-4 h-4 text-[#a3b18a]" />
            {t('subsidies.pageSubtitle', 'Detailed reference guide to financial support and platform benefits.')}
          </p>
        </div>
      </div>

      <SubsidiesAndBenefits role={currentUser.role} />
    </div>
  );
};
