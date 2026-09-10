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
  UserPlus
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
    <div className="space-y-14 sm:space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-12 sm:pb-14 lg:pt-16 lg:pb-16 border-b border-emerald-900/10 bg-gradient-to-b from-white/90 via-emerald-50/25 to-[#f8faf9]/90">
        {/* Decorative backdrop gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute top-48 -right-32 w-96 h-96 rounded-full bg-teal-100/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">

            {/* AI Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Demand-Driven Agricultural Marketplace & Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
              Sell Directly.{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Earn Better.
              </span>
              <br />
              Grow Smarter with AI.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Uzhavan Connect unifies smallholder farmers directly with institutional buyers using real-time demand forecasting, algorithmic matching, fair price discovery, and cold-chain route coordination.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('login')}
                className="btn-primary flex items-center gap-2 px-6 py-3.5 shadow-sm text-sm"
              >
                <Lock className="w-4 h-4 text-emerald-300" />
                <span>Sign In to Platform</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="btn-secondary flex items-center gap-2 px-6 py-3.5 text-sm"
              >
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* 4-Benefit Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
              {[
                { icon: Sprout, title: 'Direct Market', desc: 'Sell directly to verified buyers', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/60' },
                { icon: TrendingUp, title: 'Demand Forecast', desc: 'Predictive consumption spikes', color: 'text-teal-700 bg-teal-50/70 border-teal-200/60' },
                { icon: Sparkles, title: 'Smart Matching', desc: 'Optimized price & proximity', color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200/60' },
                { icon: Truck, title: 'Easy Logistics', desc: 'Route-optimized multi-stop delivery', color: 'text-amber-700 bg-amber-50/70 border-amber-200/60' },
              ].map((b) => (
                <div key={b.title} className={`p-4 rounded-xl border text-left ${b.color} transition hover:-translate-y-0.5 hover:shadow-xs`}>
                  <b.icon className="w-5 h-5 mb-2" />
                  <p className="text-xs font-medium leading-tight text-slate-900">{b.title}</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug font-normal">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Architecture Flow Container */}
          <div className="mt-14 max-w-5xl mx-auto bg-white/95 rounded-2xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs relative">
            <div className="text-center mb-8">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
                100% Traceable End-to-End Operating Cycle
              </span>
              <p className="text-xs text-slate-500 mt-2 font-normal">
                Farmer Produce → AI Demand Aggregation → Smart Matching → FPO Hub → QC & Cold Transport → Buyer Settlement
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 relative">
              {/* Node 1: Farmer */}
              <div
                onClick={() => handleJoinAsRole('FARMER')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <Sprout className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-slate-900">1. Farmer</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Direct crop listing & harvest forecast</p>
                <span className="text-[10px] text-emerald-700 font-medium mt-2.5 inline-block uppercase tracking-wider">Farmer Portal →</span>
              </div>

              {/* Node 2: Uzhavan Connect Engine */}
              <div
                onClick={() => setActiveTab('demand-intel')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-medium mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-slate-900">2. Uzhavan AI</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Smart matching & algorithmic pricing</p>
                <span className="text-[10px] text-emerald-700 font-medium mt-2.5 inline-block uppercase tracking-wider">Forecasts →</span>
              </div>

              {/* Node 3: Buyers */}
              <div
                onClick={() => handleJoinAsRole('RETAIL_BUYER')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-slate-900">3. Pooled Buyers</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Bulk demand pooling & reverse auctions</p>
                <span className="text-[10px] text-emerald-700 font-medium mt-2.5 inline-block uppercase tracking-wider">Buyer Portal →</span>
              </div>

              {/* Node 4: Logistics */}
              <div
                onClick={() => handleJoinAsRole('LOGISTICS')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-medium mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-slate-900">4. Logistics Hub</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Micro-hubs & VRP route dispatch</p>
                <span className="text-[10px] text-emerald-700 font-medium mt-2.5 inline-block uppercase tracking-wider">Hub Operations →</span>
              </div>

              {/* Node 5: Consumer & Trace */}
              <div
                onClick={() => setActiveTab('traceability')}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition text-center group"
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium mb-2.5 group-hover:scale-105 transition shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-medium text-slate-900">5. Consumer</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-normal">Digital QR produce passport audit</p>
                <span className="text-[10px] text-emerald-700 font-medium mt-2.5 inline-block uppercase tracking-wider">Explore →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Why Agricultural Supply Chains Need Coordinated Intelligence
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Physical intermediary functions like transport and quality grading are essential. The breakdown occurs with <span className="font-medium text-slate-700">inefficient, uncoordinated information and speculative negotiation layers</span> across supply, demand, pricing, aggregation, logistics, and traceability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problemCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/95 p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-400/60 hover:shadow-ai-hover transition-all duration-200 space-y-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center justify-center font-medium text-xs shadow-2xs group-hover:scale-105 transition">
                0{idx + 1}
              </div>
              <h3 className="font-medium text-slate-900 text-sm tracking-normal">{card.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Final Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-forest-lg relative overflow-hidden border border-emerald-600/30">
          {/* Subtle ambient agricultural glow highlights */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none" />

          {/* Programmatic Transparency Badge */}
          <div className="relative inline-flex items-center gap-2 bg-emerald-950/50 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-medium border border-emerald-400/40 shadow-xs backdrop-blur-xs">
            <HeartHandshake className="w-4 h-4 text-emerald-300" />
            <span>From Speculative Intermediaries to Programmatic Transparency</span>
          </div>

          {/* High-Contrast Main Heading */}
          <h2 className="relative text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight max-w-2xl mx-auto leading-[1.25] text-white">
            Start Building a Smarter Agricultural Operating Network
          </h2>

          {/* High-Contrast Supporting Copy */}
          <p className="relative text-sm sm:text-base text-emerald-50/95 max-w-2xl mx-auto leading-relaxed font-normal">
            Empower smallholders with forward demand visibility, eliminate speculative middlemen, and deliver fresh produce with guaranteed quality.
          </p>

          {/* Coordinated Action Buttons */}
          <div className="relative flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => handleJoinAsRole('FARMER')}
              className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-medium rounded-xl transition-all duration-150 text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/80 cursor-pointer"
            >
              Join as Farmer / FPO
            </button>
            <button
              onClick={() => handleJoinAsRole('RETAIL_BUYER')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/30 hover:border-white/60 transition-all duration-150 text-xs uppercase tracking-wider backdrop-blur-xs shadow-2xs hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/80 cursor-pointer"
            >
              Join as Institutional Buyer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

