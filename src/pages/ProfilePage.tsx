import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Sprout,
  Truck,
  Award,
  ArrowRight
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, setActiveTab } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-4xl shadow-md shrink-0">
            {currentUser.avatar || '👨‍🌾'}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {currentUser.name}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                {currentRole.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {currentUser.organization || 'Registered Member'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Profile Details & Statistics */}
      {currentRole === 'FARMER' && (
        <div className="space-y-6">
          {/* Farmer Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Farm & Agrarian Profile
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Village:</span>
                <strong className="text-slate-900">{currentUser.village || '-'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">District & State:</span>
                <strong className="text-slate-900">{currentUser.district || '-'}, {currentUser.state || '-'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Farm Size:</span>
                <strong className="text-emerald-700 font-mono font-bold">{currentUser.farmSizeAcres || 0} Acres</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[11px] block">Registered FPO:</span>
                <strong className="text-slate-900">{currentUser.fpoName || '-'}</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">Main Harvest Crops:</span>
              <div className="flex gap-2">
                {(currentUser.mainCrops && currentUser.mainCrops.length > 0 ? currentUser.mainCrops : ['None specified']).map((c, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg text-xs border border-emerald-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Farmer Statistics (Requirement: Total Listings, Completed Orders, Quantity Sold) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Total Listings</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{currentUser.totalListings || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Completed Orders</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{currentUser.completedOrders || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs text-slate-500 font-medium">Quantity Sold</span>
              <p className="text-2xl font-bold font-mono text-blue-700 mt-1">{(currentUser.quantitySoldKg || 0).toLocaleString()} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Profile */}
      {(currentRole === 'RETAIL_BUYER') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Commercial Buyer Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Business Name:</span>
              <strong className="text-slate-900">{currentUser.businessName || '-'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Buyer Category:</span>
              <strong className="text-slate-900">{currentUser.buyerType || '-'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Active Demands:</span>
              <strong className="text-emerald-700 font-mono font-bold">0 Lots</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Completed Orders:</span>
              <strong className="text-slate-900 font-mono">{currentUser.completedOrders || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Profile */}
      {currentRole === 'ADMIN' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Carrier & Fleet Credentials
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Transport Fleet:</span>
              <strong className="text-slate-900">{currentUser.transportName || 'GreenTransit'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Vehicle Type:</span>
              <strong className="text-slate-900">{currentUser.vehicleType || 'Tata Ace EV CoolReefer'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Service Area:</span>
              <strong className="text-slate-900">{currentUser.serviceArea || 'Chennai & Kanchipuram'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 text-[11px] block">Active Shipments:</span>
              <strong className="text-emerald-700 font-mono font-bold">4 Loads</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
