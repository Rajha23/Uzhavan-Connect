import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface AppContextType {
  isAuthenticated: boolean;
  login: (emailOrPhone: string, role?: UserRole, password?: string, resolvedName?: string) => void;
  registerUser: (userData: Partial<UserProfile> & { role: UserRole }) => void;
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
  const [currentRole, setCurrentRole] = useState<UserRole>('FARMER');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [selectedPassportBatchId, setSelectedPassportBatchId] = useState<string>('AGP-TOM-2026-001');
  const [isDemoModeOpen, setIsDemoModeOpen] = useState<boolean>(false);
  const [demoStep, setDemoStepState] = useState<number>(1);
  const [isArchitectureModalOpen, setArchitectureModalOpen] = useState<boolean>(false);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>(MARKET_PRICES_DATA);
  const [systemUsers, setSystemUsers] = useState<SystemUserRecord[]>(SYSTEM_USERS_DATA);

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

  const login = (emailOrPhone: string, role: UserRole = 'FARMER', password?: string, resolvedName?: string) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    const roleFallback = DEMO_USERS[role] || DEMO_USERS.FARMER;

    // Check localStorage for registered users matching email, phone or name
    try {
      const stored = JSON.parse(localStorage.getItem('uzhavanconnect_users') || '[]');
      const found = stored.find((u: any) =>
        (u.email && u.email.toLowerCase() === emailOrPhone.trim().toLowerCase()) ||
        (u.phone && u.phone.trim() === emailOrPhone.trim()) ||
        (u.name && u.name.toLowerCase() === emailOrPhone.trim().toLowerCase())
      );
      if (found) {
        setCurrentUser({ ...roleFallback, ...found, role });
        setActiveTab('dashboard');
        return;
      }
    } catch {}

    // Derive display name from resolved name, or parse from input (email / name)
    let displayName = resolvedName;
    if (!displayName && emailOrPhone) {
      if (emailOrPhone.includes('@')) {
        const raw = emailOrPhone.split('@')[0].split('.')[0].replace(/[0-9_-]/g, ' ').trim();
        displayName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : emailOrPhone.split('@')[0];
      } else if (!/^\+?[0-9\s-]+$/.test(emailOrPhone.trim())) {
        displayName = emailOrPhone.trim().charAt(0).toUpperCase() + emailOrPhone.trim().slice(1);
      }
    }

    setCurrentUser({
      ...roleFallback,
      id: `usr_${Date.now()}`,
      name: displayName || 'Authenticated Member',
      role,
      email: emailOrPhone.includes('@') ? emailOrPhone.trim() : '',
      phone: !emailOrPhone.includes('@') ? emailOrPhone.trim() : roleFallback.phone
    });
    setActiveTab('dashboard');
  };

  const registerUser = (userData: Partial<UserProfile> & { role: UserRole }) => {
    setIsAuthenticated(true);
    setCurrentRole(userData.role);
    const roleFallback = DEMO_USERS[userData.role] || DEMO_USERS.FARMER;
    const newUser: UserProfile = {
      ...roleFallback,
      ...userData,
      id: userData.id || `usr_${Date.now()}`,
      name: userData.name || 'Registered Member',
      role: userData.role,
      phone: userData.phone || '+91 94441 00000',
      email: userData.email || 'user@uzhavanconnect.gov.in',
      location: userData.location || 'Tamil Nadu, India',
      organization: userData.organization || `${userData.role} Network`
    };
    setCurrentUser(newUser);

    try {
      const stored = JSON.parse(localStorage.getItem('uzhavanconnect_users') || '[]');
      stored.push(newUser);
      localStorage.setItem('uzhavanconnect_users', JSON.stringify(stored));
    } catch {}

    setActiveTab('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setActiveTab('login');
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
