import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { GovernmentSchemes } from '../components/GovernmentSchemes';
import {
  Truck,
  Navigation,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Zap,
  Check,
  Building2,
  FileCheck2,
  Info,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TransportAssignment } from '../types';

export const LogisticsDashboard: React.FC = () => {
  const { t, formatNumber } = useLanguage();
  const {
    currentUser,
    orders,
    assignTransport,
    dispatchShipment,
    markDelivered,
    openPassportModal,
    setActiveTab
  } = useApp();

  const [activeSection, setActiveSection] = useState<'ASSIGN' | 'TRANSIT' | 'DELIVERED'>('ASSIGN');
  const [selectedOrderForTransport, setSelectedOrderForTransport] = useState<string | null>(null);

  // Vehicle Assignment Form State
  const [carrierName, setCarrierName] = useState<string>('Sundar Logistics Co.');
  const [vehicleNumber, setVehicleNumber] = useState<string>('TN-11-AGRI-4402');
  const [driverName, setDriverName] = useState<string>('Karthik S.');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98410 44021');
  const [vehicleType, setVehicleType] = useState<string>('CoolReefer EV 3.5T');
  const [eta, setEta] = useState<string>('Today, 06:30 AM');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Transport readiness gate: Only orders that have completed collection, quality, and packing
  const awaitingTransportOrders = orders.filter(
    (o) =>
      (o.status === 'Packed' || o.isReadyForTransport) &&
      o.status !== 'Transport Assigned' &&
      o.status !== 'In Transit' &&
      o.status !== 'Delivered' &&
      o.status !== 'Buyer Confirmed' &&
      o.status !== 'Payment Pending' &&
      o.status !== 'Completed'
  );

  const assignedOrders = orders.filter((o) => o.status === 'Transport Assigned');
  const inTransitOrders = orders.filter((o) => o.status === 'In Transit');
  const deliveredOrders = orders.filter(
    (o) =>
      o.status === 'Delivered' ||
      o.status === 'Buyer Confirmation Pending' ||
      o.status === 'Buyer Confirmed' ||
      o.status === 'Payment Pending' ||
      o.status === 'Completed'
  );

  const handleAssignTransport = (orderId: string) => {
    const transport: TransportAssignment = {
      carrierName,
      vehicleNumber,
      driverName,
      driverPhone,
      vehicleType,
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: eta,
      assignedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    assignTransport(orderId, transport);
    setSelectedOrderForTransport(null);
    setActionNotice(t('logistics.vehicleAssignedNotice', { vehicle: vehicleNumber, orderId }, `Vehicle ${vehicleNumber} assigned to Order ${orderId}. Ready for departure dispatch!`));
    confetti({ particleCount: 35, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDispatch = (orderId: string, vehicleNum?: string) => {
    dispatchShipment(orderId);
    setActionNotice(t('logistics.shipmentDispatchedNotice', { orderId, vehicle: vehicleNum || 'EV Reefer' }, `Shipment ${orderId} (${vehicleNum || 'EV Reefer'}) dispatched! Live cold-chain telemetry broadcast.`));
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleMarkDelivered = (orderId: string, buyerName: string) => {
    markDelivered(orderId);
    setActionNotice(t('logistics.orderDeliveredNotice', { orderId, buyer: buyerName }, `Order ${orderId} delivered at ${buyerName} Receiving Bay! Awaiting Buyer inspection & digital confirmation.`));
    confetti({ particleCount: 50, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <Truck className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{t('logistics.fleetControlBadge', 'Cold-Chain Fleet Logistics & Telematics Control')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {currentUser.organization || 'Sundar Logistics Control Tower'}
            </h1>
            <p className="text-sm text-emerald-100/80 font-normal max-w-2xl">
              {t('logistics.fleetSubtitle', 'Vehicle fleet assignment, cold-chain corridor tracking, and destination buyer dockside delivery handover.')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full text-[11px] text-emerald-200">
                <Info className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('logistics.routeSolver', 'Route Solver:')} <strong>{t('logistics.topologicalHeuristic', 'Topological Heuristic (OR-Tools Architecture)')}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#e9edc9]/20 border border-[#e9edc9]/30 px-3 py-1 rounded-full text-[11px] text-[#fefae0]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('logistics.activeReeferSensor', 'Active Reefer Sensor Telemetry:')} <strong>{t('logistics.connected', 'Connected')}</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setActiveTab('route-optimization')}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#01472e]" />
              <span>{t('logistics.routeOptimizerMap', 'Route Optimizer Map')}</span>
            </button>
            <a
              href="/logistics-map.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-700/60 hover:bg-emerald-700/80 text-[#fefae0] border border-emerald-400/30 text-xs font-semibold px-4 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer backdrop-blur-sm"
              title="Open Fullscreen Interactive Fleet Map"
            >
              <ExternalLink className="w-4 h-4 text-emerald-300" />
              <span>{t('logistics.fullscreenMap', 'Live Fleet Web Map')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/50 rounded-2xl flex items-center gap-3 shadow-soft animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-[#01472e] text-[#fefae0] flex items-center justify-center font-bold text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-semibold text-[#01472e]">{actionNotice}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { labelKey: 'logistics.kpi.awaitingVehicle', defaultLabel: 'Awaiting Vehicle', count: awaitingTransportOrders.length, descKey: 'logistics.kpi.packedQRSealed', defaultDesc: 'Packed & QR Sealed', section: 'ASSIGN' as const, color: 'text-teal-700', bg: 'bg-teal-50' },
          { labelKey: 'logistics.kpi.assignedOnBay', defaultLabel: 'Assigned on Bay', count: assignedOrders.length, descKey: 'logistics.kpi.readyForDispatch', defaultDesc: 'Ready for Dispatch', section: 'TRANSIT' as const, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { labelKey: 'logistics.kpi.enRouteInTransit', defaultLabel: 'En Route in Transit', count: inTransitOrders.length, descKey: 'logistics.kpi.coldChainTelemetry', defaultDesc: 'Cold-Chain Telemetry', section: 'TRANSIT' as const, color: 'text-amber-700', bg: 'bg-amber-50' },
          { labelKey: 'logistics.kpi.deliveredAtBuyerHubs', defaultLabel: 'Delivered at Buyer Hubs', count: deliveredOrders.length, descKey: 'logistics.kpi.receiptVerification', defaultDesc: 'Receipt Verification', section: 'DELIVERED' as const, color: 'text-[#01472e]', bg: 'bg-emerald-50' },
        ].map((item) => (
          <button
            key={item.labelKey}
            onClick={() => setActiveSection(item.section)}
            className={`p-5 sm:p-6 rounded-3xl border text-left transition-all duration-200 cursor-pointer shadow-xs ${
              activeSection === item.section
                ? 'bg-white border-[#01472e] ring-2 ring-[#01472e]/20 shadow-soft -translate-y-0.5'
                : 'bg-white/90 border-[#ccd5ae]/40 hover:border-[#a3b18a] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">{t(item.labelKey, item.defaultLabel)}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${item.bg} border border-current opacity-60`} />
            </div>
            <p className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${item.color}`}>{item.count}</p>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{t(item.descKey, item.defaultDesc)}</p>
          </button>
        ))}
      </div>

      {/* Section Filter Pills */}
      <div className="flex gap-2.5 border-b border-[#ccd5ae]/40 pb-4 overflow-x-auto">
        {[
          { key: 'ASSIGN', label: t('logistics.tab.vehicleAllocation', '1. Vehicle Allocation ({count})', { count: awaitingTransportOrders.length }), icon: Package },
          { key: 'TRANSIT', label: t('logistics.tab.dispatchesInTransit', '2. Dispatches & In-Transit ({count})', { count: assignedOrders.length + inTransitOrders.length }), icon: Truck },
          { key: 'DELIVERED', label: t('logistics.tab.completedDeliveries', '3. Completed Deliveries ({count})', { count: deliveredOrders.length }), icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#01472e] text-white shadow-soft'
                  : 'bg-white border border-[#ccd5ae]/50 text-slate-600 hover:bg-[#faf9f5] hover:text-[#01472e]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#fefae0]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 1. VEHICLE ALLOCATION SECTION ───────────────────────────────────── */}
      {activeSection === 'ASSIGN' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('logistics.packedBatchesTitle', 'Packed Batches Ready for Carrier Assignment')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('logistics.packedBatchesSubtitle', 'Assign temperature-controlled EV trucks, drivers, and delivery slots. Only orders passing Collection, Quality & Crating appear here.')}
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-[#01472e] bg-[#eaf4ec] px-4 py-1.5 rounded-full border border-[#a3b18a]/50 shadow-xs">
              {t('logistics.readyPickupCount', '{count} Ready for Carrier Pickup', { count: awaitingTransportOrders.length })}
            </span>
          </div>

          {awaitingTransportOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-[#faf9f5] rounded-3xl border border-dashed border-[#ccd5ae]/60">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eaf4ec] flex items-center justify-center text-[#01472e] mb-3">
                <Truck className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-[#01472e]">{t('logistics.noPackedBatches', 'No packed batches currently awaiting transport assignment')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('logistics.completeFpoPackingNotice', 'Complete FPO packaging & QR sealing in FPO Operations to advance batches here.')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {awaitingTransportOrders.map((order) => {
                const isAssigning = selectedOrderForTransport === order.id;
                const cargoVolume = order.packedQuantityKg || order.acceptedQuantityKg || order.quantityKg;

                return (
                  <div key={order.id} className="p-6 border border-[#ccd5ae]/60 bg-[#faf9f5] rounded-3xl space-y-5 hover:border-[#a3b18a] transition shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2.5 py-1 rounded-lg border border-[#ccd5ae]/50">{order.id}</span>
                          <span className="font-mono text-xs text-[#01472e]/70 font-semibold">{order.batchId}</span>
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/50 px-2.5 py-0.5 rounded-full">
                            {order.crateCount ? t('logistics.packedCrates', 'Packed ({count} Crates)', { count: order.crateCount }) : t('logistics.packedCrated', 'Packed (Crated)')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          {t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'}) — <span className="font-mono text-[#01472e]">{cargoVolume.toLocaleString()} kg</span> ({t(`grades.${order.qualityGrade}`, order.qualityGrade)})
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{t('logistics.pickupLabel', 'Pickup:')} <strong className="text-slate-800">{order.farmerLocation}</strong></span>
                          <span>➔</span>
                          <span>{t('logistics.destinationLabel', 'Destination:')} <strong className="text-slate-800">{order.deliveryLocation}</strong> ({order.buyerName})</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <button
                          onClick={() => openPassportModal(order.batchId)}
                          className="btn-outline px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{t('logistics.qrPassportBtn', 'QR Passport')}</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForTransport(isAssigning ? null : order.id)}
                          className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft cursor-pointer"
                        >
                          {isAssigning ? t('logistics.cancelAssignment', 'Cancel Assignment') : t('logistics.assignVehicleBtn', 'Assign Vehicle →')}
                        </button>
                      </div>
                    </div>

                    {/* Assignment Modal Form */}
                    {isAssigning && (
                      <div className="p-6 bg-white border border-[#a3b18a]/60 rounded-2xl space-y-4 shadow-soft animate-in fade-in">
                        <h5 className="font-bold text-[#01472e] text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#ccd5ae]/30">
                          <Zap className="w-4 h-4 text-[#01472e]" />
                          <span>{t('logistics.assignModalTitle', 'Assign Vehicle & Carrier Fleet — Order: {id} ({volume} kg)', { id: order.id, volume: cargoVolume.toLocaleString() })}</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.carrierProvider', 'Carrier Provider')}</label>
                            <input
                              type="text"
                              value={carrierName}
                              onChange={(e) => setCarrierName(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.vehicleType', 'Vehicle Type')}</label>
                            <select
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-medium bg-white"
                            >
                              <option value="CoolReefer EV 3.5T">CoolReefer EV 3.5T (Battery Electric, 4°C)</option>
                              <option value="Electric Reefer Van 2T">Electric Reefer Van 2T</option>
                              <option value="E-Truck Heavy 5T">E-Truck Heavy 5T</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.vehiclePlateNumber', 'Vehicle Plate Number')}</label>
                            <input
                              type="text"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-mono font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.driverName', 'Driver Name')}</label>
                            <input
                              type="text"
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.driverPhone', 'Driver Phone')}</label>
                            <input
                              type="text"
                              value={driverPhone}
                              onChange={(e) => setDriverPhone(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold mb-1.5">{t('logistics.deliverySlotEta', 'Delivery Slot / ETA')}</label>
                            <input
                              type="text"
                              value={eta}
                              onChange={(e) => setEta(e.target.value)}
                              className="input-modern w-full rounded-xl py-2 px-3 text-xs font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#ccd5ae]/30">
                          <button
                            onClick={() => setSelectedOrderForTransport(null)}
                            className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            {t('common.cancel', 'Cancel')}
                          </button>
                          <button
                            onClick={() => handleAssignTransport(order.id)}
                            className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('logistics.confirmCarrierBtn', 'Confirm Carrier Assignment')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 2. ACTIVE DISPATCHES & IN-TRANSIT ───────────────────────────────── */}
      {activeSection === 'TRANSIT' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          {/* Assigned Awaiting Dispatch */}
          {assignedOrders.length > 0 && (
            <div className="space-y-4 pb-6 border-b border-[#ccd5ae]/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#01472e] uppercase tracking-wider flex items-center gap-2">
                  <span>{t('logistics.vehiclesAssignedOnBay', 'Vehicles Assigned on Bay (Awaiting Departure Dispatch)')}</span>
                  <span className="text-[11px] bg-indigo-100 text-indigo-900 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold">{assignedOrders.length}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedOrders.map((order) => (
                  <div key={order.id} className="p-6 border border-indigo-200/80 bg-indigo-50/30 rounded-3xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-indigo-200">{order.id}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {t('logistics.vehicleAssigned', 'Vehicle Assigned')}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-base">{t(`crops.${order.crop}`, order.crop)} — {(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg</h5>
                      <p className="text-xs text-slate-600 mt-1.5">
                        {t('logistics.vehicleLabel', 'Vehicle:')} <strong className="font-mono text-slate-900">{order.transportDetails?.vehicleNumber}</strong> ({order.transportDetails?.vehicleType})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{t('logistics.driverLabel', 'Driver:')} {order.transportDetails?.driverName} ({order.transportDetails?.driverPhone})</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t('logistics.destinationLabel', 'Destination:')} {order.deliveryLocation} ({order.buyerName})</p>
                    </div>

                    <div className="pt-3 border-t border-indigo-200/60 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-xs text-indigo-800 hover:text-indigo-950 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{t('logistics.qrPassportBtn', 'Passport')}</span>
                      </button>

                      <button
                        onClick={() => handleDispatch(order.id, order.transportDetails?.vehicleNumber)}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl transition shadow-soft flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{t('logistics.dispatchShipmentNow', 'Dispatch Shipment Now')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active In-Transit Shipments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#01472e] uppercase tracking-wider flex items-center gap-2">
                <span>{t('logistics.activeInTransitShipments', 'Active In-Transit Cold-Chain Shipments')}</span>
                <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">{inTransitOrders.length}</span>
              </h4>
              <button
                onClick={() => setActiveTab('route-optimization')}
                className="text-xs text-[#01472e] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('logistics.liveRouteTopology', 'Live Route Topology')}</span>
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {inTransitOrders.length === 0 ? (
              <div className="py-14 text-center text-slate-400 bg-[#faf9f5] rounded-3xl border border-dashed border-[#ccd5ae]/60">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#01472e]">{t('logistics.noShipmentsEnRoute', 'No shipments currently en route')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('logistics.dispatchAssignedNotice', 'Dispatch assigned vehicles above to monitor active transit corridors.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inTransitOrders.map((order) => (
                  <div key={order.id} className="p-6 border border-amber-300/60 bg-amber-50/30 rounded-3xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">{order.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] text-amber-900 font-semibold">{order.batchId}</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full animate-pulse border border-amber-300">
                        {t('stages.In Transit.label', 'In Transit')}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-base">{t(`crops.${order.crop}`, order.crop)} ({(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg)</h5>
                      <p className="text-xs text-slate-700 mt-1.5">
                        {t('logistics.vehicleLabel', 'Vehicle:')} <strong className="font-mono text-slate-900">{order.transportDetails?.vehicleNumber || 'Reefer EV'}</strong> • {t('logistics.driverLabel', 'Driver:')} {order.transportDetails?.driverName || 'Karthik S.'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('logistics.routeLabel', 'Route:')} {order.farmerLocation} ➔ <strong>{order.deliveryLocation}</strong> ({order.buyerName})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-xs text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{t('logistics.traceQrBtn', 'Trace QR')}</span>
                      </button>

                      <button
                        onClick={() => handleMarkDelivered(order.id, order.buyerName)}
                        className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('logistics.arriveHandoverBtn', 'Arrive & Handover Delivery')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. DELIVERED DELIVERIES & BUYER CONFIRMATION ─────────────────────── */}
      {activeSection === 'DELIVERED' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('logistics.destinationDeliveriesTitle', 'Destination Deliveries & Receiving Handover')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('logistics.destinationDeliveriesSubtitle', 'Shipments delivered at buyer receiving facilities. Buyer verifies physical produce condition and completes digital confirmation.')}
              </p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-[#01472e] bg-[#eaf4ec] px-4 py-1.5 rounded-full border border-[#a3b18a]/50 shadow-xs">
              {t('logistics.shipmentsHandedOverCount', '{count} Shipments Handed Over', { count: deliveredOrders.length })}
            </span>
          </div>

          <div className="divide-y divide-[#ccd5ae]/30">
            {deliveredOrders.map((order) => {
              const isConfirmed = order.status === 'Buyer Confirmed' || order.status === 'Payment Pending' || order.status === 'Completed';

              return (
                <div key={order.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6 text-[#01472e]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2 py-0.5 rounded border border-[#ccd5ae]/40">{order.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-500">{order.batchId}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isConfirmed
                            ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/50'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}>
                          {isConfirmed ? t('stages.Buyer Confirmed.label', 'Buyer Confirmed') : t('stages.Delivered.label', 'Buyer Confirmation Pending')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {t(`crops.${order.crop}`, order.crop)} ({(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg) {t('logistics.deliveredTo', 'delivered to')} <strong>{order.buyerName}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('logistics.facilityLabel', 'Facility:')} {order.deliveryLocation} • {t('logistics.carrierLabel', 'Carrier:')} {order.transportDetails?.carrierName} ({order.transportDetails?.vehicleNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="btn-outline px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('logistics.qrPassportBtn', 'Passport')}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-soft cursor-pointer"
                    >
                      {t('logistics.orderLedgerBtn', 'Order Ledger')}
                    </button>
                  </div>
                </div>
              );
          </div>
        </div>
      )}

      <GovernmentSchemes role="LOGISTICS" className="mt-8" />
    </div>
  );
};
