import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHENNAI_TOMATO_FORECAST } from '../data/mockData';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  ShieldCheck,
  AlertCircle,
  Layers,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react';

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DemandIntelligencePage: React.FC = () => {
  const { setActiveTab } = useApp();

  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedRegion, setSelectedRegion] = useState('Chennai Metropolitan');
  const [horizonDays, setHorizonDays] = useState<number>(7);

  const forecast = CHENNAI_TOMATO_FORECAST;

  // 7-Day Forecast Trend Data
  const forecastSeries = [
    { day: 'Day 1 (05 Sep)', actualDemand: 7900, predictedDemand: 7950, supply: 6800, gap: 1150 },
    { day: 'Day 2 (06 Sep)', actualDemand: 8050, predictedDemand: 8100, supply: 6850, gap: 1250 },
    { day: 'Day 3 (07 Sep)', actualDemand: 8200, predictedDemand: 8180, supply: 6900, gap: 1280 },
    { day: 'Day 4 (08 Sep)', actualDemand: null, predictedDemand: 8500, supply: 6900, gap: 1600 },
    { day: 'Day 5 (09 Sep)', actualDemand: null, predictedDemand: 8650, supply: 7000, gap: 1650 },
    { day: 'Day 6 (10 Sep)', actualDemand: null, predictedDemand: 8800, supply: 7100, gap: 1700 },
    { day: 'Day 7 (11 Sep)', actualDemand: null, predictedDemand: 8900, supply: 7150, gap: 1750 },
  ];

  // Price Trend & Landed Cost Breakdown
  const priceTrendSeries = [
    { week: 'Week 1', spotMandiPrice: 38, uzhavanconnectLanded: 33, farmerRealization: 27 },
    { week: 'Week 2', spotMandiPrice: 41, uzhavanconnectLanded: 32, farmerRealization: 27.5 },
    { week: 'Week 3', spotMandiPrice: 39, uzhavanconnectLanded: 32.5, farmerRealization: 28 },
    { week: 'Week 4 (Proj)', spotMandiPrice: 42, uzhavanconnectLanded: 32, farmerRealization: 28.5 },
  ];

  // Regional Corridor Comparison
  const regionalDemandData = [
    { region: 'Chennai Central', demandKg: 8500, supplyKg: 6900 },
    { region: 'Coimbatore Hub', demandKg: 6200, supplyKg: 6400 },
    { region: 'Madurai Corridor', demandKg: 4800, supplyKg: 5100 },
    { region: 'Trichy Junction', demandKg: 3900, supplyKg: 3700 },
    { region: 'Salem Agro Hub', demandKg: 4100, supplyKg: 4600 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-[10px] font-bold uppercase tracking-widest mb-2">
            <Cpu className="w-4 h-4" />
            <span>XGBoost + Seasonal ARIMA Machine Learning Model</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            AI Demand Intelligence & Forecasting
          </h1>
          <p className="text-sm text-cream/70 mt-3 max-w-2xl leading-relaxed font-medium">
            Near-term predictive demand signals calculated from institutional procurement pipelines, retail sales velocities, festival surges, weather forecasts, and historical price elasticity.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className="text-[10px] bg-sage/20 text-sage px-4 py-2 rounded-[1rem] border border-sage/40 font-bold uppercase tracking-widest">
            Model: v2.4-XGBoost-FastAPI
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-cream rounded-[1.5rem] border border-olive/30 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-forest uppercase tracking-widest text-[10px]">
            <Filter className="w-4 h-4 text-forest/50" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-olive/10 border border-olive/30 text-forest rounded-[1rem] px-4 py-2 font-bold shadow-sm focus:outline-none focus:border-sage"
          >
            <option value="Tomato">Tomato (Pusa Ruby / Arka)</option>
            <option value="Green Chilli">Green Chilli (G4)</option>
            <option value="Capsicum">Capsicum (Bell Pepper)</option>
            <option value="Maize">Maize (Sweet Corn)</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-olive/10 border border-olive/30 text-forest rounded-[1rem] px-4 py-2 font-bold shadow-sm focus:outline-none focus:border-sage"
          >
            <option value="Chennai Metropolitan">Chennai Metropolitan Region</option>
            <option value="Coimbatore Hub">Coimbatore Agro Hub</option>
            <option value="Madurai Corridor">Madurai Corridor</option>
          </select>

          <div className="flex items-center gap-1 bg-olive/10 p-1 rounded-[1rem] border border-olive/20">
            <button
              onClick={() => setHorizonDays(7)}
              className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition ${
                horizonDays === 7 ? 'bg-sage text-forest shadow-sm' : 'text-forest/60 hover:text-forest'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setHorizonDays(14)}
              className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition ${
                horizonDays === 14 ? 'bg-sage text-forest shadow-sm' : 'text-forest/60 hover:text-forest'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setHorizonDays(30)}
              className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition ${
                horizonDays === 30 ? 'bg-sage text-forest shadow-sm' : 'text-forest/60 hover:text-forest'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-forest/70 font-bold">
          <span>MAE: <strong className="text-forest font-anton text-sm">{forecast.mae}%</strong></span>
          <span>RMSE: <strong className="text-forest font-anton text-sm">{forecast.rmse}</strong></span>
          <span>MAPE: <strong className="text-sage bg-forest px-2 py-0.5 rounded-md font-anton text-sm">{forecast.mape}%</strong></span>
        </div>
      </div>

      {/* AI Insight Box (Explicit Requirement #12) */}
      <div className="bg-olive/10 border-2 border-sage rounded-[2.5rem] p-8 shadow-forest">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sage text-forest rounded-[1rem] shrink-0 mt-1 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-3 py-1 rounded-full border border-sage/50">
                AI INSIGHT (PREDICTIVE SIGNAL)
              </span>
              <span className="text-[10px] text-forest/50 font-bold uppercase tracking-widest">Verified Against  Demo Scenario</span>
            </div>
            <p className="text-2xl font-anton text-forest mt-4 tracking-wide">
              "{forecast.insight}"
            </p>
            <p className="text-sm text-forest/70 font-medium mt-3">
              Recommended platform response: Broadcast high-priority supply mobilization signal to Sriperumbudur and Kanchipuram FPOs for 1,600 kg Grade A Tomato.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70 block mb-2">Current Spot Demand</span>
          <p className="text-4xl font-anton text-forest tracking-wide">
            {forecast.currentDemandKg.toLocaleString()} <span className="text-lg">kg</span>
          </p>
          <span className="text-[9px] font-bold uppercase tracking-widest text-forest/50 mt-1 block">Baseline recorded</span>
        </div>

        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70 block mb-2">Predicted 7-Day Demand</span>
          <p className="text-4xl font-anton text-forest tracking-wide">
            {forecast.predictedDemandKg.toLocaleString()} <span className="text-lg">kg</span>
          </p>
          <span className="text-[9px] font-bold uppercase tracking-widest text-forest/50 mt-1 block">+6.2% expected uptick</span>
        </div>

        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70 block mb-2">Supply-Demand Deficit</span>
          <p className="text-4xl font-anton text-forest tracking-wide">
            {forecast.supplyGapKg.toLocaleString()} <span className="text-lg">kg</span>
          </p>
          <span className="text-[9px] font-bold uppercase tracking-widest text-forest/50 mt-1 block">Additional supply required</span>
        </div>

        <div className="bg-cream p-6 rounded-[1.5rem] border border-olive/30 shadow-sm hover:shadow-forest transition">
          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/70 block mb-2">Model Confidence Score</span>
          <p className="text-4xl font-anton text-forest tracking-wide">
            {forecast.confidenceScore}%
          </p>
          <span className="text-[9px] font-bold uppercase tracking-widest text-forest/50 mt-1 block">High confidence rating</span>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: 7-Day Demand Forecast vs Supply */}
        <div className="bg-cream p-8 rounded-[2.5rem] border border-olive/30 shadow-forest space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-anton text-forest tracking-wide flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-sage" />
                <span>Demand Forecast vs Supply</span>
              </h3>
              <p className="text-sm text-forest/70 font-medium mt-1">Shows widening supply gap requiring farmer mobilization</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-3 py-1 rounded-full border border-sage/50">
              7-Day Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#01472e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#01472e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccd5ae" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ccd5ae" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9edc9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#01472e', fontWeight: 'bold' }} stroke="#a3b18a" />
                <YAxis tick={{ fontSize: 10, fill: '#01472e' }} stroke="#a3b18a" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fefae0', borderColor: '#ccd5ae', borderRadius: '12px', color: '#01472e', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#01472e' }} />
                <Area type="monotone" dataKey="predictedDemand" name="Predicted Demand" stroke="#01472e" fillOpacity={1} fill="url(#demandGrad)" strokeWidth={3} />
                <Area type="monotone" dataKey="supply" name="Available Supply" stroke="#ccd5ae" fillOpacity={1} fill="url(#supplyGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Price Trend & Landed Cost Comparison */}
        <div className="bg-cream p-8 rounded-[2.5rem] border border-olive/30 shadow-forest space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-anton text-forest tracking-wide flex items-center gap-2">
                <LineChartIcon className="w-6 h-6 text-sage" />
                <span>Price Trend: Mandi vs Uzhavan Connect</span>
              </h3>
              <p className="text-sm text-forest/70 font-medium mt-1">Uzhavan Connect keeps landed cost low while boosting farmer earnings</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-forest bg-sage/30 px-3 py-1 rounded-full border border-sage/50">
              +71% Realization
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrendSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9edc9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#01472e', fontWeight: 'bold' }} stroke="#a3b18a" />
                <YAxis tick={{ fontSize: 10, fill: '#01472e' }} stroke="#a3b18a" domain={[20, 50]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fefae0', borderColor: '#ccd5ae', borderRadius: '12px', color: '#01472e', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#01472e' }} />
                <Line type="monotone" dataKey="spotMandiPrice" name="Traditional Mandi" stroke="#e9edc9" strokeWidth={3} dot={{ r: 4, fill: '#e9edc9' }} />
                <Line type="monotone" dataKey="uzhavanconnectLanded" name="Uzhavan Connect Landed Cost" stroke="#ccd5ae" strokeWidth={3} dot={{ r: 4, fill: '#ccd5ae' }} />
                <Line type="monotone" dataKey="farmerRealization" name="Farmer Realization" stroke="#01472e" strokeWidth={4} dot={{ r: 6, fill: '#01472e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Regional Demand vs Supply Distribution */}
        <div className="bg-cream p-8 rounded-[2.5rem] border border-olive/30 shadow-forest space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-anton text-forest tracking-wide flex items-center gap-2">
                <Layers className="w-6 h-6 text-sage" />
                <span>Tamil Nadu Corridors: Demand vs Supply</span>
              </h3>
              <p className="text-sm text-forest/70 font-medium mt-1">Identifies regional deficit corridors suitable for inter-district coordination</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalDemandData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9edc9" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#01472e', fontWeight: 'bold' }} stroke="#a3b18a" />
                <YAxis tick={{ fontSize: 10, fill: '#01472e' }} stroke="#a3b18a" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fefae0', borderColor: '#ccd5ae', borderRadius: '12px', color: '#01472e', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#01472e' }} />
                <Bar dataKey="demandKg" name="Pooled Demand" fill="#01472e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="supplyKg" name="Cluster Supply" fill="#ccd5ae" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
