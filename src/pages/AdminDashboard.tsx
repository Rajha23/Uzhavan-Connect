import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { KPIGrid, KPIStatCard } from '../components/KPIGrid';
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
  Sprout,
  ShoppingBag,
  Building2,
  Truck,
  Check,
  Sparkles,
  Lightbulb,
  Filter,
  RotateCcw,
  Scale,
  ArrowRight,
  Award,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, Permission } from '../types';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
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

  const [activeTab, setActiveSection] = useState<'USERS' | 'ESCROW' | 'TRACEABILITY' | 'SYSTEM' | 'AI_RECOMMENDATIONS'>('USERS');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ─── Admin AI Suggestions & Strategic Recommendations State ───────────────
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<'ALL' | 'QUALITY' | 'PACKAGING' | 'WEIGHING' | 'ESCROW' | 'GOVERNANCE'>('ALL');
  const [adminAppliedRecommendations, setAdminAppliedRecommendations] = useState<string[]>([]);
  const [adminDismissedRecommendations, setAdminDismissedRecommendations] = useState<string[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const adminAiRecommendations = useMemo(() => [
    {
      id: 'REC-ADM-01',
      category: 'QUALITY' as const,
      severity: 'high' as const,
      title: 'Mandate Mechanical Ring-Caliper Sizing for Tomato Grade-A',
      hub: 'Regional Hub Cluster — Coimbatore & Erode',
      affectedEntity: 'Tomato Lot #TM-2024-09 & 14 Aggregator Nodes',
      rootCause: 'Manual sorting fatigue during peak evening shifts resulted in 14.8% diameter variation cited across institutional buyer feedback.',
      suggestedAction: 'Enforce ring-caliper sizing gauge SOP before digital crate barcode generation. Deploy automated pre-pack QA sampling.',
      impact: 'Eliminates sizing rejection risk across regional hubs (est. ₹84,000 monthly dispute avoidance).',
      actionLabel: 'Enforce Sizing SOP & Broadcast to Hubs',
      appliedNote: 'Platform SOP enforced across Coimbatore & Erode clusters. Mechanical caliper verification dispatched to QA tables.'
    },
    {
      id: 'REC-ADM-02',
      category: 'PACKAGING' as const,
      severity: 'medium' as const,
      title: 'Adopt Perforated Moisture-Wicking Liners for Highway Corridors',
      hub: 'Erode — Salem — Bangalore Corridors',
      affectedEntity: 'Leafy Greens & Cluster Beans collective dispatch lines',
      rootCause: 'Buyer feedback flagged transit condensation and bottom-tier leaf wilting across 45+ km non-reefer highway routes.',
      suggestedAction: 'Equip packaging lines with micro-perforated polypropylene liners to absorb transit moisture and condensation.',
      impact: 'Boosts farm-to-retail freshness score by +18.4% and cuts spoilage claims by 32%.',
      actionLabel: 'Authorize Packaging Liner Standards',
      appliedNote: 'Moisture-wicking liner standards mandated for all ambient highway freight consignments.'
    },
    {
      id: 'REC-ADM-03',
      category: 'WEIGHING' as const,
      severity: 'medium' as const,
      title: 'Digital Bluetooth Weighbridge Integration at Farm-Gate',
      hub: 'Tirupur & Pollachi Farm-Gate Routes',
      affectedEntity: 'Farm-Gate Collection Route #2 & #5',
      rootCause: '2 member farmers reported ambiguous tare weight deductions during analog scale harvest collection.',
      suggestedAction: 'Mandate calibrated Bluetooth IoT scales with instant SMS digital weighment slip dispatch to farmer mobile.',
      impact: '100% farm-gate reconciliation transparency, zero tare disputes, and instant trust verification.',
      actionLabel: 'Deploy IoT Bluetooth Scale Protocol',
      appliedNote: 'IoT Bluetooth Scale protocol activated across collection routes. Weigh slips synchronized with national ledger.'
    },
    {
      id: 'REC-ADM-04',
      category: 'ESCROW' as const,
      severity: 'high' as const,
      title: 'Automated Escrow Instant Payout for Grade-A Delivery Scans',
      hub: 'National Escrow Clearing System',
      affectedEntity: 'Verified institutional buyers with >98% acceptance track record',
      rootCause: 'Manual 48-hour escrow clearing buffer causes unnecessary liquidity delay for smallholder farmers after clean dock acceptance.',
      suggestedAction: 'Enable smart contract auto-settlement for buyers with verified track record, immediately releasing 89% farmer payout via e-RUPI upon gate scan.',
      impact: 'Reduces payment turnaround from 48 hours to under 30 seconds for 92% of trades.',
      actionLabel: 'Activate Smart Instant Escrow Release',
      appliedNote: 'Smart Escrow Instant Release activated for Grade-A verified delivery scans.'
    },
    {
      id: 'REC-ADM-05',
      category: 'GOVERNANCE' as const,
      severity: 'low' as const,
      title: 'National Quality Champion Accreditation & Priority Quota',
      hub: 'Statewide Producer Network',
      affectedEntity: 'Member Farmer Anbu Arasan & Top 5% FPO Members',
      rootCause: 'Top-tier producers maintaining >4.85★ across 100+ deliveries require economic incentives to preserve organic & GAP standards.',
      suggestedAction: 'Issue National Quality Champion Green Badge and automatically allocate 15% priority matching quota for high-margin buyer tenders.',
      impact: 'Increases premium produce retention on platform by +27% and stimulates member adherence to Good Agricultural Practices.',
      actionLabel: 'Issue Quality Champion Badges',
      appliedNote: 'Quality Champion Badges awarded with priority matching algorithm weights updated.'
    },
    {
      id: 'REC-ADM-06',
      category: 'PACKAGING' as const,
      severity: 'high' as const,
      title: 'Midday Reefer Temperature Deviation Alert & Dynamic Rerouting',
      hub: 'Madurai — Chennai Expressway Corridor',
      affectedEntity: 'Reefer Consignment #RF-8821 (Tomato & Capsicum 8.5T)',
      rootCause: 'Ambient external temperature exceeding 41°C caused reefer compressor duty cycle to reach 96% with cargo compartment warming to 8.2°C.',
      suggestedAction: 'Dispatch automated rerouting to Krishnagiri Pre-cooling Cold Hub for 45-minute nitrogen booster pulse before final mandi delivery.',
      impact: 'Prevents thermal degradation of ₹3.2L high-value produce consignment.',
      actionLabel: 'Reroute to Pre-cooling Hub',
      appliedNote: 'Emergency reefer pre-cooling detour dispatched to driver navigation console.'
    }
  ], []);

  const activeAiRecommendations = adminAiRecommendations.filter(
    (rec) => !adminDismissedRecommendations.includes(rec.id)
  );

  const handleApplyAdminRecommendation = (recId: string, appliedNote: string) => {
    setAdminAppliedRecommendations((prev) => [...prev, recId]);
    confetti({ particleCount: 55, origin: { y: 0.6 } });
    showNotification(`AI Strategy Enforced: ${appliedNote}`);
  };

  const handleDismissAdminRecommendation = (recId: string) => {
    setAdminDismissedRecommendations((prev) => [...prev, recId]);
    showNotification('AI Recommendation dismissed from active view.');
  };

  const handleResetDismissedRecommendations = () => {
    setAdminDismissedRecommendations([]);
    showNotification('All dismissed AI recommendations have been restored.');
  };

  // Calculations
  const totalTradeVolumeKg = orders.reduce((sum, o) => sum + (o.packedQuantityKg || o.quantityKg || 0), 0);
  const totalSettledAmount = settlements.reduce((sum, s) => sum + (s.totalOrderValue || 0), 0);
  const activeUsersCount = systemUsers.filter((u) => u.status === 'ACTIVE').length;
  const verifiedBatchesCount = producePassports.length;

  const filteredUsers = systemUsers.filter((user) => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
              <span>{t('admin.ministryBadge', 'Ministry of Consumer Affairs, Food & Public Distribution')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t('admin.commandCenterTitle', 'Platform Command & Governance Center')}
            </h1>
            <p className="text-sm text-emerald-100/80 font-normal max-w-2xl">
              {t('admin.commandCenterSubtitle', 'National oversight console for Uzhavan Connect. Real-time telemetry across farmer price realization, disintermediation margins, food safety passbooks, and RBAC governance.')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full text-[11px] text-emerald-200">
                <Activity className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('admin.marginSpreadReduction', 'Intermediary Margin Spread Reduction:')} <strong>32.4%</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#e9edc9]/20 border border-[#e9edc9]/30 px-3 py-1 rounded-full text-[11px] text-[#fefae0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('admin.allClustersOperational', 'All State Clusters Operational')}</span>
              </span>
              <button
                onClick={() => setActiveSection('AI_RECOMMENDATIONS')}
                className="inline-flex items-center gap-1.5 bg-[#fefae0]/20 hover:bg-[#fefae0]/30 border border-[#fefae0]/40 px-3 py-1 rounded-full text-[11px] text-[#fefae0] font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{activeAiRecommendations.length} AI Recommendations Actionable</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setActiveSection('AI_RECOMMENDATIONS')}
              className="flex items-center gap-2 bg-[#fefae0] hover:bg-white text-[#01472e] text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#01472e]" />
              <span>{t('admin.aiRecommendations', 'AI Suggestions & Advisory')}</span>
            </button>
            <button
              onClick={() => setActiveTab('impact-kpis')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-soft hover:shadow-md transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#fefae0]" />
              <span>{t('admin.nationalImpactKpis', 'National Impact KPIs')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      {actionSuccessMessage && (
        <div className="p-4 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#01472e] text-white flex items-center justify-center font-medium text-sm shrink-0">
              ✓
            </div>
            <p className="text-xs font-semibold text-[#01472e]">{actionSuccessMessage}</p>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-xs text-[#5c7065] hover:text-[#01472e] font-semibold px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <KPIGrid columns={4}>
        {[
          { labelKey: 'admin.kpi.platformTradeVolume', defaultLabel: 'Platform Trade Volume', val: `${totalTradeVolumeKg.toLocaleString()} kg`, subKey: 'admin.kpi.completedActiveOrders', defaultSub: '{count} Completed & Active Orders', count: orders.length, icon: Layers, color: 'text-[#01472e]' },
          { labelKey: 'admin.kpi.escrowSettlements', defaultLabel: 'Escrow Settlements', val: `₹${totalSettledAmount.toLocaleString()}`, subKey: 'admin.kpi.auditedPayouts', defaultSub: '{count} Audited Payouts', count: settlements.length, icon: Landmark, color: 'text-indigo-700' },
          { labelKey: 'admin.kpi.registeredEntities', defaultLabel: 'Registered Entities', val: systemUsers.length.toString(), subKey: 'admin.kpi.verifiedActiveProfiles', defaultSub: '{count} Verified Active Profiles', count: activeUsersCount, icon: Users, color: 'text-teal-700' },
          { labelKey: 'admin.kpi.certifiedBatches', defaultLabel: 'Certified Batches', val: verifiedBatchesCount.toString(), subKey: 'admin.kpi.cryptoPassports', defaultSub: 'Cryptographic QR Passports', count: undefined, icon: QrCode, color: 'text-amber-700' },
        ].map((item, idx) => (
          <KPIStatCard
            key={idx}
            label={t(item.labelKey, item.defaultLabel)}
            value={item.val}
            subtitle={t(item.subKey, item.defaultSub, item.count !== undefined ? { count: item.count } : undefined)}
            icon={item.icon}
            valueColor={item.color}
          />
        ))}
      </KPIGrid>

      {/* Section Filter Pills */}
      <div className="flex gap-2.5 border-b border-[#ccd5ae]/40 pb-4 overflow-x-auto">
        {[
          { key: 'USERS', label: t('admin.tab.userRegistry', '1. User Registry & RBAC Permissions ({count})', { count: systemUsers.length }), icon: Users },
          { key: 'ESCROW', label: t('admin.tab.escrowAudit', '2. Escrow & Direct Settlement Audit ({count})', { count: settlements.length }), icon: Landmark },
          { key: 'TRACEABILITY', label: t('admin.tab.traceability', '3. QR Passports & Provenance ({count})', { count: producePassports.length }), icon: QrCode },
          { key: 'SYSTEM', label: t('admin.tab.systemTelemetry', '4. Node Health & PWA Telemetry'), icon: Cpu },
          { key: 'AI_RECOMMENDATIONS', label: `5. AI Suggestions & Advisory (${activeAiRecommendations.length})`, icon: Sparkles }
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
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('admin.userDirectoryTitle', 'System User Directory & Access Control (RBAC)')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.userDirectorySubtitle', 'Enforce principle of least privilege, manage role permissions, and verify credentials across all participant nodes.')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('admin.searchPlaceholder', 'Search user, email, city...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern pl-9 pr-3 py-1.5 text-xs rounded-xl w-48 sm:w-64"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-modern py-1.5 px-3 text-xs rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="ALL">{t('admin.allRoles', 'All Roles')}</option>
                <option value="FARMER">{t('roles.farmer', 'Farmers')}</option>
                <option value="FPO_AGGREGATOR">{t('roles.fpo', 'FPO Aggregators')}</option>
                <option value="RETAIL_BUYER">{t('roles.buyer', 'Retail Buyers')}</option>
                <option value="BULK_BUYER">{t('roles.bulk_buyer', 'Bulk Buyers')}</option>
                <option value="LOGISTICS">{t('roles.logistics', 'Logistics')}</option>
                <option value="ADMIN">{t('roles.admin', 'Admins')}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ccd5ae]/40 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">{t('admin.colParticipant', 'Participant')}</th>
                  <th className="pb-3 px-3">{t('admin.colRole', 'Role')}</th>
                  <th className="pb-3 px-3">{t('admin.colLocationContact', 'Location & Contact')}</th>
                  <th className="pb-3 px-3">{t('common.status', 'Status')}</th>
                  <th className="pb-3 px-3">{t('admin.colRolePermissions', 'Role Permissions')}</th>
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
                      <span className="font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40 inline-flex items-center gap-1.5">
                        {user.role === 'FARMER' && <Sprout className="w-3 h-3" />}
                        {user.role === 'FPO_AGGREGATOR' && <Users className="w-3 h-3" />}
                        {user.role === 'RETAIL_BUYER' && <ShoppingBag className="w-3 h-3" />}
                        {user.role === 'BULK_BUYER' && <Building2 className="w-3 h-3" />}
                        {user.role === 'LOGISTICS' && <Truck className="w-3 h-3" />}
                        {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                        <span>{user.role.replace('_', ' ')}</span>
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
                            className="bg-white hover:bg-[#faf9f5] border border-[#ccd5ae]/60 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-mono cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span>{perm}</span>
                          </button>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            {t('admin.morePermissions', '+{count} more', { count: user.permissions.length - 3 })}
                          </span>
                        )}
                      </div>
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
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('admin.escrowTitle', 'Autonomous Escrow & Direct Payout Ledger')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.escrowSubtitle', 'Verified delivery triggers automatic smart release from buyer escrow directly into farmer bank accounts, completely bypassing exploitative commission agents.')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('settlements')}
              className="btn-primary self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-soft cursor-pointer"
            >
              {t('admin.openFullSettlementLedger', 'Open Full Settlement Ledger')}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eaf4ec] text-[#01472e] px-2.5 py-0.5 rounded-full border border-[#a3b18a]/40">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1.5">
                    {t('admin.farmerDirectPayout', 'Farmer Direct Payout:')} <span className="font-mono text-[#01472e]">₹{s.farmerAmount.toLocaleString()}</span> ({(s.farmerRealizationPercentage || 89)}%)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('admin.fpoLogisticsDistribution', 'FPO Hub & Logistics Distribution:')} ₹{(s.logisticsAmount + s.platformAmount).toLocaleString()} • {t('admin.bankUtr', 'Bank UTR:')} {s.utrNumber || 'IMPS-AUTO-REL'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-slate-900">₹{s.totalOrderValue.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{t('admin.released', 'Released:')} {s.settlementDate || t('common.instant', 'Instant')}</p>
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
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('admin.traceabilityTitle', 'Cryptographic Produce Passports & Batch Traceability')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.traceabilitySubtitle', 'Immutable audit ledger recording farm origins, pesticide residue compliance, cold-chain temperature telemetry, and FPO pack-out verification.')}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('traceability')}
              className="btn-outline self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-xs cursor-pointer"
            >
              {t('admin.traceabilityMatrix', 'Traceability Matrix')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {producePassports.map((passport) => (
              <div key={passport.batchId} className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#01472e] bg-white px-2 py-0.5 rounded border border-[#ccd5ae]/40">{passport.batchId}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                    {passport.qualityGrade} {t('admin.verified', 'Verified')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t(`crops.${passport.crop}`, passport.crop)} ({passport.variety || 'Hybrid'})</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {t('admin.originLabel', 'Origin:')} <strong>{passport.farmLocation}</strong> • {t('admin.harvestLabel', 'Harvest:')} {passport.harvestDate}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('admin.fpoHubLabel', 'FPO Hub:')} {passport.collectionHub || passport.farmerOrFpo || 'GreenHarvest Cluster'} • {t('admin.pesticideTestLabel', 'Pesticide Test:')} <span className="font-semibold text-emerald-700">{t('admin.cleanZeroResidue', 'Clean / Zero-Residue')}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#ccd5ae]/30 flex justify-end">
                  <button
                    onClick={() => openPassportModal(passport.batchId)}
                    className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t('admin.viewDigitalPassport', 'View Digital Passport')}</span>
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
              <h3 className="text-xl font-bold text-[#01472e] tracking-tight">{t('admin.systemTitle', 'National Cloud & Edge Node Telemetry')}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.systemSubtitle', 'Real-time operational status of offline-first field sync, background service workers, and distributed Supabase sync queues.')}
              </p>
            </div>
            <button
              onClick={() => syncOfflineQueue()}
              disabled={syncStatus === 'syncing'}
              className="btn-primary self-start sm:self-auto px-4 py-2 text-xs rounded-xl font-semibold shadow-soft flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{t('admin.forceSynchronize', 'Force Synchronize')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">{t('admin.networkConnectivity', 'Network Connectivity')}</span>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                <span className="text-lg font-bold text-slate-900">{isOnline ? t('admin.onlineHighSpeed', 'Online (High Speed)') : t('admin.fieldOfflineMode', 'Field Offline Mode')}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('admin.indexedDbNote', 'IndexedDB local store active with write-through cache.')}</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">{t('admin.offlineSyncQueue', 'Offline Sync Queue')}</span>
              <p className="text-2xl font-bold font-mono text-[#01472e]">{t('admin.pendingCount', '{count} Pending', { count: pendingSyncCount })}</p>
              <p className="text-[11px] text-slate-400">{t('admin.batchedDeltaNote', 'Batched delta mutations awaiting cloud sync acknowledgment.')}</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#faf9f5] border border-[#ccd5ae]/50 space-y-2">
              <span className="text-xs font-semibold text-slate-500">{t('admin.pwaOfflineCaching', 'PWA Offline Caching')}</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-base font-bold text-slate-900">ServiceWorker v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('admin.criticalRoutesNote', 'Critical routes & map tiles pre-cached for zero-connectivity mandi usage.')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. AI SUGGESTIONS & STRATEGIC RECOMMENDATIONS ─────────────────── */}
      {activeTab === 'AI_RECOMMENDATIONS' && (
        <div className="agri-card rounded-[32px] border border-[#a3b18a]/40 bg-white/95 backdrop-blur-md shadow-soft p-6 sm:p-8 space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ccd5ae]/30 pb-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#01472e] via-[#025a3b] to-[#013824] flex items-center justify-center text-white shadow-soft shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-[#e9edc9] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-[#01472e] tracking-tight">
                    Autonomous AI Intelligence & Policy Recommendation Engine
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40">
                    {activeAiRecommendations.length} AI Recommendations Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    ● Real-Time Telemetry
                  </span>
                </div>
                <p className="text-xs text-[#5c7065] mt-1 max-w-3xl">
                  National governance suggestions synthesized from multi-node mandi sensor streams, institutional buyer quality disputes, reefer GPS tracking, and farm-gate electronic weighbridge logs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {adminDismissedRecommendations.length > 0 && (
                <button
                  onClick={handleResetDismissedRecommendations}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#ccd5ae]/60 text-[#01472e] text-xs font-semibold hover:bg-[#eaf4ec] transition cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Dismissed ({adminDismissedRecommendations.length})</span>
                </button>
              )}
              <button
                onClick={() => {
                  confetti({ particleCount: 30, origin: { y: 0.5 } });
                  showNotification('Synchronized all AI telemetry models with live cluster logs.');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#01472e] hover:bg-[#025a3b] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-sync AI Models</span>
              </button>
            </div>
          </div>

          {/* Quality & Intelligence Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">Avg Quality Index</span>
                <div className="flex text-amber-400 text-xs">★★★★★</div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#01472e]">4.8</span>
                <span className="text-xs font-medium text-[#5c7065]"> / 5.0</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                94% positive sentiment across 87 audits
              </p>
            </div>

            <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">Grading SOP Compliance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#01472e]">97.4%</span>
              </div>
              <p className="text-[10px] text-[#5c7065] font-medium mt-1">
                +2.1% after mechanical sizer rollouts
              </p>
            </div>

            <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">Weighing Transparency</span>
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#01472e]">99.1%</span>
              </div>
              <p className="text-[10px] text-[#5c7065] font-medium mt-1">
                Zero tare disputes reported this cycle
              </p>
            </div>

            <div className="bg-white border border-[#ccd5ae]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7065]">Cold-Chain Integrity</span>
                <Truck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#01472e]">96.8%</span>
              </div>
              <p className="text-[10px] text-[#5c7065] font-medium mt-1">
                Avg dispatch temp maintained at 4.2°C
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-[#5c7065] flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter by Strategic Domain:
            </span>
            {[
              { id: 'ALL' as const, label: `All Actionable Suggestions (${activeAiRecommendations.length})` },
              { id: 'QUALITY' as const, label: 'Produce Quality & Grading' },
              { id: 'PACKAGING' as const, label: 'Packaging & Reefer Logistics' },
              { id: 'WEIGHING' as const, label: 'Farm-Gate Scale Telemetry' },
              { id: 'ESCROW' as const, label: 'Escrow & Payout Automation' },
              { id: 'GOVERNANCE' as const, label: 'Platform Standards & Quotas' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAdminCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                  adminCategoryFilter === cat.id
                    ? 'bg-[#01472e] text-white shadow-xs'
                    : 'bg-[#faf9f5] border border-[#ccd5ae]/50 text-[#5c7065] hover:bg-[#eaf4ec]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* AI Recommendations Cards */}
          {activeAiRecommendations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#faf9f5] border border-dashed border-[#ccd5ae]/70 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-[#01472e]">All AI Recommendations Addressed</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active suggestions are pending your review. All cluster SOPs and policy guidelines are running at peak performance.
              </p>
              <button
                onClick={handleResetDismissedRecommendations}
                className="btn-outline px-4 py-2 text-xs rounded-xl font-semibold shadow-2xs cursor-pointer inline-flex items-center gap-2 mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Dismissed Recommendations</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAiRecommendations
                .filter((rec) => adminCategoryFilter === 'ALL' || rec.category === adminCategoryFilter)
                .map((rec) => {
                  const isApplied = adminAppliedRecommendations.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      className={`rounded-3xl p-6 border transition duration-200 relative flex flex-col justify-between ${
                        isApplied
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                          : rec.severity === 'high'
                          ? 'bg-rose-50/30 border-rose-200 hover:shadow-md'
                          : rec.severity === 'medium'
                          ? 'bg-amber-50/30 border-amber-200 hover:shadow-md'
                          : 'bg-[#faf9f5] border-[#ccd5ae]/60 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                rec.severity === 'high'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : rec.severity === 'medium'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {rec.severity} Priority
                            </span>
                            <span className="text-[10px] font-bold text-[#788c80] uppercase tracking-wide">
                              {rec.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-[#01472e] bg-white px-2 py-0.5 rounded border border-[#ccd5ae]/50">
                            {rec.hub}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-[#01472e] leading-snug">{rec.title}</h4>
                        <p className="text-[11px] text-[#788c80] mt-0.5 font-medium">{rec.affectedEntity}</p>

                        <div className="mt-4 space-y-2.5 text-xs">
                          <div className="p-3 rounded-2xl bg-white/90 border border-[#ccd5ae]/50 text-[#5c7065] shadow-2xs">
                            <span className="font-bold text-[#01472e] block text-[11px] mb-1">🔍 Root Cause Telemetry:</span>
                            <p className="text-[11px] leading-relaxed">{rec.rootCause}</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#eaf4ec] to-[#f0f8f2] border border-[#a3b18a]/50 text-[#01472e] shadow-2xs">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#01472e] mb-1">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>AI Recommended Action & Suggestion:</span>
                            </div>
                            <p className="text-[11px] leading-relaxed font-semibold text-[#025a3b]">{rec.suggestedAction}</p>
                          </div>

                          <div className="text-[11px] font-semibold text-emerald-800 flex items-start gap-1.5 pt-1">
                            <span className="shrink-0">📈 Expected System Impact:</span>
                            <span className="font-normal text-[#5c7065]">{rec.impact}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[#ccd5ae]/30 flex items-center justify-between gap-3">
                        {isApplied ? (
                          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold py-1 bg-emerald-100/70 px-3.5 rounded-xl border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Policy Enforced & Broadcasted to Network</span>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApplyAdminRecommendation(rec.id, rec.appliedNote)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#01472e] hover:bg-[#025a3b] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{rec.actionLabel}</span>
                            </button>
                            <button
                              onClick={() => handleDismissAdminRecommendation(rec.id)}
                              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#788c80] hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
