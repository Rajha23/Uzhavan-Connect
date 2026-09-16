import { getCropImageUrl } from '../utils/cropImages';
import React, { useState } from 'react';
import { BuyerFeedbackForm } from './feedback/BuyerFeedbackForm';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_DEMAND_REQUESTS, SMART_MATCH_SUPPLIERS } from '../data/mockData';
import { DemandRequest, WorkflowOrder, BuyerDeliveryConfirmation } from '../types';
import { KPIGrid, KPIStatCard } from '../components/KPIGrid';
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
  FileCheck2,
  Package,
  Gavel
} from 'lucide-react';
import { AiInsightCard } from '../components/AiInsightCard';
import { UpcomingTasksWidget } from '../components/task';
import confetti from 'canvas-confetti';

export const BuyerDashboard: React.FC = () => {
  const { t } = useLanguage();
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

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState('');

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
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-emerald-500/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccd5ae]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#ccd5ae] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>{t('buyer.institutionalProcurementHub', 'Institutional Procurement Hub')}</span>
            <span className="bg-[#e9edc9]/20 text-[#fefae0] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#e9edc9]/30">
              {t('buyer.demandAggregationActive', 'Demand Aggregation Active')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {t('buyer.buyerDashboard', 'Buyer Dashboard')}
          </h1>
          <p className="text-sm text-white/80 mt-2 font-normal">
            {currentUser.organization || 'Uzhavan Institutional Network'} • {t('buyer.buyerSubtitle', 'Real-Time Forward Demand & Procurement Pipeline')}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#e9edc9] hover:bg-[#fefae0] text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-sm transition tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>{t('buyer.createDemand', 'Create Demand')}</span>
          </button>

          <button
            onClick={() => setActiveTab('demand-pool')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-5 py-3 rounded-2xl border border-white/20 transition tracking-wide backdrop-blur-sm"
          >
            <Layers className="w-4 h-4 text-[#ccd5ae]" />
            <span>{t('buyer.demandPool', 'Demand Pool')}</span>
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
      <KPIGrid columns={4}>
        <KPIStatCard
          label={t('buyer.activeDemands', 'Active Demands')}
          value={demands.length}
          subtitle={t('buyer.acrossCommodities', 'Across {count} Commodities', { count: activeCropsCount })}
          icon={Layers}
        />

        <KPIStatCard
          label={t('buyer.unmetTargetVolume', 'Unmet Target Volume')}
          value={`${totalDemandVolumeKg.toLocaleString()} kg`}
          subtitle={t('buyer.openForAllocation', 'Open for Allocation')}
          icon={Package}
        />

        <KPIStatCard
          label={t('buyer.allocatedVolume', 'Allocated Volume')}
          value={`${totalAllocatedVolumeKg.toLocaleString()} kg`}
          subtitle={t('buyer.underContract', 'Under Contract')}
          icon={CheckCircle2}
        />

        <KPIStatCard
          label={t('buyer.aggregationReady', 'Aggregation Ready')}
          value="100%"
          subtitle={t('buyer.coordinatedLogistics', 'Coordinated Logistics')}
          icon={TrendingUp}
        />
      </KPIGrid>

      {/* Upcoming Tasks Widget */}
      <UpcomingTasksWidget limit={4} />

      {/* ─── Feedback Call-to-Action Banner ─────────────────────────────────── */}
      {orders.filter((o) => ['DELIVERED', 'RECEIPT_CONFIRMED'].includes(o.status) && !o.feedbackSubmitted).length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                You have {orders.filter((o) => ['DELIVERED', 'RECEIPT_CONFIRMED'].includes(o.status) && !o.feedbackSubmitted).length} order(s) awaiting feedback
              </p>
              <p className="text-xs text-amber-700">Share your experience to help improve the platform and earn loyalty points.</p>
            </div>
          </div>
          <button
            onClick={() => {
              const unratedOrders = orders.filter((o) => ['DELIVERED', 'RECEIPT_CONFIRMED'].includes(o.status) && !o.feedbackSubmitted);
              if (unratedOrders.length > 0) { setFeedbackOrderId(unratedOrders[0].id); setShowFeedbackForm(true); }
            }}
            className="shrink-0 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition cursor-pointer"
          >
            Rate Now
          </button>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <BuyerFeedbackForm
              orderId={feedbackOrderId}
              farmerName="Farmer"
              onClose={() => setShowFeedbackForm(false)}
            />
          </div>
        </div>
      )}

      {/* Active Demands Table */}
      <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#ccd5ae]/30 bg-gradient-to-r from-white via-[#fefae0]/20 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#01472e]">
              {t('buyer.activeInstitutionalDemands', 'Active Institutional Demands')}
            </h3>
            <p className="text-xs text-[#01472e]/70 mt-1 font-normal">{t('buyer.activeDemandsSubtitle', 'Forward procurement commitments ready for multi-buyer aggregation and farmer matching')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('smart-matching')}
              className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#ccd5ae]" />
              <span>{t('buyer.launchSmartMatching', 'Launch Smart Matching')}</span>
            </button>
            <button
              onClick={() => setActiveTab('reverse-auction')}
              className="btn-secondary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-2"
            >
              <Gavel className="w-3.5 h-3.5 text-[#01472e]" />
              <span>{t('buyer.openReverseAuction', 'Open Reverse Auction →')}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fefae0]/50 border-b border-[#ccd5ae]/40 text-[#01472e]/70 font-semibold uppercase text-[11px] tracking-wider">
                <th className="p-4 sm:px-6">{t('buyer.demandId', 'Demand ID')}</th>
                <th className="p-4">{t('buyer.buyerEntity', 'Buyer Entity')}</th>
                <th className="p-4">{t('buyer.cropVariety', 'Crop & Variety')}</th>
                <th className="p-4">{t('buyer.targetQty', 'Target Qty')}</th>
                <th className="p-4">{t('buyer.quality', 'Quality')}</th>
                <th className="p-4">{t('buyer.deliveryCorridor', 'Delivery Corridor')}</th>
                <th className="p-4">{t('buyer.ceilingPrice', 'Ceiling Price')}</th>
                <th className="p-4">{t('buyer.status', 'Status')}</th>
                <th className="p-4 sm:pr-6 text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ccd5ae]/20">
              {demands.map((dem) => {
                const initialQty = dem.initialQuantityKg || dem.quantityKg;
                const isPartiallyFulfilled = dem.status === 'Partially Fulfilled';
                const isFullyFulfilled = dem.status === 'Order Created' || dem.status === 'Fulfilled';

                return (
                  <tr key={dem.id} className="hover:bg-[#eaf4ec]/30 transition">
                    <td className="p-4 sm:px-6 font-semibold text-[#01472e]/70 font-mono text-xs">{dem.id}</td>
                    <td className="p-4">
                      <span className="font-semibold text-[#01472e] block">{dem.buyerName}</span>
                      <span className="text-[11px] text-[#01472e]/60 font-normal">{dem.buyerType}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={getCropImageUrl(dem.crop)} alt={dem.crop} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm border border-[#ccd5ae]/40" />
                        <div>
                          <span className="font-semibold text-[#01472e] block">{dem.crop}</span>
                          <span className="text-[11px] text-[#01472e]/60 font-normal">{dem.variety || 'Certified Hybrid'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#01472e] text-sm block">
                        {dem.quantityKg.toLocaleString()} kg
                      </span>
                      {isPartiallyFulfilled && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block mt-1">
                          {dem.quantityKg.toLocaleString()} of {initialQty.toLocaleString()} kg remaining
                        </span>
                      )}
                      {isFullyFulfilled && (
                        <span className="text-[10px] font-semibold text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/40 px-2.5 py-0.5 rounded-full inline-block mt-1">
                          {initialQty.toLocaleString()} kg 100% Ordered
                        </span>
                      )}
                      {dem.unit && dem.unit !== 'kg' && (
                        <span className="text-[11px] text-[#01472e]/50 block">({(initialQty / getUnitMultiplier(dem.unit as any)).toLocaleString()} {dem.unit})</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="ai-badge text-[10px]">
                        {dem.qualityRequirement}
                      </span>
                    </td>
                    <td className="p-4 text-[#01472e]/80">
                      <span className="block font-semibold text-[#01472e]">{dem.deliveryDate}</span>
                      <span className="text-[11px] text-[#01472e]/70 block">{dem.deliveryTimeWindow}</span>
                      <span className="text-[11px] text-[#01472e]/50 truncate max-w-[140px] block">{dem.location}</span>
                    </td>
                    <td className="p-4 font-semibold text-[#01472e] text-sm">
                      ₹{dem.maxTargetPricePerKg} <span className="text-xs font-normal text-[#01472e]/60">/kg</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isFullyFulfilled
                            ? 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
                            : isPartiallyFulfilled
                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                            : 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#01472e] animate-pulse" />
                          <span>{dem.status}</span>
                        </span>
                        {dem.syncStatus === 'PENDING_SYNC' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full" title="Saved locally on device. Will sync once connected.">
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
                          className="px-3 py-1.5 bg-[#01472e] hover:bg-[#025a3b] text-white text-[11px] font-semibold rounded-xl transition flex items-center gap-1 shadow-xs"
                          title="Smart Match this Demand"
                        >
                          <Sparkles className="w-3 h-3 text-[#ccd5ae]" />
                          <span>Match</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('demand-pool')}
                          className="px-3 py-1.5 bg-[#e9edc9]/50 hover:bg-[#e9edc9] text-[#01472e] text-[11px] font-semibold rounded-xl transition"
                          title="View in Aggregation Pool"
                        >
                          Pool
                        </button>
                        <button
                          onClick={() => deleteDemandRequest(dem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition"
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
      <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#ccd5ae]/30 bg-gradient-to-r from-white via-[#fefae0]/20 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#01472e] text-xs font-semibold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4 text-[#01472e]" />
              <span>{t('buyer.inboundLogistics', 'Inbound Logistics & Receiving Bay')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#01472e]">
              {t('buyer.activeShipments', 'Active Procurement Shipments & Gate Receiving')}
            </h3>
            <p className="text-xs text-[#01472e]/70 font-normal mt-0.5">
              {t('buyer.shipmentsSubtitle', 'Live traceability from FPO farm collections, quality inspection, cold-chain transit to dock receipt')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/40 border border-[#ccd5ae]/50 px-3.5 py-1.5 rounded-xl">
              {t('buyer.totalOrders', '{count} Total Orders', { count: orders.length })}
            </span>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1.5 rounded-xl border border-[#a3b18a]/40">
              {t('buyer.arrivedAtDock', '{count} Arrived at Dock', { count: orders.filter(o => o.status === 'Delivered' || o.transportStatus === 'Delivered').length })}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-[#01472e]/40">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#01472e]" />
            <p className="font-semibold text-[#01472e] text-base">{t('buyer.noShipments', 'No active procurement shipments yet')}</p>
            <p className="text-xs mt-1 text-[#01472e]/60">{t('buyer.executeSmartMatchingHint', 'Execute Smart Matching on forward demands to create fulfillment orders.')}</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => {
              const isDelivered = order.status === 'Delivered' || order.transportStatus === 'Delivered';
              const isBuyerConfirmed = !!order.buyerConfirmation || order.status === 'Buyer Confirmed' || order.status === 'Payment Pending' || order.status === 'Completed';
              const farmerCount = order.farmerContributions?.length || 1;
              const collectedKg = order.collectedQuantityKg || 0;
              const percentCollected = Math.min(100, Math.round((collectedKg / order.quantityKg) * 100));

              return (
                <div
                  key={order.id}
                  className="bg-[#faf9f5] rounded-[24px] border border-[#ccd5ae]/40 p-6 shadow-xs hover:shadow-soft transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#ccd5ae]/30 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#01472e]/70">{order.id}</span>
                        <span className="text-[10px] text-[#ccd5ae]">•</span>
                        <span className="text-xs text-[#01472e]/60 font-medium">{order.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 mb-1">
                        <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-10 h-10 rounded-lg object-cover shadow-sm border border-[#ccd5ae]/40" />
                        <h4 className="text-lg font-semibold text-[#01472e] tracking-tight">
                          {order.crop} <span className="text-xs font-normal text-[#01472e]/60">({order.variety || 'Hybrid'})</span>
                        </h4>
                      </div>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        {t('buyer.origin', 'Origin')}: <strong className="text-[#01472e] font-semibold">{order.fpoName || 'GreenHarvest FPO'}</strong> ({order.farmerLocation})
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        isBuyerConfirmed
                          ? 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
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
                      <span className="text-base font-semibold text-[#01472e] mt-1">
                        ₹{order.totalValue.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-[#01472e]/60">₹{order.pricePerKg}/kg • {order.quantityKg.toLocaleString()} kg</span>
                    </div>
                  </div>

                  {/* Multi-Farmer Consolidation Traceability */}
                  <div className="bg-white/80 rounded-2xl p-4 space-y-2 border border-[#ccd5ae]/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#01472e] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>{t('buyer.farmConsolidation', 'Farm Consolidation ({count} Member Farmer{s})', { count: farmerCount, s: farmerCount > 1 ? 's' : '' })}</span>
                      </span>
                      <span className="font-mono text-[#01472e] font-semibold text-[11px]">
                        {collectedKg.toLocaleString()} / {order.quantityKg.toLocaleString()} kg ({percentCollected}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#e9edc9]/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#01472e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentCollected}%` }}
                      />
                    </div>

                    {order.farmerContributions && order.farmerContributions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.farmerContributions.map((fc, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-[#faf9f5] text-[#01472e] px-2.5 py-0.5 rounded-lg border border-[#ccd5ae]/40"
                          >
                            {fc.farmerName}: <strong>{fc.collectedQuantityKg || 0}/{fc.contributedQuantityKg} kg</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quality & Packing Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/70 p-3.5 rounded-2xl border border-[#ccd5ae]/30">
                      <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block mb-0.5">{t('buyer.qualitySignoff', 'Quality Signoff')}</span>
                      {order.inspectionMetrics ? (
                        <div className="space-y-0.5 text-[#01472e]">
                          <p className="font-semibold text-[#01472e]">{order.qualityGrade || 'Grade A'} Certified</p>
                          <p className="text-[11px] text-[#01472e]/70">Brix: {order.inspectionMetrics.sugarBrix}° | Firmness: {order.inspectionMetrics.firmnessKgCm}</p>
                          {order.acceptedQuantityKg !== undefined && (
                            <p className="text-[11px] text-[#01472e] font-semibold">{order.acceptedQuantityKg.toLocaleString()} kg accepted</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#01472e]/40 italic">{t('buyer.inspectionPending', 'Inspection pending at hub')}</p>
                      )}
                    </div>

                    <div className="bg-white/70 p-3.5 rounded-2xl border border-[#ccd5ae]/30">
                      <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block mb-0.5">{t('buyer.packingAndCrates', 'Packing & Crates')}</span>
                      {order.packingStatus === 'Packed' ? (
                        <div className="space-y-0.5 text-[#01472e]">
                          <p className="font-semibold text-[#01472e]">{order.crateCount || Math.ceil((order.packedQuantityKg || order.quantityKg) / 25)} Crates Packed</p>
                          <p className="text-[11px] text-[#01472e]/70 truncate">{order.packageType || '25kg Agro-Crates'}</p>
                          <span className="text-[10px] font-mono text-[#01472e]/50">QR: {order.batchId}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#01472e]/40 italic">{t('buyer.packingInQueue', 'Packing in queue')}</p>
                      )}
                    </div>
                  </div>

                  {/* Transport Telemetry */}
                  {order.transportDetails && (
                    <div className="bg-white/70 p-3.5 rounded-2xl border border-[#ccd5ae]/30 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-[#a3b18a]" />
                        <div>
                          <p className="font-semibold text-[#01472e] text-xs">
                            {order.transportDetails.vehicleNumber} ({order.transportDetails.carrierName})
                          </p>
                          <p className="text-[11px] text-[#01472e]/70">Driver: {order.transportDetails.driverName} • {order.transportDetails.driverPhone}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/50 px-2.5 py-0.5 rounded-lg">
                        {order.transportStatus || 'Transport Active'}
                      </span>
                    </div>
                  )}

                  {/* Receiving Bay Action Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#ccd5ae]/30">
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-xs font-semibold text-[#01472e] hover:text-[#025a3b] flex items-center gap-1.5 transition"
                    >
                      <QrCode className="w-4 h-4 text-[#01472e]" />
                      <span>{t('buyer.producePassport', 'Produce Passport')}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isDelivered && !isBuyerConfirmed && (
                        <button
                          onClick={() => handleOpenDeliveryModal(order)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold text-xs rounded-xl transition shadow-sm animate-pulse"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{t('buyer.inspectConfirm', 'Inspect & Confirm Delivery')}</span>
                        </button>
                      )}

                      {isBuyerConfirmed && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/40 px-3 py-1 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" />
                            <span>{t('buyer.receiptConfirmedWithQty', 'Receipt Confirmed ({count} kg)', { count: order.buyerConfirmation?.acceptedQuantityKg || order.quantityKg })}</span>
                          </span>
                          <button
                            onClick={() => setActiveTab('settlement')}
                            className="px-3 py-1 bg-[#01472e] hover:bg-[#025a3b] text-white text-[11px] font-semibold rounded-xl transition"
                          >
                            {t('buyer.escrowBtn', 'Escrow →')}
                          </button>
                        </div>
                      )}

                      {!isDelivered && !isBuyerConfirmed && (
                        <span className="text-xs text-[#01472e]/50 font-normal italic">
                          {t('buyer.awaitingDockDelivery', 'Awaiting dock delivery')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl border border-[#ccd5ae]/50 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/30">
                  <ShoppingBag className="w-5 h-5 text-[#01472e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#01472e]">
                    {t('buyer.createForwardDemand', 'Create Forward Demand Request')}
                  </h3>
                  <p className="text-xs text-[#01472e]/70 font-normal">
                    {t('buyer.createDemandModalSubtitle', 'Register institutional procurement specifications for pooling and smart farmer matching.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#01472e]/50 hover:text-[#01472e] transition text-lg font-semibold p-2 rounded-xl hover:bg-[#faf9f5]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4 text-xs">
              {/* Buyer Entity Representation */}
              <div>
                <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.buyerEntityName', 'Buyer Entity Name')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.cropCommodity', 'Crop Commodity')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.varietyCultivar', 'Variety / Cultivar')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.targetQuantity', 'Target Quantity')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.measurementUnit', 'Measurement Unit')}</label>
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
                <div className="p-3.5 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center justify-between text-xs text-[#01472e] font-semibold">
                  <span>{t('buyer.standardizedVolume', 'Standardized Agricultural Volume:')}</span>
                  <span className="font-mono text-sm font-semibold">{calculatedKg.toLocaleString()} kg</span>
                </div>
              )}

              {/* Quality & Ceiling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.qualityRequirement', 'Quality Grade Requirement')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.maxCeilingPrice', 'Max Ceiling Price (₹/kg)')}</label>
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
                <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.deliveryLocation', 'Delivery Destination Hub / Corridor')}</label>
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.requiredDeliveryDate', 'Required Delivery Date')}</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="input-modern"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[11px]">{t('buyer.deliveryTimeWindow', 'Delivery Time Window')}</label>
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

              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 text-xs text-[#01472e]/80 leading-relaxed font-normal">
                ⚡ <strong className="text-[#01472e] font-semibold">{t('buyer.connectedLifecycle', 'Connected Lifecycle Integration:')}</strong> {t('buyer.connectedLifecycleDesc', 'Once created, this demand is instantly persisted in shared storage, eligible for multi-buyer aggregation in the Demand Pool, and ranked in real-time by the Smart Matching Engine.')}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl font-semibold transition"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary py-3 px-6 rounded-2xl"
                >
                  {t('buyer.createDemandBtn', 'Create Demand Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Delivery Verification & Receipt Modal */}
      {deliveryReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl border border-[#ccd5ae]/50 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/30">
                  <FileCheck2 className="w-5 h-5 text-[#01472e]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#01472e]">
                    {t('buyer.docksideInspectionTitle', 'Dockside Produce Inspection & Receiving Handover')}
                  </h3>
                  <p className="text-xs text-[#01472e]/70 font-normal">
                    {t('buyer.order', 'Order')} <span className="font-mono font-semibold text-[#01472e]">{deliveryReceiptOrder.id}</span> • {t('buyer.batch', 'Batch')} <span className="font-mono font-semibold text-[#01472e]">{deliveryReceiptOrder.batchId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeliveryReceiptOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] transition text-lg font-semibold p-2 rounded-xl hover:bg-[#faf9f5]"
              >
                ✕
              </button>
            </div>

            {/* Shipment Summary Strip */}
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <img src={getCropImageUrl(deliveryReceiptOrder.crop)} alt={deliveryReceiptOrder.crop} className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#ccd5ae]/40" />
                <div>
                  <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block">{t('buyer.produce', 'Produce')}</span>
                  <strong className="text-[#01472e] text-sm font-semibold">{deliveryReceiptOrder.crop}</strong>
                  <span className="text-[11px] text-[#01472e]/70 block">({deliveryReceiptOrder.variety})</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block">{t('buyer.deliveredVolume', 'Delivered Volume')}</span>
                <strong className="text-[#01472e] text-sm font-semibold">
                  {(deliveryReceiptOrder.packedQuantityKg || deliveryReceiptOrder.quantityKg).toLocaleString()} kg
                </strong>
                <span className="text-[11px] text-[#01472e]/70 block">
                  {deliveryReceiptOrder.crateCount || Math.ceil((deliveryReceiptOrder.packedQuantityKg || deliveryReceiptOrder.quantityKg) / 25)} Crates
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block">{t('buyer.contractRate', 'Contract Rate')}</span>
                <strong className="text-[#01472e] text-sm font-semibold">₹{deliveryReceiptOrder.pricePerKg}/kg</strong>
                <span className="text-[11px] text-[#01472e]/70 block">Grade {deliveryReceiptOrder.qualityGrade || 'A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#01472e]/60 font-semibold uppercase tracking-wider block">{t('buyer.inboundCarrier', 'Inbound Carrier')}</span>
                <strong className="text-[#01472e] text-xs truncate block font-semibold">
                  {deliveryReceiptOrder.transportDetails?.carrierName || 'Cold-Chain Express'}
                </strong>
                <span className="text-[11px] text-[#01472e]/70 block">
                  {deliveryReceiptOrder.transportDetails?.vehicleNumber || 'TN-38-BZ-4419'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmDeliveryReceipt} className="space-y-4 text-xs">
              {/* Quantities Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                    {t('buyer.grossReceived', 'Gross Received (kg)')}
                  </label>
                  <input
                    type="number"
                    value={receivedKg}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setReceivedKg(val);
                      setAcceptedKg(Math.max(0, val - rejectedKg));
                    }}
                    className="input-modern font-semibold text-base text-[#01472e]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                    {t('buyer.acceptedVolume', 'Accepted Volume (kg)')}
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
                    className="input-modern font-semibold text-base text-[#01472e]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-rose-800 uppercase tracking-wider block mb-1 text-[10px]">
                    {t('buyer.rejectedDamaged', 'Rejected / Damaged (kg)')}
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
                    className="input-modern font-semibold text-base text-rose-800 border-rose-300 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Acceptance Status Decision */}
              <div>
                <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1.5 text-[10px]">
                  {t('buyer.qualityDecision', 'Quality Gate Signoff Decision')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'ACCEPTED_FULL',
                      label: t('buyer.fullAcceptance', 'Full Acceptance (100%)'),
                      desc: t('buyer.fullAcceptanceDesc', 'Produce conforms to Grade A standard')
                    },
                    {
                      id: 'ACCEPTED_PARTIAL',
                      label: t('buyer.partialAcceptance', 'Partial Acceptance'),
                      desc: t('buyer.partialAcceptanceDesc', 'Deduct non-conforming crates')
                    },
                    {
                      id: 'REJECTED',
                      label: t('buyer.consignmentRejected', 'Consignment Rejected'),
                      desc: t('buyer.consignmentRejectedDesc', 'Quality failure or critical damage')
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
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        acceptanceStatus === opt.id
                          ? opt.id === 'ACCEPTED_FULL'
                            ? 'bg-[#eaf4ec] border-[#01472e] text-[#01472e] font-medium shadow-xs'
                            : opt.id === 'ACCEPTED_PARTIAL'
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium shadow-xs'
                            : 'bg-rose-50 border-rose-400 text-rose-950 font-medium shadow-xs'
                          : 'bg-white border-[#ccd5ae]/40 text-[#01472e]/70 hover:bg-[#faf9f5]'
                      }`}
                    >
                      <p className="font-semibold text-xs">{opt.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issues Reported / Receiving Remarks */}
              <div>
                <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                  {t('buyer.inspectionRemarks', 'Receiving Inspection Remarks & Observations')}
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
                      className="text-[10px] bg-[#faf9f5] hover:bg-[#eaf4ec] text-[#01472e] font-medium px-2.5 py-1 rounded-xl border border-[#ccd5ae]/40 transition"
                    >
                      + {quickNote}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signoff Personnel Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                    {t('buyer.receivingOfficer', 'Receiving Officer Name')}
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
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                    {t('buyer.officerRole', 'Officer Designation / Role')}
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
              <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/40 text-xs text-[#01472e] space-y-1">
                <div className="flex items-center gap-2 font-semibold text-[#01472e]">
                  <ShieldCheck className="w-4 h-4 text-[#01472e]" />
                  <span>{t('buyer.escrowImpact', 'Transparent Escrow Payout Impact')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#01472e]/80">
                  Signing this receipt locks final accepted volume at <strong>{acceptedKg.toLocaleString()} kg</strong> (₹{(acceptedKg * deliveryReceiptOrder.pricePerKg).toLocaleString()} total value).
                  The escrow engine will automatically disburse <strong>89% directly to member farmers / FPO</strong> and <strong>8% to cold-chain logistics</strong>.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setDeliveryReceiptOrder(null)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl font-semibold transition"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary py-3 px-6 rounded-2xl flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t('buyer.confirmReceiptBtn', 'Confirm Receipt & Release Escrow Queue')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
