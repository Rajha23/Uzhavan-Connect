import {
  UserProfile,
  ProduceListing,
  DemandRequest,
  DemandPool,
  ForecastSignal,
  ReverseAuctionOffer,
  SmartMatchSupplier,
  MicroHub,
  RoutePlan,
  ProducePassport,
  SettlementRecord,
  AppNotification,
  CropRecommendation,
  MarketPriceItem,
  BuyerDemandOpportunity,
  FarmerOfferItem,
  AuditLogEntry,
  SystemUserRecord,
  UserRole,
  Permission,
  WorkflowOrder,
  WorkflowAgreement,
  QualityInspectionData,
  TransportAssignment
} from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  FARMER: [
    'VIEW_DASHBOARD',
    'MARKET_PRICES',
    'DEMAND_FORECAST',
    'CROP_LISTING',
    'SMART_MATCHING',
    'REVERSE_AUCTION',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY'
  ],
  RETAIL_BUYER: [
    'VIEW_DASHBOARD',
    'MARKET_PRICES',
    'DEMAND_FORECAST',
    'CREATE_DEMAND',
    'SMART_MATCHING',
    'REVERSE_AUCTION',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY',
    'REPORTS'
  ],
  FPO_AGGREGATOR: [
    'VIEW_DASHBOARD',
    'MARKET_PRICES',
    'CROP_LISTING',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY'
  ],
  LOGISTICS: [
    'VIEW_DASHBOARD',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY'
  ],
  ADMIN: [
    'VIEW_DASHBOARD',
    'MARKET_PRICES',
    'DEMAND_FORECAST',
    'SMART_MATCHING',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY',
    'USER_MANAGEMENT',
    'REPORTS',
    'AUDIT_LOGS'
  ]
};

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  FARMER: {
    id: 'usr-farmer-01',
    name: 'Rajesh Kumar',
    role: 'FARMER',
    phone: '+91 98401 23456',
    email: 'rajesh.kumar@uzhavanconnect.gov.in',
    location: 'Sunguvarchatram, Kanchipuram, Tamil Nadu',
    village: 'Sunguvarchatram',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    farmSizeAcres: 3.5,
    mainCrops: ['Tomato', 'Green Chilli', 'Capsicum'],
    fpoName: 'GreenHarvest FPO',
    totalListings: 4,
    completedOrders: 28,
    quantitySoldKg: 14200,
    organization: 'GreenHarvest Farmer Collective',
    rating: 4.9,
    avatar: '👨‍🌾'
  },
  RETAIL_BUYER: {
    id: 'usr-buyer-01',
    name: 'Anita Sharma',
    role: 'RETAIL_BUYER',
    phone: '+91 98840 55667',
    email: 'anita.procurement@abcretail.in',
    location: 'Koyambedu, Chennai',
    businessName: 'ABC Retail Stores',
    buyerType: 'Retail/Bulk',
    totalListings: 0,
    completedOrders: 42,
    organization: 'ABC Retail',
    rating: 4.95,
    avatar: '🏬'
  },
  FPO_AGGREGATOR: {
    id: 'usr-fpo-01',
    name: 'Ravi Verma',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 11223',
    email: 'ravi.fpo@uzhavanconnect.gov.in',
    location: 'Villupuram, Tamil Nadu',
    businessName: 'Villupuram Farmer Collective',
    totalListings: 12,
    completedOrders: 56,
    organization: 'Villupuram FPO',
    rating: 4.8,
    avatar: '🌾'
  },
  LOGISTICS: {
    id: 'usr-logistics-01',
    name: 'Sundar Transport',
    role: 'LOGISTICS',
    phone: '+91 96600 22334',
    email: 'dispatch@sundartrans.in',
    location: 'Chennai Hub',
    businessName: 'Sundar Logistics Co.',
    totalListings: 0,
    completedOrders: 145,
    organization: 'Sundar Logistics',
    rating: 4.7,
    avatar: '🚚'
  },
  ADMIN: {
    id: 'usr-ops-01',
    name: 'Tejaswini V. (Ops Lead)',
    role: 'ADMIN',
    phone: '+91 99000 11223',
    email: 'admin.tejas@uzhavanconnect.gov.in',
    location: 'Uzhavan Connect Tech Operations, Chennai',
    organization: 'Uzhavan Connect Core Systems & Logistics',
    rating: 5.0,
    avatar: '⚙️'
  }
};

export const CHENNAI_TOMATO_FORECAST: ForecastSignal = {
  crop: 'Tomato',
  region: 'Chennai Regional Corridor',
  horizonDays: 7,
  currentDemandKg: 8000,
  predictedDemandKg: 8500,
  availableSupplyKg: 6900,
  supplyGapKg: 1600,
  indicativePricePerKg: 26,
  confidenceScore: 82.0,
  trend: 'UP',
  modelVersion: 'v2.4-XGB-Seasonal-ARIMA',
  mae: 4.12,
  rmse: 6.08,
  mape: 5.34,
  insight: 'Tomato demand is expected to increase this week. Consider supplying more tomatoes if suitable for your farm.'
};

export const MARKET_PRICES_DATA: MarketPriceItem[] = [
  {
    id: 'MP-01',
    crop: 'Tomato',
    priceRange: '₹24–₹28/kg',
    minPrice: 24,
    maxPrice: 28,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 8500,
    isDemoData: true
  },
  {
    id: 'MP-02',
    crop: 'Onion',
    priceRange: '₹20–₹24/kg',
    minPrice: 20,
    maxPrice: 24,
    trend: 'STABLE',
    trendText: 'Stable',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 14200,
    isDemoData: true
  },
  {
    id: 'MP-03',
    crop: 'Carrot',
    priceRange: '₹20–₹25/kg',
    minPrice: 20,
    maxPrice: 25,
    trend: 'DOWN',
    trendText: 'Decreasing',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 4100,
    isDemoData: true
  },
  {
    id: 'MP-04',
    crop: 'Green Chilli',
    priceRange: '₹48–₹54/kg',
    minPrice: 48,
    maxPrice: 54,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 2800,
    isDemoData: true
  },
  {
    id: 'MP-05',
    crop: 'Potato',
    priceRange: '₹18–₹22/kg',
    minPrice: 18,
    maxPrice: 22,
    trend: 'STABLE',
    trendText: 'Stable',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 19500,
    isDemoData: true
  },
  {
    id: 'MP-06',
    crop: 'Capsicum',
    priceRange: '₹62–₹70/kg',
    minPrice: 62,
    maxPrice: 70,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Chennai Koyambedu Terminal',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 1800,
    isDemoData: true
  }
];

export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [];

export const FARMER_OFFERS_DATA: FarmerOfferItem[] = [];

export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
  {
    id: 'DEM-TN-001',
    buyerId: 'BUYER-01',
    buyerName: 'ABC Retail Stores',
    buyerType: 'Supermarket',
    crop: 'Tomato',
    variety: 'Sivam Hybrid',
    quantityKg: 3000,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Chennai Distribution Terminal',
    deliveryDate: '2026-09-08',
    deliveryTimeWindow: '05:30 AM - 08:30 AM',
    maxTargetPricePerKg: 32.0,
    status: 'POOLED',
    createdAt: '2026-09-06 08:00'
  },
  {
    id: 'DEM-TN-002',
    buyerId: 'BUYER-02',
    buyerName: 'FreshBazaar Hypermarket',
    buyerType: 'Retailer',
    crop: 'Tomato',
    variety: 'Sivam Hybrid',
    quantityKg: 1500,
    initialQuantityKg: 1500,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Chennai Koyambedu Hub',
    deliveryDate: '2026-09-08',
    deliveryTimeWindow: '06:00 AM - 09:00 AM',
    maxTargetPricePerKg: 30.0,
    status: 'POOLED',
    createdAt: '2026-09-06 09:15'
  },
  {
    id: 'DEM-TN-003',
    buyerId: 'BUYER-03',
    buyerName: 'Southern Spice Hotels & Resorts',
    buyerType: 'Hospitality',
    crop: 'Green Chilli',
    variety: 'G4 Hot',
    quantityKg: 800,
    initialQuantityKg: 800,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Chennai Guindy Central Stores',
    deliveryDate: '2026-09-09',
    deliveryTimeWindow: '06:00 AM - 08:00 AM',
    maxTargetPricePerKg: 46.0,
    status: 'POOLED',
    createdAt: '2026-09-07 11:30'
  }
];

export const INITIAL_DEMAND_POOL: DemandPool = {
  id: 'POOL-CH-3000',
  crop: 'Tomato',
  region: 'Chennai Corridor',
  totalQuantityKg: 4500,
  demandRequests: INITIAL_DEMAND_REQUESTS,
  targetDate: '2026-09-08',
  forecastQuantityKg: 8500,
  buyersCount: 2,
  status: 'POOLED',
  priceBenchmarkPerKg: 31.0
};

export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [
  {
    id: 'LST-001',
    farmerId: 'usr-farmer-01',
    farmerName: 'Murugan Palanisamy',
    crop: 'Tomato',
    variety: 'Pusa Ruby Hybrid',
    quantityKg: 0,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 3000,
    unit: 'kg',
    grade: 'Standard',
    expectedPricePerKg: 26,
    harvestDate: '2026-09-12',
    availabilityDate: '2026-09-12',
    location: 'Sunguvarchatram, Kanchipuram',
    fpoName: 'GreenHarvest FPO',
    status: 'Delivered'
  },
  {
    id: 'LST-002',
    farmerId: 'usr-farmer-02',
    farmerName: 'GreenHarvest FPO',
    crop: 'Tomato',
    variety: 'Nattu Country Breed',
    quantityKg: 1200,
    initialQuantityKg: 1200,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 25,
    harvestDate: '2026-09-10',
    availabilityDate: '2026-09-10',
    location: 'Sriperumbudur Hub',
    fpoName: 'GreenHarvest FPO',
    status: 'Listed'
  },
  {
    id: 'LST-003',
    farmerId: 'usr-farmer-01',
    farmerName: 'Murugan Palanisamy',
    crop: 'Onion',
    variety: 'Bellary Medium',
    quantityKg: 3000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 2000,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 32,
    harvestDate: '2026-09-15',
    availabilityDate: '2026-09-15',
    location: 'Dindigul Cluster Hub',
    fpoName: 'Kaveri Farmers Collective',
    status: 'Listed'
  }
];

export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [];

export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [];

export const CANDIDATE_MICRO_HUBS: MicroHub[] = [
  {
    id: 'HUB-01',
    name: 'Sriperumbudur Rural Agro-Hub',
    region: 'NH-48 Corridor West',
    lat: 12.9712,
    lng: 79.9488,
    capacityTonnes: 25,
    currentLoadTonnes: 6.2,
    coldStorageAvailable: true,
    score: 95.8,
    distanceToProducersKm: 6.5,
    distanceToDemandKm: 34.0,
    roadAccessibilityScore: 98,
    isRecommended: true,
    selectionReason: 'Centroid location adjacent to 4 farmer supply clusters with dual NH-48 6-lane road connectivity, solar cold pre-cooling (4°C), and optimal 42-minute direct arterial transit to Chennai Koyambedu.'
  },
  {
    id: 'HUB-02',
    name: 'Poonamallee Suburban Depot',
    region: 'Chennai Outer Ring Road',
    lat: 13.0489,
    lng: 80.0931,
    capacityTonnes: 18,
    currentLoadTonnes: 14.5,
    coldStorageAvailable: true,
    score: 81.4,
    distanceToProducersKm: 22.0,
    distanceToDemandKm: 16.0,
    roadAccessibilityScore: 86,
    isRecommended: false,
    selectionReason: 'Higher producer transit distance and peak urban morning congestion during 06:00 - 08:30 AM delivery windows.'
  },
  {
    id: 'HUB-03',
    name: 'Tiruvallur Agro Junction',
    region: 'Northern Agricultural Belt',
    lat: 13.1438,
    lng: 79.9079,
    capacityTonnes: 20,
    currentLoadTonnes: 4.8,
    coldStorageAvailable: false,
    score: 74.2,
    distanceToProducersKm: 18.5,
    distanceToDemandKm: 46.0,
    roadAccessibilityScore: 78,
    isRecommended: false,
    selectionReason: 'Lacks temperature-controlled pre-cooling infrastructure; higher perishability degradation risk.'
  }
];

export const OPTIMIZED_ROUTE_PLAN: RoutePlan = {
  id: 'RTE-TN-2026-09-08',
  vehicleId: 'TN-11-AGRI-4402 (EV CoolReefer)',
  vehicleType: 'Tata Ace EV CoolReefer (Active Chilling 6°C)',
  driverName: 'Karthik Subramanian (+91 98402 99881)',
  totalDistanceKm: 68.4,
  distanceSavedKm: 42.6,
  estimatedDuration: '2h 15m (including 3-stage stops)',
  vehicleCapacityKg: 3200,
  totalLoadKg: 3000,
  utilizationPercentage: 93.8,
  co2SavedKg: 58.4,
  estimatedFuelCostRupees: 650, // Electricity recharge vs ₹2,400 diesel
  status: 'SCHEDULED',
  stops: [
    {
      stopOrder: 1,
      name: 'Farm A (Rajesh Kumar, Sunguvarchatram)',
      type: 'FARM_CLUSTER',
      quantityKg: 1000,
      lat: 12.9675,
      lng: 79.9431,
      eta: '04:15 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 2,
      name: 'Farm B (Selvam, Kanchipuram North)',
      type: 'FARM_CLUSTER',
      quantityKg: 1000,
      lat: 12.8342,
      lng: 79.7036,
      eta: '04:45 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 3,
      name: 'Collection Center (Sriperumbudur Rural Hub)',
      type: 'MICRO_HUB',
      quantityKg: 1000,
      lat: 12.9712,
      lng: 79.9488,
      eta: '05:15 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 4,
      name: 'Buyer Delivery (ABC Retail Central Warehouse)',
      type: 'DEMAND_POINT',
      quantityKg: 3000,
      lat: 13.0827,
      lng: 80.2707,
      eta: '06:30 AM',
      status: 'DELIVERED'
    }
  ]
};

export const DEMO_PRODUCE_PASSPORT: ProducePassport = {
  batchId: 'AGP-TOM-2026-001',
  crop: 'Tomato',
  variety: 'Pusa Ruby Hybrid',
  farmerOrFpo: 'GreenHarvest FPO (Farmer: Rajesh Kumar & Members)',
  farmLocation: 'Sunguvarchatram, Kanchipuram, Tamil Nadu',
  harvestDate: '06 Sep 2026',
  quantityKg: 3000,
  qualityGrade: 'Standard',
  currentStatus: 'In Transit',
  inspectionMetrics: {
    sugarBrix: 4.85,
    firmnessKgCm: 3.42,
    pesticideResidueTest: 'PASS - Organic / ND',
    moistureContent: '94.2%'
  },
  collectionHub: 'Sriperumbudur Rural Hub (Bay 2)',
  shipmentId: 'SHP-TN-9082',
  vehicleNumber: 'TN-11-AGRI-4402',
  destination: 'Chennai ABC Retail Central Depot',
  qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-TOM-2026-001',
  timeline: [
    {
      step: 'HARVESTED',
      title: 'Harvested at Source Farm',
      location: 'Sunguvarchatram Fields (Rajesh Kumar)',
      timestamp: '06 Sep 2026, 06:15 AM',
      operator: 'Rajesh Kumar & Harvesters',
      completed: true
    },
    {
      step: 'QUALITY_CHECKED',
      title: 'Quality Checked',
      location: 'Sriperumbudur Mobile Testing Cell',
      timestamp: '06 Sep 2026, 08:30 AM',
      operator: 'Quality Assessor: Dr. R. Malathi',
      completed: true
    },
    {
      step: 'PACKED',
      title: 'Packed in Ventilated Crates',
      location: 'Sriperumbudur Rural Hub',
      timestamp: '06 Sep 2026, 11:00 AM',
      operator: 'GreenHarvest FPO Packing Team',
      completed: true
    },
    {
      step: 'IN_TRANSIT',
      title: 'In Transit via CoolReefer EV',
      location: 'NH-48 Arterial Expressway (En Route)',
      timestamp: '06 Sep 2026, 04:30 PM',
      operator: 'Driver: Karthik S.',
      completed: true
    },
    {
      step: 'DELIVERED',
      title: 'Delivered to Buyer Warehouse',
      location: 'Chennai ABC Retail Depot',
      timestamp: 'Expected 07 Sep 2026, 06:00 AM',
      operator: 'ABC Retail Receiving Team',
      completed: false
    }
  ]
};

export const DEMO_SETTLEMENT: SettlementRecord = {
  id: 'SETTLE-2026-9082',
  orderId: 'ORD-TN-001',
  batchId: 'AGP-TOM-2026-001',
  crop: 'Tomato',
  quantityKg: 3000,
  buyerName: 'ABC Retail Stores',
  farmerOrFpoName: 'Rajesh Kumar & GreenHarvest FPO',
  totalOrderValue: 84000,        // 3,000 kg @ ₹28.00 / kg
  farmerAmount: 75000,           // ₹25.00 / kg to Farmer / FPO (89.2% Net Realization)
  logisticsAmount: 6600,         // ₹2.20 / kg
  platformAmount: 2400,          // ₹0.80 / kg Uzhavan Connect Platform Service Fee
  farmerRealizationPercentage: 89.28,
  traditionalFarmerEarnings: 54000, // Traditional ₹18/kg
  earningsGainPercentage: 38.88,
  status: 'COMPLETED',
  settlementDate: '2026-09-06 07:12 AM',
  utrNumber: 'AGRITXN20260906881920',
  paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
  buyerPaymentReference: 'UPI-ERUPI-9082-CONFIRMED',
  buyerPaymentRecordedAt: '2026-09-06 07:05 AM',
  fpoSettledAt: '2026-09-06 07:10 AM',
  farmerSettledAt: '2026-09-06 07:12 AM',
  farmerBreakdown: [
    {
      farmerId: 'usr-farmer-01',
      farmerName: 'Rajesh Kumar',
      farmerLocation: 'Sunguvarchatram, Kanchipuram',
      produceListingId: 'LST-001',
      contributedQuantityKg: 1000,
      collectedQuantityKg: 1000,
      agreedPricePerKg: 28.0,
      grossAmount: 28000,
      netFarmerAmount: 25000,
      status: 'COMPLETED',
      utrNumber: 'UTR-FARM-908201',
      settledAt: '2026-09-06 07:12 AM',
      bankAccountMasked: 'HDFC **** **** 4819'
    },
    {
      farmerId: 'usr-farmer-02',
      farmerName: 'K. Selvam',
      farmerLocation: 'Kanchipuram North',
      produceListingId: 'LST-001-B',
      contributedQuantityKg: 1000,
      collectedQuantityKg: 1000,
      agreedPricePerKg: 28.0,
      grossAmount: 28000,
      netFarmerAmount: 25000,
      status: 'COMPLETED',
      utrNumber: 'UTR-FARM-908202',
      settledAt: '2026-09-06 07:12 AM',
      bankAccountMasked: 'SBI **** **** 9031'
    },
    {
      farmerId: 'usr-farmer-03',
      farmerName: 'Murugesan P.',
      farmerLocation: 'Sriperumbudur Rural',
      produceListingId: 'LST-001-C',
      contributedQuantityKg: 1000,
      collectedQuantityKg: 1000,
      agreedPricePerKg: 28.0,
      grossAmount: 28000,
      netFarmerAmount: 25000,
      status: 'COMPLETED',
      utrNumber: 'UTR-FARM-908203',
      settledAt: '2026-09-06 07:12 AM',
      bankAccountMasked: 'ICICI **** **** 2291'
    }
  ]
};

export const INITIAL_ORDERS: WorkflowOrder[] = [
  {
    id: 'ORD-TN-001',
    agreementId: 'AGR-TN-001',
    produceListingId: 'LST-001',
    demandRequestId: 'DEM-TN-001',
    batchId: 'AGP-TOM-2026-001',
    farmerId: 'usr-farmer-01',
    farmerName: 'GreenHarvest FPO',
    buyerId: 'BUYER-01',
    buyerName: 'ABC Retail Stores',
    crop: 'Tomato',
    variety: 'Pusa Ruby Hybrid',
    quantityKg: 3000,
    pricePerKg: 28.0,
    totalValue: 84000,
    status: 'Delivered',
    date: '08 Sep 2026',
    deliveryLocation: 'Chennai ABC Retail Depot',
    farmerLocation: 'Sunguvarchatram, Kanchipuram',
    fpoName: 'GreenHarvest FPO',
    qualityGrade: 'Standard',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-01',
        farmerName: 'GreenHarvest FPO (Cluster A)',
        farmerLocation: 'Sunguvarchatram, Kanchipuram',
        produceListingId: 'LST-001',
        contributedQuantityKg: 2000,
        collectedQuantityKg: 2000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '06 Sep 2026, 07:00 AM',
        notes: 'Premium harvest from Block 1'
      },
      {
        farmerId: 'usr-farmer-01-b',
        farmerName: 'Kandasamy V. (GreenHarvest Member)',
        farmerLocation: 'Sriperumbudur Rural North',
        produceListingId: 'LST-001-B',
        contributedQuantityKg: 1000,
        collectedQuantityKg: 1000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '06 Sep 2026, 07:30 AM',
        notes: 'Grade standard red ripe tomatoes'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 3000,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 3000,
    rejectedQuantityKg: 0,
    packingStatus: 'Packed',
    packedQuantityKg: 3000,
    crateCount: 120,
    packageType: 'Ventilated 25kg Agro-Crates with tamper-evident QR seal',
    isReadyForTransport: true,
    transportStatus: 'Delivered',
    inspectionMetrics: {
      sugarBrix: 4.85,
      firmnessKgCm: 3.42,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '94.2%',
      verifiedGrade: 'Standard',
      inspectorName: 'Dr. R. Malathi',
      inspectionDate: '06 Sep 2026',
      hubLocation: 'Sriperumbudur Rural Hub',
      status: 'PASSED',
      acceptedQuantityKg: 3000,
      rejectedQuantityKg: 0
    },
    transportDetails: {
      carrierName: 'Sundar Logistics',
      vehicleNumber: 'TN-11-AGRI-4402',
      driverName: 'Karthik S.',
      driverPhone: '+91 98410 44021',
      vehicleType: 'CoolReefer EV 3.5T',
      assignedAt: '06 Sep 2026, 12:30 PM',
      estimatedArrival: '07 Sep 2026, 06:00 AM'
    },
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Sunguvarchatram Fields', timestamp: '05 Sep 2026, 08:00 AM', operator: 'Rajesh Kumar', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '05 Sep 2026, 11:30 AM', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Produce Collected', location: 'Farm Gate (Sunguvarchatram)', timestamp: '06 Sep 2026, 07:00 AM', operator: 'GreenHarvest FPO Team', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Graded & Tested', location: 'Sriperumbudur Mobile Cell', timestamp: '06 Sep 2026, 08:30 AM', operator: 'Dr. R. Malathi', completed: true },
      { step: 'PACKED', title: 'Crated & QR Generated', location: 'Sriperumbudur Rural Hub', timestamp: '06 Sep 2026, 11:00 AM', operator: 'FPO Packing Unit', completed: true },
      { step: 'IN_TRANSIT', title: 'Transport Dispatched', location: 'NH-48 Expressway', timestamp: '06 Sep 2026, 04:30 PM', operator: 'Karthik S. (Sundar Logistics)', completed: true },
      { step: 'DELIVERED', title: 'Delivered at Buyer Hub', location: 'Chennai ABC Retail Depot', timestamp: '07 Sep 2026, 06:15 AM', operator: 'Receiving Team', completed: true }
    ],
    settlementId: 'SETTLE-2026-9082'
  },
  {
    id: 'ORD-TN-002',
    agreementId: 'AGR-TN-002',
    produceListingId: 'LST-002',
    demandRequestId: 'DEM-TN-002',
    batchId: 'AGP-TOM-2026-002',
    farmerId: 'usr-farmer-02',
    farmerName: 'Rajesh Kumar',
    buyerId: 'BUYER-02',
    buyerName: 'Grand Hospitality Group',
    crop: 'Tomato',
    variety: 'Roma Supreme',
    quantityKg: 1500,
    pricePerKg: 27.0,
    totalValue: 40500,
    status: 'In Transit',
    date: '08 Sep 2026',
    deliveryLocation: 'Grand Hospitality, Chennai',
    farmerLocation: 'Salem Agricultural Belt',
    fpoName: 'Salem Agro Producers Co.',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-02',
        farmerName: 'Rajesh Kumar',
        farmerLocation: 'Salem Agricultural Belt',
        produceListingId: 'LST-002',
        contributedQuantityKg: 1500,
        collectedQuantityKg: 1500,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '07 Sep 2026, 08:00 AM'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 1500,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 1500,
    rejectedQuantityKg: 0,
    packingStatus: 'Packed',
    packedQuantityKg: 1500,
    crateCount: 60,
    packageType: 'Ventilated 25kg Agro-Crates with tamper-evident QR seal',
    isReadyForTransport: true,
    transportStatus: 'In Transit',
    inspectionMetrics: {
      sugarBrix: 5.1,
      firmnessKgCm: 3.8,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '92.5%',
      verifiedGrade: 'Grade A',
      inspectorName: 'S. Shanmugam',
      inspectionDate: '07 Sep 2026',
      hubLocation: 'Salem West Hub',
      status: 'PASSED',
      acceptedQuantityKg: 1500,
      rejectedQuantityKg: 0
    },
    transportDetails: {
      carrierName: 'Sundar Logistics',
      vehicleNumber: 'TN-30-AGRI-1092',
      driverName: 'Ganesan P.',
      driverPhone: '+91 97890 22101',
      vehicleType: 'Electric Reefer Van 2T',
      assignedAt: '07 Sep 2026, 03:00 PM',
      estimatedArrival: '08 Sep 2026, 07:30 AM'
    },
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Salem Farm', timestamp: '06 Sep 2026', operator: 'Rajesh Kumar', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '06 Sep 2026', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Produce Collected', location: 'Salem Farm Gate', timestamp: '07 Sep 2026', operator: 'FPO Field Agent', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Graded', location: 'Salem Agro Hub', timestamp: '07 Sep 2026', operator: 'S. Shanmugam', completed: true },
      { step: 'PACKED', title: 'Crated & QR Generated', location: 'Salem Agro Hub', timestamp: '07 Sep 2026', operator: 'Packing Unit', completed: true },
      { step: 'IN_TRANSIT', title: 'In Transit to Chennai', location: 'Salem-Chennai Highway', timestamp: '08 Sep 2026, 02:00 AM', operator: 'Ganesan P.', completed: true }
    ]
  },
  {
    id: 'ORD-TN-003',
    produceListingId: 'LST-003',
    demandRequestId: 'DEM-TN-003',
    batchId: 'AGP-CAR-2026-003',
    farmerId: 'usr-farmer-03',
    farmerName: 'Murugan FPO',
    buyerId: 'BUYER-03',
    buyerName: 'Metro Cash & Carry',
    crop: 'Carrot',
    variety: 'Kuroda Select',
    quantityKg: 1200,
    pricePerKg: 24.0,
    totalValue: 28800,
    status: 'Packed',
    date: '08 Sep 2026',
    deliveryLocation: 'Metro Cash & Carry, T. Nagar, Chennai',
    farmerLocation: 'Ooty / Nilgiris Foothills',
    fpoName: 'Nilgiri Horticulture FPO',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-03',
        farmerName: 'Murugan FPO',
        farmerLocation: 'Ooty / Nilgiris Foothills',
        produceListingId: 'LST-003',
        contributedQuantityKg: 1200,
        collectedQuantityKg: 1200,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '08 Sep 2026, 06:00 AM'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 1200,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 1200,
    rejectedQuantityKg: 0,
    packingStatus: 'Packed',
    packedQuantityKg: 1200,
    crateCount: 48,
    packageType: 'Ventilated 25kg Agro-Crates with tamper-evident QR seal',
    isReadyForTransport: true,
    transportStatus: 'Ready for Pickup',
    inspectionMetrics: {
      sugarBrix: 8.4,
      firmnessKgCm: 4.6,
      pesticideResidueTest: 'PASS - Standard Compliant',
      moistureContent: '88.0%',
      verifiedGrade: 'Grade A',
      inspectorName: 'V. Ramanathan',
      inspectionDate: '08 Sep 2026',
      hubLocation: 'Coimbatore Agro Junction',
      status: 'PASSED',
      acceptedQuantityKg: 1200,
      rejectedQuantityKg: 0
    },
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Nilgiri Terrace Farm', timestamp: '07 Sep 2026', operator: 'Murugan FPO', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '07 Sep 2026', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Produce Collected', location: 'Nilgiri Cluster Hub', timestamp: '08 Sep 2026, 06:00 AM', operator: 'FPO Logistics Unit', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Graded & Certified', location: 'Nilgiri Mobile Lab', timestamp: '08 Sep 2026, 08:30 AM', operator: 'V. Ramanathan', completed: true },
      { step: 'PACKED', title: 'Crated & Batch QR Generated', location: 'Hub Dispatch Bay 1', timestamp: '08 Sep 2026, 11:00 AM', operator: 'FPO Packing Unit', completed: true }
    ]
  },
  {
    id: 'ORD-TN-004',
    produceListingId: 'LST-004',
    demandRequestId: 'DEM-TN-004',
    batchId: 'AGP-ONI-2026-004',
    farmerId: 'usr-farmer-04',
    farmerName: 'Kaveri Cluster',
    buyerId: 'BUYER-04',
    buyerName: 'Spencer\'s Retail',
    crop: 'Onion',
    variety: 'Nashik Red Hybrid',
    quantityKg: 2000,
    pricePerKg: 22.0,
    totalValue: 44000,
    status: 'Produce Collection Pending',
    date: '08 Sep 2026',
    deliveryLocation: 'Spencer\'s Retail, Vadapalani, Chennai',
    farmerLocation: 'Dindigul Farmer Collective',
    fpoName: 'Kaveri Valley FPO',
    qualityGrade: 'Standard',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-04-a',
        farmerName: 'Kaveri Cluster - Block 1',
        farmerLocation: 'Dindigul Farmer Collective, South Farm',
        produceListingId: 'LST-004',
        contributedQuantityKg: 1200,
        collectedQuantityKg: 0,
        collectionStatus: 'PENDING',
        notes: 'Cured red onions, dry skin'
      },
      {
        farmerId: 'usr-farmer-04-b',
        farmerName: 'M. Selvam (Kaveri Member)',
        farmerLocation: 'Dindigul Rural Belt, North Farm',
        produceListingId: 'LST-004-B',
        contributedQuantityKg: 800,
        collectedQuantityKg: 0,
        collectionStatus: 'PENDING',
        notes: 'Medium bulb size compliant with Spencer specs'
      }
    ],
    collectionStatus: 'Collection Pending',
    collectedQuantityKg: 0,
    remainingCollectionKg: 2000,
    qualityStatus: 'Pending',
    acceptedQuantityKg: 0,
    rejectedQuantityKg: 0,
    packingStatus: 'Packing Pending',
    packedQuantityKg: 0,
    isReadyForTransport: false,
    transportStatus: 'Transport Pending',
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Dindigul Farm Fields', timestamp: '08 Sep 2026, 07:00 AM', operator: 'Kaveri Cluster', completed: true },
      { step: 'MATCHED', title: 'Matched & Order Created', location: 'Uzhavan AI Engine', timestamp: '08 Sep 2026, 09:30 AM', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Awaiting FPO Collection', location: 'Dindigul Farm Gate', timestamp: 'Pending', operator: 'FPO Collection Agent', completed: false }
    ]
  }
];

export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [
  {
    id: 'AGR-TN-001',
    demandRequestId: 'DEM-TN-001',
    produceListingId: 'LST-001',
    farmerId: 'usr-farmer-01',
    farmerName: 'GreenHarvest FPO',
    buyerId: 'BUYER-01',
    buyerName: 'ABC Retail Stores',
    crop: 'Tomato',
    agreedQuantityKg: 3000,
    agreedPricePerKg: 28.0,
    totalAgreedValue: 84000,
    agreementDate: '05 Sep 2026',
    status: 'CONFIRMED'
  },
  {
    id: 'AGR-TN-002',
    demandRequestId: 'DEM-TN-002',
    produceListingId: 'LST-002',
    farmerId: 'usr-farmer-02',
    farmerName: 'Rajesh Kumar',
    buyerId: 'BUYER-02',
    buyerName: 'Grand Hospitality Group',
    crop: 'Tomato',
    agreedQuantityKg: 1500,
    agreedPricePerKg: 27.0,
    totalAgreedValue: 40500,
    agreementDate: '06 Sep 2026',
    status: 'CONFIRMED'
  }
];

export const INITIAL_PASSPORTS: ProducePassport[] = [
  DEMO_PRODUCE_PASSPORT,
  {
    batchId: 'AGP-TOM-2026-002',
    crop: 'Tomato',
    variety: 'Roma Supreme',
    farmerOrFpo: 'Rajesh Kumar & Salem Agro Producers',
    farmLocation: 'Salem Agricultural Belt, Tamil Nadu',
    harvestDate: '06 Sep 2026',
    quantityKg: 1500,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 5.1,
      firmnessKgCm: 3.8,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '92.5%'
    },
    collectionHub: 'Salem West Hub (Bay 1)',
    shipmentId: 'SHP-TN-9083',
    vehicleNumber: 'TN-30-AGRI-1092',
    destination: 'Grand Hospitality Central Commissary, Chennai',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-TOM-2026-002',
    currentStatus: 'In Transit',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested at Source Farm', location: 'Salem Farm (Rajesh Kumar)', timestamp: '06 Sep 2026, 06:00 AM', operator: 'Rajesh Kumar', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Checked & Certified', location: 'Salem Agro Hub', timestamp: '07 Sep 2026, 09:15 AM', operator: 'S. Shanmugam', completed: true },
      { step: 'PACKED', title: 'Crated & Barcode Sealed', location: 'Salem Agro Hub', timestamp: '07 Sep 2026, 12:00 PM', operator: 'FPO Packing Unit', completed: true },
      { step: 'IN_TRANSIT', title: 'En Route via Reefer EV', location: 'NH-44 / NH-48 Express Corridor', timestamp: '08 Sep 2026, 02:00 AM', operator: 'Driver: Ganesan P.', completed: true },
      { step: 'DELIVERED', title: 'Awaiting Arrival at Buyer Depot', location: 'Grand Hospitality, Chennai', timestamp: 'ETA 08 Sep 2026, 07:30 AM', operator: 'Receiving Officer', completed: false }
    ]
  },
  {
    batchId: 'AGP-CAR-2026-003',
    crop: 'Carrot',
    variety: 'Kuroda Select',
    farmerOrFpo: 'Murugan FPO & Nilgiri Farmers',
    farmLocation: 'Nilgiri Foothills, Tamil Nadu',
    harvestDate: '07 Sep 2026',
    quantityKg: 1200,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 8.4,
      firmnessKgCm: 4.6,
      pesticideResidueTest: 'PASS - Standard Compliant',
      moistureContent: '88.0%'
    },
    collectionHub: 'Coimbatore Agro Junction',
    shipmentId: 'SHP-TN-9084',
    vehicleNumber: 'TN-38-AGRI-7721',
    destination: 'Metro Cash & Carry, T. Nagar, Chennai',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-CAR-2026-003',
    currentStatus: 'Packed',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested at Nilgiri Farm', location: 'Ooty Terrace', timestamp: '07 Sep 2026', operator: 'Murugan FPO', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Certified', location: 'Nilgiri Mobile Lab', timestamp: '08 Sep 2026, 08:30 AM', operator: 'V. Ramanathan', completed: true },
      { step: 'PACKED', title: 'Packed in Ventilated Crates', location: 'Hub Dispatch Bay 1', timestamp: '08 Sep 2026, 11:00 AM', operator: 'Packing Team', completed: true },
      { step: 'IN_TRANSIT', title: 'Awaiting Transport Assignment', location: 'Hub Bay 1', timestamp: 'Scheduled', operator: 'Pending Logistics', completed: false },
      { step: 'DELIVERED', title: 'Pending Delivery', location: 'Metro Cash & Carry', timestamp: 'Scheduled', operator: 'Pending', completed: false }
    ]
  },
  {
    batchId: 'AGP-ONI-2026-004',
    crop: 'Onion',
    variety: 'Nashik Red Hybrid',
    farmerOrFpo: 'Kaveri Valley FPO & Cluster Farmers',
    farmLocation: 'Dindigul Valley, Tamil Nadu',
    harvestDate: '08 Sep 2026',
    quantityKg: 2000,
    qualityGrade: 'Standard',
    inspectionMetrics: {
      sugarBrix: 6.2,
      firmnessKgCm: 4.1,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '85.5%'
    },
    collectionHub: 'Dindigul Central Agro-Hub',
    shipmentId: 'SHP-TN-9085',
    vehicleNumber: 'Pending Allocation',
    destination: 'Spencer\'s Retail, Vadapalani, Chennai',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-ONI-2026-004',
    currentStatus: 'Harvested',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested at Farm Gate', location: 'Dindigul Farm Fields', timestamp: '08 Sep 2026, 07:00 AM', operator: 'Kaveri Cluster Farmers', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Pending FPO Inspection', location: 'Dindigul Farm Gate', timestamp: 'Pending', operator: 'FPO Quality Inspector', completed: false },
      { step: 'PACKED', title: 'Pending Crating', location: 'Hub', timestamp: 'Pending', operator: 'Packing Unit', completed: false },
      { step: 'IN_TRANSIT', title: 'Pending Dispatch', location: 'Expressway', timestamp: 'Pending', operator: 'Carrier', completed: false },
      { step: 'DELIVERED', title: 'Pending Arrival', location: 'Spencer\'s Retail', timestamp: 'Pending', operator: 'Buyer Receiving', completed: false }
    ]
  }
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  DEMO_SETTLEMENT,
  {
    id: 'SETTLE-2026-9083',
    orderId: 'ORD-TN-002',
    batchId: 'AGP-TOM-2026-002',
    crop: 'Tomato',
    quantityKg: 1500,
    buyerName: 'Grand Hospitality Group',
    farmerOrFpoName: 'Rajesh Kumar (Salem Agro)',
    totalOrderValue: 40500,
    farmerAmount: 36000,
    logisticsAmount: 3300,
    platformAmount: 1200,
    farmerRealizationPercentage: 88.88,
    traditionalFarmerEarnings: 27000,
    earningsGainPercentage: 33.33,
    status: 'Payment Pending',
    settlementDate: 'Scheduled Upon Delivery Acceptance',
    utrNumber: 'ESCROW_LOCKED_TXN9083',
    paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
    farmerBreakdown: [
      {
        farmerId: 'usr-farmer-01',
        farmerName: 'Rajesh Kumar',
        farmerLocation: 'Salem Agro Cluster',
        produceListingId: 'LST-002',
        contributedQuantityKg: 1500,
        collectedQuantityKg: 1500,
        agreedPricePerKg: 27.0,
        grossAmount: 40500,
        netFarmerAmount: 36000,
        status: 'PENDING',
        bankAccountMasked: 'Canara **** **** 7712'
      }
    ]
  }
];

export const CROP_RECOMMENDATIONS: CropRecommendation[] = [
  {
    crop: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    suitabilityScore: 92,
    demandTrend: 'HIGH',
    predictedDemandKg: 8500,
    expectedPricePerKg: '₹24–₹28/kg',
    growthDurationDays: 75,
    waterRequirement: 'MEDIUM',
    nearbyBuyerDemand: 'High (Chennai terminal & ABC Retail deficit)',
    season: 'All-Season',
    advice: 'Demand is expected to increase this week. Consider supplying more tomatoes if suitable for your farm.',
    keyBuyersNearby: ['ABC Retail', 'FreshBazaar', 'Grand Hospitality'],
    aiConfidence: 82
  },
  {
    crop: 'Carrot',
    scientificName: 'Daucus carota',
    suitabilityScore: 78,
    demandTrend: 'MEDIUM',
    predictedDemandKg: 4200,
    expectedPricePerKg: '₹20–₹25/kg',
    growthDurationDays: 90,
    waterRequirement: 'LOW',
    nearbyBuyerDemand: 'Moderate (Steady local consumer demand)',
    season: 'Rabi',
    advice: 'Steady market prices expected. Suitable for cool sandy loam soils.',
    keyBuyersNearby: ['Koyambedu Wholesalers', 'Consumer Coop'],
    aiConfidence: 74
  },
  {
    crop: 'Green Chilli',
    scientificName: 'Capsicum annuum',
    suitabilityScore: 88,
    demandTrend: 'HIGH',
    predictedDemandKg: 3200,
    expectedPricePerKg: '₹48–₹54/kg',
    growthDurationDays: 60,
    waterRequirement: 'LOW',
    nearbyBuyerDemand: 'High (Spice processors & retail chains)',
    season: 'Kharif',
    advice: 'High price stability and strong heat tolerance.',
    keyBuyersNearby: ['Aachi Spices Agro', 'Metro Cash & Carry'],
    aiConfidence: 85
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const AUDIT_LOGS_DATA: AuditLogEntry[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-09-05 13:20:15',
    userName: 'Rajesh Kumar',
    userRole: 'FARMER',
    action: 'PUBLISH_CROP_LISTING',
    resource: 'Tomato (3,000 kg @ ₹26/kg)',
    ipAddress: '10.167.41.70',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-09-05 13:14:02',
    userName: 'Anita Sharma',
    userRole: 'RETAIL_BUYER',
    action: 'CREATE_DEMAND',
    resource: 'Tomato Demand (3,000 kg @ ₹28/kg)',
    ipAddress: '182.74.12.9',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-09-05 12:45:10',
    userName: 'GreenHarvest FPO',
    userRole: 'ADMIN',
    action: 'ACCEPT_AUCTION_BID',
    resource: 'Lot AUC-CH-TOM-3000 (3,000 kg)',
    ipAddress: '103.21.124.8',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-09-05 11:30:22',
    userName: 'Karthik S.',
    userRole: 'ADMIN',
    action: 'OPTIMIZE_ROUTE',
    resource: 'Route RTE-TN-2026 (4 Stops)',
    ipAddress: '49.207.180.4',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-09-05 10:15:00',
    userName: 'Dr. A. Swaminathan',
    userRole: 'ADMIN',
    action: 'GENERATE_IMPACT_REPORT',
    resource: ' Evaluation Report Q3',
    ipAddress: '164.100.24.11',
    status: 'SUCCESS'
  }
];

export const SYSTEM_USERS_DATA: SystemUserRecord[] = [
  {
    id: 'usr-farmer-01',
    name: 'Rajesh Kumar',
    role: 'FARMER',
    phone: '+91 98401 23456',
    email: 'rajesh.kumar@uzhavanconnect.gov.in',
    location: 'Sunguvarchatram, Kanchipuram',
    status: 'ACTIVE',
    joinedDate: '12 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-buyer-01',
    name: 'Anita Sharma',
    role: 'RETAIL_BUYER',
    phone: '+91 98840 55667',
    email: 'anita.procurement@abcretail.in',
    location: 'Koyambedu, Chennai',
    status: 'ACTIVE',
    joinedDate: '18 Feb 2026',
    permissions: ROLE_PERMISSIONS.RETAIL_BUYER
  },
  {
    id: 'usr-ops-01',
    name: 'Tejaswini V. (Ops Lead)',
    role: 'ADMIN',
    phone: '+91 99000 11223',
    email: 'admin.tejas@uzhavanconnect.gov.in',
    location: 'Chennai Operations Center',
    status: 'ACTIVE',
    joinedDate: '01 Jan 2026',
    permissions: ROLE_PERMISSIONS.ADMIN
  }
];

export const MIDDLEMAN_SIMULATOR_DATA = {
  traditional: {
    title: 'Traditional Supply Chain',
    farmerReceives: 18,
    intermediaryTake: 22,
    buyerPays: 40,
    postHarvestLossPercentage: 22,
    flow: [
      { role: 'Farmer Farmgate Realization', amount: 18, percentage: 45, note: 'Gross price before post-harvest spoilage' },
      { role: 'Village Level Aggregator / Dalal', amount: 3.5, percentage: 8.75, note: 'First-mile unorganized agent margin' },
      { role: 'APMC Mandi Commission Agent (Arhtiya)', amount: 5.0, percentage: 12.5, note: 'Auction house handling & unregulated cuts' },
      { role: 'Secondary Regional Wholesaler', amount: 4.5, percentage: 11.25, note: 'Inter-district transport & speculative markup' },
      { role: 'Uncoordinated Multi-Leg Logistics', amount: 4.0, percentage: 10, note: 'Inefficient routing & high wastage transit' },
      { role: 'Urban Retailer / Terminal Vendor', amount: 5.0, percentage: 12.5, note: 'Final consumer distribution markup' }
    ]
  },
  uzhavanconnect: {
    title: 'Uzhavan Connect Coordinated Chain',
    farmerReceives: 25,
    logisticsAndPlatform: 7,
    buyerPays: 32,
    postHarvestLossPercentage: 3.8,
    flow: [
      { role: 'Farmer Direct Farmgate Payout', amount: 25, percentage: 78.1, note: '+38.8% extra earnings directly into bank via escrow' },
      { role: 'Quality Assay & Standardized Grading', amount: 1.5, percentage: 4.7, note: 'Certified optical inspection & digital passport' },
      { role: 'VRP Multi-Stop Optimized Cold Logistics', amount: 4.0, percentage: 12.5, note: 'Optimized centroid route (42.6 km saved)' },
      { role: 'Uzhavan Connect Tech & Escrow Settlement', amount: 1.5, percentage: 4.7, note: 'AI demand engine & real-time smart matching' }
    ]
  }
};

export const SIH_EVALUATION_KPIS = [
  { label: 'Farmer Net Realization', traditional: '₹18.00 / kg (45%)', uzhavanconnect: '₹25.00 / kg (78%–89%)', change: '+38.8% to +71% Extra Earnings', positive: true },
  { label: 'Consumer / Buyer Landed Price', traditional: '₹40.00 / kg', uzhavanconnect: '₹32.00 / kg', change: '-20% Lower Cost', positive: true },
  { label: 'Post-Harvest Wastage', traditional: '22.4%', uzhavanconnect: '3.8%', change: '-83% Food Saved', positive: true },
  { label: 'Transport Route Distance', traditional: '111.0 km', uzhavanconnect: '68.4 km', change: '42.6 km Saved', positive: true },
  { label: 'Vehicle Fleet Utilization', traditional: '44.0%', uzhavanconnect: '93.8%', change: '+113% Capacity Full', positive: true },
  { label: 'Matching & Fulfillment Time', traditional: '48 – 72 hrs', uzhavanconnect: '4.2 hrs', change: '10x Faster', positive: true },
  { label: 'Forecast Accuracy (MAPE)', traditional: 'Unforecasted (Blind)', uzhavanconnect: '5.34% Error', change: '94.6% Accuracy', positive: true }
];
