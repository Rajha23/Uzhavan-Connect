import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_DEMAND_POOL } from '../data/mockData';
import { DemandRequest, ProduceListing } from '../types';
import {
  Layers,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  Scale
} from 'lucide-react';

export const DemandPoolPage: React.FC = () => {
  const { setActiveTab, demandRequests, produceListings, aggregatedDemandGroups } = useApp();

  // Selected aggregated group ID (defaults to first group or fallback)
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return aggregatedDemandGroups[0]?.id || '';
  });

  // Active pool group
  const activeGroup = useMemo(() => {
    if (selectedGroupId) {
      const found = aggregatedDemandGroups.find((g) => g.id === selectedGroupId);
      if (found) return found;
    }
    return aggregatedDemandGroups[0];
  }, [aggregatedDemandGroups, selectedGroupId]);

  // Contributing demands for the active group
  const activeDemands: DemandRequest[] = activeGroup ? activeGroup.contributingDemands : demandRequests;
  const totalPooledQty = activeGroup
    ? activeGroup.totalQuantityKg
    : activeDemands.reduce((sum: number, d: DemandRequest) => sum + d.quantityKg, 0);
  const buyersCount = activeGroup
    ? activeGroup.buyersCount
    : new Set(activeDemands.map((d: DemandRequest) => d.buyerName)).size;
  const avgMaxPrice = activeGroup ? activeGroup.avgMaxPricePerKg.toFixed(2) : '32.00';
  const activeCrop = activeGroup ? activeGroup.crop : (activeDemands[0]?.crop || 'Tomato');
  const activeCorridor = activeGroup ? activeGroup.region : 'Chennai Corridor';
  const activeTargetDate = activeGroup ? activeGroup.targetDate : '2026-09-08';

  // Available nearby supply for the active crop
  const matchingSupplies: ProduceListing[] = useMemo(() => {
    return produceListings.filter(
      (p) => p.crop.toLowerCase() === activeCrop.toLowerCase() && p.quantityKg > 0
    );
  }, [produceListings, activeCrop]);

  const totalAvailableSupply = matchingSupplies.reduce((sum: number, s: ProduceListing) => sum + s.quantityKg, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a2e1f] to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Demand Aggregation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Consolidated Demand Pool
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
            Multi-buyer demand pooling without altering individual procurement records. Small buyer commitments group into institutional-scale volume opportunities, unlocking bulk transport rates and fair farmer realization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Smart Match This Pool</span>
          </button>
          <button
            onClick={() => setActiveTab('reverse-auction')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition uppercase tracking-wider"
          >
            <span>Reverse Auction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregated Pools Selector Strip */}
      {aggregatedDemandGroups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Active Multi-Commodity Aggregated Pools ({aggregatedDemandGroups.length})</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Click a pool to inspect aggregation mechanics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aggregatedDemandGroups.map((grp) => {
              const isSelected = activeGroup?.id === grp.id;
              return (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroupId(grp.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-emerald-50/40 border-slate-200/80 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base tracking-tight">{grp.crop}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {grp.buyersCount} {grp.buyersCount === 1 ? 'Buyer' : 'Buyers'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {grp.region} • {grp.qualityRequirement}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-extrabold tracking-tight ${isSelected ? 'text-emerald-400' : 'text-slate-900'}`}>
                      {grp.totalQuantityKg.toLocaleString()} kg
                    </span>
                    <span className={`text-[10px] block font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      max ₹{grp.avgMaxPricePerKg}/kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pool Identity Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">COMMODITY</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{activeCrop}</p>
          <span className="text-[11px] text-slate-500 font-normal">{activeGroup?.variety || 'Commercial Grade'}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">REGIONAL CORRIDOR</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{activeCorridor.split(' ')[0]}</p>
          <span className="text-[11px] text-slate-500 font-normal">Logistics Corridor</span>
        </div>

        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">POOLED QUANTITY</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
            {totalPooledQty.toLocaleString()} kg
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Ready for Matching</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">TARGET DELIVERY</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{activeTargetDate}</p>
          <span className="text-[11px] text-slate-500 font-normal">Morning Window</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">BENCHMARK PRICE</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ₹{avgMaxPrice}
          </p>
          <span className="text-[11px] text-slate-500 font-normal">Max Ceiling / kg</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">CONSOLIDATED BUYERS</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {buyersCount} <span className="text-sm font-semibold">{buyersCount === 1 ? 'Entity' : 'Entities'}</span>
          </p>
          <span className="text-[11px] text-slate-500 font-normal">Single Dispatch Run</span>
        </div>
      </div>

      {/* 3-Stage Visual Aggregation: Fragmented Demands -> Compatibility Check -> Consolidated Opportunity */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            3-Stage Aggregation Pipeline
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Individual Demands → Multi-Factor Compatibility → Institutional Pool
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 font-normal">
            Preserving full traceability of each contributing buyer demand while delivering bulk freight efficiency and volume pricing power to farmers.
          </p>
        </div>

        {/* 3-Stage Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Stage 1: Individual Contributing Demands (Col 4) */}
          <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stage 1</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activeDemands.length} Individual Demands
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Contributing Buyer Demands</h4>
              <p className="text-[11px] text-slate-500 mb-3 font-normal">
                Each buyer's specific contract requirements are preserved intact.
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeDemands.map((dem: DemandRequest) => (
                  <div
                    key={dem.id}
                    className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{dem.buyerName}</span>
                      <span className="font-extrabold text-xs text-slate-900">{dem.quantityKg.toLocaleString()} kg</span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p><strong className="text-slate-800">Variety:</strong> {dem.variety || 'Hybrid'}</p>
                      <p><strong className="text-slate-800">Grade:</strong> {dem.qualityRequirement} • Max ₹{dem.maxTargetPricePerKg}/kg</p>
                      <p className="text-[10px] text-slate-400 truncate"><MapPin className="w-3 h-3 inline mr-1 text-slate-400" />{dem.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 font-medium">
              Total Sum: <span className="font-bold text-slate-900 text-xs">{totalPooledQty.toLocaleString()} kg</span> across {buyersCount} buyers
            </div>
          </div>

          {/* Stage 2: Multi-Factor Compatibility Rules Check (Col 4) */}
          <div className="lg:col-span-4 bg-sage/10 rounded-[2rem] p-6 border border-sage/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">Stage 2</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Compatibility Verified
                </span>
              </div>
              <h4 className="font-bold text-forest text-base mb-1">Aggregation Rule Engine</h4>
              <p className="text-[11px] text-forest/60 mb-4 font-medium">
                Demands are grouped only when 4 core agricultural compatibility invariants hold:
              </p>

              <div className="space-y-3">
                {(activeGroup?.compatibilityReasons || [
                  `Identical Commodity: ${activeCrop} (Compatible Variety Standard)`,
                  `Quality Standard Alignment: Grade A (Institutional Specifications)`,
                  `Logistics Corridor Consolidation: ${activeCorridor}`,
                  `Synchronized Delivery Window: ${activeTargetDate} Morning Run`
                ]).map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs bg-cream p-3 rounded-xl border border-olive/30 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-forest font-medium">{reason}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-olive/10 rounded-xl border border-olive/30 text-[11px] text-forest/80 leading-relaxed font-medium">
                🛡️ <strong className="text-forest">Integrity Invariant:</strong> Individual buyer demands are never modified, merged, or lost. Aggregation acts as a coordinated procurement umbrella.
              </div>
            </div>

            <div className="pt-3 border-t border-sage/30 text-[11px] text-emerald-900 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4 / 4 Compatibility Invariants Passed</span>
            </div>
          </div>

          {/* Stage 3: Consolidated Procurement Box (Col 4) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-950 via-[#0a2e1f] to-emerald-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6 border border-emerald-900/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-300 border border-emerald-400/30">
                  {activeGroup?.id || `POOL-${activeCrop.slice(0,3).toUpperCase()}-2026`}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Single Dispatch</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block">Combined Procurement Volume</span>
                <p className="text-4xl sm:text-5xl font-extrabold mt-2 tracking-tight text-emerald-400">{totalPooledQty.toLocaleString()} kg</p>
                <p className="text-xs text-slate-300 mt-1 font-normal">
                  {activeCrop} ({activeGroup?.qualityRequirement || 'Grade A'}) for {activeCorridor}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-[11px] uppercase tracking-wider">Benchmarked Target:</span>
                  <span className="font-extrabold text-lg text-emerald-300">₹{avgMaxPrice} / kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-[11px] uppercase tracking-wider">Logistics Run:</span>
                  <span className="text-white font-bold">1 x 3.0T Reefer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-[11px] uppercase tracking-wider">Transport Emissions:</span>
                  <span className="text-emerald-400 font-bold">-34% Consolidated</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setActiveTab('smart-matching')}
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition shadow-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Smart Match This Group →</span>
              </button>
              <button
                onClick={() => setActiveTab('reverse-auction')}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition border border-white/15 uppercase tracking-wider"
              >
                Open FPO Reverse Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Nearby Farmer Supply Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Corridor Supply Availability
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Matching Farmer Supply in Corridor
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 font-normal">
              Verified farmer listings ready for allocation to this aggregated pool.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-950 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition uppercase tracking-wider"
          >
            <span>Proceed to Smart Matching</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Aggregated Demand Card */}
          <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aggregated Demand</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {activeCorridor}
              </span>
            </div>
            <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {totalPooledQty.toLocaleString()} kg
            </p>
            <p className="text-xs text-slate-600 font-normal">
              Commodity: <strong className="text-slate-800">{activeCrop}</strong> ({activeGroup?.qualityRequirement || 'Grade A'}) • Max Target: <strong className="text-slate-800">₹{avgMaxPrice}/kg</strong> • {buyersCount} buyers consolidated
            </p>
          </div>

          {/* Available Nearby Farmer Supply Card */}
          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Available Nearby Farmer Supply</span>
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {matchingSupplies.length} Suppliers Active
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {matchingSupplies.length === 0 ? (
                <div className="p-4 bg-white rounded-xl text-center text-xs text-slate-500 font-medium">
                  No direct farmer listings currently available for {activeCrop}. Reverse auction can solicit regional bids.
                </div>
              ) : (
                matchingSupplies.slice(0, 4).map((item: ProduceListing) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                        {item.farmerName} ({item.location})
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.grade} • ₹{item.expectedPricePerKg}/kg • {item.variety || 'Certified'}
                      </span>
                    </div>
                    <span className="font-extrabold text-base text-emerald-700 tracking-tight">
                      +{item.quantityKg.toLocaleString()} kg
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between mt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">Total Matching Supply:</span>
              <span className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                {totalAvailableSupply.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
