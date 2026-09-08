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
  AlertTriangle
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'Created': 'bg-slate-100 text-slate-800 border-slate-200',
  'Produce Collection Pending': 'bg-amber-100 text-amber-900 border-amber-300',
  'Collected': 'bg-blue-100 text-blue-900 border-blue-300',
  'Quality Checked': 'bg-purple-100 text-purple-900 border-purple-300',
  'Packed': 'bg-teal-100 text-teal-900 border-teal-300',
  'Transport Assigned': 'bg-indigo-100 text-indigo-900 border-indigo-300',
  'In Transit': 'bg-orange-100 text-orange-900 border-orange-300',
  'Delivered': 'bg-sky-100 text-sky-900 border-sky-300',
  'Buyer Confirmed': 'bg-emerald-100 text-emerald-900 border-emerald-300',
  'Payment Pending': 'bg-amber-100 text-amber-900 border-amber-300',
  'Completed': 'bg-emerald-100 text-emerald-900 border-emerald-400',
  'Pending': 'bg-amber-100 text-amber-900 border-amber-300',
  'Confirmed': 'bg-blue-100 text-blue-900 border-blue-300',
};

export const OrdersPage: React.FC = () => {
  const {
    currentRole,
    orders,
    buyerConfirmReceipt,
    buyerConfirmDelivery,
    openPassportModal,
    setActiveTab
  } = useApp();

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

  const filtered = orders.filter((o) => {
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
  const deliveredCount = orders.filter((o) => o.status === 'Delivered' || o.status === 'Buyer Confirmed' || o.status === 'Completed').length;
  const inProgressCount = orders.filter((o) => o.status !== 'Completed').length;

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit']">Order Fulfillment & Tracking</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end transaction lifecycle from crop reservation to delivery and settlement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('smart-matching')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <span>Match More Produce</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length.toString(), color: 'text-slate-900' },
          { label: 'Delivered / Settled', value: deliveredCount.toString(), color: 'text-emerald-700' },
          { label: 'In Progress', value: inProgressCount.toString(), color: 'text-orange-700' },
          { label: 'Total Value', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-slate-900' },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Batch ID, Crop, Farmer or Buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 shadow-xs transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {['All', 'Pending', 'Processing', 'In Transit', 'Delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
                filter === s
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No matching orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try changing search filters or create a new order via Smart Matching</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isDelivered = order.status === 'Delivered';
              const isPaymentPending = order.status === 'Payment Pending';
              const isCompleted = order.status === 'Completed';

              return (
                <div key={order.id} className="transition hover:bg-slate-50/60">
                  {/* Order Row */}
                  <div
                    onClick={() => toggleExpand(order.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                        <Package className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[11px] text-slate-500 font-semibold">{order.batchId}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[order.status] || 'bg-slate-100 text-slate-700'}`}>
                            {order.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {order.crop} ({order.variety || 'Hybrid'}) • {order.quantityKg.toLocaleString()} kg @ ₹{order.pricePerKg}/kg
                        </h4>

                        <p className="text-xs text-slate-500 mt-0.5">
                          From: <strong className="text-slate-700">{order.farmerName}</strong> ({order.farmerLocation}) ➔ To: <strong className="text-slate-700">{order.buyerName}</strong> ({order.deliveryLocation})
                        </p>
                      </div>
                    </div>

                    {/* Right side Value & Actions */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Order Value</span>
                        <span className="text-base font-black font-mono text-slate-900">₹{order.totalValue.toLocaleString()}</span>
                      </div>

                      {/* Interactive Buyer Acceptance Button */}
                      {isDelivered && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVerifyModal(order);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 animate-pulse"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Confirm</span>
                        </button>
                      )}

                      {order.buyerConfirmation && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Receipt Confirmed ({order.buyerConfirmation.acceptedQuantityKg} kg)</span>
                        </span>
                      )}

                      {/* Payment Pending / Settle Shortcut */}
                      {(isPaymentPending || isCompleted) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('settlement');
                          }}
                          className="px-3 py-1.5 bg-forest text-cream hover:bg-forest/90 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'Receipt' : 'Escrow Payout'}</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPassportModal(order.batchId);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                        title="View Produce Digital Passport"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lifecycle Timeline Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 1. Transaction Details */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                          <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Transaction Metadata</h5>
                          <div className="flex justify-between text-slate-600">
                            <span>Agreement ID:</span>
                            <strong className="font-mono text-slate-800">{order.agreementId || 'AGR-DIRECT'}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Quality Grade:</span>
                            <strong className="text-emerald-800">{order.qualityGrade}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Order Date:</span>
                            <strong className="text-slate-800">{order.date}</strong>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Batch QR:</span>
                            <button
                              onClick={() => openPassportModal(order.batchId)}
                              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>{order.batchId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                          {order.transportDetails && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                              <span className="font-bold text-slate-800 block">Assigned Transport:</span>
                              <p className="text-[11px] text-slate-600">
                                {order.transportDetails.carrierName} • {order.transportDetails.vehicleNumber} ({order.transportDetails.vehicleType})
                              </p>
                              <p className="text-[11px] text-slate-500">Driver: {order.transportDetails.driverName}</p>
                            </div>
                          )}
                        </div>

                        {/* 2. Quality Metrics if checked */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                          <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Quality & Grading Verification</h5>
                          {order.inspectionMetrics ? (
                            <div className="space-y-1.5 text-slate-600">
                              <div className="flex justify-between">
                                <span>Sugar Content (Brix):</span>
                                <strong className="text-slate-800">{order.inspectionMetrics.sugarBrix}° Bx</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Firmness:</span>
                                <strong className="text-slate-800">{order.inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Moisture:</span>
                                <strong className="text-slate-800">{order.inspectionMetrics.moistureContent}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Pesticide Residue:</span>
                                <strong className="text-emerald-700 font-bold">{order.inspectionMetrics.pesticideResidueTest}</strong>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                Certified by: <strong className="text-slate-700">{order.inspectionMetrics.inspectorName}</strong> ({order.inspectionMetrics.hubLocation})
                              </div>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-slate-400">
                              <ShieldCheck className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                              <p className="text-[11px]">Quality inspection pending at FPO Aggregation Hub</p>
                            </div>
                          )}
                        </div>

                        {/* 3. Real-Time Workflow Timeline */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                          <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Workflow Lifecycle Events</h5>
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
                                  <p className={`text-xs font-bold ${event.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {event.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {event.location} • <span className="font-mono">{event.timestamp}</span>
                                  </p>
                                  {event.operator && (
                                    <p className="text-[10px] text-slate-400">By: {event.operator}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-200">
                  <FileCheck2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                    Dockside Produce Inspection & Receiving Handover
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order <span className="font-mono font-bold text-slate-800">{verifyOrder.id}</span> • Batch <span className="font-mono font-bold text-slate-800">{verifyOrder.batchId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Shipment Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Produce</span>
                <strong className="text-slate-800 text-sm">{verifyOrder.crop}</strong>
                <span className="text-[10px] text-slate-500 block">({verifyOrder.variety})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivered Volume</span>
                <strong className="text-slate-800 text-sm">
                  {(verifyOrder.packedQuantityKg || verifyOrder.quantityKg).toLocaleString()} kg
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  {verifyOrder.crateCount || Math.ceil((verifyOrder.packedQuantityKg || verifyOrder.quantityKg) / 25)} Crates
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Contract Rate</span>
                <strong className="text-slate-800 text-sm">₹{verifyOrder.pricePerKg}/kg</strong>
                <span className="text-[10px] text-slate-500 block">Grade {verifyOrder.qualityGrade || 'A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Inbound Carrier</span>
                <strong className="text-slate-800 text-xs truncate block">
                  {verifyOrder.transportDetails?.carrierName || 'Cold-Chain Express'}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  {verifyOrder.transportDetails?.vehicleNumber || 'TN-38-BZ-4419'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmVerification} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
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
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-base text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-800 uppercase tracking-wider block mb-1 text-[10px]">
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
                    className="w-full bg-white border border-emerald-400 rounded-xl p-2.5 font-bold text-base text-emerald-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-red-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Rejected (kg)
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
                    className="w-full bg-white border border-red-200 rounded-xl p-2.5 font-bold text-base text-red-700 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5 text-[10px]">
                  Quality Gate Signoff Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'ACCEPTED_FULL', label: 'Full Acceptance (100%)', desc: 'Conforms to Grade A standard' },
                    { id: 'ACCEPTED_PARTIAL', label: 'Partial Acceptance', desc: 'Deduct defective volume' },
                    { id: 'REJECTED', label: 'Consignment Rejected', desc: 'Quality failure or damage' }
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
                      className={`p-3 rounded-xl border text-left transition ${
                        acceptanceStatus === opt.id
                          ? opt.id === 'ACCEPTED_FULL'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                            : opt.id === 'ACCEPTED_PARTIAL'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                            : 'bg-red-50 border-red-500 text-red-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{opt.label}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  Receiving Inspection Remarks & Cold-Chain Observations
                </label>
                <textarea
                  value={issuesReported}
                  onChange={(e) => setIssuesReported(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  placeholder="Record cold-chain temp log, crate condition, or defect notes..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Receiving Officer Name
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                    Officer Designation
                  </label>
                  <input
                    type="text"
                    value={receiverRole}
                    onChange={(e) => setReceiverRole(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transparent Escrow Payout Impact</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Signing locks accepted volume at <strong>{acceptedKg.toLocaleString()} kg</strong> (₹{(acceptedKg * verifyOrder.pricePerKg).toLocaleString()}).
                  Escrow automatically releases 89% to member farmers / FPO and 8% to cold-chain logistics.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyOrder(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Confirm Receipt & Release Escrow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
