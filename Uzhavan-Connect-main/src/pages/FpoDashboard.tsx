import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Users, Package, Sprout } from 'lucide-react';

export const FpoDashboard: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Users className="w-4 h-4" />
            <span>FPO Aggregator Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            FPO Dashboard
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            Welcome back, {currentUser.name}. Manage your collective produce.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center py-24">
        <Sprout className="w-16 h-16 text-emerald-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 font-['Outfit'] mb-2">FPO Operations coming soon</h3>
        <p className="text-sm text-slate-500 max-w-md">
          This dashboard will allow you to track aggregated crop listings, manage member farmers, and fulfill bulk demand requests.
        </p>
      </div>
    </div>
  );
};
