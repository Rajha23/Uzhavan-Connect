import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  Sprout,
  TrendingUp,
  Sparkles,
  Package,
  Truck,
  Scale,
  QrCode,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { AppNotification, NotificationCategory, NotificationPriority } from '../types';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD' | 'IMPORTANT'>('ALL');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter notifications for quick dropdown
  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'UNREAD') return !n.read;
    if (filterMode === 'IMPORTANT') return n.priority === 'URGENT' || n.priority === 'WARNING';
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
    }
    setIsOpen(false);
  };

  const getCategoryIcon = (type: NotificationCategory) => {
    switch (type) {
      case 'CROPS':
        return <Sprout className="w-3.5 h-3.5 text-[#01472e]" />;
      case 'MARKET_DEMAND':
      case 'DEMAND':
        return <TrendingUp className="w-3.5 h-3.5 text-[#01472e]" />;
      case 'MATCH':
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
      case 'ORDERS':
      case 'ORDER':
        return <Package className="w-3.5 h-3.5 text-[#01472e]" />;
      case 'LOGISTICS':
        return <Truck className="w-3.5 h-3.5 text-blue-700" />;
      case 'SETTLEMENT':
        return <Scale className="w-3.5 h-3.5 text-emerald-800" />;
      case 'TRACEABILITY':
        return <QrCode className="w-3.5 h-3.5 text-teal-800" />;
      case 'ADVISORY':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'SYSTEM':
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-[#01472e]" />;
    }
  };

  const getPriorityBadge = (priority?: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            Action Req.
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            Success
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#eaf4ec] text-[#01472e] border border-[#a3b18a]/40 uppercase tracking-wider">
            <Info className="w-2.5 h-2.5 text-[#01472e]" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-2xl bg-white/90 hover:bg-white text-[#01472e] border border-[#ccd5ae]/80 shadow-2xs hover:border-[#01472e]/60 transition hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
        title="Notifications & Operational Alerts"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-[#01472e]" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#01472e] text-[9px] font-extrabold text-[#fefae0] shadow-xs ring-2 ring-[#faf9f5] animate-pulse">
            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Dropdown Quick Access Panel */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-md bg-white rounded-[28px] shadow-forest-xl border border-[#ccd5ae]/80 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[540px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#faf9f5] via-[#eaf4ec]/50 to-[#faf9f5] border-b border-[#ccd5ae]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#01472e] flex items-center justify-center text-[#fefae0] shadow-2xs">
                <Bell className="w-3.5 h-3.5 text-[#fefae0]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#01472e] tracking-tight">
                  Alerts & Notifications
                </h3>
                <p className="text-[10px] text-[#5c7065]">
                  {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread operational alert${unreadNotificationsCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#01472e] hover:text-[#025a3b] bg-white px-2.5 py-1 rounded-xl border border-[#ccd5ae]/60 shadow-2xs hover:bg-[#eaf4ec]/40 transition cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3 h-3 text-[#01472e]" />
                  <span>Mark Read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#ccd5ae]/20 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="px-3 py-2 bg-[#faf9f5]/80 border-b border-[#ccd5ae]/30 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-[#01472e] text-white shadow-2xs'
                  : 'text-[#5c7065] hover:bg-white hover:text-[#01472e]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('UNREAD')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                filterMode === 'UNREAD'
                  ? 'bg-[#01472e] text-white shadow-2xs'
                  : 'text-[#5c7065] hover:bg-white hover:text-[#01472e]'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('IMPORTANT')}
              className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                filterMode === 'IMPORTANT'
                  ? 'bg-[#01472e] text-white shadow-2xs'
                  : 'text-[#5c7065] hover:bg-white hover:text-[#01472e]'
              }`}
            >
              Action Required
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#ccd5ae]/30 bg-white">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-[#eaf4ec] text-[#01472e] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#01472e]">No alerts found</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {filterMode === 'UNREAD'
                    ? 'You have read all pending notifications for this role.'
                    : 'Everything is up to date with your current harvest and logistics workflow.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-[#f7faee]/60 transition cursor-pointer flex gap-3 relative group ${
                    !notif.read ? 'bg-[#faf9f5]' : 'bg-white'
                  }`}
                >
                  {/* Unread Accent Pill */}
                  {!notif.read && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#01472e] rounded-r-full" />
                  )}

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-[#eaf4ec] border border-[#a3b18a]/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition">
                    {getCategoryIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-[#01472e] truncate tracking-tight">
                        {notif.title}
                      </h4>
                      {getPriorityBadge(notif.priority)}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {notif.timestamp}
                      </span>

                      {notif.actionLabel && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#01472e] group-hover:underline">
                          <span>{notif.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-[#faf9f5] border-t border-[#ccd5ae]/50 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('notifications');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-[#01472e] hover:bg-[#025a3b] text-white font-bold text-xs shadow-soft transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e9edc9]" />
              <span>Open Notification Command Center</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
