import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_DEMAND_REQUESTS, SMART_MATCH_SUPPLIERS } from '../data/mockData';
import { DemandRequest } from '../types';
import {
  ShoppingBag,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Truck,
  ExternalLink,
  Trash2,
  CloudOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BuyerDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    openDemoMode,
    demandRequests: demands,
    addDemandRequest,
    deleteDemandRequest
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state with variety, unit conversion, quality, delivery, and buyer info
  const [crop, setCrop] = useState('Tomato');
  const [variety, setVariety] = useState('Sivam Hybrid');
  const [rawQuantity, setRawQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState<'kg' | 'Quintal' | 'Crates' | 'Ton'>('kg');
  const [quality, setQuality] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium' | 'Any'>('Grade A');
  const [location, setLocation] = useState('Chennai Distribution Terminal');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-08');
  const [deliveryWindow, setDeliveryWindow] = useState('05:30 AM - 08:30 AM');
  const [maxPrice, setMaxPrice] = useState<number>(30.0);
  const [buyerName, setBuyerName] = useState(currentUser.organization || currentUser.name || 'ABC Retail Stores');

  // Convert quantity to standard kg based on unit
  const getUnitMultiplier = (u: 'kg' | 'Quintal' | 'Crates' | 'Ton'): number => {
    switch (u) {
      case 'Quintal': return 100;
      case 'Crates': return 25;
      case 'Ton': return 1000;
      default: return 1;
    }
  };

  const calculatedKg = rawQuantity * getUnitMultiplier(unit);

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq: DemandRequest = {
      id: `DEM-TN-${Date.now().toString().slice(-3)}`,
      buyerId: currentUser.id || 'BUYER-01',
      buyerName: buyerName || currentUser.organization || 'Institutional Procurement',
      buyerType: 'Supermarket',
      crop,
      variety,
      quantityKg: Number(calculatedKg),
      initialQuantityKg: Number(calculatedKg),
      allocatedQuantityKg: 0,
      unit,
      qualityRequirement: quality,
      location,
      deliveryDate,
      deliveryTimeWindow: deliveryWindow,
      maxTargetPricePerKg: Number(maxPrice),
      status: 'POOLED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    addDemandRequest(newReq);
    setIsModalOpen(false);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const totalDemandVolumeKg = demands.reduce((sum, d) => sum + d.quantityKg, 0);
  const totalAllocatedVolumeKg = demands.reduce((sum, d) => sum + (d.allocatedQuantityKg || 0), 0);
  const activeCropsCount = new Set(demands.map((d) => d.crop)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Bulk Institutional Buyer Procurement Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Buyer Dashboard
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            {currentUser.organization || 'Uzhavan Institutional Network'} • Active Multi-Buyer Forward Demands
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            <span>Create Demand</span>
          </button>

          <button
            onClick={() => setActiveTab('demand-pool')}
            className="flex items-center gap-2 bg-olive/20 hover:bg-olive/30 text-cream text-xs font-bold px-5 py-3 rounded-[1rem] border border-olive/30 transition uppercase tracking-widest"
          >
            <Layers className="w-4 h-4 text-sage" />
            <span>Demand Pool</span>
          </button>
        </div>
      </div>

      {/* Procurement Metrics Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm">
          <span className="text-[10px] text-forest/60 font-bold uppercase tracking-widest block mb-1">Active Demands</span>
          <p className="text-3xl font-anton text-forest">{demands.length}</p>
          <span className="text-[10px] text-forest/70 font-medium">Across {activeCropsCount} Commodities</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm">
          <span className="text-[10px] text-forest/60 font-bold uppercase tracking-widest block mb-1">Unmet Target Volume</span>
          <p className="text-3xl font-anton text-forest">{totalDemandVolumeKg.toLocaleString()} <span className="text-sm font-sans">kg</span></p>
          <span className="text-[10px] text-emerald-800 font-bold">Open for Allocation</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm">
          <span className="text-[10px] text-forest/60 font-bold uppercase tracking-widest block mb-1">Allocated Volume</span>
          <p className="text-3xl font-anton text-forest">{totalAllocatedVolumeKg.toLocaleString()} <span className="text-sm font-sans">kg</span></p>
          <span className="text-[10px] text-forest/70 font-medium">Under Contract</span>
        </div>

        <div className="bg-cream p-5 rounded-[1.5rem] border border-olive/30 shadow-sm">
          <span className="text-[10px] text-forest/60 font-bold uppercase tracking-widest block mb-1">Aggregation Ready</span>
          <p className="text-3xl font-anton text-forest">100%</p>
          <span className="text-[10px] text-sage font-bold uppercase tracking-widest">Coordinated Logistics</span>
        </div>
      </div>

      {/* Active Demands Table */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest overflow-hidden">
        <div className="p-8 border-b border-olive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-forest">
              Active Institutional Demands
            </h3>
            <p className="text-xs text-forest/60 mt-1 font-bold uppercase tracking-widest">Forward procurement commitments ready for matching</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('smart-matching')}
              className="text-xs font-bold text-cream hover:bg-forest/90 bg-forest px-5 py-3 rounded-[1rem] transition shadow-sm uppercase tracking-widest flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-sage" />
              <span>Launch Smart Matching</span>
            </button>
            <button
              onClick={() => setActiveTab('reverse-auction')}
              className="text-xs font-bold text-forest hover:bg-cream bg-sage px-5 py-3 rounded-[1rem] transition shadow-sm uppercase tracking-widest"
            >
              Open Reverse Auction →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-olive/10 border-b border-olive/20 text-forest/70 font-bold uppercase tracking-widest">
                <th className="p-5">Demand ID</th>
                <th className="p-5">Buyer Entity</th>
                <th className="p-5">Crop & Variety</th>
                <th className="p-5">Target Qty (kg)</th>
                <th className="p-5">Quality</th>
                <th className="p-5">Delivery Corridor</th>
                <th className="p-5">Ceiling Price</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/20">
              {demands.map((dem) => {
                const initialQty = dem.initialQuantityKg || dem.quantityKg;
                const isPartiallyFulfilled = dem.status === 'Partially Fulfilled';
                const isFullyFulfilled = dem.status === 'Order Created' || dem.status === 'Fulfilled';

                return (
                  <tr key={dem.id} className="hover:bg-olive/10 transition">
                    <td className="p-5 font-bold text-forest/60 font-mono">{dem.id}</td>
                    <td className="p-5">
                      <span className="font-bold text-forest block">{dem.buyerName}</span>
                      <span className="text-[10px] text-forest/60 font-medium">{dem.buyerType}</span>
                    </td>
                    <td className="p-5">
                      <span className="font-bold text-forest block">{dem.crop}</span>
                      <span className="text-[10px] text-forest/70 font-medium">{dem.variety || 'Certified Hybrid'}</span>
                    </td>
                    <td className="p-5">
                      <span className="font-bold text-forest text-sm font-anton tracking-wide block">
                        {dem.quantityKg.toLocaleString()} kg
                      </span>
                      {isPartiallyFulfilled && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full block mt-0.5">
                          {dem.quantityKg.toLocaleString()} of {initialQty.toLocaleString()} kg remaining
                        </span>
                      )}
                      {isFullyFulfilled && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full block mt-0.5">
                          {initialQty.toLocaleString()} kg 100% Ordered
                        </span>
                      )}
                      {dem.unit && dem.unit !== 'kg' && (
                        <span className="text-[10px] text-forest/60">({(initialQty / getUnitMultiplier(dem.unit as any)).toLocaleString()} {dem.unit})</span>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="bg-sage/20 text-forest px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-sage/40">
                        {dem.qualityRequirement}
                      </span>
                    </td>
                    <td className="p-5 text-forest/70 font-medium">
                      <span className="block font-bold text-forest">{dem.deliveryDate}</span>
                      <span className="text-[10px] uppercase tracking-widest block">{dem.deliveryTimeWindow}</span>
                      <span className="text-[10px] text-forest/60 truncate max-w-[140px] block">{dem.location}</span>
                    </td>
                    <td className="p-5 font-anton text-lg text-forest tracking-wide">
                      ₹{dem.maxTargetPricePerKg} <span className="text-sm font-sans tracking-normal">/kg</span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest ${
                          isFullyFulfilled
                            ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                            : isPartiallyFulfilled
                            ? 'text-amber-900 bg-amber-100 border-amber-300'
                            : 'text-forest bg-sage/30 border-sage/50'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                          <span>{dem.status}</span>
                        </span>
                        {dem.syncStatus === 'PENDING_SYNC' && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider" title="Saved locally on device. Will sync once connected.">
                            <CloudOff className="w-2.5 h-2.5 text-amber-700" />
                            <span>Saved Offline</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveTab('smart-matching')}
                          className="px-3 py-1.5 bg-forest hover:bg-forest/90 text-cream text-[10px] font-bold rounded-lg transition uppercase tracking-wider flex items-center gap-1 shadow-xs"
                          title="Smart Match this Demand"
                        >
                          <Sparkles className="w-3 h-3 text-sage" />
                          <span>Match</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('demand-pool')}
                          className="px-3 py-1.5 bg-olive/20 hover:bg-olive/30 text-forest text-[10px] font-bold rounded-lg transition uppercase tracking-wider"
                          title="View in Aggregation Pool"
                        >
                          Pool
                        </button>
                        <button
                          onClick={() => deleteDemandRequest(dem.id)}
                          className="p-1.5 text-forest/40 hover:text-red-700 bg-olive/10 hover:bg-olive/20 rounded-lg transition"
                          title="Remove Demand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Demand Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#01472e]/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-cream rounded-[2.5rem] shadow-forest border border-olive/30 p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-olive/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-forest" />
                <div>
                  <h3 className="text-2xl font-anton text-forest tracking-wide">
                    Create Forward Demand Request
                  </h3>
                  <p className="text-xs text-forest/60 font-medium">
                    Register institutional procurement specifications for pooling and smart farmer matching.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-forest/50 hover:text-forest transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-5 text-xs">
              {/* Buyer Entity Representation */}
              <div>
                <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Buyer Entity Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. ABC Retail Stores, Koyambedu Fresh Mart"
                  className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              {/* Crop Commodity & Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Crop Commodity</label>
                  <select
                    value={crop}
                    onChange={(e) => {
                      const newCrop = e.target.value;
                      setCrop(newCrop);
                      if (newCrop === 'Tomato') setVariety('Sivam Hybrid');
                      else if (newCrop === 'Green Chilli') setVariety('G4 Hot');
                      else if (newCrop === 'Capsicum') setVariety('Bell Pepper (Green Wonder)');
                      else if (newCrop === 'Maize') setVariety('Sweet Corn Hybrid');
                    }}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Green Chilli">Green Chilli</option>
                    <option value="Capsicum">Capsicum</option>
                    <option value="Maize">Maize (Sweet Corn)</option>
                    <option value="Onion">Onion (Bellary)</option>
                    <option value="Potato">Potato (Kufri Jyoti)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Variety / Cultivar</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Sivam Hybrid, PKM-1, G4"
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Target Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Target Quantity</label>
                  <input
                    type="number"
                    value={rawQuantity}
                    onChange={(e) => setRawQuantity(Number(e.target.value))}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="Quintal">Quintals (100 kg)</option>
                    <option value="Crates">Crates (25 kg standard)</option>
                    <option value="Ton">Metric Tonnes (1,000 kg)</option>
                  </select>
                </div>
              </div>

              {/* Converted kg preview */}
              {unit !== 'kg' && (
                <div className="p-3 bg-sage/20 border border-sage/40 rounded-[1rem] flex items-center justify-between text-xs text-forest font-bold">
                  <span>Standardized Agricultural Volume:</span>
                  <span className="font-mono text-sm">{calculatedKg.toLocaleString()} kg</span>
                </div>
              )}

              {/* Quality & Ceiling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Quality Grade Requirement</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="Grade A">Grade A (Premium Brix &gt; 4.5, Firm)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Premium">Premium Export Standard</option>
                    <option value="Standard">Standard Domestic Market</option>
                    <option value="Any">Any Grade (Accept All)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Max Ceiling Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                    step="0.5"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Delivery Hub Location */}
              <div>
                <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Delivery Destination Hub / Corridor</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai Distribution Terminal, Koyambedu Hub"
                  className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              {/* Delivery Date & Time Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Required Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Delivery Time Window</label>
                  <input
                    type="text"
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    placeholder="e.g. 05:30 AM - 08:30 AM"
                    className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-olive/10 rounded-[1.5rem] border border-olive/30 text-xs text-forest/80 leading-relaxed font-medium">
                ⚡ <strong className="text-forest">Connected Lifecycle Integration:</strong> Once created, this demand is instantly persisted in shared storage, eligible for multi-buyer aggregation in the Demand Pool, and ranked in real-time by the Smart Matching Engine.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-olive/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-forest/70 hover:bg-olive/10 rounded-[1rem] font-bold uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-sage hover:bg-cream text-forest font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest"
                >
                  Create Demand Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
