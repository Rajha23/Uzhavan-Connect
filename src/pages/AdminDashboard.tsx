import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Building2,
  ShoppingBag,
  Truck,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { setArchitectureModalOpen, setActiveTab } = useApp();



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-[#0a2e1f] to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ministry of Consumer Affairs, Food & Public Distribution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Platform Command & Administration
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-normal">
            National monitoring console for Uzhavan Connect. Real-time telemetry across farmer realization, cold storage utilization, and ML forecast convergence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setArchitectureModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-medium px-5 py-2.5 rounded-xl shadow-sm transition uppercase tracking-wider cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Architecture & Microservices</span>
          </button>
        </div>
      </div>


    </div>
  );
};
