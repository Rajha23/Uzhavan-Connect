/**
 * CropHarvestForecastPage
 * Full-screen dedicated harvest planning page with crop reference browser.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CropHarvestForecasterCard } from '../components/crop/CropHarvestForecasterCard';
import {
  CropHarvestService,
  SupportedCropSummary,
} from '../services/cropHarvestService';
import {
  CalendarDays,
  Sprout,
  Search,
  LayoutGrid,
  List,
  Filter,
  ChevronRight,
  Repeat2,
  Clock,
  Droplets,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Info,
  Layers,
} from 'lucide-react';

const HARVEST_TYPE_COLORS: Record<string, string> = {
  'One-time': 'bg-blue-50 text-blue-700 border-blue-200',
  'Repeated': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Multiple pickings': 'bg-amber-50 text-amber-700 border-amber-200',
};

const WATER_COLORS: Record<string, string> = {
  'Low': 'text-green-600',
  'Low–moderate': 'text-lime-600',
  'Moderate': 'text-yellow-600',
  'Moderate–high': 'text-orange-500',
  'High': 'text-red-500',
};

type ViewMode = 'forecast' | 'browser';
type BrowserView = 'grid' | 'list';

export const CropHarvestForecastPage: React.FC = () => {
  const { setActiveTab, currentUser } = useApp();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<ViewMode>('forecast');
  const [browserView, setBrowserView] = useState<BrowserView>('grid');
  const [cropList, setCropList] = useState<SupportedCropSummary[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [harvestTypeFilter, setHarvestTypeFilter] = useState<string>('All');

  useEffect(() => {
    CropHarvestService.getSupportedCrops()
      .then(setCropList)
      .finally(() => setLoadingCrops(false));
  }, []);

  // Derived filter options
  const categories = ['All', ...Array.from(new Set(cropList.map((c) => c.category))).sort()];
  const harvestTypes = ['All', 'One-time', 'Repeated', 'Multiple pickings'];

  const filteredCrops = cropList.filter((c) => {
    const matchSearch =
      c.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchType = harvestTypeFilter === 'All' || c.harvest_type === harvestTypeFilter;
    return matchSearch && matchCat && matchType;
  });

  const handleListProduce = (data: { crop: string; variety?: string }) => {
    setActiveTab('crop-yield-prediction');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf4] via-[#fafaf8] to-[#f4f8f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-9 h-9 rounded-xl border border-[#ccd5ae]/60 bg-white flex items-center justify-center hover:bg-[#eaf4ec] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#01472e]" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#01472e] flex items-center justify-center shadow-soft">
              <CalendarDays className="w-5 h-5 text-[#ccd5ae]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#01472e] tracking-tight">
                {t('harvestForecast.title', 'Harvest Forecast & Calendar Intelligence')}
              </h1>
              <p className="text-xs text-[#5c7065] mt-0.5">
                {t('harvestForecast.subtitle', 'Agronomic reference for 59 crops · Tamil Nadu & South India agro-climates')}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#ccd5ae]/60 rounded-2xl shadow-soft self-start sm:self-auto">
            <button
              onClick={() => setViewMode('forecast')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'forecast'
                  ? 'bg-[#01472e] text-[#fefae0] shadow-sm'
                  : 'text-[#5c7065] hover:bg-[#eaf4ec]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {t('harvestForecast.forecastTab', 'Harvest Forecast')}
            </button>
            <button
              onClick={() => setViewMode('browser')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'browser'
                  ? 'bg-[#01472e] text-[#fefae0] shadow-sm'
                  : 'text-[#5c7065] hover:bg-[#eaf4ec]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t('harvestForecast.browserTab', 'Crop Calendar Browser')}
            </button>
          </div>
        </div>

        {/* ─── Info banner ─────────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl">
          <Info className="w-4 h-4 text-[#01472e] shrink-0 mt-0.5" />
          <div className="text-xs text-[#5c7065] leading-relaxed">
            <strong className="text-[#01472e]">Agronomic Reference & Crop Calendar Intelligence</strong> — Harvest
            windows are calculated from the <em>Uzhavan Connect Crop Details &amp; Harvest Database</em> (59 crops, PDF reference).
            These are scientifically grounded agronomic reference values, not arbitrary estimates. They differ from
            the <strong>Supervised Random Forest Yield ML Model</strong> which is trained on actual farm observations.
          </div>
        </div>

        {/* ─── Main Content ─────────────────────────────────────────── */}
        {viewMode === 'forecast' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forecaster Card (primary) */}
            <div className="lg:col-span-2">
              <CropHarvestForecasterCard onListProduce={handleListProduce} />
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white rounded-[24px] border border-[#ccd5ae]/60 shadow-soft p-5">
                <h3 className="text-xs font-semibold text-[#01472e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('harvestForecast.databaseSummary', 'Database Summary')}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: t('harvestForecast.totalCrops', 'Total Crops'), value: cropList.length.toString(), icon: Sprout, color: 'text-emerald-700' },
                    {
                      label: t('harvestForecast.repeatedHarvest', 'Repeated Harvest'),
                      value: cropList.filter((c) => c.harvest_type !== 'One-time').length.toString(),
                      icon: Repeat2,
                      color: 'text-emerald-600',
                    },
                    {
                      label: t('harvestForecast.oneTimeHarvest', 'One-time Harvest'),
                      value: cropList.filter((c) => c.harvest_type === 'One-time').length.toString(),
                      icon: Clock,
                      color: 'text-blue-600',
                    },
                    {
                      label: t('harvestForecast.cropCategories', 'Crop Categories'),
                      value: Array.from(new Set(cropList.map((c) => c.category))).length.toString(),
                      icon: Layers,
                      color: 'text-purple-600',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] flex items-center justify-center shrink-0">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#5c7065]">{stat.label}</p>
                      </div>
                      <span className="text-sm font-bold text-[#01472e]">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-Layer Architecture Note */}
              <div className="bg-white rounded-[24px] border border-purple-100 shadow-soft p-5">
                <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('harvestForecast.twoLayerTitle', 'Two-Layer Intelligence')}
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#eaf4ec] rounded-xl border border-[#a3b18a]/30">
                    <p className="text-[11px] font-semibold text-[#01472e]">📅 Crop Calendar Engine</p>
                    <p className="text-[10px] text-[#5c7065] mt-0.5 leading-relaxed">
                      PDF-derived agronomic reference. Calculates harvest windows, intervals &amp; plant protection. No ML — pure agronomy.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[11px] font-semibold text-purple-800">🤖 Supervised Farm ML Model</p>
                    <p className="text-[10px] text-purple-600 mt-0.5 leading-relaxed">
                      Trained on actual farm observations (Tamil Nadu). Refines predictions when sufficient empirical data is available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick crop browse */}
              <div className="bg-white rounded-[24px] border border-[#ccd5ae]/60 shadow-soft p-5">
                <h3 className="text-xs font-semibold text-[#01472e] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  {t('harvestForecast.quickBrowse', 'Quick Crop Browse')}
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {cropList.slice(0, 15).map((c) => (
                    <div
                      key={c.crop_id}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#eaf4ec] transition-colors"
                    >
                      <span className="text-xs text-[#1a2e1d] font-medium">{c.crop_name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                          HARVEST_TYPE_COLORS[c.harvest_type]
                        }`}
                      >
                        {c.harvest_type === 'One-time' ? 'Once' : c.harvest_type === 'Repeated' ? 'Repeated' : 'Multi'}
                      </span>
                    </div>
                  ))}
                  {cropList.length > 15 && (
                    <button
                      onClick={() => setViewMode('browser')}
                      className="w-full text-center text-xs text-[#01472e] hover:underline py-1 cursor-pointer"
                    >
                      {t('harvestForecast.viewAll', 'View all {count} crops →', { count: cropList.length })}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Crop Calendar Browser ──────────────────────────── */
          <div className="space-y-4">
            {/* Browser Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aab97]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops or categories…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#ccd5ae]/60 rounded-2xl text-sm text-[#1a2e1d] placeholder:text-[#9aab97] focus:outline-none focus:border-[#01472e]/50 shadow-soft"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9aab97]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-8 pr-4 py-2.5 bg-white border border-[#ccd5ae]/60 rounded-2xl text-sm text-[#1a2e1d] focus:outline-none focus:border-[#01472e]/50 shadow-soft appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Harvest type filter */}
              <div className="flex gap-1 p-1 bg-white border border-[#ccd5ae]/60 rounded-2xl shadow-soft">
                {harvestTypes.map((ht) => (
                  <button
                    key={ht}
                    onClick={() => setHarvestTypeFilter(ht)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      harvestTypeFilter === ht
                        ? 'bg-[#01472e] text-[#fefae0]'
                        : 'text-[#5c7065] hover:bg-[#eaf4ec]'
                    }`}
                  >
                    {ht}
                  </button>
                ))}
              </div>

              {/* Grid / List toggle */}
              <div className="flex gap-1 p-1 bg-white border border-[#ccd5ae]/60 rounded-2xl shadow-soft">
                <button
                  onClick={() => setBrowserView('grid')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    browserView === 'grid' ? 'bg-[#01472e] text-white' : 'text-[#5c7065] hover:bg-[#eaf4ec]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBrowserView('list')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    browserView === 'list' ? 'bg-[#01472e] text-white' : 'text-[#5c7065] hover:bg-[#eaf4ec]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result count */}
            <p className="text-xs text-[#5c7065] px-1">
              Showing <strong className="text-[#01472e]">{filteredCrops.length}</strong> of{' '}
              {cropList.length} crops
            </p>

            {/* Crop Grid / List */}
            {loadingCrops ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#01472e] border-t-transparent" />
              </div>
            ) : filteredCrops.length === 0 ? (
              <div className="text-center py-16 text-[#9aab97]">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No crops match your search.</p>
              </div>
            ) : browserView === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.crop_id}
                    className="bg-white rounded-[20px] border border-[#ccd5ae]/50 shadow-soft p-4 hover:border-[#01472e]/30 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1a2e1d] leading-tight group-hover:text-[#01472e] transition-colors">
                          {crop.crop_name}
                        </h3>
                        <p className="text-[10px] text-[#9aab97] mt-0.5">{crop.category}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                          HARVEST_TYPE_COLORS[crop.harvest_type]
                        }`}
                      >
                        {crop.harvest_type === 'Multiple pickings' ? 'Multi' : crop.harvest_type}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#5c7065]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#9aab97] shrink-0" />
                        <span>First harvest: <strong className="text-[#1a2e1d]">{crop.first_harvest_days}</strong></span>
                      </div>
                      {crop.harvest_interval_days && (
                        <div className="flex items-center gap-1.5">
                          <Repeat2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Interval: <strong className="text-[#1a2e1d]">{crop.harvest_interval_days} days</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Droplets className={`w-3 h-3 shrink-0 ${WATER_COLORS[crop.water_requirement] || 'text-[#9aab97]'}`} />
                        <span>Water: <strong className={WATER_COLORS[crop.water_requirement] || ''}>{crop.water_requirement}</strong></span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#e9edc9]">
                      <p className="text-[10px] text-[#9aab97] truncate">{crop.season}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[20px] border border-[#ccd5ae]/60 shadow-soft overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#eaf4ec]/60 border-b border-[#e9edc9]">
                    <tr>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Crop</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">First Harvest</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider hidden md:table-cell">Interval</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#01472e] uppercase tracking-wider hidden lg:table-cell">Water</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e9edc9]">
                    {filteredCrops.map((crop) => (
                      <tr key={crop.crop_id} className="hover:bg-[#eaf4ec]/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1a2e1d]">{crop.crop_name}</td>
                        <td className="px-4 py-3 text-[#5c7065] hidden sm:table-cell">{crop.category}</td>
                        <td className="px-4 py-3 text-[#5c7065]">{crop.first_harvest_days}</td>
                        <td className="px-4 py-3 text-[#5c7065] hidden md:table-cell">
                          {crop.harvest_interval_days ? `${crop.harvest_interval_days} days` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                              HARVEST_TYPE_COLORS[crop.harvest_type]
                            }`}
                          >
                            {crop.harvest_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-xs font-medium ${WATER_COLORS[crop.water_requirement] || ''}`}>
                            {crop.water_requirement}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
