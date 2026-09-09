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
      return 'bg-emerald-100/30 text-slate-900 border-sage/60 font-bold';
    case 'Matched':
      return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    case 'Agreement Pending':
      return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
    case 'Confirmed':
      return 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold';
    case 'Collection':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    case 'Quality Check':
      return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
    case 'Packed':
      return 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
    case 'In Transit':
      return 'bg-sky-100 text-sky-900 border-sky-300 font-bold';
    case 'Delivered':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    case 'Payment Completed':
      return 'bg-emerald-700 text-white border-forest font-bold';
    default:
      return 'bg-white text-slate-900 border-slate-200 font-bold';
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
      <div className="bg-emerald-700 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-2">
            <Sprout className="w-4 h-4" />
            <span>{currentUser.fpoName || 'GreenHarvest FPO Cluster'} • Farm Size: {currentUser.farmSizeAcres || 3.5} Acres</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tracking-wide">
            Greetings, {(currentUser.name || 'Farmer').split(' ')[0]} 👨‍🌾
          </h1>
          <p className="text-sm text-white/70 mt-2 font-medium">
            Connected Crop Lifecycle: Listing ➔ Smart Matching ➔ Agreement ➔ FPO Collection ➔ Grading ➔ Transport ➔ Escrow Payout.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('find-buyers')}
            className="flex items-center gap-2 bg-emerald-100 hover:bg-white text-slate-900 text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>Find Buyers</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('smart-matching')}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-50 text-white text-xs font-bold px-5 py-3 rounded-[1rem] border border-slate-200 transition uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Smart Match Pool</span>
          </button>

          <button
            onClick={() => openPassportModal()}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-50 text-white text-xs font-bold px-5 py-3 rounded-[1rem] border border-slate-200 transition uppercase tracking-widest"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>My Batch QR</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. My Crops Section with Connected Lifecycle Tracker */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-slate-900">
                My Crops & Produce Inventory ({listings.length})
              </h3>
              <span className="text-[10px] bg-emerald-100/30 text-slate-900 font-bold px-3 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
                Connected Workflow
              </span>
            </div>
            <p className="text-xs text-slate-900/60 mt-1 font-bold uppercase tracking-widest">
              Live lifecycle state tracked across 10 stages from harvest to escrow settlement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex bg-slate-50 p-1 rounded-[1rem] border border-slate-200 text-xs">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-[0.8rem] text-[10px] font-bold uppercase tracking-widest transition ${
                    statusFilter === filter
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-900/70 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingListing(!isAddingListing)}
              className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-700 hover:bg-[#023120] px-5 py-3 rounded-[1rem] transition uppercase tracking-widest shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingListing ? 'Close Form' : 'Add Crop'}</span>
            </button>
          </div>
        </div>

        {/* Add Crop Form */}
        {isAddingListing && (
          <form onSubmit={handleAddCrop} className="p-8 bg-slate-50 border-b border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Crop Name</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
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
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. PKM-1 Hybrid / Nattu"
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-2/3 bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                    min="10"
                    step="10"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none text-[10px]"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Crates">Crates</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Expected Price (₹/kg)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  step="0.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Quality Grade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                >
                  <option value="Grade A">Grade A (Export / Institutional)</option>
                  <option value="Grade B">Grade B (Retail Standard)</option>
                  <option value="Standard">Standard Commercial</option>
                  <option value="Premium">Premium Handpicked</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Location / Mandi Hub</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Salem Mandi Hub"
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">Harvest / Availability Date</label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="font-bold text-slate-900 uppercase tracking-widest block mb-2 text-[10px]">FPO Association</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  placeholder="e.g. GreenHarvest FPO / Kaveri Farmers Collective"
                  className="w-full bg-white border border-slate-200 rounded-[1rem] p-3 font-bold text-slate-900 shadow-sm focus:border-sage focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-100 hover:bg-white text-slate-900 font-bold rounded-[1rem] transition text-xs uppercase tracking-widest shadow-sm border border-sage"
                >
                  Publish to Matching Pool
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Listings Cards with Lifecycle View */}
        <div className="p-8 grid grid-cols-1 gap-6">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-slate-900/60">
              <Sprout className="w-12 h-12 mx-auto mb-3 text-olive/40" />
              <p className="font-bold">No produce listings found matching filter.</p>
              <button
                onClick={() => setIsAddingListing(true)}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-[1rem] uppercase tracking-widest"
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
                  className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-soft transition space-y-6"
                >
                  {/* Row 1: Crop Header, Variety, FPO, and Real-Time Lifecycle Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold tracking-tight text-3xl text-slate-900 tracking-wide">
                          {item.crop}
                        </h4>
                        {item.variety && (
                          <span className="text-xs bg-slate-100/15 text-slate-900 px-3 py-0.5 rounded-full font-bold">
                            {item.variety}
                          </span>
                        )}
                        {item.syncStatus === 'PENDING_SYNC' && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-widest flex items-center gap-1">
                            <CloudOff className="w-2.5 h-2.5 text-amber-700" />
                            <span>Offline</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-900/70 font-medium">
                        Listing ID: <strong className="font-mono text-slate-900">{item.id}</strong> • FPO Association: <strong className="text-slate-900">{item.fpoName || 'GreenHarvest FPO'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-900/50 block">Lifecycle Stage</span>
                        <span className={`text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full border inline-block mt-0.5 ${lifecycle.badgeColor}`}>
                          {lifecycle.stage}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2.5 text-slate-900/40 hover:text-red-700 bg-slate-50 hover:bg-slate-50 rounded-[1rem] transition"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Inventory Allocation Bar (Remaining vs Allocated) & Specs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-900">
                    {/* Inventory Allocation Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/60">
                          Inventory Allocation
                        </span>
                        <span className="text-[10px] font-bold text-slate-900">
                          {allocatedPct}% Committed
                        </span>
                      </div>

                      <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, allocatedPct)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                        <div className="bg-white/80 p-2 rounded-[0.8rem] border border-slate-200">
                          <span className="text-[8px] uppercase font-bold text-slate-900/50 block">Available</span>
                          <strong className="text-slate-900 text-sm">{available.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white/80 p-2 rounded-[0.8rem] border border-slate-200">
                          <span className="text-[8px] uppercase font-bold text-slate-900/50 block">Allocated</span>
                          <strong className="text-amber-800 text-sm">{allocated.toLocaleString()} kg</strong>
                        </div>
                        <div className="bg-white/80 p-2 rounded-[0.8rem] border border-slate-200">
                          <span className="text-[8px] uppercase font-bold text-slate-900/50 block">Total Listed</span>
                          <strong className="text-slate-900 text-sm">{totalListed.toLocaleString()} kg</strong>
                        </div>
                      </div>
                    </div>

                    {/* Listing Parameters Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Expected Price</span>
                        <strong className="text-slate-900 text-base font-bold tracking-tight tracking-wide">₹{item.expectedPricePerKg}/kg</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Quality Grade</span>
                        <strong className="text-slate-900 font-bold">{item.grade}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Location Hub</span>
                        <span className="text-slate-900 font-medium truncate block">{item.location}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Harvest Date</span>
                        <span className="text-slate-900 font-medium">{item.harvestDate}</span>
                      </div>
                    </div>

                    {/* Actions & Navigation Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block mb-1">
                          Connected Buyer Matching
                        </span>
                        <p className="text-[11px] text-slate-900/70 font-medium">
                          {available > 0
                            ? `✓ ${available.toLocaleString()} kg available for smart institutional matching.`
                            : 'Produce fully matched and allocated to active buyer orders.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {available > 0 ? (
                          <button
                            onClick={() => setActiveTab('smart-matching')}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-[#023120] text-white text-[10px] font-bold uppercase tracking-widest rounded-[1rem] shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Match ({available.toLocaleString()} kg)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-[#023120] text-white text-[10px] font-bold uppercase tracking-widest rounded-[1rem] shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <span>View In Orders</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                          className="px-3 py-2.5 bg-emerald-100/40 hover:bg-emerald-100/60 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-[1rem] border border-sage/60 transition flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Hide' : 'Lifecycle'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: 10-Stage Connected Lifecycle Stepper */}
                  <div className="bg-slate-100/5 border border-slate-200 rounded-[1.5rem] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900/70 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-900" />
                        <span>Connected Supply Chain Lifecycle (Stage {lifecycle.stageIndex + 1} of 10)</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-900 font-mono">
                        Status Source: {lifecycle.activeOrder ? `Order #${lifecycle.activeOrder.id}` : 'Supply Pool'}
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
                            className={`p-2 rounded-[0.8rem] border text-center transition flex flex-col items-center justify-center ${
                              isCurrent
                                ? 'bg-emerald-700 text-white border-forest shadow-sm ring-2 ring-forest/20'
                                : isPast
                                ? 'bg-emerald-100/30 text-slate-900 border-sage/60 font-medium'
                                : 'bg-white/40 text-slate-900/40 border-slate-200'
                            }`}
                            title={st.desc}
                          >
                            <div className="w-5 h-5 rounded-full flex items-center justify-center mb-1 text-[10px] font-bold">
                              {isPast ? (
                                <Check className="w-3.5 h-3.5 text-slate-900" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tighter truncate w-full block">
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 4: Expandable Detailed Audit Drawer (Shows Order, Lab Assay, Carrier, and Escrow info) */}
                  {isExpanded && (
                    <div className="bg-white/80 border border-slate-200 rounded-[1.5rem] p-6 space-y-4 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Connected Order & Verification Audit Trail</span>
                        </div>
                        {lifecycle.activeOrder && (
                          <button
                            onClick={() => openPassportModal(lifecycle.activeOrder?.batchId)}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-emerald-100/30 px-3 py-1.5 rounded-[0.8rem] border border-sage/50 hover:bg-emerald-100/50 transition"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Digital Produce Passport ({lifecycle.activeOrder.batchId})</span>
                          </button>
                        )}
                      </div>

                      {lifecycle.activeOrder ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-50 rounded-[1rem] border border-slate-200">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Order & Buyer</span>
                            <strong className="text-slate-900 block">{lifecycle.activeOrder.id}</strong>
                            <span className="text-slate-900/70">{lifecycle.activeOrder.buyerName}</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-[1rem] border border-slate-200">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Agreed Terms</span>
                            <strong className="text-slate-900 block">{lifecycle.activeOrder.quantityKg.toLocaleString()} kg @ ₹{lifecycle.activeOrder.pricePerKg}/kg</strong>
                            <span className="text-emerald-800 font-bold">Total: ₹{lifecycle.activeOrder.totalValue.toLocaleString()}</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-[1rem] border border-slate-200">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Lab Quality Metrics</span>
                            {lifecycle.activeOrder.inspectionMetrics ? (
                              <span className="text-slate-900 font-medium">
                                Brix: {lifecycle.activeOrder.inspectionMetrics.sugarBrix}° • {lifecycle.activeOrder.inspectionMetrics.verifiedGrade}
                              </span>
                            ) : (
                              <span className="text-amber-800 font-medium">Pending FPO Hub Assay</span>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 rounded-[1rem] border border-slate-200">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900/60 block">Logistics / Reefer</span>
                            {lifecycle.activeOrder.transportDetails ? (
                              <span className="text-slate-900 font-medium">
                                {lifecycle.activeOrder.transportDetails.vehicleNumber} ({lifecycle.activeOrder.transportDetails.driverName})
                              </span>
                            ) : (
                              <span className="text-slate-900/60 font-medium">Awaiting Carrier Dispatch</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-[1rem] border border-slate-200 text-slate-900/70">
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

