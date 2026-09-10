import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_DEMAND_REQUESTS, SMART_MATCH_SUPPLIERS } from '../data/mockData';
import { DemandRequest, WorkflowOrder, BuyerDeliveryConfirmation } from '../types';
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
  CloudOff,
  Check,
  AlertTriangle,
  QrCode,
  FileCheck2
} from 'lucide-react';
import { AiInsightCard } from '../components/AiInsightCard';
import confetti from 'canvas-confetti';

export const BuyerDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    openDemoMode,
    demandRequests: demands,
    addDemandRequest,
    deleteDemandRequest,
    orders,
    buyerConfirmDelivery,
    openPassportModal
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delivery confirmation modal state
  const [deliveryReceiptOrder, setDeliveryReceiptOrder] = useState<WorkflowOrder | null>(null);
  const [receivedKg, setReceivedKg] = useState<number>(1000);
  const [acceptedKg, setAcceptedKg] = useState<number>(1000);
  const [rejectedKg, setRejectedKg] = useState<number>(0);
  const [acceptanceStatus, setAcceptanceStatus] = useState<'ACCEPTED_FULL' | 'ACCEPTED_PARTIAL' | 'REJECTED'>('ACCEPTED_FULL');
  const [issuesReported, setIssuesReported] = useState<string>('All crates received intact at 4°C. Clean handover.');
  const [receiverName, setReceiverName] = useState<string>(currentUser.name || 'S. Sundaresan');
  const [receiverRole, setReceiverRole] = useState<string>('Receiving In-Charge');

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

  const handleOpenDeliveryModal = (order: WorkflowOrder) => {
    const qty = order.packedQuantityKg || order.acceptedQuantityKg || order.quantityKg;
    setDeliveryReceiptOrder(order);
    setReceivedKg(qty);
    setAcceptedKg(qty);
    setRejectedKg(0);
    setAcceptanceStatus('ACCEPTED_FULL');
    setIssuesReported('All crates inspected and accepted in fresh condition.');
    setReceiverName(currentUser.name || 'S. Sundaresan');
    setReceiverRole('Receiving Logistics In-Charge');
  };

  const handleConfirmDeliveryReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryReceiptOrder) return;

    const confirmation: BuyerDeliveryConfirmation = {
      orderId: deliveryReceiptOrder.id,
      deliveredQuantityKg: Number(deliveryReceiptOrder.packedQuantityKg || deliveryReceiptOrder.quantityKg),
      receivedQuantityKg: Number(receivedKg),
      acceptedQuantityKg: Number(acceptedKg),
      rejectedQuantityKg: Number(rejectedKg),
      acceptanceStatus,
      issuesReported,
      receiverName,
      receiverRole,
      confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      signatureOrOtp: `OTP-CONFIRMED-${Math.floor(100000 + Math.random() * 900000)}`
    };

    buyerConfirmDelivery(deliveryReceiptOrder.id, confirmation);
    setDeliveryReceiptOrder(null);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const totalDemandVolumeKg = demands.reduce((sum, d) => sum + d.quantityKg, 0);
  const totalAllocatedVolumeKg = demands.reduce((sum, d) => sum + (d.allocatedQuantityKg || 0), 0);
  const activeCropsCount = new Set(demands.map((d) => d.crop)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Institutional Procurement Hub</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
              Demand Aggregation Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Buyer Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-2 font-normal">
            {currentUser.organization || 'Uzhavan Institutional Network'} • Real-Time Forward Demand & Procurement Pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>Create Demand</span>
          </button>

          <button
            onClick={() => setActiveTab('demand-pool')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2.5 rounded-xl border border-white/20 transition tracking-wide"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Demand Pool</span>
          </button>
        </div>
      </div>

      {/* Embedded AI Decision Support: Demand Aggregation & Freight Optimization */}
      <AiInsightCard
        title="Multi-Buyer Demand Aggregation Window Active"
        subtitle="AI Cluster Engine detected 2,800 kg Tomato procurement across Chennai and Coimbatore institutional buyers."
        recommendation="Consolidating forward commitments before 08:00 AM unlocks 14.2% cold-chain freight savings and guarantees priority FPO packing slots."
        metrics={[
          { label: 'Freight Savings', value: '14.2%', trend: 'up' },
          { label: 'Aggregated Volume', value: `${totalDemandVolumeKg.toLocaleString()} kg` },
          { label: 'Cluster Hubs', value: '4 Active' },
          { label: 'FPO Match Readiness', value: '98.6%', trend: 'up' }
        ]}
        actionLabel="Inspect Demand Pool Aggregation"
        onAction={() => setActiveTab('demand-pool')}
        badgeText="AI Procurement Intelligence"
      />

      {/* Procurement Metrics Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Active Demands</span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{demands.length}</p>
          <span className="text-xs text-slate-500 font-medium">Across {activeCropsCount} Commodities</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Unmet Target Volume</span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{totalDemandVolumeKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">kg</span></p>
          <span className="text-xs text-emerald-700 font-semibold">Open for Allocation</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Allocated Volume</span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{totalAllocatedVolumeKg.toLocaleString()} <span className="text-sm font-normal text-slate-500">kg</span></p>
          <span className="text-xs text-slate-500 font-medium">Under Contract</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-1">Aggregation Ready</span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">100%</p>
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Coordinated Logistics</span>
        </div>
      </div>

      {/* Active Demands Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-slate-900">
              Active Institutional Demands
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">Forward procurement commitments ready for multi-buyer aggregation and farmer matching</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('smart-matching')}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Launch Smart Matching</span>
            </button>
            <button
              onClick={() => setActiveTab('reverse-auction')}
              className="btn-secondary text-xs py-2 px-4"
            >
              Open Reverse Auction →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <th className="p-4 sm:px-6">Demand ID</th>
                <th className="p-4">Buyer Entity</th>
                <th className="p-4">Crop & Variety</th>
                <th className="p-4">Target Qty</th>
                <th className="p-4">Quality</th>
                <th className="p-4">Delivery Corridor</th>
                <th className="p-4">Ceiling Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 sm:pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demands.map((dem) => {
                const initialQty = dem.initialQuantityKg || dem.quantityKg;
                const isPartiallyFulfilled = dem.status === 'Partially Fulfilled';
                const isFullyFulfilled = dem.status === 'Order Created' || dem.status === 'Fulfilled';

                return (
                  <tr key={dem.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 sm:px-6 font-semibold text-slate-500 font-mono text-xs">{dem.id}</td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{dem.buyerName}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{dem.buyerType}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{dem.crop}</span>
                      <span className="text-[11px] text-slate-500 font-normal">{dem.variety || 'Certified Hybrid'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-900 text-sm block">
                        {dem.quantityKg.toLocaleString()} kg
                      </span>
                      {isPartiallyFulfilled && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {dem.quantityKg.toLocaleString()} of {initialQty.toLocaleString()} kg remaining
                        </span>
                      )}
                      {isFullyFulfilled && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {initialQty.toLocaleString()} kg 100% Ordered
                        </span>
                      )}
                      {dem.unit && dem.unit !== 'kg' && (
                        <span className="text-[11px] text-slate-400 block">({(initialQty / getUnitMultiplier(dem.unit as any)).toLocaleString()} {dem.unit})</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="ai-badge-blue text-[10px]">
                        {dem.qualityRequirement}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="block font-medium text-slate-900">{dem.deliveryDate}</span>
                      <span className="text-[11px] text-slate-500 block">{dem.deliveryTimeWindow}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">{dem.location}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-900 text-sm">
                      ₹{dem.maxTargetPricePerKg} <span className="text-xs font-normal text-slate-400">/kg</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isFullyFulfilled
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : isPartiallyFulfilled
                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>{dem.status}</span>
                        </span>
                        {dem.syncStatus === 'PENDING_SYNC' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full" title="Saved locally on device. Will sync once connected.">
                            <CloudOff className="w-2.5 h-2.5 text-amber-600" />
                            <span>Saved Offline</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveTab('smart-matching')}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition flex items-center gap-1 shadow-xs"
                          title="Smart Match this Demand"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Match</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('demand-pool')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                          title="View in Aggregation Pool"
                        >
                          Pool
                        </button>
                        <button
                          onClick={() => deleteDemandRequest(dem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition"
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

      {/* Connected Inbound Shipments & Receiving Bay */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Inbound Logistics & Receiving Bay</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-slate-900">
              Active Procurement Shipments & Gate Receiving
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Live traceability from FPO farm collections, quality inspection, cold-chain transit to dock receipt
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              {orders.length} Total Orders
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {orders.filter(o => o.status === 'Delivered' || o.transportStatus === 'Delivered').length} Arrived at Dock
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="font-semibold text-slate-700 text-base">No active procurement shipments yet</p>
            <p className="text-xs mt-1 text-slate-500">Execute Smart Matching on forward demands to create fulfillment orders.</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => {
              const isDelivered = order.status === 'Delivered' || order.transportStatus === 'Delivered';
              const isBuyerConfirmed = !!order.buyerConfirmation || order.status === 'Buyer Confirmed' || order.status === 'Payment Pending' || order.status === 'Completed';
              const farmerCount = order.farmerContributions?.length || 1;
              const collectedKg = order.collectedQuantityKg || 0;
              const percentCollected = Math.min(100, Math.round((collectedKg / order.quantityKg) * 100));

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">{order.id}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">{order.date}</span>
                      </div>
                      <h4 className="text-lg font-medium text-slate-900 tracking-tight mt-0.5">
                        {order.crop} <span className="text-xs font-normal text-slate-500">({order.variety || 'Hybrid'})</span>
                      </h4>
                      <p className="text-xs text-slate-600">
                        Origin: <strong className="text-slate-900 font-semibold">{order.fpoName || 'GreenHarvest FPO'}</strong> ({order.farmerLocation})
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        isBuyerConfirmed
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : isDelivered
                          ? 'text-sky-800 bg-sky-50 border-sky-200 animate-pulse'
                          : order.status === 'In Transit'
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : order.status === 'Packed'
                          ? 'text-teal-800 bg-teal-50 border-teal-200'
                          : order.status === 'Quality Checked'
                          ? 'text-indigo-800 bg-indigo-50 border-indigo-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        <span>{order.status}</span>
                      </span>
                      <span className="text-base font-semibold text-slate-900 mt-1">
                        ₹{order.totalValue.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">₹{order.pricePerKg}/kg • {order.quantityKg.toLocaleString()} kg</span>
                    </div>
                  </div>

                  {/* Multi-Farmer Consolidation Traceability */}
                  <div className="bg-slate-50/80 rounded-lg p-3.5 space-y-2 border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Farm Consolidation ({farmerCount} Member Farmer{farmerCount > 1 ? 's' : ''})</span>
                      </span>
                      <span className="font-mono text-slate-700 font-medium text-[11px]">
                        {collectedKg.toLocaleString()} / {order.quantityKg.toLocaleString()} kg ({percentCollected}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentCollected}%` }}
                      />
                    </div>

                    {order.farmerContributions && order.farmerContributions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.farmerContributions.map((fc, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {fc.farmerName}: <strong>{fc.collectedQuantityKg || 0}/{fc.contributedQuantityKg} kg</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quality & Packing Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Quality Signoff</span>
                      {order.inspectionMetrics ? (
                        <div className="space-y-0.5 text-slate-700">
                          <p className="font-semibold text-emerald-700">{order.qualityGrade || 'Grade A'} Certified</p>
                          <p className="text-[11px] text-slate-500">Brix: {order.inspectionMetrics.sugarBrix}° | Firmness: {order.inspectionMetrics.firmnessKgCm}</p>
                          {order.acceptedQuantityKg !== undefined && (
                            <p className="text-[11px] text-emerald-800 font-semibold">{order.acceptedQuantityKg.toLocaleString()} kg accepted</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Inspection pending at hub</p>
                      )}
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">Packing & Crates</span>
                      {order.packingStatus === 'Packed' ? (
                        <div className="space-y-0.5 text-slate-700">
                          <p className="font-semibold text-teal-700">{order.crateCount || Math.ceil((order.packedQuantityKg || order.quantityKg) / 25)} Crates Packed</p>
                          <p className="text-[11px] text-slate-500 truncate">{order.packageType || '25kg Agro-Crates'}</p>
                          <span className="text-[10px] font-mono text-slate-400">QR: {order.batchId}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Packing in queue</p>
                      )}
                    </div>
                  </div>

                  {/* Transport Telemetry */}
                  {order.transportDetails && (
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {order.transportDetails.vehicleNumber} ({order.transportDetails.carrierName})
                          </p>
                          <p className="text-[11px] text-slate-500">Driver: {order.transportDetails.driverName} • {order.transportDetails.driverPhone}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                        {order.transportStatus || 'Transport Active'}
                      </span>
                    </div>
                  )}

                  {/* Receiving Bay Action Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Produce Passport</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isDelivered && !isBuyerConfirmed && (
                        <button
                          onClick={() => handleOpenDeliveryModal(order)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-sm animate-pulse"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Inspect & Confirm Delivery</span>
                        </button>
                      )}

                      {isBuyerConfirmed && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Receipt Confirmed ({order.buyerConfirmation?.acceptedQuantityKg || order.quantityKg} kg)</span>
                          </span>
                          <button
                            onClick={() => setActiveTab('settlement')}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition"
                          >
                            Escrow →
                          </button>
                        </div>
                      )}

                      {!isDelivered && !isBuyerConfirmed && (
                        <span className="text-xs text-slate-400 font-normal italic">
                          Awaiting dock delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Demand Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-slate-900">
                    Create Forward Demand Request
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Register institutional procurement specifications for pooling and smart farmer matching.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition text-lg font-medium p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4 text-xs">
              {/* Buyer Entity Representation */}
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Buyer Entity Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. ABC Retail Stores, Koyambedu Fresh Mart"
                  className="input-modern"
                  required
                />
              </div>

              {/* Crop Commodity & Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Crop Commodity</label>
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
                    className="input-modern"
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
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Variety / Cultivar</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Sivam Hybrid, PKM-1, G4"
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              {/* Target Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Target Quantity</label>
                  <input
                    type="number"
                    value={rawQuantity}
                    onChange={(e) => setRawQuantity(Number(e.target.value))}
                    className="input-modern"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="input-modern"
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
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                  <span>Standardized Agricultural Volume:</span>
                  <span className="font-mono text-sm font-semibold">{calculatedKg.toLocaleString()} kg</span>
                </div>
              )}

              {/* Quality & Ceiling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Quality Grade Requirement</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="input-modern"
                  >
                    <option value="Grade A">Grade A (Premium Brix &gt; 4.5, Firm)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Premium">Premium Export Standard</option>
                    <option value="Standard">Standard Domestic Market</option>
                    <option value="Any">Any Grade (Accept All)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Max Ceiling Price (₹/kg)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="input-modern"
                    step="0.5"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Delivery Hub Location */}
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Delivery Destination Hub / Corridor</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai Distribution Terminal, Koyambedu Hub"
                  className="input-modern"
                  required
                />
              </div>

              {/* Delivery Date & Time Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Required Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[11px]">Delivery Time Window</label>
                  <input
                    type="text"
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    placeholder="e.g. 05:30 AM - 08:30 AM"
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-normal">
                ⚡ <strong className="text-slate-900 font-semibold">Connected Lifecycle Integration:</strong> Once created, this demand is instantly persisted in shared storage, eligible for multi-buyer aggregation in the Demand Pool, and ranked in real-time by the Smart Matching Engine.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-5"
                >
                  Create Demand Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Delivery Verification & Receipt Modal */}
      {deliveryReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <FileCheck2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-slate-900">
                    Dockside Produce Inspection & Receiving Handover
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Order <span className="font-mono font-semibold text-slate-800">{deliveryReceiptOrder.id}</span> • Batch <span className="font-mono font-semibold text-slate-800">{deliveryReceiptOrder.batchId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeliveryReceiptOrder(null)}
                className="text-slate-400 hover:text-slate-700 transition text-lg font-medium p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Shipment Summary Strip */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Produce</span>
                <strong className="text-slate-900 text-sm font-medium">{deliveryReceiptOrder.crop}</strong>
                <span className="text-[11px] text-slate-500 block">({deliveryReceiptOrder.variety})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Delivered Volume</span>
                <strong className="text-slate-900 text-sm font-semibold">
                  {(deliveryReceiptOrder.packedQuantityKg || deliveryReceiptOrder.quantityKg).toLocaleString()} kg
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  {deliveryReceiptOrder.crateCount || Math.ceil((deliveryReceiptOrder.packedQuantityKg || deliveryReceiptOrder.quantityKg) / 25)} Crates
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Contract Rate</span>
                <strong className="text-slate-900 text-sm font-semibold">₹{deliveryReceiptOrder.pricePerKg}/kg</strong>
                <span className="text-[11px] text-slate-500 block">Grade {deliveryReceiptOrder.qualityGrade || 'A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Inbound Carrier</span>
                <strong className="text-slate-900 text-xs truncate block font-semibold">
                  {deliveryReceiptOrder.transportDetails?.carrierName || 'Cold-Chain Express'}
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  {deliveryReceiptOrder.transportDetails?.vehicleNumber || 'TN-38-BZ-4419'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDeliveryReceipt} className="space-y-4 text-xs">
              {/* Quantities Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Gross Received (kg)
                  </label>
                  <input
                    type="number"
                    value={receivedKg}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setReceivedKg(val);
                      setAcceptedKg(Math.max(0, val - rejectedKg));
                    }}
                    className="input-modern font-medium text-base text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-emerald-800 uppercase tracking-wider block mb-1 text-[10px]">
                    Accepted Volume (kg)
                  </label>
                  <input
                    type="number"
                    value={acceptedKg}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setAcceptedKg(val);
                      setRejectedKg(Math.max(0, receivedKg - val));
                      if (val === receivedKg) setAcceptanceStatus('ACCEPTED_FULL');
                      else if (val > 0) setAcceptanceStatus('ACCEPTED_PARTIAL');
                      else setAcceptanceStatus('REJECTED');
                    }}
                    className="input-modern font-medium text-base text-emerald-800 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-rose-800 uppercase tracking-wider block mb-1 text-[10px]">
                    Rejected / Damaged (kg)
                  </label>
                  <input
                    type="number"
                    value={rejectedKg}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setRejectedKg(val);
                      setAcceptedKg(Math.max(0, receivedKg - val));
                      if (val === 0) setAcceptanceStatus('ACCEPTED_FULL');
                      else if (val >= receivedKg) setAcceptanceStatus('REJECTED');
                      else setAcceptanceStatus('ACCEPTED_PARTIAL');
                    }}
                    className="input-modern font-medium text-base text-rose-800 border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Acceptance Status Decision */}
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">
                  Quality Gate Signoff Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'ACCEPTED_FULL',
                      label: 'Full Acceptance (100%)',
                      desc: 'Produce conforms to Grade A standard'
                    },
                    {
                      id: 'ACCEPTED_PARTIAL',
                      label: 'Partial Acceptance',
                      desc: 'Deduct non-conforming crates'
                    },
                    {
                      id: 'REJECTED',
                      label: 'Consignment Rejected',
                      desc: 'Quality failure or critical damage'
                    }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const status = opt.id as any;
                        setAcceptanceStatus(status);
                        if (status === 'ACCEPTED_FULL') {
                          setAcceptedKg(receivedKg);
                          setRejectedKg(0);
                        } else if (status === 'REJECTED') {
                          setAcceptedKg(0);
                          setRejectedKg(receivedKg);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition ${
                        acceptanceStatus === opt.id
                          ? opt.id === 'ACCEPTED_FULL'
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium shadow-xs'
                            : opt.id === 'ACCEPTED_PARTIAL'
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium shadow-xs'
                            : 'bg-rose-50 border-rose-400 text-rose-950 font-medium shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium text-xs">{opt.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issues Reported / Receiving Remarks */}
              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  Receiving Inspection Remarks & Observations
                </label>
                <textarea
                  value={issuesReported}
                  onChange={(e) => setIssuesReported(e.target.value)}
                  rows={2}
                  className="input-modern"
                  placeholder="Record cold-chain temp log, crate condition, or defect notes..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Cold-Chain Intact (4.2°C logged)',
                    'Zero transit bruising observed',
                    'Minor 15kg crate sorting defect deducted',
                    'Tamper-evident QR seal intact'
                  ].map((quickNote, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIssuesReported(quickNote)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-md border border-slate-200 transition"
                    >
                      + {quickNote}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signoff Personnel Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Receiving Officer Name
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Officer Designation / Role
                  </label>
                  <input
                    type="text"
                    value={receiverRole}
                    onChange={(e) => setReceiverRole(e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>
              </div>

              {/* Settlement Impact Notice */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-medium text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Transparent Escrow Payout Impact</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  Signing this receipt locks final accepted volume at <strong>{acceptedKg.toLocaleString()} kg</strong> (₹{(acceptedKg * deliveryReceiptOrder.pricePerKg).toLocaleString()} total value).
                  The escrow engine will automatically disburse <strong>89% directly to member farmers / FPO</strong> and <strong>8% to cold-chain logistics</strong>.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveryReceiptOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-5 flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Confirm Receipt & Release Escrow Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
