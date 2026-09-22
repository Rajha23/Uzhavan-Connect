import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { 
  LineChart, 
  Search, 
  MapPin, 
  TrendingUp, 
  Activity, 
  AlertCircle 
} from 'lucide-react';

export const MarketPricePredictionPage: React.FC = () => {
  const [crop, setCrop] = useState('Wheat');
  const [state, setState] = useState('Rajasthan');
  const [district, setDistrict] = useState('Chittorgarh');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.predictMarketPrice(crop, state, district);
      setPrediction(data);
    } catch (err) {
      setError('Failed to fetch prediction. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Predict crop modal prices using our trained ML model.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
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
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
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

        <div className="lg:col-span-2">
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
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                <LineChart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Awaiting Prediction
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Enter the crop and location parameters on the left to generate an AI-powered price prediction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
