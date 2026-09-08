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
  const { setActiveTab } = useApp();

  const [opportunities, setOpportunities] = useState<BuyerDemandOpportunity[]>(BUYER_DEMAND_OPPORTUNITIES);
  const [offers, setOffers] = useState<FarmerOfferItem[]>(FARMER_OFFERS_DATA);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  const handleMakeOffer = (opp: BuyerDemandOpportunity) => {
    setOfferSuccess(`Offer of ₹${opp.maxPricePerKg}/kg submitted to ${opp.buyerName} for ${opp.requiredQuantityKg.toLocaleString()} kg of ${opp.crop}!`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setOfferSuccess(null), 4000);
  };

  const handleAcceptOffer = (id: string) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, status: 'ACCEPTED' } : o)));
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRejectOffer = (id: string) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, status: 'REJECTED' } : o)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Search className="w-4 h-4" />
            <span>Direct Buyer Requirements</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Find Buyers & Direct Demands
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            Connect directly with verified institutional retailers, wholesale buyers, and food processors.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('demand-forecast')}
          className="self-start sm:self-auto bg-olive/20 hover:bg-olive/30 text-cream text-xs font-bold px-5 py-3 rounded-[1rem] border border-olive/30 transition uppercase tracking-widest"
        >
          Check Today's Demand Forecast →
        </button>
      </div>

      {offerSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{offerSuccess}</span>
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
              className={`p-6 rounded-[1.5rem] border transition space-y-4 ${
                off.status === 'ACCEPTED'
                  ? 'bg-sage/20 border-sage shadow-sm'
                  : off.status === 'REJECTED'
                  ? 'bg-cream border-olive/20 opacity-60'
                  : 'bg-olive/10 border-olive/30 hover:shadow-forest'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-anton text-2xl text-forest tracking-wide">{off.buyerName}</h4>
                    <span className="text-[9px] bg-forest text-cream font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      VERIFIED BUYER
                    </span>
                  </div>
                  <p className="text-xs text-forest/70 mt-1 font-medium">{off.crop} • {off.distanceKm} km away</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-anton text-forest">₹{off.offeredPricePerKg}<span className="text-sm">/kg</span></span>
                  <span className="text-[11px] text-forest/50 font-bold uppercase tracking-widest block">{off.quantityKg.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-olive/20 flex items-center justify-between text-xs">
                <span className="text-forest/70 font-bold uppercase tracking-widest text-[10px]">
                  Total Value: <strong className="text-forest text-sm tracking-normal">₹{(off.quantityKg * off.offeredPricePerKg).toLocaleString()}</strong>
                </span>

                {off.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptOffer(off.id)}
                      className="px-5 py-2.5 bg-sage hover:bg-cream text-forest font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectOffer(off.id)}
                      className="px-4 py-2.5 bg-olive/10 hover:bg-olive/20 text-forest/70 hover:text-red-700 font-bold rounded-[1rem] transition uppercase tracking-widest"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`font-bold uppercase tracking-widest text-xs ${off.status === 'ACCEPTED' ? 'text-forest' : 'text-forest/50'}`}>
                    {off.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Active Buyer Demands */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest overflow-hidden">
        <div className="p-8 border-b border-olive/20">
          <h3 className="text-2xl font-bold text-forest">
            Open Buyer Requirements Near You
          </h3>
          <p className="text-xs text-forest/60 mt-1 font-bold uppercase tracking-widest">Respond directly with your produce availability</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:shadow-forest transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-forest bg-sage/30 px-3 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
                    BUYER DEMAND
                  </span>
                  <span className="text-[10px] font-bold text-forest/70 uppercase tracking-widest">
                    {opp.quality}
                  </span>
                </div>

                <div>
                  <h4 className="text-3xl font-anton text-forest tracking-wide">{opp.crop}</h4>
                  <p className="text-xs text-forest/70 font-medium mt-1">Buyer: <strong>{opp.buyerName}</strong></p>
                </div>

                <div className="space-y-2 text-xs text-forest/80 bg-cream p-4 rounded-[1rem] border border-olive/30 font-medium">
                  <div className="flex justify-between items-center border-b border-olive/20 pb-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Required:</span>
                    <strong className="text-forest text-sm font-bold">{opp.requiredQuantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-olive/20 py-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Max Price:</span>
                    <strong className="text-forest text-sm font-bold">₹{opp.maxPricePerKg} / kg</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-olive/20 py-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Location:</span>
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold">Req Date:</span>
                    <strong className="text-forest font-bold">{opp.requiredDate}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleMakeOffer(opp)}
                className="w-full py-3 bg-forest hover:bg-[#023120] text-cream font-bold rounded-[1rem] text-xs transition shadow-sm uppercase tracking-widest mt-2"
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
