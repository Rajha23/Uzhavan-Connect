import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import {
  UserProfile,
  UserRole,
  Permission,
  AppNotification,
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
  BuyerDeliveryConfirmation
} from '../types';
import {
  DEMO_USERS,
  ROLE_PERMISSIONS,
  INITIAL_NOTIFICATIONS,
  MARKET_PRICES_DATA,
  SYSTEM_USERS_DATA,
  INITIAL_FARMER_LISTINGS,
  INITIAL_DEMAND_REQUESTS,
  INITIAL_ORDERS,
  INITIAL_AGREEMENTS,
  INITIAL_PASSPORTS,
  INITIAL_SETTLEMENTS
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
  aggregatedDemandGroups: AggregatedDemandGroup[];
  addProduceListing: (listing: ProduceListing) => void;
  deleteProduceListing: (id: string) => void;
  addDemandRequest: (demand: DemandRequest) => void;
  deleteDemandRequest: (id: string) => void;
  orders: WorkflowOrder[];
  agreements: WorkflowAgreement[];
  producePassports: ProducePassport[];
  settlements: SettlementRecord[];
  confirmMatchAndCreateOrder: (
    listingId: string,
    demandId: string,
    agreedPrice?: number,
    agreedQty?: number,
    aggregatedGroupId?: string
  ) => WorkflowOrder | null;
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

  const addProduceListing = (listing: ProduceListing) => {
    const isCurrentlyOnline = isOnline && (typeof navigator !== 'undefined' ? navigator.onLine : true);
    const initialQty = listing.initialQuantityKg || listing.quantityKg;
    const enrichedListing: ProduceListing = {
      ...listing,
      initialQuantityKg: initialQty,
      allocatedQuantityKg: listing.allocatedQuantityKg || 0,
      unit: listing.unit || 'kg',
      status: listing.status || 'Listed',
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
    const initialQty = demand.initialQuantityKg || demand.quantityKg;
    const enrichedDemand: DemandRequest = {
      ...demand,
      initialQuantityKg: initialQty,
      allocatedQuantityKg: demand.allocatedQuantityKg || 0,
      unit: demand.unit || 'kg',
      variety: demand.variety || 'Certified Hybrid',
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

  // ─────────────────────────────────────────────────────────────
  // CONNECTED TRANSACTION LIFECYCLE WORKFLOW MUTATORS
  // ─────────────────────────────────────────────────────────────

  // Step 3 & 4 & 5: Match Confirmed -> Agreement Created -> Order Initialized
  const confirmMatchAndCreateOrder = (
    listingId: string,
    demandId: string,
    agreedPrice?: number,
    agreedQty?: number,
    aggregatedGroupId?: string
  ): WorkflowOrder | null => {
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
      id: orderId,
      agreementId,
      produceListingId: listing.id,
      demandRequestId: demand.id,
      aggregatedGroupId: aggregatedGroupId || demand.aggregatedGroupId,
      batchId,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      crop: listing.crop,
      variety: listing.variety || demand.variety || 'Certified Hybrid',
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

    // Send notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Match Confirmed & Order Created!',
      message: `Order ${orderId} created for ${finalQty.toLocaleString()} kg of ${listing.crop} @ ₹${finalPrice}/kg. Produce reserved.`,
      timestamp: 'Just now',
      targetRole: 'ALL',
      read: false,
      type: 'ORDER' as any,
      actionUrl: '/orders'
    };
    setNotifications((prev) => [newNotif, ...prev]);

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
    setIsAuthenticated(true);
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
        aggregatedDemandGroups,
        addProduceListing,
        deleteProduceListing,
        addDemandRequest,
        deleteDemandRequest,
        orders,
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
