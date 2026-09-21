/**
 * CropHarvestForecasterCard
 * Farmer-centric UI for Crop Harvest Forecasting & Calendar Intelligence.
 * Grounded in the Uzhavan_Connect_Crop_Details_Database.pdf agronomic reference.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CropHarvestService,
  HarvestForecastRequest,
  HarvestForecastResult,
  HarvestPickingEntry,
  SupportedCropSummary,
  TN_DISTRICTS,
  SOIL_TYPES,
  IRRIGATION_METHODS,
} from '../../services/cropHarvestService';
import { taskService } from '../../services/taskService';
import {
  Calendar,
  Sprout,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Shield,
  Clock,
  MapPin,
  Layers,
  BarChart3,
  ArrowRight,
  Info,
  Bug,
  Droplets,
  Thermometer,
  Repeat2,
  CalendarDays,
  Package,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface CropHarvestForecasterCardProps {
  /** Called when user clicks "Estimate Yield & List Produce" */
  onListProduce?: (data: { crop: string; variety?: string }) => void;
  compact?: boolean;
}

const HARVEST_TYPE_COLORS: Record<string, string> = {
  'One-time': 'bg-blue-50 text-blue-800 border-blue-200',
  'Repeated': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Multiple pickings': 'bg-amber-50 text-amber-800 border-amber-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Vegetable': 'bg-green-50 text-green-700',
  'Cereal': 'bg-yellow-50 text-yellow-700',
  'Millet': 'bg-orange-50 text-orange-700',
  'Pulse': 'bg-amber-50 text-amber-700',
  'Oilseed': 'bg-rose-50 text-rose-700',
  'Spice/Condiment': 'bg-red-50 text-red-700',
  'Fiber Crop': 'bg-slate-50 text-slate-700',
  'Cash Crop': 'bg-purple-50 text-purple-700',
  'Fruit': 'bg-pink-50 text-pink-700',
  'Flower': 'bg-violet-50 text-violet-700',
  'Tuber/Root': 'bg-brown-50 text-amber-800',
};

// Today's date string
const todayISO = new Date().toISOString().split('T')[0];

export const CropHarvestForecasterCard: React.FC<CropHarvestForecasterCardProps> = ({
  onListProduce,
  compact = false,
}) => {
  const { currentUser, setActiveTab, isOnline } = useApp();

  // ─── Crop list ────────────────────────────────────────────────────────────
  const [availableCrops, setAvailableCrops] = useState<SupportedCropSummary[]>([]);
  const [cropSearch, setCropSearch] = useState('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  // ─── Form Inputs ──────────────────────────────────────────────────────────
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState(todayISO);
  const [district, setDistrict] = useState(
    currentUser?.location?.split(',')[0]?.trim() || 'Salem'
  );
  const [soilType, setSoilType] = useState('Well-drained loam');
  const [irrigation, setIrrigation] = useState('Borewell Drip Irrigation (Optimized)');

  // ─── Result & UI State ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HarvestForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showProtection, setShowProtection] = useState(false);
  const [showAllPickings, setShowAllPickings] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const [taskAddLoading, setTaskAddLoading] = useState(false);

  // ─── Load crop list on mount ─────────────────────────────────────────────
  useEffect(() => {
    CropHarvestService.getSupportedCrops().then(setAvailableCrops).catch(() => {});
  }, []);

  const filteredCrops = availableCrops.filter((c) =>
    c.crop_name.toLowerCase().includes(cropSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const handleCropSelect = (cropName: string) => {
    setSelectedCrop(cropName);
    setCropSearch('');
    setShowCropDropdown(false);
    setResult(null);
    setErrorMsg(null);
  };

  // ─── Forecast Handler ─────────────────────────────────────────────────────
  const handleForecast = useCallback(async () => {
    if (!selectedCrop || !sowingDate) {
      setErrorMsg('Please select a crop and sowing date.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setTaskAdded(false);
    setShowAllPickings(false);

    const req: HarvestForecastRequest = {
      crop: selectedCrop,
      sowing_date: sowingDate,
      variety: variety || undefined,
      location: district,
      soil_type: soilType,
      irrigation: irrigation,
    };

    try {
      const forecast = await CropHarvestService.forecast(req);
      setResult(forecast);
    } catch (err: any) {
      setErrorMsg(err.message || 'Forecast failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCrop, sowingDate, variety, district, soilType, irrigation]);

  // ─── Add to Task Management ───────────────────────────────────────────────
  const handleAddToTasks = async () => {
    if (!result) return;
    setTaskAddLoading(true);
    try {
      // Create a harvest reminder task
      await taskService.createTask({
        title: `🌱 Harvest: ${result.crop}${result.variety !== 'Standard Commercial' ? ' (' + result.variety + ')' : ''}`,
        description: `Sown on ${result.sowing_date}. Expected first harvest: ${result.expected_first_harvest_formatted}.\nHarvest window: ${result.first_harvest_window.start_formatted} – ${result.first_harvest_window.end_formatted}.\nHarvest type: ${result.harvest_type}.\nDistrict: ${result.location}.\nPlant protection: Pests — ${result.pests}. Diseases — ${result.diseases}.`,
        assignedRole: 'FARMER',
        assignedTo: currentUser?.id || 'usr-farmer-01',
        assignedToName: currentUser?.name || 'Farmer',
        createdBy: currentUser?.id || 'usr-farmer-01',
        createdByName: currentUser?.name || 'Farmer',
        priority: 'High',
        status: 'Pending',
        dueDate: result.expected_first_harvest_date,
        taskType: 'Harvest',
        recurrence: result.is_repeated_harvest ? 'weekly' : 'none',
        organizationId: currentUser?.organization || '',
      });
      setTaskAdded(true);
      setTimeout(() => setTaskAdded(false), 4000);
    } catch (err) {
      console.error('Failed to create harvest task:', err);
    } finally {
      setTaskAddLoading(false);
    }
  };

  // ─── Derived display values ───────────────────────────────────────────────
  const selectedCropMeta = availableCrops.find((c) => c.crop_name === selectedCrop);
  const displayPickings: HarvestPickingEntry[] = result
    ? showAllPickings
      ? result.subsequent_pickings
      : result.subsequent_pickings.slice(0, 4)
    : [];

  return (
    <div className="bg-white rounded-[28px] border border-[#ccd5ae]/60 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#01472e] to-[#025235] px-6 py-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#ccd5ae]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#a3b18a]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ccd5ae]/20 border border-[#ccd5ae]/30 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-[#ccd5ae]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Harvest Forecast</h2>
              <p className="text-[#ccd5ae]/80 text-xs mt-0.5">Agronomic Reference &amp; Crop Calendar Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Live API' : 'Offline Mode'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ─── Form Inputs ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Crop Selector */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              Crop *
            </label>
            <div className="relative">
              <div
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-[#ccd5ae]/70 bg-[#fafaf8] cursor-pointer hover:border-[#01472e]/40 transition-colors"
                onClick={() => {
                  setShowCropDropdown(!showCropDropdown);
                  setCropSearch('');
                }}
              >
                <Sprout className="w-4 h-4 text-[#01472e] shrink-0" />
                <span className="flex-1 text-sm text-[#1a2e1d] font-medium truncate">
                  {selectedCrop || 'Select crop…'}
                </span>
                {selectedCropMeta && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      CATEGORY_COLORS[selectedCropMeta.category] || 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {selectedCropMeta.category}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-[#5c7065] shrink-0" />
              </div>

              {showCropDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ccd5ae]/60 rounded-2xl shadow-xl z-30 overflow-hidden">
                  <div className="p-2 border-b border-[#e9edc9]">
                    <input
                      type="text"
                      placeholder="Search crops…"
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#ccd5ae]/50 bg-[#fafaf8] focus:outline-none focus:border-[#01472e]/50 placeholder:text-[#9aab97]"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredCrops.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[#5c7065] text-center">No crops found</p>
                    ) : (
                      filteredCrops.map((c) => (
                        <button
                          key={c.crop_id}
                          onClick={() => handleCropSelect(c.crop_name)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#eaf4ec] transition-colors ${
                            c.crop_name === selectedCrop ? 'bg-[#eaf4ec]' : ''
                          }`}
                        >
                          <div>
                            <span className="text-sm font-medium text-[#1a2e1d]">{c.crop_name}</span>
                            <span className="ml-2 text-[10px] text-[#5c7065]">{c.first_harvest_days}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                CATEGORY_COLORS[c.category] || 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {c.category}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                HARVEST_TYPE_COLORS[c.harvest_type] || ''
                              }`}
                            >
                              {c.harvest_type}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variety */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              Variety <span className="text-[#9aab97] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g., Arka Rakshak, PKM-1…"
              className="w-full px-3 py-2.5 rounded-xl border border-[#ccd5ae]/70 bg-[#fafaf8] text-sm text-[#1a2e1d] placeholder:text-[#9aab97] focus:outline-none focus:border-[#01472e]/50 transition-colors"
            />
          </div>

          {/* Sowing Date */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              Sowing Date *
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ccd5ae]/70 bg-[#fafaf8] text-sm text-[#1a2e1d] focus:outline-none focus:border-[#01472e]/50 transition-colors"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              District / Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c7065]" />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ccd5ae]/70 bg-[#fafaf8] text-sm text-[#1a2e1d] focus:outline-none focus:border-[#01472e]/50 transition-colors appearance-none cursor-pointer"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#ccd5ae]/70 bg-[#fafaf8] text-sm text-[#1a2e1d] focus:outline-none focus:border-[#01472e]/50 transition-colors appearance-none cursor-pointer"
            >
              {SOIL_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Irrigation */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-[#5c7065] uppercase tracking-wider mb-1.5">
              Irrigation Method
            </label>
            <div className="flex flex-wrap gap-2">
              {IRRIGATION_METHODS.slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setIrrigation(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    irrigation === m
                      ? 'bg-[#01472e] text-[#fefae0] border-[#01472e] shadow-sm'
                      : 'bg-white text-[#5c7065] border-[#ccd5ae]/60 hover:border-[#01472e]/40 hover:bg-[#eaf4ec]'
                  }`}
                >
                  {m.split(' (')[0]}
                </button>
              ))}
              <select
                value={IRRIGATION_METHODS.slice(4).includes(irrigation) ? irrigation : ''}
                onChange={(e) => e.target.value && setIrrigation(e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer appearance-none ${
                  IRRIGATION_METHODS.slice(4).includes(irrigation)
                    ? 'bg-[#01472e] text-[#fefae0] border-[#01472e]'
                    : 'bg-white text-[#5c7065] border-[#ccd5ae]/60 hover:border-[#01472e]/40'
                }`}
              >
                <option value="">More…</option>
                {IRRIGATION_METHODS.slice(4).map((m) => (
                  <option key={m} value={m}>{m.split(' (')[0]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Forecast Button */}
        <button
          onClick={handleForecast}
          disabled={loading || !selectedCrop || !sowingDate}
          className="w-full flex items-center justify-center gap-2 bg-[#01472e] hover:bg-[#025235] disabled:opacity-60 disabled:cursor-not-allowed text-[#fefae0] font-medium text-sm px-6 py-3 rounded-2xl shadow-soft transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Computing Harvest Schedule…</span>
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4" />
              <span>Generate Harvest Forecast</span>
            </>
          )}
        </button>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ─── Results Panel ────────────────────────────────────────── */}
        {result && (
          <div className="space-y-4 animate-fadeIn">
            {/* Offline banner */}
            {result.offline_fallback && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span>Computed locally (offline mode) — results identical to live API using crop calendar reference data.</span>
              </div>
            )}

            {/* Crop & Variety Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-full">
                <Sprout className="w-3.5 h-3.5 text-[#01472e]" />
                <span className="text-xs font-semibold text-[#01472e]">{result.crop}</span>
                {result.variety !== 'Standard Commercial' && (
                  <span className="text-xs text-[#5c7065]">({result.variety})</span>
                )}
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                  HARVEST_TYPE_COLORS[result.harvest_type] || ''
                }`}
              >
                {result.harvest_type}
              </span>
              {result.category && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    CATEGORY_COLORS[result.category] || 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {result.category}
                </span>
              )}
            </div>

            {/* Primary Harvest Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Expected First Harvest */}
              <div className="p-4 bg-gradient-to-br from-[#eaf4ec] to-[#f0f7ef] border border-[#a3b18a]/30 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-[#01472e]" />
                  <span className="text-[11px] font-medium text-[#5c7065] uppercase tracking-wider">Expected First Harvest</span>
                </div>
                <p className="text-lg font-semibold text-[#01472e] leading-tight">{result.expected_first_harvest_formatted}</p>
                <p className="text-xs text-[#5c7065] mt-1">
                  Window: {result.first_harvest_window.start_formatted} –{' '}
                  {result.first_harvest_window.end_formatted}
                </p>
                <p className="text-[10px] text-[#9aab97] mt-0.5">{result.first_harvest_window.days_range}</p>
              </div>

              {/* Harvest Interval / Type */}
              <div className="p-4 bg-gradient-to-br from-[#fefae0]/60 to-[#fafaf0] border border-[#ccd5ae]/50 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Repeat2 className="w-4 h-4 text-[#7d6e2a]" />
                  <span className="text-[11px] font-medium text-[#5c7065] uppercase tracking-wider">Harvest Interval</span>
                </div>
                <p className="text-sm font-semibold text-[#5a4d1a] leading-snug">{result.harvest_interval}</p>
                <p className="text-xs text-[#7d6e2a] mt-1">Harvest Type: <strong>{result.harvest_type}</strong></p>
              </div>

              {/* Harvest Period */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-blue-700" />
                  <span className="text-[11px] font-medium text-[#5c7065] uppercase tracking-wider">Harvest Period</span>
                </div>
                <p className="text-sm font-semibold text-blue-800">{result.expected_harvest_period}</p>
                <p className="text-xs text-blue-600 mt-1">Final harvest by: <strong>{result.expected_final_harvest_formatted}</strong></p>
              </div>

              {/* Water Requirement */}
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50/50 border border-cyan-100 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <Droplets className="w-4 h-4 text-cyan-700" />
                  <span className="text-[11px] font-medium text-[#5c7065] uppercase tracking-wider">Water Requirement</span>
                </div>
                <p className="text-sm font-semibold text-cyan-800">{result.water_requirement}</p>
                <p className="text-xs text-cyan-600 mt-1">Irrigation: {result.irrigation}</p>
              </div>
            </div>

            {/* Subsequent Picking Schedule (Repeated only) */}
            {result.is_repeated_harvest && result.subsequent_pickings.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#01472e] uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    Upcoming Picking Schedule
                    <span className="ml-1 text-[10px] font-normal text-[#5c7065] normal-case">
                      ({result.subsequent_pickings.length} picks over season)
                    </span>
                  </h3>
                  {result.subsequent_pickings.length > 4 && (
                    <button
                      onClick={() => setShowAllPickings(!showAllPickings)}
                      className="text-[11px] text-[#01472e] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showAllPickings ? 'Show less' : `Show all ${result.subsequent_pickings.length}`}
                      {showAllPickings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {displayPickings.map((pick) => (
                    <div
                      key={pick.pick_number}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        pick.pick_number === 1
                          ? 'bg-[#eaf4ec] border-[#a3b18a]/50'
                          : 'bg-[#fafaf8] border-[#e9edc9]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          pick.pick_number === 1
                            ? 'bg-[#01472e] text-[#fefae0]'
                            : 'bg-[#ccd5ae]/60 text-[#01472e]'
                        }`}
                      >
                        {pick.pick_number}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1a2e1d] truncate">{pick.stage}</p>
                        <p className="text-[11px] text-[#5c7065]">{pick.formatted_date} ({pick.day_name})</p>
                        <p className="text-[10px] text-[#9aab97]">Day {pick.days_from_sowing} from sowing</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* One-time harvest confirmation */}
            {!result.is_repeated_harvest && (
              <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{result.crop}</strong> is a <strong>one-time harvest</strong> crop. No subsequent picking schedule is generated — harvest the full crop within the window above.
                </span>
              </div>
            )}

            {/* Plant Protection Advisory */}
            <div className="rounded-2xl border border-red-100 overflow-hidden">
              <button
                onClick={() => setShowProtection(!showProtection)}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-red-800">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Plant Protection Advisory</span>
                </div>
                {showProtection ? <ChevronUp className="w-4 h-4 text-red-600" /> : <ChevronDown className="w-4 h-4 text-red-600" />}
              </button>

              {showProtection && (
                <div className="p-4 bg-white space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Bug className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#5c7065] uppercase tracking-wider mb-0.5">Major Pests</p>
                      <p className="text-sm text-[#1a2e1d]">{result.pests}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-[#5c7065] uppercase tracking-wider mb-0.5">Major Diseases</p>
                      <p className="text-sm text-[#1a2e1d]">{result.diseases}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#9aab97] pt-1 border-t border-gray-100">
                    Source: Uzhavan Connect Crop Details &amp; Harvest Database
                  </p>
                </div>
              )}
            </div>

            {/* Agronomic Adjustments Applied */}
            {result.adjustments_applied.length > 0 && (
              <div className="rounded-2xl border border-[#ccd5ae]/50 overflow-hidden">
                <button
                  onClick={() => setShowAdjustments(!showAdjustments)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#f0f7ef] hover:bg-[#eaf4ec] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[#01472e]">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Micro-Adjustments Applied ({result.adjustments_applied.length})
                    </span>
                  </div>
                  {showAdjustments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAdjustments && (
                  <div className="p-4 bg-white space-y-2">
                    {result.adjustments_applied.map((adj, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#5c7065]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{adj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ML Insight (if model is loaded) */}
            {result.ml_insight && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Supervised ML Insight
                  </span>
                  <span className="ml-auto text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">
                    {result.ml_insight.model_type.split(' ')[0]} {result.ml_insight.model_type.split(' ')[1]}
                  </span>
                </div>
                <p className="text-sm text-purple-900">
                  Farm-level ML predicts first harvest in{' '}
                  <strong>{result.ml_insight.predicted_days_to_first_harvest} days</strong>{' '}
                  (by {result.ml_insight.ml_expected_date})
                </p>
                {result.ml_insight.cv_mae_days && (
                  <p className="text-[11px] text-purple-600">
                    Cross-validation MAE: ±{result.ml_insight.cv_mae_days.toFixed(1)} days •{' '}
                    Trained on {result.ml_insight.training_records} farm records
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={handleAddToTasks}
                disabled={taskAddLoading || taskAdded}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium border transition-all cursor-pointer ${
                  taskAdded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-[#01472e] hover:bg-[#025235] text-[#fefae0] border-[#01472e] shadow-soft'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {taskAdded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Added to Task Management!</span>
                  </>
                ) : taskAddLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Add to Task Management</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onListProduce
                    ? onListProduce({ crop: result.crop, variety: result.variety !== 'Standard Commercial' ? result.variety : undefined })
                    : setActiveTab('crop-yield-prediction');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium bg-white border border-[#ccd5ae]/60 hover:border-[#01472e]/40 hover:bg-[#eaf4ec] text-[#01472e] transition-all cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Estimate Yield &amp; List Produce</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-[#9aab97] leading-relaxed pt-1 border-t border-[#e9edc9]">
              <Info className="w-3 h-3 inline mr-1 align-middle" />
              {result.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
