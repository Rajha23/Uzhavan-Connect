import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { FeedbackItem, FeedbackProcessingStatus } from '../types/feedback';
import { feedbackService } from '../services/feedbackService';
import { INITIAL_FEEDBACK } from '../data/feedbackMockData';
import {
  UserProfile,
  UserRole,
  Permission,
  AppNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationPreferences,
  MarketPriceItem,
  SystemUserRecord,
  ProduceListing,
  ProduceStatus,
  DemandRequest,
  NetworkSyncStatus,
  WorkflowOrder,
  OrderStatus,
  WorkflowAgreement,
  QualityInspectionData,
  TransportAssignment,
  ProducePassport,
  SettlementRecord,
  OrderTimelineEvent,
  AggregatedDemandGroup,
  FarmerContribution,
  FarmerSettlementItem,
  SettlementStatus,
  BuyerDeliveryConfirmation,
  NewsArticle
} from '../types';
import {
  DEMO_USERS,
  ROLE_PERMISSIONS,
  INITIAL_NOTIFICATIONS,
  AGRICULTURE_NEWS,
  MARKET_PRICES_DATA,
  SYSTEM_USERS_DATA,
  INITIAL_FARMER_LISTINGS,
  INITIAL_DEMAND_REQUESTS,
  INITIAL_ORDERS,
  INITIAL_AGREEMENTS,
  INITIAL_PASSPORTS,
  INITIAL_SETTLEMENTS
} from '../data/mockData';
import {
  FileRecord,
  FileCategory,
  UploadResult,
  CleanupReport,
  getFiles,
  uploadFile,
  searchFiles,
  deleteFile,
  cleanupExistingDuplicates
} from '../services/fileService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authVault, normalizeRole, seedDemoAccounts } from '../services/authVault';
import { apiService } from '../services/apiService';
import * as supabaseService from '../services/supabaseService';
import { onInstallableChange, promptAppInstall } from '../services/serviceWorkerRegistration';
import {
  PUBLIC_TABS,
  isRouteAuthorized,
  getTabFromPath,
  getPathFromTab,
  TAB_FEATURE_NAMES,
  getAuthorizedDashboardTab
} from '../services/routeGuard';
import {
  generateRealNotifications,
  loadReadNotificationIds,
  saveReadNotificationIds,
  loadNotificationPreferences,
  saveNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES
} from '../services/notificationService';

interface AppContextType {
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  registerUser: (user: UserProfile) => void;
  logout: () => void;
  currentUser: UserProfile;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  intendedRegistrationRole: UserRole | null;
  setIntendedRegistrationRole: (role: UserRole | null) => void;
  handleJoinAsRole: (targetRole: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  attemptedFeature: string;
  setAttemptedFeature: (feature: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  resetNotificationPreferences: () => void;
  addNotificationEvent: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'> & { id?: string }) => void;
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
  marketPrices: MarketPriceItem[];
  systemUsers: SystemUserRecord[];
  toggleUserPermission: (userId: string, permission: Permission) => void;
  produceListings: ProduceListing[];
  demandRequests: DemandRequest[];
  aggregatedDemandGroups: AggregatedDemandGroup[];
  addProduceListing: (listing: ProduceListing) => void;
  deleteProduceListing: (id: string) => void;
  addDemandRequest: (demand: DemandRequest) => void;
  deleteDemandRequest: (id: string) => void;
  orders: WorkflowOrder[];
  addOrder: (order: WorkflowOrder) => void;
  agreements: WorkflowAgreement[];
  producePassports: ProducePassport[];
  settlements: SettlementRecord[];
  confirmMatchAndCreateOrder: (
    listingId: string,
    demandId: string,
    agreedPrice?: number,
    agreedQty?: number,
    aggregatedGroupId?: string
  ) => Promise<WorkflowOrder | null>;
  fpoRecordCollection: (orderId: string, farmerId: string, quantityToCollect: number, notes?: string) => boolean;
  fpoCollectProduce: (orderId: string, hubLocation?: string) => void;
  fpoRecordQualityGrading: (orderId: string, metrics: QualityInspectionData) => boolean;
  fpoQualityCheck: (orderId: string, metrics: QualityInspectionData) => void;
  fpoRecordPacking: (orderId: string, packDetails?: { packedQuantityKg?: number; packageType?: string; crateCount?: number; notes?: string }) => boolean;
  fpoPackProduce: (orderId: string, notes?: string) => void;
  assignTransport: (orderId: string, transport: TransportAssignment) => void;
  dispatchShipment: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  buyerConfirmDelivery: (orderId: string, confirmation: BuyerDeliveryConfirmation) => void;
  buyerConfirmReceipt: (orderId: string) => void;
  recordBuyerPayment: (orderId: string, paymentDetails?: { reference?: string; method?: string }) => void;
  processFpoSettlement: (orderId: string) => void;
  settleFarmerPayment: (orderId: string, farmerId?: string) => void;
  completeTransaction: (orderId: string) => void;
  settlePayment: (orderId: string) => void;
  isOnline: boolean;
  syncStatus: NetworkSyncStatus;
  pendingSyncCount: number;
  syncOfflineQueue: () => Promise<void>;
  isInstallable: boolean;
  promptInstall: () => Promise<boolean>;

  // ─── Feedback Intelligence ───────────────────────────────────────────────
  feedbackItems: FeedbackItem[];
  submitFeedback: (feedback: Omit<FeedbackItem, 'feedbackId' | 'createdAt' | 'updatedAt'>) => FeedbackItem;
  submitTransactionFeedback: (item: any) => FeedbackItem;
  respondToFeedback: (feedbackId: string, message: string, responderName: string, responderRole: string) => FeedbackItem | null;
  updateFeedbackStatusAndNotes: (feedbackId: string, status: FeedbackProcessingStatus, internalNotes?: string, adminResponse?: string) => FeedbackItem | null;
  updateComplaintStatus: (feedbackId: string, newStatus: string, adminResponse?: string, resolution?: string) => void;
  // ─── Document Management ──────────────────────────────────────────────────
  files: FileRecord[];
  uploadDocument: (file: File, category?: FileCategory, metadata?: Record<string, any>) => Promise<UploadResult>;
  searchDocuments: (query: string, category?: FileCategory) => Promise<FileRecord[]>;
  deleteDocument: (fileId: string) => Promise<boolean>;
  cleanupDuplicateDocuments: () => Promise<CleanupReport>;
  refreshDocuments: () => Promise<void>;
  isDocumentManagerOpen: boolean;
  documentManagerCategory: FileCategory | undefined;
  openDocumentManager: (category?: FileCategory) => void;
  closeDocumentManager: () => void;
  // ─── News ─────────────────────────────────────────────────────────────────
  newsArticles: NewsArticle[];
  addNewsArticle: (article: NewsArticle) => void;
  // ─── Shipments ────────────────────────────────────────────────────────────
  shipmentInitialFilter?: string | null;
  setShipmentInitialFilter: (filter: string | null) => void;
}

export const identifyCompatibleDemandGroups = (demands: DemandRequest[]): AggregatedDemandGroup[] => {
  // Only consider active demands with remaining quantity or in aggregatable state
  const activeDemands = demands.filter(
    (d) => d.quantityKg > 0 && d.status !== 'Order Created' && d.status !== 'Fulfilled'
  );
  if (activeDemands.length === 0) return [];

  const getCorridor = (location: string): string => {
    const loc = (location || '').toLowerCase();
    if (loc.includes('chennai') || loc.includes('koyambedu') || loc.includes('guindy')) return 'Chennai Corridor';
    if (loc.includes('salem') || loc.includes('attur')) return 'Salem Corridor';
    if (loc.includes('kanchipuram') || loc.includes('sunguvarchatram') || loc.includes('sriperumbudur')) return 'Kanchipuram Corridor';
    if (loc.includes('coimbatore') || loc.includes('pollachi')) return 'Coimbatore Corridor';
    if (loc.includes('dharmapuri')) return 'Dharmapuri Corridor';
    const firstWord = (location || 'Regional').split(',')[0].split(' ')[0].trim();
    return `${firstWord || 'Regional'} Corridor`;
  };

  const groupsMap = new Map<string, DemandRequest[]>();

  activeDemands.forEach((demand) => {
    const cropKey = demand.crop.trim().toLowerCase();
    const corridor = getCorridor(demand.location);
    const gradeKey = demand.qualityRequirement === 'Any' || !demand.qualityRequirement ? 'Grade A' : demand.qualityRequirement;
    const dateKey = demand.deliveryDate ? demand.deliveryDate.slice(0, 7) : '2026-09';

    const groupKey = `${cropKey}__${corridor}__${gradeKey}__${dateKey}`;
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, []);
    }
    groupsMap.get(groupKey)!.push(demand);
  });

  const aggregatedGroups: AggregatedDemandGroup[] = [];

  groupsMap.forEach((groupedDemands) => {
    const first = groupedDemands[0];
    const cropName = first.crop;
    const corridor = getCorridor(first.location);
    const qualityReq = first.qualityRequirement || 'Grade A';
    const totalQty = groupedDemands.reduce((sum, d) => sum + d.quantityKg, 0);
    const initialQty = groupedDemands.reduce((sum, d) => sum + (d.initialQuantityKg || d.quantityKg), 0);
    const buyersSet = new Set(groupedDemands.map((d) => d.buyerName));
    const avgPrice = groupedDemands.reduce((sum, d) => sum + (d.maxTargetPricePerKg || 0), 0) / (groupedDemands.length || 1);
    const primaryDate = first.deliveryDate || '2026-09-08';

    const cropShort = cropName.slice(0, 3).toUpperCase();
    const corridorShort = corridor.split(' ')[0].slice(0, 3).toUpperCase();
    const groupId = `POOL-${cropShort}-${corridorShort}-${Math.round(totalQty)}`;

    const hubCities = Array.from(new Set(groupedDemands.map((d) => d.location.split(' ')[0]))).join(', ');
    const reasons: string[] = [
      `Identical Commodity: ${cropName} (${first.variety || 'Commercial Grade Standard'})`,
      `Quality Standard Alignment: ${qualityReq} (Institutional Specifications)`,
      `Logistics Corridor Consolidation: ${corridor} (${hubCities})`,
      `Synchronized Delivery Window: ${primaryDate} (${groupedDemands.length} buyers consolidated)`
    ];

    aggregatedGroups.push({
      id: groupId,
      crop: cropName,
      variety: first.variety || 'Certified Hybrid',
      qualityRequirement: qualityReq,
      region: corridor,
      targetDate: primaryDate,
      deliveryTimeWindow: first.deliveryTimeWindow || '05:30 AM - 08:30 AM',
      totalQuantityKg: totalQty,
      initialQuantityKg: initialQty,
      contributingDemands: groupedDemands,
      contributingDemandIds: groupedDemands.map((d) => d.id),
      buyersCount: buyersSet.size,
      avgMaxPricePerKg: Math.round(avgPrice * 100) / 100,
      status: totalQty <= 0 ? 'ALLOCATED' : (totalQty < initialQty ? 'PARTIALLY_MATCHED' : 'FORMED'),
      compatibilityReasons: reasons
    });
  });

  return aggregatedGroups;
};

const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  role: 'FARMER',
  phone: '',
  email: '',
  location: '',
  organization: ''
};

const UZHAVAN_DATASET_VERSION_KEY = 'uzhavan_dataset_version';
const CURRENT_DATASET_VERSION = 'sih2026_tn_connected_v5';

// Ensure localStorage gets upgraded to the clean connected SIH2026 dataset
if (typeof window !== 'undefined') {
  try {
    const cachedVersion = localStorage.getItem(UZHAVAN_DATASET_VERSION_KEY);
    if (cachedVersion !== CURRENT_DATASET_VERSION) {
      localStorage.removeItem('uzhavan_produce_listings');
      localStorage.removeItem('uzhavan_demand_requests');
      localStorage.removeItem('uzhavan_orders');
      localStorage.removeItem('uzhavan_agreements');
      localStorage.removeItem('uzhavan_passports');
      localStorage.removeItem('uzhavan_settlements');
      localStorage.setItem(UZHAVAN_DATASET_VERSION_KEY, CURRENT_DATASET_VERSION);
    }
  } catch (e) {
    console.warn('Dataset version check skipped:', e);
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('FARMER');
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [intendedRegistrationRole, setIntendedRegistrationRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'home';
  });
  const [attemptedFeature, setAttemptedFeature] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => loadReadNotificationIds());
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => loadNotificationPreferences());
  const [eventNotifications, setEventNotifications] = useState<AppNotification[]>([]);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState<boolean>(false);
  const [selectedPassportBatchId, setSelectedPassportBatchId] = useState<string>('AGP-TOM-2026-101');
  const [isDemoModeOpen, setIsDemoModeOpen] = useState<boolean>(false);
  const [demoStep, setDemoStepState] = useState<number>(1);
  const [marketPrices, setMarketPrices] = useState<MarketPriceItem[]>(MARKET_PRICES_DATA);
  const [systemUsers, setSystemUsers] = useState<SystemUserRecord[]>(SYSTEM_USERS_DATA);
  const [shipmentInitialFilter, setShipmentInitialFilter] = useState<string | null>(null);

  // ─── Feedback Intelligence State ────────────────────────────────────────
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => {
    return feedbackService.loadFeedbacks();
  });

  useEffect(() => {
    const handleFeedbackUpdated = () => {
      setFeedbackItems(feedbackService.loadFeedbacks());
    };
    window.addEventListener('transaction-feedback-updated', handleFeedbackUpdated);
    window.addEventListener('storage', handleFeedbackUpdated);
    return () => {
      window.removeEventListener('transaction-feedback-updated', handleFeedbackUpdated);
      window.removeEventListener('storage', handleFeedbackUpdated);
    };
  }, []);

  const submitFeedback = useCallback((feedback: Omit<FeedbackItem, 'feedbackId' | 'createdAt' | 'updatedAt'>): FeedbackItem => {
    const newFeedback: FeedbackItem = {
      ...feedback,
      feedbackId: (feedback as any).feedbackId || `FB${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FeedbackItem;
    setFeedbackItems((prev) => [newFeedback, ...prev]);
    return newFeedback;
  }, []);

  const submitTransactionFeedback = useCallback((data: any): FeedbackItem => {
    const item = feedbackService.submitFeedback(data);
    setFeedbackItems(feedbackService.loadFeedbacks());
    return item;
  }, []);

  const respondToFeedback = useCallback((feedbackId: string, message: string, responderName: string, responderRole: string): FeedbackItem | null => {
    const updated = feedbackService.addResponse(feedbackId, {
      responderId: currentUser.id || 'usr-resp',
      responderName: responderName || currentUser.name,
      responderRole: responderRole || currentUser.role || 'ADMIN',
      message
    });
    setFeedbackItems(feedbackService.loadFeedbacks());
    return updated;
  }, [currentUser]);

  const updateFeedbackStatusAndNotes = useCallback((feedbackId: string, status: FeedbackProcessingStatus, internalNotes?: string, adminResponse?: string): FeedbackItem | null => {
    const updated = feedbackService.updateStatusAndNotes(feedbackId, status, internalNotes, adminResponse, currentUser.name);
    setFeedbackItems(feedbackService.loadFeedbacks());
    return updated;
  }, [currentUser]);

  const updateComplaintStatus = useCallback((feedbackId: string, newStatus: string, adminResponse?: string, resolution?: string) => {
    setFeedbackItems((prev) =>
      prev.map((f) =>
        f.feedbackId === feedbackId
          ? {
              ...f,
              status: newStatus as FeedbackItem['status'],
              adminResponse: adminResponse || f.adminResponse,
              resolution: resolution || f.resolution,
              updatedAt: new Date().toISOString(),
              resolvedAt: ['RESOLVED', 'USER_CONFIRMED'].includes(newStatus) ? new Date().toISOString() : f.resolvedAt,
            }
          : f
      )
    );
  }, []);

  // Persistent Produce Listings (Farmer supply) — localStorage with INITIAL_FARMER_LISTINGS fallback
  const [produceListings, setProduceListings] = useState<ProduceListing[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_produce_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved produce listings from localStorage', e);
    }
    return INITIAL_FARMER_LISTINGS;
  });

  // Persistent Demand Requests — localStorage with INITIAL_DEMAND_REQUESTS fallback
  const [demandRequests, setDemandRequests] = useState<DemandRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_demand_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved demand requests from localStorage', e);
    }
    return INITIAL_DEMAND_REQUESTS;
  });

  // Dynamic News Articles across all network users
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('uzhavan_news_articles');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return AGRICULTURE_NEWS;
  });

  const addNewsArticle = useCallback((article: NewsArticle) => {
    setNewsArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== article.id);
      const updated = [article, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('uzhavan_news_articles', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  // ── IDEMPOTENT FILE & DOCUMENT STORAGE ──────────────────────────────────────
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState<boolean>(false);
  const [documentManagerCategory, setDocumentManagerCategory] = useState<FileCategory | undefined>(undefined);

  const refreshDocuments = useCallback(async () => {
    try {
      const records = await getFiles(currentUser?.id || 'demo-user-1');
      setFiles(records);
    } catch (err) {
      console.warn('Failed to refresh files', err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const uploadDocument = useCallback(
    async (file: File, category: FileCategory = 'GENERAL', metadata: Record<string, any> = {}) => {
      const result = await uploadFile(file, file.name, {
        userId: currentUser?.id || 'demo-user-1',
        category,
        metadata,
      });

      // Update state without duplicating
      setFiles((prev) => {
        const exists = prev.some((f) => f.id === result.file.id || f.fileHash === result.file.fileHash);
        if (exists) {
          return prev.map((f) => (f.id === result.file.id ? result.file : f));
        }
        return [result.file, ...prev];
      });

      return result;
    },
    [currentUser?.id]
  );

  const searchDocuments = useCallback(
    async (query: string, category?: FileCategory) => {
      return searchFiles(query, {
        userId: currentUser?.id,
        category,
      });
    },
    [currentUser?.id]
  );

  const deleteDocument = useCallback(async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
    return success;
  }, []);

  const cleanupDuplicateDocuments = useCallback(async () => {
    const report = await cleanupExistingDuplicates(currentUser?.id);
    await refreshDocuments();
    return report;
  }, [currentUser?.id, refreshDocuments]);

  const openDocumentManager = useCallback((category?: FileCategory) => {
    setDocumentManagerCategory(category);
    setIsDocumentManagerOpen(true);
  }, []);

  const closeDocumentManager = useCallback(() => {
    setIsDocumentManagerOpen(false);
    setDocumentManagerCategory(undefined);
  }, []);

  // Automatically sync produce listings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_produce_listings', JSON.stringify(produceListings));
    } catch (e) {
      console.warn('Failed to persist produce listings to localStorage', e);
    }
  }, [produceListings]);

  // Fetch real users from Supabase DB to replace dummy users
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
          console.error('Failed to fetch system users from Supabase:', error);
          return;
        }

        if (data && data.length > 0) {
          const mappedUsers: SystemUserRecord[] = data.map(p => ({
            id: p.id,
            name: p.name || 'Unknown',
            role: p.role as UserRole,
            phone: p.phone || '',
            email: p.email || '',
            location: p.location || p.district || p.state || 'Unknown Location',
            status: 'ACTIVE',
            joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown',
            permissions: ROLE_PERMISSIONS[p.role as UserRole] || []
          }));
          setSystemUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Exception fetching system users:', err);
      }
    };

    fetchProfiles();
  }, []);

  // Automatically sync demand requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_demand_requests', JSON.stringify(demandRequests));
    } catch (e) {
      console.warn('Failed to persist demand requests to localStorage', e);
    }
  }, [demandRequests]);

  // Dynamically group compatible regional buyer demands without mutating individual demands
  const aggregatedDemandGroups = useMemo(() => {
    return identifyCompatibleDemandGroups(demandRequests);
  }, [demandRequests]);

  // Persistent Orders
  const [orders, setOrders] = useState<WorkflowOrder[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved orders from localStorage', e);
    }
    return INITIAL_ORDERS;
  });

  const addOrder = useCallback((order: WorkflowOrder) => {
    supabaseService.insertOrder(order).catch(console.error);
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
  }, []);

  // Persistent Agreements
  const [agreements, setAgreements] = useState<WorkflowAgreement[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_agreements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved agreements from localStorage', e);
    }
    return INITIAL_AGREEMENTS;
  });

  // Persistent Passports
  const [producePassports, setProducePassports] = useState<ProducePassport[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_passports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved passports from localStorage', e);
    }
    return INITIAL_PASSPORTS;
  });

  // Persistent Settlements
  const [settlements, setSettlements] = useState<SettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('uzhavan_settlements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved settlements from localStorage', e);
    }
    return INITIAL_SETTLEMENTS;
  });

  // Automatically sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to persist orders to localStorage', e);
    }
  }, [orders]);

  // Automatically sync agreements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_agreements', JSON.stringify(agreements));
    } catch (e) {
      console.warn('Failed to persist agreements to localStorage', e);
    }
  }, [agreements]);

  // Automatically sync produce passports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_passports', JSON.stringify(producePassports));
    } catch (e) {
      console.warn('Failed to persist passports to localStorage', e);
    }
  }, [producePassports]);

  // Automatically sync settlements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzhavan_settlements', JSON.stringify(settlements));
    } catch (e) {
      console.warn('Failed to persist settlements to localStorage', e);
    }
  }, [settlements]);

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

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch initial data
      const fetchData = async () => {
        try {
          const [listings, demands, dbOrders, dbSettlements, passports] = await Promise.all([
            supabaseService.fetchProduceListings(),
            supabaseService.fetchDemandRequests(),
            supabaseService.fetchOrders(),
            supabaseService.fetchSettlements(),
            supabaseService.fetchProducePassports()
          ]);
          if (listings.length > 0) setProduceListings(listings);
          if (demands.length > 0) setDemandRequests(demands);
          if (dbOrders.length > 0) setOrders(dbOrders);
          if (dbSettlements.length > 0) setSettlements(dbSettlements);
          if (passports.length > 0) setProducePassports(passports);
        } catch (e) {
          console.error("Failed to fetch initial data", e);
        }
      };
      
      fetchData();

      // Subscribe to real-time changes
      const demandSub = apiService.subscribeToDemandRequests((payload) => {
        console.log("Realtime Demand Update:", payload);
        if (payload.eventType === 'INSERT') {
          // Add mapping from snake_case DB to camelCase UI
          const d = payload.new;
          const newDemand: DemandRequest = {
            id: d.id,
            buyerId: d.buyer_id,
            buyerName: d.buyer_name,
            buyerType: d.buyer_type,
            crop: d.crop,
            quantityKg: d.quantity_kg,
            initialQuantityKg: d.quantity_kg,
            allocatedQuantityKg: 0,
            unit: 'kg',
            qualityRequirement: d.quality_requirement,
            location: d.location,
            deliveryDate: d.delivery_date,
            deliveryTimeWindow: d.delivery_time_window,
            maxTargetPricePerKg: d.max_target_price_per_kg,
            status: d.status,
            createdAt: d.created_at
          };
          setDemandRequests((prev) => [newDemand, ...prev.filter(x => x.id !== d.id)]);
        }
      });

      const produceSub = apiService.subscribeToProduceListings((payload) => {
        console.log("Realtime Produce Update:", payload);
        if (payload.eventType === 'INSERT') {
          const p = payload.new;
          const newListing: ProduceListing = {
            id: p.id,
            farmerId: p.farmer_id,
            farmerName: p.farmer_name,
            crop: p.crop,
            variety: p.variety,
            quantityKg: p.quantity_kg,
            grade: p.grade,
            expectedPricePerKg: p.expected_price_per_kg,
            harvestDate: p.harvest_date,
            availabilityDate: p.availability_date,
            location: p.location,
            status: p.status,
            initialQuantityKg: p.quantity_kg,
            allocatedQuantityKg: 0,
            unit: 'kg'
          };
          setProduceListings((prev) => [newListing, ...prev.filter(x => x.id !== p.id)]);
        }
      });

      const orderSub = apiService.subscribeToOrders((payload) => {
        console.log("Realtime Order Update:", payload);
        if (payload.eventType === 'INSERT') {
          const o = payload.new;
          const newOrder: WorkflowOrder = {
            id: o.id,
            buyerId: o.buyer_id,
            farmerId: o.farmer_id,
            crop: o.crop,
            quantityKg: o.quantity_kg,
            pricePerKg: o.price_per_kg,
            totalValue: o.total_value,
            status: o.status,
            date: o.created_at,
            batchId: 'N/A',
            farmerName: 'Unknown',
            buyerName: 'Unknown',
            produceListingId: '',
            demandRequestId: '',
            deliveryLocation: '',
            farmerLocation: '',
            fpoName: 'GreenHarvest FPO',
            qualityGrade: 'Standard',
            timeline: [],
            remainingCollectionKg: o.quantity_kg,
            collectedQuantityKg: 0,
            collectionStatus: 'Collection Pending'
          };
          setOrders((prev) => [newOrder, ...prev.filter(x => x.id !== o.id)]);
        }
      });

      const settlementSub = apiService.subscribeToSettlements((payload) => {
        console.log("Realtime Settlement Update:", payload);
        if (payload.eventType === 'INSERT') {
          const s = payload.new;
          const newSettlement: SettlementRecord = {
            id: s.id,
            orderId: s.order_id,
            batchId: 'N/A',
            crop: 'Unknown',
            quantityKg: 0,
            buyerName: 'Unknown',
            farmerOrFpoName: 'Unknown',
            totalOrderValue: s.total_order_value,
            farmerAmount: s.farmer_amount,
            logisticsAmount: 0,
            platformAmount: 0,
            farmerRealizationPercentage: 0,
            traditionalFarmerEarnings: 0,
            earningsGainPercentage: 0,
            status: s.status,
            settlementDate: s.settlement_date,
            utrNumber: 'N/A'
          };
          setSettlements((prev) => [newSettlement, ...prev.filter(x => x.id !== s.id)]);
        }
      });

      return () => {
        demandSub.unsubscribe();
        produceSub.unsubscribe();
        orderSub.unsubscribe();
        settlementSub.unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const addProduceListing = async (listing: ProduceListing) => {
    const isCurrentlyOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    
    if (isCurrentlyOnline) {
      try {
        await supabaseService.insertProduceListing(listing);
        // Optimistic update
        setProduceListings((prev) => [listing, ...prev.filter(l => l.id !== listing.id)]);
      } catch (err) {
        console.error("Failed to create listing", err);
      }
    } else {
      // Offline fallback
      setSyncStatus('offline_saved');
      try {
        const queue = JSON.parse(localStorage.getItem('uzhavan_offline_sync_queue') || '[]');
        queue.push({ type: 'ADD_PRODUCE', payload: listing, timestamp: Date.now() });
        localStorage.setItem('uzhavan_offline_sync_queue', JSON.stringify(queue));
      } catch {}
      setProduceListings((prev) => [listing, ...prev]);
    }
  };

  const deleteProduceListing = (id: string) => {
    setProduceListings((prev) => prev.filter((item) => item.id !== id));
  };

  const addDemandRequest = async (demand: DemandRequest) => {
    const isCurrentlyOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    
    if (isCurrentlyOnline) {
      try {
        await supabaseService.insertDemandRequest(demand);
        // Optimistic update
        setDemandRequests((prev) => [demand, ...prev.filter(d => d.id !== demand.id)]);
      } catch (err) {
        console.error("Failed to create demand", err);
      }
    } else {
      setSyncStatus('offline_saved');
      try {
        const queue = JSON.parse(localStorage.getItem('uzhavan_offline_sync_queue') || '[]');
        queue.push({ type: 'ADD_DEMAND', payload: demand, timestamp: Date.now() });
        localStorage.setItem('uzhavan_offline_sync_queue', JSON.stringify(queue));
      } catch {}
      setDemandRequests((prev) => [demand, ...prev]);
    }
  };

  const deleteDemandRequest = (id: string) => {
    setDemandRequests((prev) => prev.filter((item) => item.id !== id));
  };

  // ─────────────────────────────────────────────────────────────
  // CONNECTED TRANSACTION LIFECYCLE WORKFLOW MUTATORS
  // ─────────────────────────────────────────────────────────────

  // Step 3 & 4 & 5: Match Confirmed -> Agreement Created -> Order Initialized
  const confirmMatchAndCreateOrder = async (
    listingId: string,
    demandId: string,
    agreedPrice?: number,
    agreedQty?: number,
    aggregatedGroupId?: string
  ): Promise<WorkflowOrder | null> => {
    const listing = produceListings.find((l) => l.id === listingId);
    const demand = demandRequests.find((d) => d.id === demandId);
    if (!listing || !demand) {
      console.warn('[UZHAVAN MATCH] Matching failed: Listing or Demand not found', { listingId, demandId });
      return null;
    }

    // Double-allocation prevention: if listing has already been fully allocated, abort
    if (listing.quantityKg <= 0) {
      console.warn('[UZHAVAN MATCH] Double-allocation rejected: Listing has 0 kg available', listingId);
      return null;
    }

    // Demand already fully satisfied
    if (demand.quantityKg <= 0) {
      console.warn('[UZHAVAN MATCH] Demand already completely fulfilled: 0 kg remaining', demandId);
      return null;
    }

    const finalPrice = agreedPrice !== undefined ? Number(agreedPrice) : (listing.expectedPricePerKg || demand.maxTargetPricePerKg);
    const maxPossibleQty = Math.min(listing.quantityKg, demand.quantityKg);
    const requestedAgreedQty = agreedQty !== undefined ? Number(agreedQty) : maxPossibleQty;
    const finalQty = Math.min(maxPossibleQty, requestedAgreedQty);

    if (finalQty <= 0) {
      console.warn('[UZHAVAN MATCH] Cannot create order with non-positive quantity:', finalQty);
      return null;
    }

    const totalVal = Math.round(finalPrice * finalQty * 100) / 100;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-TN-${randomSeq}`;
    const agreementId = `AGR-TN-${randomSeq}`;
    const batchId = `AGP-${listing.crop.slice(0, 3).toUpperCase()}-2026-${randomSeq}`;

    const newAgreement: WorkflowAgreement = {
      id: agreementId,
      demandRequestId: demand.id,
      produceListingId: listing.id,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      crop: listing.crop,
      agreedQuantityKg: finalQty,
      agreedPricePerKg: finalPrice,
      totalAgreedValue: totalVal,
      agreementDate: dateStr,
      status: 'CONFIRMED'
    };

    const newOrder: WorkflowOrder = {
      id: `ORD-BULK-${Date.now().toString().slice(-4)}`,
      batchId: `BATCH-${Date.now().toString().slice(-6)}`,
      demandRequestId: demand.id,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      produceListingId: listing.id,
      crop: listing.crop,
      quantityKg: finalQty,
      pricePerKg: finalPrice,
      totalValue: totalVal,
      status: 'Produce Collection Pending',
      date: dateStr,
      deliveryLocation: demand.location,
      farmerLocation: listing.location,
      fpoName: currentUser.fpoName || listing.fpoName || 'GreenHarvest FPO',
      qualityGrade: listing.grade,
      farmerContributions: [
        {
          farmerId: listing.farmerId,
          farmerName: listing.farmerName,
          farmerLocation: listing.location,
          produceListingId: listing.id,
          contributedQuantityKg: finalQty,
          collectedQuantityKg: 0,
          collectionStatus: 'PENDING'
        }
      ],
      collectionStatus: 'Collection Pending',
      collectedQuantityKg: 0,
      remainingCollectionKg: finalQty,
      qualityStatus: 'Pending',
      acceptedQuantityKg: 0,
      rejectedQuantityKg: 0,
      packingStatus: 'Packing Pending',
      packedQuantityKg: 0,
      isReadyForTransport: false,
      transportStatus: 'Transport Pending',
      timeline: [
        {
          step: 'LISTED',
          title: 'Crop Listed',
          location: listing.location,
          timestamp: listing.harvestDate || nowTimestamp,
          operator: listing.farmerName,
          completed: true
        },
        {
          step: 'MATCHED',
          title: 'Matched & Agreement Confirmed',
          location: 'Uzhavan AI Engine',
          timestamp: nowTimestamp,
          operator: 'System Matcher',
          completed: true
        },
        {
          step: 'COLLECTED',
          title: 'Produce Collection Queued',
          location: listing.location,
          timestamp: 'Scheduled for Pickup',
          operator: 'FPO Aggregator Agent',
          completed: false
        }
      ]
    };

    const newPassport: ProducePassport = {
      batchId,
      crop: listing.crop,
      variety: listing.variety || demand.variety || 'Certified Hybrid',
      farmerOrFpo: listing.farmerName,
      farmLocation: listing.location,
      harvestDate: listing.harvestDate || dateStr,
      quantityKg: finalQty,
      qualityGrade: listing.grade === 'Grade C' ? 'Standard' : listing.grade,
      currentStatus: 'Harvested',
      inspectionMetrics: {
        sugarBrix: 4.8,
        firmnessKgCm: 3.5,
        pesticideResidueTest: 'PASS - Organic / ND',
        moistureContent: '92.0%'
      },
      collectionHub: `${listing.location} Collection Point`,
      shipmentId: `SHP-TN-${randomSeq}`,
      vehicleNumber: 'Pending Carrier Assignment',
      destination: demand.location,
      qrCodeUrl: `https://uzhavanconnect.gov.in/trace/${batchId}`,
      timeline: [
        {
          step: 'HARVESTED',
          title: 'Harvested at Source Farm',
          location: listing.location,
          timestamp: nowTimestamp,
          operator: listing.farmerName,
          completed: true
        },
        {
          step: 'QUALITY_CHECKED',
          title: 'Pending Quality Inspection',
          location: 'Regional FPO Hub',
          timestamp: 'Awaiting',
          operator: 'Quality Assessor',
          completed: false
        },
        {
          step: 'PACKED',
          title: 'Pending Crating & QR Sealing',
          location: 'FPO Hub',
          timestamp: 'Awaiting',
          operator: 'Packing Team',
          completed: false
        },
        {
          step: 'IN_TRANSIT',
          title: 'Pending Dispatch',
          location: 'Transit Route',
          timestamp: 'Scheduled',
          operator: 'Logistics Partner',
          completed: false
        },
        {
          step: 'DELIVERED',
          title: 'Pending Buyer Receiving',
          location: demand.location,
          timestamp: demand.deliveryDate,
          operator: 'Receiving Officer',
          completed: false
        }
      ]
    };

    // Update produce listing remaining quantity, allocated quantity, and status
    setProduceListings((prev) =>
      prev.map((p) => {
        if (p.id !== listing.id) return p;
        const initialQty = p.initialQuantityKg || p.quantityKg;
        const prevAllocated = p.allocatedQuantityKg || 0;
        const newAllocated = prevAllocated + finalQty;
        const remainingQty = Math.max(0, p.quantityKg - finalQty);
        const newStatus: ProduceStatus = remainingQty <= 0 ? 'Confirmed' : 'Listed';

        return {
          ...p,
          initialQuantityKg: initialQty,
          allocatedQuantityKg: newAllocated,
          quantityKg: remainingQty,
          status: newStatus
        };
      })
    );

    // Transition demand status to Order Created / update remaining demand quantity
    setDemandRequests((prev) =>
      prev.map((d) => {
        if (d.id !== demand.id) return d;
        const initialQty = d.initialQuantityKg || d.quantityKg;
        const prevAllocated = d.allocatedQuantityKg || 0;
        const newAllocated = prevAllocated + finalQty;
        const remainingDemand = Math.max(0, d.quantityKg - finalQty);

        return {
          ...d,
          initialQuantityKg: initialQty,
          allocatedQuantityKg: newAllocated,
          quantityKg: remainingDemand,
          status: remainingDemand <= 0 ? 'Order Created' : 'Partially Fulfilled'
        };
      })
    );

    setAgreements((prev) => [newAgreement, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setProducePassports((prev) => [newPassport, ...prev]);

    // Send notification event
    const newNotif: AppNotification = {
      id: `order-created-event-${orderId}`,
      title: 'Match Confirmed & Order Created!',
      message: `Order ${orderId} created for ${finalQty.toLocaleString()} kg of ${listing.crop} @ ₹${finalPrice}/kg. Escrow reserved.`,
      timestamp: 'Just now',
      createdAt: Date.now(),
      targetRole: 'ALL',
      read: false,
      type: 'ORDERS',
      priority: 'SUCCESS',
      actionTab: 'orders',
      actionUrl: '/orders',
      actionLabel: 'View Order',
      entityId: orderId,
      entityType: 'Order'
    };
    setEventNotifications((prev) => [newNotif, ...prev]);

    return newOrder;
  };

  // Step 6: FPO Collects Produce with Multi-Farmer Traceability & Partial Collection
  const fpoRecordCollection = (orderId: string, farmerId: string, quantityToCollect: number, notes?: string): boolean => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let success = false;
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        // Existing or initialized contributions
        const contributions: FarmerContribution[] = o.farmerContributions && o.farmerContributions.length > 0
          ? o.farmerContributions
          : [
              {
                farmerId: o.farmerId,
                farmerName: o.farmerName,
                farmerLocation: o.farmerLocation,
                produceListingId: o.produceListingId,
                contributedQuantityKg: o.quantityKg,
                collectedQuantityKg: o.collectedQuantityKg || 0,
                collectionStatus: (o.collectionStatus === 'Fully Collected' ? 'FULLY_COLLECTED' : (o.collectionStatus === 'Partially Collected' ? 'PARTIALLY_COLLECTED' : 'PENDING')) as any
              }
            ];

        // Find contribution for farmerId (or first if farmerId matches or only 1)
        const targetContribIdx = contributions.findIndex(
          (c) => c.farmerId === farmerId || c.produceListingId === farmerId || contributions.length === 1
        );

        if (targetContribIdx === -1) {
          console.warn('[FPO COLLECTION] Farmer contribution not found for order', { orderId, farmerId });
          return o;
        }

        const contrib = contributions[targetContribIdx];
        const remainingForFarmer = Math.max(0, contrib.contributedQuantityKg - (contrib.collectedQuantityKg || 0));

        if (quantityToCollect <= 0 || remainingForFarmer <= 0) {
          console.warn('[FPO COLLECTION] Invalid quantity to collect or already fully collected', {
            quantityToCollect,
            remainingForFarmer
          });
          return o;
        }

        // Prevent collected quantity from exceeding confirmed quantity
        const finalCollectKg = Math.min(quantityToCollect, remainingForFarmer);
        const newFarmerCollected = (contrib.collectedQuantityKg || 0) + finalCollectKg;
        const newContribStatus = newFarmerCollected >= contrib.contributedQuantityKg ? 'FULLY_COLLECTED' : 'PARTIALLY_COLLECTED';

        const updatedContributions: FarmerContribution[] = contributions.map((c, idx) => {
          if (idx !== targetContribIdx) return c;
          return {
            ...c,
            collectedQuantityKg: newFarmerCollected,
            collectionStatus: newContribStatus,
            collectedAt: timestamp,
            notes: notes || c.notes
          };
        });

        const totalCollectedKg = updatedContributions.reduce((sum, c) => sum + (c.collectedQuantityKg || 0), 0);
        const totalRequiredKg = o.quantityKg;
        const remainingKg = Math.max(0, totalRequiredKg - totalCollectedKg);
        const isFullyCollected = remainingKg <= 0 && updatedContributions.every((c) => c.collectionStatus === 'FULLY_COLLECTED');

        const newOrderStatus: OrderStatus = isFullyCollected ? 'Collected' : 'Partially Collected';
        const newCollectionStatus = isFullyCollected ? 'Fully Collected' : 'Partially Collected';

        targetBatchId = o.batchId;
        targetListingId = contrib.produceListingId || o.produceListingId;
        success = true;

        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: isFullyCollected ? 'COLLECTED' : 'PARTIAL_COLLECTION',
            title: isFullyCollected
              ? `Produce Fully Collected (${totalCollectedKg.toLocaleString()} kg)`
              : `Partial Farm Pickup: ${finalCollectKg.toLocaleString()} kg collected (${remainingKg.toLocaleString()} kg remaining)`,
            location: `${contrib.farmerLocation || o.farmerLocation} -> FPO Hub`,
            timestamp,
            operator: `FPO Logistics Agent (${contrib.farmerName})`,
            completed: true,
            notes: notes || `Farmer: ${contrib.farmerName}, Collected: ${finalCollectKg} kg`
          }
        ];

        return {
          ...o,
          status: newOrderStatus,
          collectionStatus: newCollectionStatus,
          collectedQuantityKg: totalCollectedKg,
          remainingCollectionKg: remainingKg,
          farmerContributions: updatedContributions,
          timeline: updatedTimeline
        };
      })
    );

    if (success && targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Collected' } : p))
      );
    }
    if (success && targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) => (pass.batchId === targetBatchId ? { ...pass, currentStatus: 'Harvested' } : pass))
      );
    }

    return success;
  };

  const fpoCollectProduce = (orderId: string, hubLocation = 'Sriperumbudur Rural Hub') => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const remainingToCollect = order.remainingCollectionKg !== undefined ? order.remainingCollectionKg : order.quantityKg;
    fpoRecordCollection(orderId, order.farmerId, remainingToCollect, `Collected at farm gate for ${hubLocation}`);
  };

  // Step 7: Quality Check & Grading with Accepted/Rejected Tracking
  const fpoRecordQualityGrading = (orderId: string, metrics: QualityInspectionData): boolean => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let success = false;
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        const collectedKg = o.collectedQuantityKg || o.quantityKg;
        const acceptedKg = metrics.acceptedQuantityKg !== undefined ? Number(metrics.acceptedQuantityKg) : collectedKg;
        const rejectedKg = metrics.rejectedQuantityKg !== undefined ? Number(metrics.rejectedQuantityKg) : Math.max(0, collectedKg - acceptedKg);

        const qualityStatus = acceptedKg <= 0
          ? 'Rejected'
          : (rejectedKg > 0 ? 'Conditionally Passed' : 'Passed');

        const newOrderStatus: OrderStatus = qualityStatus === 'Rejected' ? 'Quality Rejected' : 'Quality Checked';
        supabaseService.updateOrder(orderId, { status: newOrderStatus, qualityGrade: metrics.verifiedGrade, qualityStatus, acceptedQuantityKg: acceptedKg, rejectedQuantityKg: rejectedKg }).catch(console.error);
        targetBatchId = o.batchId;
        targetListingId = o.produceListingId;
        success = true;

        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: 'QUALITY_CHECKED',
            title: `Quality Assessed: ${qualityStatus.toUpperCase()} (${metrics.verifiedGrade})`,
            location: metrics.hubLocation || 'FPO Quality Station',
            timestamp,
            operator: metrics.inspectorName || 'QA Assessor',
            completed: true,
            notes: `Accepted: ${acceptedKg.toLocaleString()} kg, Rejected: ${rejectedKg.toLocaleString()} kg. Brix: ${metrics.sugarBrix}°, Firmness: ${metrics.firmnessKgCm} kg/cm²${metrics.rejectionReason ? ` [Reason: ${metrics.rejectionReason}]` : ''}`
          }
        ];

        return {
          ...o,
          status: newOrderStatus,
          qualityGrade: metrics.verifiedGrade,
          qualityStatus,
          acceptedQuantityKg: acceptedKg,
          rejectedQuantityKg: rejectedKg,
          inspectionMetrics: {
            ...metrics,
            status: qualityStatus === 'Rejected' ? 'REJECTED' : (qualityStatus === 'Conditionally Passed' ? 'CONDITIONALLY_PASSED' : 'PASSED'),
            acceptedQuantityKg: acceptedKg,
            rejectedQuantityKg: rejectedKg
          },
          packingStatus: qualityStatus === 'Rejected' ? 'Packing Pending' : (o.packingStatus || 'Packing Pending'),
          timeline: updatedTimeline
        };
      })
    );

    if (success && targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Quality Checked', grade: metrics.verifiedGrade } : p))
      );
    }
    if (success && targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) =>
          pass.batchId === targetBatchId
            ? {
                ...pass,
                currentStatus: 'Quality Checked',
                qualityGrade: metrics.verifiedGrade === 'Grade C' ? 'Standard' : metrics.verifiedGrade,
                inspectionMetrics: {
                  sugarBrix: metrics.sugarBrix,
                  firmnessKgCm: metrics.firmnessKgCm,
                  pesticideResidueTest: metrics.pesticideResidueTest,
                  moistureContent: metrics.moistureContent
                },
                timeline: pass.timeline.map((t) =>
                  t.step === 'QUALITY_CHECKED' ? { ...t, completed: true, timestamp, operator: metrics.inspectorName } : t
                )
              }
            : pass
        )
      );
    }

    return success;
  };

  const fpoQualityCheck = (orderId: string, metrics: QualityInspectionData) => {
    fpoRecordQualityGrading(orderId, metrics);
  };

  // Step 8: Packing & Crating Station with Transport Readiness Gate
  const fpoRecordPacking = (
    orderId: string,
    packDetails?: { packedQuantityKg?: number; packageType?: string; crateCount?: number; notes?: string }
  ): boolean => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let success = false;
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        // Gate: Order must have passed quality inspection with accepted quantity > 0
        if (o.qualityStatus === 'Rejected' || (o.acceptedQuantityKg !== undefined && o.acceptedQuantityKg <= 0)) {
          console.warn('[FPO PACKING] Cannot pack quality rejected order:', orderId);
          return o;
        }

        const maxPackable = o.acceptedQuantityKg !== undefined ? o.acceptedQuantityKg : (o.collectedQuantityKg || o.quantityKg);
        const requestedPacked = packDetails?.packedQuantityKg !== undefined ? Number(packDetails.packedQuantityKg) : maxPackable;
        const finalPackedKg = Math.min(maxPackable, requestedPacked);

        const packageType = packDetails?.packageType || 'Ventilated 25kg Agro-Crates with tamper-evident QR seal';
        const defaultCrates = Math.ceil(finalPackedKg / 25);
        const crateCount = packDetails?.crateCount !== undefined ? Number(packDetails.crateCount) : defaultCrates;

        targetBatchId = o.batchId;
        targetListingId = o.produceListingId;
        success = true;

        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: 'PACKED',
            title: `Packed & QR Sealed (${finalPackedKg.toLocaleString()} kg in ${crateCount} crates)`,
            location: 'FPO Packing Bay',
            timestamp,
            operator: 'FPO Packing Unit',
            completed: true,
            notes: packDetails?.notes || `Type: ${packageType}. Batch Seal: ${o.batchId}`
          }
        ];

        return {
          ...o,
          status: 'Packed',
          packingStatus: 'Packed',
          packedQuantityKg: finalPackedKg,
          packageType,
          crateCount,
          isReadyForTransport: true,
          transportStatus: 'Transport Pending',
          timeline: updatedTimeline
        };
      })
    );

    if (success && targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Packed' } : p))
      );
    }
    if (success && targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) =>
          pass.batchId === targetBatchId
            ? {
                ...pass,
                currentStatus: 'Packed',
                timeline: pass.timeline.map((t) =>
                  t.step === 'PACKED' ? { ...t, completed: true, timestamp, operator: 'FPO Packing Unit' } : t
                )
              }
            : pass
        )
      );
    }

    return success;
  };

  const fpoPackProduce = (orderId: string, notes?: string) => {
    fpoRecordPacking(orderId, { notes });
  };

  // Step 9a: Transport Assignment (Gated on isReadyForTransport)
  const assignTransport = (orderId: string, transport: TransportAssignment) => {
    supabaseService.updateOrder(orderId, { transportDetails: transport, status: 'Transport Assigned' }).catch(console.error);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (!o.isReadyForTransport && o.status !== 'Packed') {
          console.warn('[LOGISTICS] Order is not ready for transport:', orderId);
          return o;
        }
        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: 'TRANSPORT_ASSIGNED',
            title: `Transport Assigned (${transport.vehicleType} - ${transport.vehicleNumber})`,
            location: 'Dispatch Hub',
            timestamp,
            operator: `${transport.carrierName} (Driver: ${transport.driverName})`,
            completed: true
          }
        ];
        return {
          ...o,
          status: 'Transport Assigned',
          transportStatus: 'Vehicle Assigned',
          transportDetails: transport,
          timeline: updatedTimeline
        };
      })
    );
  };

  // Step 9b: Dispatch Shipment
  const dispatchShipment = (orderId: string) => {
    supabaseService.updateOrder(orderId, { status: 'In Transit' }).catch(console.error);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        targetBatchId = o.batchId;
        targetListingId = o.produceListingId;
        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: 'IN_TRANSIT',
            title: 'Dispatched & En Route via Cold-Chain Corridor',
            location: 'Highway Arterial NH-48',
            timestamp,
            operator: o.transportDetails?.driverName || 'Carrier Driver',
            completed: true
          }
        ];
        return { ...o, status: 'In Transit', transportStatus: 'In Transit', timeline: updatedTimeline };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'In Transit' } : p))
      );
    }
    if (targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) =>
          pass.batchId === targetBatchId
            ? {
                ...pass,
                currentStatus: 'In Transit',
                timeline: pass.timeline.map((t) =>
                  t.step === 'IN_TRANSIT' ? { ...t, completed: true, timestamp, operator: 'Carrier Driver' } : t
                )
              }
            : pass
        )
      );
    }
  };

  // Step 10: Delivered to Buyer Hub (Awaiting Buyer Confirmation)
  const markDelivered = (orderId: string) => {
    supabaseService.updateOrder(orderId, { status: 'Delivered' }).catch(console.error);
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        targetBatchId = o.batchId;
        targetListingId = o.produceListingId;
        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline,
          {
            step: 'DELIVERED',
            title: 'Delivered at Buyer Receiving Facility (Awaiting Buyer Quality Signoff)',
            location: o.deliveryLocation,
            timestamp,
            operator: 'Carrier Delivery Handover',
            completed: true
          }
        ];
        return { ...o, status: 'Delivered', transportStatus: 'Delivered', timeline: updatedTimeline };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Delivered' } : p))
      );
    }
    if (targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) =>
          pass.batchId === targetBatchId
            ? {
                ...pass,
                currentStatus: 'Delivered',
                timeline: pass.timeline.map((t) =>
                  t.step === 'DELIVERED' ? { ...t, completed: true, timestamp, operator: 'Receiving Officer' } : t
                )
              }
            : pass
        )
      );
    }
  };

  // Step 11: Buyer Delivery Verification & Receipt Confirmation
  const buyerConfirmDelivery = (orderId: string, confirmation: BuyerDeliveryConfirmation) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const createdSettleId = `SETTLE-2026-${order.id.replace('ORD-TN-', '')}`;
    const acceptedKg = confirmation.acceptedQuantityKg !== undefined ? confirmation.acceptedQuantityKg : (order.packedQuantityKg || order.quantityKg);
    const finalVal = Math.round(acceptedKg * order.pricePerKg * 100) / 100;

    const updatedTimeline: OrderTimelineEvent[] = [
      ...order.timeline,
      {
        step: 'BUYER_CONFIRMED',
        title: `Buyer Receipt Confirmed (${confirmation.acceptanceStatus})`,
        location: order.deliveryLocation,
        timestamp,
        operator: `${confirmation.receiverName || order.buyerName} (${confirmation.receiverRole || 'Receiving Officer'})`,
        completed: true,
        notes: `Accepted: ${acceptedKg.toLocaleString()} kg${confirmation.rejectedQuantityKg ? `, Rejected: ${confirmation.rejectedQuantityKg} kg` : ''}${confirmation.issuesReported ? ` [Issue: ${confirmation.issuesReported}]` : ''}`
      },
      {
        step: 'PAYMENT_PENDING',
        title: 'Escrow Automated Payout Queued',
        location: 'RBI e-RUPI / Bank Gateway',
        timestamp,
        operator: 'Uzhavan Escrow Smart Ledger',
        completed: false
      }
    ];

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Payment Pending',
              settlementId: createdSettleId,
              buyerConfirmation: confirmation,
              timeline: updatedTimeline
            }
          : o
      )
    );

    const farmerShare = Math.round(finalVal * 0.89);
    const logisticsShare = Math.round(finalVal * 0.08);
    const platformShare = finalVal - farmerShare - logisticsShare;
    const traditionalShare = Math.round(finalVal * 0.55);
    const gainPct = Number((((farmerShare - traditionalShare) / (traditionalShare || 1)) * 100).toFixed(1));

    // Build farmer-level contribution breakdown for transparent multi-farmer payout
    const contributions = order.farmerContributions && order.farmerContributions.length > 0
      ? order.farmerContributions
      : [
          {
            farmerId: order.farmerId,
            farmerName: order.farmerName,
            farmerLocation: order.farmerLocation,
            produceListingId: order.produceListingId,
            contributedQuantityKg: order.quantityKg,
            collectedQuantityKg: acceptedKg,
            collectionStatus: 'FULLY_COLLECTED' as const
          }
        ];

    const totalContributed = contributions.reduce((sum, c) => sum + (c.collectedQuantityKg || c.contributedQuantityKg), 0);
    const farmerBreakdown: FarmerSettlementItem[] = contributions.map((c, idx) => {
      const farmerKg = c.collectedQuantityKg || c.contributedQuantityKg;
      const proportion = totalContributed > 0 ? farmerKg / totalContributed : 1 / contributions.length;
      const farmerAcceptedKg = Math.round(acceptedKg * proportion);
      const gross = Math.round(farmerAcceptedKg * order.pricePerKg * 100) / 100;
      const netPayout = Math.round(gross * 0.89);

      return {
        farmerId: c.farmerId,
        farmerName: c.farmerName,
        farmerLocation: c.farmerLocation,
        produceListingId: c.produceListingId,
        contributedQuantityKg: c.contributedQuantityKg,
        collectedQuantityKg: farmerKg,
        agreedPricePerKg: order.pricePerKg,
        grossAmount: gross,
        netFarmerAmount: netPayout,
        status: 'PENDING',
        bankAccountMasked: `${['SBI', 'HDFC', 'Canara', 'ICICI', 'Indian Bank'][idx % 5]} **** **** ${Math.floor(1000 + Math.random() * 9000)}`
      };
    });

    const newSettlement: SettlementRecord = {
      id: createdSettleId,
      orderId: order.id,
      batchId: order.batchId,
      crop: order.crop,
      quantityKg: acceptedKg,
      buyerName: order.buyerName,
      farmerOrFpoName: order.fpoName || order.farmerName,
      totalOrderValue: finalVal,
      farmerAmount: farmerShare,
      logisticsAmount: logisticsShare,
      platformAmount: platformShare,
      farmerRealizationPercentage: 89.0,
      traditionalFarmerEarnings: traditionalShare,
      earningsGainPercentage: gainPct,
      status: 'Payment Pending',
      settlementDate: 'Awaiting Buyer Payment & Settlement Processing',
      utrNumber: 'ESCROW_LOCKED_PENDING',
      paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
      farmerBreakdown
    };

    setSettlements((prev) => [newSettlement, ...prev.filter((s) => s.orderId !== order.id)]);
    setDemandRequests((prev) =>
      prev.map((d) => (d.id === order.demandRequestId ? { ...d, status: 'Fulfilled' } : d))
    );
  };

  const buyerConfirmReceipt = (orderId: string) => {
    supabaseService.updateOrder(orderId, { status: 'Buyer Confirmed' }).catch(console.error);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const acceptedKg = order.packedQuantityKg || order.acceptedQuantityKg || order.quantityKg;
    buyerConfirmDelivery(orderId, {
      orderId,
      deliveredQuantityKg: acceptedKg,
      receivedQuantityKg: acceptedKg,
      acceptedQuantityKg: acceptedKg,
      rejectedQuantityKg: 0,
      acceptanceStatus: 'ACCEPTED_FULL',
      receiverName: `${order.buyerName} Inspection Officer`,
      receiverRole: 'Receiving In-Charge',
      confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });
  };

  // Step 12a: Buyer Payment Confirmed / Recorded into Escrow
  const recordBuyerPayment = (orderId: string, paymentDetails?: { reference?: string; method?: string }) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const ref = paymentDetails?.reference || `UPI-ERUPI-${Math.floor(100000 + Math.random() * 900000)}`;

    setSettlements((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              status: 'Buyer Payment Confirmed',
              buyerPaymentReference: ref,
              buyerPaymentRecordedAt: timestamp
            }
          : s
      )
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          timeline: [
            ...o.timeline,
            {
              step: 'BUYER_PAYMENT_CONFIRMED',
              title: `Buyer Payment Recorded & Escrow Funded (Ref: ${ref})`,
              location: 'Programmable Escrow Vault',
              timestamp,
              operator: 'RBI e-RUPI Smart Contract Ledger',
              completed: true
            }
          ]
        };
      })
    );
  };

  // Step 12b: FPO Settlement Processing
  const processFpoSettlement = (orderId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setSettlements((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              status: 'Farmer Settlement Processing',
              fpoSettledAt: timestamp
            }
          : s
      )
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          timeline: [
            ...o.timeline,
            {
              step: 'FPO_SETTLED',
              title: 'FPO Logistics & Pre-Cooling Allocation Disbursed (8%)',
              location: 'FPO Commercial Clearing Hub',
              timestamp,
              operator: 'FPO Finance Unit',
              completed: true
            }
          ]
        };
      })
    );
  };

  // Step 12c: Farmer Payment Settled (Single Farmer or Multiple Contributing Farmers)
  const settleFarmerPayment = (orderId: string, farmerId?: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setSettlements((prev) =>
      prev.map((s) => {
        if (s.orderId !== orderId) return s;

        const updatedBreakdown = (s.farmerBreakdown || []).map((fb) => {
          if (!farmerId || fb.farmerId === farmerId) {
            return {
              ...fb,
              status: 'COMPLETED' as const,
              utrNumber: fb.utrNumber || `UTR-FARM-${Math.floor(10000000 + Math.random() * 90000000)}`,
              settledAt: timestamp
            };
          }
          return fb;
        });

        const allFarmersSettled = updatedBreakdown.length === 0 || updatedBreakdown.every((f) => f.status === 'COMPLETED');
        const generatedUtr = s.utrNumber !== 'ESCROW_LOCKED_PENDING' ? s.utrNumber : `AGRITXN${Date.now()}`;

        return {
          ...s,
          farmerBreakdown: updatedBreakdown,
          status: allFarmersSettled ? 'Farmer Payment Completed' : 'Farmer Settlement Processing',
          farmerSettledAt: timestamp,
          utrNumber: generatedUtr
        };
      })
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedContribs = (o.farmerContributions || []).map((fc) => {
          if (!farmerId || fc.farmerId === farmerId) {
            return {
              ...fc,
              settlementStatus: 'COMPLETED' as const,
              farmerUtr: fc.farmerUtr || `UTR-FARM-${Math.floor(10000000 + Math.random() * 90000000)}`,
              settledAt: timestamp
            };
          }
          return fc;
        });

        return {
          ...o,
          farmerContributions: updatedContribs,
          timeline: [
            ...o.timeline,
            {
              step: 'FARMER_PAYMENT_SETTLED',
              title: farmerId
                ? `Direct Net Payout Credited to Farmer ${farmerId}`
                : 'All Member Farmer Payouts Credited (89% Net Realization)',
              location: 'Direct Bank NEFT / e-RUPI Wallet',
              timestamp,
              operator: 'National Clearing Gateway',
              completed: true
            }
          ]
        };
      })
    );
  };

  // Step 12d: Transaction Completed & Escrow Closed
  const completeTransaction = (orderId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        targetListingId = o.produceListingId;
        return {
          ...o,
          status: 'Completed',
          timeline: [
            ...o.timeline,
            {
              step: 'TRANSACTION_COMPLETED',
              title: 'Order Fulfilled & Escrow Ledger Closed Successfully',
              location: 'Uzhavan Trust Network',
              timestamp,
              operator: 'Smart Escrow Supervisor',
              completed: true
            }
          ]
        };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Completed' } : p))
      );
    }

    setSettlements((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              status: 'Transaction Completed',
              settlementDate: timestamp,
              utrNumber: s.utrNumber !== 'ESCROW_LOCKED_PENDING' ? s.utrNumber : `AGRITXN${Date.now()}`
            }
          : s
      )
    );
  };

  // Step 12e: Full Staged Payout Shortcut
  const settlePayment = (orderId: string) => {
    recordBuyerPayment(orderId);
    processFpoSettlement(orderId);
    settleFarmerPayment(orderId);
    completeTransaction(orderId);
  };

  // Centralized route navigation with RBAC enforcement and URL history synchronization
  const navigateToTab = useCallback(
    (targetTab: string, replaceUrl = false, explicitRole?: UserRole) => {
      const activeRole = explicitRole || (isAuthenticated ? currentUser.role : 'FARMER');

      // Resolve 'dashboard' to the role's canonical dashboard tab
      const resolvedTab =
        targetTab === 'dashboard'
          ? (isAuthenticated || explicitRole
              ? getAuthorizedDashboardTab(activeRole)
              : 'login')
          : targetTab;

      // 1. Guard against unauthenticated access to protected routes
      if (!isAuthenticated && !explicitRole && !PUBLIC_TABS.includes(resolvedTab)) {
        setActiveTabState('login');
        const loginPath = getPathFromTab('login');
        if (typeof window !== 'undefined' && window.location.pathname !== loginPath) {
          if (replaceUrl) {
            window.history.replaceState(null, '', loginPath);
          } else {
            window.history.pushState(null, '', loginPath);
          }
        }
        return;
      }

      // 2. Guard against unauthorized role access
      if ((isAuthenticated || explicitRole) && !isRouteAuthorized(activeRole, resolvedTab)) {
        console.warn(
          `[Security Guard] Blocked access to '${resolvedTab}' for role '${activeRole}' (User: ${currentUser.id || 'current'}).`
        );
        setAttemptedFeature(TAB_FEATURE_NAMES[resolvedTab] || resolvedTab);
        setActiveTabState('access-denied');
        if (typeof window !== 'undefined' && window.location.pathname !== '/access-denied') {
          if (replaceUrl) {
            window.history.replaceState(null, '', '/access-denied');
          } else {
            window.history.pushState(null, '', '/access-denied');
          }
        }
        return;
      }

      // 3. Authorized navigation
      setActiveTabState(resolvedTab);
      const targetPath = getPathFromTab(resolvedTab);
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        if (replaceUrl) {
          window.history.replaceState(null, '', targetPath);
        } else {
          window.history.pushState(null, '', targetPath);
        }
      }
    },
    [isAuthenticated, currentUser.role, currentUser.id]
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      navigateToTab(tab, false);
    },
    [navigateToTab]
  );

  useEffect(() => {
    const initSession = async () => {
      try {
        await seedDemoAccounts();
        let authenticatedUser: UserProfile | null = null;

        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            let { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Safe recovery: if profile table record was missing, heal it from session metadata
            if (!profile || profileError) {
              const meta = session.user.user_metadata || {};
              const recoveredRole = normalizeRole(meta.role || 'FARMER');
              const recoveredProfile = {
                id: session.user.id,
                name: meta.name || 'Member',
                role: recoveredRole,
                email: session.user.email || '',
                phone: meta.phone || '',
                location: meta.location || 'Tamil Nadu, India',
                organization: meta.organization || (recoveredRole === 'FARMER' ? 'Uzhavan Farmer Collective' : 'Uzhavan Connect Network')
              };

              try {
                const { data: healed } = await supabase.from('profiles').upsert(recoveredProfile).select().single();
                if (healed) profile = healed;
              } catch {}
              if (!profile) profile = recoveredProfile;
            }

            if (profile) {
              const role = normalizeRole(profile.role);
              authenticatedUser = {
                id: profile.id,
                name: profile.name,
                role,
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
              };
              authVault.getOrCreateProfile(profile.id, authenticatedUser);
            }
          }
        }

        if (!authenticatedUser) {
          // Cryptographic / Token Session Validation
          const localFallback = localStorage.getItem('uzhavan_fallback_session');
          const localToken = localStorage.getItem('uzhavanconnect_jwt_token');
          if (localFallback && localToken) {
            try {
              const parsedUser = JSON.parse(localFallback);
              if (parsedUser && parsedUser.id) {
                // Cryptographic validation against stored credentials & profile vault
                const verifiedUser = authVault.verifyUserSession(parsedUser.id, parsedUser.role);
                if (verifiedUser) {
                  authenticatedUser = verifiedUser;
                } else {
                  console.warn('[Security Alert] Session failed vault verification. Clearing compromised storage.');
                  localStorage.removeItem('uzhavan_fallback_session');
                  localStorage.removeItem('uzhavanconnect_jwt_token');
                }
              }
            } catch (e) {
              console.warn('Invalid local session data, clearing...', e);
              localStorage.removeItem('uzhavan_fallback_session');
              localStorage.removeItem('uzhavanconnect_jwt_token');
            }
          }
        }

        if (authenticatedUser) {
          const canonicalRole = normalizeRole(authenticatedUser.role);
          const secureUser = { ...authenticatedUser, role: canonicalRole };
          setCurrentUser(secureUser);
          setCurrentRole(canonicalRole);
          setIsAuthenticated(true);

          // Resolve URL on startup, strictly ignoring any ?role= parameter tampering
          const initialTab = getTabFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');
          if (PUBLIC_TABS.includes(initialTab) && initialTab !== 'traceability' && initialTab !== 'tracking') {
            navigateToTab(getAuthorizedDashboardTab(canonicalRole), true, canonicalRole);
          } else {
            navigateToTab(initialTab, true, canonicalRole);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentUser(GUEST_USER);
          setCurrentRole('FARMER');
          const initialTab = getTabFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');
          if (!PUBLIC_TABS.includes(initialTab)) {
            navigateToTab('login', true, 'FARMER');
          } else {
            navigateToTab(initialTab, true, 'FARMER');
          }
        }
      } catch (err) {
        console.warn('Could not restore session', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(GUEST_USER);
        setCurrentRole('FARMER');
        navigateToTab('home', true, 'FARMER');
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        localStorage.setItem('uzhavanconnect_jwt_token', session.access_token);
      }
    });

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const tab = getTabFromPath(window.location.pathname);
        navigateToTab(tab, true);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [navigateToTab]);

  const switchRole = (role: UserRole) => {
    const canonicalRole = normalizeRole(role);
    if (!isAuthenticated) {
      setIntendedRegistrationRole(canonicalRole);
      navigateToTab('register', false);
      return;
    }
    // SECURITY ENFORCEMENT: Client-side role switching is forbidden.
    // The role must strictly match the authenticated user's account role.
    if (canonicalRole !== currentUser.role) {
      console.warn(
        `[Security Alert] Blocked unauthorized role switch attempt to '${canonicalRole}' by authenticated user '${currentUser.id}' (role: '${currentUser.role}').`
      );
      return;
    }
    navigateToTab(getAuthorizedDashboardTab(currentUser.role), false);
  };

  const handleJoinAsRole = (targetRole: UserRole) => {
    const canonicalRole = normalizeRole(targetRole);
    if (isAuthenticated && currentUser.id) {
      navigateToTab(getAuthorizedDashboardTab(currentUser.role), false);
    } else {
      setIntendedRegistrationRole(canonicalRole);
      navigateToTab('register', false);
    }
  };

  const login = (user: UserProfile) => {
    const role = normalizeRole(user.role);
    const cleanUser = { ...user, role };
    localStorage.setItem('uzhavan_fallback_session', JSON.stringify(cleanUser));
    if (!localStorage.getItem('uzhavanconnect_jwt_token')) {
      localStorage.setItem('uzhavanconnect_jwt_token', `uzhavan_jwt_${role.toLowerCase()}_${Date.now()}`);
    }
    setIsAuthenticated(true);
    setCurrentRole(role);
    setCurrentUser(cleanUser);
    navigateToTab(getAuthorizedDashboardTab(role), false, role);
  };

  const registerUser = (user: UserProfile) => {
    const role = normalizeRole(user.role);
    const cleanUser = { ...user, role };
    localStorage.setItem('uzhavan_fallback_session', JSON.stringify(cleanUser));
    if (!localStorage.getItem('uzhavanconnect_jwt_token')) {
      localStorage.setItem('uzhavanconnect_jwt_token', `uzhavan_jwt_${role.toLowerCase()}_${Date.now()}`);
    }
    setIsAuthenticated(true);
    setCurrentRole(role);
    setCurrentUser(cleanUser);
    navigateToTab(getAuthorizedDashboardTab(role), false, role);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('uzhavan_fallback_session');
    localStorage.removeItem('uzhavanconnect_jwt_token');
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setCurrentRole('FARMER');
    navigateToTab('home', false, 'FARMER');
  };

  const hasPermission = (permission: Permission): boolean => {
    const allowed = ROLE_PERMISSIONS[currentRole] || [];
    return allowed.includes(permission);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const markNotificationRead = (id: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadNotificationIds(next);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadNotificationIds(next);
      return next;
    });
  };

  const updateNotificationPreferences = (updates: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => {
      const next = { ...prev, ...updates, system: true };
      saveNotificationPreferences(next);
      return next;
    });
  };

  const resetNotificationPreferences = () => {
    setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    saveNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
  };

  const addNotificationEvent = (
    notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'> & { id?: string }
  ) => {
    const eventId = notif.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newNotif: AppNotification = {
      ...notif,
      id: eventId,
      read: false,
      timestamp: 'Just now',
      createdAt: Date.now()
    };
    setEventNotifications((prev) => [newNotif, ...prev]);
  };

  const notifications = useMemo(() => {
    return generateRealNotifications({
      currentUser,
      currentRole,
      produceListings,
      demandRequests,
      orders,
      settlements,
      producePassports,
      systemUsers,
      marketPrices,
      eventNotifications,
      readIds: readNotificationIds,
      preferences: notificationPreferences
    });
  }, [
    currentUser,
    currentRole,
    produceListings,
    demandRequests,
    orders,
    settlements,
    producePassports,
    systemUsers,
    marketPrices,
    eventNotifications,
    readNotificationIds,
    notificationPreferences
  ]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

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

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser.id) return false;
    try {
      const updated = await apiService.updateProfile(currentUser.id, updates);
      setCurrentUser(updated);
      localStorage.setItem('uzhavan_fallback_session', JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
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
        updateCurrentUserProfile,
        currentRole,
        switchRole,
        intendedRegistrationRole,
        setIntendedRegistrationRole,
        handleJoinAsRole,
        hasPermission,
        activeTab,
        setActiveTab,
        attemptedFeature,
        setAttemptedFeature,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        notificationPreferences,
        updateNotificationPreferences,
        resetNotificationPreferences,
        addNotificationEvent,
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
        marketPrices,
        systemUsers,
        toggleUserPermission,
        produceListings,
        demandRequests,
        aggregatedDemandGroups,
        addProduceListing: (listing) => { addProduceListing(listing); },
        deleteProduceListing,
        addDemandRequest: (demand) => { addDemandRequest(demand); },
        deleteDemandRequest,
        orders,
        addOrder,
        agreements,
        producePassports,
        settlements,
        confirmMatchAndCreateOrder,
        fpoRecordCollection,
        fpoCollectProduce,
        fpoRecordQualityGrading,
        fpoQualityCheck,
        fpoRecordPacking,
        fpoPackProduce,
        assignTransport,
        dispatchShipment,
        markDelivered,
        buyerConfirmDelivery,
        buyerConfirmReceipt,
        recordBuyerPayment,
        processFpoSettlement,
        settleFarmerPayment,
        completeTransaction,
        settlePayment,
        isOnline,
        syncStatus,
        pendingSyncCount,
        syncOfflineQueue,
        isInstallable,
        promptInstall: promptAppInstall,
        feedbackItems,
        submitFeedback,
        submitTransactionFeedback,
        respondToFeedback,
        updateFeedbackStatusAndNotes,
        updateComplaintStatus,
        files,
        uploadDocument,
        searchDocuments,
        deleteDocument,
        cleanupDuplicateDocuments,
        refreshDocuments,
        isDocumentManagerOpen,
        documentManagerCategory,
        openDocumentManager,
        closeDocumentManager,
        newsArticles,
        addNewsArticle,
        shipmentInitialFilter,
        setShipmentInitialFilter
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
