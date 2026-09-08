import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_PRODUCE_PASSPORT } from '../data/mockData';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Truck,
  Award,
  Thermometer,
  Download,
  Share2,
  Copy,
  Check,
  Search,
  Package,
  Building2,
  FileCheck2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const ProducePassportModal: React.FC = () => {
  const {
    isPassportModalOpen,
    closePassportModal,
    selectedPassportBatchId,
    openPassportModal,
    producePassports,
    orders
  } = useApp();

  const [lookupQuery, setLookupQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isPassportModalOpen) return null;

  // Active target ID is either what the user is typing/searching or the opened ID
  const activeLookupId = lookupQuery.trim() || selectedPassportBatchId || 'AGP-TOM-2026-001';

  // Match from live orders first, then passports
  const matchedOrder = orders.find(
    (o) =>
      o.batchId?.toLowerCase() === activeLookupId.toLowerCase() ||
      o.id?.toLowerCase() === activeLookupId.toLowerCase()
  );

  const matchedPassport = producePassports.find(
    (p) =>
      p.batchId?.toLowerCase() === activeLookupId.toLowerCase() ||
      (matchedOrder && p.batchId?.toLowerCase() === matchedOrder.batchId.toLowerCase())
  );

  // Construct live composite passport data
  const batchId = matchedOrder?.batchId || matchedPassport?.batchId || DEMO_PRODUCE_PASSPORT.batchId;
  const orderId = matchedOrder?.id;
  const crop = matchedOrder?.crop || matchedPassport?.crop || DEMO_PRODUCE_PASSPORT.crop;
  const variety = matchedOrder?.variety || matchedPassport?.variety || DEMO_PRODUCE_PASSPORT.variety;
  const producer = matchedOrder?.fpoName || matchedOrder?.farmerName || matchedPassport?.farmerOrFpo || DEMO_PRODUCE_PASSPORT.farmerOrFpo;
  const location = matchedOrder?.farmerLocation || matchedPassport?.farmLocation || DEMO_PRODUCE_PASSPORT.farmLocation;
  const harvestDate = matchedOrder?.date || matchedPassport?.harvestDate || DEMO_PRODUCE_PASSPORT.harvestDate;
  const quantityKg = matchedOrder?.acceptedQuantityKg || matchedOrder?.packedQuantityKg || matchedOrder?.quantityKg || matchedPassport?.quantityKg || DEMO_PRODUCE_PASSPORT.quantityKg;
  const qualityGrade = matchedOrder?.qualityGrade || matchedPassport?.qualityGrade || DEMO_PRODUCE_PASSPORT.qualityGrade;
  const currentStatus = matchedOrder?.status || matchedPassport?.currentStatus || DEMO_PRODUCE_PASSPORT.currentStatus;

  const inspectionMetrics = matchedOrder?.inspectionMetrics || matchedPassport?.inspectionMetrics || DEMO_PRODUCE_PASSPORT.inspectionMetrics;
  const transport = matchedOrder?.transportDetails;
  const buyerConfirmation = matchedOrder?.buyerConfirmation;
  const farmerContributions = matchedOrder?.farmerContributions || [];
  const timeline = matchedOrder?.timeline && matchedOrder.timeline.length > 0 ? matchedOrder.timeline : (matchedPassport?.timeline || DEMO_PRODUCE_PASSPORT.timeline);

  const qrUrl = `https://uzhavanconnect.gov.in/trace/${batchId}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recent tracked references for instant 1-click inspection
  const recentReferences = [
    ...orders.slice(0, 3).map((o) => ({ id: o.batchId, label: `${o.crop} (${o.id})` })),
    ...producePassports.slice(0, 2).map((p) => ({ id: p.batchId, label: `${p.crop} (Demo)` }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded font-mono font-bold border border-emerald-400/30 uppercase tracking-widest">
                  Cryptographic Produce Passport
                </span>
                <span className="text-xs text-slate-300">• Live Custody Traceability</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Batch: <span className="font-mono text-emerald-300">{batchId}</span>
                {orderId && <span className="text-xs text-slate-300 font-sans ml-2 font-normal">(Order: {orderId})</span>}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={closePassportModal}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Batch Search & Quick Lookup Strip */}
        <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Scan or Enter Batch ID / Order ID (e.g. BATCH-TN-...)..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-mono shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">Quick Lookup:</span>
            {recentReferences.map((ref, idx) => (
              <button
                key={idx}
                onClick={() => setLookupQuery(ref.id)}
                className={`px-2.5 py-1 rounded-lg border font-mono font-bold transition shrink-0 ${
                  activeLookupId.toLowerCase() === ref.id.toLowerCase()
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {ref.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Summary Card with QR Code and Certified Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            {/* Scannable Dynamic SVG QR Representation */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2">
              <div className="w-36 h-36 bg-white p-2 border-2 border-slate-800 rounded-xl relative flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  {/* Outer corner positioning squares */}
                  <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="12" width="14" height="14" />
                  <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="74" y="12" width="14" height="14" />
                  <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="74" width="14" height="14" />

                  {/* Synthetic QR matrix patterns */}
                  <rect x="40" y="8" width="6" height="6" />
                  <rect x="50" y="8" width="8" height="6" />
                  <rect x="40" y="20" width="12" height="6" />
                  <rect x="55" y="22" width="6" height="10" />
                  <rect x="8" y="42" width="12" height="6" />
                  <rect x="24" y="40" width="8" height="8" />
                  <rect x="8" y="54" width="6" height="8" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="68" y="42" width="8" height="8" />
                  <rect x="80" y="48" width="12" height="6" />
                  <rect x="42" y="68" width="6" height="14" />
                  <rect x="54" y="74" width="12" height="8" />
                  <rect x="72" y="70" width="8" height="8" />
                  <rect x="84" y="78" width="10" height="14" />
                </svg>
                {/* Center Uzhavan Connect Icon Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                    UZ
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[180px]">
                {batchId}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'URL Copied!' : 'Copy Trace URL'}</span>
              </button>
            </div>

            {/* Core Produce Specs & Provenance */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Agricultural Produce</span>
                  <h4 className="text-2xl font-bold tracking-tight text-slate-900">{crop}</h4>
                  <p className="text-xs text-slate-500 font-medium">{variety}</p>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full border border-emerald-300 text-xs font-bold">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>{qualityGrade} CERTIFIED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">FPO / Producer:</span>
                  <p className="font-bold text-slate-800 truncate mt-0.5">{producer}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Harvest / Listed:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{harvestDate}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Source Origin:</span>
                  <p className="font-bold text-slate-800 truncate mt-0.5">{location}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Verified Volume:</span>
                  <p className="font-bold text-emerald-700 font-mono mt-0.5">{quantityKg.toLocaleString()} kg</p>
                </div>
              </div>

              {/* Multi-Farmer Contribution Cluster Breakdown */}
              {farmerContributions && farmerContributions.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Traceable Farmer Contributors ({farmerContributions.length} Member Farm{farmerContributions.length > 1 ? 's' : ''})</span>
                    </span>
                    <span className="font-mono text-emerald-800">
                      {farmerContributions.reduce((s, c) => s + (c.collectedQuantityKg || c.contributedQuantityKg), 0).toLocaleString()} kg total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {farmerContributions.map((fc, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <strong className="text-slate-800 block">{fc.farmerName}</strong>
                          <span className="text-[10px] text-slate-400">{fc.farmerLocation}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {fc.collectedQuantityKg || fc.contributedQuantityKg} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Operational Verification Grid (Quality Assay, Packing, Transport, Buyer Signoff) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Lab Quality Assay */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>NABL Quality Assay</span>
              </p>
              {inspectionMetrics ? (
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Sugar Content (Brix):</span>
                    <strong className="font-mono text-slate-900">{inspectionMetrics.sugarBrix} °Bx</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Firmness:</span>
                    <strong className="font-mono text-slate-900">{inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Moisture Content:</span>
                    <strong className="font-mono text-slate-900">{inspectionMetrics.moistureContent}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200 text-[11px]">
                    <span>Pesticide Residue:</span>
                    <strong className="text-emerald-800 font-bold">{inspectionMetrics.pesticideResidueTest}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">Quality assay pending at hub</p>
              )}
            </div>

            {/* 2. Packing & Cold-Chain Transport */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-600" />
                <span>Cold-Chain Transit Telemetry</span>
              </p>
              {transport ? (
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Carrier:</span>
                    <strong className="text-slate-900 truncate max-w-[120px]">{transport.carrierName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Number:</span>
                    <strong className="font-mono text-slate-900">{transport.vehicleNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Reefer Temp:</span>
                    <strong className="font-mono text-teal-800 font-bold">{transport.temperatureC || 4.0} °C</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span>Driver Contact:</span>
                    <strong className="text-slate-800">{transport.driverName}</strong>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-slate-500 text-[11px]">
                  <p>Packed: <strong>{matchedOrder?.crateCount || Math.ceil(quantityKg / 25)} Crates (25kg)</strong></p>
                  <p>QR Tamper Seal: <strong className="font-mono text-emerald-800">Verified</strong></p>
                  <p className="text-[10px] text-slate-400">Transport in dispatch staging</p>
                </div>
              )}
            </div>

            {/* 3. Buyer Delivery Acceptance */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-slate-600" />
                <span>Buyer Receiving Signoff</span>
              </p>
              {buyerConfirmation ? (
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Decision:</span>
                    <strong className="text-emerald-800 font-bold">{buyerConfirmation.acceptanceStatus}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Accepted Volume:</span>
                    <strong className="font-mono text-slate-900">{buyerConfirmation.acceptedQuantityKg.toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Receiving Officer:</span>
                    <strong className="text-slate-900 truncate max-w-[120px]">{buyerConfirmation.receiverName}</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 truncate">
                    Remarks: {buyerConfirmation.issuesReported || 'Full conformance verified'}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <p className="font-medium">Current Status: <strong className="text-slate-700">{currentStatus}</strong></p>
                  <p className="text-[10px]">Awaiting destination dock verification</p>
                </div>
              )}
            </div>
          </div>

          {/* Chronological Movement Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Immutable Custody & Movement Timeline
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  {/* Step Bullet */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center text-white ${
                      event.completed !== false ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-emerald-300 transition">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-slate-900">{event.title}</h5>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {event.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.location}</span>
                      {event.operator && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span>By: {event.operator}</span>
                        </>
                      )}
                    </p>

                    {event.notes && (
                      <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Immutable Batch ID: <strong className="font-mono text-slate-800">{batchId}</strong> • Verified via Uzhavan Trust Ledger
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition uppercase tracking-wider text-[10px]"
            >
              Copy Verification Link
            </button>
            <button
              onClick={closePassportModal}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition uppercase tracking-wider text-[10px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
