import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_AUCTION_OFFERS } from '../data/mockData';
import { ReverseAuctionOffer, WorkflowOrder } from '../types';
import { SmartMatchingEngine } from '../components/SmartMatchingEngine';
import {
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Award,
  Building2,
  Users,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReverseAuctionPage: React.FC = () => {
  const { t, formatNumber } = useLanguage();
  const { setActiveTab, addOrder, addNotificationEvent, currentUser } = useApp();

  const [offers, setOffers] = useState<ReverseAuctionOffer[]>(INITIAL_AUCTION_OFFERS);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [acceptedBannerInfo, setAcceptedBannerInfo] = useState<{ fpoName: string; quantityKg: number; pricePerKg: number } | null>(null);

  // New bid form state
  const [fpoName, setFpoName] = useState('Chengalpattu Organic Growers');
  const [quantityKg, setQuantityKg] = useState<number>(3000);
  const [pricePerKg, setPricePerKg] = useState<number>(26.0);
  const [grade, setGrade] = useState<'Grade A' | 'Grade B'>('Grade A');
  const [distanceKm, setDistanceKm] = useState<number>(40);
  const [reliabilityScore, setReliabilityScore] = useState<number>(90);

  const handleAcceptOffer = (id: string) => {
    // If an offer is already being accepted/redirected, avoid duplicate calls
    if (acceptingOfferId) return;

    // Find the target offer
    const targetOffer = offers.find((o) => o.id === id) || offers[0];
    if (!targetOffer) return;

    // 1. Immediately show ACCEPTED on button with celebratory confetti
    setAcceptingOfferId(targetOffer.id);
    setOffers((currentOffers) =>
      currentOffers.map((offer) =>
        offer.id === targetOffer.id ? { ...offer, status: 'ACCEPTED' } : offer
      )
    );
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    setAcceptedBannerInfo({
      fpoName: targetOffer.fpoName,
      quantityKg: targetOffer.quantityKg,
      pricePerKg: targetOffer.pricePerKg
    });

    // 2. After showing accepted feedback, remove the offer, generate platform order, and redirect to orders!
    setTimeout(() => {
      const orderId = `ORD-AUC-${Date.now().toString().slice(-5)}`;
      const batchId = `AGP-AUC-${Date.now().toString().slice(-4)}`;
      const totalVal = targetOffer.quantityKg * targetOffer.pricePerKg;

      const newOrder: WorkflowOrder = {
        id: orderId,
        produceListingId: `lst-${targetOffer.fpoId || 'fpo'}`,
        demandRequestId: targetOffer.auctionId || 'AUC-CH-TOM-3000',
        batchId: batchId,
        farmerId: targetOffer.fpoId || 'fpo-01',
        farmerName: targetOffer.fpoName,
        fpoName: targetOffer.fpoName,
        buyerId: currentUser?.id || 'buyer-dem-01',
        buyerName: currentUser?.role === 'FPO_AGGREGATOR' ? 'Chennai Distribution Terminal' : (currentUser?.name || 'Chennai Wholesale Terminal'),
        crop: 'Tomato',
        variety: 'Commercial Hybrid Grade A',
        quantityKg: targetOffer.quantityKg,
        pricePerKg: targetOffer.pricePerKg,
        totalValue: totalVal,
        status: 'Confirmed',
        date: new Date().toISOString().slice(0, 10),
        deliveryLocation: 'Chennai Distribution Terminal',
        farmerLocation: `${targetOffer.estimatedTransportKm} km Corridor Hub`,
        qualityGrade: (targetOffer.grade as any) || 'Grade A',
        timeline: [
          {
            step: 'ACCEPTED',
            title: 'Reverse Auction Offer Accepted',
            location: targetOffer.fpoName,
            timestamp: 'Just now',
            operator: currentUser?.name || 'Procurement Officer',
            completed: true,
            notes: `Accepted at ₹${targetOffer.pricePerKg}/kg (${targetOffer.quantityKg.toLocaleString()} kg)`
          },
          {
            step: 'CONTRACT',
            title: 'Digital Purchase Agreement Generated',
            location: 'Uzhavan Connect Network',
            timestamp: 'Just now',
            operator: 'Smart Contract Engine',
            completed: true
          },
          {
            step: 'COLLECTION',
            title: 'FPO Aggregation & Dispatch Scheduling',
            location: `${targetOffer.fpoName} Center`,
            timestamp: targetOffer.readinessDate,
            operator: 'FPO Operations Desk',
            completed: false
          }
        ]
      };

      // Add to platform orders
      addOrder(newOrder);

      // Notify platform users
      addNotificationEvent({
        title: `🎉 Auction Order Confirmed: ${orderId}`,
        message: `Accepted offer from ${targetOffer.fpoName} for ${targetOffer.quantityKg.toLocaleString()} kg of Tomato @ ₹${targetOffer.pricePerKg}/kg.`,
        targetRole: 'ALL',
        type: 'ORDERS',
        priority: 'SUCCESS',
        actionTab: 'orders',
        actionLabel: 'View Order'
      });

      // Remove the accepted offer from active list
      setOffers((prev) => prev.filter((o) => o.id !== targetOffer.id));
      setAcceptingOfferId(null);
      setAcceptedBannerInfo(null);

      // Redirect to Orders tab
      setActiveTab('orders');
    }, 950);
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: ReverseAuctionOffer = {
      id: `OFF-${Date.now().toString().slice(-3)}`,
      auctionId: 'AUC-CH-TOM-3000',
      fpoId: `fpo-${Date.now()}`,
      fpoName,
      quantityKg: Number(quantityKg),
      pricePerKg: Number(pricePerKg),
      grade,
      readinessDate: '2026-09-07 (05:00 PM)',
      estimatedTransportKm: Number(distanceKm),
      reliabilityScore: Number(reliabilityScore),
      capacityScore: 90,
      matchScore: Number((85 + Math.random() * 8).toFixed(1)),
      status: 'SUBMITTED'
    };

    setOffers([newOffer, ...offers]);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Acceptance Status Redirect Banner */}
      {acceptedBannerInfo && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-200 border border-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Offer Accepted from {acceptedBannerInfo.fpoName}!
              </p>
              <p className="text-[11px] text-emerald-100">
                Confirmed {formatNumber(acceptedBannerInfo.quantityKg)} kg @ ₹{acceptedBannerInfo.pricePerKg.toFixed(2)}/kg. Creating order and redirecting to Orders...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span className="text-[11px] font-medium text-emerald-100">Redirecting...</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <Gavel className="w-4 h-4 text-emerald-400" />
            <span>{t('reverseAuction.demandBackedAuction', undefined, 'Demand-Backed Procurement Auction • Live Bidding')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {t('reverseAuction.title', undefined, 'Reverse Auction & Smart Allocation')}
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
            {t('reverseAuction.lotSummary', undefined, 'Lot: 3,000 kg Tomato (Grade A) • Chennai Corridor. FPOs submit competitive transparent bids. Ranks by multi-factor Smart Match Score rather than crude lowest price.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>{t('reverseAuction.submitBid', undefined, 'Submit FPO Bid')}</span>
          </button>

          <button
            onClick={() => setActiveTab('middleman-sim')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition uppercase tracking-wider"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>{t('reverseAuction.inspectRealization', undefined, 'Inspect Net Realization')}</span>
          </button>
        </div>
      </div>

      {/* Reverse Auction Workflow Process */}
      <div className="bg-white/95 rounded-2xl border border-emerald-900/10 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
              {t('reverseAuction.workflowTitle', undefined, 'Auction Protocol Workflow')}
            </span>
            <h3 className="text-xl font-medium tracking-tight text-slate-900 mt-3">
              {t('reverseAuction.endToEndFlow', undefined, 'End-to-End Reverse Auction Flow')}
            </h3>
          </div>

          {/* Status Indicators: OPEN, CLOSING SOON, CLOSED */}
          <div className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-wider">
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {t('reverseAuction.statusOpen', undefined, 'OPEN')}
            </span>
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {t('reverseAuction.statusClosingSoon', undefined, 'CLOSING SOON')}
            </span>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
              {t('reverseAuction.statusClosed', undefined, 'CLOSED')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step1', undefined, 'STEP 1')}</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#01472e] flex items-center justify-center mb-1.5 shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-800">{t('reverseAuction.step1Desc', undefined, 'Buyer creates demand')}</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step2', undefined, 'STEP 2')}</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#01472e] flex items-center justify-center mb-1.5 shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-800">{t('reverseAuction.step2Desc', undefined, 'Farmers/FPOs receive')}</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step3', undefined, 'STEP 3')}</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#01472e] flex items-center justify-center mb-1.5 shadow-2xs">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-800">{t('reverseAuction.step3Desc', undefined, 'Submit prices')}</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step4', undefined, 'STEP 4')}</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#01472e] flex items-center justify-center mb-1.5 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-800">{t('reverseAuction.step4Desc', undefined, 'Compare offers')}</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col items-center">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step5', undefined, 'STEP 5')}</span>
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#01472e] flex items-center justify-center mb-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-800">{t('reverseAuction.step5Desc', undefined, 'Select suitable offer')}</span>
          </div>
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-300/80 shadow-2xs transform hover:-translate-y-0.5 transition flex flex-col items-center">
            <span className="text-[9px] text-emerald-800 font-medium uppercase tracking-wider block mb-1">{t('reverseAuction.step6', undefined, 'STEP 6')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-medium text-emerald-900">{t('reverseAuction.step6Desc', undefined, 'Order confirmed')}</span>
          </div>
        </div>
      </div>

      {/* Featured Example Card: OPEN AUCTION Tomato 3,000 kg */}
      <div className="bg-white rounded-2xl border border-emerald-300 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-medium px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                {t('reverseAuction.openAuctionBadge', undefined, 'OPEN AUCTION')}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">ID: AUC-CH-TOM-3000</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mt-3 tracking-tight">
              {t('reverseAuction.tomatoLotTitle', undefined, 'Tomato • Required: 3,000 kg')}
            </h3>
            <p className="text-sm text-slate-600 font-normal mt-1">{t('reverseAuction.tomatoLotSubtitle', undefined, 'Destination: Chennai Distribution Terminal • Max Price: ₹28.00/kg')}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptOffer(offers[0]?.id || 'OFF-TN-01')}
              disabled={acceptingOfferId !== null}
              className={`px-5 py-2.5 font-medium text-xs rounded-xl shadow-xs transition uppercase tracking-wider cursor-pointer ${
                acceptingOfferId
                  ? 'bg-emerald-600 text-white flex items-center gap-1.5'
                  : 'bg-slate-900 hover:bg-emerald-950 text-white'
              }`}
            >
              {acceptingOfferId ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('reverseAuction.accepted', undefined, 'Accepted')}</span>
                </>
              ) : (
                t('reverseAuction.acceptOffer', undefined, 'Accept Offer')
              )}
            </button>
          </div>
        </div>

        {/* 3 Prompt Offers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 text-xs uppercase tracking-wider">Farmer A (Kanchipuram)</p>
              <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider block mt-1">{t('reverseAuction.standardGrade', undefined, 'Standard Grade')}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-slate-900 tracking-tight">₹27 <span className="text-xs font-normal text-slate-500">/ {t('common.kg', undefined, 'kg')}</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-TN-04')}
                disabled={acceptingOfferId !== null}
                className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1 hover:text-slate-900 transition cursor-pointer"
              >
                {acceptingOfferId === 'OFF-TN-04' ? '✓ Accepted' : t('reverseAuction.selectOffer', undefined, 'Select Offer')}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 text-xs uppercase tracking-wider">Farmer B (Tiruvallur)</p>
              <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider block mt-1">{t('reverseAuction.standardGrade', undefined, 'Standard Grade')}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-slate-900 tracking-tight">₹26 <span className="text-xs font-normal text-slate-500">/ {t('common.kg', undefined, 'kg')}</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-TN-03')}
                disabled={acceptingOfferId !== null}
                className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1 hover:text-slate-900 transition cursor-pointer"
              >
                {acceptingOfferId === 'OFF-TN-03' ? '✓ Accepted' : t('reverseAuction.selectOffer', undefined, 'Select Offer')}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-300 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-emerald-950 text-xs uppercase tracking-wider">GreenHarvest FPO</p>
                <span className="text-[9px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded-full">{t('reverseAuction.bestBadge', undefined, 'BEST')}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-normal uppercase tracking-wider block mt-1">{t('reverseAuction.gradeACertified', undefined, 'Grade A Certified')}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-emerald-900 tracking-tight">₹25 <span className="text-xs font-normal text-emerald-700">/ {t('common.kg', undefined, 'kg')}</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-TN-01')}
                disabled={acceptingOfferId !== null}
                className="text-[10px] text-emerald-800 font-medium uppercase tracking-wider block mt-1 hover:opacity-80 transition cursor-pointer"
              >
                {acceptingOfferId === 'OFF-TN-01' ? '✓ Accepted' : t('reverseAuction.viewOffers', undefined, 'Accept Offer →')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Smart Matching Engine Component */}
      <SmartMatchingEngine />

      {/* Live FPO Offers Table */}
      <div className="bg-white/95 rounded-2xl border border-emerald-900/10 shadow-xs overflow-hidden mt-8">
        <div className="p-6 sm:p-7 border-b border-emerald-900/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium tracking-tight text-slate-900">
              {t('reverseAuction.submittedBidsCount', { count: offers.length }, `Submitted FPO Auction Bids (${offers.length})`)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">{t('reverseAuction.sortedBySmartMatch', undefined, 'Sorted by Smart Match Score combining price, distance, and historical fulfillment')}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-50/40 border-b border-emerald-900/10 text-slate-600 font-medium uppercase tracking-wider text-[11px]">
                <th className="p-4 sm:p-5">{t('reverseAuction.colFpo', undefined, 'FPO / Collective')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colQuantity', undefined, 'Quantity')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colPrice', undefined, 'Price / kg')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colGrade', undefined, 'Quality Grade')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colDistance', undefined, 'Distance')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colReliability', undefined, 'Reliability')}</th>
                <th className="p-4 sm:p-5">{t('reverseAuction.colSmartScore', undefined, 'Smart Match Score')}</th>
                <th className="p-4 sm:p-5 text-right">{t('reverseAuction.colAction', undefined, 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => {
                const isAccepted = offer.status === 'ACCEPTED' || offer.id === acceptingOfferId;

                return (
                  <tr key={offer.id} className="hover:bg-emerald-50/30 transition">
                    <td className="p-5">
                      <span className="font-medium text-slate-900 block">{offer.fpoName}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-normal mt-1 block">{t('reverseAuction.readyPrefix', undefined, 'Ready:')} {offer.readinessDate}</span>
                    </td>
                    <td className="p-5 font-medium text-slate-800">
                      {formatNumber(offer.quantityKg)} {t('common.kg', undefined, 'kg')}
                    </td>
                    <td className="p-5 font-semibold text-slate-900 text-base tracking-tight">
                      ₹{offer.pricePerKg.toFixed(2)}
                    </td>
                    <td className="p-5">
                      <span className="bg-emerald-50 text-emerald-800 font-medium px-3 py-1 rounded-full text-[10px] border border-emerald-200 uppercase tracking-wider">
                        {offer.grade}
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 font-normal text-xs">
                      {offer.estimatedTransportKm} km
                    </td>
                    <td className="p-5 font-medium text-slate-700 text-xs">
                      {offer.reliabilityScore}%
                    </td>
                    <td className="p-5">
                      <span className="text-xl font-semibold text-slate-900 tracking-tight">
                        {offer.matchScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider ml-1"> / 100</span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={acceptingOfferId !== null}
                        className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition ${
                          isAccepted || acceptingOfferId === offer.id
                            ? 'bg-emerald-500 text-slate-950 flex items-center gap-1.5 ml-auto shadow-xs font-bold'
                            : 'bg-slate-900 hover:bg-emerald-950 text-white shadow-2xs cursor-pointer'
                        }`}
                      >
                        {isAccepted || acceptingOfferId === offer.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('reverseAuction.accepted', undefined, 'Accepted')}</span>
                          </>
                        ) : (
                          <span>{t('reverseAuction.acceptOffer', undefined, 'Accept Offer')}</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Bid Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  {t('reverseAuction.modalTitle', undefined, 'Submit FPO Reverse Auction Bid')}
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOffer} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">{t('reverseAuction.labelOrgName', undefined, 'FPO Organization Name')}</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">{t('reverseAuction.labelOfferedQty', undefined, 'Offered Quantity (kg)')}</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">{t('reverseAuction.labelBidPrice', undefined, 'Bid Price (₹/kg)')}</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">{t('reverseAuction.labelGrade', undefined, 'Quality Grade')}</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">{t('reverseAuction.labelDistance', undefined, 'Distance to Hub (km)')}</label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn-ghost text-xs"
                >
                  {t('common.cancel', undefined, 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  {t('reverseAuction.publishBid', undefined, 'Publish Auction Bid')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
