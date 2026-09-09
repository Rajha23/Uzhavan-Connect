import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Layers,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Gavel,
  BadgeDollarSign,
  MapPin,
  Truck,
  QrCode,
  PackageCheck,
  CreditCard,
  BarChart3,
  ExternalLink
} from 'lucide-react';

export const SIHDemoModal: React.FC = () => {
  const {
    isDemoModeOpen,
    closeDemoMode,
    demoStep,
    nextDemoStep,
    prevDemoStep,
    setDemoStep,
    setActiveTab,
    openPassportModal
  } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying && isDemoModeOpen) {
      timer = setInterval(() => {
        if (demoStep < 13) {
          nextDemoStep();
        } else {
          setIsPlaying(false);
        }
      }, 5500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isDemoModeOpen, demoStep, nextDemoStep]);

  if (!isDemoModeOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Buyer Creates 3,000 kg Tomato Demand',
      role: 'Bulk Buyer',
      icon: ShoppingBag,
      color: 'blue',
      tab: 'dashboard',
      tagline: 'Procurement initiated with exact quality, delivery window & target price constraints.',
      summary: 'Institutional buyers (supermarkets, hospitality chains, consumer co-ops) publish forward demand rather than waiting for spot market arrivals. A request for 3,000 kg Grade A Tomato is published for Chennai.',
      keyData: [
        { label: 'Crop & Variety', val: 'Tomato (Pusa Ruby Hybrid)' },
        { label: 'Target Quantity', val: '3,000 kg' },
        { label: 'Quality Grade', val: 'Grade A (Brix > 4.5)' },
        { label: 'Delivery Location', val: 'Chennai Metro Hubs' },
        { label: 'Target Ceiling Price', val: '₹34.00 / kg' }
      ],
      insight: 'Demand-first architecture inverts the traditional push model: the supply chain only moves when demand is verified.'
    },
    {
      step: 2,
      title: 'System Pools Related Fragmented Demand',
      role: 'Demand Service',
      icon: Layers,
      color: 'indigo',
      tab: 'demand-pool',
      tagline: 'Small fragmented buyer orders aggregated into a high-volume single procurement pool.',
      summary: 'Uzhavan Connect combines FreshBazaar (1,000 kg), Grand Chola (500 kg), and TN Consumer Coop (1,500 kg) into a single 3,000 kg consolidated demand pool. This gives farmers institutional volume scale.',
      keyData: [
        { label: 'Pooled Buyers', val: '3 Institutional Entities' },
        { label: 'Total Pooled Volume', val: '3,000 kg' },
        { label: 'Target Fulfillment Date', val: '08 Sep 2026' },
        { label: 'Consolidation Gain', val: '18% lower handling overhead' }
      ],
      insight: 'Fragmented buyers no longer compete against each other or drive speculative prices up through multiple commission agents.'
    },
    {
      step: 3,
      title: 'AI Forecasts Near-Term Demand',
      role: 'Demand Intelligence',
      icon: TrendingUp,
      color: 'emerald',
      tab: 'demand-intel',
      tagline: '7-Day predictive machine learning incorporates seasonality, weather and price trends.',
      summary: 'Uzhavan Connect XGBoost + Seasonal ML model forecasts 8,500 kg total tomato demand in Chennai over the next 7 days, up 6.2% due to upcoming weekend festive demand.',
      keyData: [
        { label: 'Current Demand', val: '8,000 kg' },
        { label: 'Predicted 7-Day Demand', val: '8,500 kg' },
        { label: 'Confidence Score', val: '92.4%' },
        { label: 'Model Evaluation', val: 'MAPE 5.34% | RMSE 6.08' }
      ],
      insight: 'AI forecasting is grounded in measurable metrics, providing farmers and FPOs forward visibility 7-14 days before harvest.'
    },
    {
      step: 4,
      title: 'System Identifies Supply Gap',
      role: 'Demand Intelligence',
      icon: AlertTriangle,
      color: 'amber',
      tab: 'dashboard',
      tagline: 'Deficit signal broadcasted directly to farmer & FPO dashboards to mobilize supply.',
      summary: 'Total available verified supply in surrounding clusters is 6,900 kg against 8,500 kg predicted demand. The platform calculates a supply gap of 1,600 kg and sends a high-priority signal to farmers.',
      keyData: [
        { label: 'Available Supply', val: '6,900 kg' },
        { label: 'Supply Gap Deficit', val: '1,600 kg' },
        { label: 'Indicative Base Price', val: '₹28.00 / kg' },
        { label: 'Recommended Action', val: 'FPO member aggregation' }
      ],
      insight: 'Farmers know there is a 1,600 kg deficit in advance. They do not have to sell distressingly at local distress prices.'
    },
    {
      step: 5,
      title: 'Matching Engine Identifies Suitable FPOs',
      role: 'Matching Service',
      icon: UserCheck,
      color: 'teal',
      tab: 'reverse-auction',
      tagline: 'Multi-factor algorithm filters suppliers by distance, capacity, reliability & quality.',
      summary: 'Rather than selecting solely on price, the matching engine scans 3 registered FPO clusters in Sriperumbudur, Kanchipuram, and Tiruvallur, computing a weighted match score for each.',
      keyData: [
        { label: 'Matched Candidates', val: '3 FPO Cooperatives' },
        { label: 'Top Candidate', val: 'Sriperumbudur Agro FPO' },
        { label: 'Proximity Distance', val: '34 km to Chennai' },
        { label: 'Cluster Capacity', val: '3,000 kg Grade A ready' }
      ],
      insight: 'Constraint-aware filtering guarantees that selected suppliers are within perishability and transit limits.'
    },
    {
      step: 6,
      title: 'Reverse Auction Receives FPO Offers',
      role: 'FPO / Supplier Organization',
      icon: Gavel,
      color: 'purple',
      tab: 'reverse-auction',
      tagline: 'Eligible FPOs submit competitive transparent bids; ranked by Smart Match Score.',
      summary: 'FPOs submit bids with price, readiness time, and transport estimates. Sriperumbudur FPO bids ₹26.50/kg (Score: 94.2) and is selected over Kanchipuram (₹25.00/kg, Score: 87.6) due to shorter distance and superior cold-chain readiness.',
      keyData: [
        { label: 'Winning FPO', val: 'Sriperumbudur Agro FPO' },
        { label: 'FPO Farm Price', val: '₹26.50 / kg' },
        { label: 'Smart Match Score', val: '94.2 / 100' },
        { label: 'Reliability Score', val: '96% (Historical fulfilment)' }
      ],
      insight: 'Ranking includes logistics distance and reliability, ensuring lowest price does not fail due to spoiled produce or high transport costs.'
    },
    {
      step: 7,
      title: 'Pricing Engine Calculates Landed Cost & Realization',
      role: 'Pricing Service',
      icon: BadgeDollarSign,
      color: 'emerald',
      tab: 'middleman-sim',
      tagline: 'Complete cost breakdown showing Farmer Net Realization vs Buyer Landed Cost.',
      summary: 'Uzhavan Connect computes: Farmer Price (₹27.50) + Transport & Micro-Hub Handling (₹3.50) + Platform Escrow Fee (₹1.00) = ₹32.00/kg Landed Cost. The farmer receives 85.9% of the order value!',
      keyData: [
        { label: 'Buyer Landed Price', val: '₹32.00 / kg' },
        { label: 'Farmer Net Realization', val: '₹27.50 / kg (85.9%)' },
        { label: 'Traditional Mandi Share', val: 'Only ₹16.00 / kg (42%)' },
        { label: 'Farmer Gain', val: '+71.8% Higher Net Earnings' }
      ],
      insight: 'Eliminating speculative middlemen while preserving essential transport and pre-cooling increases farmer earnings while lowering buyer cost.'
    },
    {
      step: 8,
      title: 'System Selects Dynamic Micro-Hub',
      role: 'Operations/Admin Logistics',
      icon: MapPin,
      color: 'rose',
      tab: 'route-optimization',
      tagline: 'Algorithms dynamically choose optimal aggregation point based on cluster density.',
      summary: 'Sriperumbudur Rural Agro-Hub is selected over Poonamallee and Tiruvallur because of its centroid proximity to 4 farmer clusters (6.5 km), solar cold pre-cooling (4°C), and direct 6-lane NH-48 connectivity.',
      keyData: [
        { label: 'Selected Hub', val: 'Sriperumbudur Rural Hub (NH-48)' },
        { label: 'Hub Capacity', val: '25 Tonnes (Cold cell active)' },
        { label: 'Producer Distance', val: '6.5 km average' },
        { label: 'Pre-Cooling Temp', val: '4.2°C Active' }
      ],
      insight: 'Dynamic micro-hubs prevent unnecessary deep transit into crowded urban mandis before sorting.'
    },
    {
      step: 9,
      title: 'Route Optimizer (OR-Tools) Generates Route',
      role: 'Operations/Admin Logistics',
      icon: Truck,
      color: 'blue',
      tab: 'route-optimization',
      tagline: 'Capacity-constrained Vehicle Routing Problem (VRP) optimization.',
      summary: 'Google OR-Tools solver designs a 5-stop consolidated route for an Electric Reefer vehicle (TN-11-AGRI-4402). 42.6 km distance saved; 93.8% vehicle capacity utilization achieved.',
      keyData: [
        { label: 'Total Route Distance', val: '68.4 km (was 111.0 km)' },
        { label: 'Distance Saved', val: '42.6 km (38.4% reduction)' },
        { label: 'Vehicle Utilization', val: '93.8% (3,000kg in 3,200kg EV)' },
        { label: 'CO₂ Emissions Saved', val: '58.4 kg CO₂' }
      ],
      insight: 'No duplicate truck runs or empty backhauls. Produce stays chilled at 6.1°C throughout transit.'
    },
    {
      step: 10,
      title: 'QR Produce Passport Is Generated',
      role: 'Traceability Service',
      icon: QrCode,
      color: 'violet',
      tab: 'traceability',
      tagline: 'Batch-level tamper-proof identity with Brix sugar, firmness & harvest timestamp.',
      summary: 'Batch AGRI-2026-TM-9082 is assigned an immutable digital passport. Consumers, buyers, and food inspectors can scan the QR code to view the complete journey from field to fork.',
      keyData: [
        { label: 'Batch ID', val: 'AGRI-2026-TM-9082' },
        { label: 'Quality Test', val: 'Sugar: 4.85 °Bx | Firm: 3.42 kg/cm²' },
        { label: 'Pesticide Status', val: 'PASS - Certified Organic / ND' },
        { label: 'QR Traceability', val: 'Batch QR Scannable' }
      ],
      insight: 'Traceability turns produce into verified quality-graded assets, earning premium prices for careful farmers.'
    },
    {
      step: 11,
      title: 'Delivery & Digital Handover Completed',
      role: 'Operations/Admin Logistics & Buyer',
      icon: PackageCheck,
      color: 'teal',
      tab: 'dashboard',
      tagline: 'Multi-buyer pooled drop-offs completed within 05:30 - 07:15 AM window.',
      summary: 'The electric reefer arrives at Koyambedu, FreshBazaar, and Grand Chola. Digital signatures and crate weighments verify 100% acceptance with zero damage or rejection.',
      keyData: [
        { label: 'Arrival Time', val: '06:45 AM (On Schedule)' },
        { label: 'Delivered Volume', val: '3,000 kg (100% accepted)' },
        { label: 'Post-Harvest Loss', val: '0.2% (vs 18-24% traditional)' },
        { label: 'Delivery Status', val: 'FULFILLED & SIGNED' }
      ],
      insight: 'Direct early-morning multi-drop delivery preserves freshness and cuts food spoilage by over 80%.'
    },
    {
      step: 12,
      title: 'Settlement Recorded via Escrow',
      role: 'Settlement Service',
      icon: CreditCard,
      color: 'emerald',
      tab: 'settlement',
      tagline: 'Instant transparent split: Farmer ₹82,500, Logistics ₹10,500, Platform ₹3,000.',
      summary: 'Upon digital delivery confirmation, Uzhavan Connect triggers instant bank escrow settlement. UTR AGRITXN20260908772184 credits ₹82,500 directly to the farmer collective account.',
      keyData: [
        { label: 'Total Order Value', val: '₹96,000.00' },
        { label: 'Farmer Share', val: '₹82,500.00 (85.9%)' },
        { label: 'Logistics Share', val: '₹10,500.00 (10.9%)' },
        { label: 'Settlement Status', val: 'COMPLETED (Instant Payout)' }
      ],
      insight: 'Farmers are paid instantly upon delivery, ending the 30-90 day credit lag typical in traditional APMC mandis.'
    },
    {
      step: 13,
      title: 'Closed-Loop Learning & Impact Outcomes',
      role: 'Admin & AI Engine',
      icon: BarChart3,
      color: 'indigo',
      tab: 'impact-kpis',
      tagline: 'Transaction results feed back into ML models; platform displays measured  KPIs.',
      summary: 'Delivery speeds, actual demand fulfillment, and price discovery are recorded into Kafka and PostgreSQL to retrain the next week forecast. Evaluators review the 10  core impact KPIs.',
      keyData: [
        { label: 'Farmer Realization', val: '+152% Relative Gain' },
        { label: 'Consumer Savings', val: '15.8% Lower Price' },
        { label: 'Wastage Reduced', val: 'From 22.4% down to 3.8%' },
        { label: 'Closed-Loop Learn', val: 'XGBoost Weights Updated' }
      ],
      insight: 'Uzhavan Connect is not just a marketplace; it is an intelligent learning coordination backbone for national food distribution.'
    }
  ];

  const currentStepData = demoSteps[demoStep - 1];
  const StepIcon = currentStepData.icon;

  const handleNavigateToLiveView = () => {
    setActiveTab(currentStepData.tab);
    if (currentStepData.step === 10) {
      openPassportModal('AGRI-2026-TM-9082');
    }
    closeDemoMode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-agri-950 via-agri-900 to-agri-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold border border-amber-400/30">
                   DEMO TOUR
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">Scenario: Tomato 3,000 kg (Chennai)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold  text-white">
                Step {demoStep} of 13: {currentStepData.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600/80 text-white hover:bg-emerald-600'
              }`}
              title={isPlaying ? 'Pause Auto Tour' : 'Auto Play Demo Tour (5.5s per step)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={closeDemoMode}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Rail */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {demoSteps.map((s) => {
              const isActive = s.step === demoStep;
              const isPast = s.step < demoStep;
              return (
                <button
                  key={s.step}
                  onClick={() => setDemoStep(s.step)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-black/10 text-[10px] flex items-center justify-center">
                      {s.step}
                    </span>
                  )}
                  <span className="hidden md:inline">{s.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Detail Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Headline and Tagline */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <StepIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Responsible Entity: {currentStepData.role}
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {currentStepData.tagline}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentStepData.summary}
                </p>
              </div>
            </div>

            <button
              onClick={handleNavigateToLiveView}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm shrink-0 transition"
            >
              <span>View Interactive Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Key Data Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Live System State & Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentStepData.keyData.map((d, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <p className="text-[11px] text-slate-500 font-medium">{d.label}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{d.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Innovation & Architectural Insight Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Why This Solves  (Multiple Intermediaries)
                </h5>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  {currentStepData.insight}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={prevDemoStep}
            disabled={demoStep === 1}
            className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              demoStep === 1
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            Step <span className="font-bold text-slate-800">{demoStep}</span> of 13
          </div>

          {demoStep < 13 ? (
            <button
              onClick={nextDemoStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow transition"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('impact-kpis');
                closeDemoMode();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-agri-900 hover:bg-agri-950 shadow transition"
            >
              <span>Finish Demo & View KPIs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
