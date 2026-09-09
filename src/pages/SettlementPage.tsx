import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Award,
  Sparkles,
  ArrowUpRight,
  Download,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettlementPage: React.FC = () => {
  const { settlements, settlePayment, openPassportModal, setActiveTab } = useApp();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(
    settlements.length > 0 ? settlements[0].id : null
  );
  const [downloading, setDownloading] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const filteredSettlements = settlements.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  const activeSettlement =
    settlements.find((s) => s.id === selectedSettlementId) ||
    filteredSettlements[0] ||
    settlements[0];

  const totalSettledAmount = settlements
    .filter((s) => s.status === 'COMPLETED')
    .reduce((acc, s) => acc + s.farmerAmount, 0);

  const totalPendingAmount = settlements
    .filter((s) => s.status === 'PENDING')
    .reduce((acc, s) => acc + s.farmerAmount, 0);

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 }
      });
    }, 600);
  };

  const handleExecutePayout = (orderId: string, id: string) => {
    setSettlingId(id);
    setTimeout(() => {
      settlePayment(orderId);
      setSettlingId(null);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-emerald-700 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-2">
            <CreditCard className="w-4 h-4" />
            <span>Automated Escrow Disbursement Ledger</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tracking-wide">
            Settlement & Net Realization
          </h1>
          <p className="text-sm text-white/70 mt-3 max-w-2xl leading-relaxed font-medium">
            Instant digital payout triggered upon buyer delivery acceptance. Zero hidden commission deductions, zero mandi cess deductions, zero delayed 90-day credit lag.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 bg-emerald-100 hover:bg-white text-slate-900 text-[10px] uppercase tracking-widest font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting PDF...' : 'Download Tax Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/60 block mb-1">
            Total Settled Payouts
          </span>
          <p className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide">
            ₹{totalSettledAmount.toLocaleString()}
          </p>
          <span className="text-xs text-slate-900/70 font-semibold mt-1 block">
            {settlements.filter((s) => s.status === 'COMPLETED').length} Transactions Completed
          </span>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/60 block mb-1">
            Locked in Escrow (Awaiting Payout)
          </span>
          <p className="text-3xl font-bold tracking-tight text-amber-700 tracking-wide">
            ₹{totalPendingAmount.toLocaleString()}
          </p>
          <span className="text-xs text-amber-800/80 font-semibold mt-1 block">
            {settlements.filter((s) => s.status === 'PENDING').length} Orders Pending Release
          </span>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/60 block mb-1">
            Average Farmer Net Realization
          </span>
          <p className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide">
            88.9%
          </p>
          <span className="text-xs text-slate-900/70 font-semibold mt-1 block">
            vs. 45-55% Traditional Mandi APMC Realization
          </span>
        </div>
      </div>

      {/* Settlements List & Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900/70">Filter Settlements:</span>
            <div className="inline-flex bg-slate-50 p-1 rounded-[1rem] border border-slate-200">
              {(['ALL', 'PENDING', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-[0.8rem] text-[10px] font-bold uppercase tracking-widest transition ${
                    filterStatus === st
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-900/70 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-900/60 font-medium font-mono">
            Showing {filteredSettlements.length} of {settlements.length} Escrow Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSettlements.map((s) => {
            const isSelected = activeSettlement?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSettlementId(s.id)}
                className={`p-5 rounded-[1.5rem] border text-left cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-forest bg-emerald-100/10 ring-2 ring-forest/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-200 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-900/60 uppercase">
                      {s.orderId}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-slate-900 border-sage/60'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h4 className="font-bold tracking-tight text-xl text-slate-900 tracking-wide">
                    {s.crop} • {s.quantityKg.toLocaleString()} kg
                  </h4>
                  <p className="text-xs text-slate-900/70 font-medium mt-1">
                    Beneficiary: <strong className="text-slate-900">{s.farmerOrFpoName}</strong>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-900/50 block">Net Payout</span>
                    <span className="text-lg font-bold tracking-tight text-slate-900">₹{s.farmerAmount.toLocaleString()}</span>
                  </div>

                  {s.status === 'PENDING' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecutePayout(s.orderId, s.id);
                      }}
                      disabled={settlingId === s.id}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-[#023120] text-white text-[10px] font-bold uppercase tracking-widest rounded-[0.8rem] shadow-sm transition"
                    >
                      {settlingId === s.id ? 'Processing...' : 'Disburse'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-900/60 font-bold">
                      UTR Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Order Value & 85.9% Realization Banner */}
      {activeSettlement && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-900/50 font-bold uppercase tracking-widest">
                  Order ID: {activeSettlement.orderId}
                </span>
                <span className="text-slate-900/30">•</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    activeSettlement.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-slate-900 border-sage/50'
                      : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  }`}
                >
                  ESCROW STATUS: {activeSettlement.status}
                </span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-3 tracking-wide">
                {activeSettlement.crop} • {activeSettlement.quantityKg.toLocaleString()} kg
              </h3>
              <p className="text-sm font-medium text-slate-900/70 mt-1">
                Buyer: <strong>{activeSettlement.buyerName}</strong> ➔ Beneficiary: <strong>{activeSettlement.farmerOrFpoName}</strong>
              </p>
            </div>

            <div className="text-right flex flex-col md:items-end gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-900/50 block mb-1">
                  Total Landed Order Value
                </span>
                <span className="text-5xl font-bold tracking-tight text-slate-900 tracking-wide">
                  ₹{activeSettlement.totalOrderValue.toLocaleString()}
                </span>
                <span className="text-xs text-slate-900/70 block font-bold font-mono mt-1">
                  @ ₹{(activeSettlement.totalOrderValue / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg Landed
                </span>
              </div>

              {activeSettlement.status === 'PENDING' && (
                <button
                  onClick={() => handleExecutePayout(activeSettlement.orderId, activeSettlement.id)}
                  disabled={settlingId === activeSettlement.id}
                  className="mt-2 flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-[#023120] text-white text-xs font-bold uppercase tracking-widest rounded-[1rem] shadow-soft transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>
                    {settlingId === activeSettlement.id
                      ? 'Executing Automated Payout...'
                      : `Trigger Instant Escrow Payout (₹${activeSettlement.farmerAmount.toLocaleString()})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 3-Way Transparent Value Split Breakdown */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-900/50 uppercase tracking-widest mb-6">
              Transparent Disbursement Split
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Farmer / FPO Share */}
              <div className="bg-emerald-700 border border-forest rounded-[1.5rem] p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      Farmer Net Realization
                    </span>
                    <span className="text-xs font-bold tracking-tight tracking-wide bg-emerald-100 text-slate-900 px-3 py-1 rounded-[1rem]">
                      {activeSettlement.farmerRealizationPercentage}%
                    </span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight text-white tracking-wide">
                    ₹{activeSettlement.farmerAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/70 mt-2 font-mono font-bold">
                    ₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg credited to farmer bank
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-sage/20 text-[10px] font-bold uppercase tracking-widest text-white/90 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {activeSettlement.status === 'COMPLETED'
                      ? 'Disbursed via Instant Bank Escrow'
                      : 'Locked in Escrow — Ready to Release'}
                  </span>
                </div>
              </div>

              {/* Logistics & Micro-Hub Share */}
              <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-900/70 uppercase tracking-widest">
                      Logistics & Pre-cooling
                    </span>
                    <span className="text-xs font-bold tracking-tight tracking-wide text-slate-900 bg-emerald-100/30 px-3 py-1 rounded-[1rem] border border-sage/50">
                      {((activeSettlement.logisticsAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide">
                    ₹{activeSettlement.logisticsAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900/50 mt-2">
                    ₹{(activeSettlement.logisticsAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (Reefer + Micro-hub)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-900/70 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>GreenTransit Cold Fleet & Micro-Hub</span>
                </div>
              </div>

              {/* Platform Coordination Share */}
              <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-900/70 uppercase tracking-widest">
                      Uzhavan Connect Platform Fee
                    </span>
                    <span className="text-xs font-bold tracking-tight tracking-wide text-slate-900 bg-emerald-100/30 px-3 py-1 rounded-[1rem] border border-sage/50">
                      {((activeSettlement.platformAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide">
                    ₹{activeSettlement.platformAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900/50 mt-2">
                    ₹{(activeSettlement.platformAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (AI forecast, match & QR)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-900/70 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Covers AI Engine & Blockchain Ledger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Mandi vs Uzhavan Connect Net Comparison */}
          <div className="bg-emerald-100/20 border border-sage/40 rounded-[2.5rem] p-8 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h5 className="text-sm font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-900" />
                <span>Measurable Economic Gain for Smallholder Farmers</span>
              </h5>
              <span className="text-sm font-bold tracking-tight tracking-wide text-white bg-emerald-700 px-4 py-1.5 rounded-[1rem] shadow-sm">
                +{activeSettlement.earningsGainPercentage}% Extra Earnings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="bg-white/50 p-6 rounded-[1.5rem] border border-slate-200">
                <span className="text-slate-900/70 text-[10px] font-bold uppercase tracking-widest block">
                  Traditional 5-Tier Mandi Intermediary Outcome:
                </span>
                <p className="text-2xl font-bold tracking-tight text-slate-900/70 tracking-wide mt-2">
                  ₹{activeSettlement.traditionalFarmerEarnings.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-slate-900/50 font-mono">
                    (₹{(activeSettlement.traditionalFarmerEarnings / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs font-medium text-slate-900/60 mt-2">
                  Farmer receives less than half due to commissions, local traders, and 22% spoilage cuts.
                </p>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-forest shadow-sm">
                <span className="text-slate-900 font-bold text-[10px] uppercase tracking-widest block">
                  Uzhavan Connect Coordinated Outcome:
                </span>
                <p className="text-3xl font-bold tracking-tight text-slate-900 tracking-wide mt-2">
                  ₹{activeSettlement.farmerAmount.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-slate-900/70 font-mono">
                    (₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-slate-900 mt-2 font-medium">
                  Farmer receives +₹{(activeSettlement.farmerAmount - activeSettlement.traditionalFarmerEarnings).toLocaleString()} additional cash in hand for the harvest!
                </p>
              </div>
            </div>
          </div>

          {/* Banking Audit Trail */}
          <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-900/70">
            <div>
              <span>Bank UTR: </span>
              <strong className="text-slate-900 bg-white px-3 py-1.5 rounded-[1rem] border border-slate-200 font-mono text-xs">
                {activeSettlement.utrNumber}
              </strong>
            </div>
            <div>
              <span>Timestamp: </span>
              <strong className="text-slate-900 bg-white px-3 py-1.5 rounded-[1rem] border border-slate-200 font-mono text-xs">
                {activeSettlement.settlementDate}
              </strong>
            </div>
            <div>
              <span>Batch ID: </span>
              <button
                onClick={() => openPassportModal(activeSettlement.batchId)}
                className="text-slate-900 bg-emerald-100/30 px-3 py-1.5 rounded-[1rem] border border-sage/50 font-mono text-xs hover:bg-emerald-100/50 transition"
              >
                {activeSettlement.batchId}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

