import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, CheckCircle2, Clock, Truck, MapPin, Search, Filter } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD-TN-001', crop: 'Tomato', quantityKg: 3000, pricePerKg: 26.5, totalValue: 79500, farmer: 'GreenHarvest FPO', buyer: 'ABC Retail Stores', status: 'Delivered', date: '08 Sep 2026', location: 'Chennai' },
  { id: 'ORD-TN-002', crop: 'Tomato', quantityKg: 1500, pricePerKg: 27.0, totalValue: 40500, farmer: 'Rajesh Kumar', buyer: 'Grand Hospitality', status: 'In Transit', date: '10 Sep 2026', location: 'Chennai' },
  { id: 'ORD-TN-003', crop: 'Carrot', quantityKg: 800, pricePerKg: 22.0, totalValue: 17600, farmer: 'Murugan FPO', buyer: 'Metro Cash & Carry', status: 'Confirmed', date: '12 Sep 2026', location: 'T. Nagar' },
  { id: 'ORD-TN-004', crop: 'Onion', quantityKg: 2000, pricePerKg: 21.5, totalValue: 43000, farmer: 'Kaveri Cluster', buyer: 'Spencer\'s Retail', status: 'Pending', date: '14 Sep 2026', location: 'Vadapalani' },
];

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In Transit': 'bg-orange-100 text-orange-800 border-orange-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const OrdersPage: React.FC = () => {
  const { currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.crop.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer.toLowerCase().includes(search.toLowerCase()) ||
      o.farmer.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalValue, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-['Outfit']">My Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track all your active and completed orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: MOCK_ORDERS.length.toString(), color: 'text-slate-900' },
          { label: 'Delivered', value: MOCK_ORDERS.filter((o) => o.status === 'Delivered').length.toString(), color: 'text-emerald-700' },
          { label: 'In Progress', value: MOCK_ORDERS.filter((o) => o.status !== 'Delivered').length.toString(), color: 'text-orange-700' },
          { label: 'Total Value', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-slate-900' },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Pending', 'Confirmed', 'In Transit', 'Delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                filter === s ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-7 px-5 py-3 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="col-span-1">Order ID</span>
              <span className="col-span-1">Crop</span>
              <span className="col-span-1">Qty</span>
              <span className="col-span-1">Price</span>
              <span className="col-span-1">Value</span>
              <span className="col-span-1">Date</span>
              <span className="col-span-1">Status</span>
            </div>

            {filtered.map((order) => (
              <div key={order.id} className="px-5 py-4 hover:bg-slate-50 transition">
                {/* Mobile View */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[order.status] || ''}`}>{order.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{order.crop} — {order.quantityKg.toLocaleString()} kg</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>₹{order.pricePerKg}/kg</span>
                    <span className="font-bold text-slate-900">₹{order.totalValue.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{order.date}</span>
                  </div>
                  <p className="text-xs text-slate-500">{currentRole === 'FARMER' ? `→ ${order.buyer}` : `← ${order.farmer}`}</p>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-7 items-center text-xs text-slate-700">
                  <span className="font-mono text-[11px] font-bold text-slate-900 col-span-1">{order.id}</span>
                  <span className="font-semibold col-span-1">{order.crop}</span>
                  <span className="font-mono col-span-1">{order.quantityKg.toLocaleString()} kg</span>
                  <span className="font-mono col-span-1">₹{order.pricePerKg}/kg</span>
                  <span className="font-mono font-bold text-slate-900 col-span-1">₹{order.totalValue.toLocaleString()}</span>
                  <span className="col-span-1 flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" />{order.date}</span>
                  <span className="col-span-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_STYLES[order.status] || ''}`}>{order.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
