import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CHENNAI_TOMATO_FORECAST } from '../data/mockData';
import { getCropImageUrl } from '../utils/cropImages';
import { ProduceListing, WorkflowOrder, WorkflowAgreement } from '../types';
import { DetailDrawer } from "../components/DetailDrawer";

import { KPIGrid, KPIStatCard } from '../components/KPIGrid';
import { UpcomingTasksWidget } from '../components/task';
import { CropVarietySearchDropdown } from '../components/crop/CropVarietySearchDropdown';
import { CropYieldPredictionCard } from '../components/crop/CropYieldPredictionCard';
import { CropHarvestForecasterCard } from '../components/crop/CropHarvestForecasterCard';
import { RecordHarvestModal } from '../components/crop/RecordHarvestModal';
import {
  Sprout,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  QrCode,
  Sparkles,
  ArrowRight,
  Scale,
  DollarSign,
  TrendingDown,
  CloudOff,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  Package,
  CreditCard,
  Building2,
  Layers,
  Clock,
  ExternalLink,
  Check,
  CalendarDays
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGES = [
  { key: 'Listed', label: 'Listed', desc: 'Crop published in supply pool' },
  { key: 'Matched', label: 'Matched', desc: 'Matched with buyer demand' },
  { key: 'Agreement Pending', label: 'Agreement', desc: 'Price & volume agreed' },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Order confirmed & locked' },
  { key: 'Collection', label: 'Collection', desc: 'Farm-gate FPO collection' },
  { key: 'Quality Check', label: 'Quality Check', desc: 'Lab assay & grading' },
  { key: 'Packed', label: 'Packed', desc: 'Crated & QR sealed' },
  { key: 'In Transit', label: 'In Transit', desc: 'Cold reefer expressway transit' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered to buyer facility' },
  { key: 'Payment Completed', label: 'Payment', desc: 'Escrow disbursed to bank' }
] as const;

type LifecycleStage = typeof STAGES[number]['key'];

const getStageBadgeColor = (stage: LifecycleStage): string => {
  switch (stage) {
    case 'Listed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium';
    case 'Matched':
      return 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
    case 'Agreement Pending':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200 font-medium';
    case 'Confirmed':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200 font-medium';
    case 'Collection':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    case 'Quality Check':
      return 'bg-purple-50 text-purple-800 border-purple-200 font-medium';
    case 'Packed':
      return 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
    case 'In Transit':
      return 'bg-sky-50 text-sky-800 border-sky-200 font-medium';
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium';
    case 'Payment Completed':
      return 'bg-emerald-700 text-white border-emerald-800 font-medium';
    default:
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
  }
};

const getFarmerProduceLifecycle = (
  listing: ProduceListing,
  orders: WorkflowOrder[],
  agreements: WorkflowAgreement[]
) => {
  const relatedOrders = orders.filter((o) => o.produceListingId === listing.id);
  const relatedAgreements = agreements.filter((a) => a.produceListingId === listing.id);

  if (relatedOrders.length > 0) {
    const activeOrder = relatedOrders[0];
    let stage: LifecycleStage = 'Confirmed';

    switch (activeOrder.status) {
      case 'Created':
      case 'Pending':
      case 'Produce Collection Pending':
        stage = 'Confirmed';
        break;
      case 'Collected':
        stage = 'Collection';
        break;
      case 'Quality Checked':
        stage = 'Quality Check';
        break;
      case 'Packed':
        stage = 'Packed';
        break;
      case 'Transport Assigned':
      case 'In Transit':
        stage = 'In Transit';
        break;
      case 'Delivered':
      case 'Buyer Confirmed':
        stage = 'Delivered';
        break;
      case 'Payment Pending':
      case 'Completed':
        stage = 'Payment Completed';
        break;
      default:
        stage = 'Confirmed';
    }

    const stageIndex = STAGES.findIndex((s) => s.key === stage);
    return {
      stage,
      stageIndex,
      badgeColor: getStageBadgeColor(stage),
      activeOrder,
      relatedOrders,
      relatedAgreements
    };
  }

  if (relatedAgreements.length > 0) {
    const agr = relatedAgreements[0];
    const stage: LifecycleStage = agr.status === 'CONFIRMED' ? 'Confirmed' : 'Agreement Pending';
    const stageIndex = STAGES.findIndex((s) => s.key === stage);
    return {
      stage,
      stageIndex,
      badgeColor: getStageBadgeColor(stage),
      relatedOrders,
      relatedAgreements
    };
  }

  if (listing.status === 'Matched' || (listing.allocatedQuantityKg && listing.allocatedQuantityKg > 0)) {
    return {
      stage: 'Matched' as LifecycleStage,
      stageIndex: 1,
      badgeColor: getStageBadgeColor('Matched'),
      relatedOrders,
      relatedAgreements
    };
  }

  return {
    stage: 'Listed' as LifecycleStage,
    stageIndex: 0,
    badgeColor: getStageBadgeColor('Listed'),
    relatedOrders,
    relatedAgreements
  };
};

export const FarmerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [drawerState, setDrawerState] = useState<{ type: string; data?: any } | null>(null);
  const {
    currentUser,
    setActiveTab,
    openPassportModal,
    produceListings: listings,
    orders,
    agreements,
    addProduceListing,
    deleteProduceListing,
    isOnline
  } = useApp();

  const [isAddingListing, setIsAddingListing] = useState(false);
  const [crop, setCrop] = useState('Tomato');
  const [cropId, setCropId] = useState('CROP-TOMATO');
  const [variety, setVariety] = useState('Arka Rakshak');
  const [varietyId, setVarietyId] = useState('VAR-TOM-01');
  const [customVariety, setCustomVariety] = useState('');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<string>('kg');
  const [price, setPrice] = useState<number>(25.0);
  const [harvestDate, setHarvestDate] = useState('2026-09-14');
  const [quality, setQuality] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [location, setLocation] = useState(currentUser.location || 'Chinnasalem Agro Hub, Kallakurichi');
  const [fpoName, setFpoName] = useState(currentUser.fpoName || 'Kallakurichi Pasumai Farmers Producer Co.');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showYieldEstimator, setShowYieldEstimator] = useState(false);
  const [showHarvestForecaster, setShowHarvestForecaster] = useState(false);
  const [selectedListingForHarvest, setSelectedListingForHarvest] = useState<ProduceListing | null>(null);

  const handleListProduceFromYield = (data: { crop: string; variety?: string; estimatedKg: number; grade: string }) => {
    setCrop(data.crop);
    if (data.variety) setVariety(data.variety);
    setQuantity(data.estimatedKg);
    setUnit('kg');
    setQuality(data.grade as any || 'Grade A');
    setIsAddingListing(true);
    setShowYieldEstimator(false);
  };

  const forecast = CHENNAI_TOMATO_FORECAST;

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();

    let computedKg = Number(quantity);
    if (unit === 'Quintal') computedKg = computedKg * 100;
    else if (unit === 'Crates') computedKg = computedKg * 25;
    else if (unit === 'Ton') computedKg = computedKg * 1000;

    const finalVariety =
      (variety === 'Other' || varietyId?.includes('OTHER')) && customVariety.trim()
        ? customVariety.trim()
        : (variety || 'Certified Regional Variety');

    const newCropItem: ProduceListing = {
      id: `LST-${Date.now().toString().slice(-4)}`,
      farmerId: currentUser.id || 'usr-farmer-01',
      farmerName: currentUser.name || 'Farmer',
      crop,
      cropId: cropId || undefined,
      variety: finalVariety,
      varietyId: varietyId || undefined,
      quantityKg: computedKg,
      initialQuantityKg: computedKg,
      allocatedQuantityKg: 0,
      unit: unit || 'kg',
      grade: quality,
      expectedPricePerKg: Number(price),
      harvestDate,
      availabilityDate: harvestDate,
      location: location || currentUser.location || 'Salem Mandi Hub',
      fpoName: fpoName || 'GreenHarvest FPO',
      status: 'Listed'
    };

    addProduceListing(newCropItem);
    setIsAddingListing(false);

    if (!isOnline) {
      setSuccessMessage(
        `Saved locally on device (Offline Field Mode): ${newCropItem.quantityKg.toLocaleString()} kg of ${newCropItem.crop} (${newCropItem.variety}). Synchronizes automatically once network returns!`
      );
    } else {
      setSuccessMessage(
        `Produce listed successfully: ${newCropItem.quantityKg.toLocaleString()} kg of ${newCropItem.crop} (${newCropItem.variety}) in ${newCropItem.location} @ ₹${newCropItem.expectedPricePerKg}/kg!`
      );
    }
    confetti({
      particleCount: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleRemove = (id: string) => {
    deleteProduceListing(id);
  };

  const filteredListings = listings.filter((item) => {
    const lifecycle = getFarmerProduceLifecycle(item, orders, agreements);
    if (statusFilter === 'ACTIVE') {
      return lifecycle.stage !== 'Payment Completed';
    }
    if (statusFilter === 'COMPLETED') {
      return lifecycle.stage === 'Payment Completed';
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 w-full">
        {/* 1. Agricultural Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#01472e] via-[#025235] to-[#013823] text-[#fefae0] rounded-[32px] p-6 sm:p-9 border border-[#a3b18a]/30 shadow-forest">
        {/* Subtle botanical background ambient glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#ccd5ae]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#a3b18a]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ccd5ae] text-xs font-medium border border-white/15 backdrop-blur-xs">
              <Sprout className="w-4 h-4 text-[#ccd5ae]" />
              <span>{currentUser.fpoName || 'GreenHarvest FPO Cluster'} • Farm: {currentUser.farmSizeAcres || 3.5} Acres</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
                {t('farmer.heroTitle', 'Better Markets. Better Prices. Better Futures.')}
              </h1>
              <p className="text-sm text-[#fefae0]/80 mt-2 font-normal leading-relaxed">
                {t('farmer.heroSubtitle', 'Welcome back, {name} • Connect your harvest directly with institutional buyers, secure transparent farm-gate pricing, and bypass multiple intermediary commissions.', { name: (currentUser.name || 'Farmer').split(' ')[0] })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('find-buyers')}
              className="inline-flex items-center gap-2 bg-[#ccd5ae] hover:bg-[#b9c595] text-[#01472e] text-xs font-medium px-5 py-3 rounded-2xl shadow-soft transition cursor-pointer"
            >
              <span>{t('farmer.findBuyers', 'Find Buyers')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('smart-matching')}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white text-xs font-medium px-4 py-3 rounded-2xl border border-white/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#ccd5ae]" />
              <span>{t('farmer.smartMatch', 'Smart Match')}</span>
            </button>

            <button
              onClick={() => openPassportModal()}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/20 text-white text-xs font-medium px-4 py-3 rounded-2xl border border-white/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#ccd5ae]" />
              <span>{t('farmer.batchQr', 'Batch QR')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Mini-Cards */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] px-1">
          {t('farmer.quickOps', 'Quick Operations')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { id: 'add-crop', label: t('farmer.addCrop', 'Add Crop'), icon: Plus, action: () => setIsAddingListing(true), badge: t('farmer.listBadge', 'List') },
            { id: 'yield-predict', label: t('farmer.yieldPredict', 'Yield Predict'), icon: Sprout, action: () => setShowYieldEstimator(!showYieldEstimator), badge: 'ML Model' },
            { id: 'harvest-forecast', label: t('farmer.harvestForecast', 'Harvest Forecast'), icon: CalendarDays, action: () => { setShowHarvestForecaster(!showHarvestForecaster); setShowYieldEstimator(false); }, badge: t('farmer.calendarAIBadge', 'Calendar AI') },
            { id: 'find-buyers', label: t('farmer.findBuyers', 'Find Buyers'), icon: ArrowRight, action: () => setActiveTab('find-buyers'), badge: t('farmer.directBadge', 'Direct') },
            { id: 'smart-match', label: t('farmer.matchPool', 'Match Pool'), icon: Sparkles, action: () => setActiveTab('smart-matching'), badge: t('farmer.aiBadge', 'AI') },
            { id: 'orders', label: t('farmer.myOrders', 'My Orders'), icon: Package, action: () => setActiveTab('orders'), badge: t('farmer.trackBadge', 'Track') },
            { id: 'middleman', label: t('farmer.costSim', 'Cost Sim'), icon: Scale, action: () => setActiveTab('cost-simulator'), badge: t('farmer.compareBadge', 'Compare') },
            { id: 'passport', label: t('farmer.qrPassport', 'QR Passport'), icon: QrCode, action: () => openPassportModal(), badge: t('farmer.verifyBadge', 'Verify') },
          ].map((act) => (
            <button
              key={act.id}
              onClick={act.action}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                (act.id === 'yield-predict' && showYieldEstimator) ||
                (act.id === 'harvest-forecast' && showHarvestForecaster)
                  ? 'bg-[#01472e] text-[#fefae0] border-[#01472e] shadow-md'
                  : 'bg-white border-[#ccd5ae]/50 hover:border-[#01472e]/50 hover:bg-[#fefae0]/40 shadow-soft'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                (act.id === 'yield-predict' && showYieldEstimator) ||
                (act.id === 'harvest-forecast' && showHarvestForecaster)
                  ? 'bg-white/20 text-white'
                  : 'bg-[#eaf4ec] text-[#01472e] group-hover:bg-[#01472e] group-hover:text-[#fefae0]'
              }`}>
                <act.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-medium block truncate ${
                  (act.id === 'yield-predict' && showYieldEstimator) ||
                  (act.id === 'harvest-forecast' && showHarvestForecaster)
                    ? 'text-white'
                    : 'text-[#01472e]'
                }`}>{act.label}</span>
                <span className={`text-[10px] font-normal ${
                  (act.id === 'yield-predict' && showYieldEstimator) ||
                  (act.id === 'harvest-forecast' && showHarvestForecaster)
                    ? 'text-[#ccd5ae]'
                    : 'text-[#5c7065]'
                }`}>{act.badge}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2.5 Crop Yield Prediction Section */}
      {showYieldEstimator && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('farmer.yieldEstimatorTitle', 'AI Crop Yield Intelligence Engine (Random Forest)')}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowYieldEstimator(false)}
              className="text-xs text-[#5c7065] hover:text-[#01472e] cursor-pointer"
            >
              {t('common.hideEstimator', 'Hide Estimator')}
            </button>
          </div>
          <CropYieldPredictionCard onListProduce={handleListProduceFromYield} />
        </div>
      )}

      {/* 2.6 Crop Harvest Forecaster Section */}
      {showHarvestForecaster && (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('farmer.harvestForecastTitle', 'Harvest Forecast & Crop Calendar Intelligence')}</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('harvest-forecast')}
                className="text-xs text-[#01472e] hover:underline cursor-pointer font-medium"
              >
                {t('common.fullPage', 'Full Page →')}
              </button>
              <button
                type="button"
                onClick={() => setShowHarvestForecaster(false)}
                className="text-xs text-[#5c7065] hover:text-[#01472e] cursor-pointer"
              >
                {t('common.hide', 'Hide')}
              </button>
            </div>
          </div>
          <CropHarvestForecasterCard
            onListProduce={(data) => {
              setCrop(data.crop);
              if (data.variety) setVariety(data.variety);
              setIsAddingListing(true);
              setShowHarvestForecaster(false);
            }}
          />
        </div>
      )}

      {/* 3. AI Farmer Mentor Card */}
      <div className="p-6 rounded-[28px] bg-[#eaf4ec]/90 border border-[#a3b18a]/50 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ccd5ae]/20 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#01472e] text-[#fefae0] flex items-center justify-center shadow-soft shrink-0">
            <Sparkles className="w-6 h-6 text-[#ccd5ae]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#01472e] border border-[#a3b18a]/40 mb-1.5 shadow-2xs">
              <span>{t('farmer.aiMentor', '✦ AI Farmer Mentor')}</span>
            </div>
            <h3 className="text-lg font-medium text-[#01472e] tracking-tight">
              {t('farmer.aiMentorDesc', 'Get personalized insights for better decisions')}
            </h3>
            <p className="text-xs text-[#5c7065] leading-relaxed max-w-2xl mt-1">
              {t('farmer.aiMentorTip', '"Koyambedu wholesale terminal demand for hybrid tomato is projected +18% higher next week. Recommended harvest window: Sep 14-17 for Grade A institutional premiums."')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('demand-forecast')}
          className="btn-primary self-start md:self-center shrink-0 text-xs px-5 py-2.5 shadow-soft"
        >
          <span>{t('farmer.askMentor', 'Ask Mentor →')}</span>
        </button>
      </div>

      {/* 4. Key Metric Stat Cards */}
      <KPIGrid columns={4}>
        <KPIStatCard
          label={t('farmer.totalListedVolume', 'Total Listed Volume')}
          value={`${listings.reduce((sum, l) => sum + (l.quantityKg || 0), 0).toLocaleString()} kg`}
          subtitle={t('farmer.acrossLots', 'Across {count} produce lots', { count: listings.length })}
          icon={Sprout}
          trend={{ icon: TrendingUp }}
          subtitleColor="text-[#01472e]"
        />

        <KPIStatCard
          label={t('farmer.activeBuyerDemand', 'Active Buyer Demand')}
          value="1,000 kg"
          subtitle={t('farmer.terminalMatch', 'Koyambedu Terminal Match')}
          icon={Sparkles}
          badgeColor="bg-blue-50 text-blue-700 border-blue-200"
          trend={{ icon: Sparkles }}
          subtitleColor="text-blue-800"
        />

        <KPIStatCard
          label={t('farmer.directPayoutShare', 'Direct Payout Share')}
          value="89.0% net"
          subtitle={t('farmer.vsMandi', '+61.8% vs. Traditional Mandi')}
          icon={Scale}
          trend={{ icon: CheckCircle2 }}
          subtitleColor="text-[#01472e]"
        />

        <KPIStatCard
          label={t('farmer.assignedColdChain', 'Assigned Cold-Chain')}
          value="Reefer 4.0°C"
          subtitle={t('farmer.sensorFleet', 'Sensor Monitored Fleet')}
          icon={Truck}
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
          trend={{ icon: ShieldCheck }}
          subtitleColor="text-purple-800"
        />
      </KPIGrid>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upcoming Tasks Widget */}
      <UpcomingTasksWidget limit={4} />

      {/* 5. My Crops Section with Connected Lifecycle Tracker */}
      <div className="bg-white rounded-[32px] border border-[#ccd5ae]/50 shadow-soft overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-[#ccd5ae]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f5]/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-medium tracking-tight text-[#01472e]">
                {t('farmer.inventoryTitle', 'My Crops & Produce Inventory ({count})', { count: listings.length })}
              </h3>
              <span className="ai-badge">
                {t('farmer.connectedWorkflow', 'Connected Workflow')}
              </span>
            </div>
            <p className="text-xs text-[#5c7065] mt-1 font-normal">
              {t('farmer.inventorySubtitle', 'Live lifecycle state tracked across 10 stages from farm-gate harvest to direct escrow payout')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex bg-[#fefae0]/80 border border-[#ccd5ae]/60 p-1 rounded-2xl text-xs">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-[#01472e] text-[#fefae0] shadow-soft'
                      : 'text-[#5c7065] hover:text-[#01472e]'
                  }`}
                >
                  {filter === 'ALL' ? t('common.all', 'ALL') : filter === 'ACTIVE' ? t('common.active', 'ACTIVE') : t('common.completed', 'COMPLETED')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingListing(!isAddingListing)}
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingListing ? t('common.close', 'Close Form') : t('farmer.addCrop', 'Add Crop')}</span>
            </button>
          </div>
        </div>

        {/* Add Crop Form */}
        {isAddingListing && (
          <form onSubmit={handleAddCrop} className="p-6 sm:p-7 bg-[#faf9f5]/80 border-b border-[#ccd5ae]/40 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
                <CropVarietySearchDropdown
                  selectedCrop={crop}
                  selectedCropId={cropId}
                  selectedVariety={variety}
                  selectedVarietyId={varietyId}
                  customVariety={customVariety}
                  onSelect={(sel) => {
                    setCrop(sel.crop);
                    setCropId(sel.cropId);
                    setVariety(sel.variety);
                    setVarietyId(sel.varietyId);
                  }}
                  onCustomVarietyChange={(val) => setCustomVariety(val)}
                  label={t('farmer.cropName', 'Crop & Available Varieties')}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-[#01472e] block text-xs">{t('farmer.quantity', 'Quantity')}</label>
                  <button
                    type="button"
                    onClick={() => setShowYieldEstimator(true)}
                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-semibold inline-flex items-center gap-1 cursor-pointer bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Estimate with ML</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-2/3 input-modern"
                    min="10"
                    step="10"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 input-modern text-[11px]"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Crates">Crates</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-[#01472e] block mb-1 text-xs">{t('farmer.expectedPrice', 'Expected Price (₹/kg)')}</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="input-modern"
                  step="0.5"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-[#01472e] block mb-1 text-xs">{t('farmer.qualityGrade', 'Quality Grade')}</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="input-modern"
                >
                  <option value="Grade A">Grade A (Export / Institutional)</option>
                  <option value="Grade B">Grade B (Retail Standard)</option>
                  <option value="Standard">Standard Commercial</option>
                  <option value="Premium">Premium Handpicked</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-[#01472e] block mb-1 text-xs">{t('farmer.locationHub', 'Location / Mandi Hub')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Salem Mandi Hub"
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-[#01472e] block mb-1 text-xs">{t('farmer.harvestDate', 'Harvest Date')}</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="input-modern"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="font-medium text-[#01472e] block mb-1 text-xs">{t('farmer.fpoAssociation', 'FPO Association')}</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  placeholder="e.g. GreenHarvest FPO / Kaveri Farmers Collective"
                  className="input-modern"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 text-xs shadow-soft"
                >
                  {t('farmer.publishMatchingPool', 'Publish to Matching Pool')}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Listings Cards with Lifecycle View */}
        <div className="p-6 sm:p-7 space-y-5">
          {filteredListings.length === 0 ? (
            <div className="p-14 text-center text-[#5c7065] bg-[#faf9f5]/60 rounded-3xl border border-[#ccd5ae]/40">
              <Sprout className="w-12 h-12 mx-auto mb-3 text-[#a3b18a]" />
              <p className="font-medium text-[#01472e] text-base">{t('farmer.noListings', 'No produce listings found matching filter.')}</p>
              <p className="text-xs text-[#5c7065] mt-1 max-w-sm mx-auto">
                {t('farmer.startAdding', 'Start by adding your first harvest lot to discover real institutional buyer demand and bypass intermediary cuts.')}
              </p>
              <button
                onClick={() => setIsAddingListing(true)}
                className="mt-4 btn-primary text-xs"
              >
                {t('farmer.addYourFirstCrop', 'Add Your First Crop')}
              </button>
            </div>
          ) : (
            filteredListings.map((item) => {
              const lifecycle = getFarmerProduceLifecycle(item, orders, agreements);
              const isExpanded = expandedCardId === item.id;
              const totalListed = item.initialQuantityKg || (item.quantityKg + (item.allocatedQuantityKg || 0));
              const allocated = item.allocatedQuantityKg || 0;
              const available = item.quantityKg;
              const allocatedPct = totalListed > 0 ? Math.round((allocated / totalListed) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className="agri-card p-6 sm:p-7 space-y-5"
                >
                  {/* Row 1: Crop Header, Variety, FPO, and Real-Time Lifecycle Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ccd5ae]/30 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center shrink-0">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <h4 className="text-xl font-medium tracking-tight text-[#01472e]">
                          {item.crop}
                        </h4>
                        {item.variety && (
                          <span className="text-xs bg-[#fefae0] text-[#01472e] border border-[#ccd5ae] px-3 py-0.5 rounded-full font-medium">
                            {item.variety}
                          </span>
                        )}
                        {item.syncStatus === 'PENDING_SYNC' && (
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <CloudOff className="w-3 h-3 text-amber-600" />
                            <span>{t('farmer.offlineSaved', 'Offline Saved')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5c7065] font-normal">
                        {t('farmer.listingId', 'Listing ID')}: <strong className="font-mono text-[#01472e] font-medium">{item.id}</strong> • {t('farmer.fpoCluster', 'FPO Cluster')}: <strong className="text-[#01472e] font-medium">{item.fpoName || 'GreenHarvest FPO'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-[#788c80] block">
                          {t('farmer.lifecycleStage', 'Lifecycle Stage')}
                        </span>
                        <span className={`text-[11px] font-medium px-3.5 py-1 rounded-full border inline-block mt-0.5 ${lifecycle.badgeColor}`}>
                          {t(`stages.${lifecycle.stage}.label`, lifecycle.stage)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedListingForHarvest(item)}
                        className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-2xl transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                        title={t('farmer.recordActualHarvestTitle', 'Record Actual Harvest')}
                      >
                        <Scale className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('farmer.recordHarvest', 'Record Harvest')}</span>
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-[#788c80] hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition cursor-pointer"
                        title={t('common.delete', 'Delete Listing')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Inventory Allocation Bar (Remaining vs Allocated) & Specs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs text-[#01472e]">
                    {/* Inventory Allocation Box */}
                    <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065]">
                          {t('farmer.inventoryAllocation', 'Inventory Allocation')}
                        </span>
                        <span className="text-[11px] font-medium text-[#01472e]">
                          {allocatedPct}% {t('farmer.committed', 'Committed')}
                        </span>
                      </div>

                      <div className="w-full bg-[#ccd5ae]/40 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#01472e] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, allocatedPct)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                        <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-[#788c80] block">{t('farmer.available', 'Available')}</span>
                          <strong className="text-[#01472e] text-sm font-semibold">{available.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-[#788c80] block">{t('farmer.allocated', 'Allocated')}</span>
                          <strong className="text-amber-700 text-sm font-semibold">{allocated.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-[#788c80] block">{t('farmer.total', 'Total')}</span>
                          <strong className="text-[#01472e] text-sm font-semibold">{totalListed.toLocaleString()} kg</strong>
                        </div>
                      </div>
                    </div>

                    {/* Listing Parameters Box */}
                    <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] flex items-center gap-1 mb-0.5">
                          <TrendingUp className="w-3 h-3 text-[#01472e]" />
                          <span>{t('farmer.expectedPriceLabel', 'Expected Price')}</span>
                        </span>
                        <strong className="text-[#01472e] text-base sm:text-lg font-semibold tracking-tight">₹{item.expectedPricePerKg}/kg</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] flex items-center gap-1 mb-0.5">
                          <ShieldCheck className="w-3 h-3 text-[#01472e]" />
                          <span>{t('farmer.gradeLabel', 'Quality Grade')}</span>
                        </span>
                        <strong className="text-[#01472e] font-medium">{item.grade}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] flex items-center gap-1 mb-0.5">
                          <MapPin className="w-3 h-3 text-[#01472e]" />
                          <span>{t('farmer.locationLabel', 'Location Hub')}</span>
                        </span>
                        <span className="text-[#01472e] font-medium truncate block">{item.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 text-[#01472e]" />
                          <span>{t('farmer.harvestDateLabel', 'Harvest Date')}</span>
                        </span>
                        <span className="text-[#01472e] font-medium">{item.harvestDate}</span>
                      </div>
                    </div>

                    {/* Actions & Navigation Box */}
                    <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#5c7065] block mb-1">
                          {t('farmer.connectedBuyerMatching', 'Connected Buyer Matching')}
                        </span>
                        <p className="text-xs text-[#5c7065] font-normal leading-relaxed">
                          {available > 0
                            ? t('farmer.availableForMatching', '✓ {available} kg available for smart institutional matching.', { available: available.toLocaleString() })
                            : t('farmer.fullyMatched', 'Produce fully matched and allocated to active buyer orders.')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {available > 0 ? (
                          <button
                            onClick={() => setActiveTab('smart-matching')}
                            className="flex-1 btn-primary py-2.5 text-xs shadow-soft"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('farmer.matchWithQty', 'Match ({count} kg)', { count: available.toLocaleString() })}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="flex-1 btn-outline py-2.5 text-xs"
                          >
                            <span>{t('farmer.viewInOrders', 'View In Orders')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                          className="px-3.5 py-2.5 bg-[#eaf4ec] hover:bg-[#d5ebd9] text-[#01472e] text-xs font-medium rounded-2xl border border-[#a3b18a]/40 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{isExpanded ? t('common.hide', 'Hide') : t('farmer.lifecycle', 'Lifecycle')}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: 10-Stage Connected Lifecycle Stepper */}
                  <div className="bg-[#faf9f5] border border-[#ccd5ae]/50 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#5c7065] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#01472e]" />
                        <span>{t('farmer.supplyChainStage', 'Supply Chain Lifecycle • Stage {stage} of 10', { stage: lifecycle.stageIndex + 1 })}</span>
                      </span>
                      <span className="text-[11px] font-medium text-[#01472e] font-mono">
                        {lifecycle.activeOrder ? t('farmer.orderNum', 'Order #{id}', { id: lifecycle.activeOrder.id }) : t('farmer.smartSupplyPool', 'Smart Supply Pool')}
                      </span>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                      {STAGES.map((st, idx) => {
                        const isPast = idx < lifecycle.stageIndex;
                        const isCurrent = idx === lifecycle.stageIndex;

                        return (
                          <div
                            key={st.key}
                            className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                              isCurrent
                                ? 'bg-[#01472e] text-[#fefae0] border-[#01472e] shadow-soft ring-2 ring-[#01472e]/20'
                                : isPast
                                ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40 font-medium'
                                : 'bg-white text-[#788c80] border-[#ccd5ae]/40'
                            }`}
                            title={t(`stages.${st.key}.desc`, st.desc)}
                          >
                            <div className="w-4 h-4 rounded-full flex items-center justify-center mb-1 text-[10px] font-medium">
                              {isPast ? (
                                <Check className="w-3 h-3 text-[#01472e]" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span className="text-[9px] font-medium uppercase tracking-tight truncate w-full block">
                              {t(`stages.${st.key}.label`, st.label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 4: Expandable Detailed Audit Drawer */}
                  {isExpanded && (
                    <div className="bg-[#faf9f5] border border-[#ccd5ae]/60 rounded-2xl p-5 space-y-4 text-xs shadow-soft animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-[#ccd5ae]/30 pb-3">
                        <div className="flex items-center gap-2 text-[#01472e] font-medium text-sm">
                          <ShieldCheck className="w-4 h-4 text-[#01472e]" />
                          <span>{t('farmer.auditTrail', 'Order & Quality Verification Audit Trail')}</span>
                        </div>
                        {lifecycle.activeOrder && (
                          <button
                            onClick={() => openPassportModal(lifecycle.activeOrder?.batchId)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#01472e] bg-[#eaf4ec] px-3.5 py-1.5 rounded-xl border border-[#a3b18a]/40 hover:bg-[#d5ebd9] transition cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{t('farmer.passportWithBatch', 'Digital Produce Passport ({batchId})', { batchId: lifecycle.activeOrder.batchId })}</span>
                          </button>
                        )}
                      </div>

                      {lifecycle.activeOrder ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] block mb-0.5">{t('farmer.orderBuyer', 'Order & Buyer')}</span>
                            <strong className="text-[#01472e] block font-medium">{lifecycle.activeOrder.id}</strong>
                            <span className="text-[#5c7065] truncate block">{lifecycle.activeOrder.buyerName}</span>
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] block mb-0.5">{t('farmer.agreedTerms', 'Agreed Terms')}</span>
                            <strong className="text-[#01472e] block font-medium">{lifecycle.activeOrder.quantityKg.toLocaleString()} kg @ ₹{lifecycle.activeOrder.pricePerKg}/kg</strong>
                            <span className="text-[#01472e] font-semibold">{t('common.total', 'Total')}: ₹{lifecycle.activeOrder.totalValue.toLocaleString()}</span>
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] block mb-0.5">{t('farmer.labMetrics', 'Lab Quality Metrics')}</span>
                            {lifecycle.activeOrder.inspectionMetrics ? (
                              <span className="text-[#01472e] font-medium block">
                                Brix: {lifecycle.activeOrder.inspectionMetrics.sugarBrix}° • {lifecycle.activeOrder.inspectionMetrics.verifiedGrade}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium block">{t('farmer.pendingAssay', 'Pending FPO Hub Assay')}</span>
                            )}
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#788c80] block mb-0.5">{t('farmer.logisticsReefer', 'Logistics / Reefer')}</span>
                            {lifecycle.activeOrder.transportDetails ? (
                              <span className="text-[#01472e] font-medium block">
                                {lifecycle.activeOrder.transportDetails.vehicleNumber} ({lifecycle.activeOrder.transportDetails.driverName})
                              </span>
                            ) : (
                              <span className="text-[#788c80] font-medium block">{t('farmer.awaitingDispatch', 'Awaiting Carrier Dispatch')}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-[#ccd5ae]/40 text-[#5c7065]">
                          <p>
                            {t('farmer.publishedInPoolDesc', 'This produce is published and currently active in the Smart Matching Pool. When an institutional buyer creates or confirms demand, an agreement and order will automatically bind here.')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

      {/* ── DETAIL DRAWER ─────────────────────────────────────────── */}
      <DetailDrawer
        isOpen={!!drawerState}
        onClose={() => setDrawerState(null)}
        title={
          drawerState?.type === 'harvest-listing' ? `${drawerState.data?.crop || 'Produce'} (${drawerState.data?.variety || 'Lot'})` :
          drawerState?.type === 'listed-volume' ? 'Total Listed Volume' :
          drawerState?.type === 'buyer-demand' ? 'Active Buyer Demand' :
          drawerState?.type === 'payout-share' ? 'Direct Payout Share' :
          drawerState?.type === 'cold-chain' ? 'Assigned Cold-Chain' :
          drawerState?.type === 'ai-mentor' ? 'AI Farmer Mentor & Demand Forecast' :
          'Details'
        }
        description={
          drawerState?.type === 'harvest-listing' ? `Listing ID: ${drawerState.data?.id} • ${drawerState.data?.fpoName || 'GreenHarvest FPO'}` :
          drawerState?.type === 'listed-volume' ? 'All your produce listings and quantities' :
          drawerState?.type === 'buyer-demand' ? 'Current demand matching your produce' :
          drawerState?.type === 'payout-share' ? 'Earnings breakdown comparison' :
          drawerState?.type === 'cold-chain' ? 'Cold-chain transport assignment details' :
          drawerState?.type === 'ai-mentor' ? 'Predictive intelligence, Brix advisory & 7-day forecast' :
          undefined
        }
        icon={
          drawerState?.type === 'harvest-listing' ? Sprout :
          drawerState?.type === 'listed-volume' ? Sprout :
          drawerState?.type === 'buyer-demand' ? Sparkles :
          drawerState?.type === 'payout-share' ? Scale :
          drawerState?.type === 'cold-chain' ? Truck :
          drawerState?.type === 'ai-mentor' ? Sparkles :
          undefined
        }
        width={drawerState?.type === 'harvest-listing' || drawerState?.type === 'ai-mentor' ? 'lg' : 'md'}
        footer={
          drawerState?.type === 'harvest-listing' && drawerState.data ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => { setDrawerState(null); setActiveTab('smart-matching'); }} 
                className="btn-primary text-xs flex-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> Smart Match ({drawerState.data.quantityKg.toLocaleString()} kg)
              </button>
              <button 
                onClick={() => { setDrawerState(null); openPassportModal(); }} 
                className="btn-secondary text-xs"
              >
                <QrCode className="w-3.5 h-3.5" /> Batch QR Passport
              </button>
              <button onClick={() => setDrawerState(null)} className="btn-ghost text-xs">Close</button>
            </div>
          ) : drawerState?.type === 'listed-volume' ? (
            <div className="flex gap-2">
              <button onClick={() => { setDrawerState(null); setIsAddingListing(true); }} className="btn-primary text-xs flex-1"><Plus className="w-3.5 h-3.5" /> Add New Crop</button>
              <button onClick={() => setDrawerState(null)} className="btn-ghost text-xs">Close</button>
            </div>
          ) : drawerState?.type === 'buyer-demand' ? (
            <div className="flex gap-2">
              <button onClick={() => { setDrawerState(null); setActiveTab('smart-matching'); }} className="btn-primary text-xs flex-1"><Sparkles className="w-3.5 h-3.5" /> Smart Match</button>
              <button onClick={() => setDrawerState(null)} className="btn-ghost text-xs">Close</button>
            </div>
          ) : drawerState?.type === 'ai-mentor' ? (
            <div className="flex gap-2">
              <button onClick={() => { setDrawerState(null); setActiveTab('smart-matching'); }} className="btn-primary text-xs flex-1"><Sparkles className="w-3.5 h-3.5" /> Match for Market Premium</button>
              <button onClick={() => setDrawerState(null)} className="btn-ghost text-xs">Close</button>
            </div>
          ) : undefined
        }
      >
        {/* Harvest Listing Full View Drawer */}
        {drawerState?.type === 'harvest-listing' && drawerState.data && (() => {
          const item: ProduceListing = drawerState.data;
          const lifecycle = getFarmerProduceLifecycle(item, orders, agreements);
          const totalListed = item.initialQuantityKg || (item.quantityKg + (item.allocatedQuantityKg || 0));
          const allocated = item.allocatedQuantityKg || 0;
          const available = item.quantityKg;
          const allocatedPct = totalListed > 0 ? Math.round((allocated / totalListed) * 100) : 0;

          return (
            <div className="space-y-4">
              {/* Header Status & Identification */}
              <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#01472e] font-semibold">{item.id}</span>
                  <span className={`text-[10px] font-semibold px-3 py-0.5 rounded-full border ${lifecycle.badgeColor}`}>
                    {lifecycle.stage}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#01472e]">{item.crop}</h3>
                    <p className="text-xs text-[#5c7065]">{item.variety || 'Certified Hybrid Lot'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#01472e]">₹{item.expectedPricePerKg}</span>
                    <span className="text-[10px] text-[#5c7065] block">/kg expected</span>
                  </div>
                </div>
              </div>

              {/* Volume & Inventory Allocation Strip */}
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#01472e] uppercase tracking-wider text-[10px]">Inventory Allocation</span>
                  <span className="font-semibold text-[#01472e]">{allocatedPct}% Committed</span>
                </div>
                <div className="w-full bg-[#ccd5ae]/40 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#01472e] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, allocatedPct)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[9px] uppercase text-[#788c80] block font-medium">Available</span>
                    <span className="font-bold text-[#01472e] text-sm">{available.toLocaleString()} kg</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[9px] uppercase text-[#788c80] block font-medium">Allocated</span>
                    <span className="font-bold text-amber-700 text-sm">{allocated.toLocaleString()} kg</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[9px] uppercase text-[#788c80] block font-medium">Total Listed</span>
                    <span className="font-bold text-[#01472e] text-sm">{totalListed.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>

              {/* Quality & Lot Specifications */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Lot Specifications</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[10px] text-[#788c80] block">Quality Grade</span>
                    <span className="text-xs font-semibold text-[#01472e]">{item.grade}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[10px] text-[#788c80] block">Harvest Date</span>
                    <span className="text-xs font-semibold text-[#01472e]">{item.harvestDate}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[10px] text-[#788c80] block">Mandi / Hub</span>
                    <span className="text-xs font-semibold text-[#01472e] truncate block">{item.location}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                    <span className="text-[10px] text-[#788c80] block">FPO Partner</span>
                    <span className="text-xs font-semibold text-[#01472e] truncate block">{item.fpoName || 'GreenHarvest FPO'}</span>
                  </div>
                </div>
              </div>

              {/* 10-Stage Supply Chain Stepper */}
              <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#01472e] uppercase tracking-wider text-[10px]">
                    Supply Chain Lifecycle (Stage {lifecycle.stageIndex + 1} of 10)
                  </span>
                  <span className="text-[10px] text-[#01472e] font-mono font-medium">
                    {lifecycle.activeOrder ? `Order #${lifecycle.activeOrder.id}` : 'Open Supply Pool'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {STAGES.map((st, idx) => {
                    const isPast = idx < lifecycle.stageIndex;
                    const isCurrent = idx === lifecycle.stageIndex;
                    return (
                      <div
                        key={st.key}
                        className={`p-1.5 rounded-lg border text-center text-[9px] ${
                          isCurrent
                            ? 'bg-[#01472e] text-[#fefae0] border-[#01472e] font-bold shadow-2xs'
                            : isPast
                            ? 'bg-[#eaf4ec] text-[#01472e] border-[#a3b18a]/40 font-semibold'
                            : 'bg-white text-[#788c80] border-[#ccd5ae]/30'
                        }`}
                      >
                        <span className="block font-mono">{idx + 1}</span>
                        <span className="truncate block">{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Listed Volume Drawer */}
        {drawerState?.type === 'listed-volume' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#eaf4ec] rounded-xl border border-[#a3b18a]/30">
              <span className="text-xs font-medium text-[#01472e]">Total Volume</span>
              <span className="text-sm font-bold text-[#01472e]">{listings.reduce((sum, l) => sum + (l.quantityKg || 0), 0).toLocaleString()} kg</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#faf9f5] rounded-xl border border-[#ccd5ae]/30">
              <span className="text-xs font-medium text-[#5c7065]">Produce Lots</span>
              <span className="text-sm font-semibold text-[#01472e]">{listings.length}</span>
            </div>
            <div className="pt-2 space-y-2">
              {listings.map((item) => {
                const lifecycle = getFarmerProduceLifecycle(item, orders, agreements);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setDrawerState({ type: 'harvest-listing', data: item })}
                    className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs space-y-1.5 hover:border-[#01472e]/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sprout className="w-3.5 h-3.5 text-[#01472e]" />
                        <span className="text-xs font-semibold text-[#01472e]">{item.crop}</span>
                        {item.variety && <span className="text-[10px] bg-[#fefae0] text-[#01472e] border border-[#ccd5ae] px-2 py-0.5 rounded-full">{item.variety}</span>}
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${lifecycle.badgeColor}`}>{lifecycle.stage}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-[#5c7065]">
                      <div><span className="block font-medium text-[#788c80]">Qty</span><span className="text-[#01472e] font-semibold">{item.quantityKg.toLocaleString()} kg</span></div>
                      <div><span className="block font-medium text-[#788c80]">Price</span><span className="text-[#01472e] font-semibold">₹{item.expectedPricePerKg}/kg</span></div>
                      <div><span className="block font-medium text-[#788c80]">Grade</span><span className="text-[#01472e] font-semibold">{item.grade}</span></div>
                    </div>
                    <div className="text-[10px] text-[#5c7065] flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                      <span className="text-[#01472e] font-semibold flex items-center gap-0.5">Details →</span>
                    </div>
                  </div>
                );
              })}
              {listings.length === 0 && (
                <div className="p-6 text-center text-[#5c7065] text-xs">
                  <Sprout className="w-8 h-8 mx-auto mb-2 text-[#a3b18a]" />
                  <p>No produce listings yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buyer Demand Drawer */}
        {drawerState?.type === 'buyer-demand' && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-700" /><span className="text-xs font-semibold text-blue-900">Active Demand Match</span></div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[10px] font-medium text-blue-600 block">Buyer</span><span className="font-semibold text-blue-900">Koyambedu Terminal</span></div>
                <div><span className="text-[10px] font-medium text-blue-600 block">Product</span><span className="font-semibold text-blue-900">Tomato</span></div>
                <div><span className="text-[10px] font-medium text-blue-600 block">Required</span><span className="font-semibold text-blue-900">1,000 kg</span></div>
                <div><span className="text-[10px] font-medium text-blue-600 block">Quality</span><span className="font-semibold text-blue-900">Grade A</span></div>
                <div><span className="text-[10px] font-medium text-blue-600 block">Delivery</span><span className="font-semibold text-blue-900">Sep 17, 2026</span></div>
                <div><span className="text-[10px] font-medium text-blue-600 block">Status</span><span className="font-semibold text-emerald-700">Open</span></div>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Matching Farmers</span>
              <div className="mt-2 space-y-2">
                {[
                  { name: 'Kallakurichi Farmer A', qty: 400, match: '92% match', rate: '₹26/kg' },
                  { name: 'Salem Hub Farmer B', qty: 350, match: '87% match', rate: '₹25.5/kg' },
                  { name: 'Attur Collective C', qty: 250, match: '84% match', rate: '₹25/kg' }
                ].map((m, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-[#01472e] block">{m.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{m.match}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#01472e]">{m.qty.toLocaleString()} kg</span>
                      <span className="text-[10px] text-[#5c7065] block">{m.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payout Share Drawer */}
        {drawerState?.type === 'payout-share' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#eaf4ec] rounded-xl border border-[#a3b18a]/30">
              <div className="text-center">
                <span className="text-3xl font-bold text-[#01472e]">89.0%</span>
                <span className="text-xs text-[#5c7065] block mt-1">Net Farmer Realization</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Earnings Breakdown</span>
              {[
                { label: 'Farmer Share', value: '89.0%', color: 'bg-emerald-500' },
                { label: 'Logistics', value: '8.0%', color: 'bg-blue-400' },
                { label: 'FPO Service Fee', value: '3.0%', color: 'bg-amber-400' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                  <div className={`w-3 h-3 rounded-full ${row.color} shrink-0`} />
                  <span className="text-xs text-[#01472e] flex-1 font-medium">{row.label}</span>
                  <span className="text-xs font-bold text-[#01472e]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#faf9f5] rounded-xl border border-[#ccd5ae]/30 space-y-2">
              <span className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Comparison</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 text-center">
                  <span className="text-[10px] text-[#788c80] block">Traditional Mandi</span>
                  <span className="text-lg font-bold text-rose-600">27.2%</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 text-center">
                  <span className="text-[10px] text-[#788c80] block">Uzhavan Connect</span>
                  <span className="text-lg font-bold text-emerald-700">89.0%</span>
                </div>
              </div>
              <div className="text-center text-xs text-emerald-700 font-semibold">+61.8% improvement in farmer earnings</div>
            </div>
          </div>
        )}

        {/* Cold-Chain Drawer */}
        {drawerState?.type === 'cold-chain' && (
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-700" /><span className="text-xs font-semibold text-purple-900">Cold-Chain Status</span></div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[10px] font-medium text-purple-600 block">Temperature</span><span className="font-semibold text-purple-900">4.0°C</span></div>
                <div><span className="text-[10px] font-medium text-purple-600 block">Type</span><span className="font-semibold text-purple-900">Reefer EV 5.5T</span></div>
                <div><span className="text-[10px] font-medium text-purple-600 block">Monitoring</span><span className="font-semibold text-purple-900">IoT Sensor</span></div>
                <div><span className="text-[10px] font-medium text-purple-600 block">Status</span><span className="font-semibold text-emerald-700">Active</span></div>
              </div>
            </div>
            {orders.filter(o => o.transportDetails).slice(0, 3).map((o) => (
              <div key={o.id} className="p-3.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#01472e]">{o.id}</span>
                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">{o.status}</span>
                </div>
                {o.transportDetails && (
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#5c7065]">
                    <div><span className="block font-medium text-[#788c80]">Vehicle</span><span className="text-[#01472e] font-semibold">{o.transportDetails.vehicleNumber}</span></div>
                    <div><span className="block font-medium text-[#788c80]">Driver</span><span className="text-[#01472e] font-semibold">{o.transportDetails.driverName}</span></div>
                    <div><span className="block font-medium text-[#788c80]">Carrier</span><span className="text-[#01472e] font-semibold">{o.transportDetails.carrierName}</span></div>
                    <div><span className="block font-medium text-[#788c80]">ETA</span><span className="text-[#01472e] font-semibold">{o.transportDetails.estimatedArrival}</span></div>
                  </div>
                )}
              </div>
            ))}
            {orders.filter(o => o.transportDetails).length === 0 && (
              <div className="p-4 text-center text-xs text-[#5c7065]">No active transport assignments.</div>
            )}
          </div>
        )}

        {/* AI Mentor & Demand Forecast Drawer */}
        {drawerState?.type === 'ai-mentor' && (
          <div className="space-y-4">
            {/* Primary Insight */}
            <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#a3b18a]/40 space-y-2">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#01472e]" /><span className="text-xs font-semibold text-[#01472e]">AI Agronomist Strategic Intelligence</span></div>
              <p className="text-xs text-[#01472e] leading-relaxed">
                {CHENNAI_TOMATO_FORECAST.insight}
              </p>
            </div>

            {/* Live 7-Day Demand Forecast Metrics */}
            <div className="p-4 bg-[#faf9f5] rounded-2xl border border-[#ccd5ae]/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#01472e] uppercase tracking-wider text-[10px]">
                  7-Day Forward Demand Forecast ({CHENNAI_TOMATO_FORECAST.crop})
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {CHENNAI_TOMATO_FORECAST.confidenceScore}% Confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                  <span className="text-[10px] text-[#788c80] block">Projected Demand</span>
                  <span className="font-bold text-[#01472e] text-sm">{CHENNAI_TOMATO_FORECAST.predictedDemandKg.toLocaleString()} kg</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">↑ +13.6% vs current</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                  <span className="text-[10px] text-[#788c80] block">Available Supply</span>
                  <span className="font-bold text-[#01472e] text-sm">{CHENNAI_TOMATO_FORECAST.availableSupplyKg.toLocaleString()} kg</span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">Deficit: {CHENNAI_TOMATO_FORECAST.supplyGapKg.toLocaleString()} kg</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                  <span className="text-[10px] text-[#788c80] block">Indicative Farmgate</span>
                  <span className="font-bold text-[#01472e] text-sm">₹{CHENNAI_TOMATO_FORECAST.indicativePricePerKg}/kg</span>
                  <span className="text-[10px] text-[#5c7065] block mt-0.5">Grade A Benchmark</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs">
                  <span className="text-[10px] text-[#788c80] block">Corridor Region</span>
                  <span className="font-bold text-[#01472e] text-xs truncate block">{CHENNAI_TOMATO_FORECAST.region}</span>
                  <span className="text-[10px] text-[#5c7065] block mt-0.5">{CHENNAI_TOMATO_FORECAST.modelVersion}</span>
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#01472e] uppercase tracking-wider">Actionable Recommendations</span>
              {[
                { tip: 'Harvest within Sep 16–20 for Grade A export & institutional retail contracts', icon: Calendar },
                { tip: 'Pre-grade lots at FPO hub: Grade A gets 15-25% premium above mandi floor', icon: TrendingUp },
                { tip: 'Maintain cold chain below 4.5°C to preserve firmness and Brix sugar rating', icon: ShieldCheck },
              ].map((r, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-[#ccd5ae]/40 shadow-2xs flex items-start gap-2.5">
                  <r.icon className="w-3.5 h-3.5 text-[#01472e] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#01472e] leading-snug">{r.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DetailDrawer>
      
      {/* Record Harvest Modal */}
      {selectedListingForHarvest && (
        <RecordHarvestModal
          listing={selectedListingForHarvest}
          onClose={() => setSelectedListingForHarvest(null)}
        />
      )}
    </div>
  );
};

