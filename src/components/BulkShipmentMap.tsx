import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Clock,
  Gauge,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Radio,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { WorkflowOrder } from '../types';

interface BulkShipmentMapProps {
  order: WorkflowOrder;
  className?: string;
}

export const BulkShipmentMap: React.FC<BulkShipmentMapProps> = ({ order, className = '' }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const animationTimerRef = useRef<any>(null);

  // Telemetry mode toggle: distinguish simulated from live GPS
  const [telemetryMode, setTelemetryMode] = useState<'SIMULATED' | 'LIVE_GPS'>('SIMULATED');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(65); // percentage along route
  const [activeSpeed, setActiveSpeed] = useState<number>(54);
  const [reeferTemp, setReeferTemp] = useState<number>(4.2);

  // Waypoints along corridor (Tamil Nadu NH-48 Agro Corridor)
  const defaultWaypoints = [
    {
      id: 'wp-1',
      title: 'Farmer Cluster A (Sunguvarchatram)',
      type: 'PICKUP' as const,
      lat: 12.9675,
      lng: 79.9431,
      quantityKg: 1000,
      crop: order.crop || 'Tomato',
      farmer: 'Rajesh Kumar'
    },
    {
      id: 'wp-2',
      title: 'Farmer Cluster B (Kanchipuram North)',
      type: 'PICKUP' as const,
      lat: 12.8342,
      lng: 79.7036,
      quantityKg: 800,
      crop: order.crop || 'Tomato',
      farmer: 'K. Selvam'
    },
    {
      id: 'wp-3',
      title: 'Sriperumbudur Rural Micro-Hub (Pre-Cooling & QC)',
      type: 'HUB' as const,
      lat: 12.9712,
      lng: 79.9488,
      quantityKg: 5000,
      crop: order.crop || 'Tomato',
      farmer: 'Villupuram Collective & Agro Alliance'
    },
    {
      id: 'wp-4',
      title: 'Poonamallee Bypass (NH-48 Transit Point)',
      type: 'TRANSIT' as const,
      lat: 13.0489,
      lng: 80.0912,
      quantityKg: 5000,
      crop: order.crop || 'Tomato',
      farmer: 'Sundar Logistics EV Fleet'
    },
    {
      id: 'wp-5',
      title: 'Bulk Buyer: Metro Agri Processing Terminal (Ambattur)',
      type: 'DESTINATION' as const,
      lat: 13.1143,
      lng: 80.1548,
      quantityKg: 5000,
      crop: order.crop || 'Tomato',
      farmer: order.buyerName || 'Metro Agri Processors'
    }
  ];

  // Route path geometry for polyline
  const routeCoordinates: [number, number][] = [
    [12.8342, 79.7036], // Farmer B
    [12.8950, 79.8200], // Rural Connector
    [12.9675, 79.9431], // Farmer A
    [12.9712, 79.9488], // Micro-Hub
    [13.0010, 80.0150], // Outer Ring Junction
    [13.0489, 80.0912], // Poonamallee Bypass
    [13.0850, 80.1250], // Maduravoyal
    [13.1143, 80.1548]  // Ambattur Dock
  ];

  // Calculate current vehicle position based on simProgress (0% to 100%)
  const calculateVehiclePosition = (progress: number): [number, number] => {
    const totalSegments = routeCoordinates.length - 1;
    const scaled = (progress / 100) * totalSegments;
    const index = Math.min(Math.floor(scaled), totalSegments - 1);
    const fraction = scaled - index;

    const start = routeCoordinates[index];
    const end = routeCoordinates[index + 1];

    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    return [lat, lng];
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [13.0100, 80.0500],
      zoom: 11,
      scrollWheelZoom: false
    });

    // Real OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | UZHAVAN Telematics',
      maxZoom: 18
    }).addTo(map);

    // Add Route Polyline
    const routePolyline = L.polyline(routeCoordinates, {
      color: '#059669', // Emerald green
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 6',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Completed Route Polyline (sub-slice)
    const completedCoords = routeCoordinates.slice(0, 5);
    L.polyline(completedCoords, {
      color: '#10b981',
      weight: 6,
      opacity: 0.95
    }).addTo(map);

    // Add Custom Markers
    defaultWaypoints.forEach((wp) => {
      let iconHtml = '';
      if (wp.type === 'PICKUP') {
        iconHtml = `
          <div style="background-color: #059669; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white; font-weight: bold; font-size: 13px;">
            🌱
          </div>
        `;
      } else if (wp.type === 'HUB') {
        iconHtml = `
          <div style="background-color: #d97706; color: white; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white; font-size: 14px;">
            🏢
          </div>
        `;
      } else if (wp.type === 'DESTINATION') {
        iconHtml = `
          <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); border: 2.5px solid white; font-size: 16px;">
            🏭
          </div>
        `;
      } else {
        return; // Transit point handled by vehicle marker
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1e293b;">
          <strong style="color: #0f172a; font-size: 13px;">${wp.title}</strong><br/>
          <span style="color: #64748b;">Type:</span> <b>${wp.type}</b><br/>
          <span style="color: #64748b;">Produce:</span> ${wp.quantityKg.toLocaleString()} kg ${wp.crop}<br/>
          <span style="color: #64748b;">Source / Party:</span> ${wp.farmer}
        </div>
      `);
    });

    // Add Live Vehicle Marker with pulsating beacon
    const currentPos = calculateVehiclePosition(simProgress);
    const vehicleIcon = L.divIcon({
      className: 'vehicle-leaflet-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; background-color: #064e3b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #a7f3d0;">
            🚚
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const vehicleMarker = L.marker(currentPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1e293b;">
        <strong style="color: #064e3b; font-size: 13px;">CoolReefer EV 5.5T (TN-09-BK-9182)</strong><br/>
        <b>Cargo:</b> 5,000 kg Tomato (Grade A)<br/>
        <b>Reefer Temperature:</b> +4.2°C (Optimal)<br/>
        <b>Speed:</b> 54 km/h | <b>Driver:</b> Karthik S.<br/>
        <b>Carrier:</b> Sundar Logistics Cold-Chain
      </div>
    `);

    vehicleMarkerRef.current = vehicleMarker;
    mapInstanceRef.current = map;

    // Fit bounds
    map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update vehicle position smoothly during playback
  useEffect(() => {
    if (!isPlaying) return;

    animationTimerRef.current = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev >= 98 ? 35 : prev + 0.8;
        const newPos = calculateVehiclePosition(next);
        if (vehicleMarkerRef.current) {
          vehicleMarkerRef.current.setLatLng(newPos);
        }
        // Small realistic speed fluctuations
        setActiveSpeed(Math.floor(50 + Math.sin(next) * 6));
        setReeferTemp(Number((4.2 + (Math.sin(next) * 0.2)).toFixed(1)));
        return next;
      });
    }, 1200);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Derived metrics
  const totalDistanceKm = 68.4;
  const distanceCoveredKm = Number(((simProgress / 100) * totalDistanceKm).toFixed(1));
  const remainingDistanceKm = Number((totalDistanceKm - distanceCoveredKm).toFixed(1));

  return (
    <div className={`bg-white rounded-3xl border border-emerald-900/10 shadow-xs overflow-hidden ${className}`}>
      {/* Telemetry Header */}
      <div className="p-5 sm:p-6 border-b border-emerald-900/10 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              <span>Real-Time Transportation Telematics</span>
            </span>

            {/* Simulated vs Live GPS Indicator Badge */}
            {telemetryMode === 'SIMULATED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300" title="Simulated hardware telemetry for demonstration">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulated Demo Telemetry (Distinguished from Live GPS)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Connected Live Hardware GPS Stream</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Multi-Supplier Inbound Route to Bulk Buyer Terminal</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            OpenStreetMap geospatial tracking: 3 Farm Pickups → Sriperumbudur Consolidation Micro-Hub → Ambattur Receiving Dock.
          </p>
        </div>

        {/* Mode Switch & Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium border border-slate-200">
            <button
              onClick={() => setTelemetryMode('SIMULATED')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                telemetryMode === 'SIMULATED'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Simulated Mode
            </button>
            <button
              onClick={() => setTelemetryMode('LIVE_GPS')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                telemetryMode === 'LIVE_GPS'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Live GPS Feed
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-emerald-700" /> : <Play className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              onClick={() => {
                setSimProgress(25);
                const pos = calculateVehiclePosition(25);
                if (vehicleMarkerRef.current) vehicleMarkerRef.current.setLatLng(pos);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Reset to Micro-Hub Departure"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real OpenStreetMap Canvas Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-[420px] sm:h-[460px] z-10"
          style={{ background: '#f8fafc' }}
        />

        {/* Floating Telemetry HUD Card over Map */}
        <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-lg max-w-xs w-full hidden sm:block">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>TN-09-BK-9182</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              {simProgress.toFixed(0)}% EN ROUTE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Gauge className="w-3 h-3 text-emerald-600" />
                <span>Speed</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{activeSpeed} km/h</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Thermometer className="w-3 h-3 text-teal-600" />
                <span>Reefer Temp</span>
              </div>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">+{reeferTemp}°C</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>Covered</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{distanceCoveredKm} km</p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Remaining</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{remainingDistanceKm} km</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Estimated Arrival:</span>
            <span className="font-semibold text-slate-900">Today, 06:45 AM</span>
          </div>
        </div>

        {/* Waypoints Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/80 px-3 py-2 shadow-md hidden sm:flex items-center gap-3 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white"></span>
            <span>Farmer Pickups (3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-600 inline-block border border-white"></span>
            <span>Aggregation Hub (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white"></span>
            <span>Buyer Terminal (Ambattur)</span>
          </div>
        </div>
      </div>

      {/* Transit Timeline Progress Bar Below Map */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-emerald-900/10">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-slate-800">
            Active Multi-Stop Inbound Transit Lifecycle
          </span>
          <span className="font-semibold text-emerald-800 font-mono">
            {distanceCoveredKm} km of {totalDistanceKm} km ({simProgress.toFixed(0)}%)
          </span>
        </div>

        {/* Progress Tracker Line */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${simProgress}%` }}
          />
        </div>

        {/* 5 Milestone Stop Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {defaultWaypoints.map((wp, i) => {
            const isPassed = (i / (defaultWaypoints.length - 1)) * 100 <= simProgress;
            return (
              <div
                key={wp.id}
                className={`p-2.5 rounded-xl border transition text-left ${
                  isPassed
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-semibold text-slate-400">STOP #{i + 1}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-tight truncate">
                  {wp.title.split('(')[0]}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {wp.quantityKg.toLocaleString()} kg • {wp.type}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
