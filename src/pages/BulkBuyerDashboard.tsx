import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
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
  Award,
  Sprout,
  Package,
  Navigation
} from 'lucide-react';

const STAGE_ICONS: Record<ShipmentLifecycleStage, React.ElementType> = {
  DEMAND_CREATED: Plus,
  SUPPLIERS_MATCHED: Users,
  SUPPLY_CONFIRMED: CheckCircle2,
  PRODUCE_READY: Sprout,
  COLLECTION_SCHEDULED: Calendar,
  COLLECTED: PackageCheck,
  AT_AGGREGATION_HUB: Building2,
  QUALITY_VERIFIED: ShieldCheck,
  LOADED_FOR_TRANSPORT: Package,
  IN_TRANSIT: Truck,
  NEAR_DESTINATION: Navigation,
  DELIVERED: Check,
  DELIVERY_CONFIRMED: FileCheck2,
  SETTLEMENT_COMPLETED: DollarSign
};

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
  const { t } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner: Authentic Light Agricultural Palette */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-emerald-500/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccd5ae]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#fefae0] backdrop-blur-sm border border-white/20">
              <Building2 className="w-3.5 h-3.5 text-[#ccd5ae]" />
              <span>{t('bulkBuyer.sihGoal', 'SIH2026 Problem Statement SIH26033: Elimination of Intermediaries')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {t('bulkBuyer.procurementTitle', 'Bulk Buyer Procurement & Logistics Control')}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              {t('bulkBuyer.procurementSubtitle', 'Institutional multi-supplier procurement portal for food processors, retail chains, and wholesale buyers. Aggregate smallholder farmer quotas, track 14-stage cold chain transport, and trigger automated instant settlement.')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-[#e9edc9] hover:bg-[#fefae0] text-[#01472e] font-semibold rounded-2xl shadow-sm transition flex items-center gap-2 text-xs tracking-wide cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#01472e]" />
              <span>{t('bulkBuyer.createBulkDemand', 'Create Bulk Demand')}</span>
            </button>
            <button
              onClick={() => setActivePortalTab('AGGREGATION')}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-2xl border border-white/20 transition flex items-center gap-2 text-xs tracking-wide cursor-pointer backdrop-blur-sm"
            >
              <Users className="w-4 h-4 text-[#ccd5ae]" />
              <span>{t('bulkBuyer.supplierAggregation', 'Supplier Aggregation')}</span>
            </button>
          </div>
        </div>

        {/* Portal Internal Sub-Navigation Tabs */}
        <div className="mt-8 pt-5 border-t border-white/15 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'OVERVIEW', label: t('bulkBuyer.tabOverview', 'Procurement Overview'), icon: ShoppingBag },
            { id: 'AGGREGATION', label: t('bulkBuyer.tabAggregation', 'Multi-Supplier Aggregation'), icon: Users },
            { id: 'TRACKING', label: t('bulkBuyer.tabTracking', 'OpenStreetMap Tracking & Telemetry'), icon: Truck },
            { id: 'ORDERS', label: t('bulkBuyer.tabOrders', 'Consolidated Bulk Orders'), icon: PackageCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePortalTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePortalTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#01472e] font-semibold shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            label: t('bulkBuyer.activeBulkDemands', 'Active Bulk Demands'),
            value: `${activeDemandCount} Demands`,
            sub: t('bulkBuyer.openForMatching', 'Open for matching'),
            icon: Sparkles,
            color: 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
          },
          {
            label: t('bulkBuyer.totalRequiredQty', 'Total Required Qty'),
            value: `${(totalRequiredQuantityKg / 1000).toFixed(1)} MT`,
            sub: `${totalRequiredQuantityKg.toLocaleString()} kg net`,
            icon: Scale,
            color: 'text-[#01472e] bg-[#e9edc9]/50 border-[#ccd5ae]/50'
          },
          {
            label: t('bulkBuyer.confirmedSupply', 'Confirmed Supply'),
            value: `${(confirmedSupplyKg / 1000).toFixed(1)} MT`,
            sub: t('bulkBuyer.percentAggregated', '85.3% aggregated'),
            icon: CheckCircle2,
            color: 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
          },
          {
            label: t('bulkBuyer.ordersInTransit', 'Orders in Transit'),
            value: `${inTransitCount} Reefer EV`,
            sub: t('bulkBuyer.realTimeTelemetry', 'Real-time telemetry'),
            icon: Truck,
            color: 'text-amber-800 bg-amber-50 border-amber-200'
          },
          {
            label: t('bulkBuyer.deliveriesCompleted', 'Deliveries Completed'),
            value: `${completedDeliveriesCount} Orders`,
            sub: t('bulkBuyer.verified100', '100% verified'),
            icon: Award,
            color: 'text-[#01472e] bg-[#eaf4ec] border-[#a3b18a]/40'
          },
          {
            label: t('bulkBuyer.activeSuppliers', 'Active Suppliers'),
            value: `${activeSuppliersCount} Nodes`,
            sub: t('bulkBuyer.suppliersBreakdown', '3 Farmers + 1 FPO'),
            icon: Users,
            color: 'text-[#01472e] bg-[#e9edc9]/50 border-[#ccd5ae]/50'
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="agri-card rounded-[24px] p-4.5 border border-[#ccd5ae]/40 shadow-soft hover:shadow-forest/10 hover:border-[#a3b18a]/60 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#01472e]/60 uppercase tracking-wider leading-tight">
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-[#01472e] tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[10px] text-[#01472e]/60 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Section 1: Overview */}
      {activePortalTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Active 14-Stage Tracking Milestone Flow */}
          <div className="agri-card rounded-[32px] p-6 sm:p-8 border border-[#ccd5ae]/40 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#01472e] bg-[#eaf4ec] px-3 py-1 rounded-full border border-[#a3b18a]/40">
                    {t('bulkBuyer.liveLifecycle', 'Live Lifecycle Architecture')}
                  </span>
                  <span className="text-xs text-[#01472e]/60 font-mono">
                    {t('common.order', 'Order')}: {activeShipment.id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#01472e] mt-1.5">
                  {t('bulkBuyer.fourteenStageLifecycle', '14-Stage Procurement & Goods Tracking Lifecycle')}
                </h3>
                <p className="text-xs text-[#01472e]/70">
                  {t('bulkBuyer.lifecycleSubtitle', 'Continuous operational traceability from farmer gate harvest to receiving dock settlement.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPassportModal(activeShipment.batchId)}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-4 rounded-2xl"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                  <span>{t('bulkBuyer.inspectPassport', 'Inspect Produce Passport')}</span>
                </button>
              </div>
            </div>

            {/* Horizontal 14-Stage Timeline Tracker */}
            <div className="relative overflow-x-auto pb-4 pt-2">
              <div className="flex items-start min-w-[1200px] justify-between relative">
                {/* Connecting track line */}
                <div className="absolute top-4 left-6 right-6 h-1.5 bg-[#e9edc9]/50 -z-0 rounded-full" />
                <div
                  className="absolute top-4 left-6 h-1.5 bg-[#01472e] -z-0 transition-all duration-500 rounded-full"
                  style={{ width: '68%' }}
                />

                {LIFECYCLE_STAGES.map((st, i) => {
                  const isCompleted = i < 9;
                  const isActive = i === 9; // Stage 10: In Transit
                  const StageIcon = STAGE_ICONS[st.id] || CheckCircle2;

                  return (
                    <div key={st.id} className="flex flex-col items-center text-center relative z-10 w-20">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-[#01472e] text-white ring-4 ring-[#ccd5ae]/40 shadow-forest scale-110'
                            : isCompleted
                            ? 'bg-[#01472e] text-white shadow-soft'
                            : 'bg-white border-2 border-[#ccd5ae]/50 text-[#01472e]/40'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isActive ? (
                          <Truck className="w-4 h-4 animate-bounce text-[#ccd5ae]" />
                        ) : (
                          <StageIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <p className={`text-[11px] font-semibold mt-2.5 leading-tight ${
                        isActive ? 'text-[#01472e] font-bold' : isCompleted ? 'text-[#01472e]' : 'text-[#01472e]/40'
                      }`}>
                        {t(`bulkBuyer.stage.${st.id}.label`, st.label.split('. ')[1])}
                      </p>
                      <p className="text-[9px] text-[#01472e]/60 mt-0.5 leading-snug line-clamp-2">
                        {t(`bulkBuyer.stage.${st.id}.desc`, st.desc)}
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
                <h3 className="text-lg font-semibold text-[#01472e]">
                  {t('bulkBuyer.activeCorridor', 'Active Goods Movement Corridor (OpenStreetMap)')}
                </h3>
                <p className="text-xs text-[#01472e]/70">
                  {t('bulkBuyer.activeCorridorSubtitle', 'Geospatial tracking of consolidated bulk cargo with cold-chain sensor telemetry.')}
                </p>
              </div>
              <button
                onClick={() => setActivePortalTab('TRACKING')}
                className="text-xs font-semibold text-[#01472e] hover:text-[#025a3b] flex items-center gap-1"
              >
                <span>{t('bulkBuyer.fullScreenTelematics', 'Full Screen Telematics View')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BulkShipmentMap order={activeShipment} />
          </div>

          {/* Quick Action Split: Demands vs Recent Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Open Bulk Demands (5 cols) */}
            <div className="lg:col-span-5 agri-card rounded-[32px] p-6 sm:p-7 border border-[#ccd5ae]/40 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#01472e]">{t('bulkBuyer.openBulkDemands', 'Open Bulk Demands')}</h4>
                  <p className="text-xs text-[#01472e]/70">{t('bulkBuyer.demandsRequiringPooling', 'Demands requiring multi-supplier pooling')}</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 rounded-xl bg-[#eaf4ec] text-[#01472e] hover:bg-[#e9edc9] transition"
                  title={t('bulkBuyer.createBulkDemand', 'Add new bulk demand')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {bulkDemands.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-2xl border border-[#ccd5ae]/40 hover:border-[#a3b18a] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 transition cursor-pointer"
                    onClick={() => {
                      setSelectedDemandId(d.id);
                      setActivePortalTab('AGGREGATION');
                    }}
                  >
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold text-[#01472e] flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{d.crop} • {d.variety || 'Hybrid'}</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                        {d.quantityKg.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="text-[11px] text-[#01472e]/70 flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#a3b18a]" />
                        <span className="truncate max-w-[180px]">{d.location}</span>
                      </span>
                      <span className="font-semibold text-[#01472e]">Max ₹{d.maxTargetPricePerKg}/kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound Cargo Telematics & Active Suppliers (7 cols) */}
            <div className="lg:col-span-7 agri-card rounded-[32px] p-6 sm:p-7 border border-[#ccd5ae]/40 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#01472e]">{t('bulkBuyer.inboundSuppliers', 'Inbound Consolidated Suppliers')}</h4>
                  <p className="text-xs text-[#01472e]/70">{t('bulkBuyer.contributingSuppliersSubtitle', 'Farmers & FPOs contributing to Order {id}', { id: activeShipment.id })}</p>
                </div>
                <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3 py-1 rounded-full border border-[#a3b18a]/40">
                  {t('bulkBuyer.activeSuppliersCount', '{count} Active Suppliers', { count: 4 })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeShipment.multiSupplierAllocations?.map((sup) => (
                  <div
                    key={sup.supplierId}
                    className="p-4 rounded-2xl border border-[#ccd5ae]/40 bg-[#faf9f5] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-[#01472e] truncate max-w-[180px]">
                          {sup.supplierName.split('(')[0]}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          sup.supplierType === 'FPO' ? 'bg-[#e9edc9] text-[#01472e] border-[#ccd5ae]' : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                        }`}>
                          {sup.supplierType}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#01472e]/60 truncate">{sup.location}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#01472e]">{sup.allocatedKg.toLocaleString()} kg</span>
                      <span className="text-[11px] text-[#01472e]/70">₹{sup.pricePerKg}/kg • {sup.distanceKm} km</span>
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
          <div className="agri-card rounded-[32px] p-6 sm:p-8 border border-[#ccd5ae]/40 shadow-soft space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
                  {t('bulkBuyer.demandSupplyMatrix', 'Demand-to-Supply Aggregation Matrix')}
                </span>
                <h2 className="text-xl font-semibold text-[#01472e] mt-2">
                  {t('bulkBuyer.allocationEngine', 'Multi-Supplier Allocation Engine')}
                </h2>
                <p className="text-xs text-[#01472e]/70 mt-0.5">
                  {t('bulkBuyer.allocationSubtitle', 'Allocate required bulk procurement volume among multiple smallholder farmers and FPO collectives.')}
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="bg-[#faf9f5] border border-[#ccd5ae]/40 rounded-2xl p-4 min-w-[260px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#01472e]/70 font-medium">{t('bulkBuyer.aggregatedQuota', 'Aggregated Quota:')}</span>
                  <span className="font-bold text-[#01472e] font-mono">
                    {currentTotalAllocated.toLocaleString()} / {targetRequired.toLocaleString()} kg
                  </span>
                </div>
                <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      allocationPercent >= 100 ? 'bg-[#01472e]' : 'bg-amber-500'
                    }`}
                    style={{ width: `${allocationPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#01472e]/60 text-right mt-1 font-medium">
                  {t('bulkBuyer.demandFulfilled', '{percent}% of Bulk Demand Fulfilled', { percent: allocationPercent })}
                </p>
              </div>
            </div>

            {/* Notification Banner */}
            {allocationSuccessNotice && (
              <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center gap-3 text-xs text-[#01472e] animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#01472e] shrink-0" />
                <p className="font-medium">{allocationSuccessNotice}</p>
              </div>
            )}

            {/* Allocation Table / Cards */}
            <div className="border border-[#ccd5ae]/40 rounded-2xl overflow-hidden">
              <div className="bg-[#fefae0]/50 px-4 py-3 border-b border-[#ccd5ae]/30 grid grid-cols-12 text-xs font-semibold text-[#01472e]/70 uppercase tracking-wider">
                <div className="col-span-4">{t('bulkBuyer.supplierNode', 'Supplier Node (Farmer / FPO)')}</div>
                <div className="col-span-2 text-center">{t('bulkBuyer.availableCapacity', 'Available Capacity')}</div>
                <div className="col-span-2 text-center">{t('bulkBuyer.offeredPrice', 'Offered Price')}</div>
                <div className="col-span-2 text-center">{t('bulkBuyer.distanceQuality', 'Distance & Quality')}</div>
                <div className="col-span-2 text-right">{t('bulkBuyer.allocatedQuota', 'Allocated Quota (kg)')}</div>
              </div>

              <div className="divide-y divide-[#ccd5ae]/20 text-xs">
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
                    <div key={sup.id} className="px-4 py-3.5 grid grid-cols-12 items-center hover:bg-[#eaf4ec]/30 transition gap-2">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            sup.type === 'FPO' ? 'bg-[#e9edc9] text-[#01472e] border-[#ccd5ae]' : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                          }`}>
                            {sup.type}
                          </span>
                          <span className="font-semibold text-[#01472e] truncate">{sup.name.split('(')[0]}</span>
                        </div>
                        <p className="text-[10px] text-[#01472e]/60 mt-0.5">{sup.location} • ★ {sup.rating}</p>
                      </div>

                      <div className="col-span-2 text-center font-medium text-[#01472e] font-mono">
                        {sup.availableKg.toLocaleString()} kg
                      </div>

                      <div className="col-span-2 text-center font-semibold text-[#01472e]">
                        ₹{sup.price.toFixed(2)}/kg
                      </div>

                      <div className="col-span-2 text-center text-[#01472e]/70">
                        <span className="font-medium">{sup.distanceKm} km</span> •{' '}
                        <span className="text-[#01472e] font-semibold">{sup.grade}</span>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={currentAlloc}
                          min={0}
                          max={sup.availableKg}
                          onChange={(e) => handleAllocationChange(sup.id, Number(e.target.value))}
                          className="w-24 bg-white border border-[#ccd5ae]/60 rounded-xl px-2.5 py-1.5 text-right text-xs font-semibold text-[#01472e] focus:outline-none focus:border-[#01472e]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Confirm Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#01472e]/80">
                <p>
                  {t('bulkBuyer.bulkRequirementSummary', 'Bulk Requirement: 5,000 kg Tomato | Currently Allocated: {allocated}', { allocated: `${currentTotalAllocated.toLocaleString()} kg` })}
                </p>
              </div>

              <button
                onClick={handleConfirmMultiSupplierProcurement}
                disabled={currentTotalAllocated === 0}
                className="btn-primary text-xs flex items-center gap-2 py-3 px-6 rounded-2xl shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('bulkBuyer.confirmQuotaBtn', 'Confirm Multi-Supplier Aggregation Quota')}</span>
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
          <div className="agri-card rounded-[32px] p-6 sm:p-8 border border-[#ccd5ae]/40 shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-[#01472e]/60 uppercase tracking-wider">
                {t('bulkBuyer.consignmentIdentity', 'Consignment Identity')}
              </span>
              <h4 className="text-base font-semibold text-[#01472e]">{activeShipment.crop} Bulk Batch</h4>
              <div className="text-xs text-[#01472e]/80 space-y-1">
                <p><b>{t('buyer.shipmentId', 'Shipment ID')}:</b> {activeShipment.id}</p>
                <p><b>{t('buyer.producePassport', 'Produce Passport')}:</b> {activeShipment.batchId}</p>
                <p><b>{t('bulkBuyer.totalWeight', 'Total Weight')}:</b> {activeShipment.quantityKg.toLocaleString()} kg (200 Crates)</p>
                <p><b>{t('bulkBuyer.qualityCert', 'Quality Certification')}:</b> NABL Certified Grade A</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-[#01472e]/60 uppercase tracking-wider">
                {t('bulkBuyer.coldChainTelematics', 'Cold Chain Telematics')}
              </span>
              <h4 className="text-base font-semibold text-[#01472e]">Heavy Reefer EV 5.5T</h4>
              <div className="text-xs text-[#01472e]/80 space-y-1">
                <p><b>{t('logistics.vehicleReg', 'Vehicle Reg')}:</b> TN-09-BK-9182</p>
                <p><b>{t('logistics.driverCaptain', 'Driver / Captain')}:</b> Karthik S. (+91 98410 44021)</p>
                <p><b>{t('bulkBuyer.internalReeferTemp', 'Internal Reefer Temperature')}:</b> +4.2°C Continuous</p>
                <p><b>{t('bulkBuyer.corridorSpeed', 'Corridor Speed')}:</b> 54 km/h (NH-48 Corridor)</p>
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#01472e]/60 uppercase tracking-wider">
                  {t('bulkBuyer.receivingDestination', 'Receiving Bay Destination')}
                </span>
                <h4 className="text-base font-semibold text-[#01472e]">Ambattur Processing Dock</h4>
                <p className="text-xs text-[#01472e]/70 mt-1">
                  {t('bulkBuyer.estimatedDockHandover', 'Estimated Dock Handover: Today, 06:45 AM')}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedOrderForDelivery(activeShipment)}
                  className="btn-primary text-xs flex items-center gap-1.5 w-full justify-center py-3 rounded-2xl"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t('buyer.inspectConfirm', 'Verify & Confirm Delivery')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Section 4: Consolidated Orders & Quality Audits */}
      {activePortalTab === 'ORDERS' && (
        <div className="space-y-6">
          <div className="agri-card rounded-[32px] p-6 sm:p-8 border border-[#ccd5ae]/40 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#01472e]">{t('bulkBuyer.institutionalProcurementOrders', 'Institutional Procurement Orders')}</h3>
                <p className="text-xs text-[#01472e]/70">
                  {t('bulkBuyer.ordersSubtitle', 'Track deliveries, inspect quality certificates, and verify weight receipts.')}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/50 px-3.5 py-1 rounded-xl">
                {t('bulkBuyer.recordedOrders', '{count} Recorded Orders', { count: bulkOrders.length })}
              </span>
            </div>

            <div className="divide-y divide-[#ccd5ae]/20">
              {bulkOrders.map((o) => (
                <div key={o.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-[#01472e] text-sm">{o.crop}</span>
                      <span className="text-[10px] font-mono bg-[#faf9f5] border border-[#ccd5ae]/40 text-[#01472e]/80 px-2 py-0.5 rounded font-semibold">
                        {o.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        o.status === 'In Transit' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#01472e]/80">
                      {o.quantityKg.toLocaleString()} kg • ₹{o.pricePerKg}/kg • Total ₹{o.totalValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[#01472e]/60">
                      Suppliers: {o.farmerName} • Destination: {o.deliveryLocation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPassportModal(o.batchId)}
                      className="btn-secondary text-xs flex items-center gap-1 py-2 px-3.5 rounded-xl"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                      <span>{t('common.passport', 'Passport')}</span>
                    </button>
                    {o.status === 'In Transit' && (
                      <button
                        onClick={() => setSelectedOrderForDelivery(o)}
                        className="btn-primary text-xs flex items-center gap-1 py-2 px-4 rounded-xl"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{t('bulkBuyer.acceptDelivery', 'Accept Delivery')}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-[32px] border border-[#ccd5ae]/50 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30 flex items-center justify-center font-medium">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#01472e]">{t('bulkBuyer.createDemandTitle', 'Create Bulk Procurement Demand')}</h3>
                  <p className="text-xs text-[#01472e]/70">{t('bulkBuyer.createDemandSubtitle', 'Post requirement to smallholder farmer and FPO network')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#01472e]/50 hover:text-[#01472e] p-2 rounded-xl hover:bg-[#faf9f5]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBulkDemand} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.commodity', 'Crop / Commodity')}</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="input-modern"
                  >
                    <option value="Tomato">{t('crops.Tomato', 'Tomato')}</option>
                    <option value="Onion">{t('crops.Onion', 'Onion')}</option>
                    <option value="Potato">{t('crops.Potato', 'Potato')}</option>
                    <option value="Green Chilli">{t('crops.Green Chilli', 'Green Chilli')}</option>
                    <option value="Capsicum">{t('crops.Capsicum', 'Capsicum')}</option>
                    <option value="Carrot">{t('crops.Carrot', 'Carrot')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.varietySpec', 'Variety / Specification')}</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder={t('bulkBuyer.varietyPlaceholder', 'e.g. Sivam Hybrid (Firm Processing)')}
                    required
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.requiredQty', 'Required Quantity')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={rawQuantity}
                      onChange={(e) => setRawQuantity(Number(e.target.value))}
                      min={100}
                      required
                      className="input-modern"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl px-3 text-xs font-semibold text-[#01472e]"
                    >
                      <option value="kg">{t('units.kg', 'kg')}</option>
                      <option value="Quintal">{t('units.Quintal', 'Quintal')}</option>
                      <option value="Ton">{t('units.Ton', 'Ton')}</option>
                      <option value="Crates">{t('units.Crates', 'Crates')}</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-[#01472e]/60 mt-1">{t('bulkBuyer.calculatedNet', 'Calculated: {qty} kg net', { qty: totalDemandKg.toLocaleString() })}</p>
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.qualityGrade', 'Quality Grade')}</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="input-modern"
                  >
                    <option value="Grade A">{t('bulkBuyer.gradeAOption', 'Grade A (Premium Retail & Processing)')}</option>
                    <option value="Grade B">{t('bulkBuyer.gradeBOption', 'Grade B (Standard Commercial)')}</option>
                    <option value="Standard">{t('bulkBuyer.standardAgroOption', 'Standard Agro Spec')}</option>
                    <option value="Premium">{t('bulkBuyer.exportPremiumOption', 'Export Premium Grade')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.targetMaxPrice', 'Target Max Price (₹/kg)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    min={5}
                    required
                    className="input-modern"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.requiredDeliveryDate', 'Required Delivery Date')}</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.deliveryDestinationFacility', 'Delivery Destination Facility')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('bulkBuyer.destinationPlaceholder', 'e.g. Ambattur Processing Terminal, Chennai')}
                  required
                  className="input-modern"
                />
              </div>

              <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl font-semibold transition"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-3 px-6 rounded-2xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('bulkBuyer.publishRequirement', 'Publish Bulk Requirement')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Digital Delivery Receipt & Quality Verification */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-[32px] border border-[#ccd5ae]/50 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30 flex items-center justify-center font-medium">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#01472e]">{t('bulkBuyer.goodsReceivingTitle', 'Goods Receiving & Verification')}</h3>
                  <p className="text-xs text-[#01472e]/70">{t('bulkBuyer.orderSubtitle', 'Order #{id} • {crop}', { id: selectedOrderForDelivery.id, crop: selectedOrderForDelivery.crop })}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] p-2 rounded-xl hover:bg-[#faf9f5]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeliveryReceipt} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2 p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 text-center">
                <div>
                  <span className="text-[10px] text-[#01472e]/60 block uppercase font-semibold">{t('bulkBuyer.manifestQty', 'Manifest Qty')}</span>
                  <span className="text-sm font-bold text-[#01472e]">{selectedOrderForDelivery.quantityKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#01472e]/60 block uppercase font-semibold">{t('bulkBuyer.reeferTemp', 'Reefer Temp')}</span>
                  <span className="text-sm font-bold text-[#01472e]">+4.2°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#01472e]/60 block uppercase font-semibold">{t('bulkBuyer.gradeChecked', 'Grade Checked')}</span>
                  <span className="text-sm font-bold text-[#01472e]">{t('grades.Grade A', 'Grade A')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.acceptedWeight', 'Accepted Weight (kg)')}</label>
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
                    className="input-modern font-semibold text-[#01472e]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.rejectedWeight', 'Rejected Weight (kg)')}</label>
                  <input
                    type="number"
                    value={rejectedKg}
                    readOnly
                    className="input-modern bg-[#faf9f5] cursor-not-allowed opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.deliveryHandoverStatus', 'Delivery Handover Status')}</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as any)}
                  className="input-modern"
                >
                  <option value="ACCEPTED_FULL">{t('bulkBuyer.statusAcceptedFull', 'Accepted Full Consignment (Zero Defects)')}</option>
                  <option value="ACCEPTED_PARTIAL">{t('bulkBuyer.statusAcceptedPartial', 'Accepted Partial Consignment (Minor Deduction)')}</option>
                  <option value="REJECTED">{t('bulkBuyer.statusRejected', 'Rejected Consignment')}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#01472e] block mb-1">{t('bulkBuyer.inspectionRemarks', 'Quality Inspection Remarks')}</label>
                <textarea
                  value={inspectorRemarks}
                  onChange={(e) => setInspectorRemarks(e.target.value)}
                  rows={2}
                  className="input-modern"
                />
              </div>

              <div className="p-3.5 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center gap-2.5 text-[11px] text-[#01472e]">
                <ShieldCheck className="w-4 h-4 text-[#01472e] shrink-0" />
                <span>
                  {t('bulkBuyer.escrowNotice', 'Confirming delivery immediately activates automated escrow release to the 4 smallholder farmers and FPOs.')}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl font-semibold transition"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-3 px-6 rounded-2xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('bulkBuyer.verifyAuthorizeSettlement', 'Verify Weight & Authorize Settlement')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
