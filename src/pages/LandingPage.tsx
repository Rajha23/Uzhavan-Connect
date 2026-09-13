import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  TrendingUp,
  Sparkles,
  Truck,
  ShoppingBag,
  User,
  HeartHandshake,
  Lock,
  UserPlus,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, handleJoinAsRole } = useApp();

  const problemCards = [
    { title: 'Fragmented Demand', desc: 'Small retailers & restaurants purchase independently, inflating ordering costs and driving speculative local arbitrage.' },
    { title: 'Fragmented Supply', desc: '86% of Indian farmers are smallholders (<2 hectares) lacking individual bargaining power or volume scale for bulk buyers.' },
    { title: 'Uncertain Pricing', desc: 'Farmers bring produce blindly to mandis, where distress sales and unauthorized cuts depress gate prices to 30-40% of retail.' },
    { title: 'Duplicate Logistics', desc: 'Uncoordinated mini-trucks make redundant single-drop runs, burning fuel with 40%+ empty return miles and no cold-chain.' },
    { title: 'Slow Matching', desc: 'Spot telephone negotiations and 4-6 intermediary touchpoints create 48 to 72 hour delays for highly perishable commodities.' },
    { title: 'Limited Demand Visibility', desc: 'Farmers plant without knowing what the market will need 3 months later, triggering recurrent glut-and-famine cycles.' },
    { title: 'Post-Harvest Value Loss', desc: 'Over 20% of Indian horticultural produce rots in transit due to lack of pre-cooling micro-hubs and refrigerated routing.' },
    { title: 'Opaque Farmer Realization', desc: 'No itemized visibility into transport, mandi cess, or commission deductions, leaving farmers in perpetual debt.' }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pb-18 lg:pt-18 lg:pb-20 bg-gradient-to-b from-[#faf9f5] via-[#eaf4ec]/40 to-[#faf9f5]">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ccd5ae]/30 blur-3xl" />
          <div className="absolute top-48 -right-32 w-96 h-96 rounded-full bg-[#e9edc9]/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">

            {/* Ministry & Problem Statement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eaf4ec] border border-[#a3b18a]/50 text-[#01472e] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#01472e] animate-pulse" />
              <span>SIH26033 • Ministry of Consumer Affairs, Food & Public Distribution</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#01472e] tracking-tight leading-[1.12]">
              Sell Directly.{' '}
              <span className="text-[#025a3b] underline decoration-[#ccd5ae] decoration-wavy decoration-2">
                Earn 89% Realization.
              </span>
              <br />
              Powered by AI & Escrow.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Uzhavan Connect unifies smallholder farmers directly with institutional food processors and retailers using ML demand forecasting, algorithmic matching, fair price discovery, and cold-chain route coordination.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setActiveTab('login')}
                className="px-7 py-3.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold text-sm shadow-md transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#e9edc9]" />
                <span>Launch Operational Console</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-[#fefae0] text-[#01472e] border border-[#ccd5ae] font-semibold text-sm shadow-xs transition hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#01472e]" />
                <span>Register Direct Account</span>
              </button>
            </div>

            {/* 4-Benefit Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 max-w-4xl mx-auto">
              {[
                { icon: Sprout, title: 'Direct Market', desc: 'Direct contracts without APMC middlemen', bg: 'bg-white border-[#ccd5ae]/60' },
                { icon: TrendingUp, title: 'Demand Forecast', desc: 'FastAPI XGBoost ML demand spikes', bg: 'bg-white border-[#ccd5ae]/60' },
                { icon: Sparkles, title: 'Autonomous Escrow', desc: 'Zero credit risk, 89% net realization', bg: 'bg-white border-[#ccd5ae]/60' },
                { icon: Truck, title: 'Cold Chain VRP', desc: 'Sensor-monitored multi-stop routes', bg: 'bg-white border-[#ccd5ae]/60' },
              ].map((b) => (
                <div key={b.title} className={`p-4 rounded-2xl border text-left ${b.bg} shadow-2xs transition hover:-translate-y-0.5 hover:shadow-xs group`}>
                  <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                    <b.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold leading-tight text-[#01472e]">{b.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug font-normal">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Architecture Flow Container */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-[32px] p-6 sm:p-9 border border-[#ccd5ae]/60 shadow-sm relative">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#01472e] bg-[#eaf4ec] px-4 py-1.5 rounded-full border border-[#a3b18a]/50">
                100% Traceable End-to-End Operating Cycle
              </span>
              <p className="text-xs text-slate-500 mt-2 font-normal">
                Farmer Produce → AI Demand Aggregation → Smart Matching → FPO Hub → QC & Cold Transport → Dockside Settlement
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 relative">
              {/* Node 1: Farmer */}
              <div
                onClick={() => handleJoinAsRole('FARMER')}
                className="p-4 rounded-2xl border border-[#ccd5ae]/50 hover:border-[#01472e] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 cursor-pointer transition text-center group shadow-2xs"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#01472e]">1. Farmer</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Direct crop listing & harvest forecast</p>
                <span className="text-[10px] text-[#01472e] font-bold mt-2.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  Farmer Portal <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Node 2: Uzhavan Connect Engine */}
              <div
                onClick={() => setActiveTab('demand-intel')}
                className="p-4 rounded-2xl border border-[#ccd5ae]/50 hover:border-[#01472e] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 cursor-pointer transition text-center group shadow-2xs"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-[#01472e] text-[#fefae0] flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#01472e]">2. Uzhavan AI</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Smart matching & algorithmic pricing</p>
                <span className="text-[10px] text-[#01472e] font-bold mt-2.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  Forecasts <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Node 3: Buyers */}
              <div
                onClick={() => handleJoinAsRole('RETAIL_BUYER')}
                className="p-4 rounded-2xl border border-[#ccd5ae]/50 hover:border-[#01472e] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 cursor-pointer transition text-center group shadow-2xs"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#01472e]">3. Pooled Buyers</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Bulk demand pooling & reverse auctions</p>
                <span className="text-[10px] text-[#01472e] font-bold mt-2.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  Buyer Portal <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Node 4: Logistics */}
              <div
                onClick={() => handleJoinAsRole('LOGISTICS')}
                className="p-4 rounded-2xl border border-[#ccd5ae]/50 hover:border-[#01472e] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 cursor-pointer transition text-center group shadow-2xs"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-[#01472e] text-[#fefae0] flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#01472e]">4. Logistics Hub</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Micro-hubs & VRP route dispatch</p>
                <span className="text-[10px] text-[#01472e] font-bold mt-2.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  Hub Fleet <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Node 5: Consumer & Trace */}
              <div
                onClick={() => setActiveTab('traceability')}
                className="p-4 rounded-2xl border border-[#ccd5ae]/50 hover:border-[#01472e] bg-[#faf9f5] hover:bg-[#eaf4ec]/40 cursor-pointer transition text-center group shadow-2xs"
              >
                <div className="w-11 h-11 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center font-bold mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#01472e]">5. Consumer</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Digital QR produce passport audit</p>
                <span className="text-[10px] text-[#01472e] font-bold mt-2.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  Audit QR <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#01472e] bg-[#e9edc9]/50 px-3 py-1 rounded-full border border-[#ccd5ae]/60">
            Structural Agrarian Inefficiencies
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#01472e] tracking-tight">
            Why India's Agricultural Supply Chains Need Coordinated Intelligence
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Physical intermediary functions like transport and quality grading are essential. The breakdown occurs with <span className="font-semibold text-slate-800">inefficient, uncoordinated information and speculative negotiation layers</span> across supply, demand, pricing, aggregation, logistics, and traceability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problemCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-[24px] border border-[#ccd5ae]/60 shadow-2xs hover:border-[#01472e]/40 hover:shadow-forest transition-all duration-200 space-y-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] border border-[#a3b18a]/40 text-[#01472e] flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition font-mono">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-[#01472e] text-sm tracking-normal">{card.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Final Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white rounded-[36px] p-8 sm:p-12 text-center space-y-6 shadow-forest relative overflow-hidden border border-[#01472e]/30">
          {/* Ambient agricultural glow highlights */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#e9edc9]/15 blur-3xl pointer-events-none" />

          {/* Programmatic Transparency Badge */}
          <div className="relative inline-flex items-center gap-2 bg-[#fefae0]/15 text-[#fefae0] px-4 py-1.5 rounded-full text-xs font-semibold border border-[#fefae0]/30 shadow-xs backdrop-blur-xs">
            <HeartHandshake className="w-4 h-4 text-[#fefae0]" />
            <span>From Speculative Intermediaries to Programmatic Transparency</span>
          </div>

          {/* High-Contrast Main Heading */}
          <h2 className="relative text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-[1.2] text-white">
            Start Building a Smarter Agricultural Operating Network
          </h2>

          {/* High-Contrast Supporting Copy */}
          <p className="relative text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Empower smallholders with forward demand visibility, eliminate speculative middlemen, and deliver fresh produce with guaranteed quality.
          </p>

          {/* Coordinated Action Buttons */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleJoinAsRole('FARMER')}
              className="px-6 py-3.5 bg-[#fefae0] hover:bg-white text-[#01472e] font-bold rounded-2xl transition-all duration-150 text-xs uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Join as Farmer / FPO Hub
            </button>
            <button
              onClick={() => handleJoinAsRole('RETAIL_BUYER')}
              className="px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl border border-white/25 transition-all duration-150 text-xs uppercase tracking-wider backdrop-blur-xs shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Join as Institutional Buyer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

