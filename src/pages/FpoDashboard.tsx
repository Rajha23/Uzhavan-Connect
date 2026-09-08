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
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QualityInspectionData } from '../types';

export const FpoDashboard: React.FC = () => {
  const {
    currentUser,
    produceListings,
    orders,
    fpoCollectProduce,
    fpoQualityCheck,
    fpoPackProduce,
    openPassportModal,
    setActiveTab
  } = useApp();

  const [activeTabSection, setActiveTabSection] = useState<'MEMBER_SUPPLY' | 'COLLECTION' | 'GRADING' | 'PACKING' | 'ALL'>('COLLECTION');
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<string | null>(null);

  // Inspection form state
  const [sugarBrix, setSugarBrix] = useState<number>(5.0);
  const [firmness, setFirmness] = useState<number>(3.6);
  const [pesticideTest, setPesticideTest] = useState<'PASS - Organic / ND' | 'PASS - Standard Compliant'>('PASS - Organic / ND');
  const [moisture, setMoisture] = useState<string>('92.5%');
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [inspectorName, setInspectorName] = useState<string>('Dr. R. Malathi (FPO QA Officer)');
  const [hubLocation, setHubLocation] = useState<string>('Sriperumbudur Rural Hub');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter orders for different operational stages
  const pendingCollectionOrders = orders.filter(
    (o) => o.status === 'Produce Collection Pending' || o.status === 'Created' || o.status === 'Pending'
  );
  const collectedAwaitingGrading = orders.filter((o) => o.status === 'Collected');
  const gradedAwaitingPacking = orders.filter((o) => o.status === 'Quality Checked');
  const packedReadyForLogistics = orders.filter((o) => o.status === 'Packed');

  const handleCollect = (orderId: string) => {
    fpoCollectProduce(orderId, hubLocation);
    setActionSuccessMessage(`Produce for order ${orderId} successfully collected at farm gate and transferred to ${hubLocation}!`);
    confetti({ particleCount: 30, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleStartInspection = (orderId: string) => {
    setSelectedOrderForInspection(orderId);
  };

  const handleSaveInspection = (orderId: string) => {
    const metrics: QualityInspectionData = {
      sugarBrix: Number(sugarBrix),
      firmnessKgCm: Number(firmness),
      pesticideResidueTest: pesticideTest,
      moistureContent: moisture,
      verifiedGrade: grade,
      inspectorName,
      inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      hubLocation
    };

    fpoQualityCheck(orderId, metrics);
    setSelectedOrderForInspection(null);
    setActionSuccessMessage(`Quality grading complete for ${orderId}: Certified as ${grade}!`);
    confetti({ particleCount: 40, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handlePack = (orderId: string, batchId: string) => {
    fpoPackProduce(orderId, `Ventilated 25kg Agro-Crates with tamper-evident QR seal (${batchId})`);
    setActionSuccessMessage(`Batch ${batchId} for order ${orderId} packed into crates with tamper-proof QR passport seal! Ready for logistics transport.`);
    confetti({ particleCount: 50, origin: { y: 0.6 } });
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Users className="w-4 h-4" />
            <span>FPO Aggregator & Micro-Hub Facility</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            {currentUser.organization || 'GreenHarvest FPO Hub'}
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            Aggregator Operations Hub: Collection, Quality Grading, Crating, and Batch QR Sealing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>All Orders ({orders.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ✓
          </div>
          <p className="text-xs font-bold text-emerald-950">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Operational Stage Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Member Crop Listings', count: produceListings.length, desc: 'Active Farm Supply', stage: 'MEMBER_SUPPLY' as const, color: 'text-emerald-700' },
          { label: 'Farm Collection Queue', count: pendingCollectionOrders.length, desc: 'Awaiting Farm Pickup', stage: 'COLLECTION' as const, color: 'text-amber-700' },
          { label: 'Awaiting Quality Check', count: collectedAwaitingGrading.length, desc: 'At Mobile QA Station', stage: 'GRADING' as const, color: 'text-purple-700' },
          { label: 'Awaiting Packing & QR', count: gradedAwaitingPacking.length, desc: 'Ready for Crating', stage: 'PACKING' as const, color: 'text-teal-700' },
          { label: 'Dispatch Ready', count: packedReadyForLogistics.length, desc: 'Handover to Logistics', stage: 'ALL' as const, color: 'text-slate-800' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTabSection(item.stage)}
            className={`p-5 rounded-2xl border text-left transition shadow-xs ${
              activeTabSection === item.stage
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

      {/* Stage Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { key: 'MEMBER_SUPPLY', label: `Member Farm Supply (${produceListings.length})` },
          { key: 'COLLECTION', label: `1. Farm Gate Collection (${pendingCollectionOrders.length})` },
          { key: 'GRADING', label: `2. Quality Check & Grading (${collectedAwaitingGrading.length})` },
          { key: 'PACKING', label: `3. Packing & Batch QR (${gradedAwaitingPacking.length})` },
          { key: 'ALL', label: `4. All Hub Batches (${orders.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTabSection(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeTabSection === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── STAGE 0: MEMBER FARM PRODUCE SUPPLY & AGGREGATION POOL ──────────── */}
      {activeTabSection === 'MEMBER_SUPPLY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Member Farm Produce Supply Pool</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active crop listings submitted by member farmers. Aggregated and ready for Smart Matching with institutional buyer demand.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {produceListings.length} Active Listings
              </span>
              <button
                onClick={() => setActiveTab('matching')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Smart Matching Engine</span>
              </button>
            </div>
          </div>

          {produceListings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Sprout className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No member produce currently listed</p>
              <p className="text-xs text-slate-400 mt-0.5">Listings submitted by member farmers will appear here automatically.</p>
            </div>
          ) : (
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
                        <span className="font-mono text-xs font-bold text-slate-500">{listing.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          remaining <= 0
                            ? 'bg-slate-100 text-slate-600 border border-slate-300'
                            : listing.status === 'Listed' || listing.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {remaining <= 0 ? 'Fully Allocated' : listing.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
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

                      {/* Remaining vs Allocated Quantity Progress Bar */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Available Supply:</span>
                          <span className="font-bold text-emerald-700 font-mono">
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

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">Grade: <strong className="text-slate-800">{listing.grade}</strong></span>
                        <span className="text-slate-500">Target: <strong className="text-slate-900 font-mono">₹{listing.expectedPricePerKg}/kg</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Harvest: {listing.harvestDate}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                        {listing.fpoName || 'GreenHarvest FPO'}
                      </span>
                      <button
                        onClick={() => setActiveTab('matching')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Match</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 1: FARM GATE COLLECTION ─────────────────────────────────── */}
      {activeTabSection === 'COLLECTION' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Farm Gate Produce Collection Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pick up harvested produce from member farmer clusters and transport to regional micro-hub</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              {pendingCollectionOrders.length} Pending Pickup
            </span>
          </div>

          {pendingCollectionOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">All member farm produce collected!</p>
              <p className="text-xs text-slate-400 mt-0.5">New orders matched via Smart Matching will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCollectionOrders.map((order) => (
                <div key={order.id} className="p-5 border border-amber-200 bg-amber-50/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      Collection Pending
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.crop} ({order.variety || 'Hybrid'})</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Quantity: <strong className="text-slate-900">{order.quantityKg.toLocaleString()} kg</strong> • Target Value: <strong className="text-slate-900">₹{order.totalValue.toLocaleString()}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Farm Gate: <strong>{order.farmerName}</strong> ({order.farmerLocation})</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">Dest: {order.buyerName}</span>
                    <button
                      onClick={() => handleCollect(order.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Collect Produce at Farm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 2: QUALITY CHECK & GRADING ───────────────────────────────── */}
      {activeTabSection === 'GRADING' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Hub Quality Inspection & Grading Station</h3>
              <p className="text-xs text-slate-500 mt-0.5">Perform standard laboratory metrics check (sugar content, firmness, moisture, pesticide assay)</p>
            </div>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
              {collectedAwaitingGrading.length} Ready for QA
            </span>
          </div>

          {collectedAwaitingGrading.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-purple-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No batches currently awaiting quality check</p>
              <p className="text-xs text-slate-400 mt-0.5">Collect produce from Stage 1 to queue it for quality inspection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collectedAwaitingGrading.map((order) => {
                const isInspecting = selectedOrderForInspection === order.id;

                return (
                  <div key={order.id} className="p-5 border border-purple-200 bg-purple-50/30 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-xs text-purple-900 font-semibold">{order.batchId}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                            Awaiting QA
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {order.crop} — {order.quantityKg.toLocaleString()} kg from {order.farmerName}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleStartInspection(isInspecting ? '' : order.id)}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-auto"
                      >
                        {isInspecting ? 'Cancel QA Form' : 'Open Inspection Form →'}
                      </button>
                    </div>

                    {/* Interactive Quality Form */}
                    {isInspecting && (
                      <div className="p-5 bg-white border border-purple-200 rounded-xl space-y-4">
                        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Inspection Metrics Entry — Batch: {order.batchId}
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
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
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 font-bold"
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
                            className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveInspection(order.id)}
                            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Certify & Issue Quality Stamp</span>
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

      {/* ── STAGE 3: PACKAGING & BATCH QR ──────────────────────────────────── */}
      {activeTabSection === 'PACKING' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Packaging, Crating & QR Sealing</h3>
              <p className="text-xs text-slate-500 mt-0.5">Package inspected produce into ventilated crates, apply tamper-evident barcode seal, and generate live Digital Passport</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              {gradedAwaitingPacking.length} Ready for Crating
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
              {gradedAwaitingPacking.map((order) => (
                <div key={order.id} className="p-5 border border-teal-200 bg-teal-50/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-200 text-teal-900 px-2 py-0.5 rounded">
                      {order.qualityGrade} Certified
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.crop} ({order.variety || 'Hybrid'})</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {order.quantityKg.toLocaleString()} kg • Assigned Batch: <strong className="font-mono text-teal-900">{order.batchId}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Buyer Destination: <strong className="text-slate-800">{order.buyerName}</strong> ({order.deliveryLocation})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-teal-200/60 flex items-center justify-between">
                    <button
                      onClick={() => openPassportModal(order.batchId)}
                      className="text-teal-700 hover:text-teal-900 text-xs font-bold flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Preview Passport</span>
                    </button>

                    <button
                      onClick={() => handlePack(order.id, order.batchId)}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Pack into Crates & Seal QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 4: ALL FPO BATCHES ────────────────────────────────────────── */}
      {activeTabSection === 'ALL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">All Collective FPO Batches</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical and active produce batches managed by your collective</p>
            </div>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {orders.length} Total Batches
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs text-slate-500">{order.batchId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
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
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

