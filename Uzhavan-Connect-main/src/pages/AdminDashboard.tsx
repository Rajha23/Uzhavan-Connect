import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  BarChart3
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Ministry of Consumer Affairs, Food & Public Distribution</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Platform Command & Administration
          </h1>
          <p className="text-sm text-cream/70 mt-3 max-w-2xl leading-relaxed font-medium">
            National monitoring console for Uzhavan Connect. Real-time telemetry across farmer realization, cold storage utilization, and ML forecast convergence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('impact-kpis')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics & KPIs</span>
          </button>
        </div>
      </div>


    </div>
  );
};
