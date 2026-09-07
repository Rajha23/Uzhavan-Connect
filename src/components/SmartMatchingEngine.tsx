import React, { useState } from 'react';
import { SMART_MATCH_SUPPLIERS } from '../data/mockData';
import { SmartMatchSupplier } from '../types';
import {
  Sliders,
  Award,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Building2,
  ArrowRight
} from 'lucide-react';

export const SmartMatchingEngine: React.FC = () => {
  // Configurable weights (sum or proportional)
  const [weights, setWeights] = useState({
    price: 25,
    distance: 25,
    quality: 20,
    reliability: 20,
    capacity: 10
  });

  const [allocatedId, setAllocatedId] = useState<string>('SUP-01');

  // Compute weighted match score dynamically
  const totalWeight = weights.price + weights.distance + weights.quality + weights.reliability + weights.capacity;

  const suppliersWithScores: SmartMatchSupplier[] = SMART_MATCH_SUPPLIERS.map((s) => {
    const rawScore = (
      s.priceScore * weights.price +
      s.distanceScore * weights.distance +
      s.qualityScore * weights.quality +
      s.reliabilityScore * weights.reliability +
      s.capacityScore * weights.capacity
    ) / (totalWeight || 1);

    return {
      ...s,
      totalMatchScore: Number(rawScore.toFixed(1))
    };
  }).sort((a, b) => b.totalMatchScore - a.totalMatchScore);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Engine Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Factor Mathematical Matcher</span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">
            Smart Matching & Allocation Engine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Do not rank solely by lowest price. Balance price against transport distance, quality score, historical fulfillment, and capacity.
          </p>
        </div>

        <button
          onClick={() =>
            setWeights({
              price: 25,
              distance: 25,
              quality: 20,
              reliability: 20,
              capacity: 10
            })
          }
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Balanced Weights</span>
        </button>
      </div>

      {/* Configurable Weight Sliders Strip */}
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Configurable Factor Weightings (Live Dynamic Recalculation)</span>
          </span>
          <span className="text-xs font-mono text-slate-500">Sum: {totalWeight}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Price:</span>
              <span className="font-mono text-emerald-700">{weights.price}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.price}
              onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Distance:</span>
              <span className="font-mono text-blue-700">{weights.distance}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.distance}
              onChange={(e) => setWeights({ ...weights, distance: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Quality:</span>
              <span className="font-mono text-purple-700">{weights.quality}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.quality}
              onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Reliability:</span>
              <span className="font-mono text-amber-700">{weights.reliability}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.reliability}
              onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Capacity:</span>
              <span className="font-mono text-teal-700">{weights.capacity}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.capacity}
              onChange={(e) => setWeights({ ...weights, capacity: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Prompt Requirement: BEST MATCH Showcase Card */}
      <div className="p-6 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl m-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-400 text-emerald-950 font-black px-3 py-1 rounded-full uppercase tracking-wider">
              BEST MATCH
            </span>
            <span className="text-xs text-emerald-300 font-semibold">AI Multi-Factor Composite</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-emerald-300">Match Score:</span>
            <span className="text-3xl font-black font-mono text-emerald-300">91%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-[11px] text-emerald-200 block">SUPPLIER</span>
            <p className="font-bold text-base text-white mt-0.5">GreenHarvest FPO</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-[11px] text-emerald-200 block">CROP & QUANTITY</span>
            <p className="font-bold text-base text-white mt-0.5">Tomato • 1,200 kg</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-[11px] text-emerald-200 block">OFFER PRICE</span>
            <p className="font-bold text-base text-white mt-0.5">₹25 / kg</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-[11px] text-emerald-200 block">DISTANCE</span>
            <p className="font-bold text-base text-white mt-0.5">18 km away</p>
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1.5">
              Why this match?
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-100">
              <span className="flex items-center gap-1">✓ Same crop</span>
              <span className="flex items-center gap-1">✓ Required quantity available</span>
              <span className="flex items-center gap-1">✓ Good price</span>
              <span className="flex items-center gap-1">✓ Nearby (18 km)</span>
              <span className="flex items-center gap-1">✓ Suitable date (Harvest: 12 Sep)</span>
            </div>
          </div>

          <button
            onClick={() => setAllocatedId('SUP-01')}
            className="self-start md:self-auto bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold px-5 py-2.5 rounded-xl shadow transition whitespace-nowrap"
          >
            View Match →
          </button>
        </div>
      </div>

      {/* Supplier Comparison List */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Ranked Supplier Candidates ({suppliersWithScores.length})</h4>
          <span className="text-xs text-slate-500">Live sorting by dynamic weight score</span>
        </div>

        {suppliersWithScores.map((sup, index) => {
          const isTopRanked = index === 0;
          const isAllocated = sup.id === allocatedId;

          return (
            <div
              key={sup.id}
              className={`rounded-xl border p-5 transition ${
                isTopRanked
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                    isTopRanked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{sup.supplierName}</h4>
                      {isTopRanked && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                          OPTIMAL MATCH
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sup.crop} • Available: <strong className="text-slate-800">{sup.availableQtyKg.toLocaleString()} kg</strong> • {sup.hubProximity}
                    </p>
                  </div>
                </div>

                {/* Match Score & Action */}
                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Smart Match Score</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      {sup.totalMatchScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setAllocatedId(sup.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                      isAllocated
                        ? 'bg-emerald-700 text-white flex items-center gap-1.5'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isAllocated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Allocated</span>
                      </>
                    ) : (
                      <span>Select Supplier</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-Score Bars Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Price (₹{sup.offeredPricePerKg}/kg):</span>
                    <strong className="text-slate-800 font-mono">{sup.priceScore}</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${sup.priceScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Distance ({sup.distanceKm} km):</span>
                    <strong className="text-slate-800 font-mono">{sup.distanceScore}</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${sup.distanceScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Quality ({sup.qualityGrade}):</span>
                    <strong className="text-slate-800 font-mono">{sup.qualityScore}</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${sup.qualityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Reliability:</span>
                    <strong className="text-slate-800 font-mono">{sup.reliabilityScore}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${sup.reliabilityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Capacity:</span>
                    <strong className="text-slate-800 font-mono">{sup.capacityScore}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${sup.capacityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
