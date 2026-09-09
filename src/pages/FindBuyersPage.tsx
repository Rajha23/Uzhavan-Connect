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
      <div className="bg-emerald-700 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">
            <Search className="w-4 h-4" />
            <span>Direct Buyer Requirements & Contracts</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tracking-wide">
            Find Buyers & Direct Demands
          </h1>
          <p className="text-sm text-white/70 mt-2 font-medium">
            Connect directly with verified institutional retailers, wholesale buyers, and food processors.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('demand-forecast')}
          className="self-start sm:self-auto bg-slate-50 hover:bg-slate-50 text-white text-xs font-bold px-5 py-3 rounded-[1rem] border border-slate-200 transition uppercase tracking-widest"
        >
          Check Today's Demand Forecast →
        </button>
      </div>

      {offerSuccess && (
        <div className="p-5 bg-emerald-100/20 border border-sage/60 text-slate-900 rounded-[1.5rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
            <span className="text-xs font-bold">{offerSuccess}</span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-[0.8rem] shadow-sm hover:bg-[#023120] transition whitespace-nowrap self-start sm:self-auto"
          >
            Track in Orders Pipeline →
          </button>
        </div>
      )}

      {/* 1. Received Buyer Offers */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Direct Buyer Offers for Your Produce
            </h3>
            <p className="text-xs text-slate-900/60 mt-1 font-bold uppercase tracking-widest">Retailers bidding directly on your listings</p>
          </div>
          <span className="text-[10px] font-bold text-slate-900 bg-emerald-100/30 px-3 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
            {offers.filter((o) => o.status === 'PENDING').length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((off) => (
            <div
              key={off.id}
              className={`p-6 rounded-[1.5rem] border transition space-y-4 ${
                off.status === 'ACCEPTED'
                  ? 'bg-emerald-100/20 border-sage shadow-sm'
                  : off.status === 'REJECTED'
                  ? 'bg-white border-slate-200 opacity-60'
                  : 'bg-slate-50 border-slate-200 hover:shadow-soft'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold tracking-tight text-2xl text-slate-900 tracking-wide">{off.buyerName}</h4>
                    <span className="text-[9px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      VERIFIED BUYER
                    </span>
                  </div>
                  <p className="text-xs text-slate-900/70 mt-1 font-medium">{off.crop} • {off.distanceKm} km away</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">₹{off.offeredPricePerKg}<span className="text-sm">/kg</span></span>
                  <span className="text-[11px] text-slate-900/50 font-bold uppercase tracking-widest block">{off.quantityKg.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-900/70 font-bold uppercase tracking-widest text-[10px]">
                  Total Value: <strong className="text-slate-900 text-sm tracking-normal">₹{(off.quantityKg * off.offeredPricePerKg).toLocaleString()}</strong>
                </span>

                {off.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptOffer(off)}
                      className="px-5 py-2.5 bg-emerald-100 hover:bg-white text-slate-900 font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest"
                    >
                      Accept & Contract
                    </button>
                    <button
                      onClick={() => handleRejectOffer(off.id)}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-50 text-slate-900/70 hover:text-red-700 font-bold rounded-[1rem] transition uppercase tracking-widest"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`font-bold uppercase tracking-widest text-xs ${off.status === 'ACCEPTED' ? 'text-slate-900' : 'text-slate-900/50'}`}>
                    {off.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Active Buyer Demands */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Open Buyer Requirements Near You
            </h3>
            <p className="text-xs text-slate-900/60 mt-1 font-bold uppercase tracking-widest">
              Live demands from institutional buyers & food processors ({combinedDemands.length})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('buyer-demand')}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-emerald-100/30 px-4 py-2 rounded-[0.8rem] border border-sage/50 hover:bg-emerald-100/50 transition self-start sm:self-auto"
          >
            Post New Demand →
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {combinedDemands.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 hover:shadow-soft transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-900 bg-emerald-100/30 px-3 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
                    BUYER DEMAND
                  </span>
                  <span className="text-[10px] font-bold text-slate-900/70 uppercase tracking-widest">
                    {opp.quality}
                  </span>
                </div>

                <div>
                  <h4 className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide">{opp.crop}</h4>
                  <p className="text-xs text-slate-900/70 font-medium mt-1">Buyer: <strong>{opp.buyerName}</strong></p>
                </div>

                <div className="space-y-2 text-xs text-slate-900/80 bg-white p-4 rounded-[1rem] border border-slate-200 font-medium">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Required:</span>
                    <strong className="text-slate-900 text-sm font-bold">{opp.requiredQuantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 py-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Max Price:</span>
                    <strong className="text-slate-900 text-sm font-bold">₹{opp.maxPricePerKg} / kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 py-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Location:</span>
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Req Date:</span>
                    <strong className="text-slate-900 font-bold">{opp.requiredDate}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMakeOffer(opp)}
                className="w-full py-3 bg-emerald-700 hover:bg-[#023120] text-white font-bold rounded-[1rem] text-xs transition shadow-sm uppercase tracking-widest mt-2"
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
