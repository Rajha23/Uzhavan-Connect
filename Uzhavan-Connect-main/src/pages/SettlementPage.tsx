import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_SETTLEMENT } from '../data/mockData';
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
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettlementPage: React.FC = () => {
  const { openPassportModal, setActiveTab } = useApp();
  const settle = DEMO_SETTLEMENT;

  const [downloading, setDownloading] = useState(false);

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
            Instant digital payout triggered upon delivery acceptance. Zero hidden commission deductions, zero mandi cess deductions, zero delayed 90-day credit lag.
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

      {/* Main Order Value & 85.9% Realization Banner */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-olive/30">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-forest/50 font-bold uppercase tracking-widest">Order ID: {settle.orderId}</span>
              <span className="text-forest/30">•</span>
              <span className="text-[10px] bg-sage text-forest font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-sage/50">
                STATUS: {settle.status}
              </span>
            </div>
            <h3 className="text-3xl font-anton text-forest mt-3 tracking-wide">
              {settle.crop} • {settle.quantityKg.toLocaleString()} kg
            </h3>
            <p className="text-sm font-medium text-forest/70 mt-1">
              Buyer: {settle.buyerName} ➔ Beneficiary: {settle.farmerOrFpoName}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest font-bold text-forest/50 block mb-1">Total Order Value</span>
            <span className="text-5xl font-anton text-forest tracking-wide">
              ₹{settle.totalOrderValue.toLocaleString()}
            </span>
            <span className="text-xs text-forest/70 block font-bold font-mono mt-1">
              @ ₹{(settle.totalOrderValue / settle.quantityKg).toFixed(2)} / kg Landed
            </span>
          </div>
        </div>

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
                    {settle.farmerRealizationPercentage}%
                  </span>
                </div>
                <p className="text-4xl font-anton text-cream tracking-wide">
                  ₹{settle.farmerAmount.toLocaleString()}
                </p>
                <p className="text-xs text-cream/70 mt-2 font-mono font-bold">
                  ₹{(settle.farmerAmount / settle.quantityKg).toFixed(2)} / kg credited to farmer bank
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-sage/20 text-[10px] font-bold uppercase tracking-widest text-cream/90 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                <span>Credited via Instant Bank Escrow</span>
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
                    10.9%
                  </span>
                </div>
                <p className="text-3xl font-anton text-forest tracking-wide">
                  ₹{settle.logisticsAmount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mt-2">
                  ₹{(settle.logisticsAmount / settle.quantityKg).toFixed(2)} / kg (Reefer + Micro-hub)
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-olive/30 text-[10px] font-bold uppercase tracking-widest text-forest/70 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                <span>GreenTransit Cold Fleet</span>
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
                    3.1%
                  </span>
                </div>
                <p className="text-3xl font-anton text-forest tracking-wide">
                  ₹{settle.platformAmount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest/50 mt-2">
                  ₹{(settle.platformAmount / settle.quantityKg).toFixed(2)} / kg (AI forecast, match & QR)
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-olive/30 text-[10px] font-bold uppercase tracking-widest text-forest/70 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                <span>Covers Software & Cloud Infra</span>
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
              +{settle.earningsGainPercentage}% Extra Earnings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-cream/50 p-6 rounded-[1.5rem] border border-olive/30">
              <span className="text-forest/70 text-[10px] font-bold uppercase tracking-widest block">Traditional 5-Tier Mandi Intermediary Outcome:</span>
              <p className="text-2xl font-anton text-forest/70 tracking-wide mt-2">₹48,000 <span className="text-sm font-bold text-forest/50 font-mono">(₹16.00 / kg)</span></p>
              <p className="text-xs font-medium text-forest/60 mt-2">
                Farmer receives less than half due to commissions, local traders, and 22% spoilage cuts.
              </p>
            </div>

            <div className="bg-cream p-6 rounded-[1.5rem] border border-forest shadow-sm">
              <span className="text-forest font-bold text-[10px] uppercase tracking-widest block">Uzhavan Connect Coordinated Outcome:</span>
              <p className="text-3xl font-anton text-forest tracking-wide mt-2">₹82,500 <span className="text-sm font-bold text-forest/70 font-mono">(₹27.50 / kg)</span></p>
              <p className="text-xs text-forest mt-2 font-medium">
                Farmer receives +₹34,500 additional cash in hand for the same 3,000 kg harvest!
              </p>
            </div>
          </div>
        </div>

        {/* Banking Audit Trail */}
        <div className="bg-olive/10 border border-olive/30 rounded-[1.5rem] p-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-forest/70">
          <div>
            <span>Bank UTR: </span>
            <strong className="text-forest bg-cream px-3 py-1.5 rounded-[1rem] border border-olive/30 font-mono text-xs">{settle.utrNumber}</strong>
          </div>
          <div>
            <span>Timestamp: </span>
            <strong className="text-forest bg-cream px-3 py-1.5 rounded-[1rem] border border-olive/30 font-mono text-xs">{settle.settlementDate}</strong>
          </div>
          <div>
            <span>Batch ID: </span>
            <button
              onClick={() => openPassportModal(settle.batchId)}
              className="text-forest bg-sage/30 px-3 py-1.5 rounded-[1rem] border border-sage/50 font-mono text-xs hover:bg-sage/50 transition"
            >
              {settle.batchId}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
