import React from 'react';
import { useApp } from '../context/AppContext';
import { Sprout, ShieldCheck, Cpu, ArrowUpRight, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setArchitectureModalOpen } = useApp();

  return (
    <footer className="bg-forest text-cream/80 border-t border-[#023120] mt-20">
      {/* Top Banner: The Uzhavan Connect Demand Loop */}
      <div className="border-b border-[#023120] bg-[#023120] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[1rem] bg-sage text-forest">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-sage font-medium uppercase tracking-widest">The Demand-First Philosophy</p>
              <p className="text-sm text-cream font-medium tracking-wide">"Don't wait for the market. Let the market tell the farmer what to grow."</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-sage/70 bg-forest px-3 py-1.5 rounded-[1rem] border border-olive/20">
            <span className="text-cream font-semibold">DEMAND</span> →
            <span className="text-sage font-medium">FORECAST</span> →
            <span className="text-olive font-medium">POOL</span> →
            <span className="text-moss font-medium">MATCH</span> →
            <span className="text-cream font-medium">AGGREGATE</span> →
            <span className="text-sage font-medium">QUALITY</span> →
            <span className="text-olive font-medium">ROUTE</span> →
            <span className="text-moss font-medium">DELIVER</span> →
            <span className="text-cream font-medium">SETTLE</span> →
            <span className="text-sage font-medium">LEARN</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About &  Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[1rem] bg-sage flex items-center justify-center text-forest font-medium shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">Uzhavan Connect</span>
            </div>
            <p className="text-xs text-cream/70 leading-relaxed">
               prototype addressing Problem Statement <strong className="text-sage font-medium"></strong>: 
              "Multiple intermediaries reduce farmers earnings and increase consumer prices."
            </p>
            <div className="pt-1">
              <span className="text-[11px] bg-[#023120] text-sage px-2.5 py-1 rounded border border-[#023120] font-mono inline-block">
                Ministry of Consumer Affairs, Food & Public Distribution
              </span>
            </div>
          </div>

          {/* Col 2: Modules & Dashboards */}
          <div>
            <h4 className="text-xs font-medium text-sage uppercase tracking-widest mb-3">Role Dashboards</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-sage transition cursor-pointer">
                  Farmer Demand Signals & Listings
                </button>
              </li>

              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-sage transition cursor-pointer">
                  Bulk Buyer Demand & Procurement
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-sage transition cursor-pointer">
                  FPO Aggregation & Auction Bidding
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('route-optimization')} className="hover:text-sage transition cursor-pointer">
                  Logistics & Dynamic Micro-Hubs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('settlement')} className="hover:text-sage transition cursor-pointer">
                  Transparent Escrow Settlement
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Innovation & Features */}
          <div>
            <h4 className="text-xs font-medium text-sage uppercase tracking-widest mb-3">Core Innovations</h4>
            <ul className="space-y-2 text-xs text-cream/70">
              <li>
                <button onClick={() => setActiveTab('middleman-sim')} className="hover:text-sage transition cursor-pointer">
                  Middleman Cost Simulator ("Where Does ₹100 Go?")
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('demand-pool')} className="hover:text-sage transition cursor-pointer">
                  Demand Pooling Engine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reverse-auction')} className="hover:text-sage transition cursor-pointer">
                  Smart Match Reverse Auctions
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('demand-intel')} className="hover:text-sage transition cursor-pointer">
                  7-Day Predictive ML Forecasts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('impact-kpis')} className="hover:text-sage transition cursor-pointer">
                  10  Evaluation KPIs & Impact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4:  Evaluator Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-sage uppercase tracking-widest mb-2">Evaluator Tools</h4>
            <button
              onClick={() => setArchitectureModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[1rem] bg-[#023120] hover:bg-forest text-cream text-xs font-medium border border-[#023120] transition cursor-pointer"
            >
              <span>Inspect Architecture & APIs</span>
              <Cpu className="w-4 h-4 text-sage" />
            </button>
            <div className="p-3 rounded-[1rem] bg-[#023120] border border-olive/10 text-[11px] text-cream/70 leading-relaxed">
              <span className="text-sage font-medium">Real Working Prototype:</span> Fully functional mock APIs, interactive VRP routes, Recharts analytics, scannable QR passports, and configurable smart matching algorithms.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#023120] text-xs text-cream/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Uzhavan Connect. Built for . All rights reserved.</p>
          <div className="flex items-center gap-4 text-cream/40">
            <span>Theme: Agriculture, FoodTech & Rural Development</span>
            <span>•</span>
            <span className="text-sage font-mono"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
