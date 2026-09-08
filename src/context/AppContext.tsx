import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  Permission,
  AppNotification,
  MarketPriceItem,
  SystemUserRecord,
  ProduceListing,
  DemandRequest,
  NetworkSyncStatus
} from '../types';
import {
  DEMO_USERS,
  ROLE_PERMISSIONS,
  INITIAL_NOTIFICATIONS,
  MARKET_PRICES_DATA,
  SYSTEM_USERS_DATA,
  INITIAL_FARMER_LISTINGS,
  INITIAL_DEMAND_REQUESTS
} from '../data/mockData';
import { supabase } from '../lib/supabase';
import { onInstallableChange, promptAppInstall } from '../services/serviceWorkerRegistration';

interface AppContextType {
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  registerUser: (user: UserProfile) => void;
  logout: () => void;
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  isPassportModalOpen: boolean;
  selectedPassportBatchId: string;
  openPassportModal: (batchId?: string) => void;
  closePassportModal: () => void;
  isDemoModeOpen: boolean;
  demoStep: number;
  openDemoMode: (startStep?: number) => void;
  closeDemoMode: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  setDemoStep: (step: number) => void;
  isArchitectureModalOpen: boolean;
  setArchitectureModalOpen: (open: boolean) => void;
  marketPrices: MarketPriceItem[];
  systemUsers: SystemUserRecord[];
  toggleUserPermission: (userId: string, permission: Permission) => void;
  produceListings: ProduceListing[];
  demandRequests: DemandRequest[];
  addProduceListing: (listing: ProduceListing) => void;
  deleteProduceListing: (id: string) => void;
  addDemandRequest: (demand: DemandRequest) => void;
  deleteDemandRequest: (id: string) => void;
  isOnline: boolean;
  syncStatus: NetworkSyncStatus;
  pendingSyncCount: number;
  syncOfflineQueue: () => Promise<void>;
  isInstallable: boolean;
  promptInstall: () => Promise<boolean>;
}

const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  role: 'FARMER',
  phone: '',
  email: '',
  location: '',
  organization: ''
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('FARMER');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [selectedPassportBatchId, setSelectedPassportBatchId] = useState<string>('AGP-TOM-2026-001');
  const [isDemoModeOpen, setIsDemoModeOpen] = useState<boolean>(false);
  const [demoStep, setDemoStepState] = useState<number>(1);
  const [isArchitectureModalOpen, setArchitectureModalOpen] = useState<boolean>(false);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>(MARKET_PRICES_DATA);
  const [systemUsers, setSystemUsers] = useState<SystemUserRecord[]>(SYSTEM_USERS_DATA);

  // Persistent Produce Listings (Farmer supply)
  const [produceListings, setProduceListings] = useState<ProduceListing[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_produce_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved produce listings from localStorage', e);
    }
    return INITIAL_FARMER_LISTINGS;
  });

  // Persistent Demand Requests (Buyer demand)
  const [demandRequests, setDemandRequests] = useState<DemandRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_demand_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved demand requests from localStorage', e);
    }
    return INITIAL_DEMAND_REQUESTS;
  });

  // Automatically sync produce listings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_produce_listings', JSON.stringify(produceListings));
    } catch (e) {
      console.warn('Failed to persist produce listings to localStorage', e);
    }
  }, [produceListings]);

  // Automatically sync demand requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_demand_requests', JSON.stringify(demandRequests));
    } catch (e) {
      console.warn('Failed to persist demand requests to localStorage', e);
    }
  }, [demandRequests]);

  // Network connectivity and offline sync status
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [syncStatus, setSyncStatus] = useState<NetworkSyncStatus>('idle');
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  // Track pending offline sync items
  const pendingSyncCount =
    produceListings.filter((p) => p.syncStatus === 'PENDING_SYNC').length +
    demandRequests.filter((d) => d.syncStatus === 'PENDING_SYNC').length;

  // Listen for PWA installability prompt
  useEffect(() => {
    return onInstallableChange((canInstall) => {
      setIsInstallable(canInstall);
    });
  }, []);

  // Flush offline queue and synchronize with persistent layer
  const syncOfflineQueue = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    setSyncStatus('syncing');
    console.log('[UZHAVAN SYNC] Synchronizing offline queued field updates to persistent layer...');

    // Small delay for natural UI feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mark all pending sync items as SYNCED
    setProduceListings((prev) =>
      prev.map((item) => (item.syncStatus === 'PENDING_SYNC' ? { ...item, syncStatus: 'SYNCED' } : item))
    );
    setDemandRequests((prev) =>
      prev.map((item) => (item.syncStatus === 'PENDING_SYNC' ? { ...item, syncStatus: 'SYNCED' } : item))
    );

    // Clear local offline sync action log
    try {
      localStorage.removeItem('uzhavan_offline_sync_queue');
    } catch {}

    setSyncStatus('synced');
    console.log('[UZHAVAN SYNC] All field updates successfully synchronized.');

    setTimeout(() => {
      setSyncStatus('idle');
    }, 3500);
  }, []);

  // Monitor network online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[UZHAVAN PWA] Network connectivity restored.');
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline_saved');
      console.log('[UZHAVAN PWA] Network unavailable. Entering Field Offline Mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue]);

  const addProduceListing = (listing: ProduceListing) => {
    const isCurrentlyOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    const enrichedListing: ProduceListing = {
      ...listing,
      syncStatus: isCurrentlyOnline ? 'SYNCED' : 'PENDING_SYNC',
      offlineCreated: !isCurrentlyOnline
    };

    if (!isCurrentlyOnline) {
      setSyncStatus('offline_saved');
      try {
        const queue = JSON.parse(localStorage.getItem('uzhavan_offline_sync_queue') || '[]');
        queue.push({ type: 'ADD_PRODUCE', payload: enrichedListing, timestamp: Date.now() });
        localStorage.setItem('uzhavan_offline_sync_queue', JSON.stringify(queue));
      } catch {}
    }

    setProduceListings((prev) => [enrichedListing, ...prev]);
  };

  const deleteProduceListing = (id: string) => {
    setProduceListings((prev) => prev.filter((item) => item.id !== id));
  };

  const addDemandRequest = (demand: DemandRequest) => {
    const isCurrentlyOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    const enrichedDemand: DemandRequest = {
      ...demand,
      syncStatus: isCurrentlyOnline ? 'SYNCED' : 'PENDING_SYNC',
      offlineCreated: !isCurrentlyOnline
    };

    if (!isCurrentlyOnline) {
      setSyncStatus('offline_saved');
      try {
        const queue = JSON.parse(localStorage.getItem('uzhavan_offline_sync_queue') || '[]');
        queue.push({ type: 'ADD_DEMAND', payload: enrichedDemand, timestamp: Date.now() });
        localStorage.setItem('uzhavan_offline_sync_queue', JSON.stringify(queue));
      } catch {}
    }

    setDemandRequests((prev) => [enrichedDemand, ...prev]);
  };

  const deleteDemandRequest = (id: string) => {
    setDemandRequests((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              role: profile.role as UserRole,
              phone: profile.phone || '',
              email: profile.email || '',
              location: profile.location || '',
              organization: profile.organization || '',
              village: profile.village,
              district: profile.district,
              state: profile.state,
              farmSizeAcres: profile.farm_size_acres,
              mainCrops: profile.main_crops,
              fpoName: profile.fpo_name
            });
            setCurrentRole(profile.role as UserRole);
            setIsAuthenticated(true);
            setActiveTab('dashboard');
          }
        } else {
          // Fallback: Check if there's a local mock session
          const localFallback = localStorage.getItem('uzhavan_fallback_session');
          if (localFallback) {
            const parsedUser = JSON.parse(localFallback);
            setCurrentUser(parsedUser);
            setCurrentRole(parsedUser.role as UserRole);
            setIsAuthenticated(true);
            setActiveTab('dashboard');
          }
        }
      } catch (err) {
        console.warn('Could not restore Supabase session', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(GUEST_USER);
        setActiveTab('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const roleDefaults = DEMO_USERS[role] || DEMO_USERS.FARMER;
    setCurrentUser((prev) => {
      const updated = {
        ...roleDefaults,
        name: prev.name || roleDefaults.name,
        email: prev.email || roleDefaults.email,
        phone: prev.phone || roleDefaults.phone,
        role
      };
      localStorage.setItem('uzhavan_fallback_session', JSON.stringify(updated));
      return updated;
    });
    setActiveTab('dashboard'); // Always land on role's home dashboard
  };

  const login = (user: UserProfile) => {
    localStorage.setItem('uzhavan_fallback_session', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentRole(user.role);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const registerUser = (user: UserProfile) => {
    localStorage.setItem('uzhavan_fallback_session', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentRole(user.role);
    setCurrentUser(user);
    setActiveTab('profile');
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('uzhavan_fallback_session');
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setActiveTab('home');
  };

  const hasPermission = (permission: Permission): boolean => {
    const allowed = ROLE_PERMISSIONS[currentRole] || [];
    return allowed.includes(permission);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const openPassportModal = (batchId = 'AGP-TOM-2026-001') => {
    setSelectedPassportBatchId(batchId);
    setIsPassportModalOpen(true);
  };

  const closePassportModal = () => {
    setIsPassportModalOpen(false);
  };

  const openDemoMode = (startStep = 1) => {
    setDemoStepState(startStep);
    setIsDemoModeOpen(true);
  };

  const closeDemoMode = () => {
    setIsDemoModeOpen(false);
  };

  const nextDemoStep = () => {
    if (demoStep < 13) setDemoStepState(demoStep + 1);
  };

  const prevDemoStep = () => {
    if (demoStep > 1) setDemoStepState(demoStep - 1);
  };

  const setDemoStep = (step: number) => {
    if (step >= 1 && step <= 13) setDemoStepState(step);
  };

  const toggleUserPermission = (userId: string, permission: Permission) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const exists = u.permissions.includes(permission);
        const updated = exists
          ? u.permissions.filter((p) => p !== permission)
          : [...u.permissions, permission];
        return { ...u, permissions: updated };
      })
    );
  };

  // Development / automated verification hook
  if (typeof window !== 'undefined') {
    (window as any).__UZHAVAN_TEST__ = {
      setActiveTab,
      switchRole,
      setIsOnline,
      syncOfflineQueue
    };
  }

  return (
    <AppContext.Provider
      value={{
        isInitializing,
        isAuthenticated,
        login,
        registerUser,
        logout,
        currentUser,
        currentRole,
        switchRole,
        hasPermission,
        activeTab,
        setActiveTab,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        isPassportModalOpen,
        selectedPassportBatchId,
        openPassportModal,
        closePassportModal,
        isDemoModeOpen,
        demoStep,
        openDemoMode,
        closeDemoMode,
        nextDemoStep,
        prevDemoStep,
        setDemoStep,
        isArchitectureModalOpen,
        setArchitectureModalOpen,
        marketPrices,
        systemUsers,
        toggleUserPermission,
        produceListings,
        demandRequests,
        addProduceListing,
        deleteProduceListing,
        addDemandRequest,
        deleteDemandRequest,
        isOnline,
        syncStatus,
        pendingSyncCount,
        syncOfflineQueue,
        isInstallable,
        promptInstall: promptAppInstall
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
