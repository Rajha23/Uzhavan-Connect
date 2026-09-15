import { getCropImageUrl } from "../utils/cropImages";
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkflowOrder, BuyerDeliveryConfirmation } from '../types';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Search,
  Filter,
  QrCode,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  FileCheck2,
  AlertTriangle,
  Layers,
  Building2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { KPIGrid, KPIStatCard } from '../components/KPIGrid';

const STATUS_STYLES: Record<string, string> = {
  'Created': 'bg-[#faf9f5] text-slate-700 border-[#ccd5ae]/60',
  'Produce Collection Pending': 'bg-amber-50 text-amber-900 border-amber-300',
  'Collected': 'bg-sky-50 text-sky-900 border-sky-300',
  'Quality Checked': 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/60',
  'Packed': 'bg-teal-50 text-teal-900 border-teal-300',
  'Transport Assigned': 'bg-indigo-50 text-indigo-900 border-indigo-200',
  'In Transit': 'bg-amber-100 text-amber-950 border-amber-300',
  'Delivered': 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/60',
  'Buyer Confirmed': 'bg-[#eaf4ec] text-[#01472e] border-[#01472e]/30 font-bold',
  'Payment Pending': 'bg-amber-100 text-amber-900 border-amber-300',
  'Completed': 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a] font-bold',
  'Pending': 'bg-amber-50 text-amber-900 border-amber-300',
  'Confirmed': 'bg-emerald-50 text-emerald-900 border-emerald-300',
};

export const OrdersPage: React.FC = () => {
  const {
    currentRole,
    currentUser,
    orders,
    buyerConfirmReceipt,
    buyerConfirmDelivery,
    openPassportModal,
    setActiveTab
  } = useApp();

  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Delivery confirmation modal state
  const [verifyOrder, setVerifyOrder] = useState<WorkflowOrder | null>(null);
  const [receivedKg, setReceivedKg] = useState<number>(1000);
  const [acceptedKg, setAcceptedKg] = useState<number>(1000);
  const [rejectedKg, setRejectedKg] = useState<number>(0);
  const [acceptanceStatus, setAcceptanceStatus] = useState<'ACCEPTED_FULL' | 'ACCEPTED_PARTIAL' | 'REJECTED'>('ACCEPTED_FULL');
  const [issuesReported, setIssuesReported] = useState<string>('All crates inspected and accepted in good condition.');
  const [receiverName, setReceiverName] = useState<string>('Receiving Officer');
  const [receiverRole, setReceiverRole] = useState<string>('Receiving Logistics In-Charge');

  const openVerifyModal = (order: WorkflowOrder) => {
    const qty = order.packedQuantityKg || order.acceptedQuantityKg || order.quantityKg;
    setVerifyOrder(order);
    setReceivedKg(qty);
    setAcceptedKg(qty);
    setRejectedKg(0);
    setAcceptanceStatus('ACCEPTED_FULL');
    setIssuesReported('All crates inspected and accepted in good condition.');
    setReceiverName(`${order.buyerName} Dock Officer`);
    setReceiverRole('Receiving Logistics In-Charge');
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyOrder) return;
    const conf: BuyerDeliveryConfirmation = {
      orderId: verifyOrder.id,
      deliveredQuantityKg: Number(verifyOrder.packedQuantityKg || verifyOrder.quantityKg),
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
    buyerConfirmDelivery(verifyOrder.id, conf);
    setVerifyOrder(null);
  };

  // Scope orders by authenticated role to prevent cross-role data leaks
  const scopedOrders = orders.filter((o) => {
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'LOGISTICS') {
      return Boolean(o.transportDetails || o.isReadyForTransport || o.status === 'Transport Assigned' || o.status === 'In Transit' || o.status === 'Delivered');
    }
    if (currentRole === 'RETAIL_BUYER') {
      return (
        (currentUser.id && o.buyerId === currentUser.id) ||
        (currentUser.name && o.buyerName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) ||
        o.buyerName.toLowerCase().includes('retail') ||
        o.buyerName.toLowerCase().includes('anita')
      );
    }
    if (currentRole === 'BULK_BUYER') {
      return (
        Boolean(o.isBulkOrder) ||
        (currentUser.id && o.buyerId === currentUser.id) ||
        (currentUser.name && o.buyerName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) ||
        o.buyerName.toLowerCase().includes('bulk') ||
        o.buyerName.toLowerCase().includes('metro') ||
        o.buyerName.toLowerCase().includes('vikram')
      );
    }
    if (currentRole === 'FARMER') {
      return (
        (currentUser.id && o.farmerId === currentUser.id) ||
        (currentUser.name && o.farmerName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) ||
        o.farmerName.toLowerCase().includes('rajesh') ||
        !o.farmerId
      );
    }
    return true;
  });

  const filtered = scopedOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.crop.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      o.batchId.toLowerCase().includes(search.toLowerCase());

    if (filter === 'All') return matchesSearch;
    if (filter === 'Delivered') return matchesSearch && (o.status === 'Delivered' || o.status === 'Buyer Confirmed' || o.status === 'Completed');
    if (filter === 'In Transit') return matchesSearch && o.status === 'In Transit';
    if (filter === 'Pending') return matchesSearch && (o.status === 'Produce Collection Pending' || o.status === 'Created' || o.status === 'Pending');
    if (filter === 'Processing') return matchesSearch && (o.status === 'Collected' || o.status === 'Quality Checked' || o.status === 'Packed' || o.status === 'Transport Assigned');
    return matchesSearch && o.status === filter;
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalValue, 0);
  const deliveredCount = scopedOrders.filter((o) => o.status === 'Delivered' || o.status === 'Buyer Confirmed' || o.status === 'Completed').length;
  const inProgressCount = scopedOrders.filter((o) => o.status !== 'Completed').length;

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-9 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <Package className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{t('orders.ledgerBadge', 'Direct Farm-to-Buyer Transaction Ledger')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('orders.title', 'Order Fulfillment & Lifecycle Tracking')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-normal max-w-2xl">
              {t('orders.subtitle', 'End-to-end audit trail tracking crop collection, hub QA grading, cold-chain transit, dockside verification, and escrow settlement.')}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => {
                if (currentRole === 'FARMER') setActiveTab('find-buyers');
                else if (currentRole === 'RETAIL_BUYER') setActiveTab('smart-matching');
                else if (currentRole === 'LOGISTICS') setActiveTab('shipments');
                else setActiveTab('smart-matching');
              }}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <span>
                {currentRole === 'FARMER'
                  ? t('farmer.findBuyersBtn', 'Discover Buyer Matches')
                  : currentRole === 'LOGISTICS'
                  ? t('nav.shipments', 'View Shipments')
                  : t('matching.matchPool', 'Match More Produce')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#01472e]" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <KPIGrid columns={4}>
        <KPIStatCard
          label={t('orders.totalOrders', 'Total Orders')}
          value={orders.length.toString()}
          icon={Package}
          iconColor="text-[#01472e]"
          iconBg="bg-[#eaf4ec]"
          valueColor="text-slate-900"
          subtitle={t('orders.allTimeBookings', 'All active & archived')}
        />
        <KPIStatCard
          label={t('orders.deliveredSettled', 'Delivered / Settled')}
          value={deliveredCount.toString()}
          icon={CheckCircle2}
          iconColor="text-[#01472e]"
          iconBg="bg-[#eaf4ec]"
          valueColor="text-[#01472e]"
          subtitle={t('orders.completedFulfillments', 'Completed fulfillments')}
        />
        <KPIStatCard
          label={t('orders.inProgress', 'In Progress')}
          value={inProgressCount.toString()}
          icon={Clock}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
          valueColor="text-amber-700"
          subtitle={t('orders.activeInPipeline', 'In active workflow pipeline')}
        />
        <KPIStatCard
          label={t('orders.totalValue', 'Total Value')}
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={CreditCard}
          iconColor="text-[#01472e]"
          iconBg="bg-[#eaf4ec]"
          valueColor="text-[#01472e]"
          subtitle={t('orders.cumulativeTurnover', 'Escrow transacted value')}
        />
      </KPIGrid>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('orders.searchPlaceholder', 'Search by Order ID, Batch ID, Crop, Farmer or Buyer...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {[
            { id: 'All', label: t('common.all', 'All'), icon: Layers },
            { id: 'Pending', label: t('common.pending', 'Pending'), icon: Clock },
            { id: 'Processing', label: t('common.processing', 'Processing'), icon: ShieldCheck },
            { id: 'In Transit', label: t('stages.inTransit', 'In Transit'), icon: Truck },
            { id: 'Delivered', label: t('stages.delivered', 'Delivered'), icon: CheckCircle2 }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#01472e] text-white border-[#01472e] shadow-soft'
                    : 'bg-white text-slate-600 border-[#ccd5ae]/50 hover:bg-[#faf9f5] hover:text-[#01472e]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#fefae0]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="agri-card bg-white rounded-[32px] border border-[#ccd5ae]/40 shadow-soft overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf9f5] flex items-center justify-center text-slate-400 mb-3 border border-dashed border-[#ccd5ae]/60">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-[#01472e]">{t('orders.noOrders', 'No matching orders found')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('orders.noOrdersDesc', 'Try changing search filters or create a new order via Smart Matching')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#ccd5ae]/30">
            {filtered.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isDelivered = order.status === 'Delivered';
              const isPaymentPending = order.status === 'Payment Pending';
              const isCompleted = order.status === 'Completed';

              return (
                <div key={order.id} className="transition hover:bg-[#faf9f5]/70">
                  {/* Order Row */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] border border-[#a3b18a]/40 text-[#01472e] flex items-center justify-center shrink-0 font-bold shadow-xs">
                        <Package className="w-5 h-5 text-[#01472e]" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2.5 py-0.5 rounded-lg border border-[#ccd5ae]/50">{order.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[11px] text-slate-500 font-semibold">{order.batchId}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700'}`}>
                            {t('orderStatus.' + order.status, order.status)}
                          </span>
                        </div>

                        <span className="font-semibold text-slate-900 flex items-center gap-2 mt-1.5">
                          <img src={getCropImageUrl(order.crop)} alt={order.crop} className="w-5 h-5 rounded-full object-cover shrink-0 shadow-sm border border-slate-200" />
                          <span>{order.crop} ({order.variety || t('common.hybrid', 'Hybrid')}) • <span className="font-mono text-[#01472e]">{order.quantityKg.toLocaleString()} kg</span> @ ₹{order.pricePerKg}/kg</span>
                        </span>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('common.from', 'From')}: <strong className="text-slate-700 font-medium">{order.farmerName}</strong> ({order.farmerLocation}) ➔ {t('common.to', 'To')}: <strong className="text-slate-700 font-medium">{order.buyerName}</strong> ({order.deliveryLocation})
                        </p>
                      </div>
                    </div>

                    {/* Right side Value & Actions */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">{t('orders.orderValue', 'Order Value')}</span>
                        <span className="text-lg font-bold font-mono text-[#01472e]">₹{order.totalValue.toLocaleString()}</span>
                      </div>

                      {/* Interactive Buyer Acceptance Button */}
                      {isDelivered && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVerifyModal(order);
                          }}
                          className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl shadow-soft flex items-center gap-1.5 animate-pulse cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('orders.acceptAndConfirm', 'Accept & Confirm')}</span>
                        </button>
                      )}

                      {order.buyerConfirmation && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/50 px-3 py-1.5 rounded-xl shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" />
                          <span>{t('orders.receiptConfirmed', 'Receipt Confirmed')} ({order.buyerConfirmation.acceptedQuantityKg} kg)</span>
                        </span>
                      )}

                      {/* Payment Pending / Settle Shortcut */}
                      {(isPaymentPending || isCompleted) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('settlement');
                          }}
                          className="btn-primary text-xs font-semibold flex items-center gap-1.5 py-2 px-3.5 rounded-xl shadow-soft cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isCompleted ? t('orders.receipt', 'Receipt') : t('orders.escrowPayout', 'Escrow Payout')}</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPassportModal(order.batchId);
                        }}
                        className="p-2 text-slate-400 hover:text-[#01472e] hover:bg-[#eaf4ec] rounded-xl transition cursor-pointer"
                        title={t('orders.viewProducePassport', 'View Produce Digital Passport')}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#01472e]" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lifecycle Timeline Details */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-[#ccd5ae]/30 bg-[#faf9f5]/50">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* 1. Transaction Details */}
                        <div className="bg-white p-5 rounded-2xl border border-[#ccd5ae]/50 text-xs space-y-2.5 shadow-xs">
                          <h5 className="font-bold text-[#01472e] text-xs uppercase tracking-wider mb-2 pb-1.5 border-b border-[#ccd5ae]/30">
                            {t('orders.transactionMetadata', 'Transaction Metadata')}
                          </h5>
                          <div className="flex justify-between text-slate-600">
                            <span>{t('orders.agreementId', 'Agreement ID')}:</span>
                            <strong className="font-mono text-slate-800 font-semibold">{order.agreementId || 'AGR-DIRECT'}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>{t('common.grade', 'Quality Grade')}:</span>
                            <strong className="text-[#01472e] font-bold">{order.qualityGrade}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>{t('orders.orderDate', 'Order Date')}:</span>
                            <strong className="text-slate-800 font-medium">{order.date}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>{t('orders.batchQr', 'Batch QR')}:</span>
                            <button
                              onClick={() => openPassportModal(order.batchId)}
                              className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                            >
                              <span>{order.batchId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                          {order.transportDetails && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                              <span className="font-medium text-slate-800 block">{t('orders.assignedTransport', 'Assigned Transport')}:</span>
                              <p className="text-[11px] text-slate-600 font-normal">
                                {order.transportDetails.carrierName} • {order.transportDetails.vehicleNumber} ({order.transportDetails.vehicleType})
                              </p>
                              <p className="text-[11px] text-slate-500 font-normal">{t('orders.driver', 'Driver')}: {order.transportDetails.driverName}</p>
                            </div>
                          )}
                        </div>

                        {/* 2. Quality Metrics if checked */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                          <h5 className="font-medium text-slate-900 text-xs uppercase tracking-wider mb-2">
                            {t('orders.qualityVerification', 'Quality & Grading Verification')}
                          </h5>
                          {order.inspectionMetrics ? (
                            <div className="space-y-1.5 text-slate-600">
                              <div className="flex justify-between">
                                <span>{t('fpo.sugarBrix', 'Sugar Content (Brix)')}:</span>
                                <strong className="text-slate-800 font-medium">{order.inspectionMetrics.sugarBrix}° Bx</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('fpo.firmness', 'Firmness')}:</span>
                                <strong className="text-slate-800 font-medium">{order.inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('fpo.moisture', 'Moisture')}:</span>
                                <strong className="text-slate-800 font-medium">{order.inspectionMetrics.moistureContent}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>{t('fpo.pesticideResidue', 'Pesticide Residue')}:</span>
                                <strong className="text-emerald-700 font-semibold">{order.inspectionMetrics.pesticideResidueTest}</strong>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-normal">
                                {t('orders.certifiedBy', 'Certified by')}: <strong className="text-slate-700 font-medium">{order.inspectionMetrics.inspectorName}</strong> ({order.inspectionMetrics.hubLocation})
                              </div>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-slate-400">
                              <ShieldCheck className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                              <p className="text-[11px] font-normal">{t('orders.qualityPending', 'Quality inspection pending at FPO Aggregation Hub')}</p>
                            </div>
                          )}
                        </div>

                        {/* 3. Real-Time Workflow Timeline */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                          <h5 className="font-medium text-slate-900 text-xs uppercase tracking-wider mb-3">
                            {t('orders.lifecycleEvents', 'Workflow Lifecycle Events')}
                          </h5>
                          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {order.timeline.map((event, idx) => (
                              <div key={idx} className="flex items-start gap-3 relative">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                    event.completed
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-400'
                                  }`}
                                >
                                  {event.completed && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <div className="space-y-0.5">
                                  <p className={`text-xs font-medium ${event.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {event.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-normal">
                                    {event.location} • <span className="font-mono">{event.timestamp}</span>
                                  </p>
                                  {event.operator && (
                                    <p className="text-[10px] text-slate-400 font-normal">{t('common.by', 'By')}: {event.operator}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dockside Delivery Verification & Receipt Modal */}
      {verifyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl border border-[#ccd5ae]/50 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/40">
                  <FileCheck2 className="w-6 h-6 text-[#01472e]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#01472e] tracking-tight">
                    {t('orders.docksideTitle', 'Dockside Produce Inspection & Receiving Handover')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('orders.orderId', 'Order')} <span className="font-mono font-bold text-slate-800">{verifyOrder.id}</span> • {t('traceability.batchId', 'Batch')} <span className="font-mono font-bold text-slate-800">{verifyOrder.batchId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyOrder(null)}
                className="w-8 h-8 rounded-full bg-[#faf9f5] border border-[#ccd5ae]/50 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Shipment Summary */}
            <div className="p-4 sm:p-5 bg-[#faf9f5] rounded-3xl border border-[#ccd5ae]/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">{t('farmer.cropName', 'Produce')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src={getCropImageUrl(verifyOrder.crop)} alt={verifyOrder.crop} className="w-6 h-6 rounded-full object-cover shadow-sm border border-slate-200" />
                  <strong className="text-slate-800 text-sm font-bold">{verifyOrder.crop}</strong>
                </div>
                <span className="text-[10px] text-slate-500 block font-medium">({verifyOrder.variety})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">{t('orders.deliveredVolume', 'Delivered Volume')}</span>
                <strong className="text-[#01472e] text-sm font-mono font-bold">
                  {(verifyOrder.packedQuantityKg || verifyOrder.quantityKg).toLocaleString()} kg
                </strong>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {verifyOrder.crateCount || Math.ceil((verifyOrder.packedQuantityKg || verifyOrder.quantityKg) / 25)} {t('orders.crates', 'Crates')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">{t('orders.contractRate', 'Contract Rate')}</span>
                <strong className="text-slate-800 text-sm font-bold">₹{verifyOrder.pricePerKg}/kg</strong>
                <span className="text-[10px] text-slate-500 block font-medium">{t('common.grade', 'Grade')} {verifyOrder.qualityGrade || 'A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">{t('orders.inboundCarrier', 'Inbound Carrier')}</span>
                <strong className="text-slate-800 text-xs truncate block font-bold">
                  {verifyOrder.transportDetails?.carrierName || 'Cold-Chain Express'}
                </strong>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {verifyOrder.transportDetails?.vehicleNumber || 'TN-38-BZ-4419'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmVerification} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    {t('orders.grossReceived', 'Gross Received (kg)')}
                  </label>
                  <input
                    type="number"
                    value={receivedKg}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setReceivedKg(val);
                      setAcceptedKg(Math.max(0, val - rejectedKg));
                    }}
                    className="input-modern w-full rounded-xl p-2.5 font-mono font-bold text-base text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] uppercase tracking-wider block mb-1 text-[10px]">
                    {t('orders.acceptedVolume', 'Accepted Volume (kg)')}
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
                    className="input-modern w-full rounded-xl p-2.5 font-mono font-bold text-base text-[#01472e]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-rose-700 uppercase tracking-wider block mb-1 text-[10px]">
                    {t('orders.rejectedVolume', 'Rejected (kg)')}
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
                    className="input-modern w-full rounded-xl p-2.5 font-mono font-bold text-base text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">
                  {t('orders.qualityDecision', 'Quality Gate Signoff Decision')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ACCEPTED_FULL', label: t('orders.fullAcceptance', 'Full Acceptance (100%)'), desc: t('orders.fullAcceptanceDesc', 'Conforms to Grade A standard') },
                    { id: 'ACCEPTED_PARTIAL', label: t('orders.partialAcceptance', 'Partial Acceptance'), desc: t('orders.partialAcceptanceDesc', 'Deduct defective volume') },
                    { id: 'REJECTED', label: t('orders.consignmentRejected', 'Consignment Rejected'), desc: t('orders.rejectedDesc', 'Quality failure or damage') }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const s = opt.id as any;
                        setAcceptanceStatus(s);
                        if (s === 'ACCEPTED_FULL') {
                          setAcceptedKg(receivedKg);
                          setRejectedKg(0);
                        } else if (s === 'REJECTED') {
                          setAcceptedKg(0);
                          setRejectedKg(receivedKg);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        acceptanceStatus === opt.id
                          ? opt.id === 'ACCEPTED_FULL'
                            ? 'bg-[#eaf4ec] border-[#01472e] text-[#01472e] font-bold shadow-xs'
                            : opt.id === 'ACCEPTED_PARTIAL'
                            ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                            : 'bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs'
                          : 'bg-white border-[#ccd5ae]/50 text-slate-600 hover:bg-[#faf9f5]'
                      }`}
                    >
                      <p className="font-bold text-xs">{opt.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  {t('orders.receivingRemarks', 'Receiving Inspection Remarks & Cold-Chain Observations')}
                </label>
                <textarea
                  value={issuesReported}
                  onChange={(e) => setIssuesReported(e.target.value)}
                  rows={2}
                  className="input-modern w-full rounded-2xl p-3 text-slate-800 text-xs"
                  placeholder={t('orders.receivingRemarksPlaceholder', 'Record cold-chain temp log, crate condition, or defect notes...')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    {t('orders.receiverName', 'Receiving Officer Name')}
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="input-modern w-full rounded-xl p-2.5 font-medium text-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    {t('orders.receiverRole', 'Officer Designation')}
                  </label>
                  <input
                    type="text"
                    value={receiverRole}
                    onChange={(e) => setReceiverRole(e.target.value)}
                    className="input-modern w-full rounded-xl p-2.5 font-medium text-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/50 text-xs text-[#01472e] space-y-1 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-[#01472e]">
                  <ShieldCheck className="w-4 h-4 text-[#01472e]" />
                  <span>{t('orders.escrowImpact', 'Transparent Escrow Payout Impact')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#01472e]/80">
                  {t('orders.escrowImpactDesc', 'Signing locks accepted volume at')} <strong className="font-bold text-[#01472e]">{acceptedKg.toLocaleString()} kg</strong> (₹{(acceptedKg * verifyOrder.pricePerKg).toLocaleString()}). {t('orders.escrowSplitDesc', 'Escrow automatically releases 89% to member farmers / FPO and 8% to cold-chain logistics.')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setVerifyOrder(null)}
                  className="btn-secondary px-4 py-2.5 rounded-xl font-semibold uppercase tracking-wider transition cursor-pointer text-xs"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2.5 rounded-xl shadow-soft font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t('orders.confirmReleaseEscrow', 'Confirm Receipt & Release Escrow')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
