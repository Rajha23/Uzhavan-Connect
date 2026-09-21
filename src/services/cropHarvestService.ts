/**
 * Uzhavan Connect – Crop Harvest Forecasting Service
 * Typed API layer for the CropHarvestEngine (ai-service) endpoints.
 * Includes an offline-first local calculation fallback using cropCalendarMaster.ts.
 */

import { CROP_CALENDAR_DATABASE, CropCalendarEntry } from '../data/cropCalendarMaster';

// ─── AI Service Base URL ────────────────────────────────────────────────────
const AI_SERVICE_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_SERVICE_URL) ||
  'http://localhost:8000';

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface HarvestForecastRequest {
  crop: string;
  sowing_date: string;                  // ISO format YYYY-MM-DD
  variety?: string;
  location?: string;
  season?: string;
  soil_type?: string;
  irrigation?: string;
  rainfall?: number;
  temperature?: number;
  humidity?: number;
}

export interface HarvestPickingEntry {
  pick_number: number;
  date: string;
  formatted_date: string;
  day_name: string;
  days_from_sowing: number;
  stage: string;
}

export interface HarvestWindow {
  start_date: string;
  end_date: string;
  start_formatted: string;
  end_formatted: string;
  days_range: string;
}

export interface HarvestMLInsight {
  model_type: string;
  predicted_days_to_first_harvest: number;
  ml_expected_date: string;
  cv_mae_days?: number | null;
  training_records?: number;
}

export interface HarvestForecastResult {
  crop: string;
  crop_id: string;
  category: string;
  variety: string;
  location: string | null;
  sowing_date: string;
  soil_type: string | null;
  irrigation: string;
  expected_first_harvest_date: string;
  expected_first_harvest_formatted: string;
  first_harvest_window: HarvestWindow;
  harvest_type: 'One-time' | 'Repeated' | 'Multiple pickings';
  is_repeated_harvest: boolean;
  harvest_interval_days: number | null;
  harvest_interval: string;
  expected_harvest_period: string;
  expected_final_harvest_date: string;
  expected_final_harvest_formatted: string;
  crop_duration_days: number;
  subsequent_pickings: HarvestPickingEntry[];
  pests: string;
  diseases: string;
  water_requirement: string;
  adjustments_applied: string[];
  ml_insight?: HarvestMLInsight | null;
  disclaimer: string;
  /** true if result came from local offline fallback */
  offline_fallback?: boolean;
}

export interface FarmObservationRequest {
  crop: string;
  variety?: string;
  location: string;
  sowing_date: string;
  actual_first_harvest_date: string;
  actual_final_harvest_date?: string;
  soil_type?: string;
  irrigation?: string;
  rainfall?: number;
  temperature?: number;
  humidity?: number;
  farm_area?: number;
  historical_yield?: number;
}

export interface SupportedCropSummary {
  crop_id: string;
  crop_name: string;
  category: string;
  season: string;
  harvest_type: 'One-time' | 'Repeated' | 'Multiple pickings';
  first_harvest_days: string;
  harvest_interval_days: number | null;
  soil_type: string;
  water_requirement: string;
}

// ─── Tamil Nadu District List ────────────────────────────────────────────────

export const TN_DISTRICTS: string[] = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Villupuram', 'Virudhunagar',
];

// ─── Soil Types ──────────────────────────────────────────────────────────────

export const SOIL_TYPES: string[] = [
  'Well-drained loam',
  'Clay/loam',
  'Sandy loam',
  'Red loam',
  'Black soil/loam',
  'Fertile loam',
  'Deep fertile loam',
  'Sandy soil',
  'Laterite soil',
  'Alluvial soil',
];

// ─── Irrigation Methods ──────────────────────────────────────────────────────

export const IRRIGATION_METHODS: string[] = [
  'Borewell Drip Irrigation (Optimized)',
  'Canal / River Basin Flow',
  'Sprinkler System',
  'Flood / Basin Irrigation',
  'Rainfed (No supplementary irrigation)',
  'Micro-irrigation (Subsurface drip)',
  'Tank / Pond Irrigation',
];

// ─── Offline Local Calculator (fallback when api-service is unreachable) ─────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long' });
}

function localForecast(req: HarvestForecastRequest): HarvestForecastResult {
  const q = req.crop.trim().toLowerCase();
  let entry: CropCalendarEntry | undefined = CROP_CALENDAR_DATABASE.find(
    (c) => c.crop_name.toLowerCase() === q || c.crop_id.toLowerCase() === q
  );
  if (!entry) {
    entry = CROP_CALENDAR_DATABASE.find(
      (c) =>
        c.crop_name.toLowerCase().includes(q) ||
        q.includes(c.crop_name.toLowerCase().split('/')[0].trim())
    );
  }
  if (!entry) {
    throw new Error(`Crop "${req.crop}" not found in local Crop Calendar Database.`);
  }

  const minDays = entry.first_harvest_days_min;
  const maxDays = entry.first_harvest_days_max;
  const medianDays = Math.round((minDays + maxDays) / 2);
  const sowDate = req.sowing_date;

  const expectedFirstDate = addDays(sowDate, medianDays);
  const windowStartDate = addDays(sowDate, minDays);
  const windowEndDate = addDays(sowDate, maxDays);
  const finalDate = addDays(sowDate, entry.crop_duration_days);

  const isRepeated = entry.harvest_type === 'Repeated' || entry.harvest_type === 'Multiple pickings';
  const interval = entry.harvest_interval_days;

  let intervalText = 'Single main harvest (one-time; no repeated pickings)';
  const pickings: HarvestPickingEntry[] = [];

  if (isRepeated && interval && interval > 0) {
    if (interval === 2) intervalText = 'Approximately every 2 days';
    else if (interval === 3.5) intervalText = 'Approximately every 3–4 days';
    else if (interval === 4) intervalText = 'Approximately every 3–5 days';
    else if (interval === 6) intervalText = 'Approximately every 5–7 days';
    else if (interval >= 30) intervalText = `Approximately every ~${Math.round(interval)} days`;
    else intervalText = `Approximately every ${interval} days`;

    let currentDate = expectedFirstDate;
    let pickNum = 1;
    while (currentDate <= finalDate && pickNum <= 8) {
      pickings.push({
        pick_number: pickNum,
        date: currentDate,
        formatted_date: formatDateShort(currentDate),
        day_name: getDayName(currentDate),
        days_from_sowing:
          Math.round((new Date(currentDate + 'T00:00:00').getTime() - new Date(sowDate + 'T00:00:00').getTime()) / 86400000),
        stage: pickNum === 1 ? 'First marketable flush' : `Picking Flush #${pickNum}`,
      });
      currentDate = addDays(currentDate, Math.round(interval));
      pickNum++;
    }
  }

  return {
    crop: entry.crop_name,
    crop_id: entry.crop_id,
    category: entry.category,
    variety: req.variety || 'Standard Commercial',
    location: req.location || 'Tamil Nadu',
    sowing_date: sowDate,
    soil_type: req.soil_type || entry.soil_type,
    irrigation: req.irrigation || 'Standard',
    expected_first_harvest_date: expectedFirstDate,
    expected_first_harvest_formatted: formatDate(expectedFirstDate),
    first_harvest_window: {
      start_date: windowStartDate,
      end_date: windowEndDate,
      start_formatted: formatDateShort(windowStartDate),
      end_formatted: formatDateShort(windowEndDate),
      days_range: `${minDays}–${maxDays} days from sowing`,
    },
    harvest_type: entry.harvest_type,
    is_repeated_harvest: isRepeated,
    harvest_interval_days: interval,
    harvest_interval: intervalText,
    expected_harvest_period: entry.harvest_period,
    expected_final_harvest_date: finalDate,
    expected_final_harvest_formatted: formatDate(finalDate),
    crop_duration_days: entry.crop_duration_days,
    subsequent_pickings: pickings,
    pests: entry.pests,
    diseases: entry.diseases,
    water_requirement: entry.water_requirement,
    adjustments_applied: [],
    ml_insight: null,
    disclaimer:
      'Reference values are calibrated from the Uzhavan Connect Crop Details & Harvest Database. Harvest dates may vary with specific micro-climate, seed vigour, and management practices. (Offline mode — computed locally)',
    offline_fallback: true,
  };
}

// ─── CropHarvestService Public API ──────────────────────────────────────────

export const CropHarvestService = {
  /**
   * Fetch all supported crops from the Crop Calendar Database.
   * Falls back to local TypeScript data on network error.
   */
  async getSupportedCrops(): Promise<SupportedCropSummary[]> {
    try {
      const res = await fetch(`${AI_SERVICE_BASE_URL}/api/ml/harvest/crops`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      return data.crops as SupportedCropSummary[];
    } catch {
      // Offline fallback: derive summaries from local data
      return CROP_CALENDAR_DATABASE.map((c) => ({
        crop_id: c.crop_id,
        crop_name: c.crop_name,
        category: c.category,
        season: c.season,
        harvest_type: c.harvest_type,
        first_harvest_days: c.first_harvest_days,
        harvest_interval_days: c.harvest_interval_days,
        soil_type: c.soil_type,
        water_requirement: c.water_requirement,
      }));
    }
  },

  /**
   * Get harvest forecast.
   * Calls POST /api/ml/harvest/forecast; on failure, computes locally.
   */
  async forecast(req: HarvestForecastRequest): Promise<HarvestForecastResult> {
    try {
      const res = await fetch(`${AI_SERVICE_BASE_URL}/api/ml/harvest/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json() as HarvestForecastResult;
    } catch (apiError: any) {
      // Offline-first fallback — use local crop calendar calculation
      console.warn('[CropHarvestService] API unavailable, using offline local forecast:', apiError?.message);
      return localForecast(req);
    }
  },

  /**
   * Record a real farm harvest observation for future ML training.
   */
  async recordObservation(obs: FarmObservationRequest): Promise<{ status: string; message: string }> {
    const res = await fetch(`${AI_SERVICE_BASE_URL}/api/ml/harvest/record-observation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obs),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get the JSON schema for observation validation.
   */
  async getObservationsSchema(): Promise<object> {
    const res = await fetch(`${AI_SERVICE_BASE_URL}/api/ml/harvest/observations-schema`);
    if (!res.ok) throw new Error('Schema fetch failed');
    return res.json();
  },

  /** Get list of crop names (for dropdown) */
  getCropNames(): string[] {
    return CROP_CALENDAR_DATABASE.map((c) => c.crop_name);
  },

  /** Get category for a crop */
  getCropCategory(cropName: string): string | null {
    const entry = CROP_CALENDAR_DATABASE.find(
      (c) => c.crop_name.toLowerCase() === cropName.toLowerCase()
    );
    return entry?.category ?? null;
  },

  /** Check if crop is repeated-harvest type (locally, instant) */
  isRepeatedHarvest(cropName: string): boolean {
    const entry = CROP_CALENDAR_DATABASE.find(
      (c) =>
        c.crop_name.toLowerCase() === cropName.toLowerCase() ||
        c.crop_name.toLowerCase().includes(cropName.toLowerCase()) ||
        cropName.toLowerCase().includes(c.crop_name.toLowerCase().split('/')[0].trim())
    );
    return entry ? entry.harvest_type !== 'One-time' : false;
  },
};
