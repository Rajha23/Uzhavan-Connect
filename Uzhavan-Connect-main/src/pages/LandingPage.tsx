import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Truck,
  QrCode,
  Building2,
  ShoppingBag,
  User,
  ExternalLink,
  ChevronDown,
  Info,
  Scale,
  DollarSign,
  HeartHandshake,
  Lock,
  UserPlus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, switchRole } = useApp();


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
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-cream border-b border-olive/30">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sage/30 blur-3xl" />
          <div className="absolute top-48 -right-32 w-96 h-96 rounded-full bg-olive/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-anton text-forest tracking-wide leading-[1.1]">
              Sell Directly.<br />
              <span className="text-sage">
                Earn Better.
              </span><br />Grow Smarter.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-forest/70 leading-relaxed max-w-2xl mx-auto font-medium">
              Uzhavan Connect connects farmers directly with buyers using demand forecasts, smart matching, better price discovery and simple logistics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('login')}
                className="btn-organic flex items-center gap-2.5 bg-forest text-cream font-bold px-8 py-4 shadow-forest hover:shadow-lg text-sm"
              >
                <Lock className="w-5 h-5 text-sage" />
                <span>Login</span>
              </button>

              <button
                onClick={() => setActiveTab('register')}
                className="btn-organic flex items-center gap-2.5 bg-sage text-forest font-bold px-8 py-4 border border-sage/50 hover:bg-cream shadow-sm text-sm"
              >
                <UserPlus className="w-5 h-5 text-forest" />
                <span>Register</span>
              </button>

            </div>

            {/* 4-Benefit Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
              {[
                { icon: Sprout, title: 'Direct Market', desc: 'Sell directly to verified buyers', color: 'text-forest bg-sage/20 border-sage/40' },
                { icon: TrendingUp, title: 'Demand Forecast', desc: 'Know what buyers need first', color: 'text-forest bg-olive/20 border-olive/40' },
                { icon: Sparkles, title: 'Smart Matching', desc: 'Best matches by price & distance', color: 'text-forest bg-moss/20 border-moss/40' },
                { icon: Truck, title: 'Easy Logistics', desc: 'Route-optimised direct delivery', color: 'text-forest bg-sage/20 border-sage/40' },
              ].map((b) => (
                <div key={b.title} className={`p-4 rounded-[1.5rem] border text-left ${b.color} transition hover:-translate-y-1`}>
                  <b.icon className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-sm font-bold leading-tight">{b.title}</p>
                  <p className="text-[11px] opacity-70 mt-1 leading-snug">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Agriculture-Themed Interactive Ecosystem Diagram */}
          <div className="mt-16 max-w-5xl mx-auto bg-cream rounded-[2.5rem] p-6 sm:p-10 border border-olive/30 shadow-forest relative">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-forest bg-sage/20 px-4 py-1.5 rounded-full border border-sage/40">
                Complete Supply Chain
              </span>
              <p className="text-xs text-forest/50 mt-3 font-semibold uppercase tracking-widest">
                Farmer ↓ Uzhavan Connect ↓ Buyer ↓ Logistics ↓ Customer
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {/* Node 1: Farmer */}
              <div
                onClick={() => switchRole('FARMER')}
                className="p-5 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:bg-olive/30 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-[1rem] bg-sage text-forest flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition shadow-sm">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-forest">1. Farmer</h4>
                <p className="text-[11px] text-forest/70 mt-1.5 leading-relaxed">Direct crop listing & harvest information</p>
                <span className="text-[10px] text-forest font-bold mt-3 inline-block uppercase tracking-widest">Switch →</span>
              </div>

              {/* Node 2: Uzhavan Connect */}
              <div
                onClick={() => setActiveTab('demand-intel')}
                className="p-5 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:bg-olive/30 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-[1rem] bg-forest text-cream flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-forest">2. Uzhavan Connect</h4>
                <p className="text-[11px] text-forest/70 mt-1.5 leading-relaxed">Demand forecast, smart matching & pricing</p>
                <span className="text-[10px] text-forest font-bold mt-3 inline-block uppercase tracking-widest">Forecasts →</span>
              </div>

              {/* Node 3: Buyers */}
              <div
                onClick={() => switchRole('RETAIL_BUYER')}
                className="p-5 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:bg-olive/30 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-[1rem] bg-sage text-forest flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition shadow-sm">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-forest">3. Pooled Buyers</h4>
                <p className="text-[11px] text-forest/70 mt-1.5 leading-relaxed">Consolidated demand & reverse auctions</p>
                <span className="text-[10px] text-forest font-bold mt-3 inline-block uppercase tracking-widest">Switch →</span>
              </div>

              {/* Node 4: Logistics */}
              <div
                onClick={() => switchRole('ADMIN')}
                className="p-5 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:bg-olive/30 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-[1rem] bg-forest text-cream flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-forest">4. Logistics</h4>
                <p className="text-[11px] text-forest/70 mt-1.5 leading-relaxed">Centroid micro-hubs & VRP route optimization</p>
                <span className="text-[10px] text-forest font-bold mt-3 inline-block uppercase tracking-widest">View VRP →</span>
              </div>

              {/* Node 5: Consumer & Trace */}
              <div
                onClick={() => setActiveTab('traceability')}
                className="p-5 rounded-[1.5rem] border border-olive/30 bg-olive/10 hover:bg-olive/30 cursor-pointer transition text-center group"
              >
                <div className="w-12 h-12 mx-auto rounded-[1rem] bg-sage text-forest flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-forest">5. Consumer</h4>
                <p className="text-[11px] text-forest/70 mt-1.5 leading-relaxed">Digital QR produce passport & transparency</p>
                <span className="text-[10px] text-forest font-bold mt-3 inline-block uppercase tracking-widest">Explore →</span>
              </div>
            </div>

            {/* 4 Floating Live Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-olive/20">
              <div className="text-center p-4 bg-olive/10 rounded-[1.5rem] border border-olive/20">
                <p className="text-3xl sm:text-4xl font-anton text-forest tracking-wide">
                  85.9%
                </p>
                <p className="text-xs font-bold text-forest mt-1">Farmer Realization</p>
                <span className="text-[11px] text-forest/60 font-medium">vs 34% in mandi</span>
              </div>

              <div className="text-center p-4 bg-olive/10 rounded-[1.5rem] border border-olive/20">
                <p className="text-3xl sm:text-4xl font-anton text-forest tracking-wide">
                  94.6%
                </p>
                <p className="text-xs font-bold text-forest mt-1">Forecast Accuracy</p>
                <span className="text-[11px] text-forest/60 font-medium">MAPE 5.34%</span>
              </div>

              <div className="text-center p-4 bg-olive/10 rounded-[1.5rem] border border-olive/20">
                <p className="text-3xl sm:text-4xl font-anton text-forest tracking-wide">
                  12k+
                </p>
                <p className="text-xs font-bold text-forest mt-1">Orders Fulfilled</p>
                <span className="text-[11px] text-forest/60 font-medium">100% on-time</span>
              </div>

              <div className="text-center p-4 bg-olive/10 rounded-[1.5rem] border border-olive/20">
                <p className="text-3xl sm:text-4xl font-anton text-forest tracking-wide">
                  38.4%
                </p>
                <p className="text-xs font-bold text-forest mt-1">Distance Saved</p>
                <span className="text-[11px] text-forest/60 font-medium">42.6 km per run</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-4xl sm:text-5xl font-anton text-forest tracking-wide">
            Why Agricultural Supply Chains Need Better Coordination
          </h2>
          <p className="text-sm text-forest/70 leading-relaxed font-medium">
            The problem is not simply the existence of intermediaries. Intermediary functions like transport and quality sorting are physically essential. The deeper problem is <strong>inefficient, uncoordinated information and speculative negotiation layers</strong> across Supply, Demand, Pricing, Aggregation, Logistics, and Traceability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-cream p-6 rounded-[2.5rem] border border-olive/30 shadow-forest hover:border-sage hover:shadow-sm transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-[1rem] bg-sage border border-sage/50 text-forest flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-forest text-sm tracking-wide">{card.title}</h3>
              <p className="text-xs text-forest/70 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 6. Final Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-forest text-cream rounded-[3rem] p-10 sm:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden border border-[#023120]">
          <div className="inline-flex items-center gap-2 bg-sage/20 text-sage px-4 py-2 rounded-[1rem] text-xs font-bold border border-sage/40 uppercase tracking-widest">
            <HeartHandshake className="w-4 h-4 text-sage" />
            <span>From Fragmented Supply to Coordinated Demand</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-anton tracking-wide max-w-3xl mx-auto leading-[1.1]">
            Start Building a Smarter Agricultural Supply Chain
          </h2>

          <p className="text-sm sm:text-base text-cream/70 max-w-2xl mx-auto leading-relaxed font-medium">
            Empower smallholders with forward demand visibility, eliminate speculative middlemen, and deliver fresh produce with guaranteed quality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">

            <button
              onClick={() => switchRole('FARMER')}
              className="px-8 py-4 bg-olive/10 hover:bg-olive/20 text-cream font-bold rounded-[1.5rem] border border-olive/30 transition text-sm uppercase tracking-widest"
            >
              Join as Farmer / FPO
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
