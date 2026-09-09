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

  // Form state pre-populated with the primary scenario
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [quality, setQuality] = useState<'Grade A' | 'Grade B' | 'Any'>('Grade A');
  const [location, setLocation] = useState('Chennai Distribution Terminal');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-08');
  const [deliveryWindow, setDeliveryWindow] = useState('05:30 AM - 08:30 AM');
  const [maxPrice, setMaxPrice] = useState<number>(30.0);

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();

    const newReq: DemandRequest = {
      id: `DEM-TN-${Date.now().toString().slice(-3)}`,
      buyerId: currentUser.id || 'BUYER-01',
      buyerName: currentUser.organization || currentUser.name || 'Institutional Procurement',
      buyerType: 'Supermarket',
      crop,
      quantityKg: Number(quantityKg),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-emerald-700 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Bulk Institutional Buyer Procurement Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tracking-wide">
            Buyer Dashboard
          </h1>
          <p className="text-sm text-white/70 mt-2 font-medium">
            {currentUser.organization} • Active Multi-Buyer Forward Demands
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-100 hover:bg-white text-slate-900 text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            <span>Create Demand</span>
          </button>

          <button
            onClick={() => setActiveTab('demand-pool')}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-50 text-white text-xs font-bold px-5 py-3 rounded-[1rem] border border-slate-200 transition uppercase tracking-widest"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Demand Pool</span>
          </button>
        </div>
      </div>



      {/* Active Demands Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Active Institutional Demands
            </h3>
            <p className="text-xs text-slate-900/60 mt-1 font-bold uppercase tracking-widest">Forward procurement commitments ready for matching</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reverse-auction')}
              className="text-xs font-bold text-slate-900 hover:bg-white bg-emerald-100 px-5 py-3 rounded-[1rem] transition shadow-sm uppercase tracking-widest"
            >
              Open Reverse Auction →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900/70 font-bold uppercase tracking-widest">
                <th className="p-5">Demand ID</th>
                <th className="p-5">Buyer Entity</th>
                <th className="p-5">Crop</th>
                <th className="p-5">Target Qty</th>
                <th className="p-5">Quality</th>
                <th className="p-5">Delivery</th>
                <th className="p-5">Max Price</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive/20">
              {demands.map((dem) => (
                <tr key={dem.id} className="hover:bg-slate-50 transition">
                  <td className="p-5 font-bold text-slate-900/60">{dem.id}</td>
                  <td className="p-5 font-bold text-slate-900">{dem.buyerName}</td>
                  <td className="p-5 font-bold text-slate-900">{dem.crop}</td>
                  <td className="p-5 font-bold text-slate-900">{dem.quantityKg.toLocaleString()} kg</td>
                  <td className="p-5">
                    <span className="bg-emerald-100/20 text-slate-900 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-sage/40">
                      {dem.qualityRequirement}
                    </span>
                  </td>
                  <td className="p-5 text-slate-900/70 font-medium">
                    <span className="block font-bold text-slate-900">{dem.deliveryDate}</span>
                    <span className="text-[10px] uppercase tracking-widest">{dem.deliveryTimeWindow}</span>
                  </td>
                  <td className="p-5 font-bold tracking-tight text-lg text-slate-900 tracking-wide">₹{dem.maxTargetPricePerKg} <span className="text-sm font-sans tracking-normal">/kg</span></td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-900 bg-emerald-100/30 px-3 py-1.5 rounded-full border border-sage/50 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
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
                    <button
                      onClick={() => deleteDemandRequest(dem.id)}
                      className="p-1.5 text-slate-900/40 hover:text-red-700 bg-slate-50 hover:bg-slate-50 rounded-lg transition"
                      title="Remove Demand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Demand Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#01472e]/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-200 p-8 max-w-xl w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-slate-900" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 tracking-wide">
                  Create Forward Demand Request
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-900/50 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Crop Commodity</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="Tomato">Tomato (Grade A)</option>
                    <option value="Green Chilli">Green Chilli (G4)</option>
                    <option value="Capsicum">Capsicum (Bell Pepper)</option>
                    <option value="Maize">Maize (Sweet Corn)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Target Quantity (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    min="200"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Quality Grade Required</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  >
                    <option value="Grade A">Grade A (Brix &gt; 4.5, Firm)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Any">Any Grade</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Max Ceiling Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Delivery Destination Hub</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Required Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Delivery Time Window</label>
                  <input
                    type="text"
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 text-xs text-slate-900/80 leading-relaxed font-medium">
                ⚡ <strong className="text-slate-900">Demand-First Automation:</strong> Once submitted, Uzhavan Connect pools this demand with related regional requests, queries the forecast model, and initiates supplier allocation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-slate-900/70 hover:bg-slate-50 rounded-[1rem] font-bold uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-100 hover:bg-white text-slate-900 font-bold rounded-[1rem] shadow-sm transition uppercase tracking-widest"
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
