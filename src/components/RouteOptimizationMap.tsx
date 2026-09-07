import React, { useState } from 'react';
import { OPTIMIZED_ROUTE_PLAN } from '../data/mockData';
import {
  Truck,
  Sparkles,
  MapPin,
  Clock,
  Gauge,
  Leaf,
  CheckCircle2,
  RefreshCw,
  Navigation,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RouteOptimizationMap: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(true);
  const [activeStop, setActiveStop] = useState<number>(1);

  const plan = OPTIMIZED_ROUTE_PLAN;

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setIsOptimized(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 700);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google OR-Tools VRP Optimization Solver</span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-slate-900">
            Best Delivery Route
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Farm A → Farm B → Collection Center → Buyer (Optimized multi-stop cold chain route).
          </p>
        </div>

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-agri-700 hover:from-emerald-700 hover:to-agri-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Solving Constraints...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-emerald-200" />
              <span>Optimize Route</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Metrics Strip: Total Distance, Distance Saved, Estimated Fuel Cost, Estimated Delivery Time */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Distance</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            {plan.totalDistanceKm} km
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            Direct multi-farm link
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span>Distance Saved</span>
          </div>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-1">
            {plan.distanceSavedKm} km
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            38.4% shorter path
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Leaf className="w-3.5 h-3.5 text-purple-600" />
            <span>Estimated Fuel Cost</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            ₹1,850 Saved
          </p>
          <span className="text-[11px] text-purple-600">
            EV fleet + zero empty miles
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Estimated Delivery Time</span>
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            2h 15m
          </p>
          <span className="text-[11px] text-amber-700 font-medium">
            Arrives 07:15 AM (on schedule)
          </span>
        </div>
      </div>

      {/* Interactive Map Visual + Stop Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Vector Route Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 p-6 relative min-h-[380px] flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-xs z-10">
            <span className="bg-slate-800 px-3 py-1 rounded border border-slate-700 font-mono text-emerald-400">
              Assigned Vehicle: {plan.vehicleId}
            </span>
            <span className="text-[11px] text-slate-400">
              Driver: {plan.driverName}
            </span>
          </div>

          {/* SVG Map of Multi-Stop Route */}
          <div className="w-full h-64 relative my-auto">
            <svg viewBox="0 0 550 300" className="w-full h-full">
              {/* Route Line */}
              <path
                d="M 60 180 L 160 150 L 320 120 L 420 80 L 480 140"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 3"
              />

              {/* Stop 1: Farm Aggregate */}
              <circle cx="60" cy="180" r="14" fill="#047857" stroke="#34d399" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveStop(1)} />
              <text x="56" y="184" fill="#ffffff" fontSize="10" fontWeight="bold">1</text>
              <text x="20" y="210" fill="#a7f3d0" fontSize="9" fontWeight="bold">Farm Pick-Up</text>
              <text x="20" y="222" fill="#cbd5e1" fontSize="8">04:15 AM (Loaded)</text>

              {/* Stop 2: Micro-Hub */}
              <circle cx="160" cy="150" r="16" fill="#0d9488" stroke="#5eead4" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveStop(2)} />
              <text x="156" y="154" fill="#ffffff" fontSize="11" fontWeight="bold">2</text>
              <text x="130" y="132" fill="#5eead4" fontSize="10" fontWeight="bold">Micro-Hub Bay 2</text>
              <text x="130" y="180" fill="#cbd5e1" fontSize="8">QC & Pre-cooling</text>

              {/* Stop 3: Koyambedu Terminal */}
              <circle cx="320" cy="120" r="14" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveStop(3)} />
              <text x="316" y="124" fill="#ffffff" fontSize="10" fontWeight="bold">3</text>
              <text x="270" y="105" fill="#93c5fd" fontSize="9" fontWeight="bold">Coop Terminal</text>
              <text x="270" y="145" fill="#cbd5e1" fontSize="8">1,500 kg Drop</text>

              {/* Stop 4: FreshBazaar Warehouse */}
              <circle cx="420" cy="80" r="14" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveStop(4)} />
              <text x="416" y="84" fill="#ffffff" fontSize="10" fontWeight="bold">4</text>
              <text x="390" y="65" fill="#93c5fd" fontSize="9" fontWeight="bold">FreshBazaar</text>
              <text x="390" y="105" fill="#cbd5e1" fontSize="8">1,000 kg Drop</text>

              {/* Stop 5: Grand Chola Guindy */}
              <circle cx="480" cy="140" r="14" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" className="cursor-pointer" onClick={() => setActiveStop(5)} />
              <text x="476" y="144" fill="#ffffff" fontSize="10" fontWeight="bold">5</text>
              <text x="450" y="165" fill="#93c5fd" fontSize="9" fontWeight="bold">Grand Chola</text>
              <text x="450" y="177" fill="#cbd5e1" fontSize="8">500 kg Drop</text>
            </svg>
          </div>

          <div className="z-10 flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Collection & Micro-Hub</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Multi-Buyer Drop Points</span>
            </span>
            <span className="text-emerald-400 font-mono">
              Vehicle Capacity: 93.8% Full
            </span>
          </div>
        </div>

        {/* Right: Waypoint Sequence List */}
        <div className="lg:col-span-5 p-6 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sequenced Stops & Unloading
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">5 Waypoints</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {plan.stops.map((stop) => {
              const isSelected = stop.stopOrder === activeStop;
              const isDone = stop.status === 'LOADED' || stop.status === 'DELIVERED';
              return (
                <div
                  key={stop.stopOrder}
                  onClick={() => setActiveStop(stop.stopOrder)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white/70 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                        {stop.stopOrder}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{stop.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {stop.eta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pl-7 font-mono">
                    <span>
                      Qty: <strong className="text-slate-800">{stop.quantityKg.toLocaleString()} kg</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      {isDone ? <CheckCircle2 className="w-3 h-3" /> : null}
                      <span>{stop.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Algorithm Status:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Optimal Global Minimum Solved</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
