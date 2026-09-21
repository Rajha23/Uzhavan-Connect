import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CropYieldPredictionCard } from '../components/crop/CropYieldPredictionCard';
import { Sprout, TrendingUp, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, Layers } from 'lucide-react';
import defaultMetricsData from '../data/cropYieldMetrics.json';

export const CropYieldPredictionPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { t } = useLanguage();

  const handleListProduce = (cropData: { crop: string; variety?: string; estimatedKg: number; grade: string }) => {
    // Navigate to farmer dashboard with prefilled context
    setActiveTab('farmer-dashboard');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#faf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#5c7065]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-[#01472e] transition cursor-pointer"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-[#01472e] font-medium">Crop Yield Intelligence</span>
        </div>

        {/* Primary Prediction Card */}
        <CropYieldPredictionCard onListProduce={handleListProduce} />

        {/* Informational Benchmark Reference Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Historical Regional Yield Reference */}
          <div className="bg-white rounded-3xl p-6 border border-[#ccd5ae]/60 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#01472e]">Certified Historical Benchmarks</h4>
                <p className="text-[11px] text-[#5c7065]">National baseline averages from Ministry of Agriculture DES records</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { crop: 'Sugarcane', yieldVal: '51.7 t/ha', cat: 'Commercial' },
                { crop: 'Banana', yieldVal: '26.8 t/ha', cat: 'Horticulture' },
                { crop: 'Potato', yieldVal: '13.3 t/ha', cat: 'Tubers' },
                { crop: 'Onion', yieldVal: '13.2 t/ha', cat: 'Vegetable' },
                { crop: 'Rice', yieldVal: '2.2 t/ha', cat: 'Cereal' },
                { crop: 'Wheat', yieldVal: '2.2 t/ha', cat: 'Cereal' },
                { crop: 'Maize', yieldVal: '3.4 t/ha', cat: 'Coarse Grain' },
                { crop: 'Groundnut', yieldVal: '1.3 t/ha', cat: 'Oilseed' },
                { crop: 'Coconut', yieldVal: '8,652 nuts/ha', cat: 'Plantation' }
              ].map((item) => (
                <div key={item.crop} className="p-2.5 rounded-xl bg-[#faf9f5] border border-gray-100">
                  <span className="text-[10px] text-[#5c7065] block">{item.cat}</span>
                  <span className="text-xs font-semibold text-[#01472e] block mt-0.5">{item.crop}</span>
                  <span className="text-xs font-mono font-medium text-emerald-700 block">{item.yieldVal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Architecture & Production Integrity */}
          <div className="bg-white rounded-3xl p-6 border border-[#ccd5ae]/60 shadow-soft space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#01472e]">Production Model Architecture</h4>
                <p className="text-[11px] text-[#5c7065]">Strict featurization pipeline avoiding target leakage</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#5c7065] leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#01472e]">Zero Data Leakage:</strong> Production volume is strictly excluded from feature inputs to preserve true prospective predictive integrity.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#01472e]">Independent OneHot Pipeline:</strong> Scikit-Learn ColumnTransformer scales numerical features while safely encoding high-cardinality state and crop nominals.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#01472e]">FastAPI Production Deployment:</strong> Pre-compiled pipeline is loaded once on server startup with sub-20ms latency and resilient client-side offline execution.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
