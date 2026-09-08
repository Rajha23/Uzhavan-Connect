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
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-2">
            <CreditCard className="w-4 h-4" />
            <span>Automated Escrow Disbursement Ledger</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Settlement & Net Realization
          </h1>
          <p className="text-sm text-cream/70 mt-3 max-w-2xl leading-relaxed font-medium">
            Transparent automated escrow disbursement triggered upon buyer dockside delivery signoff. 89% direct farmer realization, zero middlemen commissions, zero 90-day credit lag.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-[10px] uppercase tracking-widest font-bold px-6 py-3.5 rounded-[1rem] shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Exporting PDF...' : 'Download Tax Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Prototype Escrow Architecture Safety Notice */}
      <div className="bg-amber-50 border border-amber-300 rounded-[1.8rem] p-5 flex items-start gap-4 text-xs text-amber-950 shadow-xs">
        <div className="p-2.5 bg-amber-100 rounded-xl border border-amber-300 shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-800" />
        </div>
        <div className="space-y-1">
          <strong className="text-sm font-bold text-amber-900 block font-['Outfit']">
            Prototype Architecture & Honest Operational Scope
          </strong>
          <p className="leading-relaxed text-[11px] text-amber-900/90 font-medium">
            This module provides a connected, prototype-safe simulation of the <strong>RBI UPI e-RUPI programmable escrow ledger</strong>.
            No live commercial banking gateway is integrated. All simulated UTR numbers, settlement splits (89% farmer / 8% logistics / 3% platform),
            and multi-farmer contributions reflect actual application orders and verifiable accounting rules.
          </p>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-cream rounded-[1.5rem] border border-olive/30 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60 block mb-1">
            Total Settled Payouts
          </span>
          <p className="text-3xl font-anton text-forest tracking-wide">
            ₹{totalSettledAmount.toLocaleString()}
          </p>
          <span className="text-xs text-forest/70 font-semibold mt-1 block">
            {settlements.filter((s) => isCompletedStatus(s.status)).length} Transactions Completed
          </span>
        </div>

        <div className="bg-cream rounded-[1.5rem] border border-olive/30 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60 block mb-1">
            Locked in Escrow (Awaiting Payout)
          </span>
          <p className="text-3xl font-anton text-amber-700 tracking-wide">
            ₹{totalPendingAmount.toLocaleString()}
          </p>
          <span className="text-xs text-amber-800/80 font-semibold mt-1 block">
            {settlements.filter((s) => !isCompletedStatus(s.status)).length} Orders in Settlement Pipeline
          </span>
        </div>

        <div className="bg-cream rounded-[1.5rem] border border-olive/30 p-6 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60 block mb-1">
            Average Farmer Net Realization
          </span>
          <p className="text-3xl font-anton text-forest tracking-wide">
            88.9%
          </p>
          <span className="text-xs text-forest/70 font-semibold mt-1 block">
            vs. 45-55% Traditional Mandi APMC Realization
          </span>
        </div>
      </div>

      {/* Settlements List & Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-forest/70">Filter Settlements:</span>
            <div className="inline-flex bg-olive/10 p-1 rounded-[1rem] border border-olive/20">
              {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-[0.8rem] text-[10px] font-bold uppercase tracking-widest transition ${
                    filterStatus === st
                      ? 'bg-forest text-cream shadow-xs'
                      : 'text-forest/70 hover:text-forest'
                  }`}
                >
                  {st === 'IN_PROGRESS' ? 'In Settlement' : st}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-forest/60 font-medium font-mono">
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
                className={`p-5 rounded-[1.5rem] border text-left cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-forest bg-sage/10 ring-2 ring-forest/20 shadow-md'
                    : 'border-olive/30 bg-cream hover:border-olive hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-forest/60 uppercase">
                      {s.orderId}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-sage text-forest border-sage/60'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <h4 className="font-anton text-xl text-forest tracking-wide">
                    {s.crop} • {s.quantityKg.toLocaleString()} kg
                  </h4>
                  <p className="text-xs text-forest/70 font-medium mt-1">
                    Beneficiary: <strong className="text-forest">{s.farmerOrFpoName}</strong>
                  </p>
                  <p className="text-[10px] text-forest/50 mt-0.5">
                    {farmerCount} Participating Member Farmer{farmerCount > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-olive/20 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-forest/50 block">Net Payout</span>
                    <span className="text-lg font-anton text-forest">₹{s.farmerAmount.toLocaleString()}</span>
                  </div>

                  {!isDone ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstantPayout(s.orderId);
                      }}
                      disabled={processingStage === 'instant'}
                      className="px-3 py-1.5 bg-forest hover:bg-[#023120] text-cream text-[10px] font-bold uppercase tracking-widest rounded-[0.8rem] shadow-sm transition"
                    >
                      {processingStage === 'instant' ? 'Processing...' : 'Disburse'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1">
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
        <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-olive/30">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-forest/50 font-bold uppercase tracking-widest">
                  Order ID: {activeSettlement.orderId}
                </span>
                <span className="text-forest/30">•</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isCompletedStatus(activeSettlement.status)
                      ? 'bg-sage text-forest border-sage/50'
                      : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  }`}
                >
                  ESCROW STATUS: {activeSettlement.status}
                </span>
              </div>
              <h3 className="text-3xl font-anton text-forest mt-3 tracking-wide">
                {activeSettlement.crop} • {activeSettlement.quantityKg.toLocaleString()} kg
              </h3>
              <p className="text-sm font-medium text-forest/70 mt-1">
                Buyer: <strong>{activeSettlement.buyerName}</strong> ➔ Beneficiary: <strong>{activeSettlement.farmerOrFpoName}</strong>
              </p>
            </div>

            <div className="text-right flex flex-col md:items-end gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-forest/50 block mb-1">
                  Total Landed Order Value
                </span>
                <span className="text-5xl font-anton text-forest tracking-wide">
                  ₹{activeSettlement.totalOrderValue.toLocaleString()}
                </span>
                <span className="text-xs text-forest/70 block font-bold font-mono mt-1">
                  @ ₹{(activeSettlement.totalOrderValue / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg Landed
                </span>
              </div>

              {!isCompletedStatus(activeSettlement.status) && (
                <button
                  onClick={() => handleInstantPayout(activeSettlement.orderId)}
                  disabled={Boolean(processingStage)}
                  className="mt-2 flex items-center gap-2 px-6 py-3 bg-forest hover:bg-[#023120] text-cream text-xs font-bold uppercase tracking-widest rounded-[1rem] shadow-forest transition"
                >
                  <Sparkles className="w-4 h-4 text-sage" />
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
          <div className="bg-white/80 rounded-[2rem] border border-olive/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-forest/60 uppercase tracking-widest">
                Connected Escrow Execution Pipeline
              </span>
              <span className="text-xs font-bold text-forest font-mono">
                Stage {Math.min(5, currentStageNum)} of 5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
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
                  className={`p-3.5 rounded-2xl border text-xs transition space-y-1 ${
                    st.isDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : st.isActive
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono">STEP {st.stage}</span>
                    {st.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <p className="font-bold text-xs leading-tight">{st.title}</p>
                  <p className="text-[10px] opacity-75 truncate">{st.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Stage Action Controls */}
            <div className="pt-3 border-t border-olive/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-forest/70 font-medium">
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
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-cream font-bold text-xs rounded-xl transition shadow-sm uppercase tracking-wider"
                  >
                    {processingStage === 'buyer-pay' ? 'Recording...' : 'Record Buyer Payment →'}
                  </button>
                )}

                {currentStageNum === 2 && (
                  <button
                    onClick={() => handleProcessFpo(activeSettlement.orderId)}
                    disabled={processingStage === 'fpo-process'}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-cream font-bold text-xs rounded-xl transition shadow-sm uppercase tracking-wider"
                  >
                    {processingStage === 'fpo-process' ? 'Processing...' : 'Process FPO & Logistics (8%) →'}
                  </button>
                )}

                {(currentStageNum === 3 || currentStageNum === 4) && (
                  <button
                    onClick={() => handleSettleFarmer(activeSettlement.orderId)}
                    disabled={Boolean(processingStage)}
                    className="px-4 py-2 bg-forest hover:bg-forest/90 text-cream font-bold text-xs rounded-xl transition shadow-sm uppercase tracking-wider"
                  >
                    {processingStage === 'farmer-all' ? 'Disbursing...' : 'Disburse All Farmers (89%) →'}
                  </button>
                )}

                {currentStageNum === 5 && (
                  <button
                    onClick={() => handleCompleteLedger(activeSettlement.orderId)}
                    disabled={processingStage === 'complete'}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-cream font-bold text-xs rounded-xl transition shadow-sm uppercase tracking-wider"
                  >
                    {processingStage === 'complete' ? 'Closing...' : 'Close & Finalize Transaction'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Farmer Member Settlement Ledger Table */}
          {activeSettlement.farmerBreakdown && activeSettlement.farmerBreakdown.length > 0 && (
            <div className="bg-cream rounded-[2rem] border border-olive/30 p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-olive/20 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-forest/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                    <Users className="w-3.5 h-3.5 text-forest" />
                    <span>Member Farm Granular Accounting</span>
                  </div>
                  <h4 className="text-xl font-anton text-forest tracking-wide">
                    Multi-Farmer Settlement Ledger
                  </h4>
                  <p className="text-xs text-forest/60 font-medium">
                    Farmer-level contribution accounting with preserved source provenance and direct bank NEFT credits
                  </p>
                </div>
                <span className="text-xs font-bold text-forest/70 bg-olive/15 px-3 py-1 rounded-full font-mono">
                  {activeSettlement.farmerBreakdown.length} Participating Farmer{activeSettlement.farmerBreakdown.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-olive/10 border-b border-olive/20 text-forest/70 font-bold uppercase tracking-widest text-[10px]">
                      <th className="p-3">Farmer & Location</th>
                      <th className="p-3">Volume Contributed</th>
                      <th className="p-3">Agreed Rate</th>
                      <th className="p-3">Gross Value</th>
                      <th className="p-3">Net Realization (89%)</th>
                      <th className="p-3">Disbursement Status</th>
                      <th className="p-3">Bank UTR Reference</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-olive/15">
                    {activeSettlement.farmerBreakdown.map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-olive/5 transition">
                        <td className="p-3">
                          <strong className="text-forest block font-bold">{farmer.farmerName}</strong>
                          <span className="text-[10px] text-forest/60">{farmer.farmerLocation}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-forest">
                          {farmer.collectedQuantityKg.toLocaleString()} kg
                        </td>
                        <td className="p-3 font-mono text-forest">
                          ₹{farmer.agreedPricePerKg}/kg
                        </td>
                        <td className="p-3 font-mono text-forest/70">
                          ₹{farmer.grossAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="font-anton text-base text-emerald-900 block">
                            ₹{farmer.netFarmerAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-forest/50 font-mono">{farmer.bankAccountMasked || 'Direct NEFT Account'}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            farmer.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {farmer.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-forest/70">
                          {farmer.utrNumber || 'Awaiting Batch NEFT'}
                        </td>
                        <td className="p-3 text-right">
                          {farmer.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => handleSettleFarmer(activeSettlement.orderId, farmer.farmerId)}
                              disabled={Boolean(processingStage)}
                              className="px-3 py-1 bg-forest hover:bg-forest/90 text-cream text-[10px] font-bold rounded-lg uppercase tracking-wider transition shadow-xs"
                            >
                              Disburse
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-800 flex items-center justify-end gap-1">
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
            <h4 className="text-[10px] font-bold text-forest/50 uppercase tracking-widest mb-6">
              Transparent Disbursement Split
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Farmer / FPO Share */}
              <div className="bg-forest border border-forest rounded-[1.5rem] p-6 shadow-forest flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-cream uppercase tracking-widest">
                      Farmer Net Realization
                    </span>
                    <span className="text-xs font-anton tracking-wide bg-sage text-forest px-3 py-1 rounded-[1rem]">
                      {activeSettlement.farmerRealizationPercentage}%
                    </span>
                  </div>
                  <p className="text-4xl font-anton text-cream tracking-wide">
                    ₹{activeSettlement.farmerAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-cream/70 mt-2 font-mono font-bold">
                    ₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg credited to farmer bank
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-sage/20 text-[10px] font-bold uppercase tracking-widest text-cream/90 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                  <span>
                    {isCompletedStatus(activeSettlement.status)
                      ? 'Disbursed via Instant Bank Escrow'
                      : 'Locked in Escrow — Disbursing in Pipeline'}
                  </span>
                </div>
              </div>

              {/* Logistics & Micro-Hub Share */}
              <div className="bg-olive/10 border border-olive/30 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-forest/70 uppercase tracking-widest">
                      Logistics & Pre-cooling
                    </span>
                    <span className="text-xs font-anton tracking-wide text-forest bg-sage/30 px-3 py-1 rounded-[1rem] border border-sage/50">
                      {((activeSettlement.logisticsAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-3xl font-anton text-forest tracking-wide">
                    ₹{activeSettlement.logisticsAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mt-2">
                    ₹{(activeSettlement.logisticsAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (Reefer + Micro-hub)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-olive/30 text-[10px] font-bold uppercase tracking-widest text-forest/70 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                  <span>GreenTransit Cold Fleet & Micro-Hub</span>
                </div>
              </div>

              {/* Platform Coordination Share */}
              <div className="bg-olive/10 border border-olive/30 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-forest/70 uppercase tracking-widest">
                      Uzhavan Connect Platform Fee
                    </span>
                    <span className="text-xs font-anton tracking-wide text-forest bg-sage/30 px-3 py-1 rounded-[1rem] border border-sage/50">
                      {((activeSettlement.platformAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-3xl font-anton text-forest tracking-wide">
                    ₹{activeSettlement.platformAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mt-2">
                    ₹{(activeSettlement.platformAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg (AI forecast, match & QR)
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-olive/30 text-[10px] font-bold uppercase tracking-widest text-forest/70 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                  <span>Covers AI Engine & Blockchain Ledger</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Mandi vs Uzhavan Connect Net Comparison */}
          <div className="bg-sage/20 border border-sage/40 rounded-[2.5rem] p-8 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h5 className="text-sm font-bold uppercase tracking-widest text-forest flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-forest" />
                <span>Measurable Economic Gain for Smallholder Farmers</span>
              </h5>
              <span className="text-sm font-anton tracking-wide text-cream bg-forest px-4 py-1.5 rounded-[1rem] shadow-sm">
                +{activeSettlement.earningsGainPercentage}% Extra Earnings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="bg-cream/50 p-6 rounded-[1.5rem] border border-olive/30">
                <span className="text-forest/70 text-[10px] font-bold uppercase tracking-widest block">
                  Traditional 5-Tier Mandi Intermediary Outcome:
                </span>
                <p className="text-2xl font-anton text-forest/70 tracking-wide mt-2">
                  ₹{activeSettlement.traditionalFarmerEarnings.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-forest/50 font-mono">
                    (₹{(activeSettlement.traditionalFarmerEarnings / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs font-medium text-forest/60 mt-2">
                  Farmer receives less than half due to commissions, local traders, and 22% spoilage cuts.
                </p>
              </div>

              <div className="bg-cream p-6 rounded-[1.5rem] border border-forest shadow-sm">
                <span className="text-forest font-bold text-[10px] uppercase tracking-widest block">
                  Uzhavan Connect Coordinated Outcome:
                </span>
                <p className="text-3xl font-anton text-forest tracking-wide mt-2">
                  ₹{activeSettlement.farmerAmount.toLocaleString()}{' '}
                  <span className="text-sm font-bold text-forest/70 font-mono">
                    (₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-forest mt-2 font-medium">
                  Farmer receives +₹{(activeSettlement.farmerAmount - activeSettlement.traditionalFarmerEarnings).toLocaleString()} additional cash in hand for the harvest!
                </p>
              </div>
            </div>
          </div>

          {/* Banking Audit Trail */}
          <div className="bg-olive/10 border border-olive/30 rounded-[1.5rem] p-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-forest/70">
            <div>
              <span>Bank UTR: </span>
              <strong className="text-forest bg-cream px-3 py-1.5 rounded-[1rem] border border-olive/30 font-mono text-xs">
                {activeSettlement.utrNumber}
              </strong>
            </div>
            <div>
              <span>Settlement Status: </span>
              <strong className="text-forest bg-cream px-3 py-1.5 rounded-[1rem] border border-olive/30 font-mono text-xs">
                {activeSettlement.status}
              </strong>
            </div>
            <div>
              <span>Batch ID: </span>
              <button
                onClick={() => openPassportModal(activeSettlement.batchId)}
                className="text-forest bg-sage/30 px-3 py-1.5 rounded-[1rem] border border-sage/50 font-mono text-xs hover:bg-sage/50 transition flex items-center gap-1"
              >
                <QrCode className="w-3 h-3" />
                <span>{activeSettlement.batchId}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
