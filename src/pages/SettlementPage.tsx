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
  QrCode,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { KPIGrid, KPIStatCard } from '../components/KPIGrid';

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

  const { t } = useLanguage();

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
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('settlement.title', 'Settlement & Net Realization')}
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed font-normal">
              {t('settlement.subtitle', 'Transparent automated escrow disbursement triggered upon buyer dockside delivery signoff. 89% direct farmer realization, zero middlemen commissions, zero 90-day credit lag.')}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#01472e]" />
              <span>{downloading ? t('settlement.exportingPdf', 'Exporting PDF...') : t('settlement.downloadInvoice', 'Download Tax Invoice')}</span>
            </button>
          </div>
        </div>
      </div>


      {/* Aggregate KPI Strip */}
      <KPIGrid columns={3}>
        <KPIStatCard
          label={t('settlement.totalSettledPayouts', 'Total Settled Payouts')}
          value={`₹${totalSettledAmount.toLocaleString()}`}
          icon={CheckCircle2}
          iconColor="text-[#01472e]"
          iconBg="bg-[#eaf4ec]"
          valueColor="text-[#01472e]"
          subtitle={`${settlements.filter((s) => isCompletedStatus(s.status)).length} ${t('settlement.transactionsCompleted', 'Transactions Completed')}`}
        />
        <KPIStatCard
          label={t('settlement.pendingEscrow', 'Locked in Escrow (Awaiting Payout)')}
          value={`₹${totalPendingAmount.toLocaleString()}`}
          icon={Clock}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
          valueColor="text-amber-700"
          subtitle={`${settlements.filter((s) => !isCompletedStatus(s.status)).length} ${t('settlement.ordersInPipeline', 'Orders in Settlement Pipeline')}`}
        />
        <KPIStatCard
          label={t('settlement.avgRealization', 'Average Farmer Net Realization')}
          value="88.9%"
          icon={TrendingUp}
          iconColor="text-[#01472e]"
          iconBg="bg-[#eaf4ec]"
          valueColor="text-[#01472e]"
          subtitle={t('settlement.mandiComparison', 'vs. 45-55% Traditional Mandi APMC Realization')}
        />
      </KPIGrid>

      {/* Settlement Records List & Detail Container */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#01472e]">{t('common.filter', 'Filter')}:</span>
            <div className="inline-flex bg-white p-1 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
              {[
                { id: 'ALL', label: t('settlement.allSettlements', 'All Settlements'), icon: Layers },
                { id: 'IN_PROGRESS', label: t('settlement.inSettlement', 'In Settlement'), icon: Clock },
                { id: 'COMPLETED', label: t('common.completed', 'Completed'), icon: CheckCircle2 }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = filterStatus === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFilterStatus(item.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#01472e] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#01472e]'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-[#fefae0]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium font-mono">
            {t('settlement.showingRecords', 'Showing {count} of {total} Escrow Records', { count: filteredSettlements.length, total: settlements.length })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredSettlements.map((s) => {
            const isSelected = activeSettlement?.id === s.id;
            const isDone = isCompletedStatus(s.status);
            const farmerCount = s.farmerBreakdown?.length || 1;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedSettlementId(s.id)}
                className={`p-6 rounded-3xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#01472e] bg-white ring-2 ring-[#01472e]/20 shadow-soft -translate-y-0.5'
                    : 'border-[#ccd5ae]/50 bg-[#faf9f5] hover:border-[#a3b18a] hover:bg-white shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                      {s.orderId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {t('orderStatus.' + s.status, s.status)}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 tracking-tight">
                    {s.crop} • <span className="font-mono text-[#01472e]">{s.quantityKg.toLocaleString()} kg</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {t('settlement.beneficiary', 'Beneficiary')}: <strong className="text-slate-900 font-bold">{s.farmerOrFpoName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {farmerCount} {t('settlement.participatingFarmers', 'Participating Member Farmers')}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#ccd5ae]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">{t('settlement.netPayout', 'Net Payout')}</span>
                    <span className="text-base font-bold font-mono text-[#01472e]">₹{s.farmerAmount.toLocaleString()}</span>
                  </div>

                  {!isDone ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstantPayout(s.orderId);
                      }}
                      disabled={processingStage === 'instant'}
                      className="btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {processingStage === 'instant' ? t('common.processing', 'Processing...') : t('settlement.disburse', 'Disburse')}
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-[#01472e] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" />
                      <span>{t('common.completed', 'Settled')}</span>
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
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#ccd5ae]/30">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs text-slate-500 font-bold uppercase tracking-wider bg-[#faf9f5] px-2.5 py-0.5 rounded border border-[#ccd5ae]/40">
                  {t('orders.orderId', 'Order ID')}: {activeSettlement.orderId}
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCompletedStatus(activeSettlement.status)
                      ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                      : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  }`}
                >
                  {t('settlement.escrow', 'ESCROW')}: {t('orderStatus.' + activeSettlement.status, activeSettlement.status)}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
                {activeSettlement.crop} • <span className="font-mono text-[#01472e]">{activeSettlement.quantityKg.toLocaleString()} kg</span>
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                {t('orders.buyer', 'Buyer')}: <strong className="text-slate-800">{activeSettlement.buyerName}</strong> ➔ {t('settlement.beneficiary', 'Beneficiary')}: <strong className="text-slate-800">{activeSettlement.farmerOrFpoName}</strong>
              </p>
            </div>

            <div className="text-right flex flex-col md:items-end gap-1.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-0.5">
                  {t('settlement.totalLandedValue', 'Total Landed Order Value')}
                </span>
                <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#01472e]">
                  ₹{activeSettlement.totalOrderValue.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block font-medium font-mono mt-0.5">
                  @ ₹{(activeSettlement.totalOrderValue / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg {t('settlement.landed', 'Landed')}
                </span>
              </div>

              {!isCompletedStatus(activeSettlement.status) && (
                <button
                  onClick={() => handleInstantPayout(activeSettlement.orderId)}
                  disabled={Boolean(processingStage)}
                  className="mt-2 flex items-center gap-2 btn-primary py-2.5 px-5 text-xs font-semibold rounded-2xl shadow-soft cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fefae0]" />
                  <span>
                    {processingStage === 'instant'
                      ? t('settlement.executingPayout', 'Executing Automated Payout...')
                      : `${t('settlement.instantPayout', 'Instant 1-Click Payout')} (₹${activeSettlement.farmerAmount.toLocaleString()})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Interactive Workflow Stepper */}
          <div className="bg-[#faf9f5] rounded-3xl border border-[#ccd5ae]/50 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#01472e] uppercase tracking-wider">
                {t('settlement.pipelineTitle', 'Connected Escrow Execution Pipeline')}
              </span>
              <span className="text-xs font-bold text-[#01472e] font-mono">
                {t('settlement.stageOf', 'Stage {stage} of 5', { stage: Math.min(5, currentStageNum) })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                {
                  stage: 1,
                  title: t('settlement.stage1Title', 'Buyer Delivery Verified'),
                  subtitle: t('settlement.stage1Desc', 'Dockside inspection signoff'),
                  isDone: true,
                  isActive: false
                },
                {
                  stage: 2,
                  title: t('settlement.stage2Title', 'Buyer Payment Recorded'),
                  subtitle: activeSettlement.buyerPaymentReference || t('settlement.stage2Desc', 'Escrow deposit funding'),
                  isDone: currentStageNum >= 2,
                  isActive: currentStageNum === 1
                },
                {
                  stage: 3,
                  title: t('settlement.stage3Title', 'FPO & Transport Share'),
                  subtitle: t('settlement.stage3Desc', '8% Cold-chain allocation'),
                  isDone: currentStageNum >= 3,
                  isActive: currentStageNum === 2
                },
                {
                  stage: 4,
                  title: t('settlement.stage4Title', 'Farmer Net Direct Payout'),
                  subtitle: t('settlement.stage4Desc', '89% direct NEFT / e-RUPI'),
                  isDone: currentStageNum >= 5,
                  isActive: currentStageNum === 3 || currentStageNum === 4
                },
                {
                  stage: 5,
                  title: t('settlement.stage5Title', 'Transaction Completed'),
                  subtitle: t('settlement.stage5Desc', 'Escrow closed with audit UTR'),
                  isDone: currentStageNum >= 6,
                  isActive: currentStageNum === 5
                }
              ].map((st) => (
                <div
                  key={st.stage}
                  className={`p-4 rounded-2xl border text-xs transition-all space-y-1 shadow-2xs ${
                    st.isDone
                      ? 'bg-[#eaf4ec] border-[#a3b18a]/60 text-[#01472e]'
                      : st.isActive
                      ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-300/50'
                      : 'bg-white border-[#ccd5ae]/40 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono">{t('common.step', 'STEP')} {st.stage}</span>
                    {st.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" />}
                  </div>
                  <p className="font-bold text-xs leading-tight text-slate-900">{st.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{st.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Stage Action Controls */}
            <div className="pt-3 border-t border-[#ccd5ae]/30 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-medium">
                {currentStageNum === 1 && t('settlement.actionStage1', 'Action required: Record buyer payment / escrow deposit.')}
                {currentStageNum === 2 && t('settlement.actionStage2', 'Action required: Process 8% FPO and cold-chain logistics allocation.')}
                {currentStageNum === 3 && t('settlement.actionStage3', 'Action required: Initiate direct NEFT batch payouts to member farmers.')}
                {currentStageNum === 4 && t('settlement.actionStage4', 'Action required: Finalize remaining farmer payouts.')}
                {currentStageNum === 5 && t('settlement.actionStage5', 'Action required: Finalize and close the escrow transaction ledger.')}
                {currentStageNum >= 6 && t('settlement.actionCompleted', '✓ All funds disbursed. Transaction completed and verified.')}
              </span>

              <div className="flex items-center gap-2">
                {currentStageNum === 1 && (
                  <button
                    onClick={() => handleRecordPayment(activeSettlement.orderId)}
                    disabled={processingStage === 'buyer-pay'}
                    className="btn-primary text-xs py-2 px-4 rounded-xl shadow-soft font-semibold"
                  >
                    {processingStage === 'buyer-pay' ? t('common.processing', 'Recording...') : t('settlement.recordBuyerPayment', 'Record Buyer Payment →')}
                  </button>
                )}

                {currentStageNum === 2 && (
                  <button
                    onClick={() => handleProcessFpo(activeSettlement.orderId)}
                    disabled={processingStage === 'fpo-process'}
                    className="btn-primary text-xs py-2 px-4 rounded-xl shadow-soft font-semibold"
                  >
                    {processingStage === 'fpo-process' ? t('common.processing', 'Processing...') : t('settlement.processFpoLogistics', 'Process FPO & Logistics (8%) →')}
                  </button>
                )}

                {(currentStageNum === 3 || currentStageNum === 4) && (
                  <button
                    onClick={() => handleSettleFarmer(activeSettlement.orderId)}
                    disabled={Boolean(processingStage)}
                    className="btn-primary text-xs py-2 px-4 rounded-xl shadow-soft font-semibold"
                  >
                    {processingStage === 'farmer-all' ? t('settlement.disbursing', 'Disbursing...') : t('settlement.disburseAllFarmers', 'Disburse All Farmers (89%) →')}
                  </button>
                )}

                {currentStageNum === 5 && (
                  <button
                    onClick={() => handleCompleteLedger(activeSettlement.orderId)}
                    disabled={processingStage === 'complete'}
                    className="btn-primary text-xs py-2 px-4 rounded-xl shadow-soft font-semibold"
                  >
                    {processingStage === 'complete' ? t('settlement.closing', 'Closing...') : t('settlement.closeFinalize', 'Close & Finalize Transaction')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Farmer Member Settlement Ledger Table */}
          {activeSettlement.farmerBreakdown && activeSettlement.farmerBreakdown.length > 0 && (
            <div className="bg-[#faf9f5] rounded-3xl border border-[#ccd5ae]/50 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ccd5ae]/40 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-[#01472e] text-xs font-bold uppercase tracking-wider mb-1">
                    <Users className="w-3.5 h-3.5 text-[#01472e]" />
                    <span>{t('settlement.memberAccounting', 'Member Farm Granular Accounting')}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                    {t('settlement.multiFarmerLedger', 'Multi-Farmer Settlement Ledger')}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal">
                    {t('settlement.multiFarmerDesc', 'Farmer-level contribution accounting with preserved source provenance and direct bank NEFT credits')}
                  </p>
                </div>
                <span className="text-xs font-bold text-[#01472e] bg-white px-3.5 py-1 rounded-xl border border-[#ccd5ae]/50 font-mono">
                  {activeSettlement.farmerBreakdown.length} {t('settlement.participatingFarmers', 'Participating Farmers')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white/80 border-b border-[#ccd5ae]/40 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">{t('settlement.colFarmerLocation', 'Farmer & Location')}</th>
                      <th className="p-3">{t('common.quantity', 'Volume')}</th>
                      <th className="p-3">{t('settlement.colAgreedRate', 'Agreed Rate')}</th>
                      <th className="p-3">{t('settlement.colGrossValue', 'Gross Value')}</th>
                      <th className="p-3">{t('settlement.colNetRealization', 'Net Realization (89%)')}</th>
                      <th className="p-3">{t('common.status', 'Status')}</th>
                      <th className="p-3">{t('settlement.colBankUtr', 'Bank UTR')}</th>
                      <th className="p-3 text-right">{t('common.actions', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ccd5ae]/30 bg-white">
                    {activeSettlement.farmerBreakdown.map((farmer, idx) => (
                      <tr key={idx} className="hover:bg-[#faf9f5] transition">
                        <td className="p-3">
                          <strong className="text-slate-900 block font-bold">{farmer.farmerName}</strong>
                          <span className="text-[11px] text-slate-400">{farmer.farmerLocation}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {farmer.collectedQuantityKg.toLocaleString()} kg
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">
                          ₹{farmer.agreedPricePerKg}/kg
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          ₹{farmer.grossAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-sm text-[#01472e] block font-mono">
                            ₹{farmer.netFarmerAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{farmer.bankAccountMasked || t('settlement.directNeftAccount', 'Direct NEFT Account')}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            farmer.status === 'COMPLETED'
                              ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {t('orderStatus.' + farmer.status, farmer.status)}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {farmer.utrNumber || t('settlement.awaitingBatchNeft', 'Awaiting Batch NEFT')}
                        </td>
                        <td className="p-3 text-right">
                          {farmer.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => handleSettleFarmer(activeSettlement.orderId, farmer.farmerId)}
                              disabled={Boolean(processingStage)}
                              className="btn-primary px-3 py-1 text-[11px] font-semibold rounded-lg shadow-xs cursor-pointer"
                            >
                              {t('settlement.disburse', 'Disburse')}
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-[#01472e] flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#01472e]" />
                              <span>{t('settlement.paid', 'Paid')}</span>
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
            <h4 className="text-xs font-bold text-[#01472e] uppercase tracking-wider mb-4">
              {t('settlement.disbursementSplit', 'Transparent Disbursement Split')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Farmer / FPO Share */}
              <div className="bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] border border-[#a3b18a]/30 rounded-3xl p-6 sm:p-7 shadow-forest flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#fefae0] uppercase tracking-wider">
                      {t('settlement.farmerNetRealization', 'Farmer Net Realization')}
                    </span>
                    <span className="text-xs font-bold bg-[#fefae0]/15 text-[#fefae0] border border-[#fefae0]/25 px-2.5 py-0.5 rounded-full">
                      {activeSettlement.farmerRealizationPercentage}%
                    </span>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
                    ₹{activeSettlement.farmerAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-100/80 mt-2 font-mono font-medium">
                    ₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg {t('settlement.creditedToFarmerBank', 'credited to farmer bank')}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-emerald-800/40 text-xs font-semibold text-[#fefae0] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>
                    {isCompletedStatus(activeSettlement.status)
                      ? t('settlement.disbursedViaEscrow', 'Disbursed via Instant Bank Escrow')
                      : t('settlement.lockedInEscrowPipeline', 'Locked in Escrow — Disbursing in Pipeline')}
                  </span>
                </div>
              </div>

              {/* Logistics & Micro-Hub Share */}
              <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('settlement.logisticsShare', 'Logistics & Pre-cooling')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/40">
                      {((activeSettlement.logisticsAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
                    ₹{activeSettlement.logisticsAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    ₹{(activeSettlement.logisticsAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg ({t('settlement.reeferMicroHub', 'Reefer + Micro-hub')})
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#ccd5ae]/30 text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#01472e] shrink-0" />
                  <span>{t('settlement.greenTransitFleet', 'GreenTransit Cold Fleet & Micro-Hub')}</span>
                </div>
              </div>

              {/* Platform Coordination Share */}
              <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('settlement.platformFee', 'Platform Fee')}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-[#ccd5ae]/40">
                      {((activeSettlement.platformAmount / (activeSettlement.totalOrderValue || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
                    ₹{activeSettlement.platformAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    ₹{(activeSettlement.platformAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg ({t('settlement.aiEngineMatch', 'AI forecast, match & QR')})
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#ccd5ae]/30 text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#01472e] shrink-0" />
                  <span>{t('settlement.coversAiEngine', 'Covers AI Engine & Blockchain Ledger')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Traditional Mandi vs Uzhavan Connect Net Comparison */}
          <div className="bg-[#eaf4ec]/60 border border-[#a3b18a]/50 rounded-3xl p-6 sm:p-8 mt-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#01472e] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#01472e]" />
                <span>{t('settlement.economicGainTitle', 'Measurable Economic Gain for Smallholder Farmers')}</span>
              </h5>
              <span className="text-xs font-bold text-[#01472e] bg-white border border-[#a3b18a]/40 px-3.5 py-1 rounded-full shadow-2xs">
                +{activeSettlement.earningsGainPercentage}% {t('settlement.extraNetRealization', 'Extra Net Realization')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ccd5ae]/40 shadow-xs">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                  {t('settlement.traditionalMandiOutcome', 'Traditional 5-Tier Mandi Intermediary Outcome')}:
                </span>
                <p className="text-xl sm:text-2xl font-bold font-mono text-slate-700 tracking-tight mt-1">
                  ₹{activeSettlement.traditionalFarmerEarnings.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    (₹{(activeSettlement.traditionalFarmerEarnings / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
                  {t('settlement.traditionalMandiOutcomeDesc', 'Farmer receives less than half due to multi-tier commissions, local aggregators, and 22% spoilage cuts.')}
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#01472e] shadow-soft">
                <span className="text-[#01472e] font-bold text-[11px] uppercase tracking-wider block">
                  {t('settlement.uzhavanDirectRealization', 'Uzhavan Connect Direct Realization')}:
                </span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-[#01472e] tracking-tight mt-1">
                  ₹{activeSettlement.farmerAmount.toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-[#01472e]/70 font-mono">
                    (₹{(activeSettlement.farmerAmount / (activeSettlement.quantityKg || 1)).toFixed(2)} / kg)
                  </span>
                </p>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-semibold">
                  {t('settlement.directCashBonus', 'Farmer receives +₹{extra} additional direct cash for this harvest!', { extra: (activeSettlement.farmerAmount - activeSettlement.traditionalFarmerEarnings).toLocaleString() })}
                </p>
              </div>
            </div>
          </div>

          {/* Banking Audit Trail */}
          <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600 shadow-xs">
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block mb-0.5">{t('settlement.bankUtrReference', 'Bank UTR Reference')}</span>
              <strong className="text-slate-900 bg-white px-3 py-1 rounded-xl border border-[#ccd5ae]/40 font-mono text-xs">
                {activeSettlement.utrNumber}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block mb-0.5">{t('settlement.settlementStatus', 'Settlement Status')}</span>
              <strong className="text-[#01472e] bg-white px-3 py-1 rounded-xl border border-[#ccd5ae]/40 font-mono text-xs font-bold">
                {t('orderStatus.' + activeSettlement.status, activeSettlement.status)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block mb-0.5">{t('traceability.batchProvenance', 'Batch Provenance')}</span>
              <button
                onClick={() => openPassportModal(activeSettlement.batchId)}
                className="text-[#01472e] bg-[#eaf4ec] px-3 py-1 rounded-xl border border-[#a3b18a]/50 font-mono text-xs hover:bg-white transition flex items-center gap-1.5 cursor-pointer font-bold shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-[#01472e]" />
                <span>{activeSettlement.batchId}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
