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
  NewsArticle
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
    'TRACEABILITY',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW'
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
    'REPORTS',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW'
  ],
  BULK_BUYER: [
    'VIEW_DASHBOARD',
    'CREATE_DEMAND',
    'SMART_MATCHING',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY',
    'REPORTS',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW'
  ],
  FPO_AGGREGATOR: [
    'VIEW_DASHBOARD',
    'MARKET_PRICES',
    'CROP_LISTING',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW',
    'FEEDBACK_INTELLIGENCE'
  ],
  LOGISTICS: [
    'VIEW_DASHBOARD',
    'ORDERS',
    'LOGISTICS',
    'TRACEABILITY',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW',
    'FEEDBACK_INTELLIGENCE'
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
    'ROLE_MANAGEMENT',
    'REPORTS',
    'AUDIT_LOGS',
    'FEEDBACK_SUBMIT',
    'FEEDBACK_VIEW',
    'COMPLAINTS_SUBMIT',
    'COMPLAINTS_VIEW',
    'COMPLAINTS_MANAGE',
    'FEEDBACK_INTELLIGENCE'
  ]
};

// ==========================================
// 1. DEMO USERS (Authentic Tamil Nadu Profiles)
// ==========================================
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  FARMER: {
    id: 'usr-farmer-01',
    name: 'Subramaniam Ramasamy',
    role: 'FARMER',
    phone: '+91 94421 88301',
    email: 'subramaniam.farmer@uzhavanconnect.gov.in',
    location: 'Chinnasalem, Kallakurichi, Tamil Nadu',
    village: 'Chinnasalem',
    district: 'Kallakurichi',
    state: 'Tamil Nadu',
    farmSizeAcres: 4.5,
    mainCrops: ['Tomato', 'Groundnut', 'Maize'],
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    totalListings: 3,
    completedOrders: 24,
    quantitySoldKg: 18500,
    organization: 'Kallakurichi Pasumai Farmers Collective',
    rating: 4.92,
    avatar: '👨‍🌾'
  },
  RETAIL_BUYER: {
    id: 'usr-buyer-01',
    name: 'Anita Sharma',
    role: 'RETAIL_BUYER',
    phone: '+91 98840 55667',
    email: 'anita.procurement@abcretail.in',
    location: 'Koyambedu Wholesale Terminal, Chennai',
    businessName: 'ABC Retail Stores & Consumer Coops',
    buyerType: 'Supermarket',
    totalListings: 0,
    completedOrders: 42,
    organization: 'ABC Retail Stores',
    rating: 4.95,
    avatar: '🏬'
  },
  BULK_BUYER: {
    id: 'usr-bulkbuyer-01',
    name: 'Vikramaditya Singhania',
    role: 'BULK_BUYER',
    phone: '+91 98402 88990',
    email: 'vikram.procurement@metroagri.in',
    location: 'Ambattur Food Processing Terminal, Chennai',
    businessName: 'WayCool Agri Processors & Distribution Ltd.',
    buyerType: 'Food Processor & Institutional Wholesale Chain',
    totalListings: 0,
    completedOrders: 38,
    organization: 'WayCool Agri Processors',
    rating: 4.96,
    avatar: '🏭'
  },
  FPO_AGGREGATOR: {
    id: 'usr-fpo-01',
    name: 'Ravi Verma',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 11223',
    email: 'ravi.fpo@uzhavanconnect.gov.in',
    location: 'Chinnasalem Hub, Kallakurichi, Tamil Nadu',
    businessName: 'Kallakurichi Pasumai Farmers Producer Co.',
    totalListings: 18,
    completedOrders: 64,
    organization: 'Kallakurichi Pasumai FPO',
    rating: 4.88,
    avatar: '🌾'
  },
  LOGISTICS: {
    id: 'usr-logistics-01',
    name: 'Sundar Transport & Cold Chain',
    role: 'LOGISTICS',
    phone: '+91 96600 22334',
    email: 'dispatch@sundartrans.in',
    location: 'Salem - Chennai Expressway Hub',
    businessName: 'Sundar Logistics & Cold-Chain Co.',
    totalListings: 0,
    completedOrders: 152,
    organization: 'Sundar Logistics',
    rating: 4.85,
    avatar: '🚚'
  },
  ADMIN: {
    id: 'usr-ops-01',
    name: 'Tejaswini V. (Ops Lead)',
    role: 'ADMIN',
    phone: '+91 99000 11223',
    email: 'admin.tejas@uzhavanconnect.gov.in',
    location: 'Uzhavan Connect Command & Governance Center, Chennai',
    organization: 'Uzhavan Connect Central Operations',
    rating: 5.0,
    avatar: '⚙️'
  }
};

// ==========================================
// 2. TAMIL NADU FPO REGISTRY (3-5 FPOs)
// ==========================================
export const MOCK_FPOS = [
  {
    fpoId: 'fpo-tn-01',
    name: 'Kallakurichi Pasumai Farmers Producer Co.',
    district: 'Kallakurichi',
    memberCount: 480,
    cropsHandled: ['Tomato', 'Groundnut', 'Maize', 'Paddy'],
    collectionCenter: 'Chinnasalem Agro Consolidation Hub',
    status: 'ACTIVE'
  },
  {
    fpoId: 'fpo-tn-02',
    name: 'Salem Kongu Agri Producers Collective',
    district: 'Salem',
    memberCount: 620,
    cropsHandled: ['Tomato', 'Onion', 'Turmeric', 'Brinjal'],
    collectionCenter: 'Valapadi Cold Storage Depot',
    status: 'ACTIVE'
  },
  {
    fpoId: 'fpo-tn-03',
    name: 'Cauvery Delta Agro Federation',
    district: 'Thanjavur',
    memberCount: 750,
    cropsHandled: ['Paddy', 'Banana', 'Coconut', 'Black Gram'],
    collectionCenter: 'Thiruvaiyaru Grain & Vegetable Hub',
    status: 'ACTIVE'
  },
  {
    fpoId: 'fpo-tn-04',
    name: 'Anamalai Horticulture Farmers Co.',
    district: 'Coimbatore',
    memberCount: 530,
    cropsHandled: ['Coconut', 'Banana', 'Tomato', 'Green Chilli'],
    collectionCenter: 'Pollachi Agro Logistics Center',
    status: 'ACTIVE'
  }
];

// ==========================================
// 3. TAMIL NADU FARMERS (12-20 Farmers)
// ==========================================
export const MOCK_FARMERS = [
  {
    farmerId: 'usr-farmer-01',
    name: 'Subramaniam Ramasamy',
    village: 'Chinnasalem',
    district: 'Kallakurichi',
    crops: ['Tomato', 'Groundnut', 'Maize'],
    availableQtyKg: 4800,
    expectedHarvestDate: '2026-09-18',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    phone: '+91 94421 88301',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-02',
    name: 'K. Velusamy',
    village: 'Pennagaram',
    district: 'Villupuram',
    crops: ['Tomato', 'Brinjal'],
    availableQtyKg: 2000,
    expectedHarvestDate: '2026-09-19',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    phone: '+91 94422 10452',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-03',
    name: 'Meenakshi Sundaram',
    village: 'Valapadi',
    district: 'Salem',
    crops: ['Tomato', 'Turmeric', 'Onion'],
    availableQtyKg: 3500,
    expectedHarvestDate: '2026-09-20',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    phone: '+91 94423 77819',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-04',
    name: 'Thangavel Murugan',
    village: 'Attur',
    district: 'Salem',
    crops: ['Onion', 'Chilli'],
    availableQtyKg: 4000,
    expectedHarvestDate: '2026-09-21',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    phone: '+91 94424 99120',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-05',
    name: 'Arumugam Natarajan',
    village: 'Bhavani',
    district: 'Erode',
    crops: ['Turmeric', 'Banana'],
    availableQtyKg: 2500,
    expectedHarvestDate: '2026-09-22',
    qualityGrade: 'Premium',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    phone: '+91 94425 33410',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-06',
    name: 'Senthil Kumar Palani',
    village: 'Rasipuram',
    district: 'Namakkal',
    crops: ['Maize', 'Tomato'],
    availableQtyKg: 5000,
    expectedHarvestDate: '2026-09-23',
    qualityGrade: 'Standard',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    phone: '+91 94426 44521',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-07',
    name: 'Govindasamy Radhakrishnan',
    village: 'Musiri',
    district: 'Tiruchirappalli',
    crops: ['Banana', 'Paddy'],
    availableQtyKg: 3200,
    expectedHarvestDate: '2026-09-17',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94427 66732',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-08',
    name: 'Marimuthu Karuppan',
    village: 'Lalgudi',
    district: 'Tiruchirappalli',
    crops: ['Onion', 'Paddy'],
    availableQtyKg: 2800,
    expectedHarvestDate: '2026-09-18',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94428 11843',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-09',
    name: 'Balasubramanian Sethuraman',
    village: 'Thiruvaiyaru',
    district: 'Thanjavur',
    crops: ['Paddy', 'Coconut'],
    availableQtyKg: 6000,
    expectedHarvestDate: '2026-09-25',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94429 22954',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-10',
    name: 'Kalyanasundaram G.',
    village: 'Kumbakonam',
    district: 'Thanjavur',
    crops: ['Banana', 'Brinjal'],
    availableQtyKg: 1800,
    expectedHarvestDate: '2026-09-20',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94430 33065',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-11',
    name: 'Dhandapani Muthusamy',
    village: 'Pollachi',
    district: 'Coimbatore',
    crops: ['Coconut', 'Tomato'],
    availableQtyKg: 4000,
    expectedHarvestDate: '2026-09-24',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-04',
    fpoName: 'Anamalai Horticulture Farmers Co.',
    phone: '+91 94431 44176',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-12',
    name: 'Vijayakumar Nachimuthu',
    village: 'Annur',
    district: 'Coimbatore',
    crops: ['Tomato', 'Chilli'],
    availableQtyKg: 2400,
    expectedHarvestDate: '2026-09-19',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-04',
    fpoName: 'Anamalai Horticulture Farmers Co.',
    phone: '+91 94432 55287',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-13',
    name: 'Chellappa Thevar',
    village: 'Melur',
    district: 'Madurai',
    crops: ['Chilli', 'Brinjal', 'Paddy'],
    availableQtyKg: 1500,
    expectedHarvestDate: '2026-09-22',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94433 66398',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-14',
    name: 'Palanivel Chinnasamy',
    village: 'Usilampatti',
    district: 'Madurai',
    crops: ['Groundnut', 'Maize'],
    availableQtyKg: 3500,
    expectedHarvestDate: '2026-09-26',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    phone: '+91 94434 77409',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-15',
    name: 'Rajendran Vaithilingam',
    village: 'Panruti',
    district: 'Cuddalore',
    crops: ['Groundnut', 'Coconut'],
    availableQtyKg: 2200,
    expectedHarvestDate: '2026-09-24',
    qualityGrade: 'Grade A',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    phone: '+91 94435 88510',
    status: 'ACTIVE'
  },
  {
    farmerId: 'usr-farmer-16',
    name: 'Sundaramoorthy K.',
    village: 'Vridhachalam',
    district: 'Cuddalore',
    crops: ['Maize', 'Paddy'],
    availableQtyKg: 3000,
    expectedHarvestDate: '2026-09-27',
    qualityGrade: 'Standard',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    phone: '+91 94436 99621',
    status: 'ACTIVE'
  }
];

// ==========================================
// 4. DEMAND FORECAST
// ==========================================
export const CHENNAI_TOMATO_FORECAST: ForecastSignal = {
  crop: 'Tomato',
  region: 'Chennai - Salem - Kallakurichi Corridor',
  horizonDays: 7,
  currentDemandKg: 12500,
  predictedDemandKg: 14200,
  availableSupplyKg: 11800,
  supplyGapKg: 2400,
  indicativePricePerKg: 28,
  confidenceScore: 88.5,
  trend: 'UP',
  modelVersion: 'v2.4-XGB-Seasonal-ARIMA',
  mae: 3.42,
  rmse: 5.18,
  mape: 4.82,
  insight: 'Tomato institutional demand is projected +14% higher across Chennai and Coimbatore retail chains this week. Optimal harvest window: Sep 16–20 for Grade A farmgate realization.'
};

// ==========================================
// 5. REGIONAL MANDI MARKET PRICES
// ==========================================
export const MARKET_PRICES_DATA: MarketPriceItem[] = [
  {
    id: 'MP-01',
    crop: 'Tomato',
    priceRange: '₹26–₹30/kg',
    minPrice: 26,
    maxPrice: 30,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Koyambedu Wholesale Terminal, Chennai',
    updatedTime: 'Today, 06:00 AM',
    volumeTodayKg: 14500,
    isDemoData: true
  },
  {
    id: 'MP-02',
    crop: 'Onion',
    priceRange: '₹28–₹34/kg',
    minPrice: 28,
    maxPrice: 34,
    trend: 'STABLE',
    trendText: 'Stable',
    location: 'Koyambedu Wholesale Terminal, Chennai',
    updatedTime: 'Today, 06:00 AM',
    volumeTodayKg: 18200,
    isDemoData: true
  },
  {
    id: 'MP-03',
    crop: 'Turmeric',
    priceRange: '₹85–₹94/kg',
    minPrice: 85,
    maxPrice: 94,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Erode Agricultural Regulated Market',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 9400,
    isDemoData: true
  },
  {
    id: 'MP-04',
    crop: 'Green Chilli',
    priceRange: '₹50–₹58/kg',
    minPrice: 50,
    maxPrice: 58,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Madurai Mattuthavani Central Market',
    updatedTime: 'Today, 06:15 AM',
    volumeTodayKg: 4200,
    isDemoData: true
  },
  {
    id: 'MP-05',
    crop: 'Banana (Grand Naine)',
    priceRange: '₹24–₹28/kg',
    minPrice: 24,
    maxPrice: 28,
    trend: 'STABLE',
    trendText: 'Stable',
    location: 'Tiruchirappalli Gandhi Market',
    updatedTime: 'Today, 06:30 AM',
    volumeTodayKg: 12000,
    isDemoData: true
  },
  {
    id: 'MP-06',
    crop: 'Groundnut (Pods)',
    priceRange: '₹62–₹70/kg',
    minPrice: 62,
    maxPrice: 70,
    trend: 'UP',
    trendText: 'Increasing',
    location: 'Vridhachalam Regulated Market, Cuddalore',
    updatedTime: 'Today, 07:00 AM',
    volumeTodayKg: 8500,
    isDemoData: true
  }
];

export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [
  {
    id: 'BDO-TOMATO-01',
    buyerName: 'Reliance Fresh',
    crop: 'Tomato',
    requiredQuantityKg: 5000,
    maxPricePerKg: 40,
    location: 'Chennai',
    requiredDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    quality: 'Grade A'
  }
];

export const FARMER_OFFERS_DATA: FarmerOfferItem[] = [];

// ==========================================
// 6. BUYER DEMANDS (Active & Varied States)
// ==========================================
export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
  {
    id: 'DR-TOMATO-01',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    buyerType: 'Supermarket',
    crop: 'Tomato',
    variety: 'Hybrid',
    quantityKg: 5000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 0,
    qualityRequirement: 'Grade A',
    location: 'Chennai',
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    deliveryTimeWindow: 'Morning (6 AM - 10 AM)',
    maxTargetPricePerKg: 40,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_DEMAND_POOL: DemandPool = {
  id: 'POOL-TOMATO-01',
  crop: 'Tomato',
  region: 'Tamil Nadu',
  totalQuantityKg: 5000,
  demandRequests: [
    {
      id: 'DR-TOMATO-01',
      buyerId: 'usr_retail_1',
      buyerName: 'Reliance Fresh',
      buyerType: 'Supermarket',
      crop: 'Tomato',
      quantityKg: 5000,
      qualityRequirement: 'Grade A',
      location: 'Chennai',
      deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      deliveryTimeWindow: 'Morning',
      maxTargetPricePerKg: 40,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    }
  ],
  targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  forecastQuantityKg: 5000,
  buyersCount: 1,
  status: 'FORMING',
  priceBenchmarkPerKg: 40
};

export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [
  {
    id: 'PL-TOMATO-01',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramu',
    crop: 'Tomato',
    variety: 'Hybrid',
    quantityKg: 5000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 0,
    grade: 'Grade A',
    expectedPricePerKg: 30,
    harvestDate: new Date().toISOString().split('T')[0],
    availabilityDate: new Date().toISOString().split('T')[0],
    location: 'Madurai',
    fpoId: 'fpo_1',
    fpoName: 'GreenHarvest FPO',
    status: 'AVAILABLE'
  }
];

export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [];

export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [
  {
    id: 'SMS-TOMATO-01',
    supplierName: 'GreenHarvest FPO',
    supplierType: 'FPO',
    crop: 'Tomato',
    availableQtyKg: 5000,
    allocatedQtyKg: 5000,
    distanceKm: 250,
    offeredPricePerKg: 35,
    qualityGrade: 'Grade A',
    reliabilityScore: 98,
    capacityScore: 100,
    qualityScore: 95,
    priceScore: 90,
    distanceScore: 85,
    totalMatchScore: 95,
    status: 'RECOMMENDED',
    hubProximity: 'High'
  }
];

export const CANDIDATE_MICRO_HUBS: MicroHub[] = [];

export const OPTIMIZED_ROUTE_PLAN: RoutePlan = {
  id: 'RTE-TN-2026-09-15',
  vehicleId: 'TN-15-AGRI-5510 (CoolReefer EV)',
  vehicleType: 'Tata Ace EV CoolReefer (Active Chilling 4°C)',
  driverName: 'Karthik Subramanian (+91 98410 44021)',
  totalDistanceKm: 74.2,
  distanceSavedKm: 48.6,
  estimatedDuration: '2h 25m (including multi-stop consolidation)',
  vehicleCapacityKg: 5500,
  totalLoadKg: 5000,
  utilizationPercentage: 90.9,
  co2SavedKg: 64.2,
  estimatedFuelCostRupees: 720,
  status: 'SCHEDULED',
  stops: [
    {
      stopOrder: 1,
      name: 'Farm Gate 1 (Subramaniam Ramasamy, Chinnasalem)',
      type: 'FARM_CLUSTER',
      quantityKg: 1200,
      lat: 11.6421,
      lng: 78.8752,
      eta: '04:00 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 2,
      name: 'Farm Gate 2 (K. Velusamy, Pennagaram)',
      type: 'FARM_CLUSTER',
      quantityKg: 1000,
      lat: 11.7104,
      lng: 79.1205,
      eta: '04:35 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 3,
      name: 'Chinnasalem Agro Consolidation Hub (Aggregation & QC Inspection)',
      type: 'MICRO_HUB',
      quantityKg: 2800,
      lat: 11.6421,
      lng: 78.8752,
      eta: '05:15 AM',
      status: 'LOADED'
    },
    {
      stopOrder: 4,
      name: 'WayCool Food Processing Terminal (Ambattur, Chennai)',
      type: 'DEMAND_POINT',
      quantityKg: 5000,
      lat: 13.1143,
      lng: 80.1548,
      eta: '07:15 AM',
      status: 'PENDING'
    }
  ]
};

// ==========================================
// 11. PRODUCE PASSPORT
// ==========================================
export const DEMO_PRODUCE_PASSPORT: ProducePassport = {
  batchId: 'AGP-TOM-2026-101',
  crop: 'Tomato',
  variety: 'Sivam Hybrid (Firm Processing)',
  farmerOrFpo: 'Kallakurichi Pasumai FPO (Subramaniam Ramasamy & Members)',
  farmLocation: 'Chinnasalem, Kallakurichi, Tamil Nadu',
  harvestDate: '14 Sep 2026',
  quantityKg: 5000,
  qualityGrade: 'Grade A',
  currentStatus: 'In Transit',
  inspectionMetrics: {
    sugarBrix: 5.2,
    firmnessKgCm: 3.8,
    pesticideResidueTest: 'PASS - Organic / ND',
    moistureContent: '91.5%'
  },
  collectionHub: 'Chinnasalem Agro Consolidation Hub (Bay 1)',
  shipmentId: 'SHP-TN-5510',
  vehicleNumber: 'TN-15-AGRI-5510',
  destination: 'Ambattur Food Processing Terminal, Chennai',
  qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-TOM-2026-101',
  timeline: [
    {
      step: 'HARVESTED',
      title: 'Harvested at Source Farm Gates',
      location: 'Chinnasalem & Pennagaram Fields',
      timestamp: '14 Sep 2026, 06:00 AM',
      operator: 'Subramaniam Ramasamy & Farm Collective',
      completed: true
    },
    {
      step: 'QUALITY_CHECKED',
      title: 'NABL Certified Quality Grading',
      location: 'Chinnasalem Hub Testing Cell',
      timestamp: '14 Sep 2026, 09:30 AM',
      operator: 'Dr. R. Malathi (QA Officer)',
      completed: true
    },
    {
      step: 'PACKED',
      title: 'Packed in Ventilated Agro Crates',
      location: 'Chinnasalem Hub Dispatch Bay 1',
      timestamp: '14 Sep 2026, 12:00 PM',
      operator: 'FPO Packing Unit',
      completed: true
    },
    {
      step: 'IN_TRANSIT',
      title: 'In Transit via CoolReefer EV',
      location: 'NH-79 / NH-48 Express Corridor',
      timestamp: '15 Sep 2026, 05:30 AM',
      operator: 'Driver: Karthik Subramanian',
      completed: true
    },
    {
      step: 'DELIVERED',
      title: 'Dockside Receiving & OTP Acceptance',
      location: 'Ambattur Processing Terminal, Chennai',
      timestamp: 'Expected 15 Sep 2026, 07:15 AM',
      operator: 'WayCool Receiving Officer',
      completed: false
    }
  ]
};

// ==========================================
// 12. ESCROW SETTLEMENT RECORD (89.2% Net Payout)
// ==========================================
export const DEMO_SETTLEMENT: SettlementRecord = {
  id: 'SETTLE-2026-102',
  orderId: 'ORD-TN-2026-102',
  batchId: 'AGP-TOM-2026-102',
  crop: 'Tomato',
  quantityKg: 3000,
  buyerName: 'Nilgiris Supermarket Supply Chain',
  farmerOrFpoName: 'Subramaniam Ramasamy & Kallakurichi FPO',
  totalOrderValue: 84000,
  farmerAmount: 75000,
  logisticsAmount: 6600,
  platformAmount: 2400,
  farmerRealizationPercentage: 89.28,
  traditionalFarmerEarnings: 54000,
  earningsGainPercentage: 38.88,
  status: 'COMPLETED',
  settlementDate: '2026-09-14 07:15 AM',
  utrNumber: 'AGRITXN20260914981920',
  paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
  buyerPaymentReference: 'UPI-ERUPI-981920-CONFIRMED',
  buyerPaymentRecordedAt: '2026-09-14 07:05 AM',
  fpoSettledAt: '2026-09-14 07:10 AM',
  farmerSettledAt: '2026-09-14 07:15 AM',
  farmerBreakdown: [
    {
      farmerId: 'usr-farmer-01',
      farmerName: 'Subramaniam Ramasamy',
      farmerLocation: 'Chinnasalem, Kallakurichi',
      produceListingId: 'LST-TN-117',
      contributedQuantityKg: 3000,
      collectedQuantityKg: 3000,
      agreedPricePerKg: 28.0,
      grossAmount: 84000,
      netFarmerAmount: 75000,
      status: 'COMPLETED',
      utrNumber: 'UTR-FARM-9819201',
      settledAt: '2026-09-14 07:15 AM',
      bankAccountMasked: 'SBI **** **** 6821'
    }
  ]
};

// ==========================================
// 13. WORKFLOW ORDERS (10-Stage Connected Pipeline)
// ==========================================
export const INITIAL_ORDERS: WorkflowOrder[] = [
  {
    id: 'ORD-TOMATO-01',
    produceListingId: 'PL-TOMATO-01',
    demandRequestId: 'DR-TOMATO-01',
    batchId: 'PP-TOMATO-01',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramu',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    crop: 'Tomato',
    variety: 'Hybrid',
    quantityKg: 5000,
    pricePerKg: 35,
    totalValue: 175000,
    status: 'In Transit',
    date: new Date().toISOString(),
    deliveryLocation: 'Chennai',
    farmerLocation: 'Madurai',
    fpoName: 'GreenHarvest FPO',
    qualityGrade: 'Grade A',
    timeline: [
      { step: 'Order Created', title: 'Order Created', location: 'System', timestamp: new Date().toISOString(), operator: 'System', completed: true }
    ]
  }
];

export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [];

export const INITIAL_PASSPORTS: ProducePassport[] = [
  {
    batchId: 'PP-TOMATO-01',
    crop: 'Tomato',
    variety: 'Hybrid',
    farmerOrFpo: 'GreenHarvest FPO / Ramu',
    farmLocation: 'Madurai, TN',
    harvestDate: new Date().toISOString().split('T')[0],
    quantityKg: 5000,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 4.8,
      firmnessKgCm: 2.5,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '95%'
    },
    collectionHub: 'GreenHarvest FPO Hub',
    destination: 'Chennai, TN',
    shipmentId: 'SHIP-TOM-01',
    vehicleNumber: 'TN-45-AT-9080',
    qrCodeUrl: 'https://example.com/qr/PP-TOMATO-01',
    currentStatus: 'In Transit',
    timeline: [
      { step: 'Harvested', title: 'Harvested', location: 'Madurai, TN', timestamp: new Date().toISOString(), operator: 'Ramu', completed: true }
    ]
  }
];

export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'SET-TOMATO-01',
    orderId: 'ORD-TOMATO-01',
    batchId: 'PP-TOMATO-01',
    crop: 'Tomato',
    quantityKg: 5000,
    buyerName: 'Reliance Fresh',
    farmerOrFpoName: 'GreenHarvest FPO',
    totalOrderValue: 175000,
    farmerAmount: 150000,
    logisticsAmount: 15000,
    platformAmount: 10000,
    farmerRealizationPercentage: 85,
    traditionalFarmerEarnings: 120000,
    earningsGainPercentage: 25,
    status: 'PENDING',
    settlementDate: new Date(Date.now() + 86400000).toISOString(),
    utrNumber: 'UTR908070605040'
  }
];

export const CROP_RECOMMENDATIONS: CropRecommendation[] = [
  {
    crop: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    suitabilityScore: 94,
    demandTrend: 'HIGH',
    predictedDemandKg: 14200,
    expectedPricePerKg: '₹26–₹30/kg',
    growthDurationDays: 75,
    waterRequirement: 'MEDIUM',
    nearbyBuyerDemand: 'High (Chennai terminal & WayCool deficit)',
    season: 'All-Season',
    advice: 'Institutional demand is projected +14% higher this week. Recommended harvest window: Sep 16–20 for Grade A farmgate realization.',
    keyBuyersNearby: ['WayCool Agri Processors', 'Nilgiris Supermarket', 'ABC Retail Stores'],
    aiConfidence: 88
  },
  {
    crop: 'Turmeric',
    scientificName: 'Curcuma longa',
    suitabilityScore: 89,
    demandTrend: 'HIGH',
    predictedDemandKg: 6500,
    expectedPricePerKg: '₹85–₹94/kg',
    growthDurationDays: 240,
    waterRequirement: 'MEDIUM',
    nearbyBuyerDemand: 'High (Erode market export and spice processors)',
    season: 'Kharif',
    advice: 'High curcumin varieties fetching 15% export premium. Ensure post-harvest solar drying under 10% moisture.',
    keyBuyersNearby: ['Aachi Spices Agro', 'Erode Regulated Market', 'ABC Retail'],
    aiConfidence: 86
  },
  {
    crop: 'Onion',
    scientificName: 'Allium cepa',
    suitabilityScore: 86,
    demandTrend: 'MEDIUM',
    predictedDemandKg: 8900,
    expectedPricePerKg: '₹28–₹34/kg',
    growthDurationDays: 90,
    waterRequirement: 'LOW',
    nearbyBuyerDemand: 'Moderate to High (Coimbatore & Chennai regional deficit)',
    season: 'Rabi',
    advice: 'Steady market prices expected. Cured red onions with tight outer skin compliant with retail specs.',
    keyBuyersNearby: ['Kovai Fresh Mega Wholesale', 'Koyambedu Wholesalers'],
    aiConfidence: 84
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// ==========================================
// 18. AUDIT LOGS DATA
// ==========================================
export const AUDIT_LOGS_DATA: AuditLogEntry[] = [
  {
    id: 'AUD-TN-901',
    timestamp: '2026-09-15 05:30:00',
    userName: 'Karthik Subramanian',
    userRole: 'LOGISTICS',
    action: 'DISPATCH_REEFER_SHIPMENT',
    resource: 'Order ORD-TN-2026-101 (5,000 kg Tomato via CoolReefer EV)',
    ipAddress: '10.14.88.21',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-TN-902',
    timestamp: '2026-09-15 05:15:00',
    userName: 'Dr. R. Malathi',
    userRole: 'ADMIN',
    action: 'RECORD_QUALITY_INSPECTION',
    resource: 'Batch AGP-TOM-2026-101 (Brix 5.2 - Grade A Verified)',
    ipAddress: '10.14.88.10',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-TN-903',
    timestamp: '2026-09-14 07:15:00',
    userName: 'Subramaniam Ramasamy',
    userRole: 'FARMER',
    action: 'ESCROW_PAYOUT_RECEIVED',
    resource: 'Order ORD-TN-2026-102 (₹75,000 via e-RUPI Programmable Escrow)',
    ipAddress: '49.207.12.9',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-TN-904',
    timestamp: '2026-09-14 06:45:00',
    userName: 'S. Sundaresan',
    userRole: 'BULK_BUYER',
    action: 'CONFIRM_BUYER_DELIVERY',
    resource: 'Batch AGP-TOM-2026-102 (OTP-CONFIRMED-849201)',
    ipAddress: '182.74.45.19',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-TN-905',
    timestamp: '2026-09-13 08:00:00',
    userName: 'Vikramaditya Singhania',
    userRole: 'BULK_BUYER',
    action: 'CREATE_BULK_DEMAND',
    resource: 'Demand DEM-BULK-2026-01 (5,000 kg Tomato @ ₹31/kg)',
    ipAddress: '182.74.12.9',
    status: 'SUCCESS'
  }
];

// ==========================================
// 19. SYSTEM USERS (Full Entity Directory)
// ==========================================
export const SYSTEM_USERS_DATA: SystemUserRecord[] = [
  {
    id: 'usr-farmer-01',
    name: 'Subramaniam Ramasamy',
    role: 'FARMER',
    phone: '+91 94421 88301',
    email: 'subramaniam.farmer@uzhavanconnect.gov.in',
    location: 'Chinnasalem, Kallakurichi',
    status: 'ACTIVE',
    joinedDate: '12 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-02',
    name: 'K. Velusamy',
    role: 'FARMER',
    phone: '+91 94422 10452',
    email: 'velusamy.k@uzhavanconnect.gov.in',
    location: 'Pennagaram, Villupuram',
    status: 'ACTIVE',
    joinedDate: '18 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-03',
    name: 'Meenakshi Sundaram',
    role: 'FARMER',
    phone: '+91 94423 77819',
    email: 'meenakshi.s@uzhavanconnect.gov.in',
    location: 'Valapadi, Salem',
    status: 'ACTIVE',
    joinedDate: '22 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-04',
    name: 'Thangavel Murugan',
    role: 'FARMER',
    phone: '+91 94424 99120',
    email: 'thangavel.m@uzhavanconnect.gov.in',
    location: 'Attur, Salem',
    status: 'ACTIVE',
    joinedDate: '25 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-05',
    name: 'Arumugam Natarajan',
    role: 'FARMER',
    phone: '+91 94425 33410',
    email: 'arumugam.n@uzhavanconnect.gov.in',
    location: 'Bhavani, Erode',
    status: 'ACTIVE',
    joinedDate: '29 Jan 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-06',
    name: 'Senthil Kumar Palani',
    role: 'FARMER',
    phone: '+91 94426 44521',
    email: 'senthil.p@uzhavanconnect.gov.in',
    location: 'Rasipuram, Namakkal',
    status: 'ACTIVE',
    joinedDate: '02 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-07',
    name: 'Govindasamy Radhakrishnan',
    role: 'FARMER',
    phone: '+91 94427 66732',
    email: 'govindasamy.r@uzhavanconnect.gov.in',
    location: 'Musiri, Tiruchirappalli',
    status: 'ACTIVE',
    joinedDate: '06 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-08',
    name: 'Marimuthu Karuppan',
    role: 'FARMER',
    phone: '+91 94428 11843',
    email: 'marimuthu.k@uzhavanconnect.gov.in',
    location: 'Lalgudi, Tiruchirappalli',
    status: 'ACTIVE',
    joinedDate: '10 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-09',
    name: 'Balasubramanian Sethuraman',
    role: 'FARMER',
    phone: '+91 94429 22954',
    email: 'balasubramanian.s@uzhavanconnect.gov.in',
    location: 'Thiruvaiyaru, Thanjavur',
    status: 'ACTIVE',
    joinedDate: '14 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-10',
    name: 'Kalyanasundaram G.',
    role: 'FARMER',
    phone: '+91 94430 33065',
    email: 'kalyana.g@uzhavanconnect.gov.in',
    location: 'Kumbakonam, Thanjavur',
    status: 'ACTIVE',
    joinedDate: '18 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-11',
    name: 'Dhandapani Muthusamy',
    role: 'FARMER',
    phone: '+91 94431 44176',
    email: 'dhandapani.m@uzhavanconnect.gov.in',
    location: 'Pollachi, Coimbatore',
    status: 'ACTIVE',
    joinedDate: '22 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-farmer-12',
    name: 'Vijayakumar Nachimuthu',
    role: 'FARMER',
    phone: '+91 94432 55287',
    email: 'vijayakumar.n@uzhavanconnect.gov.in',
    location: 'Annur, Coimbatore',
    status: 'ACTIVE',
    joinedDate: '26 Feb 2026',
    permissions: ROLE_PERMISSIONS.FARMER
  },
  {
    id: 'usr-fpo-01',
    name: 'Ravi Verma (Kallakurichi Pasumai FPO)',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 11223',
    email: 'ravi.fpo@uzhavanconnect.gov.in',
    location: 'Chinnasalem Hub, Kallakurichi',
    status: 'ACTIVE',
    joinedDate: '01 Jan 2026',
    permissions: ROLE_PERMISSIONS.FPO_AGGREGATOR
  },
  {
    id: 'usr-fpo-02',
    name: 'P. Shanmugasundaram (Salem Kongu FPO)',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 22334',
    email: 'shanmugam.fpo@uzhavanconnect.gov.in',
    location: 'Valapadi Depot, Salem',
    status: 'ACTIVE',
    joinedDate: '05 Jan 2026',
    permissions: ROLE_PERMISSIONS.FPO_AGGREGATOR
  },
  {
    id: 'usr-fpo-03',
    name: 'S. Rajagopalan (Cauvery Delta FPO)',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 33445',
    email: 'rajagopal.fpo@uzhavanconnect.gov.in',
    location: 'Thiruvaiyaru Hub, Thanjavur',
    status: 'ACTIVE',
    joinedDate: '10 Jan 2026',
    permissions: ROLE_PERMISSIONS.FPO_AGGREGATOR
  },
  {
    id: 'usr-fpo-04',
    name: 'K. Rangasamy (Anamalai FPO)',
    role: 'FPO_AGGREGATOR',
    phone: '+91 97700 44556',
    email: 'rangasamy.fpo@uzhavanconnect.gov.in',
    location: 'Pollachi Center, Coimbatore',
    status: 'ACTIVE',
    joinedDate: '15 Jan 2026',
    permissions: ROLE_PERMISSIONS.FPO_AGGREGATOR
  },
  {
    id: 'usr-bulkbuyer-01',
    name: 'Vikramaditya Singhania (WayCool Agri)',
    role: 'BULK_BUYER',
    phone: '+91 98402 88990',
    email: 'vikram.procurement@metroagri.in',
    location: 'Ambattur Food Processing Terminal, Chennai',
    status: 'ACTIVE',
    joinedDate: '08 Jan 2026',
    permissions: ROLE_PERMISSIONS.BULK_BUYER
  },
  {
    id: 'BUYER-BULK-02',
    name: 'S. Sundaresan (Nilgiris Supermarket)',
    role: 'BULK_BUYER',
    phone: '+91 98403 11223',
    email: 'sundaresan.procurement@nilgiris.in',
    location: 'Koyambedu Distribution Terminal, Chennai',
    status: 'ACTIVE',
    joinedDate: '12 Jan 2026',
    permissions: ROLE_PERMISSIONS.BULK_BUYER
  },
  {
    id: 'BUYER-BULK-03',
    name: 'Dr. K. Jayachandran (MilkyMist Agri)',
    role: 'BULK_BUYER',
    phone: '+91 98404 22334',
    email: 'jayachandran.agri@milkymist.in',
    location: 'Perundurai Food Park, Erode',
    status: 'ACTIVE',
    joinedDate: '15 Jan 2026',
    permissions: ROLE_PERMISSIONS.BULK_BUYER
  },
  {
    id: 'BUYER-BULK-04',
    name: 'R. Saravanan (Kovai Fresh Mart)',
    role: 'BULK_BUYER',
    phone: '+91 98405 33445',
    email: 'saravanan.procurement@kovaifresh.in',
    location: 'R.S. Puram Terminal, Coimbatore',
    status: 'ACTIVE',
    joinedDate: '20 Jan 2026',
    permissions: ROLE_PERMISSIONS.BULK_BUYER
  },
  {
    id: 'usr-buyer-01',
    name: 'Anita Sharma (ABC Retail Stores)',
    role: 'RETAIL_BUYER',
    phone: '+91 98840 55667',
    email: 'anita.procurement@abcretail.in',
    location: 'Koyambedu Wholesale Terminal, Chennai',
    status: 'ACTIVE',
    joinedDate: '18 Feb 2026',
    permissions: ROLE_PERMISSIONS.RETAIL_BUYER
  },
  {
    id: 'usr-logistics-01',
    name: 'Sundar Transport & Cold Chain',
    role: 'LOGISTICS',
    phone: '+91 96600 22334',
    email: 'dispatch@sundartrans.in',
    location: 'Salem - Chennai Expressway Hub',
    status: 'ACTIVE',
    joinedDate: '01 Jan 2026',
    permissions: ROLE_PERMISSIONS.LOGISTICS
  },
  {
    id: 'usr-ops-01',
    name: 'Tejaswini V. (Ops Lead)',
    role: 'ADMIN',
    phone: '+91 99000 11223',
    email: 'admin.tejas@uzhavanconnect.gov.in',
    location: 'Uzhavan Connect Command & Governance Center, Chennai',
    status: 'ACTIVE',
    joinedDate: '01 Jan 2026',
    permissions: ROLE_PERMISSIONS.ADMIN
  }
];

// ==========================================
// 20. MIDDLEMAN SIMULATOR DATA (SIH26033 Core Problem)
// ==========================================
export const MIDDLEMAN_SIMULATOR_DATA = {
  traditional: {
    title: 'Traditional Supply Chain (Fragmented Intermediaries)',
    farmerReceives: 18,
    intermediaryTake: 22,
    buyerPays: 40,
    postHarvestLossPercentage: 22,
    flow: [
      { role: 'Farmer Farmgate Realization', amount: 18, percentage: 45, note: 'Gross price before post-harvest field spoilage' },
      { role: 'Village Level Aggregator / Dalal', amount: 3.5, percentage: 8.75, note: 'First-mile unorganized commission cut' },
      { role: 'APMC Mandi Commission Agent (Arhtiya)', amount: 5.0, percentage: 12.5, note: 'Auction house handling & arbitrary tare deductions' },
      { role: 'Secondary Regional Wholesaler', amount: 4.5, percentage: 11.25, note: 'Inter-district transport & speculative inventory markup' },
      { role: 'Uncoordinated Multi-Leg Logistics', amount: 4.0, percentage: 10, note: 'Non-refrigerated transit spoilage & loading costs' },
      { role: 'Urban Retailer / Terminal Vendor', amount: 5.0, percentage: 12.5, note: 'Final consumer distribution and display buffer' }
    ]
  },
  uzhavanconnect: {
    title: 'Uzhavan Connect Direct Coordinated Chain',
    farmerReceives: 25.5,
    logisticsAndPlatform: 5.5,
    buyerPays: 31.0,
    postHarvestLossPercentage: 3.8,
    flow: [
      { role: 'Farmer Direct Farmgate Payout', amount: 25.5, percentage: 82.25, note: '+41.6% extra earnings directly into bank account via escrow' },
      { role: 'Quality Assay & Standardized Grading', amount: 1.0, percentage: 3.22, note: 'Certified optical inspection & digital produce passport' },
      { role: 'VRP Multi-Stop Optimized Cold Logistics', amount: 3.0, percentage: 9.68, note: 'Sensor-monitored active Reefer EV (48.6 km saved)' },
      { role: 'Uzhavan Connect Tech & Escrow Settlement', amount: 1.5, percentage: 4.85, note: 'AI demand engine & real-time smart matching' }
    ]
  }
};

// ==========================================
// 21. SIH EVALUATION KPIS
// ==========================================
export const SIH_EVALUATION_KPIS = [
  { label: 'Farmer Net Realization', traditional: '₹18.00 / kg (45%)', uzhavanconnect: '₹25.00 – ₹27.20 / kg (82%–89%)', change: '+38.8% to +51.1% Extra Earnings', positive: true },
  { label: 'Consumer / Buyer Landed Price', traditional: '₹40.00 / kg', uzhavanconnect: '₹31.00 / kg', change: '-22.5% Lower Procurement Cost', positive: true },
  { label: 'Post-Harvest Wastage', traditional: '22.4%', uzhavanconnect: '3.8%', change: '-83% Food Saved (Cold-Chain Verified)', positive: true },
  { label: 'Transport Route Distance', traditional: '122.8 km', uzhavanconnect: '74.2 km', change: '48.6 km Saved (OR-Tools VRP)', positive: true },
  { label: 'Vehicle Fleet Utilization', traditional: '44.0%', uzhavanconnect: '90.9%', change: '+106% Load Consolidation', positive: true },
  { label: 'Matching & Fulfillment Time', traditional: '48 – 72 hrs', uzhavanconnect: '4.2 hrs', change: '12x Faster Real-Time Quota Allocation', positive: true },
  { label: 'Forecast Accuracy (MAPE)', traditional: 'Unforecasted (Blind)', uzhavanconnect: '4.82% Error', change: '95.18% Accuracy across Corridors', positive: true }
];

// ==========================================
// 22. AGRICULTURE NEWS & UPDATES
// ==========================================
export const AGRICULTURE_NEWS: NewsArticle[] = [
  {
    id: 'news_1',
    title: 'Tamil Nadu Horticultural Mission Expands Solar Micro-Cold Storage in Kallakurichi & Salem',
    summary: 'Department of Horticulture rolls out 50 additional solar-assisted pre-cooling aggregation hubs across Western and Central districts to curb post-harvest spoilage.',
    content: 'Under the National Agriculture Development Programme, Tamil Nadu is strengthening rural consolidation hubs. Farmers in Kallakurichi and Salem will receive direct access to temperature-controlled holding bays prior to long-haul transit.',
    source: 'Tamil Nadu Agri Bureau',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'Policy',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f296b020080?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'news_2',
    title: 'Uzhavan Connect Pilot in Cauvery Delta Records 89% Direct Farmer Realization',
    summary: 'Direct FPO-to-institutional buyer contracts eliminate five traditional intermediary layers, boosting farm-gate net returns by over 38%.',
    content: 'A comprehensive evaluation of the digital aggregation model reveals that smallholder farmers in Thiruvaiyaru and Musiri gained 89% net realization of terminal landed prices compared to the traditional 45% APMC baseline.',
    source: 'AgriTech Insights',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'Market',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'news_3',
    title: 'Monsoon Normal Across Central Agro Belts; Favorable Sowing for Kharif Pulses',
    summary: 'IMD regional bulletin forecasts steady rainfall across Erode, Coimbatore, and Tiruchirappalli corridors supporting active vegetable cultivation.',
    content: 'Steady southwest monsoon showers across the Western Ghats and Cauvery catchment ensure adequate irrigation reserves for the upcoming harvest cycle.',
    source: 'Regional Weather Desk',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: 'Weather',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'news_4',
    title: 'NABL-Accredited Quality Passports Now Mandated for Institutional Produce Supply',
    summary: 'Digital QR passports providing field-level pesticide residue and sugar brix certification become standard for supermarket procurement chains.',
    content: 'Institutional buyers across Chennai and Coimbatore are implementing digital produce passports to ensure complete traceability from farm-gate to consumer shelves.',
    source: 'FoodTech Standards Review',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];
