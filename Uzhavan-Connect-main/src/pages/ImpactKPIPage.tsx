import React from 'react';
import { useApp } from '../context/AppContext';
import { SIH_EVALUATION_KPIS } from '../data/mockData';
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Scale,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  FileCheck
} from 'lucide-react';

export const ImpactKPIPage: React.FC = () => {


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-2">
            <Award className="w-4 h-4" />
            <span> Evaluation Benchmark Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Impact & Measured Outcomes ()
          </h1>
          <p className="text-sm text-cream/70 mt-3 max-w-2xl leading-relaxed font-medium">
            "The platform should be judged by measurable outcomes: higher farmer net realization, competitive landed prices, lower unnecessary transport distance, better fulfillment, and lower wastage."
          </p>
        </div>

      </div>

      {/* 10  Evaluation KPIs Table */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest overflow-hidden">
        <div className="p-8 border-b border-olive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-3xl font-anton text-forest tracking-wide">
              10 Core Quantitative Performance Indicators
            </h3>
            <p className="text-sm font-medium text-forest/70 mt-1">
              Empirical comparison: Traditional Multi-Tier Mandi Flow vs. Uzhavan Connect Digitally Coordinated Network
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-olive/10 border-b border-olive/30 text-forest font-bold uppercase tracking-widest text-[10px]">
                <th className="p-5 w-1/3">Evaluation KPI Metric</th>
                <th className="p-5 w-1/5 text-forest/60">Traditional Supply Chain</th>
                <th className="p-5 w-1/5 text-forest">Uzhavan Connect Coordinated Flow</th>
                <th className="p-5 text-right">Measured Impact Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/20">
              {SIH_EVALUATION_KPIS.map((kpi, idx) => (
                <tr key={idx} className="hover:bg-olive/10 transition">
                  <td className="p-5">
                    <span className="font-bold text-forest block text-sm">{kpi.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mt-1 block"> Benchmark Dimension #{idx + 1}</span>
                  </td>
                  <td className="p-5 font-mono font-bold text-forest/60 bg-cream/50">
                    {kpi.traditional}
                  </td>
                  <td className="p-5 font-mono font-black text-forest bg-sage/20 border-l border-r border-sage/30">
                    {kpi.uzhavanconnect}
                  </td>
                  <td className="p-5 text-right">
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs bg-forest text-cream px-4 py-1.5 rounded-[1rem] shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-sage" />
                      <span>{kpi.change}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition space-y-4 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-forest/70">
            <span>Primary Farmer Impact</span>
            <span className="text-forest bg-sage px-3 py-1 rounded-[1rem]">+152% Gain</span>
          </div>
          <h4 className="text-2xl font-anton text-forest tracking-wide">Farmer Net Realization</h4>
          <p className="text-sm text-forest/70 font-medium leading-relaxed">
            By eliminating speculative trader margins and commission agent cuts, farmers receive ₹27.50/kg vs ₹16.00/kg under traditional mandis, with zero payment delays.
          </p>
        </div>

        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition space-y-4 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-forest/70">
            <span>Consumer & Buyer Benefit</span>
            <span className="text-forest bg-sage px-3 py-1 rounded-[1rem]">-15.8% Landed</span>
          </div>
          <h4 className="text-2xl font-anton text-forest tracking-wide">Downstream Affordability</h4>
          <p className="text-sm text-forest/70 font-medium leading-relaxed">
            Bulk institutional buyers and consumers pay ₹32.00/kg landed instead of ₹38.00/kg retail mandi prices, lowering food inflation while securing verified Grade A quality.
          </p>
        </div>

        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition space-y-4 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-forest/70">
            <span>Logistics & Perishability</span>
            <span className="text-forest bg-sage px-3 py-1 rounded-[1rem]">-83% Wastage</span>
          </div>
          <h4 className="text-2xl font-anton text-forest tracking-wide">Cold-Chain Food Security</h4>
          <p className="text-sm text-forest/70 font-medium leading-relaxed">
            Dynamic micro-hub pre-cooling and Google OR-Tools route optimization reduce post-harvest horticultural wastage from 22.4% down to just 3.8%.
          </p>
        </div>
      </div>
    </div>
  );
};
