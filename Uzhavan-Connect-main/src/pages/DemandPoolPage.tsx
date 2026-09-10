import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_DEMAND_POOL } from '../data/mockData';
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
  const { setActiveTab, demandRequests, produceListings } = useApp();

  // Filter demands for Tomato (active pooled commodity)
  const tomatoDemands = demandRequests.filter(
    (d) => d.crop.toLowerCase() === 'tomato'
  );
  const activeDemands = tomatoDemands.length > 0 ? tomatoDemands : demandRequests;
  const totalPooledQty = activeDemands.reduce((sum, d) => sum + d.quantityKg, 0);
  const buyersCount = new Set(activeDemands.map((d) => d.buyerName)).size;
  const avgMaxPrice = activeDemands.length > 0
    ? (activeDemands.reduce((sum, d) => sum + d.maxTargetPricePerKg, 0) / activeDemands.length).toFixed(2)
    : '32.00';

  // Available nearby supply from actual farmer produce listings
  const tomatoSupplies = produceListings.filter(
    (p) => p.crop.toLowerCase() === 'tomato'
  );
  const activeSupplies = tomatoSupplies.length > 0 ? tomatoSupplies : produceListings;
  const totalAvailableSupply = activeSupplies.reduce((sum, s) => sum + s.quantityKg, 0);

  const pool = {
    ...INITIAL_DEMAND_POOL,
    totalQuantityKg: totalPooledQty,
    buyersCount: buyersCount,
    demandRequests: activeDemands
  };

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
            Eliminating fragmented buyer competition. Small individual orders pool into institutional-scale volume opportunities, unlocking bulk transport rates and fair farmer realization.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('reverse-auction')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>Proceed to Reverse Auction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pool Identity Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">COMMODITY</span>
          <p className="text-2xl font-anton text-forest">{pool.crop}</p>
          <span className="text-[10px] text-forest/70 font-medium">Grade A Hybrid</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">REGIONAL CORRIDOR</span>
          <p className="text-2xl font-anton text-forest">{pool.region.split(' ')[0]}</p>
          <span className="text-[10px] text-forest/70 font-medium">Chennai Metropolitan</span>
        </div>

        <div className="bg-olive/20 p-5 rounded-[1.5rem] border border-olive/40 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest font-bold uppercase tracking-widest block mb-1">POOLED QUANTITY</span>
          <p className="text-3xl font-anton text-forest">
            {pool.totalQuantityKg.toLocaleString()} kg
          </p>
          <span className="text-[10px] text-forest/70 font-bold uppercase tracking-widest">Ready for Auction</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">TARGET DELIVERY</span>
          <p className="text-2xl font-anton text-forest">{pool.targetDate}</p>
          <span className="text-[10px] text-forest/70 font-medium">Morning 05:30 window</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">FORECAST BASELINE</span>
          <p className="text-2xl font-anton text-forest">
            {pool.forecastQuantityKg.toLocaleString()} kg
          </p>
          <span className="text-[10px] text-forest/70 font-medium">7-Day Corridor Need</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[9px] text-forest/50 font-bold uppercase tracking-widest block mb-1">CONSOLIDATED BUYERS</span>
          <p className="text-2xl font-anton text-forest">
            {pool.buyersCount} <span className="text-lg">Entities</span>
          </p>
          <span className="text-[10px] text-forest/70 font-medium">Single Dispatch Run</span>
        </div>
      </div>

      {/* Visual Aggregation: Fragmented Demand to One Procurement Pool */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-forest">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-4 py-1.5 rounded-full border border-sage/50">
            Aggregation Mechanism
          </span>
          <h3 className="text-3xl font-anton text-forest mt-4 tracking-wide">
            Fragmented Demand → One Large Institutional Opportunity
          </h3>
          <p className="text-sm text-forest/70 mt-3 font-medium">
            Instead of 3 small trucks making 3 separate uncoordinated trips, Uzhavan Connect aggregates them into a single 3.0T Reefer run.
          </p>
        </div>

        {/* Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: 3 Fragmented Buyers */}
          <div className="md:col-span-5 space-y-4">
            {pool.demandRequests.map((b, idx) => (
              <div
                key={b.id}
                className="bg-olive/10 border border-olive/30 rounded-[1.5rem] p-5 hover:shadow-sm transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sage/40 text-forest flex items-center justify-center font-anton text-xl">
                    B{idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-forest text-sm uppercase tracking-widest">{b.buyerName}</h5>
                    <p className="text-xs text-forest/70 font-medium">{b.buyerType} • Max ₹{b.maxTargetPricePerKg}/kg</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-anton text-forest tracking-wide">{b.quantityKg.toLocaleString()} kg</span>
                  <span className="text-[9px] text-forest/60 font-bold uppercase tracking-widest block">{b.qualityRequirement}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Center: Pooling Transformation Funnel */}
          <div className="md:col-span-2 text-center py-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-sage/20 border border-sage flex items-center justify-center text-forest animate-pulse shadow-sm">
              <Layers className="w-8 h-8 text-forest" />
            </div>
            <span className="text-[10px] font-bold text-forest uppercase tracking-widest mt-4">
              AUTOMATIC POOL
            </span>
            <span className="text-[9px] text-forest/60 font-bold uppercase tracking-widest mt-1">Zero Arbitrage Layer</span>
          </div>

          {/* Right: Consolidated Pool Box */}
          <div className="md:col-span-5">
            <div className="bg-forest text-cream rounded-[2.5rem] p-8 shadow-forest space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-sage/20 px-3 py-1 rounded-full text-sage border border-sage/40">
                  Pooled Lot: POOL-CH-3000
                </span>
                <span className="text-[10px] text-sage font-bold uppercase tracking-widest">100% Guaranteed</span>
              </div>

              <div>
                <span className="text-[10px] text-cream/70 font-bold uppercase tracking-widest block">Total Combined Procurement</span>
                <p className="text-5xl font-anton mt-2 tracking-wide text-sage">{totalPooledQty.toLocaleString()} kg</p>
                <p className="text-sm text-cream/80 mt-2 font-medium">
                  Grade A Vine-Ripened Tomato for Chennai Corridor
                </p>
              </div>

              <div className="pt-4 border-t border-olive/20 flex items-center justify-between text-sm">
                <span className="text-cream/70 font-bold uppercase tracking-widest text-[10px]">Benchmarked Landed Price:</span>
                <span className="font-anton text-2xl text-sage tracking-wide">₹{avgMaxPrice} <span className="text-sm font-sans tracking-normal">/ kg</span></span>
              </div>

              <button
                onClick={() => setActiveTab('reverse-auction')}
                className="w-full py-4 bg-sage text-forest font-bold rounded-[1rem] text-xs hover:bg-cream transition shadow-sm uppercase tracking-widest"
              >
                Submit FPO Bids in Reverse Auction →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Nearby Supply Section */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-forest space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/20 px-4 py-1.5 rounded-full border border-sage/40">
              Demand vs Supply Matching
            </span>
            <h3 className="text-3xl font-anton text-forest mt-4 tracking-wide">
              Available Nearby Supply
            </h3>
            <p className="text-sm text-forest/70 mt-2 font-medium">
              Active farmer clusters and produce listings ready within delivery corridor.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-forest hover:bg-[#023120] text-cream text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>Find Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your Demand Card */}
          <div className="p-8 rounded-[1.5rem] bg-olive/10 border border-olive/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">Active Demand</span>
              <span className="text-[10px] bg-sage/30 text-forest font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-sage/50">
                {activeDemands[0]?.location.split(',')[0] || 'Chennai Central'}
              </span>
            </div>
            <p className="text-5xl font-anton text-forest tracking-wide">
              {(activeDemands[0]?.quantityKg || totalPooledQty).toLocaleString()} kg
            </p>
            <p className="text-sm text-forest/70 font-medium">
              Commodity: {activeDemands[0]?.crop || 'Tomato'} ({activeDemands[0]?.qualityRequirement || 'Grade A'}) • Max Target: ₹{activeDemands[0]?.maxTargetPricePerKg || 30}/kg
            </p>
          </div>

          {/* Available Nearby Supply Card */}
          <div className="p-8 rounded-[1.5rem] bg-sage/10 border border-sage/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest">Available Nearby Farmer Supply</span>
              <span className="text-[10px] bg-forest text-cream font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Cluster Ready
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {activeSupplies.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-cream p-4 rounded-[1rem] border border-olive/30 shadow-sm">
                  <div>
                    <span className="font-bold text-forest uppercase tracking-widest text-[10px] block">
                      {item.farmerName} ({item.location})
                    </span>
                    <span className="text-[10px] text-forest/60 font-medium">
                      {item.grade} • ₹{item.expectedPricePerKg}/kg
                    </span>
                  </div>
                  <span className="font-anton text-xl text-forest tracking-wide">
                    +{item.quantityKg.toLocaleString()} kg
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-olive/30 flex items-center justify-between mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70">Total Available:</span>
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
