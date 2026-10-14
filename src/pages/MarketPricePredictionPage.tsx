import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { 
  LineChart, 
  Search, 
  MapPin, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  History,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';

interface PricePredictionHistoryItem {
  id: string;
  timestamp: number;
  crop: string;
  state: string;
  district: string;
  prediction: {
    crop: string;
    state: string;
    district: string;
    predicted_price_rs_per_kg: number;
    confidence: number;
    note?: string;
  };
}

const STORAGE_KEY = 'uzhavan_price_predictions_history_v1';

const DEFAULT_HISTORY: PricePredictionHistoryItem[] = [
  {
    id: 'pred-init-1',
    timestamp: Date.now() - 1000 * 60 * 15,
    crop: 'Tomato',
    state: 'Tamil Nadu',
    district: 'Salem',
    prediction: {
      crop: 'Tomato',
      state: 'Tamil Nadu',
      district: 'Salem',
      predicted_price_rs_per_kg: 28.5,
      confidence: 0.92,
      note: 'High demand corridor; wholesale mandi arrivals steady.'
    }
  },
  {
    id: 'pred-init-2',
    timestamp: Date.now() - 1000 * 60 * 45,
    crop: 'Green Chilli',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    prediction: {
      crop: 'Green Chilli',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      predicted_price_rs_per_kg: 52.0,
      confidence: 0.88,
      note: 'Strong institutional buyer bids on Koyambedu corridor.'
    }
  },
  {
    id: 'pred-init-3',
    timestamp: Date.now() - 1000 * 60 * 120,
    crop: 'Rice',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    prediction: {
      crop: 'Rice',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      predicted_price_rs_per_kg: 26.0,
      confidence: 0.94,
      note: 'Delta region baseline support price aligned with MSP.'
    }
  }
];

export const MarketPricePredictionPage: React.FC = () => {
  const [crop, setCrop] = useState('Wheat');
  const [state, setState] = useState('Rajasthan');
  const [district, setDistrict] = useState('Chittorgarh');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PricePredictionHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed.slice(0, 5));
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load price history', e);
    }
    setHistory(DEFAULT_HISTORY);
  }, []);

  const saveHistory = (newItem: PricePredictionHistoryItem) => {
    const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist price history', e);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.predictMarketPrice(crop, state, district);
      setPrediction(data);

      // Save to recent 5 history
      const historyItem: PricePredictionHistoryItem = {
        id: 'pred-' + Date.now(),
        timestamp: Date.now(),
        crop: crop.trim(),
        state: state.trim(),
        district: district.trim(),
        prediction: data
      };
      saveHistory(historyItem);
    } catch (err) {
      setError('Failed to fetch prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restorePrediction = (item: PricePredictionHistoryItem) => {
    setCrop(item.crop);
    setState(item.state);
    setDistrict(item.district);
    setPrediction(item.prediction);
    setError(null);
  };

  const formatHistoryTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <LineChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            AI Market Price Predictor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Predict crop modal prices using our trained Random Forest ML model with historical trial memory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Prediction Parameters Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Prediction Parameters
            </h2>
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crop Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Wheat, Tomato"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Rajasthan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Chittorgarh"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer shadow-md"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Activity className="h-5 w-5" />
                )}
                {loading ? 'Predicting...' : 'Run ML Prediction'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Main Prediction Result Box */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Prediction Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : prediction ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    Prediction Result
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Powered by Random Forest Regressor
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Crop</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {prediction.crop}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Region</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {prediction.district}, {prediction.state}
                  </p>
                </div>
                
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2 uppercase tracking-wide">
                    Predicted Modal Price
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ₹{prediction.predicted_price_rs_per_kg}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 mb-1">/ kg</span>
                  </div>
                  {prediction.note && (
                    <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {prediction.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                <LineChart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Awaiting Prediction
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Enter parameters on the left or click any recent attempt below to view historical predictions.
              </p>
            </div>
          )}

          {/* Recently Predicted History (Last 5 Tries) Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Recently Predicted History
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last 5 prediction tries • Click any item to restore parameters and view results
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {history.length} / 5 Tries
              </span>
            </div>

            <div className="space-y-2.5">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => restorePrediction(item)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white capitalize">
                          {item.crop}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {item.district}, {item.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatHistoryTime(item.timestamp)}</span>
                        <span>•</span>
                        <span>Confidence: {(item.prediction.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                        ₹{item.prediction.predicted_price_rs_per_kg}
                      </span>
                      <span className="text-xs text-gray-400">/kg</span>
                    </div>
                    <button
                      className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 group-hover:text-blue-600 group-hover:border-blue-300 shadow-sm transition-all"
                      title="Load this prediction"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
