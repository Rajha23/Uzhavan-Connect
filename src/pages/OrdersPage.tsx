import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  ExternalLink
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
    openPassportModal,
    setActiveTab
  } = useApp();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 ">Order Fulfillment & Tracking</h1>
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
                            buyerConfirmReceipt(order.id);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Confirm</span>
                        </button>
                      )}

                      {/* Payment Pending / Settle Shortcut */}
                      {(isPaymentPending || isCompleted) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('settlement');
                          }}
                          className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-700/90 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1"
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
    </div>
  );
};
