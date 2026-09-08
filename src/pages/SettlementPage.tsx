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
  ArrowRight,
  Users,
  Wallet,
  Check,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettlementPage: React.FC = () => {
  const {
    settlements,
    recordBuyerPayment,
    processFpoSettlement,
    settleFarmerPayment,
    completeTransaction,
    settlePayment,
    openPassportModal,
    setActiveTab
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(
    settlements.length > 0 ? settlements[0].id : null
  );
  const [downloading, setDownloading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  const isCompletedStatus = (status: string) =>
    status === 'COMPLETED' || status === 'Transaction Completed';

  const filteredSettlements = settlements.filter((s) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'COMPLETED') return isCompletedStatus(s.status);
    return !isCompletedStatus(s.status);
  });

  const activeSettlement =
    settlements.find((s) => s.id === selectedSettlementId) ||
    filteredSettlements[0] ||
    settlements[0];

  const totalSettledAmount = settlements
    .filter((s) => isCompletedStatus(s.status))
    .reduce((acc, s) => acc + s.farmerAmount, 0);

  const totalPendingAmount = settlements
    .filter((s) => !isCompletedStatus(s.status))
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

  const handleRecordPayment = (orderId: string) => {
    setProcessingStage('buyer-pay');
    setTimeout(() => {
      recordBuyerPayment(orderId, {
        reference: `UPI-ERUPI-${Math.floor(100000 + Math.random() * 900000)}`
      });
      setProcessingStage(null);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 400);
  };

  const handleProcessFpo = (orderId: string) => {
    setProcessingStage('fpo-process');
    setTimeout(() => {
      processFpoSettlement(orderId);
      setProcessingStage(null);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 400);
  };

  const handleSettleFarmer = (orderId: string, farmerId?: string) => {
    setProcessingStage(farmerId ? `farmer-${farmerId}` : 'farmer-all');
    setTimeout(() => {
      settleFarmerPayment(orderId, farmerId);
      setProcessingStage(null);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 400);
  };

  const handleCompleteLedger = (orderId: string) => {
    setProcessingStage('complete');
    setTimeout(() => {
      completeTransaction(orderId);
      setProcessingStage(null);
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
    }, 400);
  };

  const handleInstantPayout = (orderId: string) => {
    setProcessingStage('instant');
    setTimeout(() => {
      settlePayment(orderId);
      setProcessingStage(null);
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } });
    }, 500);
  };

  // Determine stage progression for stepper (1 through 5)
  const getStageNumber = (status: string) => {
    if (status === 'Payment Pending' || status === 'PENDING') return 1;
    if (status === 'Buyer Payment Confirmed') return 2;
    if (status === 'FPO Settlement Pending') return 3;
    if (status === 'Farmer Settlement Processing') return 4;
    if (status === 'Farmer Payment Completed') return 5;
    if (isCompletedStatus(status)) return 6;
    return 1;
  };

  const currentStageNum = activeSettlement ? getStageNumber(activeSettlement.status) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest border border-emerald-600/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <CreditCard className="w-4 h-4" />
            <span>Automated Escrow Disbursement Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Settlement & Net Realization
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
            Transparent automated escrow disbursement triggered upon buyer dockside delivery signoff. 89% direct farmer realization, zero middlemen commissions, zero 90-day credit lag.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting PDF...' : 'Download Tax Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Prototype Escrow Architecture Safety Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-amber-950 shadow-xs">
        <div className="p-2 bg-amber-100 rounded-lg border border-amber-200 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-800" />
        </div>
        <div className="space-y-1">
          <strong className="text-sm font-medium text-amber-900 block">
            Prototype Architecture & Honest Operational Scope
          </strong>
          <p className="leading-relaxed text-[11px] text-amber-900/90 font-normal">
            This module provides a connected, prototype-safe simulation of the <strong>RBI UPI e-RUPI programmable escrow ledger</strong>.
            No live commercial banking gateway is integrated. All simulated UTR numbers, settlement splits (89% farmer / 8% logistics / 3% platform),
            and multi-farmer contributions reflect actual application orders and verifiable accounting rules.
          </p>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Total Settled Payouts
          </span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            ₹{totalSettledAmount.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            {settlements.filter((s) => isCompletedStatus(s.status)).length} Transactions Completed
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Locked in Escrow (Awaiting Payout)
          </span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-amber-700">
            ₹{totalPendingAmount.toLocaleString()}
          </p>
          <span className="text-xs text-amber-700 font-medium mt-1 block">
            {settlements.filter((s) => !isCompletedStatus(s.status)).length} Orders in Settlement Pipeline
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Average Farmer Net Realization
          </span>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-700">
            88.9%
          </p>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            vs. 45-55% Traditional Mandi APMC Realization
          </span>
        </div>
      </div>

      {/* Settlements List & Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter:</span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {st === 'IN_PROGRESS' ? 'In Settlement' : st === 'ALL' ? 'All Settlements' : 'Completed'}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium font-mono">
            Showing {filteredSettlements.length} of {settlements.length} Escrow Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSettlements.map((s) => {
            const isSelected = activeSettlement?.id === s.id;
            const isDone = isCompletedStatus(s.status);
            const farmerCount = s.farmerBreakdown?.length || 1;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSettlementId(s.id)}
                className={`p-5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
                      {s.orderId}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-lg text-slate-900 tracking-tight">
                    {s.crop} • {s.quantityKg.toLocaleString()} kg
                  </h4>
                  <p className="text-xs text-slate-600 font-normal mt-1">
                    Beneficiary: <strong className="text-slate-900 font-semibold">{s.farmerOrFpoName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {farmerCount} Participating Member Farmer{farmerCount > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Net Payout</span>
                    <span className="text-base font-semibold text-slate-900">₹{s.farmerAmount.toLocaleString()}</span>
                  </div>

                  {!isDone ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstantPayout(s.orderId);
                      }}
                      disabled={processingStage === 'instant'}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                    >
                      {processingStage === 'instant' ? 'Processing...' : 'Disburse'}
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Settled</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Order Value & 5-Step Connected Settlement Hub */}
      {activeSettlement && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Order ID: {activeSettlement.orderId}
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCompletedStatus(activeSettlement.status)
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  }`}
                >
                  ESCROW: {activeSettlement.status}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-2">
                {activeSettlement.crop} • {activeSettlement.quantityKg.toLocaleString()} kg
              </h3>
              <p className="text-xs sm:text-sm font-normal text-slate-500 mt-1">
                Buyer: <strong className="text-slate-800 font-semibold">{activeSettlement.buyerName}</strong> ➔ Beneficiary: <strong className="text-slate-800 font-semibold">{activeSettlement.farmerOrFpoName}</strong>
              </p>
            </div>

            <div className="text-right flex flex-col md:items-end gap-1.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                  Total Landed Order Value
                </span>
                <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                  ₹{activeSettlement.totalOrderValue.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block font-medium font-mono mt-0.5">
                  @ ₹{(activeSettlement.totalOrderValue / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg Landed
                </span>
              </div>

              {!isCompletedStatus(activeSettlement.status) && (
                <button
                  onClick={() => handleInstantPayout(activeSettlement.orderId)}
                  disabled={Boolean(processingStage)}
                  className="mt-2 flex items-center gap-2 btn-primary py-2.5 px-5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>
                    {processingStage === 'instant'
                      ? 'Executing Automated Payout...'
                      : `Instant 1-Click Payout (₹${activeSettlement.farmerAmount.toLocaleString()})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Interactive Workflow Stepper */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Connected Escrow Execution Pipeline
              </span>
              <span className="text-xs font-semibold text-slate-700 font-mono">
                Stage {Math.min(5, currentStageNum)} of 5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                {
                  stage: 1,
                  title: 'Buyer Delivery Verified',
                  subtitle: 'Dockside inspection signoff',
                  isDone: true,
                  isActive: false
                },
                {
                  stage: 2,
                  title: 'Buyer Payment Recorded',
                  subtitle: activeSettlement.buyerPaymentReference || 'Escrow deposit funding',
                  isDone: currentStageNum >= 2,
                  isActive: currentStageNum === 1
                },
                {
                  stage: 3,
                  title: 'FPO & Transport Share',
                  subtitle: '8% Cold-chain allocation',
                  isDone: currentStageNum >= 3,
                  isActive: currentStageNum === 2
                },
                {
                  stage: 4,
                  title: 'Farmer Net Direct Payout',
                  subtitle: '89% direct NEFT / e-RUPI',
                  isDone: currentStageNum >= 5,
                  isActive: currentStageNum === 3 || currentStageNum === 4
                },
                {
                  stage: 5,
                  title: 'Transaction Completed',
                  subtitle: 'Escrow closed with audit UTR',
                  isDone: currentStageNum >= 6,
                  isActive: currentStageNum === 5
                }
              ].map((st) => (
                <div
                  key={st.stage}
                  className={`p-3 rounded-lg border text-xs transition space-y-1 ${
                    st.isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : st.isActive
                      ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-300/50'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium font-mono">STEP {st.stage}</span>
                    {st.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="font-semibold text-xs leading-tight text-slate-900">{st.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{st.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Stage Action Controls */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-normal">
                {currentStageNum === 1 && 'Action required: Record buyer payment / escrow deposit.'}
                {currentStageNum === 2 && 'Action required: Process 8% FPO and cold-chain logistics allocation.'}
                {currentStageNum === 3 && 'Action required: Initiate direct NEFT batch payouts to member farmers.'}
                {currentStageNum === 4 && 'Action required: Finalize remaining farmer payouts.'}
                {currentStageNum === 5 && 'Action required: Finalize and close the escrow transaction ledger.'}
                {currentStageNum >= 6 && '✓ All funds disbursed. Transaction completed and verified.'}
              </span>

              <div className="flex items-center gap-2">
                {currentStageNum === 1 && (
                  <button
                    onClick={() => handleRecordPayment(activeSettlement.orderId)}
                    disabled={processingStage === 'buyer-pay'}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {processingStage === 'buyer-pay' ? 'Recording...' : 'Record Buyer Payment →'}
                  </button>
                )}

                {currentStageNum === 2 && (
                  <button
                    onClick={() => handleProcessFpo(activeSettlement.orderId)}
                    disabled={processingStage === 'fpo-process'}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {processingStage === 'fpo-process' ? 'Processing...' : 'Process FPO & Logistics (8%) →'}
                  </button>
                )}

                {(currentStageNum === 3 || currentStageNum === 4) && (
                  <button
                    onClick={() => handleSettleFarmer(activeSettlement.orderId)}
                    disabled={Boolean(processingStage)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {processingStage === 'farmer-all' ? 'Disbursing...' : 'Disburse All Farmers (89%) →'}
                  </button>
                )}

                {currentStageNum === 5 && (
                  <button
                    onClick={() => handleCompleteLedger(activeSettlement.orderId)}
                    disabled={processingStage === 'complete'}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    {processingStage === 'complete' ? 'Closing...' : 'Close & Finalize Transaction'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Farmer Member Settlement Ledger Table */}
          {activeSettlement.farmerBreakdown && activeSettlement.farmerBreakdown.length > 0 && (
            <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-semibold uppercase tracking-wider mb-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Member Farm Granular Accounting</span>
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 tracking-tight">
                    Multi-Farmer Settlement Ledger
                  </h4>
                  <p className="text-xs text-slate-500 font-normal">
                    Farmer-level contribution accounting with preserved source provenance and direct bank NEFT credits
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 font-mono">
                  {activeSettlement.farmerBreakdown.length} Participating Farmer{activeSettlement.farmerBreakdown.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Farmer & Location</th>
                      <th className="p-3">Volume</th>
                      <th className="p-3">Agreed Rate</th>
                      <th className="p-3">Gross Value</th>
                      <th className="p-3">Net Realization (89%)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Bank UTR</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {activeSettlement.farmerBreakdown.map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <strong className="text-slate-900 block font-semibold">{farmer.farmerName}</strong>
                          <span className="text-[11px] text-slate-400">{farmer.farmerLocation}</span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-800">
                          {farmer.collectedQuantityKg.toLocaleString()} kg
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          ₹{farmer.agreedPricePerKg}/kg
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          ₹{farmer.grossAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-sm text-emerald-800 block">
                            ₹{farmer.netFarmerAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{farmer.bankAccountMasked || 'Direct NEFT Account'}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            farmer.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {farmer.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {farmer.utrNumber || 'Awaiting Batch NEFT'}
                        </td>
                        <td className="p-3 text-right">
                          {farmer.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => handleSettleFarmer(activeSettlement.orderId, farmer.farmerId)}
                              disabled={Boolean(processingStage)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition shadow-xs"
                            >
                              Disburse
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3-Way Transparent Value Split Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Transparent Disbursement Split
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Farmer / FPO Share */}
              <div className="bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e5238] border border-emerald-600/30 rounded-xl p-5 sm:p-6 shadow-forest flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                      Farmer Net Realization
                    </span>
                    <span className="text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {activeSettlement.farmerRealizationPercentage}%
                    </span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                    ₹{activeSettlement.farmerAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 font-mono font-medium">
                    ₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg credited to farmer bank
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-emerald-800/40 text-xs font-medium text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isCompletedStatus(activeSettlement.status)
                      ? 'Disbursed via Instant Bank Escrow'
                      : 'Locked in Escrow — Disbursing in Pipeline'}
                  </span>
                </div>
              </div>

              {/* Logistics & Micro-Hub Share */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Logistics & Pre-cooling
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {((activeSettlement.logisticsAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    ₹{activeSettlement.logisticsAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    ₹{(activeSettlement.logisticsAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (Reefer + Micro-hub)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GreenTransit Cold Fleet & Micro-Hub</span>
                </div>
              </div>

              {/* Platform Coordination Share */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Platform Fee
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {((activeSettlement.platformAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    ₹{activeSettlement.platformAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    ₹{(activeSettlement.platformAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (AI forecast, match & QR)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Covers AI Engine & Blockchain Ledger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Mandi vs Uzhavan Connect Net Comparison */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-6 sm:p-7 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h5 className="text-xs font-medium uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Measurable Economic Gain for Smallholder Farmers</span>
              </h5>
              <span className="text-xs font-medium text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                +{activeSettlement.earningsGainPercentage}% Extra Net Realization
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-5 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
                  Traditional 5-Tier Mandi Intermediary Outcome:
                </span>
                <p className="text-xl font-semibold text-slate-700 tracking-tight mt-1">
                  ₹{activeSettlement.traditionalFarmerEarnings.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    (₹{(activeSettlement.traditionalFarmerEarnings / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
                  Farmer receives less than half due to multi-tier commissions, local aggregators, and 22% spoilage cuts.
                </p>
              </div>

              <div className="bg-white p-5 rounded-lg border border-emerald-300 shadow-xs">
                <span className="text-emerald-800 font-semibold text-[11px] uppercase tracking-wider block">
                  Uzhavan Connect Direct Realization:
                </span>
                <p className="text-2xl font-semibold text-emerald-800 tracking-tight mt-1">
                  ₹{activeSettlement.farmerAmount.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-emerald-600 font-mono">
                    (₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                  Farmer receives +₹{(activeSettlement.farmerAmount - activeSettlement.traditionalFarmerEarnings).toLocaleString()} additional direct cash for this harvest!
                </p>
              </div>
            </div>
          </div>

          {/* Banking Audit Trail */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600">
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Bank UTR Reference</span>
              <strong className="text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono text-xs">
                {activeSettlement.utrNumber}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Settlement Status</span>
              <strong className="text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-mono text-xs">
                {activeSettlement.status}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Batch Provenance</span>
              <button
                onClick={() => openPassportModal(activeSettlement.batchId)}
                className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono text-xs hover:bg-emerald-100 transition flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>{activeSettlement.batchId}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
