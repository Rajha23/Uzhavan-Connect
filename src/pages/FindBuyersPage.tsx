import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FindBuyersPage: React.FC = () => {
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
      `Agreement reached with ${opp.buyerName}! Confirmed Order created for ${opp.requiredQuantityKg.toLocaleString()} kg of ${opp.crop} at ₹${opp.maxPricePerKg}/kg.`
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
      `Offer accepted! Order created for ${off.quantityKg.toLocaleString()} kg of ${off.crop} at ₹${off.offeredPricePerKg}/kg. Track it in Orders pipeline.`
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a2e1f] to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Direct Buyer Requirements & Contracts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find Buyers & Direct Demands
          </h1>
          <p className="text-sm text-slate-300 mt-2 font-normal">
            Connect directly with verified institutional retailers, wholesale buyers, and food processors.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('demand-forecast')}
          className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition uppercase tracking-wider"
        >
          Check Today's Demand Forecast →
        </button>
      </div>

      {offerSuccess && (
        <div className="p-5 bg-sage/20 border border-sage/60 text-forest rounded-[1.5rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />
            <span className="text-xs font-bold">{offerSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-forest text-cream text-[10px] font-bold uppercase tracking-widest rounded-[0.8rem] shadow-sm hover:bg-[#023120] transition whitespace-nowrap self-start sm:self-auto"
          >
            Track in Orders Pipeline →
          </button>
        </div>
      )}

      {/* 1. Received Buyer Offers */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-olive/20 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-forest">
              Direct Buyer Offers for Your Produce
            </h3>
            <p className="text-xs text-forest/60 mt-1 font-bold uppercase tracking-widest">Retailers bidding directly on your listings</p>
          </div>
          <span className="text-[10px] font-bold text-forest bg-sage/30 px-3 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
            {offers.filter((o) => o.status === 'PENDING').length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((off) => (
            <div
              key={off.id}
              className={`p-6 rounded-2xl border transition space-y-4 ${
                off.status === 'ACCEPTED'
                  ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                  : off.status === 'REJECTED'
                  ? 'bg-white/60 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200/80 hover:shadow-sm hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">{off.buyerName}</h4>
                    <span className="text-[9px] bg-slate-900 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      VERIFIED BUYER
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-normal">{off.crop} • {off.distanceKm} km away</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">₹{off.offeredPricePerKg}<span className="text-xs font-normal text-slate-500">/kg</span></span>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">{off.quantityKg.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium uppercase tracking-wider text-[11px]">
                  Total Value: <strong className="text-slate-900 text-sm font-bold">₹{(off.quantityKg * off.offeredPricePerKg).toLocaleString()}</strong>
                </span>

                {off.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptOffer(off)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-xs transition uppercase tracking-wider text-xs"
                    >
                      Accept & Contract
                    </button>
                    <button
                      onClick={() => handleRejectOffer(off.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition uppercase tracking-wider text-xs"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                      off.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {off.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Active Buyer Demands */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Active Forward Procurement Demands
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {combinedDemands.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:shadow-sm hover:border-emerald-300 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                    BUYER DEMAND
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {opp.quality}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{opp.crop}</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1">Buyer: <strong className="text-slate-800">{opp.buyerName}</strong></p>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 font-medium">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Required:</span>
                    <strong className="text-slate-900 text-sm font-bold">{opp.requiredQuantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 py-2">
                    <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Max Price:</span>
                    <strong className="text-slate-900 text-sm font-bold">₹{opp.maxPricePerKg} / kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 py-2">
                    <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Location:</span>
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">Req Date:</span>
                    <strong className="text-slate-900 font-bold">{opp.requiredDate}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMakeOffer(opp)}
                className="w-full py-2.5 bg-slate-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-xs transition shadow-2xs uppercase tracking-wider mt-2"
              >
                Make Offer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
