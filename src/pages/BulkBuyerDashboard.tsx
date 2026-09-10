import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DemandRequest,
  WorkflowOrder,
  SupplierAllocation,
  BuyerDeliveryConfirmation,
  ProduceListing,
  ShipmentLifecycleStage
} from '../types';
import { BulkShipmentMap } from '../components/BulkShipmentMap';
import confetti from 'canvas-confetti';
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
  Check,
  AlertTriangle,
  QrCode,
  FileCheck2,
  Users,
  Radio,
  Sliders,
  Scale,
  DollarSign,
  PackageCheck,
  Filter,
  RefreshCw,
  Award
} from 'lucide-react';

const LIFECYCLE_STAGES: Array<{ id: ShipmentLifecycleStage; label: string; desc: string }> = [
  { id: 'DEMAND_CREATED', label: '1. Demand Created', desc: 'Bulk requirement published to network' },
  { id: 'SUPPLIERS_MATCHED', label: '2. Suppliers Matched', desc: 'Algorithmic farmer & FPO matching' },
  { id: 'SUPPLY_CONFIRMED', label: '3. Supply Confirmed', desc: 'Quota allocated across suppliers' },
  { id: 'PRODUCE_READY', label: '4. Produce Ready', desc: 'Crops harvested & sorted at farm gate' },
  { id: 'COLLECTION_SCHEDULED', label: '5. Collection Scheduled', desc: 'Fleet multi-stop route assigned' },
  { id: 'COLLECTED', label: '6. Collected', desc: 'Weighed & received from farm gates' },
  { id: 'AT_AGGREGATION_HUB', label: '7. At Aggregation Hub', desc: 'Consolidated at regional micro-hub' },
  { id: 'QUALITY_VERIFIED', label: '8. Quality Verified', desc: 'Brix & residue certified Grade A' },
  { id: 'LOADED_FOR_TRANSPORT', label: '9. Loaded for Transport', desc: 'Sealed into CoolReefer EV 5.5T' },
  { id: 'IN_TRANSIT', label: '10. In Transit', desc: 'Cold-chain telemetry broadcast' },
  { id: 'NEAR_DESTINATION', label: '11. Near Destination', desc: 'Within 15km geofence corridor' },
  { id: 'DELIVERED', label: '12. Delivered', desc: 'Arrived at receiving bay dock' },
  { id: 'DELIVERY_CONFIRMED', label: '13. Delivery Confirmed', desc: 'Buyer digital OTP & weight acceptance' },
  { id: 'SETTLEMENT_COMPLETED', label: '14. Settlement Done', desc: 'Automated instant farmer escrow payout' }
];

export const BulkBuyerDashboard: React.FC = () => {
  const {
    currentUser,
    demandRequests,
    addDemandRequest,
    deleteDemandRequest,
    produceListings,
    orders,
    buyerConfirmDelivery,
    openPassportModal,
    setActiveTab
  } = useApp();

  // Active View Tab inside Bulk Buyer Portal
  const [activePortalTab, setActivePortalTab] = useState<'OVERVIEW' | 'AGGREGATION' | 'TRACKING' | 'ORDERS'>('OVERVIEW');

  // Modal State for Creating Bulk Demand
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [crop, setCrop] = useState('Tomato');
  const [variety, setVariety] = useState('Sivam Hybrid (Firm Processing)');
  const [rawQuantity, setRawQuantity] = useState<number>(5000);
  const [unit, setUnit] = useState<'kg' | 'Quintal' | 'Crates' | 'Ton'>('kg');
  const [quality, setQuality] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [location, setLocation] = useState('Ambattur Processing Terminal, Chennai');
  const [deliveryDate, setDeliveryDate] = useState('2026-09-12');
  const [deliveryWindow, setDeliveryWindow] = useState('05:00 AM - 08:30 AM');
  const [maxPrice, setMaxPrice] = useState<number>(31.0);

  // Aggregation Engine State: Multi-Supplier Allocation
  const [selectedDemandId, setSelectedDemandId] = useState<string>('DEM-BULK-2026-01');
  const [allocations, setAllocations] = useState<Record<string, number>>({
    'LST-001': 1000,   // Rajesh Kumar
    'LST-002': 800,    // K. Selvam
    'LST-FPO-01': 2000,// Villupuram FPO
    'LST-003': 1200    // Murugesan P.
  });
  const [allocationSuccessNotice, setAllocationSuccessNotice] = useState<string | null>(null);

  // Delivery Verification Modal State
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<WorkflowOrder | null>(null);
  const [receivedKg, setReceivedKg] = useState<number>(5000);
  const [acceptedKg, setAcceptedKg] = useState<number>(5000);
  const [rejectedKg, setRejectedKg] = useState<number>(0);
  const [deliveryStatus, setDeliveryStatus] = useState<'ACCEPTED_FULL' | 'ACCEPTED_PARTIAL' | 'REJECTED'>('ACCEPTED_FULL');
  const [inspectorRemarks, setInspectorRemarks] = useState<string>('All 200 crates received intact at 4.2°C. Zero transport spoilage. Uniform size & firmness.');
  const [receiverName, setReceiverName] = useState<string>(currentUser.name || 'Vikramaditya Singhania');

  // Convert unit to kg
  const getUnitMultiplier = (u: 'kg' | 'Quintal' | 'Crates' | 'Ton'): number => {
    switch (u) {
      case 'Quintal': return 100;
      case 'Crates': return 25;
      case 'Ton': return 1000;
      default: return 1;
    }
  };
  const totalDemandKg = rawQuantity * getUnitMultiplier(unit);

  // Scoped orders belonging to Bulk Buyer
  const bulkOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.isBulkOrder ||
        o.buyerId === currentUser.id ||
        o.buyerName.toLowerCase().includes('bulk') ||
        o.buyerName.toLowerCase().includes('metro') ||
        o.quantityKg >= 3000
    );
  }, [orders, currentUser]);

  const activeShipment = bulkOrders.find((o) => o.status === 'In Transit' || o.lifecycleStage === 'IN_TRANSIT') || bulkOrders[0] || orders[0];

  // Bulk demands
  const bulkDemands = useMemo(() => {
    return demandRequests.filter(
      (d) =>
        d.id.includes('BULK') ||
        d.buyerId === currentUser.id ||
        d.buyerType?.toLowerCase().includes('processor') ||
        d.quantityKg >= 2500
    );
  }, [demandRequests, currentUser]);

  // Aggregate Metrics
  const activeDemandCount = bulkDemands.length > 0 ? bulkDemands.length : 3;
  const totalRequiredQuantityKg = bulkDemands.reduce((sum, d) => sum + (d.initialQuantityKg || d.quantityKg), 0) || 15000;
  const confirmedSupplyKg = bulkOrders.reduce((sum, o) => sum + o.quantityKg, 0) || 12800;
  const inTransitCount = bulkOrders.filter((o) => o.status === 'In Transit').length || 1;
  const completedDeliveriesCount = bulkOrders.filter((o) => o.status === 'Delivered' || o.status === 'Buyer Confirmed' || o.status === 'Completed').length || 14;
  const activeSuppliersCount = 4; // 3 smallholder farmers + 1 FPO collective

  // Create Bulk Demand Handler
  const handleCreateBulkDemand = (e: React.FormEvent) => {
    e.preventDefault();

    const newBulkDemand: DemandRequest = {
      id: `DEM-BULK-${Date.now().toString().slice(-4)}`,
      buyerId: currentUser.id || 'usr-bulkbuyer-01',
      buyerName: currentUser.organization || currentUser.name || 'Metro Agri Processors & Wholesale Ltd.',
      buyerType: 'Food Processor',
      crop,
      variety,
      quantityKg: Number(totalDemandKg),
      initialQuantityKg: Number(totalDemandKg),
      allocatedQuantityKg: 0,
      unit,
      qualityRequirement: quality,
      location,
      deliveryDate,
      deliveryTimeWindow: deliveryWindow,
      maxTargetPricePerKg: Number(maxPrice),
      status: 'OPEN',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    addDemandRequest(newBulkDemand);
    setIsCreateModalOpen(false);
    setSelectedDemandId(newBulkDemand.id);
    setActivePortalTab('AGGREGATION');
    confetti({ particleCount: 35, origin: { y: 0.6 } });
  };

  // Allocation quantity change helper
  const handleAllocationChange = (listingId: string, qty: number) => {
    setAllocations((prev) => ({
      ...prev,
      [listingId]: Math.max(0, qty)
    }));
  };

  // Total currently allocated in simulation
  const currentTotalAllocated = Object.values(allocations).reduce((sum, q) => sum + (Number(q) || 0), 0);
  const targetRequired = 5000; // Target kg for bulk tomato demand
  const allocationPercent = Math.min(100, Number(((currentTotalAllocated / targetRequired) * 100).toFixed(0)));

  // Confirm Multi-Supplier Procurement
  const handleConfirmMultiSupplierProcurement = () => {
    setAllocationSuccessNotice(
      `Procurement Quota Confirmed! 5,000 kg Tomato allocated across 4 verified suppliers (3 Farmers + 1 FPO). Collection scheduled.`
    );
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setAllocationSuccessNotice(null);
      setActivePortalTab('TRACKING');
    }, 2800);
  };

  // Confirm Delivery Handler
  const handleConfirmDeliveryReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    const conf: BuyerDeliveryConfirmation = {
      orderId: selectedOrderForDelivery.id,
      deliveredQuantityKg: Number(selectedOrderForDelivery.quantityKg),
      receivedQuantityKg: Number(receivedKg),
      acceptedQuantityKg: Number(acceptedKg),
      rejectedQuantityKg: Number(rejectedKg),
      acceptanceStatus: deliveryStatus,
      issuesReported: inspectorRemarks,
      receiverName,
      receiverRole: 'Procurement Quality Director',
      confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      signatureOrOtp: `OTP-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`
    };

    buyerConfirmDelivery(selectedOrderForDelivery.id, conf);
    setSelectedOrderForDelivery(null);
    confetti({ particleCount: 50, origin: { y: 0.5 } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* Top Banner: Authentic Light Agricultural Green */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-100 backdrop-blur-xs border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>SIH2026 Problem Statement SIH26033: Elimination of Intermediaries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Bulk Buyer Procurement & Logistics Control
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Institutional multi-supplier procurement portal for food processors, retail chains, and wholesale buyers. Aggregate smallholder farmer quotas, track 14-stage cold chain transport, and trigger automated instant settlement.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-white text-emerald-900 font-semibold rounded-2xl shadow-sm hover:bg-emerald-50 transition flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Create Bulk Demand</span>
            </button>
            <button
              onClick={() => setActivePortalTab('AGGREGATION')}
              className="px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-medium rounded-2xl border border-white/20 transition flex items-center gap-2 text-xs cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Supplier Aggregation</span>
            </button>
          </div>
        </div>

        {/* Portal Internal Sub-Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'OVERVIEW', label: 'Procurement Overview', icon: ShoppingBag },
            { id: 'AGGREGATION', label: 'Multi-Supplier Aggregation', icon: Users },
            { id: 'TRACKING', label: 'OpenStreetMap Tracking & Telemetry', icon: Truck },
            { id: 'ORDERS', label: 'Consolidated Bulk Orders', icon: PackageCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePortalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePortalTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 font-semibold shadow-xs'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Active Bulk Demands',
            value: `${activeDemandCount} Demands`,
            sub: 'Open for matching',
            icon: Sparkles,
            color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
          },
          {
            label: 'Total Required Qty',
            value: `${(totalRequiredQuantityKg / 1000).toFixed(1)} MT`,
            sub: `${totalRequiredQuantityKg.toLocaleString()} kg net`,
            icon: Scale,
            color: 'text-teal-700 bg-teal-50 border-teal-200'
          },
          {
            label: 'Confirmed Supply',
            value: `${(confirmedSupplyKg / 1000).toFixed(1)} MT`,
            sub: '85.3% aggregated',
            icon: CheckCircle2,
            color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
          },
          {
            label: 'Orders in Transit',
            value: `${inTransitCount} Reefer EV`,
            sub: 'Real-time telemetry',
            icon: Truck,
            color: 'text-amber-700 bg-amber-50 border-amber-200'
          },
          {
            label: 'Deliveries Completed',
            value: `${completedDeliveriesCount} Orders`,
            sub: '100% verified',
            icon: Award,
            color: 'text-blue-700 bg-blue-50 border-blue-200'
          },
          {
            label: 'Active Suppliers',
            value: `${activeSuppliersCount} Nodes`,
            sub: '3 Farmers + 1 FPO',
            icon: Users,
            color: 'text-emerald-800 bg-emerald-50 border-emerald-300'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-2xs flex flex-col justify-between hover:shadow-xs transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 leading-tight">
                  {kpi.label}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Section 1: Overview */}
      {activePortalTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Active 14-Stage Tracking Milestone Flow */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Live Lifecycle Architecture
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Order: {activeShipment.id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">
                  14-Stage Procurement & Goods Tracking Lifecycle
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous operational traceability from farmer gate harvest to receiving dock settlement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPassportModal(activeShipment.batchId)}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Inspect Produce Passport</span>
                </button>
              </div>
            </div>

            {/* Horizontal 14-Stage Timeline Tracker */}
            <div className="relative overflow-x-auto pb-4 pt-2">
              <div className="flex items-start min-w-[1200px] justify-between relative">
                {/* Connecting track line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-1 bg-emerald-600 -z-0 transition-all duration-500"
                  style={{ width: '68%' }}
                />

                {LIFECYCLE_STAGES.map((st, i) => {
                  // Stage 1 to 10 are completed in active simulation
                  const isCompleted = i < 9;
                  const isActive = i === 9; // Stage 10: In Transit
                  const isFuture = i > 9;

                  return (
                    <div key={st.id} className="flex flex-col items-center text-center relative z-10 w-20">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-md scale-110'
                            : isCompleted
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isActive ? (
                          <Truck className="w-4 h-4 animate-bounce" />
                        ) : (
                          <span className="text-xs font-semibold">{i + 1}</span>
                        )}
                      </div>
                      <p className={`text-[11px] font-semibold mt-2.5 leading-tight ${
                        isActive ? 'text-emerald-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {st.label.split('. ')[1]}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {st.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transportation Map Integration Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Active Goods Movement Corridor (OpenStreetMap)
                </h3>
                <p className="text-xs text-slate-500">
                  Geospatial tracking of consolidated bulk cargo with cold-chain sensor telemetry.
                </p>
              </div>
              <button
                onClick={() => setActivePortalTab('TRACKING')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Full Screen Telematics View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BulkShipmentMap order={activeShipment} />
          </div>

          {/* Quick Action Split: Demands vs Recent Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Open Bulk Demands (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Open Bulk Demands</h4>
                  <p className="text-xs text-slate-500">Demands requiring multi-supplier pooling</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                  title="Add new bulk demand"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {bulkDemands.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer"
                    onClick={() => {
                      setSelectedDemandId(d.id);
                      setActivePortalTab('AGGREGATION');
                    }}
                  >
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold text-slate-900">{d.crop} • {d.variety || 'Hybrid'}</span>
                      <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                        {d.quantityKg.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{d.location}</span>
                      </span>
                      <span className="font-semibold text-emerald-800">Max ₹{d.maxTargetPricePerKg}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound Cargo Telematics & Active Suppliers (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Inbound Consolidated Suppliers</h4>
                  <p className="text-xs text-slate-500">Farmers & FPOs contributing to Order {activeShipment.id}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  4 Active Suppliers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeShipment.multiSupplierAllocations?.map((sup) => (
                  <div
                    key={sup.supplierId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                          {sup.supplierName.split('(')[0]}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          sup.supplierType === 'FPO' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {sup.supplierType}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{sup.location}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-800">{sup.allocatedKg.toLocaleString()} kg</span>
                      <span className="text-[11px] text-slate-600">₹{sup.pricePerKg}/kg • {sup.distanceKm} km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Section 2: Multi-Supplier Aggregation Engine */}
      {activePortalTab === 'AGGREGATION' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Demand-to-Supply Aggregation Matrix
                </span>
                <h2 className="text-xl font-semibold text-slate-900 mt-2">
                  Multi-Supplier Allocation Engine
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate required bulk procurement volume among multiple smallholder farmers and FPO collectives.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[260px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Aggregated Quota:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {currentTotalAllocated.toLocaleString()} / {targetRequired.toLocaleString()} kg
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      allocationPercent >= 100 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${allocationPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-right mt-1 font-medium">
                  {allocationPercent}% of Bulk Demand Fulfilled
                </p>
              </div>
            </div>

            {/* Notification Banner */}
            {allocationSuccessNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="font-medium">{allocationSuccessNotice}</p>
              </div>
            )}

            {/* Allocation Table / Cards */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 grid grid-cols-12 text-xs font-semibold text-slate-600">
                <div className="col-span-4">Supplier Node (Farmer / FPO)</div>
                <div className="col-span-2 text-center">Available Capacity</div>
                <div className="col-span-2 text-center">Offered Price</div>
                <div className="col-span-2 text-center">Distance & Quality</div>
                <div className="col-span-2 text-right">Allocated Quota (kg)</div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  {
                    id: 'LST-001',
                    name: 'Rajesh Kumar (Sunguvarchatram Farm Gate)',
                    type: 'FARMER',
                    location: 'Sunguvarchatram, Kanchipuram',
                    crop: 'Tomato (Sivam Hybrid)',
                    availableKg: 1000,
                    price: 30.0,
                    distanceKm: 42,
                    grade: 'Grade A',
                    rating: 4.9
                  },
                  {
                    id: 'LST-002',
                    name: 'K. Selvam (Kanchipuram North Farms)',
                    type: 'FARMER',
                    location: 'Kanchipuram North',
                    crop: 'Tomato (Sivam Hybrid)',
                    availableKg: 800,
                    price: 29.5,
                    distanceKm: 65,
                    grade: 'Grade A',
                    rating: 4.85
                  },
                  {
                    id: 'LST-FPO-01',
                    name: 'Villupuram Farmer Collective (FPO Consolidation Hub)',
                    type: 'FPO',
                    location: 'Villupuram Agro Hub',
                    crop: 'Tomato (Sivam Hybrid)',
                    availableKg: 2500,
                    price: 30.5,
                    distanceKm: 135,
                    grade: 'Grade A',
                    rating: 4.92
                  },
                  {
                    id: 'LST-003',
                    name: 'Murugesan P. (Sriperumbudur Rural Hub)',
                    type: 'FARMER',
                    location: 'Sriperumbudur Rural',
                    crop: 'Tomato (Sivam Hybrid)',
                    availableKg: 1200,
                    price: 30.0,
                    distanceKm: 36,
                    grade: 'Grade A',
                    rating: 4.88
                  }
                ].map((sup) => {
                  const currentAlloc = allocations[sup.id] || 0;
                  return (
                    <div key={sup.id} className="px-4 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50/50 transition gap-2">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            sup.type === 'FPO' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {sup.type}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">{sup.name.split('(')[0]}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{sup.location} • ★ {sup.rating}</p>
                      </div>

                      <div className="col-span-2 text-center font-medium text-slate-700 font-mono">
                        {sup.availableKg.toLocaleString()} kg
                      </div>

                      <div className="col-span-2 text-center font-semibold text-emerald-800">
                        ₹{sup.price.toFixed(2)}/kg
                      </div>

                      <div className="col-span-2 text-center text-slate-600">
                        <span className="font-medium">{sup.distanceKm} km</span> •{' '}
                        <span className="text-emerald-700 font-semibold">{sup.grade}</span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={currentAlloc}
                          min={0}
                          max={sup.availableKg}
                          onChange={(e) => handleAllocationChange(sup.id, Number(e.target.value))}
                          className="w-24 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Confirm Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-600">
                <p>
                  Bulk Requirement: <b>5,000 kg Tomato</b> | Currently Allocated:{' '}
                  <b className="text-emerald-800">{currentTotalAllocated.toLocaleString()} kg</b>
                </p>
              </div>

              <button
                onClick={handleConfirmMultiSupplierProcurement}
                disabled={currentTotalAllocated === 0}
                className="btn-primary text-xs flex items-center gap-2 py-3 px-6 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Multi-Supplier Aggregation Quota</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Section 3: OpenStreetMap Transportation & Live Telematics */}
      {activePortalTab === 'TRACKING' && (
        <div className="space-y-6">
          <BulkShipmentMap order={activeShipment} />

          {/* Detailed Shipment Status Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Consignment Identity
              </span>
              <h4 className="text-base font-semibold text-slate-900">{activeShipment.crop} Bulk Batch</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p><b>Shipment ID:</b> {activeShipment.id}</p>
                <p><b>Produce Passport:</b> {activeShipment.batchId}</p>
                <p><b>Total Weight:</b> {activeShipment.quantityKg.toLocaleString()} kg (200 Crates)</p>
                <p><b>Quality Certification:</b> NABL Certified Grade A</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Cold Chain Telematics
              </span>
              <h4 className="text-base font-semibold text-slate-900">Heavy Reefer EV 5.5T</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p><b>Vehicle Reg:</b> TN-09-BK-9182</p>
                <p><b>Driver / Captain:</b> Karthik S. (+91 98410 44021)</p>
                <p><b>Internal Reefer Temperature:</b> +4.2°C Continuous</p>
                <p><b>Corridor Speed:</b> 54 km/h (NH-48 Corridor)</p>
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Receiving Bay Destination
                </span>
                <h4 className="text-base font-semibold text-slate-900">Ambattur Processing Dock</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Estimated Dock Handover: <b>Today, 06:45 AM</b>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedOrderForDelivery(activeShipment)}
                  className="btn-primary text-xs flex items-center gap-1.5 w-full justify-center"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Verify & Confirm Delivery</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Section 4: Consolidated Orders & Quality Audits */}
      {activePortalTab === 'ORDERS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Institutional Procurement Orders</h3>
                <p className="text-xs text-slate-500">
                  Track deliveries, inspect quality certificates, and verify weight receipts.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                {bulkOrders.length} Recorded Orders
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {bulkOrders.map((o) => (
                <div key={o.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{o.crop}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {o.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        o.status === 'In Transit' ? 'bg-orange-100 text-orange-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {o.quantityKg.toLocaleString()} kg • ₹{o.pricePerKg}/kg • Total ₹{o.totalValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Suppliers: {o.farmerName} • Destination: {o.deliveryLocation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPassportModal(o.batchId)}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Passport</span>
                    </button>
                    {o.status === 'In Transit' && (
                      <button
                        onClick={() => setSelectedOrderForDelivery(o)}
                        className="btn-primary text-xs flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Accept Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Bulk Purchase Demand */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Create Bulk Procurement Demand</h3>
                  <p className="text-xs text-slate-500">Post requirement to smallholder farmer and FPO network</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBulkDemand} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Crop / Commodity</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Onion">Onion</option>
                    <option value="Potato">Potato</option>
                    <option value="Green Chilli">Green Chilli</option>
                    <option value="Capsicum">Capsicum</option>
                    <option value="Carrot">Carrot</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Variety / Specification</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Sivam Hybrid (Firm Processing)"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Required Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={rawQuantity}
                      onChange={(e) => setRawQuantity(Number(e.target.value))}
                      min={100}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="bg-slate-100 border border-slate-300 rounded-xl px-2 text-xs font-medium"
                    >
                      <option value="kg">kg</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Ton">Ton</option>
                      <option value="Crates">Crates</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Calculated: {totalDemandKg.toLocaleString()} kg net</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quality Grade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Grade A">Grade A (Premium Retail & Processing)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Standard">Standard Agro Spec</option>
                    <option value="Premium">Export Premium Grade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Max Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    min={5}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Required Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delivery Destination Facility</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ambattur Processing Terminal, Chennai"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Bulk Requirement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Digital Delivery Receipt & Quality Verification */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Goods Receiving & Verification</h3>
                  <p className="text-xs text-slate-500">Order #{selectedOrderForDelivery.id} • {selectedOrderForDelivery.crop}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeliveryReceipt} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Manifest Qty</span>
                  <span className="text-sm font-bold text-slate-900">{selectedOrderForDelivery.quantityKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Reefer Temp</span>
                  <span className="text-sm font-bold text-emerald-700">+4.2°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Grade Checked</span>
                  <span className="text-sm font-bold text-slate-900">Grade A</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Accepted Weight (kg)</label>
                  <input
                    type="number"
                    value={acceptedKg}
                    onChange={(e) => {
                      const acc = Number(e.target.value);
                      setAcceptedKg(acc);
                      setRejectedKg(Math.max(0, receivedKg - acc));
                    }}
                    max={receivedKg}
                    min={0}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-emerald-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rejected Weight (kg)</label>
                  <input
                    type="number"
                    value={rejectedKg}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delivery Handover Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACCEPTED_FULL">Accepted Full Consignment (Zero Defects)</option>
                  <option value="ACCEPTED_PARTIAL">Accepted Partial Consignment (Minor Deduction)</option>
                  <option value="REJECTED">Rejected Consignment</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quality Inspection Remarks</label>
                <textarea
                  value={inspectorRemarks}
                  onChange={(e) => setInspectorRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Confirming delivery immediately activates automated escrow release to the 4 smallholder farmers and FPOs.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify Weight & Authorize Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
