import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_AUCTION_OFFERS } from '../data/mockData';
import { ReverseAuctionOffer } from '../types';
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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReverseAuctionPage: React.FC = () => {
  const { setActiveTab } = useApp();

  const [offers, setOffers] = useState<ReverseAuctionOffer[]>(INITIAL_AUCTION_OFFERS);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string>('OFF-001');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New bid form state
  const [fpoName, setFpoName] = useState('Chengalpattu Organic Growers');
  const [quantityKg, setQuantityKg] = useState<number>(3000);
  const [pricePerKg, setPricePerKg] = useState<number>(26.0);
  const [grade, setGrade] = useState<'Grade A' | 'Grade B'>('Grade A');
  const [distanceKm, setDistanceKm] = useState<number>(40);
  const [reliabilityScore, setReliabilityScore] = useState<number>(90);

  const handleAcceptOffer = (id: string) => {
    setAcceptedOfferId(id);
    setOffers(offers.map((o) => (o.id === id ? { ...o, status: 'ACCEPTED' } : { ...o, status: 'SUBMITTED' })));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
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
      {/* Header Banner */}
      <div className="bg-emerald-700 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">
            <Gavel className="w-4 h-4" />
            <span>Demand-Backed Procurement Auction • Live Bidding</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tracking-wide">
            Reverse Auction & Smart Allocation
          </h1>
          <p className="text-sm text-white/70 mt-3 max-w-2xl leading-relaxed font-medium">
            Lot: <strong>3,000 kg Tomato (Grade A)</strong> • Chennai Corridor. FPOs submit competitive transparent bids. Ranks by multi-factor Smart Match Score rather than crude lowest price.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-100 hover:bg-white text-slate-900 text-xs font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            <span>Submit FPO Bid</span>
          </button>

          <button
            onClick={() => setActiveTab('middleman-sim')}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-50 text-white text-xs font-bold px-5 py-3.5 rounded-[1rem] border border-slate-200 transition uppercase tracking-widest"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Inspect Net Realization</span>
          </button>
        </div>
      </div>

      {/* Reverse Auction Workflow Process */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-emerald-100/30 px-4 py-1.5 rounded-full border border-sage/50">
              Auction Protocol Workflow
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-3">
              End-to-End Reverse Auction Flow
            </h3>
          </div>

          {/* Status Indicators: OPEN, CLOSING SOON, CLOSED */}
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
            <span className="px-4 py-2 bg-emerald-100/30 text-slate-900 rounded-full border border-sage/50 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              OPEN
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-900/70 rounded-full border border-slate-200/40">
              CLOSING SOON
            </span>
            <span className="px-4 py-2 bg-white text-slate-900/40 rounded-full border border-slate-200">
              CLOSED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs text-center">
          <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <span className="text-[9px] text-slate-900/50 font-bold uppercase tracking-widest block mb-2">STEP 1</span>
            <span className="font-bold text-slate-900">Buyer creates demand</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <span className="text-[9px] text-slate-900/50 font-bold uppercase tracking-widest block mb-2">STEP 2</span>
            <span className="font-bold text-slate-900">Farmers/FPOs receive</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <span className="text-[9px] text-slate-900/50 font-bold uppercase tracking-widest block mb-2">STEP 3</span>
            <span className="font-bold text-slate-900">Submit prices</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <span className="text-[9px] text-slate-900/50 font-bold uppercase tracking-widest block mb-2">STEP 4</span>
            <span className="font-bold text-slate-900">Compare offers</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <span className="text-[9px] text-slate-900/50 font-bold uppercase tracking-widest block mb-2">STEP 5</span>
            <span className="font-bold text-slate-900">Select suitable offer</span>
          </div>
          <div className="p-4 bg-emerald-100/20 rounded-[1.5rem] border border-sage shadow-sm transform hover:-translate-y-1 transition">
            <span className="text-[9px] text-slate-900 font-bold uppercase tracking-widest block mb-2">STEP 6</span>
            <span className="font-bold text-slate-900">Order confirmed</span>
          </div>
        </div>
      </div>

      {/* Featured Example Card: OPEN AUCTION Tomato 3,000 kg */}
      <div className="bg-white rounded-[2.5rem] border-2 border-sage p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                OPEN AUCTION
              </span>
              <span className="text-[10px] text-slate-900/50 font-bold uppercase tracking-widest">ID: AUC-CH-TOM-3000</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-4 tracking-wide">
              Tomato • Required: 3,000 kg
            </h3>
            <p className="text-sm text-slate-900/70 font-medium mt-1">Destination: Chennai Distribution Terminal • Max Price: ₹28.00/kg</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptOffer('OFF-001')}
              className="px-6 py-3.5 bg-emerald-700 hover:bg-[#023120] text-white font-bold text-xs rounded-[1rem] shadow-sm transition uppercase tracking-widest"
            >
              Accept Offer
            </button>
          </div>
        </div>

        {/* 3 Prompt Offers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm uppercase tracking-widest">Farmer A (Kanchipuram)</p>
              <span className="text-[10px] text-slate-900/70 font-bold uppercase tracking-widest block mt-1">Standard Grade</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">₹27 <span className="text-sm font-sans tracking-normal">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-003')}
                className="text-[10px] text-slate-900/60 font-bold uppercase tracking-widest block mt-1 hover:text-slate-900 transition"
              >
                Select Offer
              </button>
            </div>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm uppercase tracking-widest">Farmer B (Tiruvallur)</p>
              <span className="text-[10px] text-slate-900/70 font-bold uppercase tracking-widest block mt-1">Standard Grade</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">₹26 <span className="text-sm font-sans tracking-normal">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-002')}
                className="text-[10px] text-slate-900/60 font-bold uppercase tracking-widest block mt-1 hover:text-slate-900 transition"
              >
                Select Offer
              </button>
            </div>
          </div>

          <div className="p-6 rounded-[1.5rem] bg-emerald-100/20 border border-sage shadow-sm transform hover:-translate-y-1 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm uppercase tracking-widest">GreenHarvest FPO</p>
                <span className="text-[9px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full">BEST</span>
              </div>
              <span className="text-[10px] text-slate-900/70 font-bold uppercase tracking-widest block mt-1">Grade A Certified</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">₹25 <span className="text-sm font-sans tracking-normal">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-001')}
                className="text-[10px] text-slate-900 font-bold uppercase tracking-widest block mt-1 hover:opacity-80 transition"
              >
                View Offers →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Smart Matching Engine Component */}
      <SmartMatchingEngine />

      {/* Live FPO Offers Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden mt-8">
        <div className="p-8 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Submitted FPO Auction Bids ({offers.length})
            </h3>
            <p className="text-xs text-slate-900/60 mt-1 font-bold uppercase tracking-widest">Sorted by Smart Match Score combining price, distance, and historical fulfillment</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900/70 font-bold uppercase tracking-widest">
                <th className="p-5">FPO / Collective</th>
                <th className="p-5">Quantity</th>
                <th className="p-5">Price / kg</th>
                <th className="p-5">Quality Grade</th>
                <th className="p-5">Distance</th>
                <th className="p-5">Reliability</th>
                <th className="p-5">Smart Match Score</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/20">
              {offers.map((offer) => {
                const isAccepted = offer.id === acceptedOfferId;

                return (
                  <tr key={offer.id} className="hover:bg-slate-50 transition">
                    <td className="p-5">
                      <span className="font-bold text-slate-900 block">{offer.fpoName}</span>
                      <span className="text-[10px] text-slate-900/60 uppercase tracking-widest font-bold mt-1 block">Ready: {offer.readinessDate}</span>
                    </td>
                    <td className="p-5 font-bold text-slate-900">
                      {offer.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="p-5 font-bold tracking-tight text-slate-900 text-lg tracking-wide">
                      ₹{offer.pricePerKg.toFixed(2)}
                    </td>
                    <td className="p-5">
                      <span className="bg-emerald-100/20 text-slate-900 font-bold px-3 py-1.5 rounded-full text-[10px] border border-sage/40 uppercase tracking-widest">
                        {offer.grade}
                      </span>
                    </td>
                    <td className="p-5 text-slate-900/70 font-bold">
                      {offer.estimatedTransportKm} km
                    </td>
                    <td className="p-5 font-bold text-slate-900/80">
                      {offer.reliabilityScore}%
                    </td>
                    <td className="p-5">
                      <span className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">
                        {offer.matchScore}
                      </span>
                      <span className="text-[10px] text-slate-900/50 font-bold uppercase tracking-widest ml-1"> / 100</span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className={`px-5 py-2.5 rounded-[1rem] text-[10px] font-bold uppercase tracking-widest transition ${
                          isAccepted
                            ? 'bg-emerald-100 text-slate-900 flex items-center gap-2 ml-auto shadow-sm'
                            : 'bg-emerald-700 hover:bg-[#023120] text-white'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accepted</span>
                          </>
                        ) : (
                          <span>Accept Offer</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#01472e]/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-200 p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Gavel className="w-6 h-6 text-slate-900" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">
                  Submit FPO Reverse Auction Bid
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-900/50 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOffer} className="space-y-5 text-xs">
              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">FPO Organization Name</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Offered Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Bid Price (₹/kg)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Distance to Hub (km)</label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-5 py-3 text-slate-900/70 hover:bg-slate-50 rounded-[1rem] font-bold uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-100 hover:bg-white text-slate-900 font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest"
                >
                  Publish Auction Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
