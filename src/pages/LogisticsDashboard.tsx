import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TransportAssignment } from '../types';

export const LogisticsDashboard: React.FC = () => {
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
    setActionNotice(`Vehicle ${vehicleNumber} assigned to Order ${orderId}. Ready for departure dispatch!`);
    confetti({ particleCount: 35, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDispatch = (orderId: string, vehicleNum?: string) => {
    dispatchShipment(orderId);
    setActionNotice(`Shipment ${orderId} (${vehicleNum || 'EV Reefer'}) dispatched! Live cold-chain telemetry broadcast.`);
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleMarkDelivered = (orderId: string, buyerName: string) => {
    markDelivered(orderId);
    setActionNotice(`Order ${orderId} delivered at ${buyerName} Receiving Bay! Awaiting Buyer inspection & digital confirmation.`);
    confetti({ particleCount: 50, origin: { y: 0.6 } });
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Truck className="w-4 h-4" />
            <span>Multi-Hub Cold-Chain Logistics Control Tower</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            {currentUser.organization || 'Sundar Logistics Control Tower'}
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            Vehicle fleet assignment, cold-chain corridor tracking, and destination buyer delivery handover.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-cream/10 border border-cream/20 px-3 py-1 rounded-full text-[11px] text-cream/80">
            <Info className="w-3.5 h-3.5 text-sage" />
            <span>Route Solver: <strong>Topological Route Heuristic (Google OR-Tools Architecture Blueprint)</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('route-optimization')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <Navigation className="w-4 h-4" />
            <span>Route Optimizer Map</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-bold text-emerald-950">{actionNotice}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Vehicle', count: awaitingTransportOrders.length, desc: 'Packed & QR Sealed', section: 'ASSIGN' as const, color: 'text-teal-700' },
          { label: 'Assigned on Bay', count: assignedOrders.length, desc: 'Ready for Dispatch', section: 'TRANSIT' as const, color: 'text-indigo-700' },
          { label: 'En Route in Transit', count: inTransitOrders.length, desc: 'Cold-Chain Telemetry', section: 'TRANSIT' as const, color: 'text-orange-700' },
          { label: 'Delivered at Buyer Hubs', count: deliveredOrders.length, desc: 'Receipt Verification', section: 'DELIVERED' as const, color: 'text-emerald-700' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveSection(item.section)}
            className={`p-5 rounded-2xl border text-left transition shadow-xs ${
              activeSection === item.section
                ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className={`text-3xl font-black font-mono mt-1 ${item.color}`}>{item.count}</p>
            <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Section Filter Pills */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'ASSIGN', label: `1. Vehicle Allocation (${awaitingTransportOrders.length})` },
          { key: 'TRANSIT', label: `2. Dispatches & Active In-Transit (${assignedOrders.length + inTransitOrders.length})` },
          { key: 'DELIVERED', label: `3. Delivered Deliveries (${deliveredOrders.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeSection === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 1. VEHICLE ALLOCATION SECTION ───────────────────────────────────── */}
      {activeSection === 'ASSIGN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Packed Batches Ready for Carrier Assignment</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign temperature-controlled EV trucks, drivers, and delivery slots. Only orders passing Collection, Quality & Crating appear here.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              {awaitingTransportOrders.length} Ready for Pickup
            </span>
          </div>

          {awaitingTransportOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Truck className="w-10 h-10 mx-auto text-teal-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No packed batches currently awaiting transport assignment</p>
              <p className="text-xs text-slate-400 mt-0.5">Complete FPO packaging & QR sealing in FPO Operations to advance batches here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {awaitingTransportOrders.map((order) => {
                const isAssigning = selectedOrderForTransport === order.id;
                const cargoVolume = order.packedQuantityKg || order.acceptedQuantityKg || order.quantityKg;

                return (
                  <div key={order.id} className="p-5 border border-teal-200 bg-teal-50/30 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-xs text-teal-900 font-semibold">{order.batchId}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-200 text-teal-900 px-2 py-0.5 rounded">
                            Packed ({order.crateCount ? `${order.crateCount} Crates` : 'Crated'})
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {order.crop} ({order.variety || 'Hybrid'}) — {cargoVolume.toLocaleString()} kg ({order.qualityGrade})
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pickup: <strong>{order.farmerLocation}</strong> ➔ Destination: <strong>{order.deliveryLocation}</strong> ({order.buyerName})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => openPassportModal(order.batchId)}
                          className="px-3 py-2 border border-slate-200 hover:border-emerald-500 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Passport</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForTransport(isAssigning ? null : order.id)}
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                        >
                          {isAssigning ? 'Cancel Assignment' : 'Assign Vehicle →'}
                        </button>
                      </div>
                    </div>

                    {/* Assignment Modal Form */}
                    {isAssigning && (
                      <div className="p-5 bg-white border border-teal-300 rounded-xl space-y-4 animate-in fade-in">
                        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-teal-600" />
                          <span>Assign Vehicle & Carrier Fleet — Order: {order.id} ({cargoVolume.toLocaleString()} kg)</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Carrier Provider</label>
                            <input
                              type="text"
                              value={carrierName}
                              onChange={(e) => setCarrierName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Vehicle Type</label>
                            <select
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            >
                              <option value="CoolReefer EV 3.5T">CoolReefer EV 3.5T (Battery Electric, 4°C)</option>
                              <option value="Electric Reefer Van 2T">Electric Reefer Van 2T</option>
                              <option value="E-Truck Heavy 5T">E-Truck Heavy 5T</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Vehicle Plate Number</label>
                            <input
                              type="text"
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Driver Name</label>
                            <input
                              type="text"
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Driver Phone</label>
                            <input
                              type="text"
                              value={driverPhone}
                              onChange={(e) => setDriverPhone(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Delivery Slot / ETA</label>
                            <input
                              type="text"
                              value={eta}
                              onChange={(e) => setEta(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedOrderForTransport(null)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAssignTransport(order.id)}
                            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Carrier Assignment</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Assigned Awaiting Dispatch */}
          {assignedOrders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Vehicles Assigned on Bay (Awaiting Departure Dispatch)</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-bold">{assignedOrders.length}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedOrders.map((order) => (
                  <div key={order.id} className="p-5 border border-indigo-200 bg-indigo-50/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded">
                        Vehicle Assigned
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{order.crop} — {(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Vehicle: <strong className="font-mono text-slate-900">{order.transportDetails?.vehicleNumber}</strong> ({order.transportDetails?.vehicleType})
                      </p>
                      <p className="text-xs text-slate-500">Driver: {order.transportDetails?.driverName} ({order.transportDetails?.driverPhone})</p>
                      <p className="text-xs text-slate-500">Destination: {order.deliveryLocation} ({order.buyerName})</p>
                    </div>

                    <div className="pt-3 border-t border-indigo-200/60 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Passport</span>
                      </button>

                      <button
                        onClick={() => handleDispatch(order.id, order.transportDetails?.vehicleNumber)}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Shipment Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active In-Transit Shipments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Active In-Transit Cold-Chain Shipments</span>
                <span className="text-[10px] bg-orange-100 text-orange-900 px-2 py-0.5 rounded font-bold">{inTransitOrders.length}</span>
              </h4>
              <button
                onClick={() => setActiveTab('route-optimization')}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Live Route Topology</span>
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>

            {inTransitOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Truck className="w-10 h-10 mx-auto text-orange-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No shipments currently en route</p>
                <p className="text-xs text-slate-400 mt-0.5">Dispatch assigned vehicles above to monitor active transit corridors.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inTransitOrders.map((order) => (
                  <div key={order.id} className="p-5 border border-orange-200 bg-orange-50/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] text-orange-900 font-bold">{order.batchId}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-200 text-orange-900 px-2 py-0.5 rounded animate-pulse">
                        In Transit
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{order.crop} ({(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg)</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Vehicle: <strong className="font-mono text-slate-900">{order.transportDetails?.vehicleNumber || 'Reefer EV'}</strong> • Driver: {order.transportDetails?.driverName || 'Karthik S.'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Route: {order.farmerLocation} ➔ <strong>{order.deliveryLocation}</strong> ({order.buyerName})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-orange-200/60 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-xs text-orange-800 hover:text-orange-950 font-bold flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Trace QR</span>
                      </button>

                      <button
                        onClick={() => handleMarkDelivered(order.id, order.buyerName)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Arrive & Handover Delivery</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Destination Deliveries & Receiving Handover</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shipments delivered at buyer receiving facilities. Buyer verifies physical produce condition and completes digital confirmation.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              {deliveredOrders.length} Shipments Handed Over
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {deliveredOrders.map((order) => {
              const isConfirmed = order.status === 'Buyer Confirmed' || order.status === 'Payment Pending' || order.status === 'Completed';

              return (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-500">{order.batchId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-sky-100 text-sky-900 border-sky-300'
                        }`}>
                          {isConfirmed ? 'Buyer Confirmed' : 'Buyer Confirmation Pending'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {order.crop} ({(order.packedQuantityKg || order.quantityKg).toLocaleString()} kg) delivered to <strong>{order.buyerName}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Facility: {order.deliveryLocation} • Carrier: {order.transportDetails?.carrierName} ({order.transportDetails?.vehicleNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="px-3 py-1.5 border border-slate-200 hover:border-emerald-500 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Passport</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Order Ledger
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
