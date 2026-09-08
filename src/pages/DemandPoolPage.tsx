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
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Layers className="w-4 h-4" />
            <span>Demand Aggregation Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Consolidated Demand Pool
          </h1>
          <p className="text-sm text-cream/70 mt-3 max-w-2xl leading-relaxed font-medium">
            Multi-buyer demand pooling without altering individual procurement records. Small buyer commitments group into institutional-scale volume opportunities, unlocking bulk transport rates and fair farmer realization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4 text-forest" />
            <span>Smart Match This Pool</span>
          </button>
          <button
            onClick={() => setActiveTab('reverse-auction')}
            className="flex items-center gap-2 bg-olive/20 hover:bg-olive/30 text-cream text-xs font-bold px-5 py-3.5 rounded-[1rem] border border-olive/30 transition uppercase tracking-widest"
          >
            <span>Reverse Auction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregated Pools Selector Strip */}
      {aggregatedDemandGroups.length > 0 && (
        <div className="bg-cream rounded-[2rem] p-6 border border-olive/30 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/70 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest" />
              <span>Active Multi-Commodity Aggregated Pools ({aggregatedDemandGroups.length})</span>
            </span>
            <span className="text-[11px] text-forest/60 font-medium">Click a pool to inspect aggregation mechanics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aggregatedDemandGroups.map((grp) => {
              const isSelected = activeGroup?.id === grp.id;
              return (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroupId(grp.id)}
                  className={`p-4 rounded-[1.5rem] border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-forest text-cream border-forest shadow-md'
                      : 'bg-olive/10 hover:bg-olive/20 border-olive/30 text-forest'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-anton text-lg tracking-wide">{grp.crop}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected ? 'bg-sage/30 text-sage' : 'bg-sage/40 text-forest'
                      }`}>
                        {grp.buyersCount} {grp.buyersCount === 1 ? 'Buyer' : 'Buyers'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-cream/70' : 'text-forest/70'}`}>
                      {grp.region} • {grp.qualityRequirement}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-anton tracking-wide ${isSelected ? 'text-sage' : 'text-forest'}`}>
                      {grp.totalQuantityKg.toLocaleString()} kg
                    </span>
                    <span className={`text-[10px] block font-mono ${isSelected ? 'text-cream/60' : 'text-forest/60'}`}>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">COMMODITY</span>
          <p className="text-2xl font-anton text-forest">{activeCrop}</p>
          <span className="text-[10px] text-forest/70 font-medium">{activeGroup?.variety || 'Commercial Grade'}</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">REGIONAL CORRIDOR</span>
          <p className="text-2xl font-anton text-forest">{activeCorridor.split(' ')[0]}</p>
          <span className="text-[10px] text-forest/70 font-medium">Logistics Corridor</span>
        </div>

        <div className="bg-olive/20 p-5 rounded-[1.5rem] border border-olive/40 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest font-bold uppercase tracking-widest block mb-1">POOLED QUANTITY</span>
          <p className="text-3xl font-anton text-forest">
            {totalPooledQty.toLocaleString()} kg
          </p>
          <span className="text-[10px] text-forest/70 font-bold uppercase tracking-widest">Ready for Matching</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">TARGET DELIVERY</span>
          <p className="text-2xl font-anton text-forest">{activeTargetDate}</p>
          <span className="text-[10px] text-forest/70 font-medium">Morning Window</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">BENCHMARK PRICE</span>
          <p className="text-2xl font-anton text-forest">
            ₹{avgMaxPrice}
          </p>
          <span className="text-[10px] text-forest/70 font-medium">Max Ceiling / kg</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">CONSOLIDATED BUYERS</span>
          <p className="text-2xl font-anton text-forest">
            {buyersCount} <span className="text-lg">{buyersCount === 1 ? 'Entity' : 'Entities'}</span>
          </p>
          <span className="text-[10px] text-forest/70 font-medium">Single Dispatch Run</span>
        </div>
      </div>

      {/* 3-Stage Visual Aggregation: Fragmented Demands -> Compatibility Check -> Consolidated Opportunity */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-forest space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-4 py-1.5 rounded-full border border-sage/50">
            3-Stage Aggregation Pipeline
          </span>
          <h3 className="text-3xl font-anton text-forest mt-4 tracking-wide">
            Individual Demands → Multi-Factor Compatibility → Institutional Pool
          </h3>
          <p className="text-sm text-forest/70 mt-2 font-medium">
            Preserving full traceability of each contributing buyer demand while delivering bulk freight efficiency and volume pricing power to farmers.
          </p>
        </div>

        {/* 3-Stage Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Stage 1: Individual Contributing Demands (Col 4) */}
          <div className="lg:col-span-4 bg-olive/10 rounded-[2rem] p-6 border border-olive/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">Stage 1</span>
                <span className="text-[10px] bg-sage/30 text-forest font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {activeDemands.length} Individual Demands
                </span>
              </div>
              <h4 className="font-bold text-forest text-base mb-1">Contributing Buyer Demands</h4>
              <p className="text-[11px] text-forest/60 mb-4 font-medium">
                Each buyer's specific contract requirements are preserved intact.
              </p>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activeDemands.map((dem: DemandRequest, idx: number) => (
                  <div
                    key={dem.id}
                    className="bg-cream border border-olive/30 rounded-[1.2rem] p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest text-xs">{dem.buyerName}</span>
                      <span className="font-anton text-sm text-forest">{dem.quantityKg.toLocaleString()} kg</span>
                    </div>
                    <div className="text-[11px] text-forest/70 space-y-0.5">
                      <p><strong className="text-forest">Variety:</strong> {dem.variety || 'Hybrid'}</p>
                      <p><strong className="text-forest">Grade:</strong> {dem.qualityRequirement} • Max ₹{dem.maxTargetPricePerKg}/kg</p>
                      <p className="text-[10px] text-forest/50 truncate"><MapPin className="w-3 h-3 inline mr-1 text-forest/40" />{dem.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-olive/20 text-[11px] text-forest/70 font-semibold">
              Total Sum: <span className="font-anton text-forest text-sm">{totalPooledQty.toLocaleString()} kg</span> across {buyersCount} buyers
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
          <div className="lg:col-span-4 bg-forest text-cream rounded-[2rem] p-6 shadow-forest flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-sage/20 px-3 py-1 rounded-full text-sage border border-sage/40">
                  {activeGroup?.id || `POOL-${activeCrop.slice(0,3).toUpperCase()}-2026`}
                </span>
                <span className="text-[10px] text-sage font-bold uppercase tracking-widest">Single Dispatch</span>
              </div>

              <div>
                <span className="text-[10px] text-cream/70 font-bold uppercase tracking-widest block">Combined Procurement Volume</span>
                <p className="text-5xl font-anton mt-2 tracking-wide text-sage">{totalPooledQty.toLocaleString()} kg</p>
                <p className="text-xs text-cream/80 mt-1 font-medium">
                  {activeCrop} ({activeGroup?.qualityRequirement || 'Grade A'}) for {activeCorridor}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-olive/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cream/70 font-bold text-[10px] uppercase tracking-wider">Benchmarked Target:</span>
                  <span className="font-anton text-xl text-sage">₹{avgMaxPrice} / kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/70 font-bold text-[10px] uppercase tracking-wider">Logistics Run:</span>
                  <span className="text-cream font-bold">1 x 3.0T Reefer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/70 font-bold text-[10px] uppercase tracking-wider">Transport Emissions:</span>
                  <span className="text-sage font-bold">-34% Consolidated</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setActiveTab('smart-matching')}
                className="w-full py-3.5 bg-sage text-forest font-bold rounded-[1rem] text-xs hover:bg-cream transition shadow-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-forest" />
                <span>Smart Match This Group →</span>
              </button>
              <button
                onClick={() => setActiveTab('reverse-auction')}
                className="w-full py-3 bg-olive/20 hover:bg-olive/30 text-cream font-bold rounded-[1rem] text-xs transition border border-olive/30 uppercase tracking-widest"
              >
                Open FPO Reverse Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Nearby Farmer Supply Section */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-forest space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/20 px-4 py-1.5 rounded-full border border-sage/40">
              Corridor Supply Availability
            </span>
            <h3 className="text-3xl font-anton text-forest mt-4 tracking-wide">
              Matching Farmer Supply in Corridor
            </h3>
            <p className="text-sm text-forest/70 mt-2 font-medium">
              Verified farmer listings ready for allocation to this aggregated pool.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-forest hover:bg-[#023120] text-cream text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>Proceed to Smart Matching</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Aggregated Demand Card */}
          <div className="p-8 rounded-[1.5rem] bg-olive/10 border border-olive/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">Aggregated Demand</span>
              <span className="text-[10px] bg-sage/30 text-forest font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-sage/50">
                {activeCorridor}
              </span>
            </div>
            <p className="text-5xl font-anton text-forest tracking-wide">
              {totalPooledQty.toLocaleString()} kg
            </p>
            <p className="text-sm text-forest/70 font-medium">
              Commodity: <strong>{activeCrop}</strong> ({activeGroup?.qualityRequirement || 'Grade A'}) • Max Target: <strong>₹{avgMaxPrice}/kg</strong> • {buyersCount} buyers consolidated
            </p>
          </div>

          {/* Available Nearby Farmer Supply Card */}
          <div className="p-8 rounded-[1.5rem] bg-sage/10 border border-sage/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest">Available Nearby Farmer Supply</span>
              <span className="text-[10px] bg-forest text-cream font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {matchingSupplies.length} Suppliers Active
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {matchingSupplies.length === 0 ? (
                <div className="p-4 bg-cream rounded-xl text-center text-xs text-forest/60 font-medium">
                  No direct farmer listings currently available for {activeCrop}. Reverse auction can solicit regional bids.
                </div>
              ) : (
                matchingSupplies.slice(0, 4).map((item: ProduceListing) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-cream p-4 rounded-[1rem] border border-olive/30 shadow-sm">
                    <div>
                      <span className="font-bold text-forest uppercase tracking-widest text-[10px] block">
                        {item.farmerName} ({item.location})
                      </span>
                      <span className="text-[10px] text-forest/60 font-medium">
                        {item.grade} • ₹{item.expectedPricePerKg}/kg • {item.variety || 'Certified'}
                      </span>
                    </div>
                    <span className="font-anton text-xl text-forest tracking-wide">
                      +{item.quantityKg.toLocaleString()} kg
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-olive/30 flex items-center justify-between mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70">Total Matching Supply:</span>
              <span className="text-3xl font-anton text-forest tracking-wide">
                {totalAvailableSupply.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
