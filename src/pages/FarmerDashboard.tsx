import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHENNAI_TOMATO_FORECAST } from '../data/mockData';
import { ProduceListing, WorkflowOrder, WorkflowAgreement } from '../types';
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
  Check
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
  const [variety, setVariety] = useState('PKM-1 Hybrid');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<string>('kg');
  const [price, setPrice] = useState<number>(25.0);
  const [harvestDate, setHarvestDate] = useState('2026-09-14');
  const [quality, setQuality] = useState<'Grade A' | 'Grade B' | 'Standard' | 'Premium'>('Grade A');
  const [location, setLocation] = useState('Salem Mandi Hub');
  const [fpoName, setFpoName] = useState('GreenHarvest FPO');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forecast = CHENNAI_TOMATO_FORECAST;

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();

    let computedKg = Number(quantity);
    if (unit === 'Quintal') computedKg = computedKg * 100;
    else if (unit === 'Crates') computedKg = computedKg * 25;
    else if (unit === 'Ton') computedKg = computedKg * 1000;

    const newCropItem: ProduceListing = {
      id: `LST-${Date.now().toString().slice(-4)}`,
      farmerId: currentUser.id || 'usr-farmer-01',
      farmerName: currentUser.name || 'Farmer',
      crop,
      variety: variety || 'Certified Regional Variety',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Farmer Friendly Greeting Header */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-600/30 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>{currentUser.fpoName || 'GreenHarvest FPO Cluster'} • Farm Size: {currentUser.farmSizeAcres || 3.5} Acres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Greetings, {(currentUser.name || 'Farmer').split(' ')[0]} 👨‍🌾
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-normal leading-relaxed max-w-2xl">
            Connected Crop Lifecycle: Listing ➔ Smart Matching ➔ Agreement ➔ FPO Collection ➔ Grading ➔ Transport ➔ Escrow Payout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('find-buyers')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <span>Find Buyers</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('smart-matching')}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Smart Match Pool</span>
          </button>

          <button
            onClick={() => openPassportModal()}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-300" />
            <span>Batch QR</span>
          </button>
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Listed Volume</span>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
            {listings.reduce((sum, l) => sum + (l.quantityKg || 0), 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">kg</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Across {listings.length} produce lots
          </span>
        </div>

        <div className="metric-card">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Active Buyer Demand</span>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
            1,000 <span className="text-sm font-medium text-slate-500">kg</span>
          </p>
          <span className="text-[10px] text-blue-600 font-medium mt-1 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Koyambedu Terminal Match
          </span>
        </div>

        <div className="metric-card">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Direct Payout Share</span>
          <p className="text-2xl font-semibold tracking-tight text-emerald-700 mt-1">
            89.0% <span className="text-sm font-medium text-slate-500">net</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> +61.8% vs. Traditional Mandi
          </span>
        </div>

        <div className="metric-card">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Assigned Logistics</span>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
            Reefer 4.0°C
          </p>
          <span className="text-[10px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Cold-chain monitored
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. My Crops Section with Connected Lifecycle Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-medium tracking-tight text-slate-900">
                My Crops & Produce Inventory ({listings.length})
              </h3>
              <span className="ai-badge">
                Connected Workflow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live lifecycle state tracked across 10 stages from harvest to escrow settlement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white text-slate-900 font-medium shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingListing(!isAddingListing)}
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingListing ? 'Close Form' : 'Add Crop'}</span>
            </button>
          </div>
        </div>

        {/* Add Crop Form */}
        {isAddingListing && (
          <form onSubmit={handleAddCrop} className="p-6 bg-slate-50/70 border-b border-slate-100 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="font-medium text-slate-700 block mb-1 text-xs">Crop Name</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="input-modern"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Carrot">Carrot</option>
                  <option value="Green Chilli">Green Chilli</option>
                  <option value="Capsicum">Capsicum</option>
                  <option value="Potato">Potato</option>
                  <option value="Mango">Mango</option>
                  <option value="Cabbage">Cabbage</option>
                  <option value="Banana">Banana</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1 text-xs">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. PKM-1 Hybrid / Nattu"
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1 text-xs">Quantity</label>
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
                <label className="font-medium text-slate-700 block mb-1 text-xs">Expected Price (₹/kg)</label>
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
                <label className="font-medium text-slate-700 block mb-1 text-xs">Quality Grade</label>
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
                <label className="font-medium text-slate-700 block mb-1 text-xs">Location / Mandi Hub</label>
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
                <label className="font-medium text-slate-700 block mb-1 text-xs">Harvest Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="input-modern"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="font-medium text-slate-700 block mb-1 text-xs">FPO Association</label>
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
                  className="w-full btn-primary py-2.5 text-xs"
                >
                  Publish to Matching Pool
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Listings Cards with Lifecycle View */}
        <div className="p-6 space-y-4">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Sprout className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-700">No produce listings found matching filter.</p>
              <button
                onClick={() => setIsAddingListing(true)}
                className="mt-4 btn-primary text-xs"
              >
                Add Your First Crop
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
                  className="ai-card p-6 space-y-5"
                >
                  {/* Row 1: Crop Header, Variety, FPO, and Real-Time Lifecycle Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-xl font-medium tracking-tight text-slate-900">
                          {item.crop}
                        </h4>
                        {item.variety && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                            {item.variety}
                          </span>
                        )}
                        {item.syncStatus === 'PENDING_SYNC' && (
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <CloudOff className="w-3 h-3 text-amber-600" />
                            <span>Offline Saved</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Listing ID: <strong className="font-mono text-slate-700 font-medium">{item.id}</strong> • FPO Cluster: <strong className="text-slate-700 font-medium">{item.fpoName || 'GreenHarvest FPO'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400 block">Lifecycle Stage</span>
                        <span className={`text-[11px] font-medium px-3 py-0.5 rounded-full border inline-block mt-0.5 ${lifecycle.badgeColor}`}>
                          {lifecycle.stage}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Inventory Allocation Bar (Remaining vs Allocated) & Specs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs text-slate-700">
                    {/* Inventory Allocation Box */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                          Inventory Allocation
                        </span>
                        <span className="text-[11px] font-medium text-slate-900">
                          {allocatedPct}% Committed
                        </span>
                      </div>

                      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, allocatedPct)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-slate-400 block">Available</span>
                          <strong className="text-slate-900 text-sm font-semibold">{available.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-slate-400 block">Allocated</span>
                          <strong className="text-amber-700 text-sm font-semibold">{allocated.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                          <span className="text-[9px] uppercase font-medium text-slate-400 block">Total Listed</span>
                          <strong className="text-slate-900 text-sm font-semibold">{totalListed.toLocaleString()} kg</strong>
                        </div>
                      </div>
                    </div>

                    {/* Listing Parameters Box */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Expected Price</span>
                        <strong className="text-emerald-800 text-base font-semibold tracking-tight">₹{item.expectedPricePerKg}/kg</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Quality Grade</span>
                        <strong className="text-slate-900 font-medium">{item.grade}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Location Hub</span>
                        <span className="text-slate-800 font-medium truncate block">{item.location}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Harvest Date</span>
                        <span className="text-slate-800 font-medium">{item.harvestDate}</span>
                      </div>
                    </div>

                    {/* Actions & Navigation Box */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block mb-1">
                          Connected Buyer Matching
                        </span>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {available > 0
                            ? `✓ ${available.toLocaleString()} kg available for smart institutional matching.`
                            : 'Produce fully matched and allocated to active buyer orders.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {available > 0 ? (
                          <button
                            onClick={() => setActiveTab('smart-matching')}
                            className="flex-1 btn-primary py-2 text-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Match ({available.toLocaleString()} kg)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="flex-1 btn-outline py-2 text-xs"
                          >
                            <span>View In Orders</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 transition flex items-center gap-1.5"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Lifecycle View'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: 10-Stage Connected Lifecycle Stepper */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supply Chain Lifecycle • Stage {lifecycle.stageIndex + 1} of 10</span>
                      </span>
                      <span className="text-[11px] font-medium text-slate-700 font-mono">
                        {lifecycle.activeOrder ? `Order #${lifecycle.activeOrder.id}` : 'Smart Supply Pool'}
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
                            className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                              isCurrent
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/20'
                                : isPast
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-medium'
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}
                            title={st.desc}
                          >
                            <div className="w-4 h-4 rounded-full flex items-center justify-center mb-1 text-[10px] font-medium">
                              {isPast ? (
                                <Check className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span className="text-[9px] font-medium uppercase tracking-tight truncate w-full block">
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 4: Expandable Detailed Audit Drawer */}
                  {isExpanded && (
                    <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 text-xs shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Order & Quality Verification Audit Trail</span>
                        </div>
                        {lifecycle.activeOrder && (
                          <button
                            onClick={() => openPassportModal(lifecycle.activeOrder?.batchId)}
                            className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Digital Produce Passport ({lifecycle.activeOrder.batchId})</span>
                          </button>
                        )}
                      </div>

                      {lifecycle.activeOrder ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">Order & Buyer</span>
                            <strong className="text-slate-900 block font-medium">{lifecycle.activeOrder.id}</strong>
                            <span className="text-slate-600 truncate block">{lifecycle.activeOrder.buyerName}</span>
                          </div>

                          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">Agreed Terms</span>
                            <strong className="text-slate-900 block font-medium">{lifecycle.activeOrder.quantityKg.toLocaleString()} kg @ ₹{lifecycle.activeOrder.pricePerKg}/kg</strong>
                            <span className="text-emerald-700 font-semibold">Total: ₹{lifecycle.activeOrder.totalValue.toLocaleString()}</span>
                          </div>

                          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">Lab Quality Metrics</span>
                            {lifecycle.activeOrder.inspectionMetrics ? (
                              <span className="text-slate-800 font-medium block">
                                Brix: {lifecycle.activeOrder.inspectionMetrics.sugarBrix}° • {lifecycle.activeOrder.inspectionMetrics.verifiedGrade}
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium block">Pending FPO Hub Assay</span>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">Logistics / Reefer</span>
                            {lifecycle.activeOrder.transportDetails ? (
                              <span className="text-slate-800 font-medium block">
                                {lifecycle.activeOrder.transportDetails.vehicleNumber} ({lifecycle.activeOrder.transportDetails.driverName})
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium block">Awaiting Carrier Dispatch</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/70 text-slate-600">
                          <p>
                            This produce is published and currently active in the Smart Matching Pool. When an institutional buyer creates or confirms demand, an agreement and order will automatically bind here.
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
  );
};

