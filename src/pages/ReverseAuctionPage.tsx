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
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <Gavel className="w-4 h-4 text-emerald-400" />
            <span>Demand-Backed Procurement Auction • Live Bidding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Reverse Auction & Smart Allocation
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
            Lot: <span className="text-white font-medium">3,000 kg Tomato (Grade A)</span> • Chennai Corridor. FPOs submit competitive transparent bids. Ranks by multi-factor Smart Match Score rather than crude lowest price.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Submit FPO Bid</span>
          </button>

          <button
            onClick={() => setActiveTab('middleman-sim')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition uppercase tracking-wider"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Inspect Net Realization</span>
          </button>
        </div>
      </div>

      {/* Reverse Auction Workflow Process */}
      <div className="bg-white/95 rounded-2xl border border-emerald-900/10 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
              Auction Protocol Workflow
            </span>
            <h3 className="text-xl font-medium tracking-tight text-slate-900 mt-3">
              End-to-End Reverse Auction Flow
            </h3>
          </div>

          {/* Status Indicators: OPEN, CLOSING SOON, CLOSED */}
          <div className="flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-wider">
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              OPEN
            </span>
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              CLOSING SOON
            </span>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
              CLOSED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">STEP 1</span>
            <span className="font-medium text-slate-800">Buyer creates demand</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">STEP 2</span>
            <span className="font-medium text-slate-800">Farmers/FPOs receive</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">STEP 3</span>
            <span className="font-medium text-slate-800">Submit prices</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">STEP 4</span>
            <span className="font-medium text-slate-800">Compare offers</span>
          </div>
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">STEP 5</span>
            <span className="font-medium text-slate-800">Select suitable offer</span>
          </div>
          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-300/80 shadow-2xs transform hover:-translate-y-0.5 transition">
            <span className="text-[9px] text-emerald-800 font-medium uppercase tracking-wider block mb-1.5">STEP 6</span>
            <span className="font-medium text-emerald-900">Order confirmed</span>
          </div>
        </div>
      </div>

      {/* Featured Example Card: OPEN AUCTION Tomato 3,000 kg */}
      <div className="bg-white rounded-2xl border border-emerald-300 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-slate-900 text-emerald-400 font-medium px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                OPEN AUCTION
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">ID: AUC-CH-TOM-3000</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mt-3 tracking-tight">
              Tomato • Required: 3,000 kg
            </h3>
            <p className="text-sm text-slate-600 font-normal mt-1">Destination: Chennai Distribution Terminal • Max Price: ₹28.00/kg</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAcceptOffer('OFF-001')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-950 text-white font-medium text-xs rounded-xl shadow-xs transition uppercase tracking-wider"
            >
              Accept Offer
            </button>
          </div>
        </div>

        {/* 3 Prompt Offers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 text-xs uppercase tracking-wider">Farmer A (Kanchipuram)</p>
              <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider block mt-1">Standard Grade</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-slate-900 tracking-tight">₹27 <span className="text-xs font-normal text-slate-500">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-003')}
                className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1 hover:text-slate-900 transition"
              >
                Select Offer
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 text-xs uppercase tracking-wider">Farmer B (Tiruvallur)</p>
              <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider block mt-1">Standard Grade</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-slate-900 tracking-tight">₹26 <span className="text-xs font-normal text-slate-500">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-002')}
                className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1 hover:text-slate-900 transition"
              >
                Select Offer
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-300 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-emerald-950 text-xs uppercase tracking-wider">GreenHarvest FPO</p>
                <span className="text-[9px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded-full">BEST</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-normal uppercase tracking-wider block mt-1">Grade A Certified</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold text-emerald-900 tracking-tight">₹25 <span className="text-xs font-normal text-emerald-700">/ kg</span></span>
              <button
                onClick={() => handleAcceptOffer('OFF-001')}
                className="text-[10px] text-emerald-800 font-medium uppercase tracking-wider block mt-1 hover:opacity-80 transition"
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
      <div className="bg-white/95 rounded-2xl border border-emerald-900/10 shadow-xs overflow-hidden mt-8">
        <div className="p-6 sm:p-7 border-b border-emerald-900/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium tracking-tight text-slate-900">
              Submitted FPO Auction Bids ({offers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">Sorted by Smart Match Score combining price, distance, and historical fulfillment</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-50/40 border-b border-emerald-900/10 text-slate-600 font-medium uppercase tracking-wider text-[11px]">
                <th className="p-4 sm:p-5">FPO / Collective</th>
                <th className="p-4 sm:p-5">Quantity</th>
                <th className="p-4 sm:p-5">Price / kg</th>
                <th className="p-4 sm:p-5">Quality Grade</th>
                <th className="p-4 sm:p-5">Distance</th>
                <th className="p-4 sm:p-5">Reliability</th>
                <th className="p-4 sm:p-5">Smart Match Score</th>
                <th className="p-4 sm:p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => {
                const isAccepted = offer.id === acceptedOfferId;

                return (
                  <tr key={offer.id} className="hover:bg-emerald-50/30 transition">
                    <td className="p-5">
                      <span className="font-medium text-slate-900 block">{offer.fpoName}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-normal mt-1 block">Ready: {offer.readinessDate}</span>
                    </td>
                    <td className="p-5 font-medium text-slate-800">
                      {offer.quantityKg.toLocaleString()} kg
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
                        className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition ${
                          isAccepted
                            ? 'bg-emerald-500 text-slate-950 flex items-center gap-1.5 ml-auto shadow-xs'
                            : 'bg-slate-900 hover:bg-emerald-950 text-white shadow-2xs'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Submit FPO Reverse Auction Bid
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
                <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">FPO Organization Name</label>
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
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">Offered Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">Bid Price (₹/kg)</label>
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
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">Quality Grade</label>
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
                  <label className="font-medium text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">Distance to Hub (km)</label>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
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
