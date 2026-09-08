import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a2e1f] to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>FPO Aggregator & Micro-Hub Facility</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Hub Node
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            {currentUser.organization || 'GreenHarvest FPO Hub'}
          </h1>
          <p className="text-sm text-slate-300 mt-2 font-normal">
            Aggregator Operations: Farm Gate Collection, Multi-Farmer Traceability, Quality Grading, Crating & Transport Readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition tracking-wide"
          >
            <span>All Orders ({orders.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-medium text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-medium text-emerald-950">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Operational Stage Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Member Supply', count: produceListings.length, desc: 'Active Farm Supply', stage: 'MEMBER_SUPPLY' as const, color: 'text-emerald-700' },
          { label: 'Collection Queue', count: pendingCollectionOrders.length, desc: 'Awaiting Farm Pickup', stage: 'COLLECTION' as const, color: 'text-amber-700' },
          { label: 'Awaiting QA', count: collectedAwaitingGrading.length, desc: 'At Micro-Hub Station', stage: 'GRADING' as const, color: 'text-purple-700' },
          { label: 'Awaiting Packing', count: gradedAwaitingPacking.length, desc: 'Ready for Crates & QR', stage: 'PACKING' as const, color: 'text-teal-700' },
          { label: 'Bulk Pools', count: bulkConsolidatedOrders.length, desc: 'Multi-Farmer Batches', stage: 'CONSOLIDATION' as const, color: 'text-blue-700' },
          { label: 'Dispatch Ready', count: packedReadyForLogistics.length, desc: 'Transport Ready Gate', stage: 'ALL' as const, color: 'text-slate-800' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTabSection(item.stage)}
            className={`p-4 rounded-2xl border text-left transition shadow-xs ${
              activeTabSection === item.stage
                ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-[11px] text-slate-500 font-medium truncate">{item.label}</p>
            <p className={`text-2xl font-semibold font-mono mt-0.5 ${item.color}`}>{item.count}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Stage Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'MEMBER_SUPPLY', label: `Member Supply (${produceListings.length})` },
          { key: 'COLLECTION', label: `1. Farm Gate Collection (${pendingCollectionOrders.length})` },
          { key: 'GRADING', label: `2. Quality Check & Grading (${collectedAwaitingGrading.length})` },
          { key: 'PACKING', label: `3. Packing & Batch QR (${gradedAwaitingPacking.length})` },
          { key: 'CONSOLIDATION', label: `4. Bulk Consolidation (${bulkConsolidatedOrders.length})` },
          { key: 'ALL', label: `5. All Collective Orders (${orders.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTabSection(tab.key as any)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition whitespace-nowrap ${
              activeTabSection === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── STAGE 0: MEMBER FARM SUPPLY POOL ───────────────────────────────── */}
      {activeTabSection === 'MEMBER_SUPPLY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-medium text-slate-900 tracking-tight">Member Farm Produce Supply Pool</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active crop listings submitted by member farmers. Aggregated and available for Smart Matching with institutional buyers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {produceListings.length} Active Listings
              </span>
              <button
                onClick={() => setActiveTab('smart-matching')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Smart Matching Engine</span>
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
                <div key={listing.id} className="p-5 border border-slate-200 hover:border-emerald-300 bg-white rounded-2xl space-y-3 transition shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-500">{listing.id}</span>
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                        remaining <= 0
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {remaining <= 0 ? 'Fully Allocated' : listing.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">
                        {listing.crop}
                        {listing.variety && <span className="text-slate-500 font-normal ml-1">({listing.variety})</span>}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>Farmer: <strong className="text-slate-700">{listing.farmerName}</strong></span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{listing.location}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Available Supply:</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          {remaining.toLocaleString()} {listing.unit || 'kg'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, 100 - percentAllocated)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Total: {totalListed.toLocaleString()} {listing.unit || 'kg'}</span>
                        <span>Allocated: {allocated.toLocaleString()} ({percentAllocated}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 font-mono">
                      ₹{listing.expectedPricePerKg}/kg • {listing.grade}
                    </span>
                    <button
                      onClick={() => setActiveTab('smart-matching')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded-xl transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Match</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-slate-900 tracking-tight">Farm Gate Produce Collection Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Collect harvested produce from member farms. Multi-farmer contributions and partial pickups are tracked without losing source provenance.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              {pendingCollectionOrders.length} Orders Awaiting Pickup
            </span>
          </div>

          {pendingCollectionOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">All member farm produce collected!</p>
              <p className="text-xs text-slate-400 mt-0.5">New confirmed orders matched via Smart Matching will enter this queue.</p>
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
                  <div key={order.id} className="p-5 border border-amber-200 bg-amber-50/30 rounded-2xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-slate-900">{order.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[11px] text-amber-900 font-semibold">{order.batchId}</span>
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${
                        order.status === 'Partially Collected'
                          ? 'bg-amber-200 text-amber-900 border-amber-300'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {order.status === 'Partially Collected' ? 'Partially Collected' : 'Collection Pending'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{order.crop} ({order.variety || 'Hybrid'})</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Buyer: <strong className="text-slate-800">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    {/* Collection Progress Bar */}
                    <div className="bg-white p-3 rounded-xl border border-amber-100 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">Collection Progress:</span>
                        <span className="font-medium text-slate-900 font-mono">
                          {collectedKg.toLocaleString()} / {requiredKg.toLocaleString()} kg ({percentCollected}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentCollected}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                        <span className="text-emerald-700 font-semibold">Collected: {collectedKg.toLocaleString()} kg</span>
                        <span className="text-amber-800 font-medium">Remaining: {remainingKg.toLocaleString()} kg</span>
                      </div>
                    </div>

                    {/* Multi-Farmer Traceability Breakdown */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        <span>Contributing Farmer Sources ({contributions.length})</span>
                      </p>

                      <div className="space-y-1.5">
                        {contributions.map((c, idx) => {
                          const farmerRemaining = Math.max(0, c.contributedQuantityKg - (c.collectedQuantityKg || 0));
                          return (
                            <div
                              key={c.farmerId || idx}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-medium text-slate-900">{c.farmerName}</p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{c.farmerLocation}</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-medium text-slate-800 block">
                                  {c.collectedQuantityKg || 0} / {c.contributedQuantityKg} kg
                                </span>
                                <span className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded ${
                                  c.collectionStatus === 'FULLY_COLLECTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (c.collectionStatus === 'PARTIALLY_COLLECTED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                                }`}>
                                  {c.collectionStatus === 'FULLY_COLLECTED' ? 'Collected' : `${farmerRemaining} kg open`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        Target Value: ₹{order.totalValue.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleOpenCollectionModal(order)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Record Produce Collection</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-slate-900 tracking-tight">Hub Quality Inspection & Grading Station</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perform laboratory checks (Sugar Brix, firmness, moisture, pesticide assay) and record accepted vs rejected volumes.
              </p>
            </div>
            <span className="text-xs font-medium text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
              {collectedAwaitingGrading.length} Batches Ready for QA
            </span>
          </div>

          {collectedAwaitingGrading.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-purple-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No batches currently awaiting quality check</p>
              <p className="text-xs text-slate-400 mt-0.5">Collect produce from Stage 1 to queue batches for quality inspection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collectedAwaitingGrading.map((order) => {
                const isInspecting = selectedOrderForInspection === order.id;
                const totalCollected = order.collectedQuantityKg || order.quantityKg;

                return (
                  <div key={order.id} className="p-5 border border-purple-200 bg-purple-50/30 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-slate-900">{order.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-xs text-purple-900 font-semibold">{order.batchId}</span>
                          <span className="text-[10px] font-medium uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                            Collected ({totalCollected.toLocaleString()} kg)
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900 mt-1">
                          {order.crop} ({order.variety || 'Hybrid'}) — {totalCollected.toLocaleString()} kg from {order.farmerName}
                        </h4>
                      </div>

                      <button
                        onClick={() => isInspecting ? setSelectedOrderForInspection(null) : handleStartInspection(order)}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-xl transition shadow-xs self-start sm:self-auto"
                      >
                        {isInspecting ? 'Cancel QA Form' : 'Open Inspection Form →'}
                      </button>
                    </div>

                    {/* Interactive Quality Form */}
                    {isInspecting && (
                      <div className="p-5 bg-white border border-purple-200 rounded-xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <h5 className="font-medium text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>Quality Certification & Acceptance Entry — Batch: {order.batchId}</span>
                          </h5>
                          <span className="text-xs font-mono font-medium text-purple-900">Total Collected: {totalCollected} kg</span>
                        </div>

                        {/* Acceptance & Rejection Breakdown */}
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-slate-700 font-medium mb-1">
                              Accepted Quantity (kg) <span className="text-emerald-700 font-mono">(Moves to Packing)</span>
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
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono font-medium text-slate-900 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-medium mb-1">
                              Rejected Quantity (kg) <span className="text-red-700 font-mono">(Defects/Shortage)</span>
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
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono font-medium text-slate-900 bg-white"
                            />
                          </div>

                          {rejectedKg > 0 && (
                            <div className="sm:col-span-2">
                              <label className="block text-slate-700 font-medium mb-1">Rejection Reason / Defect Notes</label>
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Surface bruising 4%, moisture deficit, pest blemish"
                                className="w-full px-3 py-2 border border-amber-300 bg-amber-50/30 rounded-lg focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        {/* Lab Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Sugar Content (°Brix)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={sugarBrix}
                              onChange={(e) => setSugarBrix(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Firmness (kg/cm²)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={firmness}
                              onChange={(e) => setFirmness(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Moisture Content</label>
                            <input
                              type="text"
                              value={moisture}
                              onChange={(e) => setMoisture(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Pesticide Residue Test</label>
                            <select
                              value={pesticideTest}
                              onChange={(e) => setPesticideTest(e.target.value as any)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-medium"
                            >
                              <option value="PASS - Organic / ND">PASS - Organic / ND (Non-Detectable)</option>
                              <option value="PASS - Standard Compliant">PASS - Standard Compliant</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Certified Grade</label>
                            <select
                              value={grade}
                              onChange={(e) => setGrade(e.target.value as any)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-medium"
                            >
                              <option value="Grade A">Grade A (Premium Export Quality)</option>
                              <option value="Grade B">Grade B (Retail High Grade)</option>
                              <option value="Standard">Standard Commercial</option>
                              <option value="Premium">Premium Spec</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-600 font-medium mb-1">QA Assessor Name</label>
                            <input
                              type="text"
                              value={inspectorName}
                              onChange={(e) => setInspectorName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedOrderForInspection(null)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveInspection(order.id)}
                            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-lg transition shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Certify Quality & Record Accepted Volume</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-slate-900 tracking-tight">Packaging, Crating & QR Sealing</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pack quality-accepted produce into standardized agro-crates, assign batch tamper seal, and unlock Transport Readiness.
              </p>
            </div>
            <span className="text-xs font-medium text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              {gradedAwaitingPacking.length} Batches Ready for Crating
            </span>
          </div>

          {gradedAwaitingPacking.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto text-teal-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No batches currently awaiting packing</p>
              <p className="text-xs text-slate-400 mt-0.5">Complete Quality Grading in Stage 2 to advance batches here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradedAwaitingPacking.map((order) => {
                const acceptedVolume = order.acceptedQuantityKg !== undefined ? order.acceptedQuantityKg : (order.collectedQuantityKg || order.quantityKg);
                const estimatedCrates = Math.ceil(acceptedVolume / 25);

                return (
                  <div key={order.id} className="p-5 border border-teal-200 bg-teal-50/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-900">{order.id}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider bg-teal-200 text-teal-900 px-2.5 py-0.5 rounded">
                        {order.qualityGrade} • {order.qualityStatus || 'Passed'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{order.crop} ({order.variety || 'Hybrid'})</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Accepted Volume: <strong className="font-mono text-teal-900">{acceptedVolume.toLocaleString()} kg</strong> (~{estimatedCrates} crates)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Destination: <strong className="text-slate-800">{order.buyerName}</strong> ({order.deliveryLocation})
                      </p>
                    </div>

                    <div className="pt-3 border-t border-teal-200/60 flex items-center justify-between">
                      <button
                        onClick={() => openPassportModal(order.batchId)}
                        className="text-teal-700 hover:text-teal-900 text-xs font-medium flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Preview Passport</span>
                      </button>

                      <button
                        onClick={() => handleOpenPackingModal(order)}
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Pack & Unlock Transport →</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-slate-900 tracking-tight">Bulk Order Consolidation & Provenance Hub</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated institutional volume orders maintaining 100% individual farmer source and buyer demand links.
              </p>
            </div>
            <span className="text-xs font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
              {bulkConsolidatedOrders.length} Consolidated Batches
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
                <div key={order.id} className="p-5 border border-blue-200 bg-blue-50/20 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-900">{order.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs text-blue-900 font-medium">{order.batchId}</span>
                      {order.aggregatedGroupId && (
                        <span className="text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                          Pooled: {order.aggregatedGroupId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-300 bg-white text-slate-800">
                      Status: {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-blue-100 text-xs">
                    <div>
                      <span className="text-slate-500 block">Total Buyer Quantity:</span>
                      <strong className="text-sm font-semibold font-mono text-slate-900">{requiredKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Collected:</span>
                      <strong className="text-sm font-semibold font-mono text-emerald-700">{collectedKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Remaining Collection:</span>
                      <strong className="text-sm font-semibold font-mono text-amber-700">{remainingKg.toLocaleString()} kg</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Transaction Value:</span>
                      <strong className="text-sm font-semibold font-mono text-slate-900">₹{order.totalValue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Farmer Provenance Trail */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Farmer Provenance & Source Allotments ({contributions.length} Producers)</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {contributions.map((c, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <div className="flex justify-between font-medium text-slate-900">
                            <span>{c.farmerName}</span>
                            <span className="font-mono text-blue-800">{c.contributedQuantityKg.toLocaleString()} kg</span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{c.farmerLocation}</span>
                          </p>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Listing: <strong className="font-mono">{c.produceListingId}</strong></span>
                            <span className="text-emerald-700 font-semibold">Collected: {c.collectedQuantityKg || 0} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Buyer: <strong className="text-slate-800">{order.buyerName}</strong> (Demand: {order.demandRequestId})
                    </span>
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Provenance Passport</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-900 tracking-tight">All Collective FPO Batches</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive lifecycle status across collection, quality, crating and transport</p>
            </div>
            <span className="text-xs font-medium text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {orders.length} Total Batches
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-medium text-xs shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-slate-900">{order.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs text-slate-500">{order.batchId}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                        {order.status}
                      </span>
                      {order.isReadyForTransport && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Ready for Transport
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-900 mt-0.5">
                      {order.crop} — {order.quantityKg.toLocaleString()} kg @ ₹{order.pricePerKg}/kg (Total: ₹{order.totalValue.toLocaleString()})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Farmer: {order.farmerName} ➔ Buyer: {order.buyerName}
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
                    Order Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PRODUCE COLLECTION ─────────────────────────────────── */}
      {collectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Check className="w-5 h-5 text-emerald-700" />
                <h4 className="font-medium text-slate-900 text-base tracking-tight">
                  Record Farm Gate Collection
                </h4>
              </div>
              <button
                onClick={() => setCollectionModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordCollectionSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                <span className="font-mono text-[11px] text-amber-900 font-medium">Order: {collectionModalOrder.id}</span>
                <p className="font-medium text-slate-900 text-sm">{collectionModalOrder.crop} ({collectionModalOrder.variety || 'Hybrid'})</p>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Total Order Required: <strong>{collectionModalOrder.quantityKg.toLocaleString()} kg</strong></span>
                  <span>Currently Collected: <strong className="text-emerald-700">{collectionModalOrder.collectedQuantityKg || 0} kg</strong></span>
                </div>
              </div>

              {/* Select Contributing Farmer */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Producer Farm Gate</label>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
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
                      {c.farmerName} — {c.contributedQuantityKg - (c.collectedQuantityKg || 0)} kg remaining of {c.contributedQuantityKg} kg
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Quantity Input */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-700 font-medium">Quantity to Collect (kg)</label>
                  <span className="text-slate-400">Max open balance</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={collectionModalOrder.remainingCollectionKg || collectionModalOrder.quantityKg}
                  value={collectAmountKg}
                  onChange={(e) => setCollectAmountKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Collection Notes */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Field Logistics Notes</label>
                <input
                  type="text"
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectionModalOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Farm Gate Pickup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PACKING & CRATING ─────────────────────────────────────────── */}
      {packingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-teal-700" />
                <h4 className="font-medium text-slate-900 text-base tracking-tight">
                  Crating, Batch QR & Transport Readiness
                </h4>
              </div>
              <button
                onClick={() => setPackingModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPackingSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1">
                <span className="font-mono text-[11px] text-teal-900 font-medium">Order: {packingModalOrder.id} • Batch: {packingModalOrder.batchId}</span>
                <p className="font-medium text-slate-900 text-sm">{packingModalOrder.crop} ({packingModalOrder.variety || 'Hybrid'})</p>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Quality Grade: <strong className="text-purple-800">{packingModalOrder.qualityGrade}</strong></span>
                  <span>Accepted Quantity: <strong className="text-teal-800 font-mono">{packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg} kg</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Packed Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  max={packingModalOrder.acceptedQuantityKg || packingModalOrder.quantityKg}
                  value={packQuantityKg}
                  onChange={(e) => setPackQuantityKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Equivalent to ~{Math.ceil(packQuantityKg / 25)} crates (standard 25 kg unit payload)
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Packaging Specification</label>
                <select
                  value={crateType}
                  onChange={(e) => setCrateType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="Ventilated 25kg Food-Grade Agro-Crates">Ventilated 25kg Food-Grade Agro-Crates</option>
                  <option value="Corrugated High-Strength Export Cartons">Corrugated High-Strength Export Cartons (20kg)</option>
                  <option value="Perforated Pre-Cooling Bins">Perforated Pre-Cooling Bins (50kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tamper-Proof Batch Barcode Note</label>
                <input
                  type="text"
                  value={packNotes}
                  onChange={(e) => setPackNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPackingModalOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Crate & Seal (Ready for Transport)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
