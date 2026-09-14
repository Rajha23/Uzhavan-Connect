import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Search,
  SlidersHorizontal,
  Sprout,
  TrendingUp,
  Package,
  Truck,
  Scale,
  QrCode,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Filter,
  Check,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import { AppNotification, NotificationCategory, NotificationPriority } from '../types';
import { ROLE_DISPLAY_LABELS, ROLE_BADGE_STYLES } from '../services/routeGuard';
import { useLanguage } from '../context/LanguageContext';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    currentRole,
    currentUser,
    setActiveTab
  } = useApp();

  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const displayRole = ROLE_DISPLAY_LABELS[currentRole] || currentRole;
  const badgeStyle = ROLE_BADGE_STYLES[currentRole] || ROLE_BADGE_STYLES.FARMER;

  // Compute category counts
  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const urgentOrWarning = notifications.filter(
      (n) => n.priority === 'URGENT' || n.priority === 'WARNING'
    ).length;
    const success = notifications.filter((n) => n.priority === 'SUCCESS').length;
    return {
      total: notifications.length,
      unread,
      actionRequired: urgentOrWarning,
      success
    };
  }, [notifications]);

  // Filter categories based on role
  const categoryTabs = useMemo(() => {
    const tabs: Array<{ id: string; label: string; icon: any }> = [
      { id: 'ALL', label: t('notifications.allAlerts', 'All Alerts'), icon: Bell },
      { id: 'UNREAD', label: `${t('notifications.unreadOnly', 'Unread')} (${stats.unread})`, icon: Eye },
      { id: 'ACTION_REQUIRED', label: `${t('notifications.actionRequired', 'Action Required')} (${stats.actionRequired})`, icon: AlertTriangle }
    ];

    if (currentRole === 'FARMER' || currentRole === 'FPO_AGGREGATOR') {
      tabs.push({ id: 'CROPS', label: t('nav.myCrops', 'Crops & Harvest'), icon: Sprout });
    }
    tabs.push({ id: 'ORDERS', label: t('nav.orders', 'Orders'), icon: Package });
    tabs.push({ id: 'MARKET_DEMAND', label: t('nav.demandSignals', 'Market & Demand'), icon: TrendingUp });
    tabs.push({ id: 'LOGISTICS', label: t('nav.logistics', 'Logistics & Fleet'), icon: Truck });
    tabs.push({ id: 'SETTLEMENT', label: t('nav.settlement', 'Settlement & Escrow'), icon: Scale });
    tabs.push({ id: 'TRACEABILITY', label: t('nav.traceability', 'Traceability & QR'), icon: QrCode });

    if (currentRole === 'FARMER') {
      tabs.push({ id: 'ADVISORY', label: t('ai.agronomistMentor', 'AI Advisory'), icon: Sparkles });
    }

    if (currentRole === 'ADMIN') {
      tabs.push({ id: 'SYSTEM', label: t('nav.systemMonitoring', 'System & Governance'), icon: ShieldAlert });
    }

    return tabs;
  }, [currentRole, stats, t]);

  // Filtered alerts list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (selectedCategory === 'UNREAD' && n.read) return false;
      if (selectedCategory === 'ACTION_REQUIRED' && n.priority !== 'URGENT' && n.priority !== 'WARNING') return false;
      if (
        selectedCategory !== 'ALL' &&
        selectedCategory !== 'UNREAD' &&
        selectedCategory !== 'ACTION_REQUIRED'
      ) {
        if (selectedCategory === 'ORDERS' && n.type !== 'ORDERS' && n.type !== 'ORDER') return false;
        if (selectedCategory === 'MARKET_DEMAND' && n.type !== 'MARKET_DEMAND' && n.type !== 'DEMAND' && n.type !== 'MATCH') return false;
        if (selectedCategory !== 'ORDERS' && selectedCategory !== 'MARKET_DEMAND' && n.type !== selectedCategory) return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && n.priority !== selectedPriority) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesMessage = n.message.toLowerCase().includes(query);
        const matchesEntity = n.entityId ? n.entityId.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesMessage && !matchesEntity) return false;
      }

      return true;
    });
  }, [notifications, selectedCategory, selectedPriority, searchQuery]);

  const handleActionClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
    }
  };

  const getCategoryIcon = (type: NotificationCategory) => {
    switch (type) {
      case 'CROPS':
        return <Sprout className="w-4 h-4 text-[#01472e]" />;
      case 'MARKET_DEMAND':
      case 'DEMAND':
        return <TrendingUp className="w-4 h-4 text-[#01472e]" />;
      case 'MATCH':
        return <Sparkles className="w-4 h-4 text-amber-700" />;
      case 'ORDERS':
      case 'ORDER':
        return <Package className="w-4 h-4 text-[#01472e]" />;
      case 'LOGISTICS':
        return <Truck className="w-4 h-4 text-blue-700" />;
      case 'SETTLEMENT':
        return <Scale className="w-4 h-4 text-emerald-800" />;
      case 'TRACEABILITY':
        return <QrCode className="w-4 h-4 text-teal-800" />;
      case 'ADVISORY':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'SYSTEM':
      default:
        return <ShieldAlert className="w-4 h-4 text-[#01472e]" />;
    }
  };

  const getPriorityBadge = (priority?: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            {t('notifications.urgentBadge', 'Urgent Action')}
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 uppercase tracking-wider shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {t('notifications.warningBadge', 'Action Required')}
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 uppercase tracking-wider shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('notifications.successBadge', 'Completed')}
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40 uppercase tracking-wider shadow-2xs">
            <Info className="w-3.5 h-3.5 text-[#01472e]" />
            {t('notifications.infoBadge', 'Information')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-[#faf9f5] via-[#eaf4ec]/50 to-[#faf9f5] rounded-[32px] border border-[#ccd5ae]/60 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#01472e] uppercase tracking-wider bg-[#eaf4ec] px-3 py-1 rounded-full border border-[#a3b18a]/40">
                {t('notifications.tag', 'Operational Intelligence')}
              </span>
              <div
                className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
              >
                <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} animate-pulse`} />
                <span>{t('roles.' + currentRole, displayRole)}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#01472e] tracking-tight">
              {t('notifications.title', 'Notifications & Operational Alerts')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t('notifications.subtitle', 'Real-time agricultural supply chain events, harvest windows, cold-chain dispatches, and programmable escrow settlements tailored to your authorized operational workflow.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#faf9f5] text-[#01472e] border border-[#ccd5ae] font-semibold text-xs shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-[#01472e]" />
                <span>{t('notifications.markAllRead', 'Mark All Read')} ({unreadNotificationsCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-semibold text-xs shadow-soft transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#e9edc9]" />
              <span>{t('notifications.preferences', 'Configure Preferences')}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 mt-6 border-t border-[#ccd5ae]/40">
          <div className="p-4 bg-white/90 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                {t('notifications.kpiTotal', 'Total Alerts')}
              </span>
              <Bell className="w-3.5 h-3.5 text-[#01472e]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-bold text-[#01472e]">{stats.total}</strong>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                {t('notifications.kpiUnread', 'Unread')}
              </span>
              <Eye className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-bold text-amber-700">{stats.unread}</strong>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                {t('notifications.kpiAction', 'Action Required')}
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-bold text-rose-700">{stats.actionRequired}</strong>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-[#ccd5ae]/50 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                {t('notifications.kpiSettled', 'Completed Events')}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-bold text-emerald-800">{stats.success}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#01472e] text-white shadow-soft scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-[#faf9f5] border border-[#ccd5ae]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#fefae0]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Priority Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('notifications.searchPlaceholder', 'Search notifications by crop, order ID, buyer, location...')}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#ccd5ae]/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#01472e]/20 focus:border-[#01472e] transition text-[#01472e] shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {t('common.clear', 'Clear')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full sm:w-auto bg-white border border-[#ccd5ae]/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#01472e] shadow-2xs cursor-pointer"
            >
              <option value="ALL">{t('common.all', 'All Priorities')}</option>
              <option value="URGENT">{t('notifications.urgentBadge', 'Urgent Action')}</option>
              <option value="WARNING">{t('notifications.warningBadge', 'Action Required')}</option>
              <option value="SUCCESS">{t('notifications.successBadge', 'Completed')}</option>
              <option value="INFO">{t('notifications.infoBadge', 'Information')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Notifications Cards List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[32px] border border-[#ccd5ae]/60 space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#01472e]">{t('notifications.emptyTitle', 'No Matching Notifications')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('notifications.emptySubtitle', 'No alerts match your current filter criteria. All pending tasks for your profile are up to date.')}
            </p>
            {(searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedPriority('ALL');
                }}
                className="mt-2 px-4 py-2 rounded-2xl bg-[#eaf4ec] text-[#01472e] font-bold text-xs hover:bg-[#d5ebd9] transition cursor-pointer"
              >
                {t('common.reset', 'Reset All Filters')}
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                className={`rounded-[28px] border transition-all p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:shadow-soft group ${
                  isUnread
                    ? 'bg-gradient-to-r from-white via-[#faf9f5] to-white border-[#01472e]/40 ring-1 ring-[#01472e]/10'
                    : 'bg-white border-[#ccd5ae]/60 hover:border-[#01472e]/50'
                }`}
              >
                {/* Left content block */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Category icon with unread marker */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#eaf4ec] border border-[#a3b18a]/30 flex items-center justify-center text-[#01472e] shadow-2xs group-hover:scale-105 transition">
                      {getCategoryIcon(notif.type)}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#01472e] rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(notif.priority)}

                      {notif.entityId && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#faf9f5] text-slate-700 border border-[#ccd5ae]/60">
                          {notif.entityId}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 font-medium ml-auto sm:ml-0">
                        <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                        {notif.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#01472e] tracking-tight">
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Right actions block */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {/* Mark as read toggle */}
                  <button
                    type="button"
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
                      isUnread
                        ? 'bg-[#eaf4ec] hover:bg-[#d5ebd9] text-[#01472e] border-[#a3b18a]/50'
                        : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                    title={isUnread ? t('notifications.markAsRead', 'Mark as read') : t('common.read', 'Read')}
                  >
                    <Check className={`w-3.5 h-3.5 ${isUnread ? 'text-[#01472e]' : 'text-slate-400'}`} />
                    <span className="hidden lg:inline">{isUnread ? t('notifications.markAsRead', 'Mark Read') : t('common.read', 'Read')}</span>
                  </button>

                  {/* Direct workflow action button */}
                  {notif.actionTab && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(notif)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-bold text-xs shadow-soft transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>{notif.actionLabel || t('common.actions', 'Take Action')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#e9edc9]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
