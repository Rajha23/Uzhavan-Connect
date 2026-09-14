import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ProduceListing, DemandRequest, AggregatedDemandGroup, WorkflowOrder } from '../types';
import confetti from 'canvas-confetti';
import { AiInsightCard } from './AiInsightCard';
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
  const { t, formatNumber } = useLanguage();

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
        <p className="text-sm font-semibold">{t('matching.noDemands', 'No active demands or aggregated pools available for matching.')}</p>
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
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0">
      {/* 1. Engine Header & Demand Target Selector */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('matching.badge', 'AI Dynamic Supply-Demand Matcher')}</span>
          </div>
          <h3 className="text-xl font-medium tracking-tight text-slate-900">
            {t('matching.title', 'Smart Matching & Allocation Engine')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('matching.subtitle', 'Evaluating real-time farmer produce listings against active buyer demands & aggregated groups.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Selector: Supports both Aggregated Groups and Individual Demands */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('matching.targetLabel', 'Target:')}</span>
            <select
              value={selectedTargetKey}
              onChange={(e) => {
                setSelectedTargetKey(e.target.value);
                setSelectedListingId('');
              }}
              aria-label="Target Demand or Aggregated Pool Selection"
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[280px] truncate"
            >
              {aggregatedDemandGroups.length > 0 && (
                <optgroup label={t('matching.aggregatedDemandPools', '📦 Aggregated Demand Pools')}>
                  {aggregatedDemandGroups.map((grp) => (
                    <option key={`group:${grp.id}`} value={`group:${grp.id}`}>
                      [Group] {grp.id}: {grp.crop} - {grp.region} ({grp.totalQuantityKg.toLocaleString()} kg from {grp.buyersCount} buyers)
                    </option>
                  ))}
                </optgroup>
              )}
              {demandRequests.length > 0 && (
                <optgroup label={t('matching.individualBuyerDemands', '🏢 Individual Buyer Demands')}>
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
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('matching.resetWeights', 'Reset Weights')}</span>
          </button>
        </div>
      </div>

      {/* Contextual AI Recommendation Banner */}
      <div className="px-6 pt-5">
        <AiInsightCard
          badgeText={t('matching.aiInsightBadge', '✦ AI Allocation Intelligence')}
          title={t('matching.aiInsightTitle', { crop: currentTarget.crop, targetType: currentTarget.isGroup ? 'Aggregated Pool' : 'Buyer Demand' }, `Multidimensional Compatibility Evaluation: ${currentTarget.crop} (${currentTarget.isGroup ? 'Aggregated Pool' : 'Buyer Demand'})`)}
          description={t('matching.aiInsightDesc', { qty: formatNumber(currentTarget.quantityKg), location: currentTarget.location, count: evaluatedCandidates.length }, `Analyzing active farmer supply listings against ${formatNumber(currentTarget.quantityKg)} kg target demand in ${currentTarget.location}. Evaluated ${evaluatedCandidates.length} eligible candidates across price equilibrium, distance corridors, quality grade conformance, and fulfillment capacity.`)}
          metrics={[
            { label: t('matching.targetRequirement', 'Target Requirement'), value: `${formatNumber(currentTarget.quantityKg)} kg` },
            { label: t('matching.maxTargetPrice', 'Max Target Price'), value: `₹${formatNumber(currentTarget.maxTargetPricePerKg)}/kg` },
            { label: t('matching.topCandidateScore', 'Top Candidate Score'), value: `${evaluatedCandidates[0]?.totalMatchScore || 0}%` },
            { label: t('matching.eligibleSuppliers', 'Eligible Suppliers'), value: `${evaluatedCandidates.length}` }
          ]}
        />
      </div>

      {/* 2. Factor Weights Slider Control Strip */}
      <div className="bg-slate-50/70 p-6 border-b border-slate-200 mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('matching.factorWeightings', 'Configurable Factor Weightings (Live Dynamic Recalculation)')}</span>
          </span>
          <span className="text-xs font-mono text-slate-500">{t('matching.sum', { sum: totalWeight }, `Sum: ${totalWeight}%`)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>{t('matching.price', 'Price:')}</span>
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
              <span>{t('matching.distance', 'Distance:')}</span>
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
              <span>{t('matching.quality', 'Quality:')}</span>
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
              <span>{t('matching.reliability', 'Reliability:')}</span>
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
              <span>{t('matching.capacity', 'Capacity:')}</span>
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
                <span className="text-xs bg-emerald-400 text-emerald-950 font-medium px-3.5 py-1 rounded-full uppercase tracking-wider">
                  {activeEvaluation.isEligible ? t('matching.eligibleMatched', 'Eligible / Matched') : t('matching.partialMatch', 'Partial Match')}
                </span>
                <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('matching.liveEvaluation', 'Live Supply-Demand Evaluation')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-normal pt-1">
                {t('matching.evaluatingFarmerSupply', 'Evaluating Farmer Supply:')} <span className="font-mono text-white font-medium">{evaluatedListing.id} ({evaluatedListing.farmerName})</span> {t('matching.againstTarget', 'against Target:')} <span className="font-mono text-white font-medium">{currentTarget.id}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 self-start sm:self-auto">
              <span className="text-xs text-emerald-300 font-medium">{t('matching.matchScore', 'Match Score:')}</span>
              <span className="text-3xl font-semibold font-mono text-emerald-300">
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
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                    {t('matching.farmerSupplyDetails', 'FARMER SUPPLY DETAILS')}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 font-mono font-medium">
                  {evaluatedListing.farmerName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.cropAndVariety', 'Crop & Variety:')}</span>
                  <span className="font-medium text-white text-sm">
                    {evaluatedListing.crop} {evaluatedListing.variety ? `(${evaluatedListing.variety})` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.availableSupply', 'Available Supply:')}</span>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${evaluatedListing.quantityKg > 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {formatNumber(evaluatedListing.quantityKg)} {evaluatedListing.unit || 'kg'}
                    </span>
                    {evaluatedListing.allocatedQuantityKg && evaluatedListing.allocatedQuantityKg > 0 ? (
                      <span className="block text-[10px] text-emerald-200/70">
                        {t('matching.allocatedInfo', { qty: formatNumber(evaluatedListing.allocatedQuantityKg), unit: evaluatedListing.unit || 'kg' }, `(${formatNumber(evaluatedListing.allocatedQuantityKg)} ${evaluatedListing.unit || 'kg'} allocated)`)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.qualityGrade', 'Quality Grade:')}</span>
                  <span className="font-medium text-white">{evaluatedListing.grade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.farmLocation', 'Farm Location:')}</span>
                  <span className="font-medium text-white">{evaluatedListing.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.expectedPrice', 'Expected Price:')}</span>
                  <span className="font-medium text-emerald-300 text-sm">₹{formatNumber(evaluatedListing.expectedPricePerKg)}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.harvestReadyDate', 'Harvest / Ready Date:')}</span>
                  <span className="font-medium text-white">{evaluatedListing.harvestDate || evaluatedListing.availabilityDate}</span>
                </div>
                {evaluatedListing.fpoName && (
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-200/80">{t('matching.affiliatedFpo', 'Affiliated FPO:')}</span>
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
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                    {currentTarget.isGroup ? t('matching.aggregatedPoolDetails', 'AGGREGATED POOL DETAILS') : t('matching.buyerDemandDetails', 'BUYER DEMAND DETAILS')}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-200/80 font-mono font-medium truncate max-w-[180px]">
                  {currentTarget.buyerName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.commodityAndVariety', 'Commodity & Variety:')}</span>
                  <span className="font-medium text-white text-sm">
                    {currentTarget.crop} ({currentTarget.variety || 'Commercial Grade'})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.targetDemandedQty', 'Target Demanded Qty:')}</span>
                  <span className="font-medium text-emerald-300 text-sm">
                    {formatNumber(currentTarget.quantityKg)} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.requiredGrade', 'Required Grade:')}</span>
                  <span className="font-medium text-white">{currentTarget.qualityRequirement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.deliveryDestination', 'Delivery Destination / Corridor:')}</span>
                  <span className="font-medium text-white">{currentTarget.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.ceilingTargetPrice', 'Ceiling Target Price:')}</span>
                  <span className="font-medium text-emerald-300 text-sm">₹{formatNumber(currentTarget.maxTargetPricePerKg)}/kg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-emerald-200/80">{t('matching.deliveryDateAndWindow', 'Delivery Date & Window:')}</span>
                  <span className="font-medium text-white">{currentTarget.deliveryDate} ({currentTarget.deliveryTimeWindow})</span>
                </div>
                {currentTarget.isGroup && (
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-200/80">{t('matching.contributingDemands', 'Contributing Demands:')}</span>
                    <span className="font-medium text-emerald-200">{t('matching.buyersPooled', { count: currentTarget.contributingDemands?.length || 1 }, `${currentTarget.contributingDemands?.length || 1} buyers pooled`)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PARTIAL MATCH TRANSPARENCY & ARITHMETIC BANNER */}
          <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('matching.volumeContribution', 'Volume Contribution & Allocation Arithmetic')}</span>
              </span>
              <span className="font-mono font-medium text-emerald-300">
                {t('matching.allocatedSummary', { contribKg: formatNumber(contribKg), contribPct, targetKg: formatNumber(currentTarget.quantityKg) }, `${formatNumber(contribKg)} kg allocated (${contribPct}% of ${formatNumber(currentTarget.quantityKg)} kg)`)}
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
                  {t('matching.partialMatchNote', { farmerQty: formatNumber(evaluatedListing.quantityKg), targetQty: formatNumber(currentTarget.quantityKg), contribKg: formatNumber(contribKg), remainingKg: formatNumber(currentTarget.quantityKg - contribKg) }, `⚡ Partial Match: Farmer supply offers ${formatNumber(evaluatedListing.quantityKg)} kg against the total demand of ${formatNumber(currentTarget.quantityKg)} kg. Once agreed, ${formatNumber(contribKg)} kg will be allocated; the remaining ${formatNumber(currentTarget.quantityKg - contribKg)} kg will remain open for further supplier allocation.`)}
                </p>
              ) : (
                <p>
                  {t('matching.fullMatchNote', { farmerQty: formatNumber(evaluatedListing.quantityKg), targetQty: formatNumber(currentTarget.quantityKg), remainingKg: formatNumber(evaluatedListing.quantityKg - contribKg) }, `✓ Full Match: Farmer listing offers ${formatNumber(evaluatedListing.quantityKg)} kg which satisfies 100% of this ${formatNumber(currentTarget.quantityKg)} kg demand. The remaining ${formatNumber(evaluatedListing.quantityKg - contribKg)} kg stays available for other buyer requests.`)}
                </p>
              )}
            </div>
          </div>

          {/* MATCH EXPLANATION CHECKLIST */}
          <div className="pt-4 border-t border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-200 uppercase tracking-wider">
                {t('matching.matchExplanationBreakdown', 'MATCH EXPLANATION BREAKDOWN')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('matching.cropMatches', { crop: evaluatedListing.crop }, `Crop matches (${evaluatedListing.crop})`)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('matching.qualityCompatible', { grade: evaluatedListing.grade, req: currentTarget.qualityRequirement }, `Quality requirement compatible (${evaluatedListing.grade} satisfies ${currentTarget.qualityRequirement})`)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('matching.volumeContributionText', { contribKg: formatNumber(contribKg), contribPct }, `Volume contribution (${formatNumber(contribKg)} kg satisfies ${contribPct}% of need)`)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {t('matching.priceAdvantage', { expectedPrice: formatNumber(evaluatedListing.expectedPricePerKg), maxPrice: formatNumber(currentTarget.maxTargetPricePerKg) }, `Price advantage: ₹${formatNumber(evaluatedListing.expectedPricePerKg)}/kg ≤ max ₹${formatNumber(currentTarget.maxTargetPricePerKg)}/kg`)}
                    {priceSavings > 0 ? t('matching.buyerSavings', { savings: formatNumber(priceSavings) }, ` (₹${formatNumber(priceSavings)}/kg buyer savings)`) : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('matching.regionalCorridor', { from: evaluatedListing.location, to: currentTarget.location, km: activeEvaluation.distanceKm }, `Regional corridor route: ${evaluatedListing.location} → ${currentTarget.location} (~${activeEvaluation.distanceKm} km)`)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('matching.deliveryAligned', { date: currentTarget.deliveryDate, time: currentTarget.deliveryTimeWindow }, `Delivery aligned for ${currentTarget.deliveryDate} (${currentTarget.deliveryTimeWindow})`)}</span>
                </span>
              </div>
            </div>

            <button
              data-testid="confirm-allocate-btn"
              disabled={evaluatedListing.quantityKg <= 0 || allocatedId === evaluatedListing.id}
              onClick={() => handleOpenAgreementModal(evaluatedListing)}
              className={`px-6 py-3.5 rounded-xl text-xs font-medium transition shadow-sm self-start md:self-auto uppercase tracking-wider whitespace-nowrap flex items-center gap-2 ${
                evaluatedListing.quantityKg <= 0
                  ? 'bg-slate-700/80 text-slate-300 cursor-not-allowed'
                  : allocatedId === evaluatedListing.id
                  ? 'bg-emerald-400 text-emerald-950 cursor-default'
                  : 'bg-white text-emerald-950 hover:bg-emerald-100 cursor-pointer'
              }`}
            >
              {evaluatedListing.quantityKg <= 0 ? (
                <span>{t('matching.fullyAllocated0Kg', 'Fully Allocated (0 kg Available)')}</span>
              ) : allocatedId === evaluatedListing.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                  <span>{t('matching.allocatedToDemand', 'Allocated to Demand')}</span>
                </>
              ) : (
                <>
                  <span>{t('matching.confirmMatchAndAgreement', 'Confirm Match & Agreement →')}</span>
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
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-semibold">
              ✓
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-900">
                {t('matching.orderCreatedSuccess', { id: createdOrderNotice.id }, `Match Agreement Finalized & Order Created: ${createdOrderNotice.id}`)}
              </p>
              <p className="text-[11px] text-emerald-700">
                {t('matching.orderCreatedDesc', { qty: formatNumber(createdOrderNotice.qty), crop: createdOrderNotice.crop, price: formatNumber(createdOrderNotice.price) }, `${formatNumber(createdOrderNotice.qty)} kg of ${createdOrderNotice.crop} @ ₹${formatNumber(createdOrderNotice.price)}/kg reserved. Produce collection queued for FPO Aggregator.`)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span>{t('matching.trackInOrders', 'Track in Orders')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}


      {/* 4. Ranked Supplier Candidates List */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-slate-900">
              {t('matching.rankedCandidatesTitle', { count: evaluatedCandidates.length }, `Ranked Farmer & FPO Candidates (${evaluatedCandidates.length})`)}
            </h4>
            <p className="text-xs text-slate-500">
              {t('matching.evaluatedAgainstTarget', { crop: currentTarget.crop, qty: formatNumber(currentTarget.quantityKg), price: formatNumber(currentTarget.maxTargetPricePerKg) }, `Evaluated against Target Demand: ${currentTarget.crop} (${formatNumber(currentTarget.quantityKg)} kg @ ₹${formatNumber(currentTarget.maxTargetPricePerKg)}/kg)`)}
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{t('matching.liveMultiFactorRanking', 'Live multi-factor ranking')}</span>
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
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-base shrink-0 ${
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
                        <h4 className="font-medium text-slate-900 text-sm">
                          {candidate.listing.farmerName}
                        </h4>
                        {isTopRanked && candidate.cropMatch && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-300 uppercase tracking-wider">
                            {t('matching.optimalMatch', 'OPTIMAL MATCH')}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] bg-slate-900 text-white font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                            {t('matching.evaluating', 'Evaluating')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        <strong className="text-slate-900">{candidate.listing.crop}</strong>
                        {candidate.listing.variety && <span className="text-slate-500 font-medium"> ({candidate.listing.variety})</span>} • {t('matching.availableSupply', 'Available Supply:')}{' '}
                        <strong className={candidate.listing.quantityKg > 0 ? "text-emerald-700" : "text-slate-400 font-mono"}>
                          {formatNumber(candidate.listing.quantityKg)} {candidate.listing.unit || 'kg'}
                        </strong>
                        {candidate.listing.quantityKg <= 0 ? (
                          <span className="ml-1 text-[10px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            {t('matching.fullyAllocated', 'Fully Allocated')}
                          </span>
                        ) : candidate.listing.allocatedQuantityKg && candidate.listing.allocatedQuantityKg > 0 ? (
                          <span className="text-[11px] text-slate-500 ml-1">
                            {t('matching.allocatedInfo', { qty: formatNumber(candidate.listing.allocatedQuantityKg), unit: candidate.listing.unit || 'kg' }, `(${formatNumber(candidate.listing.allocatedQuantityKg)} ${candidate.listing.unit || 'kg'} allocated)`)}
                          </span>
                        ) : null}
                        {' '}• {t('matching.qualityGrade', 'Quality Grade:')} <strong className="text-slate-900">{candidate.listing.grade}</strong> • {t('matching.expectedPrice', 'Expected Price:')}{' '}
                        <strong className="text-slate-900">₹{formatNumber(candidate.listing.expectedPricePerKg)}/kg</strong> • {candidate.listing.location} (~{candidate.distanceKm} km)
                        {candidate.listing.fpoName && (
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            {t('matching.affiliatedFpo', 'Affiliated FPO:')} <strong>{candidate.listing.fpoName}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Score & Action */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        {t('matching.matchScore', 'Match Score:')}
                      </span>
                      <span className="text-2xl font-semibold text-emerald-700 font-mono">
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
                        <span>{t('matching.fullyAllocated', 'Fully Allocated')}</span>
                      ) : isAllocated ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>{t('matching.allocatedToDemand', 'Allocated')}</span>
                        </>
                      ) : (
                        <span>{t('matching.selectAndAllocate', 'Select & Allocate')}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-Score Progress Bars Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>{t('matching.price', 'Price:')} (₹{formatNumber(candidate.listing.expectedPricePerKg)}/kg):</span>
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
                      <span>{t('matching.distance', 'Distance:')} ({candidate.distanceKm} km):</span>
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
                      <span>{t('matching.quality', 'Quality:')} ({candidate.listing.grade}):</span>
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
                      <span>{t('matching.reliability', 'Reliability:')}</span>
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
                      <span>{t('matching.capacity', 'Capacity:')} ({formatNumber(candidate.listing.quantityKg)}kg):</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-700" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                    {agreementModal.step === 'TERMS' ? t('matching.modalTitleTerms', 'Digital Match Agreement & Order Initiation') : t('matching.modalTitleConfirmed', 'Match Confirmed & Order Created')}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {agreementModal.step === 'TERMS'
                      ? t('matching.modalSubTerms', 'Connected Transaction Lifecycle (Step 3: Matching → Step 4: Agreement → Step 5: Order)')
                      : t('matching.modalSubConfirmed', 'Produce allocated and scheduled for FPO collection.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-700 transition font-medium text-lg cursor-pointer"
                aria-label={t('modals.close', 'Close Window')}
              >
                ✕
              </button>
            </div>

            {agreementModal.step === 'TERMS' ? (
              <div className="space-y-6">
                {/* 5-Step Lifecycle Progress Tracker */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-medium uppercase tracking-wider">
                  <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                    {t('matching.stepMatch', '1. Match')}
                  </div>
                  <div className="p-2 bg-emerald-700 text-white rounded-lg font-medium shadow-xs">
                    {t('matching.stepAgreement', '2. Agreement')}
                  </div>
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    {t('matching.stepQuantities', '3. Quantities')}
                  </div>
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    {t('matching.stepPrice', '4. Price')}
                  </div>
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                    {t('matching.stepOrder', '5. Order')}
                  </div>
                </div>

                {/* Agreement Parties Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Farmer Party */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{t('matching.sellerFarmerFpo', 'Seller (Farmer / FPO)')}</span>
                    <p className="font-medium text-slate-900 text-sm">{agreementModal.listing.farmerName}</p>
                    <p className="text-slate-600 font-medium">
                      {agreementModal.listing.crop} ({agreementModal.listing.variety || 'Certified'}) • {agreementModal.listing.grade}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t('matching.farmLocation', 'Location:')} {agreementModal.listing.location}
                    </p>
                    <p className="text-xs font-semibold text-emerald-800">
                      {t('matching.availableSupply', 'Available:')} {formatNumber(agreementModal.listing.quantityKg)} kg
                    </p>
                  </div>

                  {/* Buyer Party */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2 text-xs">
                    <span className="text-[10px] font-medium text-emerald-800 uppercase tracking-wider block">{t('matching.buyerProcurementPool', 'Buyer / Procurement Pool')}</span>
                    <p className="font-medium text-slate-900 text-sm">{currentTarget.buyerName}</p>
                    <p className="text-slate-600 font-medium">
                      {t('matching.deliveryDestination', 'Destination:')} {currentTarget.location}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t('matching.deliveryDateAndWindow', 'Required by:')} {currentTarget.deliveryDate} ({currentTarget.deliveryTimeWindow})
                    </p>
                    <p className="text-xs font-semibold text-emerald-800">
                      {t('matching.targetDemandedQty', 'Demanded:')} {formatNumber(currentTarget.quantityKg)} kg @ max ₹{formatNumber(currentTarget.maxTargetPricePerKg)}/kg
                    </p>
                  </div>
                </div>

                {/* Agreement Negotiation Inputs */}
                <div className="bg-white/95 rounded-2xl p-5 border border-emerald-900/10 shadow-2xs space-y-4">
                  <h4 className="text-xs font-medium text-slate-900 uppercase tracking-wider">
                    {t('matching.contractualTermsConfirmation', 'Contractual Terms Confirmation')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">
                        {t('matching.agreedContractQty', 'Agreed Contract Quantity (kg)')}
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
                        max={Math.min(agreementModal.listing.quantityKg, currentTarget.quantityKg || agreementModal.listing.quantityKg)}
                        min="1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none text-sm"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('matching.maxAvailableNote', { avail: formatNumber(agreementModal.listing.quantityKg), needs: formatNumber(currentTarget.quantityKg || agreementModal.listing.quantityKg) }, `Max available: ${formatNumber(agreementModal.listing.quantityKg)} kg • Buyer needs: ${formatNumber(currentTarget.quantityKg || agreementModal.listing.quantityKg)} kg`)}
                      </span>
                    </div>

                    {/* Agreed Price */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t('matching.agreedContractPrice', 'Agreed Contract Price (₹/kg)')}</label>
                      <input
                        type="number"
                        data-testid="agreement-price-input"
                        value={agreementModal.agreedPrice}
                        onChange={(e) => setAgreementModal((prev) => ({ ...prev, agreedPrice: Number(e.target.value) || 0 }))}
                        min="1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none text-sm"
                        required
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {t('matching.farmerExpectedNote', { expected: formatNumber(agreementModal.listing.expectedPricePerKg), max: formatNumber(currentTarget.maxTargetPricePerKg) }, `Farmer expected: ₹${formatNumber(agreementModal.listing.expectedPricePerKg)}/kg • Buyer max: ₹${formatNumber(currentTarget.maxTargetPricePerKg)}/kg`)}
                      </span>
                    </div>
                  </div>

                  {/* Total Value Banner */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase font-medium tracking-wider text-emerald-400 block">
                        {t('matching.totalAgreedValue', 'Total Agreed Transaction Value')}
                      </span>
                      <span className="text-2xl font-semibold text-white tracking-tight">
                        ₹{formatNumber(agreementModal.agreedQty * agreementModal.agreedPrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider block">{t('matching.realization', 'Realization')}</span>
                      <span className="text-xs font-medium text-emerald-300">{t('matching.directToFarmer', '100% Direct to Farmer')}</span>
                    </div>
                  </div>

                  {/* Double Allocation & Arithmetic Note */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-normal">
                    {t('matching.atomicInvariant', { qty: formatNumber(agreementModal.agreedQty) }, `⚡ Atomic Inventory Invariant: Confirming this agreement immediately reserves ${formatNumber(agreementModal.agreedQty)} kg of produce, decrements available farmer inventory, and transitions demand status without double-allocation risk.`)}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium uppercase tracking-wider text-xs transition cursor-pointer"
                  >
                    {t('modals.cancel', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    data-testid="finalize-order-btn"
                    onClick={handleConfirmAndIssueOrder}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-xl shadow-xs transition uppercase tracking-wider text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('matching.confirmAgreementAndIssueOrder', 'Confirm Agreement & Issue Order →')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Success View */
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl font-medium border border-emerald-300">
                  ✓
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-slate-900 tracking-tight">
                    {t('matching.orderSuccessTitle', 'Order Successfully Initialized!')}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    {t('matching.orderSuccessDesc', 'Agreement confirmed. Produce inventory has been atomically reserved and queued for FPO collection.')}
                  </p>
                </div>

                {agreementModal.createdOrder && (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left text-xs space-y-2.5">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium uppercase text-[10px]">{t('matching.officialOrderId', 'Official Order ID:')}</span>
                      <span className="font-mono font-medium text-slate-900">{agreementModal.createdOrder.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium uppercase text-[10px]">{t('matching.contractAgreementId', 'Contract Agreement ID:')}</span>
                      <span className="font-mono font-medium text-slate-900">{agreementModal.createdOrder.agreementId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium uppercase text-[10px]">{t('matching.qrTraceabilityBatchId', 'QR Traceability Batch ID:')}</span>
                      <span className="font-mono font-medium text-emerald-700">{agreementModal.createdOrder.batchId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium uppercase text-[10px]">{t('matching.allocatedVolume', 'Allocated Volume:')}</span>
                      <span className="font-medium text-slate-900">{formatNumber(agreementModal.createdOrder.quantityKg)} kg @ ₹{formatNumber(agreementModal.createdOrder.pricePerKg)}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium uppercase text-[10px]">{t('matching.totalContractValue', 'Total Contract Value:')}</span>
                      <span className="font-semibold text-base text-slate-900 tracking-tight">₹{formatNumber(agreementModal.createdOrder.totalValue)}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setAgreementModal((prev) => ({ ...prev, isOpen: false }));
                      setActiveTab('orders');
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('matching.trackInActiveOrders', 'Track in Active Orders')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAgreementModal((prev) => ({ ...prev, isOpen: false }))}
                    className="btn-secondary text-xs"
                  >
                    {t('modals.done', 'Done')}
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
