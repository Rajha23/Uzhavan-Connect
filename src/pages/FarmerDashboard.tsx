import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHENNAI_TOMATO_FORECAST, INITIAL_FARMER_LISTINGS } from '../data/mockData';
import { ProduceListing } from '../types';
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
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import confetti from 'canvas-confetti';

export const FarmerDashboard: React.FC = () => {
  const { currentUser, setActiveTab, openPassportModal } = useApp();

  const [listings, setListings] = useState<ProduceListing[]>(INITIAL_FARMER_LISTINGS);
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [crop, setCrop] = useState('Tomato');
  const [quantityKg, setQuantityKg] = useState<number>(3000);
  const [price, setPrice] = useState<number>(26.0);
  const [harvestDate, setHarvestDate] = useState('2026-09-12');
  const [quality, setQuality] = useState<'Standard' | 'Premium'>('Standard');
  const [location, setLocation] = useState('Sunguvarchatram, Kanchipuram');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const forecast = CHENNAI_TOMATO_FORECAST;

  // Simple clean forecast series for the past to next 7 days
  const demandTrendData = [
    { period: 'Past (1 Wk)', demand: 7600 },
    { period: 'Yesterday', demand: 7900 },
    { period: 'Today', demand: 8000 },
    { period: 'Day 2', demand: 8150 },
    { period: 'Day 4', demand: 8350 },
    { period: 'Day 6', demand: 8500 },
    { period: 'Next 7 Days', demand: 8500 }
  ];

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const newCropItem: ProduceListing = {
      id: `LST-${Date.now().toString().slice(-3)}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      crop,
      quantityKg: Number(quantityKg),
      grade: quality,
      expectedPricePerKg: Number(price),
      harvestDate,
      availabilityDate: harvestDate,
      location,
      status: 'AVAILABLE'
    };

    setListings([newCropItem, ...listings]);
    setIsAddingListing(false);
    setSuccessMessage(`Listing created: ${newCropItem.quantityKg.toLocaleString()} kg of ${newCropItem.crop} @ ₹${newCropItem.expectedPricePerKg}/kg!`);
    confetti({
      particleCount: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRemove = (id: string) => {
    setListings(listings.filter((l) => l.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Farmer Friendly Greeting Header */}
      <div className="bg-forest text-cream rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-forest">
        <div>
          <div className="flex items-center gap-2 text-sage text-xs font-bold uppercase tracking-widest mb-2">
            <Sprout className="w-4 h-4" />
            <span>Sunguvarchatram Cluster • Farm Size: {currentUser.farmSizeAcres || 3.5} Acres</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-anton tracking-wide">
            Greetings, {(currentUser.name || 'Farmer').split(' ')[0]} 👨‍🌾
          </h1>
          <p className="text-sm text-cream/70 mt-2 font-medium">
            Here is today's farming and selling information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setActiveTab('find-buyers')}
            className="flex items-center gap-2 bg-sage hover:bg-cream text-forest text-xs font-bold px-5 py-3 rounded-[1rem] shadow-sm transition uppercase tracking-widest"
          >
            <span>Find Buyers</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openPassportModal()}
            className="flex items-center gap-2 bg-olive/20 hover:bg-olive/30 text-cream text-xs font-bold px-5 py-3 rounded-[1rem] border border-olive/30 transition uppercase tracking-widest"
          >
            <QrCode className="w-4 h-4 text-sage" />
            <span>My Batch QR</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}


      {/* 5. Farmer Crop Listing ("My Crops") */}
      <div className="bg-cream rounded-[2.5rem] border border-olive/30 shadow-forest overflow-hidden">
        <div className="p-8 border-b border-olive/20 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-forest">
              My Crops ({listings.length})
            </h3>
            <p className="text-xs text-forest/60 mt-1 font-bold uppercase tracking-widest">Manage your active produce listings</p>
          </div>

          <button
            onClick={() => setIsAddingListing(!isAddingListing)}
            className="flex items-center gap-2 text-xs font-bold text-cream bg-forest hover:bg-[#023120] px-5 py-3 rounded-[1rem] transition uppercase tracking-widest shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Crop</span>
          </button>
        </div>

        {/* Add Crop Form */}
        {isAddingListing && (
          <form onSubmit={handleAddCrop} className="p-8 bg-olive/10 border-b border-olive/20 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
              >
                <option value="Tomato">Tomato</option>
                <option value="Green Chilli">Green Chilli</option>
                <option value="Capsicum">Capsicum</option>
                <option value="Carrot">Carrot</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Quantity (kg)</label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                min="100"
                step="100"
                required
              />
            </div>

            <div>
              <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Expected Price (₹/kg)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                step="0.5"
                required
              />
            </div>

            <div>
              <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-forest uppercase tracking-widest block mb-2 text-[10px]">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as any)}
                className="w-full bg-cream border border-olive/30 rounded-[1rem] p-3 font-bold text-forest shadow-sm focus:border-sage focus:outline-none"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 bg-sage hover:bg-cream text-forest font-bold rounded-[1rem] transition text-xs uppercase tracking-widest shadow-sm"
              >
                Publish Listing
              </button>
            </div>
          </form>
        )}

        {/* Listings Table / Cards */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-[1.5rem] border border-olive/30 bg-cream hover:shadow-forest transition space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-olive/20 pb-3">
                <span className="font-anton text-2xl text-forest tracking-wide">{item.crop}</span>
                <span className="text-[9px] bg-sage/30 text-forest font-bold px-2.5 py-1 rounded-full border border-sage/50 uppercase tracking-widest">
                  {item.status}
                </span>
              </div>

              <div className="text-xs text-forest/70 space-y-2 font-medium">
                <p className="flex justify-between">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Quantity:</span>
                  <strong className="text-forest text-sm font-bold">{item.quantityKg.toLocaleString()} kg</strong>
                </p>
                <p className="flex justify-between">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Price:</span>
                  <strong className="text-forest text-sm font-bold">₹{item.expectedPricePerKg}/kg</strong>
                </p>
                <p className="flex justify-between">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Harvest:</span>
                  <strong className="text-forest font-bold">{item.harvestDate}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Quality:</span>
                  <span className="text-forest font-bold">{item.grade}</span>
                </p>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveTab('find-buyers')}
                  className="flex-1 py-2.5 bg-forest hover:bg-[#023120] text-cream font-bold rounded-[1rem] text-xs transition uppercase tracking-widest"
                >
                  Find Buyers
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-forest/50 hover:text-red-700 bg-olive/10 hover:bg-olive/20 rounded-[1rem] transition"
                  title="Remove Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
