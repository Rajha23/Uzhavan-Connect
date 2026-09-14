import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Package,
  Sprout,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Award,
  Layers,
  Check,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Box,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QualityInspectionData, WorkflowOrder, FarmerContribution } from '../types';

export const FpoDashboard: React.FC = () => {
  const { t } = useLanguage();
  const {
    currentUser,
    produceListings,
    orders,
    fpoRecordCollection,
    fpoCollectProduce,
    fpoRecordQualityGrading,
    fpoQualityCheck,
    fpoRecordPacking,
    fpoPackProduce,
    openPassportModal,
    setActiveTab
  } = useApp();

  const [activeTabSection, setActiveTabSection] = useState<
    'MEMBER_SUPPLY' | 'COLLECTION' | 'GRADING' | 'PACKING' | 'CONSOLIDATION' | 'ALL'
  >('COLLECTION');

  // Collection Modal & Form State
  const [collectionModalOrder, setCollectionModalOrder] = useState<WorkflowOrder | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [collectAmountKg, setCollectAmountKg] = useState<number>(500);
  const [collectionNotes, setCollectionNotes] = useState<string>('Farm gate verification complete; produce loaded');

  // Quality Inspection Form State
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<string | null>(null);
  const [sugarBrix, setSugarBrix] = useState<number>(5.0);
  const [firmness, setFirmness] = useState<number>(3.6);
  const [pesticideTest, setPesticideTest] = useState<'PASS - Organic / ND' | 'PASS - Standard Compliant'>('PASS - Organic / ND');
  const [moisture, setMoisture] = useState<string>('92.5%');
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [inspectorName, setInspectorName] = useState<string>('Dr. R. Malathi (FPO QA Officer)');
  const [hubLocation, setHubLocation] = useState<string>('Sriperumbudur Rural Hub');
  const [acceptedKg, setAcceptedKg] = useState<number>(1000);
  const [rejectedKg, setRejectedKg] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Packing Form State
  const [packingModalOrder, setPackingModalOrder] = useState<WorkflowOrder | null>(null);
  const [packQuantityKg, setPackQuantityKg] = useState<number>(1000);
  const [crateType, setCrateType] = useState<string>('Ventilated 25kg Food-Grade Agro-Crates');
  const [packNotes, setPackNotes] = useState<string>('Tamper-evident QR barcode seal attached to all crates');

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Operational Stage Filters using actual confirmed orders
  const pendingCollectionOrders = orders.filter((o) => {
    if (o.status === 'Completed' || o.status === 'Quality Checked' || o.status === 'Packed' || o.status === 'In Transit' || o.status === 'Delivered' || o.status === 'Buyer Confirmed' || o.status === 'Payment Pending') {
      return false;
    }
    const rem = o.remainingCollectionKg !== undefined ? o.remainingCollectionKg : o.quantityKg;
    return o.status === 'Produce Collection Pending' || o.status === 'Partially Collected' || o.status === 'Created' || rem > 0;
  });

  const collectedAwaitingGrading = orders.filter((o) => {
    return (
      (o.status === 'Collected' || (o.collectedQuantityKg && o.collectedQuantityKg > 0 && o.status !== 'Partially Collected')) &&
      o.status !== 'Quality Checked' &&
      o.status !== 'Quality Rejected' &&
      o.status !== 'Packed' &&
      o.status !== 'Transport Assigned' &&
      o.status !== 'In Transit' &&
      o.status !== 'Delivered' &&
      o.status !== 'Buyer Confirmed' &&
      o.status !== 'Payment Pending' &&
      o.status !== 'Completed'
    );
  });

  const gradedAwaitingPacking = orders.filter((o) => {
    return (
      (o.status === 'Quality Checked' || (o.qualityStatus === 'Passed' || o.qualityStatus === 'Conditionally Passed')) &&
      o.status !== 'Packed' &&
      o.status !== 'Transport Assigned' &&
      o.status !== 'In Transit' &&
      o.status !== 'Delivered' &&
      o.status !== 'Buyer Confirmed' &&
      o.status !== 'Payment Pending' &&
      o.status !== 'Completed' &&
      (o.acceptedQuantityKg === undefined || o.acceptedQuantityKg > 0)
    );
  });

  const packedReadyForLogistics = orders.filter((o) => o.status === 'Packed' || o.isReadyForTransport);

  const bulkConsolidatedOrders = orders.filter(
    (o) => o.quantityKg >= 1500 || Boolean(o.aggregatedGroupId) || (o.farmerContributions && o.farmerContributions.length > 1)
  );

  // Open Collection Modal for an Order
  const handleOpenCollectionModal = (order: WorkflowOrder) => {
    setCollectionModalOrder(order);
    const contributions = order.farmerContributions || [];
    const pendingContrib = contributions.find((c) => c.collectionStatus !== 'FULLY_COLLECTED') || contributions[0];
    const farmerId = pendingContrib ? pendingContrib.farmerId : order.farmerId;
    setSelectedFarmerId(farmerId);
    const maxRem = pendingContrib ? Math.max(0, pendingContrib.contributedQuantityKg - (pendingContrib.collectedQuantityKg || 0)) : (order.remainingCollectionKg || order.quantityKg);
    setCollectAmountKg(maxRem);
  };

  // Submit Collection
  const handleRecordCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionModalOrder) return;

    const res = fpoRecordCollection(collectionModalOrder.id, selectedFarmerId, Number(collectAmountKg), collectionNotes);
    if (res) {
      setActionSuccessMessage(
        `Successfully recorded collection of ${Number(collectAmountKg).toLocaleString()} kg for Order ${collectionModalOrder.id}!`
      );
      confetti({ particleCount: 35, origin: { y: 0.6 } });
      setCollectionModalOrder(null);
      setTimeout(() => setActionSuccessMessage(null), 4500);
    }
  };

  // Open Inspection
  const handleStartInspection = (order: WorkflowOrder) => {
    setSelectedOrderForInspection(order.id);
    const totalCollected = order.collectedQuantityKg || order.quantityKg;
    setAcceptedKg(totalCollected);
    setRejectedKg(0);
    setRejectionReason('');
  };

  // Save Inspection
  const handleSaveInspection = (orderId: string) => {
    const totalCollected = orders.find((o) => o.id === orderId)?.collectedQuantityKg || 1000;
    const validatedAccepted = Math.min(totalCollected, Math.max(0, Number(acceptedKg)));
    const validatedRejected = Math.max(0, totalCollected - validatedAccepted);

    const metrics: QualityInspectionData = {
      sugarBrix: Number(sugarBrix),
      firmnessKgCm: Number(firmness),
      pesticideResidueTest: pesticideTest,
      moistureContent: moisture,
      verifiedGrade: grade,
      inspectorName,
      inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hubLocation,
      status: validatedAccepted <= 0 ? 'REJECTED' : (validatedRejected > 0 ? 'CONDITIONALLY_PASSED' : 'PASSED'),
      acceptedQuantityKg: validatedAccepted,
      rejectedQuantityKg: validatedRejected,
      rejectionReason: validatedRejected > 0 ? rejectionReason || 'Surface blemishes and sizing variation' : undefined,
      inspectionNotes: `Inspected at ${hubLocation} by ${inspectorName}. Brix: ${sugarBrix}, Firmness: ${firmness} kg/cm²`
    };

    fpoRecordQualityGrading(orderId, metrics);
    setSelectedOrderForInspection(null);
    setActionSuccessMessage(
      `Quality check complete for Order ${orderId}: ${validatedAccepted.toLocaleString()} kg ACCEPTED (${grade}), ${validatedRejected.toLocaleString()} kg rejected.`
    );
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  // Open Packing Modal
  const handleOpenPackingModal = (order: WorkflowOrder) => {
    setPackingModalOrder(order);
    const packable = order.acceptedQuantityKg !== undefined ? order.acceptedQuantityKg : (order.collectedQuantityKg || order.quantityKg);
    setPackQuantityKg(packable);
  };

  // Submit Packing
  const handleRecordPackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packingModalOrder) return;

    const crates = Math.ceil(packQuantityKg / 25);
    fpoRecordPacking(packingModalOrder.id, {
      packedQuantityKg: Number(packQuantityKg),
      packageType: crateType,
      crateCount: crates,
      notes: `${packNotes} (${crates} crates @ 25kg/crate)`
    });

    setPackingModalOrder(null);
    setActionSuccessMessage(
      `Order ${packingModalOrder.id} crated into ${crates} units with QR Passport seal! Order is now READY FOR TRANSPORT.`
    );
    confetti({ particleCount: 50, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-emerald-500/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccd5ae]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#ccd5ae] text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>{t('fpo.hubFacility', 'FPO Aggregator & Micro-Hub Facility')}</span>
            <span className="bg-[#e9edc9]/20 text-[#fefae0] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#e9edc9]/30">
              {t('fpo.liveHubNode', 'Live Hub Node')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {currentUser.organization || 'GreenHarvest FPO Hub'}
          </h1>
          <p className="text-sm text-white/80 mt-2 font-normal">
            {t('fpo.hubSubtitle', 'Aggregator Operations: Farm Gate Collection, Multi-Farmer Traceability, Quality Grading, Crating & Transport Readiness.')}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2 bg-[#e9edc9] hover:bg-[#fefae0] text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-sm transition tracking-wide cursor-pointer"
          >
            <span>{t('fpo.allOrdersCount', 'All Orders ({count})', { count: orders.length })}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-[#01472e] text-white flex items-center justify-center font-medium text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-semibold text-[#01472e]">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Operational Stage Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {[
          { labelKey: 'fpo.kpi.memberSupply', defaultLabel: 'Member Supply', count: produceListings.length, descKey: 'fpo.kpi.activeFarmSupply', defaultDesc: 'Active Farm Supply', stage: 'MEMBER_SUPPLY' as const, icon: Sprout, color: 'text-[#01472e]' },
          { labelKey: 'fpo.kpi.collectionQueue', defaultLabel: 'Collection Queue', count: pendingCollectionOrders.length, descKey: 'fpo.kpi.awaitingPickup', defaultDesc: 'Awaiting Farm Pickup', stage: 'COLLECTION' as const, icon: Package, color: 'text-amber-800' },
          { labelKey: 'fpo.kpi.awaitingQA', defaultLabel: 'Awaiting QA', count: collectedAwaitingGrading.length, descKey: 'fpo.kpi.atMicroHub', defaultDesc: 'At Micro-Hub Station', stage: 'GRADING' as const, icon: ShieldCheck, color: 'text-[#01472e]' },
          { labelKey: 'fpo.kpi.awaitingPacking', defaultLabel: 'Awaiting Packing', count: gradedAwaitingPacking.length, descKey: 'fpo.kpi.readyForCrates', defaultDesc: 'Ready for Crates & QR', stage: 'PACKING' as const, icon: Box, color: 'text-[#01472e]' },
          { labelKey: 'fpo.kpi.bulkPools', defaultLabel: 'Bulk Pools', count: bulkConsolidatedOrders.length, descKey: 'fpo.kpi.multiFarmerBatches', defaultDesc: 'Multi-Farmer Batches', stage: 'CONSOLIDATION' as const, icon: Layers, color: 'text-[#01472e]' },
          { labelKey: 'fpo.kpi.dispatchReady', defaultLabel: 'Dispatch Ready', count: packedReadyForLogistics.length, descKey: 'fpo.kpi.transportReadyGate', defaultDesc: 'Transport Ready Gate', stage: 'ALL' as const, icon: Truck, color: 'text-[#01472e]' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.labelKey}
              onClick={() => setActiveTabSection(item.stage)}
              className={`agri-card p-4.5 rounded-[24px] border text-left transition shadow-soft cursor-pointer ${
                activeTabSection === item.stage
                  ? 'bg-[#eaf4ec] border-[#01472e] ring-2 ring-[#01472e]/20 shadow-forest/10'
                  : 'border-[#ccd5ae]/40 hover:border-[#a3b18a]/60 hover:shadow-forest/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-[#01472e]/60 font-semibold uppercase tracking-wider truncate">{t(item.labelKey, item.defaultLabel)}</p>
                <Icon className="w-3.5 h-3.5 text-[#01472e]/60" />
              </div>
              <p className={`text-2xl font-semibold font-mono mt-0.5 ${item.color}`}>{item.count}</p>
              <p className="text-[10px] text-[#01472e]/60 mt-0.5 truncate">{t(item.descKey, item.defaultDesc)}</p>
            </button>
          );
        })}
      </div>

      {/* Stage Tabs Navigation */}
      <div className="flex gap-2.5 border-b border-[#ccd5ae]/30 pb-3.5 overflow-x-auto">
        {[
          { key: 'MEMBER_SUPPLY', label: t('fpo.tab.memberSupply', 'Member Supply ({count})', { count: produceListings.length }), icon: Sprout },
          { key: 'COLLECTION', label: t('fpo.tab.collection', '1. Farm Gate Collection ({count})', { count: pendingCollectionOrders.length }), icon: Package },
          { key: 'GRADING', label: t('fpo.tab.grading', '2. Quality Check & Grading ({count})', { count: collectedAwaitingGrading.length }), icon: ShieldCheck },
          { key: 'PACKING', label: t('fpo.tab.packing', '3. Packing & Batch QR ({count})', { count: gradedAwaitingPacking.length }), icon: QrCode },
          { key: 'CONSOLIDATION', label: t('fpo.tab.consolidation', '4. Bulk Consolidation ({count})', { count: bulkConsolidatedOrders.length }), icon: Layers },
          { key: 'ALL', label: t('fpo.tab.all', '5. All Collective Orders ({count})', { count: orders.length }), icon: ClipboardList }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTabSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTabSection(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-2xl transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#01472e] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-[#eaf4ec] text-[#01472e]/70 border border-[#ccd5ae]/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#fefae0]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── STAGE 0: MEMBER FARM SUPPLY POOL ───────────────────────────────── */}
      {activeTabSection === 'MEMBER_SUPPLY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#01472e]" />
                <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.supplyPoolTitle', 'Member Farm Produce Supply Pool')}</h3>
              </div>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                {t('fpo.supplyPoolSubtitle', 'Active crop listings submitted by member farmers. Aggregated and available for Smart Matching with institutional buyers.')}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
                {t('fpo.activeListingsCount', '{count} Active Listings', { count: produceListings.length })}
              </span>
              <button
                onClick={() => setActiveTab('smart-matching')}
                className="btn-primary text-xs py-2.5 px-4 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ccd5ae]" />
                <span>{t('fpo.openSmartMatching', 'Open Smart Matching Engine')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produceListings.map((listing) => {
              const totalListed = listing.initialQuantityKg || (listing.quantityKg + (listing.allocatedQuantityKg || 0));
              const remaining = listing.quantityKg;
              const allocated = listing.allocatedQuantityKg || 0;
              const percentAllocated = totalListed > 0 ? Math.round((allocated / totalListed) * 100) : 0;

              return (
                <div key={listing.id} className="p-5 border border-[#ccd5ae]/40 hover:border-[#a3b18a] bg-[#faf9f5] rounded-2xl space-y-3 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#01472e]/70">{listing.id}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        remaining <= 0
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                      }`}>
                        {remaining <= 0 ? t('fpo.fullyAllocated', 'Fully Allocated') : (t(`listingStatus.${listing.status}`, listing.status))}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#01472e] text-sm">
                        {t(`crops.${listing.crop}`, listing.crop)}
                        {listing.variety && <span className="text-[#01472e]/60 font-normal ml-1">({listing.variety})</span>}
                      </h4>
                      <p className="text-xs text-[#01472e]/70 mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>{t('fpo.farmerLabel', 'Farmer:')} <strong className="text-[#01472e]">{listing.farmerName}</strong></span>
                      </p>
                      <p className="text-xs text-[#01472e]/70 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>{listing.location}</span>
                      </p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-[#ccd5ae]/30 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#01472e]/70 font-medium">{t('fpo.availableSupply', 'Available Supply:')}</span>
                        <span className="font-semibold text-[#01472e] font-mono">
                          {remaining.toLocaleString()} {listing.unit ? t(`units.${listing.unit}`, listing.unit) : t('units.kg', 'kg')}
                        </span>
                      </div>
                      <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, 100 - percentAllocated)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#01472e]/60 font-mono">
                        <span>{t('fpo.totalWithUnit', 'Total: {total} {unit}', { total: totalListed.toLocaleString(), unit: listing.unit ? t(`units.${listing.unit}`, listing.unit) : t('units.kg', 'kg') })}</span>
                        <span>{t('fpo.allocatedWithPercent', 'Allocated: {allocated} ({percent}%)', { allocated: allocated.toLocaleString(), percent: percentAllocated })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#01472e] font-mono">
                      ₹{listing.expectedPricePerKg}/kg • {t(`grades.${listing.grade}`, listing.grade)}
                    </span>
                    <button
                      onClick={() => setActiveTab('smart-matching')}
                      className="px-3 py-1.5 bg-[#e9edc9]/60 hover:bg-[#e9edc9] text-[#01472e] text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#01472e]" />
                      <span>{t('fpo.matchBtn', 'Match')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 1: PRODUCE COLLECTION WITH MULTI-FARMER TRACEABILITY ─────── */}
      {activeTabSection === 'COLLECTION' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.collectionQueueTitle', 'Farm Gate Produce Collection Queue')}</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                {t('fpo.collectionQueueSubtitle', 'Collect harvested produce from member farms. Multi-farmer contributions and partial pickups are tracked without losing source provenance.')}
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              {t('fpo.awaitingPickupCount', '{count} Orders Awaiting Pickup', { count: pendingCollectionOrders.length })}
            </span>
          </div>

          {pendingCollectionOrders.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">{t('fpo.allProduceCollected', 'All member farm produce collected!')}</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">{t('fpo.newOrdersEnterQueue', 'New confirmed orders matched via Smart Matching will enter this queue.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pendingCollectionOrders.map((order) => {
                const requiredKg = order.quantityKg;
                const collectedKg = order.collectedQuantityKg || 0;
                const remainingKg = order.remainingCollectionKg !== undefined ? order.remainingCollectionKg : (requiredKg - collectedKg);
                const percentCollected = requiredKg > 0 ? Math.round((collectedKg / requiredKg) * 100) : 0;
                const contributions = order.farmerContributions || [
                  {
                    farmerId: order.farmerId,
                    farmerName: order.farmerName,
                    farmerLocation: order.farmerLocation,
                    produceListingId: order.produceListingId,
                    contributedQuantityKg: order.quantityKg,
                    collectedQuantityKg: collectedKg,
                    collectionStatus: percentCollected >= 100 ? 'FULLY_COLLECTED' : (percentCollected > 0 ? 'PARTIALLY_COLLECTED' : 'PENDING')
                  }
                ];

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                        <span className="text-[#ccd5ae]">•</span>
                        <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">{order.batchId}</span>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        order.status === 'Partially Collected'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                      }`}>
                        {order.status === 'Partially Collected' ? t('fpo.partiallyCollected', 'Partially Collected') : t('fpo.collectionPending', 'Collection Pending')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#01472e] text-sm">{t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'})</h4>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        {t('fpo.buyerLabel', 'Buyer:')} <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    {/* Collection Progress Bar */}
                    <div className="bg-white/80 p-3.5 rounded-xl border border-[#ccd5ae]/30 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#01472e]/70 font-medium">{t('fpo.collectionProgress', 'Collection Progress:')}</span>
                        <span className="font-semibold text-[#01472e] font-mono">
                          {collectedKg.toLocaleString()} / {requiredKg.toLocaleString()} kg ({percentCollected}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#e9edc9]/50 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentCollected}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-[#01472e]/70 font-mono pt-0.5">
                        <span className="text-[#01472e] font-semibold">{t('fpo.collectedKg', 'Collected: {collected} kg', { collected: collectedKg.toLocaleString() })}</span>
                        <span className="text-amber-800 font-medium">{t('fpo.remainingKg', 'Remaining: {remaining} kg', { remaining: remainingKg.toLocaleString() })}</span>
                      </div>
                    </div>

                    {/* Multi-Farmer Traceability Breakdown */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#01472e]/70 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                        <span>{t('fpo.contributingFarmersCount', 'Contributing Farmer Sources ({count})', { count: contributions.length })}</span>
                      </p>

                      <div className="space-y-1.5">
                        {contributions.map((c, idx) => {
                          const farmerRemaining = Math.max(0, c.contributedQuantityKg - (c.collectedQuantityKg || 0));
                          return (
                            <div
                              key={c.farmerId || idx}
                              className="p-3 bg-white border border-[#ccd5ae]/30 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-semibold text-[#01472e]">{c.farmerName}</p>
                                <p className="text-[11px] text-[#01472e]/60 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#a3b18a]" />
                                  <span>{c.farmerLocation}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-semibold text-[#01472e] block">
                                  {c.collectedQuantityKg || 0} / {c.contributedQuantityKg} kg
                                </span>
                                <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                                  c.collectionStatus === 'FULLY_COLLECTED'
                                    ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                                    : (c.collectionStatus === 'PARTIALLY_COLLECTED' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#faf9f5] text-[#01472e]/70 border-[#ccd5ae]/40')
                                }`}>
                                  {c.collectionStatus === 'FULLY_COLLECTED' ? t('common.collected', 'Collected') : `${farmerRemaining} kg open`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                      <span className="text-[11px] text-[#01472e]/70 font-mono">
                        {t('fpo.targetValue', 'Target Value:')} ₹{order.totalValue.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleOpenCollectionModal(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('fpo.recordCollectionBtn', 'Record Produce Collection')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 2: QUALITY CHECK & GRADING WITH ACCEPTED/REJECTED TRACKING ─ */}
      {activeTabSection === 'GRADING' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.gradingStationTitle', 'Hub Quality Inspection & Grading Station')}</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                {t('fpo.gradingStationSubtitle', 'Perform laboratory checks (Sugar Brix, firmness, moisture, pesticide assay) and record accepted vs rejected volumes.')}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {t('fpo.batchesReadyQACount', '{count} Batches Ready for QA', { count: collectedAwaitingGrading.length })}
            </span>
          </div>

          {collectedAwaitingGrading.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <ShieldCheck className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">{t('fpo.noBatchesAwaitingQA', 'No batches currently awaiting quality check')}</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">{t('fpo.collectFromStage1Notice', 'Collect produce from Stage 1 to queue batches for quality inspection.')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collectedAwaitingGrading.map((order) => {
                const isInspecting = selectedOrderForInspection === order.id;
                const totalCollected = order.collectedQuantityKg || order.quantityKg;

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                          <span className="text-[#ccd5ae]">•</span>
                          <span className="font-mono text-xs text-[#01472e]/70 font-semibold">{order.batchId}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                            {t('fpo.collectedWithQty', 'Collected ({qty} kg)', { qty: totalCollected.toLocaleString() })}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#01472e] mt-1">
                          {t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'}) — {totalCollected.toLocaleString()} kg from {order.farmerName}
                        </h4>
                      </div>

                      <button
                        onClick={() => isInspecting ? setSelectedOrderForInspection(null) : handleStartInspection(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
                      >
                        {isInspecting ? t('fpo.cancelQAForm', 'Cancel QA Form') : t('fpo.openInspectionForm', 'Open Inspection Form →')}
                      </button>
                    </div>

                    {/* Interactive Quality Form */}
                    {isInspecting && (
                      <div className="p-6 bg-white border border-[#ccd5ae]/50 rounded-2xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-[#ccd5ae]/30">
                          <h5 className="font-semibold text-[#01472e] text-xs uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#01472e]" />
                            <span>{t('fpo.qaCertBatchTitle', 'Quality Certification & Acceptance Entry — Batch: {batchId}', { batchId: order.batchId })}</span>
                          </h5>
                          <span className="text-xs font-mono font-semibold text-[#01472e]">{t('fpo.totalCollectedKg', 'Total Collected: {total} kg', { total: totalCollected })}</span>
                        </div>

                        {/* Acceptance & Rejection Breakdown */}
                        <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-[#01472e] font-semibold mb-1">
                              {t('fpo.acceptedQty', 'Accepted Quantity (kg)')} <span className="text-[#01472e]/70 font-mono">{t('fpo.movesToPacking', '(Moves to Packing)')}</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={totalCollected}
                              value={acceptedKg}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setAcceptedKg(val);
                                setRejectedKg(Math.max(0, totalCollected - val));
                              }}
                              className="input-modern font-mono font-semibold text-[#01472e]"
                            />
                          </div>

                          <div>
                            <label className="block text-rose-800 font-semibold mb-1">
                              {t('fpo.rejectedQty', 'Rejected Quantity (kg)')} <span className="text-rose-600 font-mono">{t('fpo.defectsShortage', '(Defects/Shortage)')}</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={totalCollected}
                              value={rejectedKg}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setRejectedKg(val);
                                setAcceptedKg(Math.max(0, totalCollected - val));
                              }}
                              className="input-modern font-mono font-semibold text-rose-800 border-rose-300 focus:border-rose-500"
                            />
                          </div>

                          {rejectedKg > 0 && (
                            <div className="sm:col-span-2">
                              <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.rejectionReasonLabel', 'Rejection Reason / Defect Notes')}</label>
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Surface bruising 4%, moisture deficit, pest blemish"
                                className="input-modern"
                              />
                            </div>
                          )}
                        </div>

                        {/* Lab Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.sugarBrix', 'Sugar Content (°Brix)')}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={sugarBrix}
                              onChange={(e) => setSugarBrix(Number(e.target.value))}
                              className="input-modern font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.firmness', 'Firmness (kg/cm²)')}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={firmness}
                              onChange={(e) => setFirmness(Number(e.target.value))}
                              className="input-modern font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.moistureContent', 'Moisture Content')}</label>
                            <input
                              type="text"
                              value={moisture}
                              onChange={(e) => setMoisture(e.target.value)}
                              className="input-modern font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.pesticideTest', 'Pesticide Residue Test')}</label>
                            <select
                              value={pesticideTest}
                              onChange={(e) => setPesticideTest(e.target.value as any)}
                              className="input-modern"
                            >
                              <option value="PASS - Organic / ND">PASS - Organic / ND (Non-Detectable)</option>
                              <option value="PASS - Standard Compliant">PASS - Standard Compliant</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.certifiedGrade', 'Certified Grade')}</label>
                            <select
                              value={grade}
                              onChange={(e) => setGrade(e.target.value as any)}
                              className="input-modern"
                            >
                              <option value="Grade A">Grade A (Premium Export Quality)</option>
                              <option value="Grade B">Grade B (Retail High Grade)</option>
                              <option value="Standard">Standard Commercial</option>
                              <option value="Premium">Premium Spec</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[#01472e]/80 font-semibold mb-1">{t('fpo.qaAssessorName', 'QA Assessor Name')}</label>
                            <input
                              type="text"
                              value={inspectorName}
                              onChange={(e) => setInspectorName(e.target.value)}
                              className="input-modern"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                          <button
                            onClick={() => setSelectedOrderForInspection(null)}
                            className="px-4 py-2 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            {t('common.cancel', 'Cancel')}
                          </button>
                          <button
                            onClick={() => handleSaveInspection(order.id)}
                            className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t('fpo.certifyQualityBtn', 'Certify Quality & Record Accepted Volume')}</span>
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

      {/* ── STAGE 3: PACKAGING, CRATING & TRANSPORT GATE ───────────────────── */}
      {activeTabSection === 'PACKING' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.packingTitle', 'Packaging, Crating & QR Sealing')}</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                {t('fpo.packingSubtitle', 'Pack quality-accepted produce into standardized agro-crates, assign batch tamper seal, and unlock Transport Readiness.')}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {t('fpo.batchesReadyCratingCount', '{count} Batches Ready for Crating', { count: gradedAwaitingPacking.length })}
            </span>
          </div>

          {gradedAwaitingPacking.length === 0 ? (
            <div className="py-12 text-center text-[#01472e]/40">
              <Package className="w-10 h-10 mx-auto text-[#01472e] mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#01472e]">{t('fpo.noBatchesAwaitingPacking', 'No batches currently awaiting packing')}</p>
              <p className="text-xs text-[#01472e]/60 mt-0.5">{t('fpo.completeStage2Notice', 'Complete Quality Grading in Stage 2 to advance batches here.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradedAwaitingPacking.map((order) => {
                const acceptedVolume = order.acceptedQuantityKg !== undefined ? order.acceptedQuantityKg : (order.collectedQuantityKg || order.quantityKg);
                const estimatedCrates = Math.ceil(acceptedVolume / 25);

                return (
                  <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                        {order.qualityGrade} • {order.qualityStatus || 'Passed'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#01472e] text-sm">{t(`crops.${order.crop}`, order.crop)} ({order.variety || 'Hybrid'})</h4>
                      <p className="text-xs text-[#01472e]/80 mt-1">
                        {t('fpo.acceptedVolumeLabel', 'Accepted Volume:')} <strong className="font-mono text-[#01472e]">{acceptedVolume.toLocaleString()} kg</strong> (~{estimatedCrates} crates)
                      </p>
                      <p className="text-xs text-[#01472e]/70 mt-0.5">
                        {t('fpo.destinationLabel', 'Destination:')} <strong className="text-[#01472e]">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-[#01472e] hover:text-[#025a3b] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                        <span>{t('fpo.previewPassport', 'Preview Passport')}</span>
                      </button>

                      <button
                        onClick={() => handleOpenPackingModal(order)}
                        className="btn-primary text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{t('fpo.packUnlockTransport', 'Pack & Unlock Transport →')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 4: BULK CONSOLIDATION & PROVENANCE ─────────────────────────── */}
      {activeTabSection === 'CONSOLIDATION' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.consolidationTitle', 'Bulk Order Consolidation & Provenance Hub')}</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">
                {t('fpo.consolidationSubtitle', 'Consolidated institutional volume orders maintaining 100% individual farmer source and buyer demand links.')}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#eaf4ec] px-3.5 py-1 rounded-full border border-[#a3b18a]/40">
              {t('fpo.consolidatedBatchesCount', '{count} Consolidated Batches', { count: bulkConsolidatedOrders.length })}
            </span>
          </div>

          <div className="space-y-4">
            {bulkConsolidatedOrders.map((order) => {
              const requiredKg = order.quantityKg;
              const collectedKg = order.collectedQuantityKg || 0;
              const remainingKg = order.remainingCollectionKg !== undefined ? order.remainingCollectionKg : (requiredKg - collectedKg);
              const contributions = order.farmerContributions || [
                {
                  farmerId: order.farmerId,
                  farmerName: order.farmerName,
                  farmerLocation: order.farmerLocation,
                  produceListingId: order.produceListingId,
                  contributedQuantityKg: order.quantityKg,
                  collectedQuantityKg: collectedKg,
                  collectionStatus: 'FULLY_COLLECTED'
                }
              ];

              return (
                <div key={order.id} className="p-5 border border-[#ccd5ae]/40 bg-[#faf9f5] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[#ccd5ae]">•</span>
                      <span className="font-mono text-xs text-[#01472e]/70 font-semibold">{order.batchId}</span>
                      {order.aggregatedGroupId && (
                        <span className="text-[10px] font-semibold bg-[#e9edc9] text-[#01472e] border border-[#ccd5ae] px-2.5 py-0.5 rounded-full">
                          {t('fpo.pooledBatch', 'Pooled: {id}', { id: order.aggregatedGroupId })}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[#ccd5ae]/50 bg-white text-[#01472e]">
                      {t('common.status', 'Status:')} {t(`orderStatus.${order.status}`, order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#ccd5ae]/30 text-xs">
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">{t('fpo.totalBuyerQty', 'Total Buyer Quantity')}</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">{requiredKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">{t('fpo.totalCollected', 'Total Collected')}</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">{collectedKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">{t('fpo.remainingCollection', 'Remaining Collection')}</span>
                      <strong className="text-sm font-semibold font-mono text-amber-800">{remainingKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-[#01472e]/60 block font-semibold uppercase text-[10px]">{t('fpo.transactionValue', 'Transaction Value')}</span>
                      <strong className="text-sm font-semibold font-mono text-[#01472e]">₹{order.totalValue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Farmer Provenance Trail */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#a3b18a]" />
                      <span>{t('fpo.farmerProvenanceTitle', 'Farmer Provenance & Source Allotments ({count} Producers)', { count: contributions.length })}</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {contributions.map((c, i) => (
                        <div key={i} className="p-3.5 bg-white border border-[#ccd5ae]/30 rounded-xl space-y-1">
                          <div className="flex justify-between font-semibold text-[#01472e]">
                            <span>{c.farmerName}</span>
                            <span className="font-mono text-[#01472e]">{c.contributedQuantityKg.toLocaleString()} kg</span>
                          </div>
                          <p className="text-[11px] text-[#01472e]/70 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#a3b18a]" />
                            <span>{c.farmerLocation}</span>
                          </p>
                          <div className="flex justify-between text-[10px] text-[#01472e]/60 pt-1.5 border-t border-[#ccd5ae]/20">
                            <span>{t('fpo.listingLabel', 'Listing:')} <strong className="font-mono">{c.produceListingId}</strong></span>
                            <span className="text-[#01472e] font-semibold">{t('fpo.collectedKg', 'Collected: {collected} kg', { collected: (c.collectedQuantityKg || 0).toLocaleString() })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#ccd5ae]/30 flex items-center justify-between text-xs">
                    <span className="text-[#01472e]/70">
                      {t('fpo.buyerLabel', 'Buyer:')} <strong className="text-[#01472e]">{order.buyerName}</strong> {t('fpo.demandLabel', '(Demand: {demand})', { demand: order.demandRequestId })}
                    </span>
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-[#01472e] hover:text-[#025a3b] font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('fpo.viewProvenancePassport', 'View Provenance Passport')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 5: ALL FPO BATCHES & PREPARATION STATUS ─────────────────────── */}
      {activeTabSection === 'ALL' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#01472e] tracking-tight">{t('fpo.allCollectiveBatches', 'All Collective FPO Batches')}</h3>
              <p className="text-xs text-[#01472e]/70 mt-0.5">{t('fpo.allBatchesSubtitle', 'Comprehensive lifecycle status across collection, quality, crating and transport')}</p>
            </div>
            <span className="text-xs font-semibold text-[#01472e] bg-[#e9edc9]/50 border border-[#ccd5ae]/50 px-3.5 py-1 rounded-xl">
              {t('fpo.totalBatchesCount', '{count} Total Batches', { count: orders.length })}
            </span>
          </div>

          <div className="divide-y divide-[#ccd5ae]/20">
            {orders.map((order) => (
              <div key={order.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/30 flex items-center justify-center font-medium text-xs shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#01472e]">{order.id}</span>
                      <span className="text-[#ccd5ae]">•</span>
                      <span className="font-mono text-xs text-[#01472e]/70">{order.batchId}</span>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/40 bg-[#faf9f5] text-[#01472e]">
                        {t(`orderStatus.${order.status}`, order.status)}
                      </span>
                      {order.isReadyForTransport && (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40">
                          {t('fpo.readyForTransport', 'Ready for Transport')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#01472e] mt-1">
                      {t(`crops.${order.crop}`, order.crop)} — {order.quantityKg.toLocaleString()} kg @ ₹{order.pricePerKg}/kg ({t('common.total', 'Total')}: ₹{order.totalValue.toLocaleString()})
                    </p>
                    <p className="text-[11px] text-[#01472e]/70">
                      {t('fpo.farmerLabel', 'Farmer:')} {order.farmerName} ➔ {t('fpo.buyerLabel', 'Buyer:')} {order.buyerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openPassportModal(order.batchId)}
                    className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                    <span>{t('fpo.passportBtn', 'Passport')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    {t('fpo.orderDetailsBtn', 'Order Details')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PRODUCE COLLECTION ─────────────────────────────────── */}
      {collectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eaf4ec] rounded-xl text-[#01472e]">
                  <Check className="w-5 h-5 text-[#01472e]" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  {t('fpo.recordCollectionModalTitle', 'Record Farm Gate Collection')}
                </h4>
              </div>
              <button
                onClick={() => setCollectionModalOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordCollectionSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-1">
                <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">{t('orders.order', 'Order')}: {collectionModalOrder.id}</span>
                <p className="font-semibold text-[#01472e] text-sm">{t(`crops.${collectionModalOrder.crop}`, collectionModalOrder.crop)} ({collectionModalOrder.variety || 'Hybrid'})</p>
                <div className="flex justify-between text-[#01472e]/70 pt-1">
                  <span>{t('fpo.totalRequired', 'Total Required:')} <strong>{collectionModalOrder.quantityKg.toLocaleString()} kg</strong></span>
                  <span>{t('fpo.collected', 'Collected:')} <strong className="text-[#01472e] font-semibold">{collectionModalOrder.collectedQuantityKg || 0} kg</strong></span>
                </div>
              </div>

              {/* Select Contributing Farmer */}
              <div>
                <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.selectProducerFarmGate', 'Select Producer Farm Gate')}</label>
                <select
                  value={selectedFarmerId}
                  onChange={(e) => {
                    const fId = e.target.value;
                    setSelectedFarmerId(fId);
                    const contrib = (collectionModalOrder.farmerContributions || []).find((c) => c.farmerId === fId);
                    if (contrib) {
                      setCollectAmountKg(Math.max(0, contrib.contributedQuantityKg - (contrib.collectedQuantityKg || 0)));
                    }
                  }}
                  className="input-modern"
                >
                  {(collectionModalOrder.farmerContributions || [
                    {
                      farmerId: collectionModalOrder.farmerId,
                      farmerName: collectionModalOrder.farmerName,
                      farmerLocation: collectionModalOrder.farmerLocation,
                      contributedQuantityKg: collectionModalOrder.quantityKg,
                      collectedQuantityKg: collectionModalOrder.collectedQuantityKg || 0,
                      produceListingId: collectionModalOrder.produceListingId,
                      collectionStatus: 'PENDING'
                    }
                  ]).map((c) => (
                    <option key={c.farmerId} value={c.farmerId}>
                      {c.farmerName} — {t('fpo.farmerRemainingSummary', '{remaining} kg remaining of {total} kg', { remaining: c.contributedQuantityKg - (c.collectedQuantityKg || 0), total: c.contributedQuantityKg })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Quantity Input */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[#01472e] font-semibold">{t('fpo.qtyToCollect', 'Quantity to Collect (kg)')}</label>
                  <span className="text-[#01472e]/50">{t('fpo.maxOpenBalance', 'Max open balance')}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={collectionModalOrder.remainingCollectionKg || collectionModalOrder.quantityKg}
                  value={collectAmountKg}
                  onChange={(e) => setCollectAmountKg(Number(e.target.value))}
                  className="input-modern font-mono font-semibold"
                  required
                />
              </div>

              {/* Collection Notes */}
              <div>
                <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.fieldLogisticsNotes', 'Field Logistics Notes')}</label>
                <input
                  type="text"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setCollectionModalOrder(null)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl text-xs font-semibold transition cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('fpo.confirmPickupBtn', 'Confirm Farm Gate Pickup')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PACKING & CRATING ─────────────────────────────────────────── */}
      {packingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full space-y-5 border border-[#ccd5ae]/50 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#ccd5ae]/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eaf4ec] rounded-xl text-[#01472e]">
                  <Package className="w-5 h-5 text-[#01472e]" />
                </div>
                <h4 className="font-semibold text-[#01472e] text-base tracking-tight">
                  {t('fpo.cratingModalTitle', 'Crating, Batch QR & Transport Readiness')}
                </h4>
              </div>
              <button
                onClick={() => setPackingModalOrder(null)}
                className="text-[#01472e]/50 hover:text-[#01472e] font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPackingSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-1">
                <span className="font-mono text-[11px] text-[#01472e]/70 font-semibold">{t('orders.order', 'Order')}: {packingModalOrder.id} • Batch: {packingModalOrder.batchId}</span>
                <p className="font-semibold text-[#01472e] text-sm">{t(`crops.${packingModalOrder.crop}`, packingModalOrder.crop)} ({packingModalOrder.variety || 'Hybrid'})</p>
                <div className="flex justify-between text-[#01472e]/70 pt-1">
                  <span>{t('fpo.qualityGradeLabel', 'Quality Grade:')} <strong className="text-[#01472e]">{packingModalOrder.qualityGrade}</strong></span>
                  <span>{t('fpo.acceptedQuantityLabel', 'Accepted Quantity:')} <strong className="text-[#01472e] font-mono">{packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg} kg</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.packedQty', 'Packed Quantity (kg)')}</label>
                <input
                  type="number"
                  min="1"
                  max={packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg}
                  value={packQuantityKg}
                  onChange={(e) => setPackQuantityKg(Number(e.target.value))}
                  className="input-modern font-mono font-semibold"
                  required
                />
                <p className="text-[11px] text-[#01472e]/60 mt-1 font-mono">
                  {t('fpo.equivalentCrates', 'Equivalent to ~{crates} crates (standard 25 kg unit payload)', { crates: Math.ceil(packQuantityKg / 25) })}
                </p>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.packagingSpec', 'Packaging Specification')}</label>
                <select
                  value={crateType}
                  onChange={(e) => setCrateType(e.target.value)}
                  className="input-modern"
                >
                  <option value="Ventilated 25kg Food-Grade Agro-Crates">{t('fpo.crateVentilated', 'Ventilated 25kg Food-Grade Agro-Crates')}</option>
                  <option value="Corrugated High-Strength Export Cartons">{t('fpo.crateCorrugated', 'Corrugated High-Strength Export Cartons (20kg)')}</option>
                  <option value="Perforated Pre-Cooling Bins">{t('fpo.cratePerforated', 'Perforated Pre-Cooling Bins (50kg)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[#01472e] font-semibold mb-1">{t('fpo.tamperProofNote', 'Tamper-Proof Batch Barcode Note')}</label>
                <input
                  type="text"
                  value={packNotes}
                  onChange={(e) => setPackNotes(e.target.value)}
                  className="input-modern"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ccd5ae]/30">
                <button
                  type="button"
                  onClick={() => setPackingModalOrder(null)}
                  className="px-5 py-2.5 text-[#01472e]/70 hover:bg-[#faf9f5] rounded-2xl text-xs font-semibold transition cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>{t('fpo.crateAndSealBtn', 'Crate & Seal (Ready for Transport)')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
