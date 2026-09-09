import React, { useState } from 'react';
import { MIDDLEMAN_SIMULATOR_DATA } from '../data/mockData';
import {
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const MiddlemanSimulator: React.FC = () => {
  const [consumerSpend, setConsumerSpend] = useState<number>(100);

  const traditionalRatio = consumerSpend / 100;
  const uzhavanconnectRatio = consumerSpend / 100;

  const traditionalFarmerGets = (MIDDLEMAN_SIMULATOR_DATA.traditional.farmerReceives * traditionalRatio).toFixed(1);
  const uzhavanconnectFarmerGets = (MIDDLEMAN_SIMULATOR_DATA.uzhavanconnect.farmerReceives * uzhavanconnectRatio).toFixed(1);
  const difference = (Number(uzhavanconnectFarmerGets) - Number(traditionalFarmerGets)).toFixed(1);
  const percentageGain = (((Number(uzhavanconnectFarmerGets) - Number(traditionalFarmerGets)) / Number(traditionalFarmerGets)) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 sm:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30 mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Economic Impact Model • </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold  tracking-tight">
            Where Does Your ₹100 Go?
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Comparing a fragmented 6-tier intermediary chain against Uzhavan Connect’s digitally coordinated demand-first network.
          </p>
        </div>

        {/* Interactive Spend Input Controller */}
        <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/15 max-w-lg">
          <div className="flex items-center justify-between gap-4 mb-2">
            <label htmlFor="spend-input" className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Consumer / Buyer Expenditure
            </label>
            <span className="text-lg font-bold font-mono text-white">
              ₹{consumerSpend}
            </span>
          </div>
          <input
            id="spend-input"
            type="range"
            min="50"
            max="1000"
            step="10"
            value={consumerSpend}
            onChange={(e) => setConsumerSpend(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>₹50</span>
            <span>₹250</span>
            <span>₹500</span>
            <span>₹750</span>
            <span>₹1,000</span>
          </div>
        </div>
      </div>

      {/* Realization Highlight Comparison Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs">
            <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider">
              Traditional Mandi Flow
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              ₹{traditionalFarmerGets}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Only 34% reaches the farmer
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-2xs">
            <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
              Uzhavan Connect Coordinated Flow
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
              ₹{uzhavanconnectFarmerGets}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              72% reaches the farmer
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-agri-800 p-4 rounded-xl text-white shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-200 font-medium">Farmer Net Benefit</span>
              <span className="bg-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded text-emerald-100">
                +{percentageGain}% Realization
              </span>
            </div>
            <p className="text-2xl font-bold font-mono mt-1">
              +₹{difference} Extra Cash
            </p>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              Straight to farmer bank accounts
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Detailed Breakdown */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traditional Flow Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Traditional Intermediary Flow
                </h3>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2.5 py-0.5 rounded-full">
                6 Layers • 22% Spoilage
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Multiple speculative commissions, unauthorized cuts, and uncoordinated multi-leg transport erode farmer earnings.
            </p>

            <div className="space-y-2.5">
              {MIDDLEMAN_SIMULATOR_DATA.traditional.flow.map((item, idx) => {
                const calculated = (item.amount * traditionalRatio).toFixed(1);
                const isFarmer = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition ${
                      isFarmer
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isFarmer ? 'text-rose-900 font-bold' : 'text-slate-800'}>
                        {idx + 1}. {item.role}
                      </span>
                      <span className="font-mono text-slate-900">
                        ₹{calculated} ({item.percentage}%)
                      </span>
                    </div>

                    {/* Visual bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFarmer ? 'bg-rose-500' : 'bg-slate-400'}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 italic">
                      {item.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Uzhavan Connect Coordinated Flow Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Uzhavan Connect Digitally Coordinated Flow
                </h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                Zero Speculative Layers • 3.8% Spoilage
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Retains essential aggregation and cold logistics, but replaces speculative middlemen with transparent digital coordination.
            </p>

            <div className="space-y-2.5">
              {MIDDLEMAN_SIMULATOR_DATA.uzhavanconnect.flow.map((item, idx) => {
                const calculated = (item.amount * uzhavanconnectRatio).toFixed(1);
                const isFarmer = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition ${
                      isFarmer
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isFarmer ? 'text-emerald-950 font-bold' : 'text-slate-800'}>
                        {idx + 1}. {item.role}
                      </span>
                      <span className="font-mono font-bold text-emerald-800">
                        ₹{calculated} ({item.percentage}%)
                      </span>
                    </div>

                    {/* Visual bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isFarmer ? 'bg-emerald-600' : 'bg-emerald-400'}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5">
                      {item.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mandatory  Concept Disclaimer Banner */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold text-amber-950">Crucial Agricultural Architecture Principle:</strong>{' '}
            We do <em>not</em> naively claim that every intermediary function disappears. Aggregation, grading, cold pre-cooling, and transportation are essential physical services. Uzhavan Connect digitally targets and replaces <strong>unnecessary coordination and speculative information layers</strong>, ensuring farmers retain genuine net realization while logistics and aggregation remain efficient and transparent.
          </div>
        </div>
      </div>
    </div>
  );
};
