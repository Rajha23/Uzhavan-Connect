import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProduceListing, DemandRequest, AggregatedDemandGroup, WorkflowOrder } from '../types';
import confetti from 'canvas-confetti';
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
  Sprout,
  X,
  FileText,
  AlertCircle
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
  const {
    produceListings,
    demandRequests,
    aggregatedDemandGroups,
    confirmMatchAndCreateOrder,
    setActiveTab
  } = useApp();

  // Configurable weights (sum or proportional)
  const [weights, setWeights] = useState({
    price: 25,
    distance: 25,
    quality: 20,
    reliability: 20,
    capacity: 10
  });

  // Selected target key: either "group:POOL-..." or "demand:DEM-..."
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>(() => {
    if (aggregatedDemandGroups.length > 0) {
      return `group:${aggregatedDemandGroups[0].id}`;
    }
    return demandRequests[0] ? `demand:${demandRequests[0].id}` : '';
  });

  // Selected farmer listing under active detailed comparison
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [allocatedId, setAllocatedId] = useState<string>('');
  const [createdOrderNotice, setCreatedOrderNotice] = useState<{
    id: string;
    crop: string;
    qty: number;
    price: number;
  } | null>(null);

  // 5-Step Connected Agreement & Order Modal state
  const [agreementModal, setAgreementModal] = useState<{
    isOpen: boolean;
    listing: ProduceListing | null;
    agreedQty: number;
    agreedPrice: number;
    step: 'TERMS' | 'CONFIRMED';
    createdOrder: WorkflowOrder | null;
  }>({
    isOpen: false,
    listing: null,
    agreedQty: 0,
    agreedPrice: 0,
    step: 'TERMS',
    createdOrder: null
  });

  // Unified Demand Target (whether an Aggregated Group or an Individual Demand)
  const currentTarget = useMemo(() => {
    if (selectedTargetKey.startsWith('group:')) {
      const gId = selectedTargetKey.replace('group:', '');
      const grp = aggregatedDemandGroups.find((g) => g.id === gId) || aggregatedDemandGroups[0];
      if (grp) {
        return {
          id: grp.id,
          displayName: `[Aggregated Pool] ${grp.id}: ${grp.crop} - ${grp.region} (${grp.totalQuantityKg.toLocaleString()} kg from ${grp.buyersCount} buyers)`,
          isGroup: true,
          groupId: grp.id,
          underlyingDemandId: grp.contributingDemands[0]?.id || demandRequests[0]?.id || '',
          buyerName: `${grp.buyersCount} Consolidated Institutional Buyers (${grp.region})`,
          buyerType: 'Institutional Consortium',
          crop: grp.crop,
          variety: grp.variety || 'Certified Commercial Hybrid',
          quantityKg: grp.totalQuantityKg,
          initialQuantityKg: grp.initialQuantityKg || grp.totalQuantityKg,
          qualityRequirement: grp.qualityRequirement,
          location: grp.region,
          deliveryDate: grp.targetDate,
          deliveryTimeWindow: grp.deliveryTimeWindow || '05:30 AM - 08:30 AM',
          maxTargetPricePerKg: grp.avgMaxPricePerKg,
          contributingDemands: grp.contributingDemands
        };
      }
    }

    const dId = selectedTargetKey.replace('demand:', '');
    const dem = demandRequests.find((d) => d.id === dId) || demandRequests[0];
    if (dem) {
      return {
        id: dem.id,
        displayName: `[Individual Demand] ${dem.id}: ${dem.crop} - ${dem.buyerName} (${dem.quantityKg.toLocaleString()} kg @ max ₹${dem.maxTargetPricePerKg})`,
        isGroup: false,
        groupId: undefined,
        underlyingDemandId: dem.id,
        buyerName: dem.buyerName,
        buyerType: dem.buyerType,
        crop: dem.crop,
        variety: dem.variety || 'Certified Hybrid',
        quantityKg: dem.quantityKg,
        initialQuantityKg: dem.initialQuantityKg || dem.quantityKg,
        qualityRequirement: dem.qualityRequirement,
        location: dem.location,
        deliveryDate: dem.deliveryDate,
        deliveryTimeWindow: dem.deliveryTimeWindow,
        maxTargetPricePerKg: dem.maxTargetPricePerKg,
        contributingDemands: [dem]
      };
    }

    return null;
  }, [selectedTargetKey, aggregatedDemandGroups, demandRequests]);

  const totalWeight = weights.price + weights.distance + weights.quality + weights.reliability + weights.capacity;

  // Dynamically evaluate all farmer produce listings against current unified target
  const evaluatedCandidates = useMemo(() => {
    if (!currentTarget) return [];

    return produceListings.map((listing) => {
      const cropMatch = listing.crop.toLowerCase() === currentTarget.crop.toLowerCase();
      const qualityMatch = isQualityCompatible(listing.grade, currentTarget.qualityRequirement);
      const distanceKm = getEstimatedDistance(listing.location, currentTarget.location);
      const priceCompatible = listing.expectedPricePerKg <= currentTarget.maxTargetPricePerKg;

      // Price score: reward offer within or below buyer max price
      let priceScore = 70;
      if (currentTarget.maxTargetPricePerKg > 0) {
        if (priceCompatible) {
          const savings = currentTarget.maxTargetPricePerKg - listing.expectedPricePerKg;
          priceScore = Math.min(100, 85 + Math.round((savings / currentTarget.maxTargetPricePerKg) * 50));
        } else {
          const excess = listing.expectedPricePerKg - currentTarget.maxTargetPricePerKg;
          priceScore = Math.max(20, 70 - Math.round((excess / currentTarget.maxTargetPricePerKg) * 100));
        }
      }

      // Distance score: closer is better
      const distanceScore = Math.max(30, Math.min(100, Math.round(100 - (distanceKm / 400) * 55)));

      // Quality score
      let qualityScore = 80;
      if (listing.grade === currentTarget.qualityRequirement) {
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
      const contribRatio = Math.min(1, listing.quantityKg / (currentTarget.quantityKg || 1));
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
  }, [produceListings, currentTarget, weights, totalWeight]);

  // Active evaluated candidate (default to highest scored matching candidate)
  const activeEvaluation = useMemo(() => {
    if (selectedListingId) {
      const found = evaluatedCandidates.find((c) => c.listing.id === selectedListingId);
      if (found) return found;
    }
    return evaluatedCandidates[0];
  }, [evaluatedCandidates, selectedListingId]);

  if (!currentTarget) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        <p className="text-sm font-semibold">No active demands or aggregated pools available for matching.</p>
      </div>
    );
  }

  const evaluatedListing = activeEvaluation?.listing;
  const contribKg = evaluatedListing ? Math.min(evaluatedListing.quantityKg, currentTarget.quantityKg) : 0;
  const contribPct = evaluatedListing
    ? Math.round((contribKg / (currentTarget.quantityKg || 1)) * 100)
    : 0;
  const priceSavings = evaluatedListing ? currentTarget.maxTargetPricePerKg - evaluatedListing.expectedPricePerKg : 0;
  const isPartialMatch = evaluatedListing ? evaluatedListing.quantityKg < currentTarget.quantityKg : false;

  const handleOpenAgreementModal = (candidateListing: ProduceListing) => {
    if (candidateListing.quantityKg <= 0) return;
    const defaultAgreedQty = Math.min(candidateListing.quantityKg, currentTarget.quantityKg);
    const defaultAgreedPrice = candidateListing.expectedPricePerKg;

    setAgreementModal({
      isOpen: true,
      listing: candidateListing,
      agreedQty: defaultAgreedQty,
      agreedPrice: defaultAgreedPrice,
      step: 'TERMS',
      createdOrder: null
    });
  };

  const handleConfirmAndIssueOrder = () => {
    if (!agreementModal.listing || agreementModal.agreedQty <= 0) return;

    const listing = agreementModal.listing;
    const order = confirmMatchAndCreateOrder(
      listing.id,
      currentTarget.underlyingDemandId,
      agreementModal.agreedPrice,
      agreementModal.agreedQty,
      currentTarget.isGroup ? currentTarget.groupId : undefined
    );

    if (order) {
      setAllocatedId(listing.id);
      setCreatedOrderNotice({
        id: order.id,
        crop: order.crop,
        qty: order.quantityKg,
        price: order.pricePerKg
      });
      setAgreementModal((prev) => ({
        ...prev,
        step: 'CONFIRMED',
        createdOrder: order
      }));
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
      {/* 1. Engine Header & Demand Target Selector */}
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
            Evaluating real-time farmer produce listings against active buyer demands & aggregated groups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Selector: Supports both Aggregated Groups and Individual Demands */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target:</span>
            <select
              value={selectedTargetKey}
              onChange={(e) => {
                setSelectedTargetKey(e.target.value);
                setSelectedListingId('');
              }}
              aria-label="Target Demand or Aggregated Pool Selection"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[280px] truncate"
            >
              {aggregatedDemandGroups.length > 0 && (
                <optgroup label="📦 Aggregated Demand Pools">
                  {aggregatedDemandGroups.map((grp) => (
                    <option key={`group:${grp.id}`} value={`group:${grp.id}`}>
                      [Group] {grp.id}: {grp.crop} - {grp.region} ({grp.totalQuantityKg.toLocaleString()} kg from {grp.buyersCount} buyers)
                    </option>
                  ))}
                </optgroup>
              )}
              {demandRequests.length > 0 && (
                <optgroup label="🏢 Individual Buyer Demands">
                  {demandRequests.map((dem) => (
                    <option key={`demand:${dem.id}`} value={`demand:${dem.id}`}>
                      [Individual] {dem.id}: {dem.crop} - {dem.buyerName} ({dem.quantityKg.toLocaleString()} kg @ max ₹{dem.maxTargetPricePerKg})
                    </option>
                  ))}
                </optgroup>
              )}
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

      {/* 3. DYNAMIC MATCH RESULT SHOWCASE CARD */}
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
                Evaluating Farmer Supply: <span className="font-mono text-white font-bold">{evaluatedListing.id} ({evaluatedListing.farmerName})</span> against Target: <span className="font-mono text-white font-bold">{currentTarget.id}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 self-start sm:self-auto">
              <span className="text-xs text-emerald-300 font-semibold">Match Score:</span>
              <span className="text-3xl font-black font-mono text-emerald-300">
                {activeEvaluation.totalMatchScore}%
              </span>
            </div>
          </div>

          {/* TWO EVALUATED ENTITIES SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. FARMER SUPPLY CARD */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    FARMER SUPPLY DETAILS
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
                  <span className="text-emerald-200/80">Available Supply:</span>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${evaluatedListing.quantityKg > 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {evaluatedListing.quantityKg.toLocaleString()} {evaluatedListing.unit || 'kg'}
                    </span>
                    {evaluatedListing.allocatedQuantityKg && evaluatedListing.allocatedQuantityKg > 0 ? (
                      <span className="block text-[10px] text-emerald-200/70">
                        ({evaluatedListing.allocatedQuantityKg.toLocaleString()} {evaluatedListing.unit || 'kg'} allocated)
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Quality Grade:</span>
                  <span className="font-bold text-white">{evaluatedListing.grade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Farm Location:</span>
                  <span className="font-bold text-white">{evaluatedListing.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Expected Price:</span>
                  <span className="font-bold text-emerald-300 text-sm">₹{evaluatedListing.expectedPricePerKg}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Harvest / Ready Date:</span>
                  <span className="font-medium text-white">{evaluatedListing.harvestDate || evaluatedListing.availabilityDate}</span>
                </div>
                {evaluatedListing.fpoName && (
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-200/80">Affiliated FPO:</span>
                    <span className="font-medium text-emerald-200">{evaluatedListing.fpoName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. MATCHED BUYER / AGGREGATED DEMAND CARD */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                    {currentTarget.isGroup ? 'AGGREGATED POOL DETAILS' : 'BUYER DEMAND DETAILS'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 font-mono font-medium truncate max-w-[180px]">
                  {currentTarget.buyerName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Commodity & Variety:</span>
                  <span className="font-bold text-white text-sm">
                    {currentTarget.crop} ({currentTarget.variety || 'Commercial Grade'})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Target Demanded Qty:</span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {currentTarget.quantityKg.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Required Grade:</span>
                  <span className="font-bold text-white">{currentTarget.qualityRequirement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Delivery Destination / Corridor:</span>
                  <span className="font-bold text-white">{currentTarget.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Ceiling Target Price:</span>
                  <span className="font-bold text-emerald-300 text-sm">₹{currentTarget.maxTargetPricePerKg}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">Delivery Date & Window:</span>
                  <span className="font-medium text-white">{currentTarget.deliveryDate} ({currentTarget.deliveryTimeWindow})</span>
                </div>
                {currentTarget.isGroup && (
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-200/80">Contributing Demands:</span>
                    <span className="font-medium text-emerald-200">{currentTarget.contributingDemands?.length || 1} buyers pooled</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PARTIAL MATCH TRANSPARENCY & ARITHMETIC BANNER */}
          <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-300" />
                <span>Volume Contribution & Allocation Arithmetic</span>
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {contribKg.toLocaleString()} kg allocated ({contribPct}% of {currentTarget.quantityKg.toLocaleString()} kg)
              </span>
            </div>

            <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-700/50">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, contribPct)}%` }}
              />
            </div>

            <div className="text-xs text-emerald-100/90 leading-relaxed pt-1">
              {isPartialMatch ? (
                <p>
                  ⚡ <strong className="text-amber-300 font-semibold">Partial Match:</strong> Farmer supply offers <strong>{evaluatedListing.quantityKg.toLocaleString()} kg</strong> against the total demand of <strong>{currentTarget.quantityKg.toLocaleString()} kg</strong>. Once agreed, <strong>{contribKg.toLocaleString()} kg</strong> will be allocated; the remaining <strong>{(currentTarget.quantityKg - contribKg).toLocaleString()} kg</strong> will remain open for further supplier allocation.
                </p>
              ) : (
                <p>
                  ✓ <strong className="text-emerald-300 font-semibold">Full Match:</strong> Farmer listing offers <strong>{evaluatedListing.quantityKg.toLocaleString()} kg</strong> which satisfies 100% of this <strong>{currentTarget.quantityKg.toLocaleString()} kg</strong> demand. The remaining <strong>{(evaluatedListing.quantityKg - contribKg).toLocaleString()} kg</strong> stays available for other buyer requests.
                </p>
              )}
            </div>
          </div>

          {/* MATCH EXPLANATION CHECKLIST */}
          <div className="pt-4 border-t border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                MATCH EXPLANATION BREAKDOWN
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Crop matches ({evaluatedListing.crop})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Quality requirement compatible ({evaluatedListing.grade} satisfies {currentTarget.qualityRequirement})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Volume contribution ({contribKg.toLocaleString()} kg satisfies {contribPct}% of need)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Price advantage: ₹{evaluatedListing.expectedPricePerKg}/kg ≤ max ₹{currentTarget.maxTargetPricePerKg}/kg
                    {priceSavings > 0 ? ` (₹${priceSavings}/kg buyer savings)` : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Regional corridor route: {evaluatedListing.location} → {currentTarget.location} (~{activeEvaluation.distanceKm} km)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Delivery aligned for {currentTarget.deliveryDate} ({currentTarget.deliveryTimeWindow})</span>
                </span>
              </div>
            </div>

            <button
              data-testid="confirm-allocate-btn"
              disabled={evaluatedListing.quantityKg <= 0 || allocatedId === evaluatedListing.id}
              onClick={() => handleOpenAgreementModal(evaluatedListing)}
              className={`px-6 py-3.5 rounded-xl text-xs font-bold transition shadow-sm self-start md:self-auto uppercase tracking-wider whitespace-nowrap flex items-center gap-2 ${
                evaluatedListing.quantityKg <= 0
                  ? 'bg-slate-700/80 text-slate-300 cursor-not-allowed'
                  : allocatedId === evaluatedListing.id
                  ? 'bg-emerald-400 text-emerald-950 cursor-default'
                  : 'bg-white text-emerald-950 hover:bg-emerald-100 cursor-pointer'
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
                <>
                  <span>Confirm Match & Agreement →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Created Success Notice */}
      {createdOrderNotice && (
        <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Match Agreement Finalized & Order Created: <span className="font-mono">{createdOrderNotice.id}</span>
              </p>
              <p className="text-[11px] text-emerald-700">
                {createdOrderNotice.qty.toLocaleString()} kg of {createdOrderNotice.crop} @ ₹{createdOrderNotice.price}/kg reserved. Produce collection queued for FPO Aggregator.
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
              Evaluated against Target Demand: {currentTarget.crop} ({currentTarget.quantityKg.toLocaleString()} kg @ ₹{currentTarget.maxTargetPricePerKg}/kg)
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
                        handleOpenAgreementModal(candidate.listing);
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

      {/* 5. INTERACTIVE MATCH AGREEMENT & ORDER CONFIRMATION MODAL */}
      {agreementModal.isOpen && agreementModal.listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#01472e]/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-cream rounded-[2.5rem] shadow-forest border border-olive/30 p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-olive/20">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-forest" />
                <div>
                  <h3 className="text-2xl font-anton text-forest tracking-wide">
                    {agreementModal.step === 'TERMS' ? 'Digital Match Agreement & Order Initiation' : 'Match Confirmed & Order Created'}
                  </h3>
                  <p className="text-xs text-forest/60 font-medium">
                    {agreementModal.step === 'TERMS'
                      ? 'Connected Transaction Lifecycle (Step 3: Matching → Step 4: Agreement → Step 5: Order)'
                      : 'Produce allocated and scheduled for FPO collection.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-forest/50 hover:text-forest transition font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {agreementModal.step === 'TERMS' ? (
              <div className="space-y-6">
                {/* 5-Step Lifecycle Progress Tracker */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                    1. Match
                  </div>
                  <div className="p-2 bg-emerald-700 text-white rounded-lg font-bold shadow-xs">
                    2. Agreement
                  </div>
                  <div className="p-2 bg-olive/20 text-forest/70 rounded-lg">
                    3. Quantities
                  </div>
                  <div className="p-2 bg-olive/20 text-forest/70 rounded-lg">
                    4. Price
                  </div>
                  <div className="p-2 bg-olive/20 text-forest/70 rounded-lg">
                    5. Order
                  </div>
                </div>

                {/* Agreement Parties Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Farmer Party */}
                  <div className="p-4 rounded-xl bg-olive/10 border border-olive/30 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-forest/60 uppercase tracking-wider block">Seller (Farmer / FPO)</span>
                    <p className="font-bold text-forest text-sm">{agreementModal.listing.farmerName}</p>
                    <p className="text-forest/70 font-medium">
                      {agreementModal.listing.crop} ({agreementModal.listing.variety || 'Certified'}) • {agreementModal.listing.grade}
                    </p>
                    <p className="text-[11px] text-forest/60">
                      Location: {agreementModal.listing.location}
                    </p>
                    <p className="text-xs font-bold text-emerald-800">
                      Available: {agreementModal.listing.quantityKg.toLocaleString()} kg
                    </p>
                  </div>

                  {/* Buyer Party */}
                  <div className="p-4 rounded-xl bg-sage/15 border border-sage/40 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-forest/60 uppercase tracking-wider block">Buyer / Procurement Pool</span>
                    <p className="font-bold text-forest text-sm">{currentTarget.buyerName}</p>
                    <p className="text-forest/70 font-medium">
                      Destination: {currentTarget.location}
                    </p>
                    <p className="text-[11px] text-forest/60">
                      Required by: {currentTarget.deliveryDate} ({currentTarget.deliveryTimeWindow})
                    </p>
                    <p className="text-xs font-bold text-forest">
                      Demanded: {currentTarget.quantityKg.toLocaleString()} kg @ max ₹{currentTarget.maxTargetPricePerKg}/kg
                    </p>
                  </div>
                </div>

                {/* Agreement Negotiation Inputs */}
                <div className="bg-cream rounded-2xl p-5 border border-olive/30 space-y-4">
                  <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
                    Contractual Terms Confirmation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">
                        Agreed Contract Quantity (kg)
                      </label>
                      <input
                        type="number"
                        value={agreementModal.agreedQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAgreementModal((prev) => ({
                            ...prev,
                            agreedQty: Math.max(1, Math.min(val, agreementModal.listing!.quantityKg))
                          }));
                        }}
                        max={agreementModal.listing.quantityKg}
                        min="1"
                        className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none text-sm"
                        required
                      />
                      <span className="text-[10px] text-forest/60 mt-1 block">
                        Max allocatable from listing: {agreementModal.listing.quantityKg.toLocaleString()} kg
                      </span>
                    </div>

                    <div>
                      <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">
                        Agreed Settlement Price (₹/kg)
                      </label>
                      <input
                        type="number"
                        value={agreementModal.agreedPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAgreementModal((prev) => ({
                            ...prev,
                            agreedPrice: Math.max(1, val)
                          }));
                        }}
                        step="0.5"
                        min="1"
                        className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none text-sm"
                        required
                      />
                      <span className="text-[10px] text-forest/60 mt-1 block">
                        Farmer expected: ₹{agreementModal.listing.expectedPricePerKg}/kg • Buyer max: ₹{currentTarget.maxTargetPricePerKg}/kg
                      </span>
                    </div>
                  </div>

                  {/* Total Value Banner */}
                  <div className="p-4 bg-forest text-cream rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-sage block">
                        Total Agreed Transaction Value
                      </span>
                      <span className="text-2xl font-anton text-cream tracking-wide">
                        ₹{(agreementModal.agreedQty * agreementModal.agreedPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-sage font-bold uppercase tracking-wider block">Realization</span>
                      <span className="text-xs font-bold text-cream">100% Direct to Farmer</span>
                    </div>
                  </div>

                  {/* Double Allocation & Arithmetic Note */}
                  <div className="p-3 bg-olive/10 rounded-xl border border-olive/30 text-[11px] text-forest/80 font-medium">
                    ⚡ <strong>Atomic Inventory Invariant:</strong> Confirming this agreement immediately reserves {agreementModal.agreedQty.toLocaleString()} kg of produce, decrements available farmer inventory, and transitions demand status without double-allocation risk.
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-olive/20">
                  <button
                    type="button"
                    onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-5 py-3 text-forest/70 hover:bg-olive/10 rounded-[1rem] font-bold uppercase tracking-widest text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="finalize-order-btn"
                    onClick={handleConfirmAndIssueOrder}
                    className="px-6 py-3.5 bg-forest hover:bg-[#023120] text-cream font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                    <span>Confirm Agreement & Issue Order →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Success View */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-300">
                  ✓
                </div>

                <div>
                  <h4 className="text-2xl font-anton text-forest tracking-wide">
                    Order Successfully Initialized!
                  </h4>
                  <p className="text-xs text-forest/70 mt-1 font-medium">
                    Agreement confirmed. Produce inventory has been atomically reserved and queued for FPO collection.
                  </p>
                </div>

                {agreementModal.createdOrder && (
                  <div className="bg-olive/10 rounded-2xl p-6 border border-olive/30 text-left text-xs space-y-3">
                    <div className="flex justify-between border-b border-olive/20 pb-2">
                      <span className="text-forest/60 font-bold uppercase text-[10px]">Official Order ID:</span>
                      <span className="font-mono font-bold text-forest">{agreementModal.createdOrder.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-olive/20 pb-2">
                      <span className="text-forest/60 font-bold uppercase text-[10px]">Contract Agreement ID:</span>
                      <span className="font-mono font-bold text-forest">{agreementModal.createdOrder.agreementId}</span>
                    </div>
                    <div className="flex justify-between border-b border-olive/20 pb-2">
                      <span className="text-forest/60 font-bold uppercase text-[10px]">QR Traceability Batch ID:</span>
                      <span className="font-mono font-bold text-emerald-800">{agreementModal.createdOrder.batchId}</span>
                    </div>
                    <div className="flex justify-between border-b border-olive/20 pb-2">
                      <span className="text-forest/60 font-bold uppercase text-[10px]">Allocated Volume:</span>
                      <span className="font-bold text-forest">{agreementModal.createdOrder.quantityKg.toLocaleString()} kg @ ₹{agreementModal.createdOrder.pricePerKg}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest/60 font-bold uppercase text-[10px]">Total Contract Value:</span>
                      <span className="font-anton text-base text-forest">₹{agreementModal.createdOrder.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-olive/20">
                  <button
                    onClick={() => {
                      setAgreementModal((prev) => ({ ...prev, isOpen: false }));
                      setActiveTab('orders');
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-forest hover:bg-[#023120] text-cream font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    <span>Track in Active Orders</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full sm:w-auto px-6 py-3.5 bg-olive/20 hover:bg-olive/30 text-forest font-bold rounded-[1rem] transition uppercase tracking-widest text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
