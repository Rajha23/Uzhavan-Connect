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
  NetworkSyncStatus,
  WorkflowOrder,
  WorkflowAgreement,
  QualityInspectionData,
  TransportAssignment,
  ProducePassport,
  SettlementRecord,
  OrderTimelineEvent
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
    agreedQty?: number
  ) => WorkflowOrder | null;
  fpoCollectProduce: (orderId: string, hubLocation?: string) => void;
  fpoQualityCheck: (orderId: string, metrics: QualityInspectionData) => void;
  fpoPackProduce: (orderId: string, notes?: string) => void;
  assignTransport: (orderId: string, transport: TransportAssignment) => void;
  dispatchShipment: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  buyerConfirmReceipt: (orderId: string) => void;
  settlePayment: (orderId: string) => void;
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

  // ─────────────────────────────────────────────────────────────
  // CONNECTED TRANSACTION LIFECYCLE WORKFLOW MUTATORS
  // ─────────────────────────────────────────────────────────────

  // Step 3 & 4 & 5: Match Confirmed -> Agreement Created -> Order Initialized
  const confirmMatchAndCreateOrder = (
    listingId: string,
    demandId: string,
    agreedPrice?: number,
    agreedQty?: number
  ): WorkflowOrder | null => {
    const listing = produceListings.find((l) => l.id === listingId);
    const demand = demandRequests.find((d) => d.id === demandId);
    if (!listing || !demand) return null;

    const finalPrice = agreedPrice || listing.expectedPricePerKg || demand.maxTargetPricePerKg;
    const finalQty = agreedQty || Math.min(listing.quantityKg, demand.quantityKg);
    const totalVal = finalPrice * finalQty;
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
      batchId,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      buyerId: demand.buyerId,
      buyerName: demand.buyerName,
      crop: listing.crop,
      variety: listing.variety || 'Certified Hybrid',
      quantityKg: finalQty,
      pricePerKg: finalPrice,
      totalValue: totalVal,
      status: 'Produce Collection Pending',
      date: dateStr,
      deliveryLocation: demand.location,
      farmerLocation: listing.location,
      fpoName: currentUser.fpoName || 'GreenHarvest FPO',
      qualityGrade: listing.grade,
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
      variety: listing.variety || 'Certified Hybrid',
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

    // Transition produce listing status to Reserved
    setProduceListings((prev) =>
      prev.map((p) => (p.id === listing.id ? { ...p, status: 'Reserved' } : p))
    );

    // Transition demand status to Order Created
    setDemandRequests((prev) =>
      prev.map((d) => (d.id === demand.id ? { ...d, status: 'Order Created' } : d))
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

  // Step 6: FPO Collects Produce
  const fpoCollectProduce = (orderId: string, hubLocation = 'Sriperumbudur Rural Hub') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetBatchId = '';
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        targetBatchId = o.batchId;
        targetListingId = o.produceListingId;
        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline.map((t) => (t.step === 'COLLECTED' ? { ...t, completed: true, timestamp, location: `${o.farmerLocation} -> ${hubLocation}` } : t)),
          { step: 'QUALITY_PENDING', title: 'Awaiting Hub Quality Inspection', location: hubLocation, timestamp, operator: 'FPO Quality Lab', completed: false }
        ];
        return { ...o, status: 'Collected', timeline: updatedTimeline };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Collected' } : p))
      );
    }
    if (targetBatchId) {
      setProducePassports((prev) =>
        prev.map((pass) => (pass.batchId === targetBatchId ? { ...pass, currentStatus: 'Harvested' } : pass))
      );
    }
  };

  // Step 7: Quality Check & Grading
  const fpoQualityCheck = (orderId: string, metrics: QualityInspectionData) => {
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
            step: 'QUALITY_CHECKED',
            title: `Quality Tested & Certified (${metrics.verifiedGrade})`,
            location: metrics.hubLocation,
            timestamp,
            operator: metrics.inspectorName,
            completed: true,
            notes: `Brix: ${metrics.sugarBrix}, Firmness: ${metrics.firmnessKgCm} kg/cm², Pesticide: ${metrics.pesticideResidueTest}`
          }
        ];
        return {
          ...o,
          status: 'Quality Checked',
          qualityGrade: metrics.verifiedGrade,
          inspectionMetrics: metrics,
          timeline: updatedTimeline
        };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Quality Checked', grade: metrics.verifiedGrade } : p))
      );
    }
    if (targetBatchId) {
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
  };

  // Step 8: Packing & Crating
  const fpoPackProduce = (orderId: string, notes?: string) => {
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
            step: 'PACKED',
            title: 'Packed in Ventilated Crates & QR Assigned',
            location: 'FPO Packing Bay',
            timestamp,
            operator: 'FPO Packing Unit',
            completed: true,
            notes: notes || `Batch ID: ${o.batchId}`
          }
        ];
        return { ...o, status: 'Packed', timeline: updatedTimeline };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Packed' } : p))
      );
    }
    if (targetBatchId) {
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
  };

  // Step 9a: Transport Assignment
  const assignTransport = (orderId: string, transport: TransportAssignment) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
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
            title: 'Dispatched & En Route via Expressway',
            location: 'National Highway NH-48',
            timestamp,
            operator: o.transportDetails?.driverName || 'Carrier Driver',
            completed: true
          }
        ];
        return { ...o, status: 'In Transit', timeline: updatedTimeline };
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

  // Step 10: Delivered to Buyer
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
            title: 'Delivered at Buyer Receiving Facility',
            location: o.deliveryLocation,
            timestamp,
            operator: 'Carrier & Receiving Team',
            completed: true
          }
        ];
        return { ...o, status: 'Delivered', timeline: updatedTimeline };
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

  // Step 11: Buyer Confirms Receipt
  const buyerConfirmReceipt = (orderId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const createdSettleId = `SETTLE-2026-${order.id.replace('ORD-TN-', '')}`;
    const updatedTimeline: OrderTimelineEvent[] = [
      ...order.timeline,
      {
        step: 'BUYER_CONFIRMED',
        title: 'Buyer Digitally Acknowledged Receipt & Verified Quality',
        location: order.deliveryLocation,
        timestamp,
        operator: `${order.buyerName} Inspection Officer`,
        completed: true
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
          ? { ...o, status: 'Payment Pending', settlementId: createdSettleId, timeline: updatedTimeline }
          : o
      )
    );

    const farmerShare = Math.round(order.totalValue * 0.89);
    const logisticsShare = Math.round(order.totalValue * 0.08);
    const platformShare = order.totalValue - farmerShare - logisticsShare;
    const traditionalShare = Math.round(order.totalValue * 0.55);
    const gainPct = Number((((farmerShare - traditionalShare) / (traditionalShare || 1)) * 100).toFixed(1));

    const newSettlement: SettlementRecord = {
      id: createdSettleId,
      orderId: order.id,
      batchId: order.batchId,
      crop: order.crop,
      quantityKg: order.quantityKg,
      buyerName: order.buyerName,
      farmerOrFpoName: order.farmerName,
      totalOrderValue: order.totalValue,
      farmerAmount: farmerShare,
      logisticsAmount: logisticsShare,
      platformAmount: platformShare,
      farmerRealizationPercentage: 89.0,
      traditionalFarmerEarnings: traditionalShare,
      earningsGainPercentage: gainPct,
      status: 'PENDING',
      settlementDate: 'Scheduled - Awaiting Trigger',
      utrNumber: 'ESCROW_LOCKED_PENDING'
    };

    setSettlements((prev) => [newSettlement, ...prev.filter((s) => s.orderId !== order.id)]);
    setDemandRequests((prev) =>
      prev.map((d) => (d.id === order.demandRequestId ? { ...d, status: 'Fulfilled' } : d))
    );
  };

  // Step 12: Payment Settled
  const settlePayment = (orderId: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const utr = `AGRITXN${Date.now()}`;
    let targetListingId = '';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        targetListingId = o.produceListingId;
        const updatedTimeline: OrderTimelineEvent[] = [
          ...o.timeline.map((t) => (t.step === 'PAYMENT_PENDING' ? { ...t, completed: true, timestamp } : t)),
          {
            step: 'SETTLED',
            title: `Digital Payout Settled to Farmer Account (UTR: ${utr})`,
            location: 'National Clearing Gateway',
            timestamp,
            operator: 'Escrow Settlement Smart Contract',
            completed: true
          }
        ];
        return { ...o, status: 'Completed', timeline: updatedTimeline };
      })
    );

    if (targetListingId) {
      setProduceListings((prev) =>
        prev.map((p) => (p.id === targetListingId ? { ...p, status: 'Completed' } : p))
      );
    }
    setSettlements((prev) =>
      prev.map((s) =>
        s.orderId === orderId ? { ...s, status: 'COMPLETED', settlementDate: timestamp, utrNumber: utr } : s
      )
    );
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
        orders,
        agreements,
        producePassports,
        settlements,
        confirmMatchAndCreateOrder,
        fpoCollectProduce,
        fpoQualityCheck,
        fpoPackProduce,
        assignTransport,
        dispatchShipment,
        markDelivered,
        buyerConfirmReceipt,
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
