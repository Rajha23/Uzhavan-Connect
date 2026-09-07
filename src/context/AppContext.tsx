import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  Permission,
  AppNotification,
  MarketPriceItem,
  SystemUserRecord
} from '../types';
import {
  DEMO_USERS,
  ROLE_PERMISSIONS,
  INITIAL_NOTIFICATIONS,
  MARKET_PRICES_DATA,
  SYSTEM_USERS_DATA
} from '../data/mockData';
import { supabase } from '../lib/supabase';

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
    setCurrentUser((prev) => ({
      ...roleDefaults,
      name: prev.name || roleDefaults.name,
      email: prev.email || roleDefaults.email,
      phone: prev.phone || roleDefaults.phone,
      role
    }));
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
        toggleUserPermission
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
