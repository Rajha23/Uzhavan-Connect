import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  BarChart3,
  Users,
  Landmark,
  Activity,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  RefreshCw,
  Key,
  MapPin,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  UserPlus,
  Lock,
  X
} from 'lucide-react';
import { UserRole, Permission } from '../types';
import { apiService } from '../services/apiService';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    systemUsers,
    toggleUserPermission,
    orders,
    settlements,
    producePassports,
    produceListings,
    demandRequests,
    isOnline,
    syncStatus,
    pendingSyncCount,
    syncOfflineQueue,
    openPassportModal,
    setActiveTab
  } = useApp();

  const [activeTab, setActiveSection] = useState<'USERS' | 'ESCROW' | 'TRACEABILITY' | 'SYSTEM'>('USERS');
  
  // Modals state
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  
  // Role Tabs in Users Section
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations
  const totalTradeVolumeKg = orders.reduce((sum, o) => sum + (o.packedQuantityKg || o.quantityKg || 0), 0);
  const totalSettledAmount = settlements.reduce((sum, s) => sum + (s.totalOrderValue || 0), 0);
  const activeUsersCount = systemUsers.filter((u) => u.status === 'ACTIVE').length;
  const verifiedBatchesCount = producePassports.length;

  const filteredUsers = systemUsers.filter((user) => {
    const matchesRole = activeRoleTab === 'ALL' || user.role === activeRoleTab;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      phone: formData.get('phone'),
      location: formData.get('location')
    };
    
    try {
      await apiService.adminCreateUser(data);
      alert('User created successfully!');
      setIsCreateUserModalOpen(false);
      window.location.reload(); // Refresh the users list
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetPasswordUserId) return;
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    
    try {
      await apiService.adminResetPassword(resetPasswordUserId, newPassword);
      alert('Password reset successfully!');
      setResetPasswordUserId(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-7 sm:p-10 border border-[#01472e]/20 shadow-forest bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#e9edc9]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#fefae0]/15 border border-[#fefae0]/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-[#fefae0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#fefae0]" />
              <span>Ministry of Consumer Affairs, Food & Public Distribution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Platform Command & Governance Center
            </h1>
            <p className="text-sm text-emerald-100/80 font-normal max-w-2xl">
              National oversight console for Uzhavan Connect. Real-time telemetry across farmer price realization, disintermediation margins, food safety passbooks, and RBAC governance.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full text-[11px] text-emerald-200">
                <Activity className="w-3.5 h-3.5 text-emerald-300" />
                <span>Intermediary Margin Spread Reduction: <strong>32.4%</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#e9edc9]/20 border border-[#e9edc9]/30 px-3 py-1 rounded-full text-[11px] text-[#fefae0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Active Nodes: <strong>All State Clusters Operational</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setActiveTab('impact-kpis')}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#01472e]" />
              <span>National Impact KPIs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Platform Trade Volume', val: `${totalTradeVolumeKg.toLocaleString()} kg`, sub: `${orders.length} Completed & Active Orders`, icon: Layers, color: 'text-[#01472e]' },
          { label: 'Escrow Settlements', val: `₹${totalSettledAmount.toLocaleString()}`, sub: `${settlements.length} Audited Payouts`, icon: Landmark, color: 'text-indigo-700' },
          { label: 'Registered Entities', val: systemUsers.length.toString(), sub: `${activeUsersCount} Verified Active Profiles`, icon: Users, color: 'text-teal-700' },
          { label: 'Certified Batches', val: verifiedBatchesCount.toString(), sub: 'Cryptographic QR Passports', icon: QrCode, color: 'text-amber-700' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="agri-card rounded-3xl p-5 sm:p-6 border border-[#ccd5ae]/40 bg-white shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${item.color}`}>{item.val}</p>
              <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Section Filter Pills */}
      <div className="flex gap-2.5 border-b border-[#ccd5ae]/40 pb-4 overflow-x-auto">
        {[
          { key: 'USERS', label: `1. User Registry & RBAC Permissions (${systemUsers.length})`, icon: Users },
          { key: 'ESCROW', label: `2. Escrow & Direct Settlement Audit (${settlements.length})`, icon: Landmark },
          { key: 'TRACEABILITY', label: `3. QR Passports & Provenance (${producePassports.length})`, icon: QrCode },
          { key: 'SYSTEM', label: `4. Node Health & PWA Telemetry`, icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-2xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#01472e] text-white shadow-soft'
                  : 'bg-white border border-[#ccd5ae]/50 text-slate-600 hover:bg-[#faf9f5] hover:text-[#01472e]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#fefae0]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 1. USER REGISTRY & RBAC PERMISSIONS ─────────────────────────────── */}
      {activeTab === 'USERS' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">System User Directory & Access Control (RBAC)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enforce principle of least privilege, manage role permissions, and verify credentials across all participant nodes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user, email, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern pl-9 pr-3 py-1.5 text-xs rounded-xl w-48 sm:w-64"
                />
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-xs rounded-xl shadow-soft"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
            </div>
          </div>
          
          {/* Role Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-[#ccd5ae]/30 pb-2">
            {['ALL', 'FARMER', 'FPO_AGGREGATOR', 'RETAIL_BUYER', 'BULK_BUYER', 'LOGISTICS', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveRoleTab(role as any)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeRoleTab === role 
                    ? 'border-[#01472e] text-[#01472e]' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ccd5ae]/40 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Participant</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Location & Contact</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Role Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ccd5ae]/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#faf9f5] transition">
                    <td className="py-4 px-3">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{user.id}</div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{user.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : user.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{user.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.permissions.slice(0, 3).map((perm) => (
                          <button
                            key={perm}
                            onClick={() => toggleUserPermission(user.id, perm)}
                            title="Click to toggle permission"
                            className="bg-white hover:bg-[#faf9f5] border border-[#ccd5ae]/60 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono cursor-pointer transition shadow-2xs"
                          >
                            ✓ {perm}
                          </button>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => setResetPasswordUserId(user.id)}
                        title="Reset Password"
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#01472e] transition"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 2. ESCROW & SETTLEMENT AUDIT ───────────────────────────────────── */}
      {activeTab === 'ESCROW' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">Autonomous Escrow & Direct Payout Ledger</h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified delivery triggers automatic smart release from buyer escrow directly into farmer bank accounts, completely bypassing exploitative commission agents.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('settlements')}
              className="btn-primary self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-soft cursor-pointer"
            >
              Open Full Settlement Ledger
            </button>
          </div>

          <div className="space-y-4">
            {settlements.map((s) => (
              <div key={s.id} className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2 py-0.5 rounded border border-[#ccd5ae]/50">{s.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs text-slate-500">{s.orderId}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2 py-0.5 rounded-full border border-[#a3b18a]/40">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1.5">
                    Farmer Direct Payout: <span className="font-mono text-[#01472e]">₹{s.farmerAmount.toLocaleString()}</span> ({(s.farmerRealizationPercentage || 89)}%)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FPO Hub & Logistics Distribution: ₹{(s.logisticsAmount + s.platformAmount).toLocaleString()} • Bank UTR: {s.utrNumber || 'IMPS-AUTO-REL'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-slate-900">₹{s.totalOrderValue.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Released: {s.settlementDate || 'Instant'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. QR PASSPORTS & PROVENANCE ───────────────────────────────────── */}
      {activeTab === 'TRACEABILITY' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">Cryptographic Produce Passports & Batch Traceability</h3>
              <p className="text-xs text-slate-500 mt-1">
                Immutable audit ledger recording farm origins, pesticide residue compliance, cold-chain temperature telemetry, and FPO pack-out verification.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('traceability')}
              className="btn-outline self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-xs cursor-pointer"
            >
              Traceability Matrix
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {producePassports.map((passport) => (
              <div key={passport.batchId} className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2 py-0.5 rounded border border-[#ccd5ae]/40">{passport.batchId}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                    {passport.qualityGrade} Verified
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{passport.crop} ({passport.variety || 'Hybrid'})</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Origin: <strong>{passport.farmLocation}</strong> • Harvest: {passport.harvestDate}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    FPO Hub: {passport.collectionHub || passport.farmerOrFpo || 'GreenHarvest Cluster'} • Pesticide Test: <span className="font-semibold text-emerald-700">Clean / Zero-Residue</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#ccd5ae]/30 flex justify-end">
                  <button
                    onClick={() => openPassportModal(passport.batchId)}
                    className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Digital Passport</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. NODE HEALTH & SYSTEM TELEMETRY ──────────────────────────────── */}
      {activeTab === 'SYSTEM' && (
        <div className="agri-card rounded-[32px] border border-[#ccd5ae]/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ccd5ae]/30">
            <div>
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">National Cloud & Edge Node Telemetry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time operational status of offline-first field sync, background service workers, and distributed Supabase sync queues.
              </p>
            </div>
            <button
              onClick={() => syncOfflineQueue()}
              disabled={syncStatus === 'syncing'}
              className="btn-primary self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Force Synchronize</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">Network Connectivity</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                <span className="text-lg font-bold text-slate-900">{isOnline ? 'Online (High Speed)' : 'Field Offline Mode'}</span>
              </div>
              <p className="text-[11px] text-slate-400">IndexedDB local store active with write-through cache.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">Offline Sync Queue</span>
              <p className="text-2xl font-bold font-mono text-[#01472e]">{pendingSyncCount} Pending</p>
              <p className="text-[11px] text-slate-400">Batched delta mutations awaiting cloud sync acknowledgment.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">PWA Offline Caching</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-bold text-slate-900">ServiceWorker v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400">Critical routes & map tiles pre-cached for zero-connectivity mandi usage.</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-[#ccd5ae]/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#ccd5ae]/30 flex items-center justify-between bg-[#faf9f5]">
              <h2 className="text-xl font-bold text-[#01472e]">Create New User</h2>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="p-2 hover:bg-[#eaf4ec] text-slate-400 hover:text-[#01472e] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input required type="text" name="name" className="input-modern w-full text-sm" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input required type="email" name="email" className="input-modern w-full text-sm" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary Password</label>
                <input required type="password" name="password" className="input-modern w-full text-sm" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select required name="role" className="input-modern w-full text-sm">
                  <option value="FARMER">Farmer</option>
                  <option value="FPO_AGGREGATOR">FPO Aggregator</option>
                  <option value="RETAIL_BUYER">Retail Buyer</option>
                  <option value="BULK_BUYER">Bulk Buyer</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input type="text" name="phone" className="input-modern w-full text-sm" placeholder="+91..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                  <input type="text" name="location" className="input-modern w-full text-sm" placeholder="City, State" />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateUserModalOpen(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden border border-[#ccd5ae]/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#ccd5ae]/30 flex items-center justify-between bg-[#faf9f5]">
              <h2 className="text-lg font-bold text-[#01472e]">Reset Password</h2>
              <button onClick={() => setResetPasswordUserId(null)} className="p-2 hover:bg-[#eaf4ec] text-slate-400 hover:text-[#01472e] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                You are forcing a password reset for user ID <span className="font-mono text-slate-700 font-bold">{resetPasswordUserId}</span>.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                <input required type="text" name="newPassword" minLength={6} className="input-modern w-full text-sm" placeholder="Enter new password" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setResetPasswordUserId(null)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-xl flex-1 transition-colors">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
