import React, { useState } from 'react';
import { CANDIDATE_MICRO_HUBS } from '../data/mockData';
import { MicroHub } from '../types';
import {
  MapPin,
  CheckCircle2,
  Warehouse,
  ThermometerSnowflake,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';

export const DynamicMicroHubMap: React.FC = () => {
  const [selectedHubId, setSelectedHubId] = useState<string>('HUB-01');

  const selectedHub = CANDIDATE_MICRO_HUBS.find((h) => h.id === selectedHubId) || CANDIDATE_MICRO_HUBS[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Dynamic Centroid Optimization</span>
          </div>
          <h3 className="text-xl font-bold  text-slate-900">
            Dynamic Micro-Hub Selection Engine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates farmer cluster density, demand proximity, cold chain capacity, and road connectivity.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Corridor: Chennai - Sriperumbudur - Kanchipuram
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: Interactive Regional Map Canvas (Visual Vector Geo Representation) */}
        <div className="lg:col-span-7 bg-slate-900 p-6 relative flex flex-col justify-between min-h-[420px] text-white">
          {/* Map Title Overlay */}
          <div className="flex items-center justify-between z-10 text-xs">
            <span className="bg-slate-800/80 backdrop-blur px-3 py-1 rounded border border-slate-700 font-mono text-emerald-400">
              Corridor Vector Topology (Tamil Nadu North-East)
            </span>
            <span className="text-[11px] text-slate-400">Coordinates: 12.97° N, 79.94° E</span>
          </div>

          {/* SVG Canvas Map */}
          <div className="w-full h-72 relative my-auto">
            <svg viewBox="0 0 600 350" className="w-full h-full">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </pattern>
                <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Major Highway Arteries (NH-48 Corridor) */}
              <path
                d="M 60 220 Q 220 180 340 160 T 540 100"
                fill="none"
                stroke="#64748b"
                strokeWidth="4"
                strokeDasharray="6 4"
              />
              <text x="360" y="145" fill="#94a3b8" fontSize="10" fontStyle="italic">
                NH-48 Arterial Expressway (6-Lane)
              </text>

              {/* Outer Ring Road Link */}
              <path
                d="M 340 160 Q 420 260 520 240"
                fill="none"
                stroke="#475569"
                strokeWidth="3"
                strokeDasharray="4 4"
              />

              {/* Farmer Clusters (Supply Sources) */}
              {/* Cluster 1: Sriperumbudur Farms */}
              <circle cx="160" cy="190" r="28" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="160" cy="190" r="5" fill="#10b981" />
              <text x="120" y="232" fill="#86efac" fontSize="10" fontWeight="bold">Farmer Cluster A (1,000kg)</text>

              {/* Cluster 2: Kanchipuram Agro */}
              <circle cx="80" cy="240" r="22" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="80" cy="240" r="5" fill="#10b981" />
              <text x="45" y="275" fill="#86efac" fontSize="10">Cluster B (700kg)</text>

              {/* Cluster 3: Sunguvarchatram */}
              <circle cx="210" cy="160" r="18" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="210" cy="160" r="4" fill="#10b981" />
              <text x="180" y="142" fill="#86efac" fontSize="9">Cluster C (500kg)</text>

              {/* Cluster 4: Tiruvallur Link */}
              <circle cx="200" cy="80" r="22" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="200" cy="80" r="4" fill="#10b981" />
              <text x="160" y="65" fill="#86efac" fontSize="9">Cluster D (800kg)</text>

              {/* Chennai Demand Delivery Terminals */}
              <circle cx="530" cy="110" r="26" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="530" cy="110" r="7" fill="#3b82f6" />
              <text x="480" y="85" fill="#93c5fd" fontSize="11" fontWeight="bold">Chennai Koyambedu</text>
              <text x="495" y="148" fill="#cbd5e1" fontSize="9">Pooled Demand: 3,000 kg</text>

              {/* Candidate Hub 1: Sriperumbudur Rural Hub (RECOMMENDED) */}
              <g className="cursor-pointer" onClick={() => setSelectedHubId('HUB-01')}>
                {/* Pulse Ring for Recommended Hub */}
                <circle cx="250" cy="180" r="32" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                <circle cx="250" cy="180" r="16" fill="#047857" stroke="#34d399" strokeWidth="3" />
                <text x="244" y="184" fill="#ffffff" fontSize="11" fontWeight="bold">★</text>
                <text x="215" y="215" fill="#34d399" fontSize="11" fontWeight="bold">HUB 1: Sriperumbudur</text>
                <text x="235" y="228" fill="#a7f3d0" fontSize="9 font-mono">(RECOMMENDED)</text>

                {/* Direct transit ray to Chennai */}
                <line x1="250" y1="180" x2="530" y2="110" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 3" />
              </g>

              {/* Candidate Hub 2: Poonamallee */}
              <g className="cursor-pointer" onClick={() => setSelectedHubId('HUB-02')}>
                <circle cx="410" cy="150" r="12" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                <text x="406" y="154" fill="#ffffff" fontSize="10">2</text>
                <text x="375" y="175" fill="#cbd5e1" fontSize="10">HUB 2: Poonamallee</text>
              </g>

              {/* Candidate Hub 3: Tiruvallur */}
              <g className="cursor-pointer" onClick={() => setSelectedHubId('HUB-03')}>
                <circle cx="270" cy="90" r="12" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
                <text x="266" y="94" fill="#ffffff" fontSize="10">3</text>
                <text x="250" y="75" fill="#cbd5e1" fontSize="10">HUB 3: Tiruvallur</text>
              </g>
            </svg>
          </div>

          {/* Map Legend */}
          <div className="z-10 flex flex-wrap items-center gap-4 text-[11px] pt-3 border-t border-slate-800 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Farmer Supply Clusters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-300" />
              <span>Recommended Centroid Hub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Chennai Demand Terminals</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Hub Decision Matrix */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-slate-50 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidate Hub Analysis
            </span>

            {/* Hub Selector Cards */}
            <div className="space-y-2 mt-2">
              {CANDIDATE_MICRO_HUBS.map((hub) => {
                const isSelected = hub.id === selectedHubId;
                return (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHubId(hub.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Warehouse className={`w-4 h-4 ${hub.isRecommended ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold text-slate-900">{hub.name}</span>
                      </div>
                      {hub.isRecommended && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                          BEST CHOICE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 mt-2 text-[11px] text-slate-600 font-mono">
                      <div>
                        Score: <strong className="text-slate-900">{hub.score}</strong>
                      </div>
                      <div>
                        Producers: <strong className="text-slate-900">{hub.distanceToProducersKm} km</strong>
                      </div>
                      <div>
                        Cold-Room:{' '}
                        <strong className={hub.coldStorageAvailable ? 'text-emerald-700' : 'text-rose-600'}>
                          {hub.coldStorageAvailable ? 'YES' : 'NO'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Rationale for Selected Hub */}
            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Optimization Verdict</span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Confidence Score: {selectedHub.score}%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedHub.selectionReason}
              </p>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pre-cooling: <strong>{selectedHub.coldStorageAvailable ? '4°C Active' : 'Ambient'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Capacity: <strong>{selectedHub.capacityTonnes} Tonnes</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Dynamic selection prevents fixed warehouse overhead. Temporary micro-hubs activate exactly where farm supply density coincides with forward demand pools.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
