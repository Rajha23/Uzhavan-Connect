import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ProduceListing, AggregatedSupplyLot, DirectProcurementRequest } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { getCropImageUrl } from '../utils/cropImages';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Layers,
  Sprout,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Scale,
  Users,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  FileCheck2,
  X,
  Send,
  AlertCircle,
  Truck,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

export const ProduceDiscoveryPage: React.FC = () => {
  const { t, formatNumber } = useLanguage();
  const {
    produceListings,
    aggregatedSupplyLots,
    procurementRequests,
    submitProcurementRequest,
    currentUser,
    currentRole,
    setActiveTab,
    openPassportModal
  } = useApp();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [activeTabMode, setActiveTabMode] = useState<'ALL' | 'INDIVIDUAL' | 'AGGREGATED'>('ALL');
  const [displayLayout, setDisplayLayout] = useState<'TABLE' | 'GRID'>('TABLE');

  // Modals & Drawers
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [selectedLot, setSelectedLot] = useState<AggregatedSupplyLot | null>(null);
  const [procurementModalTarget, setProcurementModalTarget] = useState<{
    type: 'INDIVIDUAL_LISTING' | 'AGGREGATED_LOT';
    listing?: ProduceListing;
    lot?: AggregatedSupplyLot;
  } | null>(null);

  // Procurement Request Form State
  const [requestQty, setRequestQty] = useState<number>(150);
  const [proposedPrice, setProposedPrice] = useState<number>(28);
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    currentUser.location || 'Koyambedu Wholesale Terminal, Chennai'
  );
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [deliveryWindow, setDeliveryWindow] = useState<string>('Morning (06:00 AM - 09:30 AM)');
  const [requestNotes, setRequestNotes] = useState<string>('Cold reefer transport and farm-gate digital weighment required.');
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Available commodity filters
  const uniqueCrops = useMemo(() => {
    const set = new Set<string>();
    produceListings.forEach((p) => set.add(p.crop));
    aggregatedSupplyLots.forEach((l) => set.add(l.crop));
    return Array.from(set);
  }, [produceListings, aggregatedSupplyLots]);

  // Available corridors
  const uniqueCorridors = useMemo(() => {
    const set = new Set<string>();
    aggregatedSupplyLots.forEach((l) => set.add(l.corridor));
    return Array.from(set);
  }, [aggregatedSupplyLots]);

  // Filter individual listings
  const filteredListings = useMemo(() => {
    return produceListings.filter((item) => {
      // Must have positive available quantity and be in eligible state
      const netAvailable = item.quantityKg - (item.allocatedQuantityKg || 0);
      if (netAvailable <= 0) return false;
      if (item.status === 'Completed' || item.status === 'Delivered') return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          item.crop.toLowerCase().includes(q) ||
          (item.variety && item.variety.toLowerCase().includes(q)) ||
          item.farmerName.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Crop
      if (selectedCrop !== 'ALL' && item.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }

      // Grade
      if (selectedGrade !== 'ALL' && item.grade !== selectedGrade) {
        return false;
      }

      // Verification
      if (selectedVerification !== 'ALL') {
        const vStatus = item.qualityRecord?.status || 'SELF_DECLARED';
        if (selectedVerification === 'VERIFIED' && vStatus !== 'COLLECTION_VERIFIED') return false;
        if (selectedVerification === 'SELF_DECLARED' && vStatus !== 'SELF_DECLARED') return false;
      }

      // Quantity & Price
      if (netAvailable < minQuantity) return false;
      if (item.expectedPricePerKg > maxPrice) return false;

      return true;
    });
  }, [produceListings, searchQuery, selectedCrop, selectedGrade, selectedVerification, minQuantity, maxPrice]);

  // Filter aggregated lots
  const filteredLots = useMemo(() => {
    return aggregatedSupplyLots.filter((lot) => {
      if (lot.totalAvailableKg <= 0) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          lot.crop.toLowerCase().includes(q) ||
          lot.variety.toLowerCase().includes(q) ||
          lot.corridor.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Crop
      if (selectedCrop !== 'ALL' && lot.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }

      // Grade
      if (selectedGrade !== 'ALL' && lot.grade !== selectedGrade) {
        return false;
      }

      // Verification
      if (selectedVerification !== 'ALL') {
        const vStatus = lot.verificationSummary.overallStatus;
        if (selectedVerification === 'VERIFIED' && vStatus !== 'COLLECTION_VERIFIED') return false;
        if (selectedVerification === 'SELF_DECLARED' && vStatus !== 'SELF_DECLARED') return false;
        if (selectedVerification === 'MIXED' && vStatus !== 'MIXED') return false;
      }

      // Corridor
      if (selectedCorridor !== 'ALL' && lot.corridor !== selectedCorridor) {
        return false;
      }

      // Quantity & Price
      if (lot.totalAvailableKg < minQuantity) return false;
      if (lot.avgPricePerKg > maxPrice) return false;

      return true;
    });
  }, [aggregatedSupplyLots, searchQuery, selectedCrop, selectedGrade, selectedVerification, selectedCorridor, minQuantity, maxPrice]);

  // Overall marketplace metrics
  const totalSupplyKg = useMemo(() => {
    return (
      filteredListings.reduce((sum, p) => sum + (p.quantityKg - (p.allocatedQuantityKg || 0)), 0) +
      filteredLots.reduce((sum, l) => sum + l.totalAvailableKg, 0)
    );
  }, [filteredListings, filteredLots]);

  // Initiate procurement modal handler
  const handleOpenProcurement = (
    type: 'INDIVIDUAL_LISTING' | 'AGGREGATED_LOT',
    listing?: ProduceListing,
    lot?: AggregatedSupplyLot
  ) => {
    setProcurementModalTarget({ type, listing, lot });
    if (type === 'INDIVIDUAL_LISTING' && listing) {
      const netAvailable = Math.max(0, listing.quantityKg - (listing.allocatedQuantityKg || 0));
      setRequestQty(netAvailable);
      setProposedPrice(listing.expectedPricePerKg);
    } else if (type === 'AGGREGATED_LOT' && lot) {
      setRequestQty(lot.totalAvailableKg);
      setProposedPrice(lot.avgPricePerKg);
    }
  };

  // Submit procurement request
  const handleSubmitProcurementRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procurementModalTarget) return;

    if (procurementModalTarget.type === 'INDIVIDUAL_LISTING' && procurementModalTarget.listing) {
      const listing = procurementModalTarget.listing;
      const finalQty = Number(requestQty);
      const finalPrice = Number(proposedPrice);

      submitProcurementRequest({
        buyerId: currentUser.id || 'usr-retail-01',
        buyerName: currentUser.name || 'Institutional Retail Buyer',
        buyerOrganization: currentUser.organization || currentUser.businessName || 'Fresh Supermarket Chain',
        buyerPhone: currentUser.phone || '+91 98800 11223',
        targetType: 'INDIVIDUAL_LISTING',
        targetId: listing.id,
        listingId: listing.id,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
        fpoName: listing.fpoName,
        crop: listing.crop,
        variety: listing.variety,
        grade: listing.grade,
        requestedQuantityKg: finalQty,
        unit: listing.unit || 'kg',
        proposedPricePerKg: finalPrice,
        totalProposedValue: Math.round(finalQty * finalPrice * 100) / 100,
        deliveryLocation,
        requestedDeliveryDate: deliveryDate,
        deliveryTimeWindow: deliveryWindow,
        notes: requestNotes,
        verificationStatus: listing.qualityRecord?.status || 'SELF_DECLARED'
      });

      setSubmissionSuccess(
        `Procurement Request submitted to ${listing.farmerName} for ${finalQty.toLocaleString()} kg of ${listing.crop} @ ₹${finalPrice}/kg!`
      );
    } else if (procurementModalTarget.type === 'AGGREGATED_LOT' && procurementModalTarget.lot) {
      const lot = procurementModalTarget.lot;
      const finalQty = Number(requestQty);
      const finalPrice = Number(proposedPrice);

      submitProcurementRequest({
        buyerId: currentUser.id || 'usr-bulkbuyer-01',
        buyerName: currentUser.name || 'Bulk Procurement Officer',
        buyerOrganization: currentUser.organization || currentUser.businessName || 'Institutional Food Processor',
        buyerPhone: currentUser.phone || '+91 97700 33445',
        targetType: 'AGGREGATED_LOT',
        targetId: lot.id,
        supplyLotId: lot.id,
        fpoName: lot.fpoHub,
        crop: lot.crop,
        variety: lot.variety,
        grade: lot.grade,
        requestedQuantityKg: finalQty,
        unit: 'kg',
        proposedPricePerKg: finalPrice,
        totalProposedValue: Math.round(finalQty * finalPrice * 100) / 100,
        deliveryLocation,
        requestedDeliveryDate: deliveryDate,
        deliveryTimeWindow: deliveryWindow,
        notes: requestNotes,
        verificationStatus: lot.verificationSummary.overallStatus
      });

      setSubmissionSuccess(
        `Bulk Procurement Request submitted for Aggregated Lot ${lot.id} (${finalQty.toLocaleString()} kg of ${lot.crop} from ${lot.farmersCount} smallholders)!`
      );
    }

    setProcurementModalTarget(null);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setSubmissionSuccess(null), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1e5238] text-white rounded-3xl p-6 sm:p-8 shadow-forest border border-emerald-600/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('discovery.badge', 'Direct Marketplace Discovery')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t('discovery.title', 'Buyer Produce Discovery Marketplace')}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {t(
              'discovery.subtitle',
              'Directly explore available farmer produce listings and multi-farmer aggregated supply pools. Review verified quality grades, transparent prices, and submit binding procurement requests.'
            )}
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15">
            <p className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">{t('discovery.availableSupply', 'Active Supply')}</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{totalSupplyKg.toLocaleString()} <span className="text-xs font-normal">kg</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15">
            <p className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">{t('discovery.farmerListings', 'Farmer Lots')}</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{filteredListings.length} <span className="text-xs font-normal">available</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 col-span-2 sm:col-span-1">
            <p className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">{t('discovery.aggregatedLots', 'Aggregated Lots')}</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{filteredLots.length} <span className="text-xs font-normal">pooled</span></p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {submissionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 text-sm shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{submissionSuccess}</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
          >
            {t('discovery.viewPipeline', 'View Orders Pipeline')} →
          </button>
        </div>
      )}

      {/* Filter and Mode Control Bar */}
      <div className="agri-card rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('discovery.searchPlaceholder', 'Search by crop, variety, farmer name, or hub location...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start md:self-auto">
            <button
              onClick={() => setActiveTabMode('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTabMode === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('discovery.allSupplies', 'All Produce')} ({filteredListings.length + filteredLots.length})
            </button>
            <button
              onClick={() => setActiveTabMode('INDIVIDUAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'INDIVIDUAL'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('discovery.individualFarmers', 'Individual Listings')} ({filteredListings.length})</span>
            </button>
            <button
              onClick={() => setActiveTabMode('AGGREGATED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'AGGREGATED'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('discovery.aggregatedLotsPill', 'Aggregated Lots')} ({filteredLots.length})</span>
            </button>
          </div>

          {/* Layout Toggle (Table vs Grid) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 self-end md:self-auto">
            <button
              onClick={() => setDisplayLayout('TABLE')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                displayLayout === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDisplayLayout('GRID')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                displayLayout === 'GRID' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdown Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Crop Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('discovery.filterCrop', 'Commodity')}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">{t('common.all', 'All Crops')}</option>
              {uniqueCrops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('discovery.filterGrade', 'Quality Grade')}</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">{t('common.all', 'All Grades')}</option>
              <option value="Grade A">Grade A ({t('common.premium', 'Premium')})</option>
              <option value="Grade B">Grade B ({t('common.commercial', 'Commercial')})</option>
              <option value="Standard">{t('common.standard', 'Standard')}</option>
              <option value="Premium">{t('common.premium', 'Premium')}</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('discovery.filterVerification', 'Verification')}</label>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">{t('common.all', 'All Verification Levels')}</option>
              <option value="VERIFIED">{t('quality.collectionVerified', 'Collection-verified')} 🟢</option>
              <option value="SELF_DECLARED">{t('quality.farmerDeclared', 'Farmer-declared')} 🟡</option>
              <option value="MIXED">{t('quality.mixedStatus', 'Mixed Verification')} 🟠</option>
            </select>
          </div>

          {/* Corridor Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('discovery.filterCorridor', 'Agro Corridor')}</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">{t('common.all', 'All Corridors')}</option>
              {uniqueCorridors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('discovery.filterPrice', 'Max Price')}: ₹{maxPrice}/kg
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 mt-2"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TABULAR MARKETPLACE VIEW (Matching User's Specified Design)    */}
      {/* ========================================================================= */}
      {displayLayout === 'TABLE' && (
        <div className="agri-card rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden space-y-0">
          <div className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{t('discovery.catalogTitle', 'Available Agricultural Supply Catalog')}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  {filteredListings.length + filteredLots.length} items
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                {t('discovery.catalogSubtitle', 'Verified farm-gate produce lots and FPO aggregated pools ready for direct procurement.')}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">{t('discovery.tableListing', 'Listing / Source')}</th>
                  <th className="py-3.5 px-4">{t('discovery.tableCommodity', 'Crop & Variety')}</th>
                  <th className="py-3.5 px-3 text-center">{t('discovery.tableGrade', 'Grade')}</th>
                  <th className="py-3.5 px-4 text-right">{t('discovery.tableQuantity', 'Available Qty')}</th>
                  <th className="py-3.5 px-4 text-right">{t('discovery.tablePrice', 'Expected Price')}</th>
                  <th className="py-3.5 px-4 text-center">{t('discovery.tableVerification', 'Verification')}</th>
                  <th className="py-3.5 px-4">{t('discovery.tableAvailability', 'Availability Window')}</th>
                  <th className="py-3.5 px-4 text-right">{t('discovery.tableAction', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {/* 1. AGGREGATED LOTS (Shown prominently at top if matching) */}
                {(activeTabMode === 'ALL' || activeTabMode === 'AGGREGATED') &&
                  filteredLots.map((lot) => (
                    <tr
                      key={lot.id}
                      className="bg-emerald-50/30 hover:bg-emerald-50/60 transition cursor-pointer"
                      onClick={() => setSelectedLot(lot)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                            <Layers className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{lot.id}</span>
                              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-semibold uppercase">
                                Pooled Lot
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{lot.farmersCount} Farmers • {lot.corridor}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{lot.crop}</p>
                        <p className="text-[11px] text-slate-500">{lot.variety}</p>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[11px] border border-slate-200">
                          {lot.grade}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {lot.totalAvailableKg.toLocaleString()} kg
                        </span>
                        <p className="text-[10px] text-emerald-700 font-semibold">{t('discovery.bulkLot', 'Institutional Bulk')}</p>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                        ₹{lot.avgPricePerKg}/kg
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <VerificationBadge status={lot.verificationSummary.overallStatus} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{lot.availabilityStartDate} – {lot.availabilityEndDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedLot(lot)}
                            className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            {t('discovery.viewLot', 'View Lot')}
                          </button>
                          <button
                            onClick={() => handleOpenProcurement('AGGREGATED_LOT', undefined, lot)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{t('discovery.requestProduce', 'Request Produce')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* 2. INDIVIDUAL FARMER LISTINGS */}
                {(activeTabMode === 'ALL' || activeTabMode === 'INDIVIDUAL') &&
                  filteredListings.map((item) => {
                    const netQty = item.quantityKg - (item.allocatedQuantityKg || 0);
                    const vStatus = item.qualityRecord?.status || 'SELF_DECLARED';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => setSelectedListing(item)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100/60 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
                              {item.farmerName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.farmerName}</p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.location}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{item.crop}</p>
                          <p className="text-[11px] text-slate-500">{item.variety || 'Commercial Variety'}</p>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold text-[11px] border border-slate-200">
                            {item.grade}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {netQty.toLocaleString()} kg
                          </span>
                          {item.unit && item.unit !== 'kg' && (
                            <p className="text-[10px] text-slate-400 font-mono">({item.unit})</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                          ₹{item.expectedPricePerKg}/kg
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <VerificationBadge status={vStatus} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{item.availabilityDate || item.harvestDate}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedListing(item)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              {t('discovery.inspect', 'Inspect')}
                            </button>
                            <button
                              onClick={() => handleOpenProcurement('INDIVIDUAL_LISTING', item)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{t('discovery.requestProduce', 'Request Produce')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {filteredListings.length === 0 && filteredLots.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Sprout className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">{t('discovery.noProduceFound', 'No produce listings match your active filters.')}</p>
                      <p className="text-xs text-slate-400 mt-1">{t('discovery.resetFiltersHint', 'Try adjusting your crop, quality grade, or price range filters.')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: GRID CARD VIEW                                                */}
      {/* ========================================================================= */}
      {displayLayout === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AGGREGATED LOTS CARDS */}
          {(activeTabMode === 'ALL' || activeTabMode === 'AGGREGATED') &&
            filteredLots.map((lot) => (
              <div
                key={lot.id}
                className="agri-card rounded-3xl p-6 border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-soft hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedLot(lot)}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
                      {t('discovery.aggregatedSupplyLot', 'Aggregated Supply Lot')}
                    </span>
                    <VerificationBadge status={lot.verificationSummary.overallStatus} size="xs" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>{lot.crop}</span>
                    <span className="text-base font-mono text-emerald-800">₹{lot.avgPricePerKg}/kg</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{lot.variety} • {lot.grade}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('discovery.availableVolume', 'Total Pooled Volume')}:</span>
                      </span>
                      <span className="font-bold font-mono text-slate-900">{lot.totalAvailableKg.toLocaleString()} kg</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('discovery.farmersGrouped', 'Constituent Farmers')}:</span>
                      </span>
                      <span className="font-semibold text-slate-900">{lot.farmersCount} Smallholders</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('discovery.corridor', 'Corridor')}:</span>
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[140px]">{lot.corridor}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLot(lot); }}
                    className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    {t('discovery.viewDetails', 'Lot Details')}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenProcurement('AGGREGATED_LOT', undefined, lot); }}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition cursor-pointer"
                  >
                    {t('discovery.requestProduce', 'Request Produce')}
                  </button>
                </div>
              </div>
            ))}

          {/* INDIVIDUAL LISTINGS CARDS */}
          {(activeTabMode === 'ALL' || activeTabMode === 'INDIVIDUAL') &&
            filteredListings.map((item) => {
              const netQty = item.quantityKg - (item.allocatedQuantityKg || 0);
              const vStatus = item.qualityRecord?.status || 'SELF_DECLARED';

              return (
                <div
                  key={item.id}
                  className="agri-card rounded-3xl p-6 border border-slate-200/80 bg-white shadow-soft hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  onClick={() => setSelectedListing(item)}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                        {item.farmerName.split(' ')[0]}'s Farm Gate
                      </span>
                      <VerificationBadge status={vStatus} size="xs" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                      <span>{item.crop}</span>
                      <span className="text-base font-mono text-emerald-800">₹{item.expectedPricePerKg}/kg</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.variety || 'Commercial Variety'} • {item.grade}</p>

                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Scale className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('discovery.availableQuantity', 'Available Quantity')}:</span>
                        </span>
                        <span className="font-bold font-mono text-slate-900">{netQty.toLocaleString()} kg</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('discovery.location', 'Location')}:</span>
                        </span>
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{item.location}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('discovery.harvestDate', 'Harvested')}:</span>
                        </span>
                        <span className="text-slate-800">{item.availabilityDate || item.harvestDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      {t('discovery.inspect', 'Inspect')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProcurement('INDIVIDUAL_LISTING', item); }}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition cursor-pointer"
                    >
                      {t('discovery.requestProduce', 'Request Produce')}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: LOT DETAILS (Constituent Farmers & Verification Integrity)*/}
      {/* ========================================================================= */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  {t('discovery.lotInspection', 'Aggregated Supply Lot Inspection')}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedLot.id}</h3>
                <p className="text-xs text-slate-500">{selectedLot.crop} • {selectedLot.variety} ({selectedLot.grade})</p>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Integrity Notice */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{t('discovery.overallLotVerification', 'Verification Summary')}:</span>
                <VerificationBadge status={selectedLot.verificationSummary.overallStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {selectedLot.verificationSummary.description}
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                * Note: Combining listings never automatically upgrades constituent verification statuses. Each farm contribution maintains its independent audit trail.
              </p>
            </div>

            {/* Constituent Farmers Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                {t('discovery.constituentContributions', 'Constituent Farmer Contributions ({count})', { count: selectedLot.contributions.length })}
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t('discovery.farmer', 'Farmer')}</th>
                      <th className="p-3">{t('discovery.location', 'Location')}</th>
                      <th className="p-3 text-right">{t('discovery.contributedKg', 'Volume (kg)')}</th>
                      <th className="p-3 text-right">{t('discovery.farmgatePrice', 'Price/kg')}</th>
                      <th className="p-3 text-center">{t('discovery.auditStatus', 'Verification')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedLot.contributions.map((c) => (
                      <tr key={c.listingId} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-slate-900">{c.farmerName}</td>
                        <td className="p-3 text-slate-500">{c.location}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{c.availableKg.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-medium text-emerald-800">₹{c.pricePerKg}</td>
                        <td className="p-3 text-center">
                          <VerificationBadge status={c.verificationStatus} size="xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aggregation Justification Reasons */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-2">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                {t('discovery.compatibilityJustification', 'Corridor Aggregation Justification')}
              </h4>
              <ul className="text-xs text-slate-700 space-y-1">
                {selectedLot.compatibilityReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedLot(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
              <button
                onClick={() => {
                  const target = selectedLot;
                  setSelectedLot(null);
                  handleOpenProcurement('AGGREGATED_LOT', undefined, target);
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-2"
              >
                <span>{t('discovery.requestThisLot', 'Request This Supply Lot')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: INDIVIDUAL LISTING INSPECTION                             */}
      {/* ========================================================================= */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                  {t('discovery.farmerListingDetails', 'Farmer Farm-Gate Listing')}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedListing.crop}</h3>
                <p className="text-xs text-slate-500">{selectedListing.variety || 'Standard Variety'} • {selectedListing.grade}</p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Farmer and Quality Badge */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('discovery.farmer', 'Farmer / Collective')}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedListing.farmerName}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedListing.location}</span>
                </p>
              </div>
              <VerificationBadge status={selectedListing.qualityRecord?.status || 'SELF_DECLARED'} size="md" />
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500">{t('discovery.availableQty', 'Available Net Quantity')}</span>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {(selectedListing.quantityKg - (selectedListing.allocatedQuantityKg || 0)).toLocaleString()} kg
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500">{t('discovery.expectedPrice', 'Expected Price / kg')}</span>
                <p className="text-base font-bold font-mono text-emerald-800 mt-0.5">
                  ₹{selectedListing.expectedPricePerKg}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500">{t('discovery.fpoHub', 'FPO Aggregation Hub')}</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedListing.fpoName || 'Pasumai FPO'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-500">{t('discovery.harvestDate', 'Harvest Date')}</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedListing.harvestDate}</p>
              </div>
            </div>

            {/* Quality Checklist if available */}
            {selectedListing.qualityRecord && selectedListing.qualityRecord.sampleObservation && (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase">{t('discovery.assayRecord', 'Collection Lab Assay Record')}</span>
                  <span className="font-bold text-emerald-800 font-mono">Score: {selectedListing.qualityRecord.calculatedScore || 94}%</span>
                </div>
                <p className="text-slate-600">
                  Sample Tested: {selectedListing.qualityRecord.sampleObservation.sampleSize} units • Good: {selectedListing.qualityRecord.sampleObservation.good} • Verified By: {selectedListing.qualityRecord.verifiedBy || 'Field Officer'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedListing(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
              <button
                onClick={() => {
                  const target = selectedListing;
                  setSelectedListing(null);
                  handleOpenProcurement('INDIVIDUAL_LISTING', target);
                }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-2"
              >
                <span>{t('discovery.requestProduce', 'Request Produce')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT PROCUREMENT REQUEST FORM                                    */}
      {/* ========================================================================= */}
      {procurementModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[95vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  {t('discovery.initiateRequest', 'Submit Direct Procurement Request')}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {procurementModalTarget.type === 'INDIVIDUAL_LISTING'
                    ? `${procurementModalTarget.listing?.crop} from ${procurementModalTarget.listing?.farmerName}`
                    : `Aggregated Supply Lot (${procurementModalTarget.lot?.crop})`}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('discovery.requestTermsSubtitle', 'Propose procurement terms directly. Upon acceptance, an official Workflow Agreement & Order is generated.')}
                </p>
              </div>
              <button
                onClick={() => setProcurementModalTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProcurementRequest} className="space-y-4 text-xs">
              {/* Requested Quantity & Proposed Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('discovery.requestedQuantity', 'Requested Quantity (kg)')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      procurementModalTarget.type === 'INDIVIDUAL_LISTING'
                        ? (procurementModalTarget.listing?.quantityKg || 1000)
                        : (procurementModalTarget.lot?.totalAvailableKg || 5000)
                    }
                    value={requestQty}
                    onChange={(e) => setRequestQty(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono text-sm font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Max available:{' '}
                    {procurementModalTarget.type === 'INDIVIDUAL_LISTING'
                      ? procurementModalTarget.listing?.quantityKg
                      : procurementModalTarget.lot?.totalAvailableKg}{' '}
                    kg
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('discovery.proposedPrice', 'Proposed Price (₹ / kg)')} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono text-sm font-bold text-emerald-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Seller expectation: ₹
                    {procurementModalTarget.type === 'INDIVIDUAL_LISTING'
                      ? procurementModalTarget.listing?.expectedPricePerKg
                      : procurementModalTarget.lot?.avgPricePerKg}
                    /kg
                  </p>
                </div>
              </div>

              {/* Total Calculated Value Card */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-950">{t('discovery.totalContractValue', 'Proposed Contract Value')}:</span>
                <span className="text-base font-bold font-mono text-emerald-900">
                  ₹{(requestQty * proposedPrice).toLocaleString()}
                </span>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {t('discovery.deliveryLocation', 'Delivery Facility / Receiving Bay Location')} *
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs"
                />
              </div>

              {/* Delivery Date & Time Window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('discovery.requestedDeliveryDate', 'Requested Delivery Date')} *
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {t('discovery.deliveryWindow', 'Receiving Dock Window')}
                  </label>
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs"
                  >
                    <option value="Morning (05:00 AM - 08:30 AM)">Morning (05:00 AM - 08:30 AM)</option>
                    <option value="Mid-day (10:00 AM - 02:00 PM)">Mid-day (10:00 AM - 02:00 PM)</option>
                    <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {t('discovery.specialInstructions', 'Procurement Notes & Handling Requirements')}
                </label>
                <textarea
                  rows={2}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs resize-none"
                  placeholder="E.g. Clean food-grade crates required; cold-chain telemetry tracking requested..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProcurementModalTarget(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('discovery.submitRequestButton', 'Transmit Procurement Request')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
