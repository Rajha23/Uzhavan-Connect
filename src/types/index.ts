export type UserRole =
  | 'FARMER'
  | 'RETAIL_BUYER'
  | 'BULK_BUYER'
  | 'FPO_AGGREGATOR'
  | 'LOGISTICS'
  | 'ADMIN';

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'MARKET_PRICES'
  | 'DEMAND_FORECAST'
  | 'CROP_LISTING'
  | 'CREATE_DEMAND'
  | 'SMART_MATCHING'
  | 'REVERSE_AUCTION'
  | 'ORDERS'
  | 'LOGISTICS'
  | 'TRACEABILITY'
  | 'USER_MANAGEMENT'
  | 'ROLE_MANAGEMENT'
  | 'REPORTS'
  | 'AUDIT_LOGS';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  location: string;
  avatar?: string;
  organization?: string;
  rating?: number;
  // Role-specific profile attributes
  village?: string;
  district?: string;
  state?: string;
  farmSizeAcres?: number;
  mainCrops?: string[];
  fpoName?: string;
  totalListings?: number;
  completedOrders?: number;
  quantitySoldKg?: number;
  businessName?: string;
  buyerType?: string;
  transportName?: string;
  vehicleType?: string;
  serviceArea?: string;
}

export type NetworkSyncStatus = 'idle' | 'offline_saved' | 'syncing' | 'synced';

export type ProduceStatus =
  | 'Listed'
  | 'Matched'
  | 'Agreement Pending'
  | 'Confirmed'
  | 'Collection'
  | 'Collected'
  | 'Quality Check'
  | 'Quality Checked'
  | 'Packed'
  | 'In Transit'
  | 'Delivered'
  | 'Payment Completed'
  | 'Completed'
  | 'Reserved'
  | 'AVAILABLE'
  | 'POOLED'
  | 'DISPATCHED'
  | 'SETTLED';

export type BuyerDemandStatus =
  | 'Created'
  | 'Aggregating'
  | 'Matched'
  | 'Agreement Pending'
  | 'Confirmed'
  | 'Order Created'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'OPEN'
  | 'POOLED'
  | 'MATCHING'
  | 'AUCTION_ACTIVE'
  | 'ALLOCATED';

export type OrderStatus =
  | 'Created'
  | 'Produce Collection Pending'
  | 'Partially Collected'
  | 'Collected'
  | 'Quality Checked'
  | 'Quality Rejected'
  | 'Packed'
  | 'Transport Assigned'
  | 'In Transit'
  | 'Delivered'
  | 'Buyer Confirmation Pending'
  | 'Buyer Confirmed'
  | 'Payment Pending'
  | 'Completed'
  | 'Pending'
  | 'Confirmed';

export interface FarmerContribution {
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  produceListingId: string;
  contributedQuantityKg: number;
  collectedQuantityKg: number;
  collectionStatus: 'PENDING' | 'PARTIALLY_COLLECTED' | 'FULLY_COLLECTED';
  collectedAt?: string;
  notes?: string;
  agreedPricePerKg?: number;
  settlementAmount?: number;
  settlementStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  farmerUtr?: string;
  settledAt?: string;
}

export interface FarmerSettlementItem {
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  produceListingId: string;
  contributedQuantityKg: number;
  collectedQuantityKg: number;
  agreedPricePerKg: number;
  grossAmount: number;
  netFarmerAmount: number; // 89% net realization
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  utrNumber?: string;
  settledAt?: string;
  bankAccountMasked?: string;
}

export interface QualityInspectionData {
  sugarBrix: number;
  firmnessKgCm: number;
  pesticideResidueTest: 'PASS - Organic / ND' | 'PASS - Standard Compliant';
  moistureContent: string;
  verifiedGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Standard' | 'Premium';
  inspectorName: string;
  inspectionDate: string;
  hubLocation: string;
  status?: 'PASSED' | 'REJECTED' | 'CONDITIONALLY_PASSED';
  acceptedQuantityKg?: number;
  rejectedQuantityKg?: number;
  rejectionReason?: string;
  inspectionNotes?: string;
}

export interface BuyerDeliveryConfirmation {
  orderId: string;
  deliveredQuantityKg: number;
  receivedQuantityKg: number;
  acceptedQuantityKg: number;
  rejectedQuantityKg?: number;
  acceptanceStatus: 'ACCEPTED_FULL' | 'ACCEPTED_PARTIAL' | 'REJECTED';
  issuesReported?: string;
  receiverName: string;
  receiverRole: string;
  confirmedAt: string;
  signatureOrOtp?: string;
}

export interface TransportAssignment {
  carrierName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  departureTime?: string;
  estimatedArrival?: string;
  assignedAt: string;
  temperatureC?: string | number;
}

export interface WorkflowAgreement {
  id: string;
  demandRequestId: string;
  produceListingId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  agreedQuantityKg: number;
  agreedPricePerKg: number;
  totalAgreedValue: number;
  agreementDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export interface OrderTimelineEvent {
  step: string;
  title: string;
  location: string;
  timestamp: string;
  operator: string;
  completed: boolean;
  notes?: string;
}

export interface WorkflowOrder {
  id: string;
  agreementId?: string;
  produceListingId: string;
  demandRequestId: string;
  aggregatedGroupId?: string;
  batchId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  variety?: string;
  quantityKg: number;
  pricePerKg: number;
  totalValue: number;
  status: OrderStatus;
  date: string;
  deliveryLocation: string;
  farmerLocation: string;
  fpoName?: string;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Standard' | 'Premium';
  inspectionMetrics?: QualityInspectionData;
  transportDetails?: TransportAssignment;
  timeline: OrderTimelineEvent[];
  settlementId?: string;

  // Collection tracking (Part B & C)
  farmerContributions?: FarmerContribution[];
  collectionStatus?: 'Collection Pending' | 'Partially Collected' | 'Fully Collected';
  collectedQuantityKg?: number;
  remainingCollectionKg?: number;

  // Quality & Grading tracking (Part D)
  qualityStatus?: 'Pending' | 'Passed' | 'Rejected' | 'Conditionally Passed';
  acceptedQuantityKg?: number;
  rejectedQuantityKg?: number;

  // Packing tracking (Part E)
  packingStatus?: 'Packing Pending' | 'Packing In Progress' | 'Packed';
  packedQuantityKg?: number;
  crateCount?: number;
  packageType?: string;
  isReadyForTransport?: boolean;

  // Transport tracking (Part F)
  transportStatus?: 'Transport Pending' | 'Vehicle Assigned' | 'Ready for Pickup' | 'In Transit' | 'Delivered';

  // Buyer Delivery Confirmation (Part G)
  buyerConfirmation?: BuyerDeliveryConfirmation;

  // Bulk Procurement & 14-Stage Tracking (Part H)
  isBulkOrder?: boolean;
  bulkDemandId?: string;
  multiSupplierAllocations?: SupplierAllocation[];
  lifecycleStage?: ShipmentLifecycleStage;
  gpsTracking?: {
    isLive: boolean;
    currentLat: number;
    currentLng: number;
    speedKmH: number;
    reeferTempC: number;
    distanceCoveredKm: number;
    remainingDistanceKm: number;
    estimatedArrival: string;
    lastPingAt: string;
    routeWaypoints?: Array<{
      lat: number;
      lng: number;
      label: string;
      type: 'PICKUP' | 'HUB' | 'TRANSIT' | 'DESTINATION';
      timestamp?: string;
      completed?: boolean;
    }>;
  };
}

export type ShipmentLifecycleStage =
  | 'DEMAND_CREATED'
  | 'SUPPLIERS_MATCHED'
  | 'SUPPLY_CONFIRMED'
  | 'PRODUCE_READY'
  | 'COLLECTION_SCHEDULED'
  | 'COLLECTED'
  | 'AT_AGGREGATION_HUB'
  | 'QUALITY_VERIFIED'
  | 'LOADED_FOR_TRANSPORT'
  | 'IN_TRANSIT'
  | 'NEAR_DESTINATION'
  | 'DELIVERED'
  | 'DELIVERY_CONFIRMED'
  | 'SETTLEMENT_COMPLETED';

export interface SupplierAllocation {
  supplierId: string;
  supplierName: string;
  supplierType: 'FARMER' | 'FPO';
  location: string;
  crop: string;
  variety?: string;
  availableKg: number;
  allocatedKg: number;
  pricePerKg: number;
  qualityGrade: string;
  distanceKm: number;
  confirmed: boolean;
}

export interface BulkDemandRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerOrganization: string;
  crop: string;
  variety: string;
  totalRequiredKg: number;
  confirmedKg: number;
  targetPricePerKg: number;
  qualityRequirement: string;
  grade: 'Grade A' | 'Grade B' | 'Standard' | 'Premium';
  deliveryLocation: string;
  requiredDeliveryDate: string;
  deliveryTimeWindow?: string;
  status: 'OPEN' | 'ALLOCATING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED';
  allocations: SupplierAllocation[];
  createdAt: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  variety?: string;
  quantityKg: number;
  initialQuantityKg?: number;
  allocatedQuantityKg?: number;
  unit?: string;
  grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Standard' | 'Premium';
  expectedPricePerKg: number;
  harvestDate: string;
  availabilityDate: string;
  location: string;
  fpoId?: string;
  fpoName?: string;
  status: ProduceStatus;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  syncStatus?: 'SYNCED' | 'PENDING_SYNC';
  offlineCreated?: boolean;
}

export interface DemandRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'Supermarket' | 'Retailer' | 'Bulk Purchaser' | 'Hospitality' | 'Food Processor' | 'Consumer Coop';
  crop: string;
  variety?: string;
  quantityKg: number;
  initialQuantityKg?: number;
  allocatedQuantityKg?: number;
  unit?: string;
  qualityRequirement: 'Standard' | 'Premium' | 'Grade A' | 'Grade B' | 'Any';
  location: string;
  deliveryDate: string;
  deliveryTimeWindow: string;
  maxTargetPricePerKg: number;
  status: BuyerDemandStatus;
  createdAt: string;
  coordinates?: { lat: number; lng: number };
  syncStatus?: 'SYNCED' | 'PENDING_SYNC';
  offlineCreated?: boolean;
  aggregatedGroupId?: string;
}

export interface AggregatedDemandGroup {
  id: string;
  crop: string;
  variety?: string;
  qualityRequirement: string;
  region: string;
  targetDate: string;
  deliveryTimeWindow?: string;
  totalQuantityKg: number;
  initialQuantityKg?: number;
  contributingDemands: DemandRequest[];
  contributingDemandIds: string[];
  buyersCount: number;
  avgMaxPricePerKg: number;
  status: 'FORMED' | 'MATCHING' | 'PARTIALLY_MATCHED' | 'ALLOCATED';
  compatibilityReasons: string[];
}

export interface DemandPool {
  id: string;
  crop: string;
  region: string;
  totalQuantityKg: number;
  demandRequests: DemandRequest[];
  targetDate: string;
  forecastQuantityKg: number;
  buyersCount: number;
  status: 'FORMING' | 'POOLED' | 'IN_AUCTION' | 'MATCHED';
  priceBenchmarkPerKg: number;
}

export interface ForecastSignal {
  crop: string;
  region: string;
  horizonDays: number;
  currentDemandKg: number;
  predictedDemandKg: number;
  availableSupplyKg: number;
  supplyGapKg: number;
  indicativePricePerKg: number;
  confidenceScore: number;
  trend: 'UP' | 'STABLE' | 'DOWN';
  modelVersion: string;
  mae: number;
  rmse: number;
  mape: number;
  insight: string;
}

export interface ReverseAuctionOffer {
  id: string;
  auctionId: string;
  fpoId: string;
  fpoName: string;
  quantityKg: number;
  pricePerKg: number;
  grade: 'Grade A' | 'Grade B' | 'Standard' | 'Premium';
  readinessDate: string;
  estimatedTransportKm: number;
  reliabilityScore: number; // 0-100
  capacityScore: number;    // 0-100
  matchScore?: number;      // Calculated weighted score
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}

export interface SmartMatchSupplier {
  id: string;
  supplierName: string;
  supplierType: 'FPO' | 'Lead Farmer' | 'Farmer Cluster';
  crop: string;
  availableQtyKg: number;
  allocatedQtyKg: number;
  distanceKm: number;
  offeredPricePerKg: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Standard' | 'Premium';
  reliabilityScore: number;
  capacityScore: number;
  qualityScore: number;
  priceScore: number;
  distanceScore: number;
  totalMatchScore: number;
  hubProximity: string;
  status: 'RECOMMENDED' | 'ALLOCATED' | 'BACKUP';
  reasons?: string[];
}

export interface MicroHub {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  capacityTonnes: number;
  currentLoadTonnes: number;
  coldStorageAvailable: boolean;
  score: number;
  distanceToProducersKm: number;
  distanceToDemandKm: number;
  roadAccessibilityScore: number;
  isRecommended: boolean;
  selectionReason: string;
}

export interface RouteStop {
  stopOrder: number;
  name: string;
  type: 'FARM_CLUSTER' | 'MICRO_HUB' | 'DEMAND_POINT';
  quantityKg: number;
  lat: number;
  lng: number;
  eta: string;
  status: 'PENDING' | 'ARRIVED' | 'LOADED' | 'DELIVERED';
}

export interface RoutePlan {
  id: string;
  vehicleId: string;
  vehicleType: string;
  driverName: string;
  totalDistanceKm: number;
  distanceSavedKm: number;
  estimatedDuration: string;
  vehicleCapacityKg: number;
  totalLoadKg: number;
  utilizationPercentage: number;
  co2SavedKg: number;
  estimatedFuelCostRupees: number;
  status: 'SCHEDULED' | 'TRANSIT' | 'COMPLETED';
  stops: RouteStop[];
}

export interface ProducePassport {
  batchId: string;
  crop: string;
  variety: string;
  farmerOrFpo: string;
  farmLocation: string;
  harvestDate: string;
  quantityKg: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Standard' | 'Premium';
  inspectionMetrics: {
    sugarBrix: number;
    firmnessKgCm: number;
    pesticideResidueTest: 'PASS - Organic / ND' | 'PASS - Standard Compliant';
    moistureContent: string;
  };
  collectionHub: string;
  shipmentId: string;
  vehicleNumber: string;
  destination: string;
  qrCodeUrl: string;
  currentStatus: 'Harvested' | 'Quality Checked' | 'Packed' | 'In Transit' | 'Delivered';
  timeline: {
    step: string;
    title: string;
    location: string;
    timestamp: string;
    operator: string;
    metrics?: { label: string; value: string }[];
    completed: boolean;
    notes?: string;
  }[];
}

export type SettlementStatus =
  | 'Payment Pending'
  | 'Buyer Payment Confirmed'
  | 'FPO Settlement Pending'
  | 'Farmer Settlement Processing'
  | 'Farmer Payment Completed'
  | 'Transaction Completed'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED';

export interface SettlementRecord {
  id: string;
  orderId: string;
  batchId: string;
  crop: string;
  quantityKg: number;
  buyerName: string;
  farmerOrFpoName: string;
  totalOrderValue: number;
  farmerAmount: number;
  logisticsAmount: number;
  platformAmount: number;
  farmerRealizationPercentage: number;
  traditionalFarmerEarnings: number;
  earningsGainPercentage: number;
  status: SettlementStatus;
  settlementDate: string;
  utrNumber: string;
  paymentMode?: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)' | 'Bank RTGS / Direct NEFT Batch';
  buyerPaymentReference?: string;
  buyerPaymentRecordedAt?: string;
  fpoSettledAt?: string;
  farmerSettledAt?: string;
  farmerBreakdown?: FarmerSettlementItem[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  targetRole: UserRole | 'ALL';
  read: boolean;
  type: 'DEMAND' | 'MATCH' | 'LOGISTICS' | 'SETTLEMENT' | 'SYSTEM';
  actionUrl?: string;
}

export interface CropRecommendation {
  crop: string;
  scientificName?: string;
  suitabilityScore: number;
  demandTrend: 'HIGH' | 'MEDIUM' | 'EMERGING';
  predictedDemandKg: number;
  expectedPricePerKg: string; // e.g. "₹24–₹28/kg"
  growthDurationDays: number;
  waterRequirement: 'LOW' | 'MEDIUM' | 'HIGH';
  nearbyBuyerDemand: string;
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'All-Season';
  advice: string;
  keyBuyersNearby: string[];
  aiConfidence: number;
}

export interface MarketPriceItem {
  id: string;
  crop: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  trend: 'UP' | 'STABLE' | 'DOWN';
  trendText: 'Increasing' | 'Stable' | 'Decreasing';
  location: string;
  updatedTime: string;
  volumeTodayKg: number;
  isDemoData: boolean;
}

export interface BuyerDemandOpportunity {
  id: string;
  buyerName: string;
  crop: string;
  requiredQuantityKg: number;
  maxPricePerKg: number;
  location: string;
  requiredDate: string;
  quality: string;
}

export interface FarmerOfferItem {
  id: string;
  demandId: string;
  buyerName: string;
  crop: string;
  quantityKg: number;
  offeredPricePerKg: number;
  distanceKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FLAGGED';
}

export interface SystemUserRecord {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  location: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  joinedDate: string;
  permissions: Permission[];
}
