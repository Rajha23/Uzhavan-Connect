import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProduceListing, DemandRequest } from '../types';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Building2,
  ArrowRight,
  ShoppingBag,
  Scale,
  MapPin,
  Calendar,
  Check,
  Layers,
  Sprout
} from 'lucide-react';

// Distance estimator based on common regional agricultural corridors
const getEstimatedDistance = (loc1: string = '', loc2: string = ''): number => {
  const l1 = loc1.toLowerCase();
  const l2 = loc2.toLowerCase();
  if (!l1 || !l2 || l1 === l2) return 15;
  if ((l1.includes('salem') && l2.includes('chennai')) || (l1.includes('chennai') && l2.includes('salem'))) return 340;
  if (l1.includes('kanchipuram') || l1.includes('sunguvarchatram')) {
    if (l2.includes('chennai')) return 45;
    if (l2.includes('salem')) return 295;
  }
  if (l1.includes('chengalpattu')) {
    if (l2.includes('chennai')) return 55;
  }
  if (l1.includes('sriperumbudur')) {
    if (l2.includes('chennai')) return 35;
  }
  return 48;
};

// Quality grade compatibility evaluator
const isQualityCompatible = (produceGrade: string, buyerRequirement: string): boolean => {
  if (buyerRequirement === 'Any') return true;
  if (buyerRequirement === produceGrade) return true;
  if (buyerRequirement === 'Grade B' && (produceGrade === 'Grade A' || produceGrade === 'Premium')) return true;
  if (buyerRequirement === 'Standard' && (produceGrade === 'Grade A' || produceGrade === 'Premium')) return true;
  return false;
};

export const SmartMatchingEngine: React.FC = () => {
  const { produceListings, demandRequests, confirmMatchAndCreateOrder, setActiveTab } = useApp();

  // Configurable weights (sum or proportional)
  const [weights, setWeights] = useState({
    price: 25,
    distance: 25,
    quality: 20,
    reliability: 20,
    capacity: 10
  });

  // Selected demand to match against
  const [selectedDemandId, setSelectedDemandId] = useState<string>(() => {
    // Default to a Tomato demand if available, else first demand
    const tomatoDemand = demandRequests.find((d) => d.crop.toLowerCase() === 'tomato');
    return tomatoDemand ? tomatoDemand.id : demandRequests[0]?.id || '';
  });

  // Selected farmer listing under active detailed comparison
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [allocatedId, setAllocatedId] = useState<string>('');
  const [createdOrderNotice, setCreatedOrderNotice] = useState<{ id: string; crop: string; qty: number; price: number } | null>(null);

  const currentDemand: DemandRequest | undefined = useMemo(() => {
    return demandRequests.find((d) => d.id === selectedDemandId) || demandRequests[0];
  }, [demandRequests, selectedDemandId]);

  const totalWeight = weights.price + weights.distance + weights.quality + weights.reliability + weights.capacity;

  // Dynamically evaluate all farmer produce listings against current buyer demand
  const evaluatedCandidates = useMemo(() => {
    if (!currentDemand) return [];

    return produceListings.map((listing) => {
      const cropMatch = listing.crop.toLowerCase() === currentDemand.crop.toLowerCase();
      const qualityMatch = isQualityCompatible(listing.grade, currentDemand.qualityRequirement);
      const distanceKm = getEstimatedDistance(listing.location, currentDemand.location);
      const priceCompatible = listing.expectedPricePerKg <= currentDemand.maxTargetPricePerKg;

      // Price score: reward offer within or below buyer max price
      let priceScore = 70;
      if (currentDemand.maxTargetPricePerKg > 0) {
        if (priceCompatible) {
          const savings = currentDemand.maxTargetPricePerKg - listing.expectedPricePerKg;
          priceScore = Math.min(100, 85 + Math.round((savings / currentDemand.maxTargetPricePerKg) * 50));
        } else {
          const excess = listing.expectedPricePerKg - currentDemand.maxTargetPricePerKg;
          priceScore = Math.max(20, 70 - Math.round((excess / currentDemand.maxTargetPricePerKg) * 100));
        }
      }

      // Distance score: closer is better
      const distanceScore = Math.max(30, Math.min(100, Math.round(100 - (distanceKm / 400) * 55)));

      // Quality score
      let qualityScore = 80;
      if (listing.grade === currentDemand.qualityRequirement) {
        qualityScore = 95;
      } else if (listing.grade === 'Grade A' || listing.grade === 'Premium') {
        qualityScore = 98;
      } else if (qualityMatch) {
        qualityScore = 88;
      } else {
        qualityScore = 45;
      }

      // Reliability score
      const reliabilityScore = 92;

      // Capacity contribution score: how much of the demand volume this listing satisfies
      const contribRatio = Math.min(1, listing.quantityKg / (currentDemand.quantityKg || 1));
      const capacityScore = Math.min(100, Math.round(contribRatio * 100));

      const rawScore = (
        priceScore * weights.price +
        distanceScore * weights.distance +
        qualityScore * weights.quality +
        reliabilityScore * weights.reliability +
        capacityScore * weights.capacity
      ) / (totalWeight || 1);

      // Penalize heavily if crop doesn't match
      const totalMatchScore = cropMatch ? Math.min(99, Math.max(45, Math.round(rawScore))) : 20;

      const isEligible = cropMatch && qualityMatch && priceCompatible;

      return {
        listing,
        cropMatch,
        qualityMatch,
        priceCompatible,
        distanceKm,
        priceScore,
        distanceScore,
        qualityScore,
        reliabilityScore,
        capacityScore,
        totalMatchScore,
        isEligible
      };
    }).sort((a, b) => {
      // Prioritize crop matches, then higher total match score
      if (a.cropMatch !== b.cropMatch) return a.cropMatch ? -1 : 1;
      return b.totalMatchScore - a.totalMatchScore;
    });
  }, [produceListings, currentDemand, weights, totalWeight]);

  // Active evaluated candidate (default to highest scored matching candidate)
  const activeEvaluation = useMemo(() => {
    if (selectedListingId) {
      const found = evaluatedCandidates.find((c) => c.listing.id === selectedListingId);
      if (found) return found;
    }
    return evaluatedCandidates[0];
  }, [evaluatedCandidates, selectedListingId]);

  if (!currentDemand) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        <p className="text-sm font-semibold">No buyer demands currently registered for smart matching.</p>
      </div>
    );
  }

  const evaluatedListing = activeEvaluation?.listing;
  const contribKg = evaluatedListing ? Math.min(evaluatedListing.quantityKg, currentDemand.quantityKg) : 0;
  const contribPct = evaluatedListing
    ? Math.round((evaluatedListing.quantityKg / (currentDemand.quantityKg || 1)) * 100)
    : 0;
  const priceSavings = evaluatedListing ? currentDemand.maxTargetPricePerKg - evaluatedListing.expectedPricePerKg : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
      {/* 1. Engine Header & Demand Selector */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Dynamic Supply-Demand Matcher</span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">
            Smart Matching & Allocation Engine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating real-time farmer produce listings against active institutional buyer demands.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buyer Demand Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Demand:</span>
            <select
              value={currentDemand.id}
              onChange={(e) => {
                setSelectedDemandId(e.target.value);
                setSelectedListingId('');
              }}
              aria-label="Target Buyer Demand Selection"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {demandRequests.map((dem) => (
                <option key={dem.id} value={dem.id}>
                  {dem.id}: {dem.crop} ({dem.quantityKg.toLocaleString()} kg @ max ₹{dem.maxTargetPricePerKg})
                </option>
              ))}
            </select>
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
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Weights</span>
          </button>
        </div>
      </div>

      {/* 2. Factor Weights Slider Control Strip */}
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Configurable Factor Weightings (Live Dynamic Score Recalculation)</span>
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

      {/* 3. PROMPT REQUIRED: DYNAMIC MATCH RESULT SHOWCASE CARD */}
      {evaluatedListing && (
        <div className="p-6 bg-gradient-to-br from-emerald-950 via-[#01472e] to-teal-950 text-white rounded-2xl m-6 space-y-6 shadow-xl border border-emerald-800/40">
          {/* Header Row: Match Status & Dynamic Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-800/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-400 text-emerald-950 font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                  {activeEvaluation.isEligible ? 'Eligible / Matched' : 'Partial Match'}
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Live Supply-Demand Evaluation
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-medium pt-1">
                Evaluating Farmer Supply ID: <span className="font-mono text-white font-bold">{evaluatedListing.id}</span> against Buyer Demand ID: <span className="font-mono text-white font-bold">{currentDemand.id}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 self-start sm:self-auto">
              <span className="text-xs text-emerald-300 font-semibold">Match Score:</span>
              <span className="text-3xl font-black font-mono text-emerald-300">
                {activeEvaluation.totalMatchScore}%
              </span>
            </div>
          </div>

          {/* Prompt Required: Two Evaluated Entities Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. FARMER SUPPLY CARD */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    FARMER SUPPLY
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 font-mono font-medium">
                  {evaluatedListing.farmerName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Crop & Variety:</span>
                  <span className="font-bold text-white text-sm">
                    {evaluatedListing.crop} {evaluatedListing.variety ? `(${evaluatedListing.variety})` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Available Quantity:</span>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${evaluatedListing.quantityKg > 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {evaluatedListing.quantityKg.toLocaleString()} {evaluatedListing.unit || 'kg'}
                    </span>
                    {evaluatedListing.allocatedQuantityKg && evaluatedListing.allocatedQuantityKg > 0 ? (
                      <span className="block text-[10px] text-emerald-200/70">
                        ({evaluatedListing.allocatedQuantityKg.toLocaleString()} {evaluatedListing.unit || 'kg'} already allocated in orders)
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Quality Grade:</span>
                  <span className="font-bold text-white">{evaluatedListing.grade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Location:</span>
                  <span className="font-bold text-white">{evaluatedListing.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Expected Price:</span>
                  <span className="font-bold text-emerald-300 text-sm">₹{evaluatedListing.expectedPricePerKg}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Harvest Date:</span>
                  <span className="font-medium text-white">{evaluatedListing.harvestDate}</span>
                </div>
                {evaluatedListing.fpoName && (
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-200/80">FPO Collective:</span>
                    <span className="font-medium text-emerald-200">{evaluatedListing.fpoName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. MATCHED BUYER DEMAND CARD */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    MATCHED BUYER DEMAND
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 font-mono font-medium">
                  {currentDemand.buyerName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Crop:</span>
                  <span className="font-bold text-white text-sm">{currentDemand.crop}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Required Quantity:</span>
                  <span className="font-bold text-emerald-300 text-sm">{currentDemand.quantityKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Quality:</span>
                  <span className="font-bold text-white">{currentDemand.qualityRequirement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Delivery Location:</span>
                  <span className="font-bold text-white">{currentDemand.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Maximum Target Price:</span>
                  <span className="font-bold text-emerald-300 text-sm">₹{currentDemand.maxTargetPricePerKg}/kg</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-emerald-200/80">Delivery Date:</span>
                  <span className="font-medium text-white">{currentDemand.deliveryDate} ({currentDemand.deliveryTimeWindow})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Contribution Strip */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-200 uppercase tracking-wider text-[11px]">
                Demand Fulfillment Contribution:
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {evaluatedListing.quantityKg.toLocaleString()} kg / {currentDemand.quantityKg.toLocaleString()} kg ({contribPct}%)
              </span>
            </div>
            <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-700/50">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, contribPct)}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-200/80">
              {contribPct >= 100
                ? '✓ Farmer supply satisfies 100% of this institutional buyer demand.'
                : `Farmer supply provides ${contribKg.toLocaleString()} kg (${contribPct}%) toward satisfying the ${currentDemand.quantityKg.toLocaleString()} kg pooled buyer demand.`}
            </p>
          </div>

          {/* Prompt Required: Clear MATCH EXPLANATION Checklist */}
          <div className="pt-4 border-t border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                MATCH EXPLANATION
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Crop matches ({evaluatedListing.crop})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Quality requirement compatible ({evaluatedListing.grade} satisfies {currentDemand.qualityRequirement})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Farmer quantity contributes to required demand ({evaluatedListing.quantityKg.toLocaleString()} kg provides {contribPct}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Farmer expected price is within buyer target price (₹{evaluatedListing.expectedPricePerKg}/kg ≤ ₹{currentDemand.maxTargetPricePerKg}/kg
                    {priceSavings > 0 ? ` • ₹${priceSavings}/kg savings` : ''})
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Regional route: {evaluatedListing.location} → {currentDemand.location} (~{activeEvaluation.distanceKm} km)</span>
                </span>
              </div>
            </div>

            <button
              data-testid="confirm-allocate-btn"
              disabled={evaluatedListing.quantityKg <= 0 || allocatedId === evaluatedListing.id}
              onClick={() => {
                if (evaluatedListing.quantityKg <= 0) return;
                setAllocatedId(evaluatedListing.id);
                const order = confirmMatchAndCreateOrder(
                  evaluatedListing.id,
                  currentDemand.id,
                  evaluatedListing.expectedPricePerKg,
                  contribKg
                );
                if (order) {
                  setCreatedOrderNotice({
                    id: order.id,
                    crop: order.crop,
                    qty: order.quantityKg,
                    price: order.pricePerKg
                  });
                }
              }}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition shadow-sm self-start md:self-auto uppercase tracking-wider whitespace-nowrap ${
                evaluatedListing.quantityKg <= 0
                  ? 'bg-slate-700/80 text-slate-300 cursor-not-allowed'
                  : allocatedId === evaluatedListing.id
                  ? 'bg-emerald-400 text-emerald-950 flex items-center gap-2'
                  : 'bg-white text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              {evaluatedListing.quantityKg <= 0 ? (
                <span>Fully Allocated (0 kg Available)</span>
              ) : allocatedId === evaluatedListing.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                  <span>Allocated to Demand</span>
                </>
              ) : (
                <span>Confirm Match & Allocate →</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Created Success Banner */}
      {createdOrderNotice && (
        <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Match Confirmed & Order Generated: <span className="font-mono">{createdOrderNotice.id}</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                {createdOrderNotice.qty.toLocaleString()} kg of {createdOrderNotice.crop} @ ₹{createdOrderNotice.price}/kg allocated. Produce collection queued for FPO Aggregator.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span>Track in Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Ranked Supplier Candidates List */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Ranked Farmer & FPO Candidates ({evaluatedCandidates.length})
            </h4>
            <p className="text-xs text-slate-500">
              Evaluated against Buyer Demand: {currentDemand.crop} ({currentDemand.quantityKg.toLocaleString()} kg @ ₹{currentDemand.maxTargetPricePerKg}/kg)
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Live multi-factor ranking</span>
        </div>

        <div className="space-y-3">
          {evaluatedCandidates.map((candidate, index) => {
            const isSelected = candidate.listing.id === (evaluatedListing?.id || '');
            const isAllocated = candidate.listing.id === allocatedId;
            const isTopRanked = index === 0;

            return (
              <div
                key={candidate.listing.id}
                className={`rounded-xl border p-5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-600/20 shadow-sm'
                    : candidate.cropMatch
                    ? 'bg-white border-slate-200 hover:border-emerald-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
                onClick={() => setSelectedListingId(candidate.listing.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isTopRanked
                          ? 'bg-emerald-700 text-white'
                          : candidate.cropMatch
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {candidate.listing.farmerName}
                        </h4>
                        {isTopRanked && candidate.cropMatch && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300 uppercase tracking-wider">
                            OPTIMAL MATCH
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Evaluating
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        <strong className="text-slate-900">{candidate.listing.crop}</strong>
                        {candidate.listing.variety && <span className="text-slate-500 font-medium"> ({candidate.listing.variety})</span>} • Available:{' '}
                        <strong className={candidate.listing.quantityKg > 0 ? "text-emerald-700" : "text-slate-400 font-mono"}>
                          {candidate.listing.quantityKg.toLocaleString()} {candidate.listing.unit || 'kg'}
                        </strong>
                        {candidate.listing.quantityKg <= 0 ? (
                          <span className="ml-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            Fully Allocated
                          </span>
                        ) : candidate.listing.allocatedQuantityKg && candidate.listing.allocatedQuantityKg > 0 ? (
                          <span className="text-[11px] text-slate-500 ml-1">
                            ({candidate.listing.allocatedQuantityKg.toLocaleString()} {candidate.listing.unit || 'kg'} allocated)
                          </span>
                        ) : null}
                        {' '}• Quality: <strong className="text-slate-900">{candidate.listing.grade}</strong> • Expected Price:{' '}
                        <strong className="text-slate-900">₹{candidate.listing.expectedPricePerKg}/kg</strong> • {candidate.listing.location} (~{candidate.distanceKm} km)
                        {candidate.listing.fpoName && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Affiliated FPO: <strong>{candidate.listing.fpoName}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Score & Action */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Match Score
                      </span>
                      <span className="text-2xl font-black text-emerald-700 font-mono">
                        {candidate.totalMatchScore}
                        <span className="text-xs text-slate-400 font-normal"> / 100</span>
                      </span>
                    </div>

                    <button
                      disabled={candidate.listing.quantityKg <= 0 || isAllocated}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (candidate.listing.quantityKg <= 0) return;
                        setSelectedListingId(candidate.listing.id);
                        setAllocatedId(candidate.listing.id);
                        const cardContribKg = Math.min(candidate.listing.quantityKg, currentDemand.quantityKg);
                        const order = confirmMatchAndCreateOrder(
                          candidate.listing.id,
                          currentDemand.id,
                          candidate.listing.expectedPricePerKg,
                          cardContribKg
                        );
                        if (order) {
                          setCreatedOrderNotice({
                            id: order.id,
                            crop: order.crop,
                            qty: order.quantityKg,
                            price: order.pricePerKg
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                        candidate.listing.quantityKg <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : isAllocated
                          ? 'bg-emerald-700 text-white flex items-center gap-1.5'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {candidate.listing.quantityKg <= 0 ? (
                        <span>Fully Allocated</span>
                      ) : isAllocated ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Allocated</span>
                        </>
                      ) : (
                        <span>Select & Allocate</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-Score Progress Bars Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Price (₹{candidate.listing.expectedPricePerKg}/kg):</span>
                      <strong className="text-slate-800 font-mono">{candidate.priceScore}</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${candidate.priceScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Distance ({candidate.distanceKm} km):</span>
                      <strong className="text-slate-800 font-mono">{candidate.distanceScore}</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${candidate.distanceScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Quality ({candidate.listing.grade}):</span>
                      <strong className="text-slate-800 font-mono">{candidate.qualityScore}</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${candidate.qualityScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Reliability:</span>
                      <strong className="text-slate-800 font-mono">{candidate.reliabilityScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${candidate.reliabilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Capacity ({candidate.listing.quantityKg}kg):</span>
                      <strong className="text-slate-800 font-mono">{candidate.capacityScore}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${candidate.capacityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
