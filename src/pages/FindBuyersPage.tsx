import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { BUYER_DEMAND_OPPORTUNITIES, FARMER_OFFERS_DATA } from '../data/mockData';
import { BuyerDemandOpportunity, FarmerOfferItem } from '../types';
import {
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Check,
  Sprout
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FindBuyersPage: React.FC = () => {
  const { t } = useLanguage();
  const { setActiveTab, demandRequests, produceListings, confirmMatchAndCreateOrder } = useApp();

  const [offers, setOffers] = useState<FarmerOfferItem[]>(FARMER_OFFERS_DATA);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  // Combine static demonstration opportunities with live buyer demands from AppContext
  const combinedDemands: BuyerDemandOpportunity[] = [
    ...demandRequests
      .filter((d) => d.status === 'Created' || d.status === 'OPEN' || d.status === 'MATCHING' || d.status === 'Aggregating')
      .map((d) => ({
        id: d.id,
        buyerName: d.buyerName,
        crop: d.crop,
        requiredQuantityKg: d.quantityKg,
        maxPricePerKg: d.maxTargetPricePerKg,
        location: d.location,
        requiredDate: d.deliveryDate,
        quality: d.qualityRequirement
      })),
    ...BUYER_DEMAND_OPPORTUNITIES.filter((b) => !demandRequests.some((d) => d.id === b.id))
  ];

  const handleMakeOffer = (opp: BuyerDemandOpportunity) => {
    // Find matching listing or create agreement
    const matchingListing =
      produceListings.find((p) => p.crop.toLowerCase() === opp.crop.toLowerCase()) || produceListings[0];
    if (matchingListing) {
      confirmMatchAndCreateOrder(matchingListing.id, opp.id, opp.maxPricePerKg, opp.requiredQuantityKg);
    }
    setOfferSuccess(
      t('findBuyers.agreementReached', 'Agreement reached with {buyer}! Confirmed Order created for {qty} kg of {crop} at ₹{price}/kg.', {
        buyer: opp.buyerName,
        qty: opp.requiredQuantityKg.toLocaleString(),
        crop: opp.crop,
        price: opp.maxPricePerKg
      })
    );
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setOfferSuccess(null), 6000);
  };

  const handleAcceptOffer = (off: FarmerOfferItem) => {
    const matchingListing =
      produceListings.find((p) => p.crop.toLowerCase() === off.crop.toLowerCase()) || produceListings[0];
    if (matchingListing) {
      confirmMatchAndCreateOrder(
        matchingListing.id,
        off.demandId || `DEM-2026-${Date.now().toString().slice(-4)}`,
        off.offeredPricePerKg,
        off.quantityKg
      );
    }
    setOffers(offers.map((o) => (o.id === off.id ? { ...o, status: 'ACCEPTED' } : o)));
    setOfferSuccess(
      t('findBuyers.agreementReached', 'Offer accepted! Order created for {qty} kg of {crop} at ₹{price}/kg. Track it in Orders pipeline.', {
        buyer: off.buyerName,
        qty: off.quantityKg.toLocaleString(),
        crop: off.crop,
        price: off.offeredPricePerKg
      })
    );
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setOfferSuccess(null), 6000);
  };

  const handleRejectOffer = (id: string) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, status: 'REJECTED' } : o)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <Search className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{t('findBuyers.title', 'Direct Buyer Discovery & Demand Opportunities')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('findBuyers.title', 'Find Buyers & Forward Demands')}
            </h1>
            <p className="text-sm text-emerald-100/80 font-normal max-w-2xl">
              {t('findBuyers.subtitle', 'Connect directly with verified institutional retailers, wholesale buyers, and food processors. Eliminate middleman cuts with transparent binding orders.')}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('demand-forecast')}
            className="self-start sm:self-auto bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer relative z-10"
          >
            {t('sidebar.demandIntelligence', 'Check Demand Forecast')} →
          </button>
        </div>
      </div>

      {offerSuccess && (
        <div className="p-4 sm:p-5 bg-[#eaf4ec] border border-[#a3b18a]/50 text-[#01472e] rounded-2xl shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#01472e] text-[#fefae0] flex items-center justify-center font-bold text-sm shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">{offerSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="btn-primary text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-soft py-2 px-4 rounded-xl"
          >
            {t('orders.trackOrders', 'Track in Orders Pipeline')} →
          </button>
        </div>
      )}

      {/* 1. Received Buyer Offers */}
      <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ccd5ae]/30 pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#01472e] tracking-tight">
              {t('findBuyers.activeIncomingOffers', 'Direct Buyer Bids for Your Listed Produce')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('findBuyers.subtitle', 'Verified retailers bidding directly on your farm inventory')}</p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40 uppercase tracking-wider">
            {offers.filter((o) => o.status === 'PENDING').length} {t('common.pending', 'Pending')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((off) => (
            <div
              key={off.id}
              className={`p-6 rounded-3xl border transition-all duration-200 space-y-4 shadow-xs ${
                off.status === 'ACCEPTED'
                  ? 'bg-[#eaf4ec]/40 border-[#01472e]/30 shadow-soft'
                  : off.status === 'REJECTED'
                  ? 'bg-white/60 border-slate-200 opacity-60'
                  : 'bg-[#faf9f5] border-[#ccd5ae]/50 hover:border-[#a3b18a] hover:bg-white hover:shadow-soft'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-lg text-slate-900 tracking-tight">{off.buyerName}</h4>
                    <span className="text-[10px] bg-[#01472e] text-[#fefae0] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {t('common.verified', 'VERIFIED')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{off.crop}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{off.distanceKm} km</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-[#01472e] tracking-tight">₹{off.offeredPricePerKg}<span className="text-xs font-normal text-slate-500">/{t('common.kg', 'kg')}</span></span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">{off.quantityKg.toLocaleString()} {t('common.kg', 'kg')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#ccd5ae]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  {t('common.total', 'Total')}: <strong className="text-slate-900 text-sm font-mono font-bold">₹{(off.quantityKg * off.offeredPricePerKg).toLocaleString()}</strong>
                </span>

                {off.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptOffer(off)}
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-soft cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('findBuyers.acceptOffer', 'Accept & Contract')}</span>
                    </button>
                    <button
                      onClick={() => handleRejectOffer(off.id)}
                      className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('findBuyers.rejectOffer', 'Decline')}</span>
                    </button>
                  </div>
                ) : (
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                      off.status === 'ACCEPTED'
                        ? 'bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/50'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {t('orderStatus.' + off.status, off.status)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Active Buyer Demands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#01472e] tracking-tight">
            {t('findBuyers.liveDemandOpportunities', 'Active Forward Procurement Demands')}
          </h3>
          <span className="text-xs text-slate-500 font-medium">({combinedDemands.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {combinedDemands.map((opp) => (
            <div
              key={opp.id}
              className="agri-card rounded-3xl border border-[#ccd5ae]/50 bg-white p-6 shadow-soft hover:-translate-y-1 hover:shadow-md transition-all duration-200 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#01472e] bg-[#eaf4ec] px-2.5 py-1 rounded-full border border-[#a3b18a]/40 uppercase tracking-wider">
                    {t('demand.title', 'Buyer Demand')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {opp.quality}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">{opp.crop}</h4>
                  <p className="text-xs text-slate-600 mt-1">{t('roles.RETAIL_BUYER', 'Buyer')}: <strong className="text-slate-800">{opp.buyerName}</strong></p>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-[#faf9f5] p-4 rounded-2xl border border-[#ccd5ae]/40 font-medium">
                  <div className="flex justify-between items-center border-b border-[#ccd5ae]/30 pb-2">
                    <span className="uppercase tracking-wider text-[10px] text-slate-500">{t('common.quantity', 'Required')}:</span>
                    <strong className="text-slate-900 text-sm font-mono font-bold">{opp.requiredQuantityKg.toLocaleString()} {t('common.kg', 'kg')}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#ccd5ae]/30 py-2">
                    <span className="uppercase tracking-wider text-[10px] text-slate-500">{t('common.price', 'Max Target Rate')}:</span>
                    <strong className="text-[#01472e] text-sm font-mono font-bold">₹{opp.maxPricePerKg} / {t('common.kg', 'kg')}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#ccd5ae]/30 py-2">
                    <span className="uppercase tracking-wider text-[10px] text-slate-500">{t('common.location', 'Location')}:</span>
                    <span className="text-slate-800 font-semibold">{opp.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="uppercase tracking-wider text-[10px] text-slate-500">{t('common.date', 'Delivery Due')}:</span>
                    <strong className="text-slate-900 font-semibold">{opp.requiredDate}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMakeOffer(opp)}
                className="btn-primary w-full py-3 rounded-2xl text-xs font-semibold shadow-soft uppercase tracking-wider mt-2 cursor-pointer"
              >
                {t('matching.createOrder', '1-Click Forward Contract')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

