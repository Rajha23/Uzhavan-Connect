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
  const { openPassportModal, producePassports } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    producePassports.length > 0 ? producePassports[0].batchId : 'AGP-TOM-2026-001'
  );

  const batches = producePassports.map((p) => ({
    batchId: p.batchId,
    crop: p.crop,
    variety: p.variety,
    farmerOrFpo: p.farmerOrFpo,
    harvestDate: p.harvestDate,
    quantityKg: p.quantityKg,
    status: p.currentStatus,
    destination: p.destination,
    qualityGrade: p.qualityGrade,
    inspectionMetrics: p.inspectionMetrics,
    timeline: p.timeline
  }));

  const filtered = batches.filter(
    (b) =>
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmerOrFpo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBatch = selectedBatchId ? batches.find((b) => b.batchId === selectedBatchId) || batches[0] : null;
  const currentStepIdx = selectedBatch ? STATUS_STEPS.indexOf(selectedBatch.status) : -1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-anton text-forest tracking-wide">Produce Traceability & Passports</h1>
          <p className="text-sm font-medium text-forest/70 mt-1">
            End-to-end farm-to-fork cryptographic ledger tracking harvest, grading lab tests, cold transit, and delivery.
          </p>
        </div>
        <button
          onClick={() => openPassportModal(selectedBatch?.batchId || 'AGP-TOM-2026-001')}
          className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-[10px] font-bold px-6 py-3.5 rounded-[1rem] transition shadow-sm uppercase tracking-widest"
        >
          <QrCode className="w-5 h-5" />
          Scan QR / View Passport
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50" />
        <input
          type="text"
          placeholder="Search by Batch ID, Crop or Farmer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-xs bg-cream border border-olive/30 rounded-[1.5rem] focus:outline-none focus:border-sage shadow-sm font-medium text-forest placeholder-forest/50 transition"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Batch List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[10px] font-bold text-forest uppercase tracking-widest">
            Active Tracked Batches ({filtered.length})
          </h3>
          {filtered.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`w-full text-left p-5 rounded-[1.5rem] border transition shadow-sm hover:shadow-forest ${
                selectedBatchId === b.batchId
                  ? 'border-forest bg-sage/10 ring-1 ring-forest/20'
                  : 'border-olive/30 bg-cream hover:border-olive'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[b.status] || 'bg-cream text-forest border-olive/30'}`}>
                      {b.status}
                    </span>
                    <span className="text-[9px] bg-forest text-cream font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {b.qualityGrade || 'Grade A'}
                    </span>
                  </div>
                  <p className="font-anton text-forest text-xl mt-3 tracking-wide">
                    {b.crop} {b.variety ? `(${b.variety})` : ''} — {b.quantityKg.toLocaleString()} kg
                  </p>
                  <p className="text-xs font-medium text-forest/70 mt-1">{b.farmerOrFpo}</p>
                </div>
                <QrCode className={`w-6 h-6 shrink-0 mt-1 ${selectedBatchId === b.batchId ? 'text-forest' : 'text-forest/30'}`} />
              </div>
              <div className="mt-4 pt-4 border-t border-olive/20 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {b.harvestDate}</span>
                <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{b.destination.split('—')[0].trim()}</span>
              </div>
              <p className="text-[10px] font-mono font-bold text-forest/50 mt-3">{b.batchId}</p>
            </button>
          ))}
        </div>

        {/* Batch Detail / Timeline */}
        <div className="lg:col-span-7">
          {selectedBatch ? (
            <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest p-8 space-y-8">
              {/* Batch Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-olive/30 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[selectedBatch.status] || ''}`}>
                      {selectedBatch.status}
                    </span>
                    <span className="text-[10px] bg-forest text-cream font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedBatch.qualityGrade || 'Certified Grade A'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-anton text-forest mt-4 tracking-wide">
                    {selectedBatch.crop} Batch
                  </h2>
                  <p className="text-xs font-mono font-bold text-forest/60 mt-2">{selectedBatch.batchId}</p>
                </div>
                <button
                  onClick={() => openPassportModal(selectedBatch.batchId)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-forest bg-sage border border-sage/50 px-5 py-3 rounded-[1rem] hover:bg-cream hover:border-olive/30 transition shadow-sm shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Passport
                </button>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Farmer / FPO', value: selectedBatch.farmerOrFpo, icon: Package },
                  { label: 'Quantity', value: `${selectedBatch.quantityKg.toLocaleString()} kg`, icon: Package },
                  { label: 'Harvest Date', value: selectedBatch.harvestDate, icon: Clock },
                  { label: 'Destination', value: selectedBatch.destination, icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-olive/10 rounded-[1.5rem] border border-olive/30 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-forest/60 block">{item.label}</span>
                    <p className="font-anton text-lg text-forest mt-1 tracking-wide truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Verified Quality Lab Metrics */}
              {selectedBatch.inspectionMetrics && (
                <div className="p-6 bg-olive/10 border border-olive/30 rounded-[1.5rem] space-y-3">
                  <div className="flex items-center gap-2 text-forest">
                    <ShieldCheck className="w-5 h-5 text-sage" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">
                      Verified Lab Quality Grading Parameters
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-cream p-3 rounded-[1rem] border border-olive/20">
                      <span className="text-[9px] text-forest/60 uppercase font-bold block">Sugar (Brix)</span>
                      <strong className="text-base font-anton text-forest">{selectedBatch.inspectionMetrics.sugarBrix}° Bx</strong>
                    </div>
                    <div className="bg-cream p-3 rounded-[1rem] border border-olive/20">
                      <span className="text-[9px] text-forest/60 uppercase font-bold block">Firmness</span>
                      <strong className="text-base font-anton text-forest">{selectedBatch.inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                    </div>
                    <div className="bg-cream p-3 rounded-[1rem] border border-olive/20">
                      <span className="text-[9px] text-forest/60 uppercase font-bold block">Moisture</span>
                      <strong className="text-base font-anton text-forest">{selectedBatch.inspectionMetrics.moistureContent}</strong>
                    </div>
                    <div className="bg-cream p-3 rounded-[1rem] border border-olive/20">
                      <span className="text-[9px] text-forest/60 uppercase font-bold block">Pesticide Assay</span>
                      <strong className="text-xs font-bold text-emerald-800 block truncate">{selectedBatch.inspectionMetrics.pesticideResidueTest}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Journey Timeline */}
              <div className="pt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-forest mb-6">Batch Journey</h3>
                <div className="relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step} className="flex items-start gap-5 pb-8 last:pb-0 relative">
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition z-10 relative ${
                            isCompleted
                              ? 'bg-forest border-forest text-cream shadow-sm'
                              : isCurrent
                                ? 'bg-sage border-sage text-forest shadow-sm'
                                : 'bg-cream border-olive/30 text-forest/30'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`absolute top-10 bottom-0 left-5 w-0.5 -ml-[1px] ${isCompleted ? 'bg-forest' : 'bg-olive/30'}`} />
                          )}
                        </div>
                        <div className="pt-2.5">
                          <p className={`text-xs font-bold uppercase tracking-widest ${isCompleted || isCurrent ? 'text-forest' : 'text-forest/40'}`}>{step}</p>
                          {isCurrent && (
                            <p className="text-[10px] text-sage bg-forest px-3 py-1 rounded-full inline-block font-bold uppercase tracking-widest mt-2">← Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-sm p-12 flex flex-col items-center justify-center text-center">
              <Truck className="w-16 h-16 text-olive mb-6" />
              <h3 className="text-xl font-anton text-forest tracking-wide">Select a batch to view details</h3>
              <p className="text-sm font-medium text-forest/70 mt-2">Click any batch from the list to see the full journey timeline</p>
              <button
                onClick={() => openPassportModal('AGP-TOM-2026-001')}
                className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-5 py-2.5 rounded-[1rem] hover:bg-sage/50 transition border border-sage/50"
              >
                <QrCode className="w-4 h-4" /> Open Sample Produce Passport
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

