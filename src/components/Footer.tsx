import React from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, ShieldCheck, Cpu, ArrowUpRight, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setArchitectureModalOpen } = useApp();

  return (
    <footer className="bg-gradient-to-b from-[#1b4332] via-[#16382b] to-[#10291f] text-emerald-100/90 border-t border-emerald-700/30 mt-20">
      {/* Top Banner: The Uzhavan Connect Demand Loop */}
      <div className="border-b border-emerald-800/40 bg-[#16382b]/70 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider">The Demand-First Philosophy</p>
              <p className="text-sm text-white font-medium tracking-wide">"Don't wait for the market. Let the market tell the farmer what to grow."</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-emerald-200/90 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <span className="text-white font-semibold">DEMAND</span> →
            <span className="text-emerald-300 font-medium">FORECAST</span> →
            <span className="text-emerald-200 font-medium">POOL</span> →
            <span className="text-teal-300 font-medium">MATCH</span> →
            <span className="text-white font-medium">AGGREGATE</span> →
            <span className="text-emerald-300 font-medium">QUALITY</span> →
            <span className="text-emerald-200 font-medium">ROUTE</span> →
            <span className="text-teal-300 font-medium">DELIVER</span> →
            <span className="text-white font-medium">SETTLE</span> →
            <span className="text-emerald-300 font-medium">LEARN</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About & Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-medium shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">Uzhavan Connect</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
              Demand-Driven Agricultural Marketplace & Operating System unifies smallholder farmers directly with institutional buyers using real-time demand forecasting.
            </p>
            <div className="pt-1">
              <span className="text-[11px] bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 font-medium inline-block">
                Ministry of Consumer Affairs, Food & Public Distribution
              </span>
            </div>
          </div>

          {/* Col 2: Modules & Dashboards */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">Role Dashboards</h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-normal">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition cursor-pointer">
                  Farmer Demand Signals & Listings
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition cursor-pointer">
                  Bulk Buyer Demand & Procurement
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition cursor-pointer">
                  FPO Aggregation & Hub Operations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('route-optimization')} className="hover:text-white transition cursor-pointer">
                  Logistics & Dynamic Micro-Hubs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('settlement')} className="hover:text-white transition cursor-pointer">
                  Transparent Escrow Settlement
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Innovation & Features */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">Core Innovations</h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-normal">
              <li>
                <button onClick={() => setActiveTab('middleman-sim')} className="hover:text-white transition cursor-pointer">
                  Middleman Cost Simulator ("Where Does ₹100 Go?")
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('demand-pool')} className="hover:text-white transition cursor-pointer">
                  Demand Pooling Engine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reverse-auction')} className="hover:text-white transition cursor-pointer">
                  Smart Match Reverse Auctions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('demand-intel')} className="hover:text-white transition cursor-pointer">
                  7-Day Predictive ML Forecasts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('impact-kpis')} className="hover:text-white transition cursor-pointer">
                  10 Quantitative Impact KPIs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Evaluator Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Platform Architecture</h4>
            <button
              onClick={() => setArchitectureModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/20 transition cursor-pointer shadow-xs"
            >
              <span>Inspect Architecture & APIs</span>
              <Cpu className="w-4 h-4 text-emerald-300" />
            </button>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-100/80 leading-relaxed font-normal">
              <span className="text-emerald-300 font-medium">End-to-End Operating Cycle:</span> Live APIs, VRP route optimizer, Recharts telemetry, scannable QR produce passports, and multi-factor smart matching.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-emerald-800/40 text-xs text-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-normal">
          <p>© 2026 Uzhavan Connect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Theme: Agriculture, FoodTech & Rural Development</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono text-[11px]">AI-Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
