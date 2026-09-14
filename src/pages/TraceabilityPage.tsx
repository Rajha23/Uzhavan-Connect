import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Search, CheckCircle2, Clock, Package, Truck, MapPin, ExternalLink, ShieldCheck, Sparkles, Droplet, Gauge, FlaskConical, Award, Sprout, Users, Scale, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STATUS_STEPS = ['Harvested', 'Quality Checked', 'Packed', 'In Transit', 'Delivered'];

const STEP_ICONS: Record<string, React.ElementType> = {
  Harvested: Sprout,
  'Quality Checked': ShieldCheck,
  Packed: Package,
  'In Transit': Truck,
  Delivered: CheckCircle2,
};

const STATUS_COLORS: Record<string, string> = {
  Harvested: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  'Quality Checked': 'bg-teal-50 text-teal-800 border-teal-200/80',
  Packed: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
  'In Transit': 'bg-sky-50 text-sky-800 border-sky-200/80',
  Delivered: 'bg-emerald-700 text-white border-emerald-800',
};

export const TraceabilityPage: React.FC = () => {
  const { openPassportModal, producePassports, orders } = useApp();
  const { t } = useLanguage();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <QrCode className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>{t('traceability.provenanceBadge', 'Immutable Produce Provenance & Traceability Ledger')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('traceability.producePassport', 'Produce Traceability & Passports')}
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 font-normal max-w-2xl">
              {t('traceability.subtitle', 'End-to-end farm-to-fork cryptographic ledger tracking harvest, grading lab tests, cold transit, and buyer delivery.')}
            </p>
          </div>
          <button
            onClick={() => openPassportModal(selectedBatch?.batchId || 'AGP-TOM-2026-001')}
            className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer relative z-10 shrink-0"
          >
            <QrCode className="w-4 h-4 text-[#01472e]" />
            <span>{t('traceability.scanQr', 'Scan QR / View Passport')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('traceability.searchPlaceholder', 'Search by Batch ID, Crop or Farmer...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-modern w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Batch List */}
        <div className="lg:col-span-5 space-y-3.5">
          <h3 className="text-xs font-bold text-[#01472e] uppercase tracking-wider flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-[#01472e]" />
            <span>{t('traceability.activeBatches', 'Active Tracked Batches')} ({filtered.length})</span>
          </h3>
          {filtered.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setSelectedBatchId(b.batchId)}
              className={`w-full text-left p-5 sm:p-6 rounded-3xl border transition-all duration-200 shadow-xs cursor-pointer ${
                selectedBatchId === b.batchId
                  ? 'border-[#01472e] bg-white ring-2 ring-[#01472e]/20 shadow-soft -translate-y-0.5'
                  : 'border-[#ccd5ae]/50 bg-[#faf9f5] hover:border-[#a3b18a] hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {t('stages.' + (b.status === 'Quality Checked' ? 'qualityCheck' : b.status === 'In Transit' ? 'inTransit' : b.status.toLowerCase()), b.status)}
                    </span>
                    <span className="text-[10px] bg-[#01472e] text-[#fefae0] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {b.qualityGrade || t('common.gradeA', 'Grade A')}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-base mt-2 tracking-tight flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{b.crop} {b.variety ? `(${b.variety})` : ''}</span>
                    <span className="text-slate-400 font-normal">—</span>
                    <span className="font-mono text-[#01472e]">{b.quantityKg.toLocaleString()} kg</span>
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{b.farmerOrFpo}</span>
                  </p>
                </div>
                <QrCode className={`w-5 h-5 shrink-0 mt-1 ${selectedBatchId === b.batchId ? 'text-[#01472e]' : 'text-slate-400'}`} />
              </div>
              <div className="mt-3 pt-3 border-t border-[#ccd5ae]/30 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {b.harvestDate}</span>
                <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{b.destination.split('—')[0].trim()}</span>
              </div>
              <p className="text-[11px] font-mono font-bold text-[#01472e]/70 mt-2">{b.batchId} {b.orderId ? `• Ref: ${b.orderId}` : ''}</p>
            </button>
          ))}
        </div>

        {/* Batch Detail / Timeline */}
        <div className="lg:col-span-7">
          {selectedBatch ? (
            <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
              {/* Batch Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#ccd5ae]/30 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[selectedBatch.status] || ''}`}>
                      {t('stages.' + (selectedBatch.status === 'Quality Checked' ? 'qualityCheck' : selectedBatch.status === 'In Transit' ? 'inTransit' : selectedBatch.status.toLowerCase()), selectedBatch.status)}
                    </span>
                    <span className="text-[10px] bg-[#01472e] text-[#fefae0] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {selectedBatch.qualityGrade || t('traceability.certifiedGradeA', 'Certified Grade A')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight flex items-center gap-2">
                    <Sprout className="w-6 h-6 text-emerald-600" />
                    <span>{selectedBatch.crop} {t('traceability.batch', 'Batch')}</span>
                  </h2>
                  <p className="text-xs font-mono font-semibold text-slate-500 mt-1">
                    {selectedBatch.batchId} {selectedBatch.orderId ? `• ${t('orders.orderId', 'Order')}: ${selectedBatch.orderId}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => openPassportModal(selectedBatch.batchId)}
                  className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-soft cursor-pointer font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('traceability.fullPassport', 'Full Passport')}</span>
                </button>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t('traceability.farmerOrFpo', 'Farmer / FPO'), value: selectedBatch.farmerOrFpo, icon: Users },
                  { label: t('common.quantity', 'Quantity'), value: `${selectedBatch.quantityKg.toLocaleString()} kg`, icon: Scale },
                  { label: t('farmer.harvestDate', 'Harvest Date'), value: selectedBatch.harvestDate, icon: Calendar },
                  { label: t('buyer.deliveryLocation', 'Destination'), value: selectedBatch.destination, icon: MapPin },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <item.icon className="w-3.5 h-3.5 text-[#01472e]/70" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">{item.label}</span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 mt-0.5 tracking-tight truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Verified Quality Lab Metrics */}
              {selectedBatch.inspectionMetrics && (
                <div className="p-5 sm:p-6 bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-3xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-[#01472e]">
                    <ShieldCheck className="w-5 h-5 text-[#01472e]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#01472e]">
                      {t('traceability.labGradingParams', 'Verified Lab Quality Grading Parameters')}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] uppercase font-semibold">{t('fpo.sugarBrix', 'Sugar (Brix)')}</span>
                      </div>
                      <strong className="text-sm font-bold font-mono text-slate-900">{selectedBatch.inspectionMetrics.sugarBrix}° Bx</strong>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <Gauge className="w-3.5 h-3.5 text-sky-500" />
                        <span className="text-[10px] uppercase font-semibold">{t('fpo.firmness', 'Firmness')}</span>
                      </div>
                      <strong className="text-sm font-bold font-mono text-slate-900">{selectedBatch.inspectionMetrics.firmnessKgCm} kg/cm²</strong>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <Droplet className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] uppercase font-semibold">{t('fpo.moisture', 'Moisture')}</span>
                      </div>
                      <strong className="text-sm font-bold font-mono text-slate-900">{selectedBatch.inspectionMetrics.moistureContent}</strong>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] uppercase font-semibold">{t('fpo.pesticideResidue', 'Pesticide Assay')}</span>
                      </div>
                      <strong className="text-xs font-bold text-[#01472e] block truncate">{selectedBatch.inspectionMetrics.pesticideResidueTest}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Journey Timeline */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#01472e] mb-5">
                  {t('traceability.batchJourney', 'Batch Journey')}
                </h3>
                <div className="relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const StepIcon = STEP_ICONS[step] || CheckCircle2;
                    const stepLabel =
                      step === 'Harvested' ? t('stages.listed', 'Harvested') :
                      step === 'Quality Checked' ? t('stages.qualityCheck', 'Quality Checked') :
                      step === 'Packed' ? t('stages.packed', 'Packed') :
                      step === 'In Transit' ? t('stages.inTransit', 'In Transit') :
                      t('stages.delivered', 'Delivered');

                    return (
                      <div key={step} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                        {/* Step indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all z-10 relative ${
                            isCompleted
                              ? 'bg-[#01472e] border-[#01472e] text-[#fefae0] shadow-xs'
                              : isCurrent
                                ? 'bg-[#eaf4ec] border-[#01472e] text-[#01472e] shadow-soft ring-2 ring-[#01472e]/20'
                                : 'bg-white border-[#ccd5ae]/60 text-slate-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`absolute top-8 bottom-0 left-4 w-0.5 -ml-[1px] ${isCompleted ? 'bg-[#01472e]' : 'bg-[#ccd5ae]/40'}`} />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p className={`text-xs font-bold ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>{stepLabel}</p>
                          {isCurrent && (
                            <span className="text-[10px] text-[#01472e] bg-[#eaf4ec] border border-[#a3b18a]/50 px-2.5 py-0.5 rounded-full inline-block font-bold mt-1 shadow-2xs">
                              {t('common.currentStatus', 'Current Status')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-12 flex flex-col items-center justify-center text-center">
              <Truck className="w-12 h-12 text-[#01472e]/40 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{t('traceability.selectBatch', 'Select a batch to view details')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('traceability.selectBatchDesc', 'Click any batch from the list to see the full journey timeline')}</p>
              <button
                onClick={() => openPassportModal('AGP-TOM-2026-001')}
                className="mt-5 btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-soft cursor-pointer font-semibold"
              >
                <QrCode className="w-4 h-4 text-[#fefae0]" />
                <span>{t('traceability.openSamplePassport', 'Open Sample Produce Passport')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


