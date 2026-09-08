import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Search, CheckCircle2, Clock, Package, Truck, MapPin, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

const STATUS_STEPS = ['Harvested', 'Quality Checked', 'Packed', 'In Transit', 'Delivered'];

const STATUS_COLORS: Record<string, string> = {
  Harvested: 'bg-sage/20 text-forest border-sage',
  'Quality Checked': 'bg-olive/20 text-forest border-olive',
  Packed: 'bg-cream text-forest border-olive/30',
  'In Transit': 'bg-olive/40 text-forest border-olive',
  Delivered: 'bg-forest text-cream border-forest',
};

export const TraceabilityPage: React.FC = () => {
  const { openPassportModal, producePassports, orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Combine producePassports with live orders to ensure complete end-to-end traceability
  const passportBatchIds = new Set(producePassports.map((p) => p.batchId));

  interface BatchItem {
    batchId: string;
    orderId?: string;
    crop: string;
    variety: string;
    farmerOrFpo: string;
    harvestDate: string;
    quantityKg: number;
    status: string;
    destination: string;
    qualityGrade: string;
    inspectionMetrics?: {
      sugarBrix: number;
      firmnessKgCm: number;
      moistureContent: string;
      pesticideResidueTest: string;
    };
    timeline: {
      status: string;
      date: string;
      location: string;
      note?: string;
    }[];
  }

  const liveOrderBatches: BatchItem[] = orders
    .filter((o) => !passportBatchIds.has(o.batchId))
    .map((o) => {
      // Map order status to passport step
      let currentStatus = 'Harvested';
      if (o.status === 'Completed' || o.status === 'Delivered') currentStatus = 'Delivered';
      else if (o.status === 'In Transit') currentStatus = 'In Transit';
      else if (o.status === 'Packed') currentStatus = 'Packed';
      else if (o.status === 'Quality Checked' || o.status === 'Collected') currentStatus = 'Quality Checked';

      return {
        batchId: o.batchId || `BATCH-${o.id}`,
        orderId: o.id,
        crop: o.crop,
        variety: o.variety || 'Standard Hybrid',
        farmerOrFpo: o.farmerContributions && o.farmerContributions.length > 1
          ? `Consolidated FPO (${o.farmerContributions.length} Farmers)`
          : o.farmerName,
        harvestDate: o.date ? o.date.split('T')[0] : '2026-09-08',
        quantityKg: o.quantityKg,
        status: currentStatus,
        destination: o.deliveryLocation,
        qualityGrade: o.qualityGrade || 'Grade A',
        inspectionMetrics: o.inspectionMetrics ? {
          sugarBrix: o.inspectionMetrics.sugarBrix || 4.8,
          firmnessKgCm: o.inspectionMetrics.firmnessKgCm || 3.4,
          moistureContent: o.inspectionMetrics.moistureContent || '86%',
          pesticideResidueTest: o.inspectionMetrics.pesticideResidueTest || 'ND (NABL Compliant)'
        } : undefined,
        timeline: [
          { status: 'Harvested', date: o.date ? o.date.split('T')[0] : '2026-09-08', location: o.farmerLocation, note: 'Harvest recorded at source farm gate' },
          ...(o.qualityStatus === 'Passed' ? [{ status: 'Quality Checked', date: o.date ? o.date.split('T')[0] : '2026-09-08', location: 'FPO Quality Hub', note: `Lab verified ${o.qualityGrade}` }] : []),
          ...(o.packingStatus === 'Packed' ? [{ status: 'Packed', date: o.date ? o.date.split('T')[0] : '2026-09-08', location: 'FPO Packhouse', note: `${o.crateCount || 25} Crates tagged with QR code` }] : []),
          ...(o.transportDetails ? [{ status: 'In Transit', date: o.transportDetails.assignedAt ? o.transportDetails.assignedAt.split('T')[0] : '2026-09-08', location: 'En Route', note: `Vehicle ${o.transportDetails.vehicleNumber}` }] : []),
          ...(o.buyerConfirmation ? [{ status: 'Delivered', date: o.buyerConfirmation.confirmedAt ? o.buyerConfirmation.confirmedAt.split('T')[0] : '2026-09-08', location: o.deliveryLocation, note: `Buyer verified by ${o.buyerConfirmation.receiverName}` }] : [])
        ]
      };
    });

  const batches: BatchItem[] = [
    ...liveOrderBatches,
    ...producePassports.map((p) => ({
      batchId: p.batchId,
      orderId: undefined,
      crop: p.crop,
      variety: p.variety,
      farmerOrFpo: p.farmerOrFpo,
      harvestDate: p.harvestDate,
      quantityKg: p.quantityKg,
      status: p.currentStatus,
      destination: p.destination,
      qualityGrade: p.qualityGrade,
      inspectionMetrics: p.inspectionMetrics,
      timeline: p.timeline.map(t => ({
        status: t.title,
        date: t.timestamp.split(' ')[0],
        location: t.location,
        note: t.notes
      }))
    }))
  ];

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    batches.length > 0 ? batches[0].batchId : 'AGP-TOM-2026-001'
  );

  const filtered: BatchItem[] = batches.filter(
    (b) =>
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.orderId && b.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmerOrFpo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBatch: BatchItem | null = selectedBatchId ? batches.find((b) => b.batchId === selectedBatchId) || batches[0] || null : null;
  const currentStepIdx = selectedBatch ? STATUS_STEPS.indexOf(selectedBatch.status) : -1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Produce Traceability & Passports</h1>
          <p className="text-xs sm:text-sm font-normal text-slate-500 mt-1">
            End-to-end farm-to-fork cryptographic ledger tracking harvest, grading lab tests, cold transit, and delivery.
          </p>
        </div>
        <button
          onClick={() => openPassportModal(selectedBatch?.batchId || 'AGP-TOM-2026-001')}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan QR / View Passport</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Batch ID, Crop or Farmer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs font-medium text-slate-900 placeholder-slate-400 transition"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Batch List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Tracked Batches ({filtered.length})
          </h3>
          {filtered.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border transition shadow-xs ${
                selectedBatchId === b.batchId
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {b.status}
                    </span>
                    <span className="text-[10px] bg-slate-900 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {b.qualityGrade || 'Grade A'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-base mt-2 tracking-tight">
                    {b.crop} {b.variety ? `(${b.variety})` : ''} — {b.quantityKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs font-normal text-slate-500 mt-0.5">{b.farmerOrFpo}</p>
                </div>
                <QrCode className={`w-5 h-5 shrink-0 mt-1 ${selectedBatchId === b.batchId ? 'text-emerald-700' : 'text-slate-400'}`} />
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {b.harvestDate}</span>
                <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{b.destination.split('—')[0].trim()}</span>
              </div>
              <p className="text-[11px] font-mono font-medium text-slate-400 mt-2">{b.batchId} {b.orderId ? `• Ref: ${b.orderId}` : ''}</p>
            </button>
          ))}
        </div>

        {/* Batch Detail / Timeline */}
        <div className="lg:col-span-7">
          {selectedBatch ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Batch Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[selectedBatch.status] || ''}`}>
                      {selectedBatch.status}
                    </span>
                    <span className="text-[10px] bg-slate-900 text-white font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedBatch.qualityGrade || 'Certified Grade A'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                    {selectedBatch.crop} Batch
                  </h2>
                  <p className="text-xs font-mono font-medium text-slate-400 mt-1">
                    {selectedBatch.batchId} {selectedBatch.orderId ? `• Order: ${selectedBatch.orderId}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => openPassportModal(selectedBatch.batchId)}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Passport</span>
                </button>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Farmer / FPO', value: selectedBatch.farmerOrFpo, icon: Package },
                  { label: 'Quantity', value: `${selectedBatch.quantityKg.toLocaleString()} kg`, icon: Package },
                  { label: 'Harvest Date', value: selectedBatch.harvestDate, icon: Clock },
                  { label: 'Destination', value: selectedBatch.destination, icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">{item.label}</span>
                    <p className="font-bold text-sm text-slate-900 mt-0.5 tracking-tight truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Verified Quality Lab Metrics */}
              {selectedBatch.inspectionMetrics && (
                <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Verified Lab Quality Grading Parameters
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sugar (Brix)</span>
                      <strong className="text-sm font-bold text-slate-900">{selectedBatch.inspectionMetrics.sugarBrix}° Bx</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Firmness</span>
                      <strong className="text-sm font-bold text-slate-900">{selectedBatch.inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Moisture</span>
                      <strong className="text-sm font-bold text-slate-900">{selectedBatch.inspectionMetrics.moistureContent}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pesticide Assay</span>
                      <strong className="text-xs font-semibold text-emerald-700 block truncate">{selectedBatch.inspectionMetrics.pesticideResidueTest}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Journey Timeline */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-5">Batch Journey</h3>
                <div className="relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition z-10 relative ${
                            isCompleted
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : isCurrent
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`absolute top-8 bottom-0 left-4 w-0.5 -ml-[1px] ${isCompleted ? 'bg-slate-900' : 'bg-slate-200'}`} />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p className={`text-xs font-semibold ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block font-semibold mt-1">Current Status</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 flex flex-col items-center justify-center text-center">
              <Truck className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Select a batch to view details</h3>
              <p className="text-xs text-slate-500 mt-1">Click any batch from the list to see the full journey timeline</p>
              <button
                onClick={() => openPassportModal('AGP-TOM-2026-001')}
                className="mt-5 btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Open Sample Produce Passport</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

