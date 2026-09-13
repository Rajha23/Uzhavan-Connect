import {
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  NotificationPriority,
  ProduceListing,
  DemandRequest,
  WorkflowOrder,
  SettlementRecord,
  ProducePassport,
  SystemUserRecord,
  MarketPriceItem,
  UserProfile,
  UserRole
} from '../types';

export const UZHAVAN_READ_NOTIFICATIONS_KEY = 'uzhavan_read_notifications';
export const UZHAVAN_NOTIF_PREFS_KEY = 'uzhavan_notification_preferences';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  marketDemand: true,
  orders: true,
  logistics: true,
  payments: true,
  traceability: true,
  advisory: true,
  system: true // Platform governance and security cannot be disabled
};

export const loadReadNotificationIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(UZHAVAN_READ_NOTIFICATIONS_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set<string>(parsed) : new Set<string>();
  } catch {
    return new Set<string>();
  }
};

export const saveReadNotificationIds = (ids: Set<string>): void => {
  try {
    localStorage.setItem(UZHAVAN_READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.warn('Failed to save read notification IDs to localStorage:', err);
  }
};

export const loadNotificationPreferences = (): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(UZHAVAN_NOTIF_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
      system: true // Always enforce true for security
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
};

export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  try {
    const safePrefs = { ...prefs, system: true };
    localStorage.setItem(UZHAVAN_NOTIF_PREFS_KEY, JSON.stringify(safePrefs));
  } catch (err) {
    console.warn('Failed to save notification preferences to localStorage:', err);
  }
};

export const formatRelativeTime = (timestampMs: number): string => {
  const now = Date.now();
  const diffMs = now - timestampMs;
  if (diffMs < 60 * 1000) return 'Just now';
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestampMs).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric'
  });
};

interface NotificationGenerationParams {
  currentUser: UserProfile;
  currentRole: UserRole;
  produceListings: ProduceListing[];
  demandRequests: DemandRequest[];
  orders: WorkflowOrder[];
  settlements: SettlementRecord[];
  producePassports: ProducePassport[];
  systemUsers: SystemUserRecord[];
  marketPrices: MarketPriceItem[];
  eventNotifications?: AppNotification[];
  readIds?: Set<string>;
  preferences?: NotificationPreferences;
}

/**
 * Centrally derives role-specific notifications from real application entities and events.
 * Guarantees deterministic IDs so duplicate alerts are never generated for the same state.
 */
export const generateRealNotifications = ({
  currentUser,
  currentRole,
  produceListings,
  demandRequests,
  orders,
  settlements,
  producePassports,
  systemUsers,
  marketPrices,
  eventNotifications = [],
  readIds = new Set<string>(),
  preferences = DEFAULT_NOTIFICATION_PREFERENCES
}: NotificationGenerationParams): AppNotification[] => {
  const notifs: AppNotification[] = [];
  const baseTime = Date.now();

  const isCategoryEnabled = (cat: NotificationCategory): boolean => {
    switch (cat) {
      case 'MARKET_DEMAND':
      case 'DEMAND':
      case 'MATCH':
        return preferences.marketDemand;
      case 'ORDERS':
      case 'ORDER':
        return preferences.orders;
      case 'LOGISTICS':
        return preferences.logistics;
      case 'SETTLEMENT':
        return preferences.payments;
      case 'TRACEABILITY':
        return preferences.traceability;
      case 'ADVISORY':
      case 'CROPS':
        return preferences.advisory;
      case 'SYSTEM':
      default:
        return true;
    }
  };

  const add = (n: Omit<AppNotification, 'read'>) => {
    if (!isCategoryEnabled(n.type)) return;
    const isRead = readIds.has(n.id);
    notifs.push({
      ...n,
      read: isRead,
      timestamp: n.createdAt ? formatRelativeTime(n.createdAt) : n.timestamp
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. FARMER NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentRole === 'FARMER') {
    const farmerId = currentUser.id;
    const farmerName = currentUser.name;
    const farmerListings = produceListings.filter(
      (l) => l.farmerId === farmerId || l.farmerName.toLowerCase() === farmerName.toLowerCase()
    );

    // A. Crops & Harvest Deadlines
    farmerListings.forEach((listing, index) => {
      // Parse harvest date
      const harvestDateObj = new Date(listing.harvestDate || listing.availabilityDate || '2026-09-15');
      const timeDiff = harvestDateObj.getTime() - baseTime;
      const daysUntilHarvest = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysUntilHarvest < 0 || daysUntilHarvest === 0) {
        add({
          id: `farmer-harvest-due-${listing.id}`,
          title: `Harvest Due: ${listing.crop}`,
          message: `Your ${listing.crop} (${listing.quantityKg.toLocaleString()} kg) in ${listing.location} has reached its harvest window. Update availability for direct buyer aggregation.`,
          createdAt: baseTime - (index + 1) * 3600 * 1000,
          timestamp: 'Today',
          targetRole: 'FARMER',
          type: 'CROPS',
          priority: 'URGENT',
          actionTab: 'my-crops',
          actionLabel: 'Manage Crops',
          entityId: listing.id,
          entityType: 'Produce'
        });
      } else if (daysUntilHarvest <= 3) {
        add({
          id: `farmer-harvest-upcoming-${listing.id}`,
          title: `Upcoming Harvest: ${listing.crop} in ${daysUntilHarvest} Days`,
          message: `${listing.crop} (${listing.quantityKg.toLocaleString()} kg, Grade: ${listing.grade}) is approaching harvest readiness. Ensure farm-gate crate prep.`,
          createdAt: baseTime - (index + 2) * 3600 * 1000,
          timestamp: 'Recent',
          targetRole: 'FARMER',
          type: 'CROPS',
          priority: 'WARNING',
          actionTab: 'my-crops',
          actionLabel: 'View Harvest Schedule',
          entityId: listing.id,
          entityType: 'Produce'
        });
      } else {
        add({
          id: `farmer-listing-active-${listing.id}-${listing.status}`,
          title: `Produce Listed in Marketplace: ${listing.crop}`,
          message: `${listing.crop} (${listing.quantityKg.toLocaleString()} kg @ ₹${listing.expectedPricePerKg}/kg) is published for algorithm-based buyer matching.`,
          createdAt: baseTime - (index + 5) * 3600 * 1000,
          timestamp: 'Active',
          targetRole: 'FARMER',
          type: 'CROPS',
          priority: 'INFO',
          actionTab: 'my-crops',
          actionLabel: 'View Listing',
          entityId: listing.id,
          entityType: 'Produce'
        });
      }
    });

    // B. Demand & Market Matching
    const farmerCrops = new Set(
      farmerListings.map((l) => l.crop.toLowerCase()).concat((currentUser.mainCrops || []).map((c) => c.toLowerCase()))
    );

    demandRequests
      .filter((d) => farmerCrops.has(d.crop.toLowerCase()))
      .slice(0, 3)
      .forEach((demand, idx) => {
        add({
          id: `farmer-demand-match-${demand.id}`,
          title: `High-Demand Match: ${demand.crop}`,
          message: `${demand.buyerName} seeking ${demand.quantityKg.toLocaleString()} kg of ${demand.crop} @ ₹${demand.maxTargetPricePerKg}/kg for ${demand.location}. Favorable price discovery!`,
          createdAt: baseTime - (idx + 1) * 2 * 3600 * 1000,
          timestamp: 'Market Signal',
          targetRole: 'FARMER',
          type: 'MATCH',
          priority: 'SUCCESS',
          actionTab: 'find-buyers',
          actionLabel: 'Review Buyer Match',
          entityId: demand.id,
          entityType: 'Demand'
        });
      });

    // C. Orders & Logistics Lifecycle
    const farmerOrders = orders.filter(
      (o) => o.farmerId === farmerId || o.farmerName.toLowerCase() === farmerName.toLowerCase()
    );

    farmerOrders.forEach((order, idx) => {
      // Order Created
      add({
        id: `farmer-order-created-${order.id}`,
        title: `Order Confirmed: #${order.id}`,
        message: `Contract established with ${order.buyerName} for ${order.quantityKg.toLocaleString()} kg of ${order.crop} @ ₹${order.pricePerKg}/kg. Direct escrow secured.`,
        createdAt: baseTime - (idx + 1) * 4 * 3600 * 1000,
        timestamp: order.date || 'Active',
        targetRole: 'FARMER',
        type: 'ORDERS',
        priority: 'SUCCESS',
        actionTab: 'orders',
        actionLabel: 'View Order Details',
        entityId: order.id,
        entityType: 'Order'
      });

      // Collection & Transport Alerts
      if (order.status === 'Produce Collection Pending') {
        add({
          id: `farmer-pickup-pending-${order.id}`,
          title: `FPO Farm-Gate Pickup Scheduled`,
          message: `FPO collection van scheduled for Order #${order.id} (${order.crop}, ${order.quantityKg.toLocaleString()} kg). Please stage produce in collection crates.`,
          createdAt: baseTime - 45 * 60 * 1000,
          timestamp: '1h ago',
          targetRole: 'FARMER',
          type: 'LOGISTICS',
          priority: 'WARNING',
          actionTab: 'orders',
          actionLabel: 'Check Collection Status',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Collected' || order.status === 'Quality Checked') {
        add({
          id: `farmer-qc-passed-${order.id}`,
          title: `Produce Graded at FPO Hub (${order.qualityGrade})`,
          message: `Your ${order.crop} for Order #${order.id} passed quality inspection with verified ${order.qualityGrade}. Prepared for reefer transit.`,
          createdAt: baseTime - 2 * 3600 * 1000,
          timestamp: '2h ago',
          targetRole: 'FARMER',
          type: 'TRACEABILITY',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'Inspect QC Metrics',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'In Transit') {
        add({
          id: `farmer-in-transit-${order.id}`,
          title: `Shipment En-Route to Buyer`,
          message: `Produce for Order #${order.id} dispatched via ${order.transportDetails?.carrierName || 'Reefer Express'}. Temperature monitored in real time.`,
          createdAt: baseTime - 3 * 3600 * 1000,
          timestamp: '3h ago',
          targetRole: 'FARMER',
          type: 'LOGISTICS',
          priority: 'INFO',
          actionTab: 'orders',
          actionLabel: 'Track Shipment',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Delivered' || order.status === 'Buyer Confirmed' || order.status === 'Completed') {
        add({
          id: `farmer-delivered-${order.id}`,
          title: `Buyer Confirmed Delivery for Order #${order.id}`,
          message: `${order.buyerName} received and approved your ${order.crop}. Settlement release is authorized.`,
          createdAt: baseTime - 5 * 3600 * 1000,
          timestamp: '5h ago',
          targetRole: 'FARMER',
          type: 'ORDERS',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'Review Delivery',
          entityId: order.id,
          entityType: 'Order'
        });
      }
    });

    // D. Settlements
    settlements.slice(0, 2).forEach((settlement, idx) => {
      add({
        id: `farmer-settlement-${settlement.id}-${settlement.status}`,
        title: `Payment Disbursed: ₹${settlement.farmerAmount.toLocaleString()}`,
        message: `Settlement completed for ${settlement.crop} (Order #${settlement.orderId}). Credited directly with zero mandi commissions (UTR: ${settlement.utrNumber}).`,
        createdAt: baseTime - (idx + 1) * 8 * 3600 * 1000,
        timestamp: settlement.settlementDate || 'Recent',
        targetRole: 'FARMER',
        type: 'SETTLEMENT',
        priority: 'SUCCESS',
        actionTab: 'settlement',
        actionLabel: 'View Settlement Ledger',
        entityId: settlement.id,
        entityType: 'Settlement'
      });
    });

    // E. Traceability Batch QR
    producePassports.slice(0, 1).forEach((passport) => {
      add({
        id: `farmer-passport-ready-${passport.batchId}`,
        title: `Digital Produce Passport Generated`,
        message: `Batch #${passport.batchId} for ${passport.crop} has an active verifiable QR code. Full farm-gate provenance certified.`,
        createdAt: baseTime - 6 * 3600 * 1000,
        timestamp: '6h ago',
        targetRole: 'FARMER',
        type: 'TRACEABILITY',
        priority: 'INFO',
        actionTab: 'traceability',
        actionLabel: 'Inspect QR Passport',
        entityId: passport.batchId,
        entityType: 'Passport'
      });
    });

    // F. AI Advisory
    const topPrice = marketPrices.find((p) => farmerCrops.has(p.crop.toLowerCase())) || marketPrices[0];
    if (topPrice) {
      add({
        id: `farmer-ai-advisory-${topPrice.id}`,
        title: `AI Mentor Advisory: ${topPrice.crop} Spot Trend`,
        message: `Wholesale mandi rate for ${topPrice.crop} in ${topPrice.location} is ${topPrice.trendText.toLowerCase()} (${topPrice.priceRange}). Optimal contract opportunity detected.`,
        createdAt: baseTime - 12 * 3600 * 1000,
        timestamp: '12h ago',
        targetRole: 'FARMER',
        type: 'ADVISORY',
        priority: 'INFO',
        actionTab: 'demand-forecast',
        actionLabel: 'Open Market Intelligence',
        entityId: topPrice.id,
        entityType: 'MarketPrice'
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. FPO AGGREGATOR NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  else if (currentRole === 'FPO_AGGREGATOR') {
    // A. Farmer Supply Available
    produceListings.slice(0, 3).forEach((listing, idx) => {
      add({
        id: `fpo-farmer-supply-${listing.id}`,
        title: `New Farmer Produce Available: ${listing.crop}`,
        message: `${listing.farmerName} registered ${listing.quantityKg.toLocaleString()} kg of ${listing.crop} (${listing.grade}) in ${listing.location}. Available for hub pooling.`,
        createdAt: baseTime - (idx + 1) * 2 * 3600 * 1000,
        timestamp: 'Recent',
        targetRole: 'FPO_AGGREGATOR',
        type: 'CROPS',
        priority: 'INFO',
        actionTab: 'my-crops',
        actionLabel: 'View Regional Produce',
        entityId: listing.id,
        entityType: 'Produce'
      });
    });

    // B. Bulk Demand Needing Aggregation
    demandRequests.slice(0, 2).forEach((demand, idx) => {
      add({
        id: `fpo-demand-pool-${demand.id}`,
        title: `Aggregation Opportunity: ${demand.crop}`,
        message: `${demand.buyerName} placed an institutional demand for ${demand.quantityKg.toLocaleString()} kg of ${demand.crop} @ ₹${demand.maxTargetPricePerKg}/kg. Initiate member farmer pooling.`,
        createdAt: baseTime - (idx + 1) * 3 * 3600 * 1000,
        timestamp: 'Market Signal',
        targetRole: 'FPO_AGGREGATOR',
        type: 'MARKET_DEMAND',
        priority: 'WARNING',
        actionTab: 'dashboard',
        actionLabel: 'Pool Member Supply',
        entityId: demand.id,
        entityType: 'Demand'
      });
    });

    // C. Orders Operations (Collection, QC, Packing, Transport)
    orders.forEach((order, idx) => {
      if (order.status === 'Produce Collection Pending') {
        add({
          id: `fpo-collection-required-${order.id}`,
          title: `Produce Collection Pending: Order #${order.id}`,
          message: `Collect ${order.quantityKg.toLocaleString()} kg of ${order.crop} from ${order.farmerName} (${order.farmerLocation}). Dispatch collection vehicle.`,
          createdAt: baseTime - (idx + 1) * 3600 * 1000,
          timestamp: '1h ago',
          targetRole: 'FPO_AGGREGATOR',
          type: 'LOGISTICS',
          priority: 'WARNING',
          actionTab: 'orders',
          actionLabel: 'Record Collection',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Collected') {
        add({
          id: `fpo-qc-required-${order.id}`,
          title: `Quality Inspection Required: Order #${order.id}`,
          message: `Produce arrived at hub for ${order.crop} (${order.quantityKg.toLocaleString()} kg). Record brix, firmness, and residue grade.`,
          createdAt: baseTime - 45 * 60 * 1000,
          timestamp: '45m ago',
          targetRole: 'FPO_AGGREGATOR',
          type: 'TRACEABILITY',
          priority: 'URGENT',
          actionTab: 'orders',
          actionLabel: 'Conduct Inspection',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Quality Checked') {
        add({
          id: `fpo-pack-required-${order.id}`,
          title: `Packaging & Crating Required: Order #${order.id}`,
          message: `Grading completed for ${order.crop}. Pack into pre-cooled ventilated crates and attach QR labels.`,
          createdAt: baseTime - 30 * 60 * 1000,
          timestamp: '30m ago',
          targetRole: 'FPO_AGGREGATOR',
          type: 'ORDERS',
          priority: 'INFO',
          actionTab: 'orders',
          actionLabel: 'Record Packaging',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Packed') {
        add({
          id: `fpo-transport-required-${order.id}`,
          title: `Assign Reefer Transport: Order #${order.id}`,
          message: `${order.crop} packed and ready at hub. Assign carrier vehicle for delivery to ${order.deliveryLocation}.`,
          createdAt: baseTime - 20 * 60 * 1000,
          timestamp: '20m ago',
          targetRole: 'FPO_AGGREGATOR',
          type: 'LOGISTICS',
          priority: 'URGENT',
          actionTab: 'orders',
          actionLabel: 'Assign Transport',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Buyer Confirmed' || order.status === 'Completed') {
        add({
          id: `fpo-payout-ready-${order.id}`,
          title: `Buyer Payment Confirmed: Order #${order.id}`,
          message: `${order.buyerName} confirmed receipt. Total value ₹${order.totalValue.toLocaleString()}. Release farmer distribution payout.`,
          createdAt: baseTime - 4 * 3600 * 1000,
          timestamp: '4h ago',
          targetRole: 'FPO_AGGREGATOR',
          type: 'SETTLEMENT',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'Process Payout',
          entityId: order.id,
          entityType: 'Order'
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. RETAIL BUYER NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  else if (currentRole === 'RETAIL_BUYER') {
    const buyerId = currentUser.id;
    const buyerName = currentUser.name;
    const buyerDemands = demandRequests.filter(
      (d) => d.buyerId === buyerId || d.buyerName.toLowerCase() === buyerName.toLowerCase()
    );

    // A. Demands in Aggregation Pool
    buyerDemands.forEach((demand, idx) => {
      add({
        id: `buyer-demand-active-${demand.id}`,
        title: `Procurement Demand Active: ${demand.crop}`,
        message: `Your demand for ${demand.quantityKg.toLocaleString()} kg of ${demand.crop} @ ₹${demand.maxTargetPricePerKg}/kg is active in the aggregation pool.`,
        createdAt: baseTime - (idx + 1) * 3 * 3600 * 1000,
        timestamp: 'Active',
        targetRole: 'RETAIL_BUYER',
        type: 'MARKET_DEMAND',
        priority: 'INFO',
        actionTab: 'demand-pool',
        actionLabel: 'View Demand Pool',
        entityId: demand.id,
        entityType: 'Demand'
      });

      // Matching produce found
      const matches = produceListings.filter((l) => l.crop.toLowerCase() === demand.crop.toLowerCase());
      if (matches.length > 0) {
        add({
          id: `buyer-suppliers-matched-${demand.id}`,
          title: `Supplier Matches Found for ${demand.crop}`,
          message: `${matches.length} verified producers available supplying ${matches.reduce((acc, m) => acc + m.quantityKg, 0).toLocaleString()} kg of ${demand.crop}. Direct contracts ready.`,
          createdAt: baseTime - (idx + 1) * 2 * 3600 * 1000,
          timestamp: 'High Match',
          targetRole: 'RETAIL_BUYER',
          type: 'MATCH',
          priority: 'SUCCESS',
          actionTab: 'smart-matching',
          actionLabel: 'Review Matches',
          entityId: demand.id,
          entityType: 'Demand'
        });
      }
    });

    // B. Buyer Orders Lifecycle
    const buyerOrders = orders.filter(
      (o) => o.buyerId === buyerId || o.buyerName.toLowerCase() === buyerName.toLowerCase()
    );

    buyerOrders.forEach((order, idx) => {
      if (order.status === 'Created') {
        add({
          id: `buyer-order-placed-${order.id}`,
          title: `Order Placed Successfully: #${order.id}`,
          message: `Order for ${order.quantityKg.toLocaleString()} kg of ${order.crop} placed with ${order.farmerName}. Escrow reserved.`,
          createdAt: baseTime - (idx + 1) * 4 * 3600 * 1000,
          timestamp: 'Order Confirmed',
          targetRole: 'RETAIL_BUYER',
          type: 'ORDERS',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'View Order',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'In Transit') {
        add({
          id: `buyer-in-transit-${order.id}`,
          title: `Shipment In Transit: Order #${order.id}`,
          message: `Your ${order.crop} shipment (${order.quantityKg.toLocaleString()} kg) is on the way. Carrier: ${order.transportDetails?.carrierName || 'CoolChain Logistics'}, Driver: ${order.transportDetails?.driverName || 'Suresh Kumar'}.`,
          createdAt: baseTime - 2 * 3600 * 1000,
          timestamp: '2h ago',
          targetRole: 'RETAIL_BUYER',
          type: 'LOGISTICS',
          priority: 'INFO',
          actionTab: 'orders',
          actionLabel: 'Track Delivery',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Delivered') {
        add({
          id: `buyer-delivery-arrived-${order.id}`,
          title: `Delivery Arrived: Action Required for Order #${order.id}`,
          message: `Shipment has arrived at ${order.deliveryLocation}. Please inspect produce quality and confirm delivery receipt.`,
          createdAt: baseTime - 15 * 60 * 1000,
          timestamp: '15m ago',
          targetRole: 'RETAIL_BUYER',
          type: 'ORDERS',
          priority: 'URGENT',
          actionTab: 'orders',
          actionLabel: 'Confirm Delivery',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'Buyer Confirmed' || order.status === 'Completed') {
        add({
          id: `buyer-confirmed-${order.id}`,
          title: `Delivery Receipt Confirmed: #${order.id}`,
          message: `You confirmed receipt of ${order.quantityKg.toLocaleString()} kg of ${order.crop}. Digital invoice and certificate archived.`,
          createdAt: baseTime - 6 * 3600 * 1000,
          timestamp: '6h ago',
          targetRole: 'RETAIL_BUYER',
          type: 'ORDERS',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'View Invoice',
          entityId: order.id,
          entityType: 'Order'
        });
      }
    });

    // C. Produce Passports
    producePassports.slice(0, 1).forEach((passport) => {
      add({
        id: `buyer-passport-qr-${passport.batchId}`,
        title: `QR Produce Passport Available`,
        message: `Farm-to-fork batch traceability code active for ${passport.crop} (Batch #${passport.batchId}). Inspect harvest origin and cold-chain compliance.`,
        createdAt: baseTime - 5 * 3600 * 1000,
        timestamp: '5h ago',
        targetRole: 'RETAIL_BUYER',
        type: 'TRACEABILITY',
        priority: 'INFO',
        actionTab: 'traceability',
        actionLabel: 'Inspect QR Passport',
        entityId: passport.batchId,
        entityType: 'Passport'
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. BULK BUYER NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  else if (currentRole === 'BULK_BUYER') {
    // A. Bulk Demand Allocation
    demandRequests
      .filter((d) => d.quantityKg >= 1000)
      .slice(0, 2)
      .forEach((demand, idx) => {
        add({
          id: `bulk-demand-allocation-${demand.id}`,
          title: `Bulk Procurement Allocation: ${demand.crop}`,
          message: `Multi-supplier aggregation underway for ${demand.quantityKg.toLocaleString()} kg of ${demand.crop}. ${produceListings.filter((l) => l.crop.toLowerCase() === demand.crop.toLowerCase()).length} regional FPO clusters active.`,
          createdAt: baseTime - (idx + 1) * 2 * 3600 * 1000,
          timestamp: 'Active Aggregation',
          targetRole: 'BULK_BUYER',
          type: 'MARKET_DEMAND',
          priority: 'INFO',
          actionTab: 'bulk-demand',
          actionLabel: 'View Allocation Console',
          entityId: demand.id,
          entityType: 'Demand'
        });
      });

    // B. Reefer Telematics & Logistics
    orders.slice(0, 2).forEach((order, idx) => {
      add({
        id: `bulk-fleet-telematics-${order.id}`,
        title: `Cold-Chain Fleet Telematics: Order #${order.id}`,
        message: `Vehicle ${order.transportDetails?.vehicleNumber || 'TN-04-EV-2026'} reporting steady 4.2°C reefer temp along Chennai highway. ETA within window.`,
        createdAt: baseTime - (idx + 1) * 3 * 3600 * 1000,
        timestamp: 'Live Telematics',
        targetRole: 'BULK_BUYER',
        type: 'LOGISTICS',
        priority: 'INFO',
        actionTab: 'tracking',
        actionLabel: 'Open Fleet Telematics',
        entityId: order.id,
        entityType: 'Order'
      });

      if (order.status === 'Delivered' || order.status === 'Buyer Confirmed') {
        add({
          id: `bulk-order-delivered-${order.id}`,
          title: `Bulk Consignment Received: Order #${order.id}`,
          message: `Industrial delivery of ${order.quantityKg.toLocaleString()} kg of ${order.crop} logged at dockside warehouse.`,
          createdAt: baseTime - 4 * 3600 * 1000,
          timestamp: '4h ago',
          targetRole: 'BULK_BUYER',
          type: 'ORDERS',
          priority: 'SUCCESS',
          actionTab: 'orders',
          actionLabel: 'Inspect Consignment',
          entityId: order.id,
          entityType: 'Order'
        });
      }
    });

    // C. Institutional Settlement
    settlements.slice(0, 1).forEach((settlement) => {
      add({
        id: `bulk-settlement-ledger-${settlement.id}`,
        title: `Settlement Clearance: Batch #${settlement.batchId}`,
        message: `Direct contract financial clearance confirmed for ₹${settlement.totalOrderValue.toLocaleString()} with 89% direct farmer share.`,
        createdAt: baseTime - 8 * 3600 * 1000,
        timestamp: 'Settled',
        targetRole: 'BULK_BUYER',
        type: 'SETTLEMENT',
        priority: 'SUCCESS',
        actionTab: 'settlement',
        actionLabel: 'View Escrow Audit',
        entityId: settlement.id,
        entityType: 'Settlement'
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. LOGISTICS OPERATOR NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  else if (currentRole === 'LOGISTICS') {
    orders.forEach((order, idx) => {
      if (order.status === 'Packed' || order.status === 'Transport Assigned') {
        add({
          id: `logistics-dispatch-ready-${order.id}`,
          title: `Pickup Ready at FPO Hub: Order #${order.id}`,
          message: `${order.quantityKg.toLocaleString()} kg of ${order.crop} packed and pre-cooled at ${order.farmerLocation || 'Salem FPO Hub'}. Dispatch reefer carrier.`,
          createdAt: baseTime - (idx + 1) * 3600 * 1000,
          timestamp: '1h ago',
          targetRole: 'LOGISTICS',
          type: 'LOGISTICS',
          priority: 'URGENT',
          actionTab: 'shipments',
          actionLabel: 'Manage Dispatch',
          entityId: order.id,
          entityType: 'Order'
        });
      } else if (order.status === 'In Transit') {
        add({
          id: `logistics-in-transit-${order.id}`,
          title: `Active Reefer Run: Order #${order.id}`,
          message: `Vehicle ${order.transportDetails?.vehicleNumber || 'TN-22-CR-8812'} en-route to ${order.deliveryLocation}. Live temp sensor: ${order.transportDetails?.temperatureC || '4.0'}°C.`,
          createdAt: baseTime - 2 * 3600 * 1000,
          timestamp: '2h ago',
          targetRole: 'LOGISTICS',
          type: 'LOGISTICS',
          priority: 'INFO',
          actionTab: 'routes',
          actionLabel: 'Inspect Route Waypoints',
          entityId: order.id,
          entityType: 'Order'
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. ADMIN / GOVERNANCE NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  else if (currentRole === 'ADMIN') {
    // A. Platform Registrations & Activity
    systemUsers.slice(0, 3).forEach((user, idx) => {
      add({
        id: `admin-user-registered-${user.id}`,
        title: `New User Verified: ${user.name}`,
        message: `${user.name} onboarded as ${user.role} in ${user.location}. Mobile & Aadhaar e-KYC credentials active.`,
        createdAt: baseTime - (idx + 1) * 3 * 3600 * 1000,
        timestamp: 'Recent',
        targetRole: 'ADMIN',
        type: 'SYSTEM',
        priority: 'INFO',
        actionTab: 'sys-users',
        actionLabel: 'View User Directory',
        entityId: user.id,
        entityType: 'User'
      });
    });

    // B. System Performance & Audit
    add({
      id: `admin-system-health-${baseTime.toString().slice(0, 7)}`,
      title: `Platform Operations Status: Healthy`,
      message: `${orders.length} orders in progress across 14 cold-chain micro-hubs. Zero intermediary cess deductions reported.`,
      createdAt: baseTime - 3600 * 1000,
      timestamp: '1h ago',
      targetRole: 'ADMIN',
      type: 'SYSTEM',
      priority: 'SUCCESS',
      actionTab: 'system-monitoring',
      actionLabel: 'Check System Logs'
    });

    // C. Escrow Settlement Ledger
    const totalVolume = settlements.reduce((acc, s) => acc + s.totalOrderValue, 0);
    add({
      id: `admin-settlement-audit-${settlements.length}`,
      title: `Transparency Ledger Audit: ₹${totalVolume.toLocaleString()}`,
      message: `Audited ${settlements.length} direct farm settlements. Average farmer realization maintained at 89% vs 38% traditional mandis.`,
      createdAt: baseTime - 6 * 3600 * 1000,
      timestamp: '6h ago',
      targetRole: 'ADMIN',
      type: 'SETTLEMENT',
      priority: 'SUCCESS',
      actionTab: 'settlement',
      actionLabel: 'Open Settlement Ledger'
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. MERGE SESSION EVENT NOTIFICATIONS (Actions performed during current session)
  // ─────────────────────────────────────────────────────────────────────────────
  eventNotifications.forEach((evt) => {
    // Only include if matches current role or target is 'ALL'
    if (evt.targetRole === 'ALL' || evt.targetRole === currentRole) {
      if (isCategoryEnabled(evt.type)) {
        const isRead = readIds.has(evt.id);
        notifs.push({
          ...evt,
          read: isRead,
          timestamp: evt.createdAt ? formatRelativeTime(evt.createdAt) : evt.timestamp
        });
      }
    }
  });

  // Deduplicate by ID and sort newest first
  const seenIds = new Set<string>();
  const deduplicated: AppNotification[] = [];

  for (const n of notifs) {
    if (!seenIds.has(n.id)) {
      seenIds.add(n.id);
      deduplicated.push(n);
    }
  }

  // Sort by priority (URGENT -> WARNING -> SUCCESS -> INFO) then by creation timestamp
  const priorityScore: Record<NotificationPriority, number> = {
    URGENT: 4,
    WARNING: 3,
    SUCCESS: 2,
    INFO: 1
  };

  deduplicated.sort((a, b) => {
    const unreadDiff = (a.read ? 0 : 1) - (b.read ? 0 : 1);
    if (unreadDiff !== 0) return -unreadDiff; // Unread first

    const pA = priorityScore[a.priority || 'INFO'] || 1;
    const pB = priorityScore[b.priority || 'INFO'] || 1;
    if (pA !== pB) return pB - pA;

    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return deduplicated;
};
