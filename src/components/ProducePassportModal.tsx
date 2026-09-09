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
  Check
} from 'lucide-react';

export const ProducePassportModal: React.FC = () => {
  const { isPassportModalOpen, closePassportModal, selectedPassportBatchId, producePassports } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isPassportModalOpen) return null;

  const passport = producePassports.find((p) => p.batchId === selectedPassportBatchId) || DEMO_PRODUCE_PASSPORT;

  const handleCopy = () => {
    navigator.clipboard?.writeText(passport.qrCodeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-400/30">
                  DIGITAL PRODUCE PASSPORT
                </span>
                <span className="text-xs text-slate-300">Batch Traceability</span>
              </div>
              <h3 className="text-xl font-bold  text-white mt-0.5">
                Batch: {passport.batchId}
              </h3>
            </div>
          </div>

          <button
            onClick={closePassportModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Summary Card with QR Code and Certified Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            {/* Scannable QR Representation */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
              {/* Dynamic Crisp SVG QR Code Representation */}
              <div className="w-36 h-36 bg-white p-2 border-2 border-slate-800 rounded-lg relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  {/* Outer corner squares */}
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
                {/* Center Uzhavan Connect icon badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow">
                    AP
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500 mt-2">
                Scan via camera or UPI app
              </span>
              <button
                onClick={handleCopy}
                className="mt-2 text-xs flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Verification URL'}</span>
              </button>
            </div>

            {/* Core Produce Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Verified Commodity</span>
                  <h4 className="text-lg font-bold text-slate-900">{passport.crop}</h4>
                  <p className="text-xs text-slate-500">{passport.variety}</p>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300 text-xs font-bold">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>{passport.qualityGrade} CERTIFIED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Producer / FPO:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{passport.farmerOrFpo}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Harvest Timestamp:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{passport.harvestDate}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Origin Coordinates:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{passport.farmLocation}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Batch Quantity:</span>
                  <p className="font-bold text-emerald-700 font-mono mt-0.5">{passport.quantityKg.toLocaleString()} kg</p>
                </div>
              </div>

              {/* Lab & Inspection Metrics */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
                <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lab Inspection & Quality Metrics (NABL Accredited)</span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-1.5 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500">Sugar (Brix):</span>
                    <p className="font-bold text-slate-800">{passport.inspectionMetrics.sugarBrix} °Bx</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500">Firmness:</span>
                    <p className="font-bold text-slate-800">{passport.inspectionMetrics.firmnessKgCm} kg/cm²</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500">Residue Test:</span>
                    <p className="font-bold text-emerald-700">{passport.inspectionMetrics.pesticideResidueTest}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Movement Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Immutable Custody & Movement Timeline
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {passport.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  {/* Step Bullet */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-xs flex items-center justify-center text-white">
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
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{event.location}</span>
                      <span className="text-slate-300">|</span>
                      <span>By: {event.operator}</span>
                    </p>

                    {event.metrics && event.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
                        {event.metrics.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono"
                          >
                            <strong className="text-slate-900">{m.label}:</strong> {m.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Immutable Produce ID • Verified by Ministry of Consumer Affairs
          </span>
          <button
            onClick={closePassportModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
