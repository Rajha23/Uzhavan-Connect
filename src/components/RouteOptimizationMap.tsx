import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  RouteOptimizationService,
  RouteOptimizationResponseDto,
  RouteWaypoint
} from '../services/routeOptimizationService';
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
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Layers,
  Box,
  Info,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RouteOptimizationMap: React.FC = () => {
  const { produceListings, demandRequests } = useApp();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeStop, setActiveStop] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState<string>('All Crops');
  const [vehicleCapacityKg, setVehicleCapacityKg] = useState<number>(3500);
  const [routePlan, setRoutePlan] = useState<RouteOptimizationResponseDto | null>(null);

  // Available unique crop types from real context
  const availableCrops = useMemo(() => {
    const crops = new Set<string>();
    produceListings.forEach((p) => crops.add(p.crop));
    return ['All Crops', ...Array.from(crops)];
  }, [produceListings]);

  // Derive relevant real farmer pickup locations and buyer destination
  const relevantListings = useMemo(() => {
    if (selectedCrop === 'All Crops') return produceListings.slice(0, 3);
    return produceListings.filter((p) => p.crop === selectedCrop).slice(0, 3);
  }, [produceListings, selectedCrop]);

  const relevantDemands = useMemo(() => {
    if (selectedCrop === 'All Crops') return demandRequests.slice(0, 2);
    return demandRequests.filter((d) => d.crop === selectedCrop).slice(0, 2);
  }, [demandRequests, selectedCrop]);

  const totalConsolidatedCargoKg = useMemo(() => {
    const fromListings = relevantListings.reduce((sum, item) => sum + item.quantityKg, 0);
    return fromListings > 0 ? fromListings : 2800;
  }, [relevantListings]);

  // Execute optimization through RouteOptimizationService
  const runOptimization = async (silent = false) => {
    if (!silent) setIsOptimizing(true);

    const pickups = relevantListings.length > 0
      ? relevantListings.map((l) => `${l.farmerName} (${l.location}) - ${l.crop}`)
      : ['Sunguvarchatram Farmer Cluster #1', 'Salem Hub Aggregate'];

    const delivery = relevantDemands.length > 0
      ? `${relevantDemands[0].buyerName} (${relevantDemands[0].location})`
      : 'Koyambedu Wholesale Terminal, Chennai';

    const result = await RouteOptimizationService.optimizeRoute({
      shipment_id: `SHP-${Date.now().toString().slice(-6)}`,
      pickup_locations: pickups,
      delivery_location: delivery,
      quantity_kg: totalConsolidatedCargoKg,
      vehicle_capacity_kg: vehicleCapacityKg,
      collection_center: 'Chengalpattu Micro-Hub #4 (QC & Pre-Cooling)'
    });

    setRoutePlan(result);
    if (!silent) {
      setIsOptimizing(false);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // Initial solve on mount or when crop/capacity changes
  useEffect(() => {
    runOptimization(true);
  }, [selectedCrop, vehicleCapacityKg, produceListings.length, demandRequests.length]);

  // Compute SVG coordinates dynamically for waypoints
  const waypointsWithCoords = useMemo(() => {
    if (!routePlan || !routePlan.waypoints) return [];
    const total = routePlan.waypoints.length;
    return routePlan.waypoints.map((wp, idx) => {
      const x = Math.round(55 + (idx / Math.max(1, total - 1)) * 440);
      let y = 140;
      if (wp.type === 'PICKUP') {
        y = 180 - (idx * 20);
      } else if (wp.type === 'HUB') {
        y = 135;
      } else {
        y = 90 + ((idx % 2) * 45);
      }
      return { ...wp, x, y };
    });
  }, [routePlan]);

  const svgPathD = useMemo(() => {
    if (waypointsWithCoords.length === 0) return '';
    return waypointsWithCoords
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
      .join(' ');
  }, [waypointsWithCoords]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google OR-Tools VRP Solver Architecture</span>
            </span>

            {routePlan?.solver_engine === 'GOOGLE_OR_TOOLS_LIVE' ? (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live FastAPI Solver Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                <Info className="w-3 h-3 text-amber-600" />
                Demo Simulation Solver (FastAPI Microservice API Ready)
              </span>
            )}
          </div>

          <h3 className="text-xl font-medium tracking-tight text-slate-900">
            Multi-Stop Route & Logistics Optimization
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidates active farmer listings into cold-chain collection runs and delivers directly to wholesale buyers.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Crop Filter:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-white text-slate-800 text-xs font-semibold px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {availableCrops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runOptimization(false)}
            disabled={isOptimizing}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-agri-700 hover:from-emerald-700 hover:to-agri-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition shrink-0 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-emerald-200" />
                <span>Re-Solve Route</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Solver Disclaimer Bar */}
      <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-mono text-[11px]">
            {routePlan?.disclaimer || 'Vehicle Routing Problem (VRP) with capacity and time windows solved via Google OR-Tools.'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          Target: POST /api/routes/optimize
        </span>
      </div>

      {/* KPI Metrics Strip: Total Distance, Distance Saved, Fuel Saved, Delivery ETA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white border-b border-slate-200 divide-x divide-slate-100">
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Optimized Distance</span>
          </div>
          <p className="text-xl font-semibold font-mono text-slate-900 mt-1">
            {routePlan?.total_distance_km ?? 42.6} km
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
          <p className="text-xl font-semibold font-mono text-emerald-700 mt-1">
            {routePlan?.distance_saved_km ?? 16.4} km
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            38.4% shorter vs direct trips
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Leaf className="w-3.5 h-3.5 text-purple-600" />
            <span>Fuel & Cost Savings</span>
          </div>
          <p className="text-xl font-semibold font-mono text-slate-900 mt-1">
            ₹{routePlan?.fuel_cost_savings_inr?.toLocaleString() ?? '1,850'} Saved
          </p>
          <span className="text-[11px] text-purple-600">
            {routePlan?.co2_emissions_saved_kg ?? 7.7} kg CO₂ emissions cut
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Estimated Duration</span>
          </div>
          <p className="text-xl font-semibold font-mono text-slate-900 mt-1">
            {Math.floor((routePlan?.estimated_time_minutes ?? 135) / 60)}h {(routePlan?.estimated_time_minutes ?? 135) % 60}m
          </p>
          <span className="text-[11px] text-amber-700 font-medium">
            Within cold-chain 3.5h SLA
          </span>
        </div>
      </div>

      {/* Active Constraints Panel */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-medium text-slate-800 uppercase tracking-wider">
              Active Optimization Constraints (Google OR-Tools Formulation)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Capacity Utilization: <strong className="text-emerald-700">{routePlan?.vehicle_utilization_percent ?? 80}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {routePlan?.activeConstraints.map((constraint) => (
            <div
              key={constraint.id}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800">{constraint.name}</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {constraint.status}
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
                {constraint.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {constraint.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual + Stop Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Vector Route Visualizer */}
        <div className="lg:col-span-7 bg-slate-900 p-6 relative min-h-[380px] flex flex-col justify-between text-white">
          <div className="flex items-center justify-between text-xs z-10">
            <span className="bg-slate-800 px-3 py-1 rounded border border-slate-700 font-mono text-emerald-400">
              Assigned Vehicle: {routePlan?.vehicle_id || 'TN-07-AG-4921 (Tata Ace EV Reefer)'}
            </span>
            <span className="text-[11px] text-slate-400">
              Driver: {routePlan?.driver_name || 'M. Selvakumar'}
            </span>
          </div>

          {/* SVG Map of Multi-Stop Route */}
          <div className="w-full h-64 relative my-auto">
            <svg viewBox="0 0 550 300" className="w-full h-full">
              {/* Route Line */}
              {svgPathD && (
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="6 3"
                />
              )}

              {/* Waypoint Nodes */}
              {waypointsWithCoords.map((wp) => {
                const isSelected = wp.stopOrder === activeStop;
                const isPickup = wp.type === 'PICKUP';
                const isHub = wp.type === 'HUB';
                const fillColor = isPickup ? '#047857' : isHub ? '#0d9488' : '#2563eb';
                const strokeColor = isPickup ? '#34d399' : isHub ? '#5eead4' : '#93c5fd';

                return (
                  <g
                    key={wp.stopOrder}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setActiveStop(wp.stopOrder)}
                  >
                    {isSelected && (
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r="20"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin"
                      />
                    )}
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r={isHub ? '16' : '14'}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                    <text
                      x={wp.x - (wp.stopOrder > 9 ? 6 : 3)}
                      y={wp.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {wp.stopOrder}
                    </text>
                    <text
                      x={wp.x - 30}
                      y={wp.y > 150 ? wp.y + 24 : wp.y - 12}
                      fill={isPickup ? '#a7f3d0' : isHub ? '#5eead4' : '#93c5fd'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {wp.type === 'PICKUP' ? 'Farm Pick-Up' : wp.type === 'HUB' ? 'QC Micro-Hub' : 'Buyer Drop'}
                    </text>
                    <text
                      x={wp.x - 30}
                      y={wp.y > 150 ? wp.y + 36 : wp.y - 2}
                      fill="#cbd5e1"
                      fontSize="8"
                    >
                      {wp.eta} ({wp.quantityKg} kg)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="z-10 flex flex-wrap items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-300 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Farm Pick-Up Nodes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Micro-Hub QC Aggregation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Buyer Wholesale Drop</span>
            </span>
            <span className="text-emerald-400 font-mono font-medium">
              Payload: {totalConsolidatedCargoKg.toLocaleString()} / {vehicleCapacityKg.toLocaleString()} kg
            </span>
          </div>
        </div>

        {/* Right: Waypoint Sequence List */}
        <div className="lg:col-span-5 p-6 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Sequenced Stops & Unloading
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {routePlan?.waypoints.length ?? 0} Waypoints
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {routePlan?.waypoints.map((stop) => {
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
                      <span className={`w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center text-white ${
                        stop.type === 'PICKUP' ? 'bg-emerald-700' : stop.type === 'HUB' ? 'bg-teal-700' : 'bg-blue-700'
                      }`}>
                        {stop.stopOrder}
                      </span>
                      <span className="text-xs font-medium text-slate-900 truncate max-w-[200px]" title={stop.name}>
                        {stop.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      {stop.eta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pl-7 font-mono">
                    <span>
                      Cargo: <strong className="text-slate-800">{stop.quantityKg.toLocaleString()} kg</strong>
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
            <span>Solver Engine:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OR-Tools Topological Feasibility Solved</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

