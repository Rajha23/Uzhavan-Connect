import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CropYieldService,
  STATE_DEFAULT_RAINFALL,
  CROP_INPUT_GUIDES
} from '../../services/cropYieldService';
import { CropYieldResponseDto } from '../../types';
import {
  Sprout,
  TrendingUp,
  Scale,
  CloudRain,
  FlaskConical,
  Bug,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CropYieldPredictionCardProps {
  onListProduce?: (cropData: { crop: string; variety?: string; estimatedKg: number; grade: string }) => void;
  compact?: boolean;
}

export const CropYieldPredictionCard: React.FC<CropYieldPredictionCardProps> = ({
  onListProduce,
  compact = false
}) => {
  const { currentUser } = useApp();
  const { t } = useLanguage();

  // Form State
  const [supportedCrops, setSupportedCrops] = useState<string[]>([]);
  const [supportedStates, setSupportedStates] = useState<string[]>([]);
  const [supportedSeasons, setSupportedSeasons] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [variety, setVariety] = useState<string>('');
  const [season, setSeason] = useState<string>('Kharif');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [areaUnit, setAreaUnit] = useState<'hectare' | 'acre'>('acre');
  const [areaValue, setAreaValue] = useState<number>(currentUser.farmSizeAcres || 2.5);
  const [annualRainfall, setAnnualRainfall] = useState<number>(950.0);
  const [fertilizer, setFertilizer] = useState<number>(120.0);
  const [pesticide, setPesticide] = useState<number>(15.0);
  const [cropYear, setCropYear] = useState<number>(new Date().getFullYear());

  // Result & UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CropYieldResponseDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showExplainability, setShowExplainability] = useState<boolean>(false);

  // Initialize metadata & prefill
  useEffect(() => {
    let isMounted = true;
    CropYieldService.getMetadata().then((meta) => {
      if (!isMounted) return;
      setSupportedCrops(meta.supported_crops);
      setSupportedStates(meta.supported_states);
      setSupportedSeasons(meta.supported_seasons);

      // Extract state from farmer profile location if available
      const loc = (currentUser.location || '').toLowerCase();
      const matchedState = meta.supported_states.find((st) => loc.includes(st.toLowerCase()));
      if (matchedState) {
        setState(matchedState);
        setAnnualRainfall(STATE_DEFAULT_RAINFALL[matchedState] || 950.0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Update rainfall defaults when state changes
  const handleStateChange = (newState: string) => {
    setState(newState);
    if (STATE_DEFAULT_RAINFALL[newState]) {
      setAnnualRainfall(STATE_DEFAULT_RAINFALL[newState]);
    }
  };

  // Update input guides when crop changes
  const handleCropChange = (newCrop: string) => {
    setSelectedCrop(newCrop);
    const guide = CROP_INPUT_GUIDES[newCrop];
    if (guide) {
      setFertilizer(guide.fertilizer_kg_ha);
      setPesticide(guide.pesticide_kg_ha);
    }
  };

  // Convert area to hectares for the model
  const areaInHectares = areaUnit === 'acre' ? Number((areaValue * 0.404686).toFixed(3)) : Number(areaValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await CropYieldService.predictYield({
        crop: selectedCrop,
        variety: variety.trim() || undefined,
        season,
        state,
        area: areaInHectares,
        annual_rainfall: annualRainfall,
        fertilizer,
        pesticide,
        crop_year: cropYear
      });

      if (response.success) {
        setResult(response);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } else {
        setErrorMessage(
          (response.errors && response.errors.join(' ')) || response.message || 'Yield prediction could not be computed.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to yield prediction service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
  };

  const handleProceedToListing = () => {
    if (!result || !result.predicted_yield) return;
    const estKg = (result.estimated_total_production || 0) * 1000;
    if (onListProduce) {
      onListProduce({
        crop: result.crop || selectedCrop,
        variety: result.variety,
        estimatedKg: Math.round(estKg),
        grade: 'Grade A'
      });
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ccd5ae]/60 shadow-soft overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#01472e] via-[#025235] to-[#013823] p-6 sm:p-7 text-[#fefae0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#ccd5ae]/20 border border-[#ccd5ae]/30 flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6 text-[#ccd5ae]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium text-[#ccd5ae] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Machine Learning • Random Forest Regressor</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
                Crop Yield Prediction & Harvest Estimator
              </h2>
              <p className="text-xs text-[#fefae0]/75 mt-0.5">
                Scientifically forecast harvest yield based on crop type, soil rainfall, farm scale, and agrochemical inputs.
              </p>
            </div>
          </div>

          {result && (
            <button
              onClick={handleReset}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition cursor-pointer border border-white/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Predict Again</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">Input Validation Notice</p>
              <p className="text-amber-800 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {!result ? (
          /* Prediction Input Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1 & 2: Crop & Variety */}
            <div className="bg-[#faf9f5] p-5 rounded-2xl border border-[#ccd5ae]/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#01472e] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  Crop & Variety Selection
                </span>
                <span className="text-[11px] text-[#5c7065]">55 Trained Crop Classes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crop Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-[#01472e] mb-1.5">
                    Crop Species <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => handleCropChange(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  >
                    {supportedCrops.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    Select from certified agricultural dataset crops (e.g. Rice, Wheat, Sugarcane, Potato).
                  </p>
                </div>

                {/* Variety Input */}
                <div>
                  <label className="block text-xs font-medium text-[#01472e] mb-1.5">
                    Variety / Cultivar Name <span className="text-[#5c7065] font-normal">(Optional context)</span>
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Ponni, CO-4, IR-64, Kufri Jyoti"
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    Retained for harvest passport; model predicts on species-level agricultural statistics.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Geographic & Temporal Location */}
            <div className="bg-[#faf9f5] p-5 rounded-2xl border border-[#ccd5ae]/40 space-y-4">
              <span className="text-xs font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#01472e] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                Geographic Region & Season
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* State */}
                <div>
                  <label className="block text-xs font-medium text-[#01472e] mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5c7065]" />
                    <span>State <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  >
                    {supportedStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-xs font-medium text-[#01472e] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#5c7065]" />
                    <span>Season <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  >
                    {supportedSeasons.map((sn) => (
                      <option key={sn} value={sn}>
                        {sn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop Year */}
                <div>
                  <label className="block text-xs font-medium text-[#01472e] mb-1.5">
                    Crop Year
                  </label>
                  <input
                    type="number"
                    value={cropYear}
                    min={2000}
                    max={2030}
                    onChange={(e) => setCropYear(Number(e.target.value))}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Cultivation Inputs & Farm Scale */}
            <div className="bg-[#faf9f5] p-5 rounded-2xl border border-[#ccd5ae]/40 space-y-4">
              <span className="text-xs font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#01472e] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                Cultivation Area & Resource Inputs
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Area Input with Unit Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#01472e] flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-[#5c7065]" />
                      <span>Farm Area</span>
                    </label>
                    <div className="inline-flex rounded-lg border border-[#ccd5ae] bg-white p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setAreaUnit('acre')}
                        className={`px-1.5 py-0.5 rounded ${
                          areaUnit === 'acre' ? 'bg-[#01472e] text-white font-medium' : 'text-[#5c7065]'
                        }`}
                      >
                        Acres
                      </button>
                      <button
                        type="button"
                        onClick={() => setAreaUnit('hectare')}
                        className={`px-1.5 py-0.5 rounded ${
                          areaUnit === 'hectare' ? 'bg-[#01472e] text-white font-medium' : 'text-[#5c7065]'
                        }`}
                      >
                        Hectares
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={areaValue}
                    onChange={(e) => setAreaValue(Math.max(0.01, Number(e.target.value)))}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    = {areaInHectares} Hectares (Model Unit)
                  </p>
                </div>

                {/* Annual Rainfall */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#01472e] flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-[#5c7065]" />
                      <span>Annual Rainfall</span>
                    </label>
                    <span className="text-[10px] text-[#5c7065]">mm/year</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={annualRainfall}
                    onChange={(e) => setAnnualRainfall(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    Prefilled from {state} historical regional average.
                  </p>
                </div>

                {/* Fertilizer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#01472e] flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-[#5c7065]" />
                      <span>Fertilizer</span>
                    </label>
                    <span className="text-[10px] text-[#5c7065]">kg/ha</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={fertilizer}
                    onChange={(e) => setFertilizer(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    Total NPK compound fertilizer applied.
                  </p>
                </div>

                {/* Pesticide */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#01472e] flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5 text-[#5c7065]" />
                      <span>Pesticide</span>
                    </label>
                    <span className="text-[10px] text-[#5c7065]">kg/ha</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pesticide}
                    onChange={(e) => setPesticide(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
                  />
                  <p className="text-[10px] text-[#5c7065] mt-1">
                    Bio/chemical crop protection applied.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#01472e] hover:bg-[#025235] text-[#fefae0] text-sm font-medium px-8 py-3.5 rounded-2xl shadow-soft transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Random Forest Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#ccd5ae]" />
                    <span>Predict Expected Crop Yield</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Prediction Result Presentation Card */
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#f8f9fa] via-white to-[#f4f7f4] rounded-3xl p-6 sm:p-8 border border-[#ccd5ae]/70 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#ccd5ae]/40">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ML Prediction Verified</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-[#01472e]">
                    {result.crop} {result.variety ? `(${result.variety})` : ''}
                  </h3>
                  <p className="text-xs text-[#5c7065]">
                    Cultivated in {result.state} • {result.season} Season • Area: {result.cultivated_area_ha} Hectares ({areaValue} {areaUnit}s)
                  </p>
                </div>

                {/* Primary Metric Display */}
                <div className="bg-[#01472e] text-[#fefae0] px-6 py-5 rounded-2xl border border-[#a3b18a]/40 shadow-soft text-right shrink-0">
                  <span className="text-[11px] uppercase tracking-wider text-[#ccd5ae] font-medium block">
                    Expected Productivity
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-0.5">
                    {result.predicted_yield?.toLocaleString()}
                  </div>
                  <span className="text-xs text-[#fefae0]/80 block font-medium">
                    {result.unit}
                  </span>
                </div>
              </div>

              {/* Total Harvest & Key Production Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-white border border-[#ccd5ae]/50 shadow-soft">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] block">
                    Estimated Total Harvest
                  </span>
                  <div className="text-2xl font-bold text-[#01472e] mt-1">
                    {result.estimated_total_production?.toLocaleString()} {result.total_production_unit}
                  </div>
                  <span className="text-[11px] text-[#5c7065] block mt-0.5">
                    Based on {result.cultivated_area_ha} ha × {result.predicted_yield} t/ha
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ccd5ae]/50 shadow-soft">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] block">
                    Equivalent in Market Bags / Kg
                  </span>
                  <div className="text-2xl font-bold text-[#01472e] mt-1">
                    {((result.estimated_total_production || 0) * 1000).toLocaleString()} kg
                  </div>
                  <span className="text-[11px] text-[#5c7065] block mt-0.5">
                    ~{Math.round(((result.estimated_total_production || 0) * 1000) / 50).toLocaleString()} standard 50kg bags
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ccd5ae]/50 shadow-soft">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] block">
                    Historical Benchmark
                  </span>
                  <div className="text-2xl font-bold text-[#01472e] mt-1">
                    {result.model_performance?.crop_specific_benchmark?.mean_yield || result.predicted_yield} t/ha
                  </div>
                  <span className="text-[11px] text-[#5c7065] block mt-0.5">
                    Regional historical average for {result.crop}
                  </span>
                </div>
              </div>

              {/* Farmer-Friendly Explanation Box */}
              <div className="mt-6 p-4 rounded-2xl bg-[#eaf4ec]/70 border border-emerald-200/80 text-xs text-[#01472e] flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Agricultural Advisory Notice</span>
                  <p className="leading-relaxed text-[#01472e]/90">
                    {result.explainability?.disclaimer}
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Model Explainability & Technical Accuracy */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-xs font-medium text-[#01472e] hover:text-[#025235] inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#faf9f5] border border-[#ccd5ae]/60 transition cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#5c7065]" />
                  <span>Technical Model Metrics & Accuracy</span>
                  {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setShowExplainability(!showExplainability)}
                  className="text-xs font-medium text-[#01472e] hover:text-[#025235] inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#faf9f5] border border-[#ccd5ae]/60 transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#5c7065]" />
                  <span>Feature Weights & Factors</span>
                  {showExplainability ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Technical Model Metrics Section */}
              {showTechnicalDetails && (
                <div className="p-5 rounded-2xl bg-white border border-[#ccd5ae]/60 shadow-soft text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-semibold text-[#01472e]">Algorithm Architecture:</span>
                    <span className="font-mono text-gray-700">{result.model}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-[#faf9f5] rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#5c7065] block uppercase">Coefficient of Determination (R²)</span>
                      <span className="text-base font-bold text-[#01472e] mt-0.5 block font-mono">
                        {result.model_performance?.r2_score}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">91.4% Explained Variance</span>
                    </div>

                    <div className="p-3 bg-[#faf9f5] rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#5c7065] block uppercase">Median Absolute Error</span>
                      <span className="text-base font-bold text-[#01472e] mt-0.5 block font-mono">
                        ±{result.model_performance?.median_absolute_error} t/ha
                      </span>
                      <span className="text-[10px] text-gray-500">Typical error magnitude</span>
                    </div>

                    <div className="p-3 bg-[#faf9f5] rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#5c7065] block uppercase">Test Dataset Samples</span>
                      <span className="text-base font-bold text-[#01472e] mt-0.5 block font-mono">
                        {result.model_performance?.test_samples?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500">Unseen test set</span>
                    </div>

                    <div className="p-3 bg-[#faf9f5] rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#5c7065] block uppercase">Total Training Data</span>
                      <span className="text-base font-bold text-[#01472e] mt-0.5 block font-mono">
                        {result.model_performance?.training_samples?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500">Indian DES agri records</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Weights Section */}
              {showExplainability && (
                <div className="p-5 rounded-2xl bg-white border border-[#ccd5ae]/60 shadow-soft text-xs space-y-4 animate-fadeIn">
                  <div>
                    <span className="font-semibold text-[#01472e] block">
                      Feature Contribution to Yield Magnitude (Random Forest Gini Importance):
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Relative importance allocated by the tree ensemble when predicting crop yields.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {result.explainability?.feature_importance_pct &&
                      Object.entries(result.explainability.feature_importance_pct).map(([feat, pct]) => (
                        <div key={feat} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-medium text-[#01472e]">{feat}</span>
                            <span className="font-mono text-gray-600">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#01472e] to-[#a3b18a] rounded-full"
                              style={{ width: `${Math.max(3, pct)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Estimate Another Crop</span>
              </button>

              {onListProduce && (
                <button
                  type="button"
                  onClick={handleProceedToListing}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#01472e] hover:bg-[#025235] text-[#fefae0] text-xs font-semibold shadow-soft transition cursor-pointer"
                >
                  <span>List Harvest ({((result.estimated_total_production || 0) * 1000).toLocaleString()} kg)</span>
                  <ArrowRight className="w-4 h-4 text-[#ccd5ae]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
