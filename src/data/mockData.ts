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
    id: 'OPP-TN-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    crop: 'Tomato',
    requiredQuantityKg: 5000,
    maxPricePerKg: 31.0,
    location: 'Ambattur Food Processing Terminal, Chennai',
    requiredDate: '2026-09-16',
    quality: 'Grade A'
  },
  {
    id: 'OPP-TN-02',
    buyerName: 'Nilgiris Supermarket Supply Chain',
    crop: 'Tomato',
    requiredQuantityKg: 3000,
    maxPricePerKg: 28.0,
    location: 'Koyambedu Distribution Terminal, Chennai',
    requiredDate: '2026-09-18',
    quality: 'Grade A'
  },
  {
    id: 'OPP-TN-03',
    buyerName: 'MilkyMist Agri & Value Products Ltd.',
    crop: 'Banana',
    requiredQuantityKg: 3200,
    maxPricePerKg: 26.0,
    location: 'Perundurai Food Park, Erode',
    requiredDate: '2026-09-17',
    quality: 'Grade A'
  },
  {
    id: 'OPP-TN-04',
    buyerName: 'Kovai Fresh Mega Wholesale Mart',
    crop: 'Onion',
    requiredQuantityKg: 2800,
    maxPricePerKg: 34.0,
    location: 'R.S. Puram Terminal, Coimbatore',
    requiredDate: '2026-09-18',
    quality: 'Grade A'
  },
  {
    id: 'OPP-TN-05',
    buyerName: 'Ananda Grand Hospitality & Caterers',
    crop: 'Chilli',
    requiredQuantityKg: 1200,
    maxPricePerKg: 54.0,
    location: 'Guindy Central Commissary, Chennai',
    requiredDate: '2026-09-19',
    quality: 'Grade A'
  },
  {
    id: 'OPP-TN-06',
    buyerName: 'Tamil Nadu Civil Supplies / Mid-Day Meal Procurement',
    crop: 'Paddy',
    requiredQuantityKg: 6000,
    maxPricePerKg: 27.0,
    location: 'Central Grain Warehouse, Trichy',
    requiredDate: '2026-09-20',
    quality: 'Grade A'
  }
];

export const FARMER_OFFERS_DATA: FarmerOfferItem[] = [];

// ==========================================
// 6. BUYER DEMANDS (10 Realistic Demands with Varied States)
// ==========================================
export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
  {
    id: 'DEM-BULK-2026-01',
    buyerId: 'usr-bulkbuyer-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    buyerType: 'Food Processor',
    crop: 'Tomato',
    variety: 'Sivam Hybrid (Firm Processing)',
    quantityKg: 5000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 5000,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Ambattur Food Processing Terminal, Chennai',
    deliveryDate: '2026-09-16',
    deliveryTimeWindow: '05:00 AM - 08:30 AM',
    maxTargetPricePerKg: 31.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-13 07:30'
  },
  {
    id: 'DEM-TN-101',
    buyerId: 'BUYER-BULK-02',
    buyerName: 'Nilgiris Supermarket Supply Chain',
    buyerType: 'Supermarket',
    crop: 'Tomato',
    variety: 'Grade A Table Fresh',
    quantityKg: 3000,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 3000,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Koyambedu Distribution Terminal, Chennai',
    deliveryDate: '2026-09-14',
    deliveryTimeWindow: '05:30 AM - 08:30 AM',
    maxTargetPricePerKg: 28.0,
    status: 'COMPLETED',
    createdAt: '2026-09-12 08:15'
  },
  {
    id: 'DEM-TN-102',
    buyerId: 'BUYER-BULK-03',
    buyerName: 'MilkyMist Agri & Value Products Ltd.',
    buyerType: 'Food Processor',
    crop: 'Banana',
    variety: 'Grand Naine',
    quantityKg: 3200,
    initialQuantityKg: 3200,
    allocatedQuantityKg: 3200,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Perundurai Food Park, Erode',
    deliveryDate: '2026-09-17',
    deliveryTimeWindow: '06:00 AM - 09:00 AM',
    maxTargetPricePerKg: 26.0,
    status: 'SUPPLY_CONFIRMED',
    createdAt: '2026-09-13 09:40'
  },
  {
    id: 'DEM-TN-103',
    buyerId: 'BUYER-BULK-04',
    buyerName: 'Kovai Fresh Mega Wholesale Mart',
    buyerType: 'Bulk Purchaser',
    crop: 'Onion',
    variety: 'Bellary Small',
    quantityKg: 2800,
    initialQuantityKg: 2800,
    allocatedQuantityKg: 2800,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'R.S. Puram Terminal, Coimbatore',
    deliveryDate: '2026-09-18',
    deliveryTimeWindow: '05:00 AM - 07:30 AM',
    maxTargetPricePerKg: 34.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-14 06:20'
  },
  {
    id: 'DEM-TN-104',
    buyerId: 'BUYER-BULK-05',
    buyerName: 'Ananda Grand Hospitality & Caterers',
    buyerType: 'Hospitality',
    crop: 'Chilli',
    variety: 'G4 Hot Green',
    quantityKg: 1200,
    initialQuantityKg: 1200,
    allocatedQuantityKg: 1200,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Guindy Central Commissary, Chennai',
    deliveryDate: '2026-09-19',
    deliveryTimeWindow: '06:00 AM - 08:30 AM',
    maxTargetPricePerKg: 54.0,
    status: 'FPO_APPROVAL',
    createdAt: '2026-09-14 11:30'
  },
  {
    id: 'DEM-TN-105',
    buyerId: 'usr-buyer-01',
    buyerName: 'ABC Retail Stores & Consumer Coops',
    buyerType: 'Supermarket',
    crop: 'Turmeric',
    variety: 'Erode Finger Grade A',
    quantityKg: 2500,
    initialQuantityKg: 2500,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Premium',
    location: 'Koyambedu Hub, Chennai',
    deliveryDate: '2026-09-20',
    deliveryTimeWindow: '06:00 AM - 09:00 AM',
    maxTargetPricePerKg: 92.0,
    status: 'MATCHING',
    createdAt: '2026-09-15 08:00'
  },
  {
    id: 'DEM-TN-106',
    buyerId: 'BUYER-BULK-06',
    buyerName: 'Tamil Nadu Civil Supplies / Mid-Day Meal Procurement',
    buyerType: 'Institutional Procurement',
    crop: 'Paddy',
    variety: 'BPT 5204 Sona Masuri',
    quantityKg: 6000,
    initialQuantityKg: 6000,
    allocatedQuantityKg: 6000,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Central Grain Warehouse, Trichy',
    deliveryDate: '2026-09-14',
    deliveryTimeWindow: '06:00 AM - 10:00 AM',
    maxTargetPricePerKg: 27.0,
    status: 'COMPLETED',
    createdAt: '2026-09-11 09:00'
  },
  {
    id: 'DEM-TN-107',
    buyerId: 'usr-bulkbuyer-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    buyerType: 'Food Processor',
    crop: 'Groundnut',
    variety: 'Kallakurichi / TMV Bold Pods',
    quantityKg: 3500,
    initialQuantityKg: 3500,
    allocatedQuantityKg: 3500,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'Ambattur Food Processing Terminal, Chennai',
    deliveryDate: '2026-09-21',
    deliveryTimeWindow: '05:30 AM - 09:00 AM',
    maxTargetPricePerKg: 68.0,
    status: 'SUPPLY_CONFIRMED',
    createdAt: '2026-09-15 10:30'
  },
  {
    id: 'DEM-TN-108',
    buyerId: 'BUYER-BULK-04',
    buyerName: 'Kovai Fresh Mega Wholesale Mart',
    buyerType: 'Bulk Purchaser',
    crop: 'Coconut',
    variety: 'Pollachi Tall Grade A',
    quantityKg: 4000,
    initialQuantityKg: 4000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Grade A',
    location: 'R.S. Puram Terminal, Coimbatore',
    deliveryDate: '2026-09-24',
    deliveryTimeWindow: '06:00 AM - 10:00 AM',
    maxTargetPricePerKg: 35.0,
    status: 'OPEN',
    createdAt: '2026-09-16 06:00'
  },
  {
    id: 'DEM-TN-109',
    buyerId: 'BUYER-BULK-03',
    buyerName: 'MilkyMist Agri & Value Products Ltd.',
    buyerType: 'Food Processor',
    crop: 'Maize',
    variety: 'Yellow Feed Quality',
    quantityKg: 5000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    qualityRequirement: 'Standard',
    location: 'Perundurai Food Park, Erode',
    deliveryDate: '2026-09-25',
    deliveryTimeWindow: '07:00 AM - 11:00 AM',
    maxTargetPricePerKg: 23.0,
    status: 'OPEN',
    createdAt: '2026-09-16 07:15'
  }
];

export const INITIAL_DEMAND_POOL: DemandPool = {
  id: 'POOL-TN-TOM-8000',
  crop: 'Tomato',
  region: 'Chennai - Salem - Kallakurichi Corridor',
  totalQuantityKg: 8000,
  demandRequests: INITIAL_DEMAND_REQUESTS.filter((d) => d.crop === 'Tomato'),
  targetDate: '2026-09-16',
  forecastQuantityKg: 14200,
  buyersCount: 2,
  status: 'POOLED',
  priceBenchmarkPerKg: 29.5
};

// ==========================================
// 7. FARMER PRODUCE LISTINGS (18 Listings)
// ==========================================
export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [
  {
    id: 'LST-TN-101',
    farmerId: 'usr-farmer-01',
    farmerName: 'Subramaniam Ramasamy',
    crop: 'Tomato',
    variety: 'Sivam Hybrid',
    quantityKg: 3000,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 26.0,
    harvestDate: '2026-09-18',
    availabilityDate: '2026-09-18',
    location: 'Chinnasalem, Kallakurichi',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Listed'
  },
  {
    id: 'LST-TN-102',
    farmerId: 'usr-farmer-02',
    farmerName: 'K. Velusamy',
    crop: 'Tomato',
    variety: 'Pusa Ruby',
    quantityKg: 2000,
    initialQuantityKg: 2000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 25.5,
    harvestDate: '2026-09-19',
    availabilityDate: '2026-09-19',
    location: 'Pennagaram, Villupuram',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Listed'
  },
  {
    id: 'LST-TN-103',
    farmerId: 'usr-farmer-03',
    farmerName: 'Meenakshi Sundaram',
    crop: 'Tomato',
    variety: 'Vaishnavi',
    quantityKg: 3500,
    initialQuantityKg: 3500,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 26.5,
    harvestDate: '2026-09-20',
    availabilityDate: '2026-09-20',
    location: 'Valapadi, Salem',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    status: 'Listed'
  },
  {
    id: 'LST-TN-104',
    farmerId: 'usr-farmer-04',
    farmerName: 'Thangavel Murugan',
    crop: 'Onion',
    variety: 'Nashik Red Medium',
    quantityKg: 4000,
    initialQuantityKg: 4000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 28.0,
    harvestDate: '2026-09-21',
    availabilityDate: '2026-09-21',
    location: 'Attur, Salem',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    status: 'Listed'
  },
  {
    id: 'LST-TN-105',
    farmerId: 'usr-farmer-05',
    farmerName: 'Arumugam Natarajan',
    crop: 'Turmeric',
    variety: 'Erode Finger Grade A',
    quantityKg: 2500,
    initialQuantityKg: 2500,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Premium',
    expectedPricePerKg: 88.0,
    harvestDate: '2026-09-22',
    availabilityDate: '2026-09-22',
    location: 'Bhavani, Erode',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    status: 'Listed'
  },
  {
    id: 'LST-TN-106',
    farmerId: 'usr-farmer-06',
    farmerName: 'Senthil Kumar Palani',
    crop: 'Maize',
    variety: 'Yellow Feed Quality',
    quantityKg: 5000,
    initialQuantityKg: 5000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Standard',
    expectedPricePerKg: 22.0,
    harvestDate: '2026-09-23',
    availabilityDate: '2026-09-23',
    location: 'Rasipuram, Namakkal',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    status: 'Listed'
  },
  {
    id: 'LST-TN-107',
    farmerId: 'usr-farmer-07',
    farmerName: 'Govindasamy Radhakrishnan',
    crop: 'Banana',
    variety: 'Grand Naine',
    quantityKg: 3200,
    initialQuantityKg: 3200,
    allocatedQuantityKg: 3200,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 24.0,
    harvestDate: '2026-09-15',
    availabilityDate: '2026-09-15',
    location: 'Musiri, Tiruchirappalli',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Packed'
  },
  {
    id: 'LST-TN-108',
    farmerId: 'usr-farmer-08',
    farmerName: 'Marimuthu Karuppan',
    crop: 'Onion',
    variety: 'Bellary Small',
    quantityKg: 2800,
    initialQuantityKg: 2800,
    allocatedQuantityKg: 2800,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 32.0,
    harvestDate: '2026-09-15',
    availabilityDate: '2026-09-15',
    location: 'Lalgudi, Tiruchirappalli',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Collected'
  },
  {
    id: 'LST-TN-109',
    farmerId: 'usr-farmer-09',
    farmerName: 'Balasubramanian Sethuraman',
    crop: 'Paddy',
    variety: 'BPT 5204 Sona Masuri',
    quantityKg: 6000,
    initialQuantityKg: 6000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 26.0,
    harvestDate: '2026-09-25',
    availabilityDate: '2026-09-25',
    location: 'Thiruvaiyaru, Thanjavur',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Listed'
  },
  {
    id: 'LST-TN-110',
    farmerId: 'usr-farmer-10',
    farmerName: 'Kalyanasundaram G.',
    crop: 'Brinjal',
    variety: 'Uthiramerur Green',
    quantityKg: 1800,
    initialQuantityKg: 1800,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 28.0,
    harvestDate: '2026-09-20',
    availabilityDate: '2026-09-20',
    location: 'Kumbakonam, Thanjavur',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Listed'
  },
  {
    id: 'LST-TN-111',
    farmerId: 'usr-farmer-11',
    farmerName: 'Dhandapani Muthusamy',
    crop: 'Coconut',
    variety: 'Tall Pollachi Grade A',
    quantityKg: 4000,
    initialQuantityKg: 4000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 34.0,
    harvestDate: '2026-09-24',
    availabilityDate: '2026-09-24',
    location: 'Pollachi, Coimbatore',
    fpoId: 'fpo-tn-04',
    fpoName: 'Anamalai Horticulture Farmers Co.',
    status: 'Listed'
  },
  {
    id: 'LST-TN-112',
    farmerId: 'usr-farmer-12',
    farmerName: 'Vijayakumar Nachimuthu',
    crop: 'Tomato',
    variety: 'Shivam Hybrid',
    quantityKg: 2400,
    initialQuantityKg: 2400,
    allocatedQuantityKg: 1000,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 27.0,
    harvestDate: '2026-09-15',
    availabilityDate: '2026-09-15',
    location: 'Annur, Coimbatore',
    fpoId: 'fpo-tn-04',
    fpoName: 'Anamalai Horticulture Farmers Co.',
    status: 'In Transit'
  },
  {
    id: 'LST-TN-113',
    farmerId: 'usr-farmer-13',
    farmerName: 'Chellappa Thevar',
    crop: 'Chilli',
    variety: 'G4 Hot Green',
    quantityKg: 1500,
    initialQuantityKg: 1500,
    allocatedQuantityKg: 1200,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 52.0,
    harvestDate: '2026-09-22',
    availabilityDate: '2026-09-22',
    location: 'Melur, Madurai',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Matched'
  },
  {
    id: 'LST-TN-114',
    farmerId: 'usr-farmer-14',
    farmerName: 'Palanivel Chinnasamy',
    crop: 'Groundnut',
    variety: 'TMV-7 Pods',
    quantityKg: 3500,
    initialQuantityKg: 3500,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 64.0,
    harvestDate: '2026-09-26',
    availabilityDate: '2026-09-26',
    location: 'Usilampatti, Madurai',
    fpoId: 'fpo-tn-03',
    fpoName: 'Cauvery Delta Agro Federation',
    status: 'Listed'
  },
  {
    id: 'LST-TN-115',
    farmerId: 'usr-farmer-15',
    farmerName: 'Rajendran Vaithilingam',
    crop: 'Groundnut',
    variety: 'VRI-2 Kernels',
    quantityKg: 2200,
    initialQuantityKg: 2200,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 68.0,
    harvestDate: '2026-09-24',
    availabilityDate: '2026-09-24',
    location: 'Panruti, Cuddalore',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Listed'
  },
  {
    id: 'LST-TN-116',
    farmerId: 'usr-farmer-16',
    farmerName: 'Sundaramoorthy K.',
    crop: 'Maize',
    variety: 'Feed Grain Standard',
    quantityKg: 3000,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Standard',
    expectedPricePerKg: 21.5,
    harvestDate: '2026-09-27',
    availabilityDate: '2026-09-27',
    location: 'Vridhachalam, Cuddalore',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Listed'
  },
  {
    id: 'LST-TN-117',
    farmerId: 'usr-farmer-01',
    farmerName: 'Subramaniam Ramasamy',
    crop: 'Tomato',
    variety: 'Grade A Table Fresh',
    quantityKg: 0,
    initialQuantityKg: 3000,
    allocatedQuantityKg: 3000,
    unit: 'kg',
    grade: 'Grade A',
    expectedPricePerKg: 28.0,
    harvestDate: '2026-09-13',
    availabilityDate: '2026-09-13',
    location: 'Chinnasalem, Kallakurichi',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Delivered'
  },
  {
    id: 'LST-TN-118',
    farmerId: 'usr-farmer-01',
    farmerName: 'Subramaniam Ramasamy',
    crop: 'Groundnut',
    variety: 'Kallakurichi Bold',
    quantityKg: 1800,
    initialQuantityKg: 1800,
    allocatedQuantityKg: 0,
    unit: 'kg',
    grade: 'Premium',
    expectedPricePerKg: 66.0,
    harvestDate: '2026-09-28',
    availabilityDate: '2026-09-28',
    location: 'Chinnasalem, Kallakurichi',
    fpoId: 'fpo-tn-01',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    status: 'Listed'
  }
];

// ==========================================
// 8. REVERSE AUCTION & SMART MATCHING
// ==========================================
export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [
  {
    id: 'OFF-TN-01',
    auctionId: 'AUC-CH-TOM-3000',
    fpoId: 'fpo-tn-01',
    fpoName: 'GreenHarvest FPO (Kallakurichi Pasumai)',
    quantityKg: 3000,
    pricePerKg: 25.0,
    grade: 'Grade A',
    readinessDate: '2026-09-16 (04:00 PM)',
    estimatedTransportKm: 165,
    reliabilityScore: 95,
    capacityScore: 92,
    matchScore: 94.2,
    status: 'SUBMITTED'
  },
  {
    id: 'OFF-TN-02',
    auctionId: 'AUC-CH-TOM-3000',
    fpoId: 'fpo-tn-02',
    fpoName: 'Salem Kongu Agri Producers Collective',
    quantityKg: 2000,
    pricePerKg: 27.0,
    grade: 'Grade A',
    readinessDate: '2026-09-16 (05:30 PM)',
    estimatedTransportKm: 180,
    reliabilityScore: 92,
    capacityScore: 88,
    matchScore: 90.8,
    status: 'SUBMITTED'
  },
  {
    id: 'OFF-TN-03',
    auctionId: 'AUC-CH-TOM-3000',
    fpoId: 'fpo-tn-03',
    fpoName: 'Farmer B (Tiruvallur Cluster)',
    quantityKg: 1500,
    pricePerKg: 26.0,
    grade: 'Standard',
    readinessDate: '2026-09-17 (08:00 AM)',
    estimatedTransportKm: 45,
    reliabilityScore: 89,
    capacityScore: 85,
    matchScore: 88.4,
    status: 'SUBMITTED'
  },
  {
    id: 'OFF-TN-04',
    auctionId: 'AUC-CH-TOM-3000',
    fpoId: 'fpo-tn-04',
    fpoName: 'Farmer A (Kanchipuram Collective)',
    quantityKg: 1200,
    pricePerKg: 27.0,
    grade: 'Standard',
    readinessDate: '2026-09-17 (09:30 AM)',
    estimatedTransportKm: 55,
    reliabilityScore: 87,
    capacityScore: 82,
    matchScore: 85.6,
    status: 'SUBMITTED'
  }
];

export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [
  {
    id: 'SMS-01',
    supplierName: 'Kallakurichi Pasumai Farmers Producer Co.',
    supplierType: 'FPO',
    crop: 'Tomato',
    availableQtyKg: 3000,
    allocatedQtyKg: 1200,
    distanceKm: 42,
    offeredPricePerKg: 26.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 96,
    capacityScore: 94,
    qualityScore: 98,
    priceScore: 95,
    distanceScore: 92,
    totalMatchScore: 95.0,
    hubProximity: 'Chinnasalem Micro-Hub (4.2 km)',
    status: 'RECOMMENDED',
    reasons: [
      '100% Crop & Variety Compatibility (Sivam Hybrid)',
      'Certified Optical Grade A with Brix 5.2',
      'Pre-cooled active Reefer dock access (Chinnasalem Hub)',
      'Direct Farmgate Payout: 89.2% Net Realization'
    ]
  },
  {
    id: 'SMS-02',
    supplierName: 'Salem Kongu Agri Producers Collective',
    supplierType: 'FPO',
    crop: 'Tomato',
    availableQtyKg: 3500,
    allocatedQtyKg: 1800,
    distanceKm: 68,
    offeredPricePerKg: 26.5,
    qualityGrade: 'Grade A',
    reliabilityScore: 92,
    capacityScore: 90,
    qualityScore: 94,
    priceScore: 92,
    distanceScore: 86,
    totalMatchScore: 90.8,
    hubProximity: 'Valapadi Cold Hub (6.8 km)',
    status: 'RECOMMENDED',
    reasons: [
      'Grade A Verified Table Produce',
      'Solar-powered cold storage aggregation facility',
      'Direct NH-44 highway transit corridor'
    ]
  },
  {
    id: 'SMS-03',
    supplierName: 'Cauvery Delta Agro Federation',
    supplierType: 'FPO',
    crop: 'Paddy',
    availableQtyKg: 6000,
    allocatedQtyKg: 6000,
    distanceKm: 35,
    offeredPricePerKg: 26.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 96,
    capacityScore: 97,
    qualityScore: 95,
    priceScore: 94,
    distanceScore: 93,
    totalMatchScore: 95.0,
    hubProximity: 'Thiruvaiyaru Agro Depot (3.5 km)',
    status: 'RECOMMENDED',
    reasons: [
      'Pure BPT 5204 Sona Masuri Grain Quality',
      'Certified under 14% Moisture Level',
      'Direct civil supplies institutional dispatch hub'
    ]
  },
  {
    id: 'SMS-04',
    supplierName: 'Cauvery Delta Agro Federation',
    supplierType: 'FPO',
    crop: 'Banana',
    availableQtyKg: 3200,
    allocatedQtyKg: 3200,
    distanceKm: 85,
    offeredPricePerKg: 24.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 94,
    capacityScore: 92,
    qualityScore: 95,
    priceScore: 90,
    distanceScore: 84,
    totalMatchScore: 91.0,
    hubProximity: 'Thiruvaiyaru Agro Depot (3.5 km)',
    status: 'RECOMMENDED',
    reasons: [
      'Export-quality Grand Naine Bunches',
      'Integrated foam-cushioned transit crating',
      'Consistent daily supply capability'
    ]
  },
  {
    id: 'SMS-05',
    supplierName: 'Kallakurichi Pasumai Farmers Producer Co.',
    supplierType: 'FPO',
    crop: 'Groundnut',
    availableQtyKg: 3500,
    allocatedQtyKg: 3500,
    distanceKm: 76,
    offeredPricePerKg: 65.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 88,
    capacityScore: 87,
    qualityScore: 90,
    priceScore: 86,
    distanceScore: 84,
    totalMatchScore: 87.0,
    hubProximity: 'Chinnasalem Hub (12 km)',
    status: 'RECOMMENDED',
    reasons: [
      'High oil content TMV-7 & VRI-2 Kernels',
      'Aflatoxin-free verified lab report',
      'Aggregated from 2 certified regional clusters'
    ]
  },
  {
    id: 'SMS-06',
    supplierName: 'Anamalai Horticulture Farmers Co.',
    supplierType: 'FPO',
    crop: 'Tomato',
    availableQtyKg: 2400,
    allocatedQtyKg: 1000,
    distanceKm: 110,
    offeredPricePerKg: 27.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 83,
    capacityScore: 81,
    qualityScore: 86,
    priceScore: 80,
    distanceScore: 75,
    totalMatchScore: 81.0,
    hubProximity: 'Pollachi Agro Center (8.4 km)',
    status: 'RECOMMENDED',
    reasons: [
      'Solid pericarp Shivam Hybrid suited for processing',
      'Higher transit distance compensated by cold chain EV',
      'Supplementary buffer quota for bulk demand'
    ]
  },
  {
    id: 'SMS-07',
    supplierName: 'Salem Kongu Agri Producers Collective',
    supplierType: 'FPO',
    crop: 'Turmeric',
    availableQtyKg: 2500,
    allocatedQtyKg: 0,
    distanceKm: 142,
    offeredPricePerKg: 90.0,
    qualityGrade: 'Premium',
    reliabilityScore: 74,
    capacityScore: 72,
    qualityScore: 78,
    priceScore: 70,
    distanceScore: 66,
    totalMatchScore: 72.0,
    hubProximity: 'Bhavani Aggregation Yard (18 km)',
    status: 'BACKUP',
    reasons: [
      'High Curcumin content (4.8%) Erode Finger',
      'Longer collection distance requires consolidation route',
      'Awaiting secondary FPO aggregator review'
    ]
  },
  {
    id: 'SMS-08',
    supplierName: 'Cauvery Delta Agro Federation',
    supplierType: 'FPO',
    crop: 'Chilli',
    availableQtyKg: 1500,
    allocatedQtyKg: 1200,
    distanceKm: 92,
    offeredPricePerKg: 52.0,
    qualityGrade: 'Grade A',
    reliabilityScore: 88,
    capacityScore: 86,
    qualityScore: 90,
    priceScore: 85,
    distanceScore: 86,
    totalMatchScore: 87.0,
    hubProximity: 'Melur Agro Depot (4.1 km)',
    status: 'RECOMMENDED',
    reasons: [
      'Fresh G4 Green Chilli harvest with high pungency',
      'Sorting and grading completed at farm-gate',
      'Direct cold transit to Chennai commissary'
    ]
  }
];

// ==========================================
// 9. CANDIDATE MICRO-HUBS
// ==========================================
export const CANDIDATE_MICRO_HUBS: MicroHub[] = [
  {
    id: 'HUB-TN-01',
    name: 'Chinnasalem Agro Consolidation Hub',
    region: 'NH-79 Salem-Ulundurpet Corridor',
    lat: 11.6421,
    lng: 78.8752,
    capacityTonnes: 30,
    currentLoadTonnes: 8.5,
    coldStorageAvailable: true,
    score: 96.4,
    distanceToProducersKm: 5.2,
    distanceToDemandKm: 185.0,
    roadAccessibilityScore: 98,
    isRecommended: true,
    selectionReason: 'Centroid aggregation node serving 12 Kallakurichi/Villupuram farmer clusters. Dual NH-79 4-lane arterial road, solar 4°C pre-cooling chambers, and direct dispatch to Chennai.'
  },
  {
    id: 'HUB-TN-02',
    name: 'Valapadi Cold Storage Depot',
    region: 'Salem East Horticultural Belt',
    lat: 11.6542,
    lng: 78.4121,
    capacityTonnes: 25,
    currentLoadTonnes: 12.0,
    coldStorageAvailable: true,
    score: 91.2,
    distanceToProducersKm: 7.8,
    distanceToDemandKm: 210.0,
    roadAccessibilityScore: 94,
    isRecommended: false,
    selectionReason: 'Heavy volume depot for turmeric and tomato sorting; ideal secondary feeder node.'
  },
  {
    id: 'HUB-TN-03',
    name: 'Thiruvaiyaru Grain & Vegetable Hub',
    region: 'Cauvery River Delta Corridor',
    lat: 10.8812,
    lng: 79.1054,
    capacityTonnes: 40,
    currentLoadTonnes: 18.2,
    coldStorageAvailable: false,
    score: 84.6,
    distanceToProducersKm: 6.0,
    distanceToDemandKm: 240.0,
    roadAccessibilityScore: 88,
    isRecommended: false,
    selectionReason: 'High grain and banana staging capacity with active river basin transit.'
  }
];

// ==========================================
// 10. ROUTE PLAN
// ==========================================
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
  // Order 1: Bulk Consolidated Multi-Farmer Order (In Transit with live GPS)
  {
    id: 'ORD-TN-2026-101',
    agreementId: 'AGR-TN-2026-101',
    produceListingId: 'LST-TN-101',
    demandRequestId: 'DEM-BULK-2026-01',
    bulkDemandId: 'DEM-BULK-2026-01',
    batchId: 'AGP-TOM-2026-101',
    farmerId: 'usr-fpo-01',
    farmerName: 'Consolidated Supply (4 Smallholders + FPO)',
    buyerId: 'usr-bulkbuyer-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    crop: 'Tomato',
    variety: 'Sivam Hybrid (Firm Processing)',
    quantityKg: 5000,
    pricePerKg: 30.5,
    totalValue: 152500,
    status: 'In Transit',
    date: '15 Sep 2026',
    deliveryLocation: 'Ambattur Food Processing Terminal, Chennai',
    farmerLocation: 'Chinnasalem - Valapadi Agro Corridor',
    fpoName: 'Kallakurichi Pasumai & Salem Kongu Collective',
    qualityGrade: 'Grade A',
    isBulkOrder: true,
    lifecycleStage: 'IN_TRANSIT',
    multiSupplierAllocations: [
      {
        supplierId: 'usr-farmer-01',
        supplierName: 'Subramaniam Ramasamy (Chinnasalem)',
        supplierType: 'FARMER',
        location: 'Chinnasalem, Kallakurichi',
        crop: 'Tomato',
        variety: 'Sivam Hybrid',
        availableKg: 1200,
        allocatedKg: 1200,
        pricePerKg: 30.5,
        qualityGrade: 'Grade A',
        distanceKm: 42,
        confirmed: true
      },
      {
        supplierId: 'usr-farmer-02',
        supplierName: 'K. Velusamy (Pennagaram)',
        supplierType: 'FARMER',
        location: 'Pennagaram, Villupuram',
        crop: 'Tomato',
        variety: 'Pusa Ruby',
        availableKg: 1000,
        allocatedKg: 1000,
        pricePerKg: 30.0,
        qualityGrade: 'Grade A',
        distanceKm: 58,
        confirmed: true
      },
      {
        supplierId: 'usr-farmer-03',
        supplierName: 'Meenakshi Sundaram (Valapadi)',
        supplierType: 'FARMER',
        location: 'Valapadi, Salem',
        crop: 'Tomato',
        variety: 'Vaishnavi',
        availableKg: 1800,
        allocatedKg: 1800,
        pricePerKg: 30.5,
        qualityGrade: 'Grade A',
        distanceKm: 68,
        confirmed: true
      },
      {
        supplierId: 'usr-farmer-12',
        supplierName: 'Vijayakumar Nachimuthu (Annur)',
        supplierType: 'FARMER',
        location: 'Annur, Coimbatore',
        crop: 'Tomato',
        variety: 'Shivam Hybrid',
        availableKg: 1000,
        allocatedKg: 1000,
        pricePerKg: 30.5,
        qualityGrade: 'Grade A',
        distanceKm: 110,
        confirmed: true
      }
    ],
    farmerContributions: [
      {
        farmerId: 'usr-farmer-01',
        farmerName: 'Subramaniam Ramasamy',
        farmerLocation: 'Chinnasalem, Kallakurichi',
        produceListingId: 'LST-TN-101',
        contributedQuantityKg: 1200,
        collectedQuantityKg: 1200,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 04:00 AM',
        notes: 'Farm-gate collection verified. Brix 5.2 certified.'
      },
      {
        farmerId: 'usr-farmer-02',
        farmerName: 'K. Velusamy',
        farmerLocation: 'Pennagaram, Villupuram',
        produceListingId: 'LST-TN-102',
        contributedQuantityKg: 1000,
        collectedQuantityKg: 1000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 04:35 AM',
        notes: 'Pre-cooled crates loaded.'
      },
      {
        farmerId: 'usr-farmer-03',
        farmerName: 'Meenakshi Sundaram',
        farmerLocation: 'Valapadi, Salem',
        produceListingId: 'LST-TN-103',
        contributedQuantityKg: 1800,
        collectedQuantityKg: 1800,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 05:00 AM',
        notes: 'Graded Grade A certified crates.'
      },
      {
        farmerId: 'usr-farmer-12',
        farmerName: 'Vijayakumar Nachimuthu',
        farmerLocation: 'Annur, Coimbatore',
        produceListingId: 'LST-TN-112',
        contributedQuantityKg: 1000,
        collectedQuantityKg: 1000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 05:15 AM',
        notes: 'Direct hub consolidation complete.'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 5000,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 5000,
    rejectedQuantityKg: 0,
    packingStatus: 'Packed',
    packedQuantityKg: 5000,
    crateCount: 200,
    packageType: 'Ventilated 25kg Food-Grade Agro Crates with Tamper-Evident QR Barcode Seal',
    isReadyForTransport: true,
    transportStatus: 'In Transit',
    transportDetails: {
      carrierName: 'Sundar Transport & Cold Chain',
      vehicleNumber: 'TN-15-AGRI-5510',
      driverName: 'Karthik Subramanian',
      driverPhone: '+91 98410 44021',
      vehicleType: 'Tata Ace CoolReefer EV 5.5T',
      departureTime: '05:30 AM',
      estimatedArrival: 'Today, 07:15 AM',
      assignedAt: '2026-09-15 05:15',
      temperatureC: 4.2
    },
    gpsTracking: {
      isLive: true,
      currentLat: 13.0489,
      currentLng: 80.0912,
      speedKmH: 52,
      reeferTempC: 4.2,
      distanceCoveredKm: 56.4,
      remainingDistanceKm: 18.2,
      estimatedArrival: 'Today, 07:15 AM',
      lastPingAt: 'Just now (Active Telemetry Cycle #48)',
      routeWaypoints: [
        { lat: 11.6421, lng: 78.8752, label: 'Farmer 1 (Chinnasalem - 1,200 kg)', type: 'PICKUP', timestamp: '04:00 AM', completed: true },
        { lat: 11.7104, lng: 79.1205, label: 'Farmer 2 (Pennagaram - 1,000 kg)', type: 'PICKUP', timestamp: '04:35 AM', completed: true },
        { lat: 11.6421, lng: 78.8752, label: 'Chinnasalem Agro Consolidation Hub (Aggregation & QC)', type: 'HUB', timestamp: '05:15 AM', completed: true },
        { lat: 13.0489, lng: 80.0912, label: 'CoolReefer EV TN-15-AGRI-5510 (Current Location - NH-48)', type: 'TRANSIT', timestamp: 'Live', completed: false },
        { lat: 13.1143, lng: 80.1548, label: 'WayCool Food Processing Terminal (Ambattur, Chennai)', type: 'DESTINATION', timestamp: 'ETA 07:15 AM', completed: false }
      ]
    },
    inspectionMetrics: {
      sugarBrix: 5.2,
      firmnessKgCm: 3.8,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '91.5%',
      verifiedGrade: 'Grade A',
      inspectorName: 'Dr. R. Malathi (FPO QA Officer)',
      inspectionDate: '15 Sep 2026, 05:00 AM',
      hubLocation: 'Chinnasalem Agro Consolidation Hub',
      status: 'PASSED',
      acceptedQuantityKg: 5000,
      rejectedQuantityKg: 0,
      inspectionNotes: 'Bulk lot uniformly graded Grade A. Firm pericarp, zero bruising, laboratory Brix 5.2 certified.'
    },
    timeline: [
      { step: 'DEMAND_CREATED', title: 'Bulk Demand Published (5,000 kg)', location: 'WayCool Ambattur Dock', timestamp: '13 Sep 2026, 07:30 AM', operator: 'Vikramaditya Singhania', completed: true },
      { step: 'SUPPLIERS_MATCHED', title: 'Smart Multi-Supplier Match Formed', location: 'Uzhavan AI Engine', timestamp: '13 Sep 2026, 07:32 AM', operator: 'Algorithmic Router', completed: true },
      { step: 'SUPPLY_CONFIRMED', title: 'Supply Confirmed (4 Farmers + FPO)', location: 'Uzhavan Platform', timestamp: '13 Sep 2026, 08:00 AM', operator: 'WayCool Procurement Desk', completed: true },
      { step: 'PRODUCE_READY', title: 'Farm Harvest Sorted at Farm Gate', location: 'Chinnasalem & Valapadi', timestamp: '15 Sep 2026, 03:30 AM', operator: 'Farmer Producer Collective', completed: true },
      { step: 'COLLECTION_SCHEDULED', title: 'Multi-Stop Collection Route Scheduled', location: 'Logistics Tower', timestamp: '15 Sep 2026, 03:45 AM', operator: 'Sundar Dispatch Tower', completed: true },
      { step: 'COLLECTED', title: 'All 4 Farm Batches Collected (5,000 kg)', location: 'Farm Gates', timestamp: '15 Sep 2026, 05:00 AM', operator: 'Sundar Fleet Cold Crew', completed: true },
      { step: 'AT_AGGREGATION_HUB', title: 'Consolidated at Chinnasalem Hub', location: 'Chinnasalem Agro Hub', timestamp: '15 Sep 2026, 05:10 AM', operator: 'Hub Warehouse In-Charge', completed: true },
      { step: 'QUALITY_VERIFIED', title: 'NABL Quality & Brix 5.2 Verified', location: 'Hub QC Bay', timestamp: '15 Sep 2026, 05:15 AM', operator: 'Dr. R. Malathi', completed: true },
      { step: 'LOADED_FOR_TRANSPORT', title: '200 Crates Loaded into CoolReefer EV', location: 'Hub Dock #1', timestamp: '15 Sep 2026, 05:25 AM', operator: 'Logistics Cold Crew', completed: true },
      { step: 'IN_TRANSIT', title: 'En Route via NH-48 Express (Active)', location: 'NH-48 Arterial Expressway', timestamp: '15 Sep 2026, 05:30 AM', operator: 'Driver: Karthik Subramanian', completed: true },
      { step: 'NEAR_DESTINATION', title: 'Approaching Ambattur Dock (~15 mins)', location: 'Chennai Outer Ring Road', timestamp: 'Expected 07:00 AM', operator: 'Telematics Geofence', completed: false },
      { step: 'DELIVERED', title: 'Arrival & Crates Unloading at Bay', location: 'WayCool Processing Dock', timestamp: 'Expected 07:15 AM', operator: 'Dock Receiving Officer', completed: false },
      { step: 'DELIVERY_CONFIRMED', title: 'Digital Crates & Weight Acceptance OTP', location: 'WayCool Quality Desk', timestamp: 'Pending Arrival', operator: 'Vikramaditya Singhania', completed: false },
      { step: 'SETTLEMENT_COMPLETED', title: 'Programmable Escrow Farmer Payout', location: 'e-RUPI Banking Gateway', timestamp: 'Auto on Verification', operator: 'NPCI / RBI Escrow', completed: false }
    ],
    settlementId: 'SETTLE-2026-101'
  },

  // Order 2: Delivered & Completed Order with Full Escrow Settlement
  {
    id: 'ORD-TN-2026-102',
    agreementId: 'AGR-TN-2026-102',
    produceListingId: 'LST-TN-117',
    demandRequestId: 'DEM-TN-101',
    batchId: 'AGP-TOM-2026-102',
    farmerId: 'usr-farmer-01',
    farmerName: 'Subramaniam Ramasamy',
    buyerId: 'BUYER-BULK-02',
    buyerName: 'Nilgiris Supermarket Supply Chain',
    crop: 'Tomato',
    variety: 'Grade A Table Fresh',
    quantityKg: 3000,
    pricePerKg: 28.0,
    totalValue: 84000,
    status: 'Delivered',
    date: '14 Sep 2026',
    deliveryLocation: 'Koyambedu Distribution Terminal, Chennai',
    farmerLocation: 'Chinnasalem, Kallakurichi',
    fpoName: 'Kallakurichi Pasumai Farmers Producer Co.',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-01',
        farmerName: 'Subramaniam Ramasamy',
        farmerLocation: 'Chinnasalem, Kallakurichi',
        produceListingId: 'LST-TN-117',
        contributedQuantityKg: 3000,
        collectedQuantityKg: 3000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '14 Sep 2026, 04:30 AM',
        notes: 'Harvested from Block 1. High firm grade.'
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
    packageType: 'Ventilated 25kg Agro Crates with Tamper-Evident QR Barcode Seal',
    isReadyForTransport: true,
    transportStatus: 'Delivered',
    inspectionMetrics: {
      sugarBrix: 5.0,
      firmnessKgCm: 3.6,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '92.0%',
      verifiedGrade: 'Grade A',
      inspectorName: 'Dr. R. Malathi',
      inspectionDate: '14 Sep 2026, 05:30 AM',
      hubLocation: 'Chinnasalem Agro Consolidation Hub',
      status: 'PASSED',
      acceptedQuantityKg: 3000,
      rejectedQuantityKg: 0
    },
    transportDetails: {
      carrierName: 'Sundar Transport & Cold Chain',
      vehicleNumber: 'TN-15-AGRI-5510',
      driverName: 'Karthik Subramanian',
      driverPhone: '+91 98410 44021',
      vehicleType: 'Tata Ace CoolReefer EV 3.5T',
      assignedAt: '14 Sep 2026, 05:30 AM',
      estimatedArrival: '14 Sep 2026, 06:45 AM'
    },
    buyerConfirmation: {
      orderId: 'ORD-TN-2026-102',
      deliveredQuantityKg: 3000,
      receivedQuantityKg: 3000,
      acceptedQuantityKg: 3000,
      rejectedQuantityKg: 0,
      acceptanceStatus: 'ACCEPTED_FULL',
      issuesReported: 'All 120 crates received intact at 4.0°C. Verified Grade A.',
      receiverName: 'S. Sundaresan (Procurement Head)',
      receiverRole: 'Receiving Logistics In-Charge',
      confirmedAt: '2026-09-14 06:45',
      signatureOrOtp: 'OTP-CONFIRMED-849201'
    },
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Chinnasalem Farm', timestamp: '13 Sep 2026, 07:00 AM', operator: 'Subramaniam Ramasamy', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '13 Sep 2026, 08:30 AM', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Produce Collected', location: 'Chinnasalem Farm Gate', timestamp: '14 Sep 2026, 04:30 AM', operator: 'FPO Field Logistics', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Graded & Certified', location: 'Chinnasalem Hub Lab', timestamp: '14 Sep 2026, 05:30 AM', operator: 'Dr. R. Malathi', completed: true },
      { step: 'PACKED', title: 'Crated & QR Tagged', location: 'Chinnasalem Hub', timestamp: '14 Sep 2026, 05:45 AM', operator: 'FPO Packing Unit', completed: true },
      { step: 'IN_TRANSIT', title: 'In Transit via Reefer EV', location: 'NH-79 Expressway', timestamp: '14 Sep 2026, 05:50 AM', operator: 'Karthik Subramanian', completed: true },
      { step: 'DELIVERED', title: 'Delivered at Buyer Hub', location: 'Koyambedu Distribution Terminal', timestamp: '14 Sep 2026, 06:45 AM', operator: 'Receiving Team', completed: true }
    ],
    settlementId: 'SETTLE-2026-102'
  },

  // Order 3: Banana Order (Packed & Ready for Transport Assignment)
  {
    id: 'ORD-TN-2026-103',
    agreementId: 'AGR-TN-2026-103',
    produceListingId: 'LST-TN-107',
    demandRequestId: 'DEM-TN-102',
    batchId: 'AGP-BAN-2026-103',
    farmerId: 'usr-farmer-07',
    farmerName: 'Govindasamy Radhakrishnan',
    buyerId: 'BUYER-BULK-03',
    buyerName: 'MilkyMist Agri & Value Products Ltd.',
    crop: 'Banana',
    variety: 'Grand Naine',
    quantityKg: 3200,
    pricePerKg: 25.5,
    totalValue: 81600,
    status: 'Packed',
    date: '15 Sep 2026',
    deliveryLocation: 'Perundurai Food Park, Erode',
    farmerLocation: 'Musiri, Tiruchirappalli',
    fpoName: 'Cauvery Delta Agro Federation',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-07',
        farmerName: 'Govindasamy Radhakrishnan',
        farmerLocation: 'Musiri, Tiruchirappalli',
        produceListingId: 'LST-TN-107',
        contributedQuantityKg: 3200,
        collectedQuantityKg: 3200,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 05:00 AM',
        notes: 'Harvested directly from orchard. Foam packed.'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 3200,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 3200,
    rejectedQuantityKg: 0,
    packingStatus: 'Packed',
    packedQuantityKg: 3200,
    crateCount: 128,
    packageType: 'Ventilated 25kg Cushioned Agro Crates with Tamper-Evident QR Barcode Seal',
    isReadyForTransport: true,
    transportStatus: 'Ready for Pickup',
    inspectionMetrics: {
      sugarBrix: 19.5,
      firmnessKgCm: 4.2,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '74.0%',
      verifiedGrade: 'Grade A',
      inspectorName: 'S. Shanmugam',
      inspectionDate: '15 Sep 2026, 06:15 AM',
      hubLocation: 'Thiruvaiyaru Grain & Vegetable Hub',
      status: 'PASSED',
      acceptedQuantityKg: 3200,
      rejectedQuantityKg: 0
    },
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Musiri Orchard', timestamp: '14 Sep 2026, 08:00 AM', operator: 'Govindasamy Radhakrishnan', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '14 Sep 2026, 10:30 AM', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Produce Collected', location: 'Musiri Farm Gate', timestamp: '15 Sep 2026, 05:00 AM', operator: 'Cauvery Delta FPO Logistics', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Quality Graded & Certified', location: 'Thiruvaiyaru Hub', timestamp: '15 Sep 2026, 06:15 AM', operator: 'S. Shanmugam', completed: true },
      { step: 'PACKED', title: 'Packed in Foam-Cushioned Crates', location: 'Hub Dispatch Bay 2', timestamp: '15 Sep 2026, 06:45 AM', operator: 'FPO Packing Unit', completed: true }
    ]
  },

  // Order 4: Onion Order (Collected at Hub & Undergoing Quality Assay)
  {
    id: 'ORD-TN-2026-104',
    produceListingId: 'LST-TN-108',
    demandRequestId: 'DEM-TN-103',
    batchId: 'AGP-ONI-2026-104',
    farmerId: 'usr-farmer-08',
    farmerName: 'Marimuthu Karuppan',
    buyerId: 'BUYER-BULK-04',
    buyerName: 'Kovai Fresh Mega Wholesale Mart',
    crop: 'Onion',
    variety: 'Bellary Small',
    quantityKg: 2800,
    pricePerKg: 33.0,
    totalValue: 92400,
    status: 'Collected',
    date: '15 Sep 2026',
    deliveryLocation: 'R.S. Puram Terminal, Coimbatore',
    farmerLocation: 'Lalgudi, Tiruchirappalli',
    fpoName: 'Cauvery Delta Agro Federation',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-08',
        farmerName: 'Marimuthu Karuppan',
        farmerLocation: 'Lalgudi, Tiruchirappalli',
        produceListingId: 'LST-TN-108',
        contributedQuantityKg: 2800,
        collectedQuantityKg: 2800,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '15 Sep 2026, 06:00 AM',
        notes: 'Dry skin cured onions received at hub.'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 2800,
    remainingCollectionKg: 0,
    qualityStatus: 'Pending',
    acceptedQuantityKg: 0,
    rejectedQuantityKg: 0,
    packingStatus: 'Packing Pending',
    packedQuantityKg: 0,
    isReadyForTransport: false,
    transportStatus: 'Transport Pending',
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Lalgudi Farm Fields', timestamp: '14 Sep 2026, 09:00 AM', operator: 'Marimuthu Karuppan', completed: true },
      { step: 'MATCHED', title: 'Matched & Agreed', location: 'Uzhavan AI Engine', timestamp: '14 Sep 2026, 11:30 AM', operator: 'System', completed: true },
      { step: 'COLLECTED', title: 'Collected at Hub Reception', location: 'Thiruvaiyaru Agro Hub', timestamp: '15 Sep 2026, 06:00 AM', operator: 'Cauvery Delta In-Charge', completed: true }
    ]
  },

  // Order 5: Chilli Order (FPO Approved & Awaiting Farm-Gate Collection)
  {
    id: 'ORD-TN-2026-105',
    produceListingId: 'LST-TN-113',
    demandRequestId: 'DEM-TN-104',
    batchId: 'AGP-CHL-2026-105',
    farmerId: 'usr-farmer-13',
    farmerName: 'Chellappa Thevar',
    buyerId: 'BUYER-BULK-05',
    buyerName: 'Ananda Grand Hospitality & Caterers',
    crop: 'Chilli',
    variety: 'G4 Hot Green',
    quantityKg: 1200,
    pricePerKg: 52.0,
    totalValue: 62400,
    status: 'Produce Collection Pending',
    date: '15 Sep 2026',
    deliveryLocation: 'Guindy Central Commissary, Chennai',
    farmerLocation: 'Melur, Madurai',
    fpoName: 'Cauvery Delta Agro Federation',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-13',
        farmerName: 'Chellappa Thevar',
        farmerLocation: 'Melur, Madurai',
        produceListingId: 'LST-TN-113',
        contributedQuantityKg: 1200,
        collectedQuantityKg: 0,
        collectionStatus: 'PENDING',
        notes: 'Graded fresh harvest ready at farm gate'
      }
    ],
    collectionStatus: 'Collection Pending',
    collectedQuantityKg: 0,
    remainingCollectionKg: 1200,
    qualityStatus: 'Pending',
    acceptedQuantityKg: 0,
    rejectedQuantityKg: 0,
    packingStatus: 'Packing Pending',
    packedQuantityKg: 0,
    isReadyForTransport: false,
    transportStatus: 'Transport Pending',
    timeline: [
      { step: 'LISTED', title: 'Crop Listed', location: 'Melur Fields', timestamp: '14 Sep 2026, 07:30 AM', operator: 'Chellappa Thevar', completed: true },
      { step: 'MATCHED', title: 'AI Matched & FPO Approved', location: 'Uzhavan Platform', timestamp: '14 Sep 2026, 12:00 PM', operator: 'FPO Approver', completed: true },
      { step: 'COLLECTED', title: 'Awaiting Farm-Gate Pickup', location: 'Melur Farm Gate', timestamp: 'Pending', operator: 'FPO Field Team', completed: false }
    ]
  },

  // Order 6: Groundnut Order (Supply Confirmed — Collection Scheduled)
  {
    id: 'ORD-TN-2026-106',
    agreementId: 'AGR-TN-2026-106',
    produceListingId: 'LST-TN-114',
    demandRequestId: 'DEM-TN-107',
    batchId: 'AGP-GND-2026-106',
    farmerId: 'usr-farmer-14',
    farmerName: 'Palanivel Chinnasamy',
    buyerId: 'usr-bulkbuyer-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    crop: 'Groundnut',
    variety: 'TMV-7 Pods',
    quantityKg: 3500,
    pricePerKg: 65.0,
    totalValue: 227500,
    status: 'Confirmed',
    date: '15 Sep 2026',
    deliveryLocation: 'Ambattur Food Processing Terminal, Chennai',
    farmerLocation: 'Usilampatti, Madurai',
    fpoName: 'Cauvery Delta Agro Federation',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-14',
        farmerName: 'Palanivel Chinnasamy',
        farmerLocation: 'Usilampatti, Madurai',
        produceListingId: 'LST-TN-114',
        contributedQuantityKg: 3500,
        collectedQuantityKg: 0,
        collectionStatus: 'PENDING',
        notes: 'TMV-7 bold pods sorted at farm. Collection scheduled 21 Sep.'
      }
    ],
    collectionStatus: 'Collection Pending',
    collectedQuantityKg: 0,
    remainingCollectionKg: 3500,
    qualityStatus: 'Pending',
    acceptedQuantityKg: 0,
    rejectedQuantityKg: 0,
    packingStatus: 'Packing Pending',
    packedQuantityKg: 0,
    isReadyForTransport: false,
    transportStatus: 'Transport Pending',
    timeline: [
      { step: 'DEMAND_CREATED', title: 'Demand Published (3,500 kg Groundnut)', location: 'WayCool Ambattur Terminal', timestamp: '15 Sep 2026, 10:30 AM', operator: 'Vikramaditya Singhania', completed: true },
      { step: 'SUPPLIERS_MATCHED', title: 'Smart Match — Palanivel Chinnasamy (95% score)', location: 'Uzhavan AI Engine', timestamp: '15 Sep 2026, 10:32 AM', operator: 'Algorithmic Router', completed: true },
      { step: 'SUPPLY_CONFIRMED', title: 'Supply Confirmed via Cauvery Delta FPO', location: 'Uzhavan Platform', timestamp: '15 Sep 2026, 11:00 AM', operator: 'FPO Aggregator (Rajagopalan)', completed: true },
      { step: 'COLLECTION_SCHEDULED', title: 'Farm-Gate Collection Scheduled', location: 'Usilampatti Farm', timestamp: '21 Sep 2026, 06:00 AM (Scheduled)', operator: 'Logistics Dispatch Tower', completed: false }
    ],
    settlementId: 'SETTLE-2026-106'
  },

  // Order 7: Paddy Order — Completed with Full Institutional Settlement
  {
    id: 'ORD-TN-2026-107',
    agreementId: 'AGR-TN-2026-107',
    produceListingId: 'LST-TN-109',
    demandRequestId: 'DEM-TN-106',
    batchId: 'AGP-PDY-2026-107',
    farmerId: 'usr-farmer-09',
    farmerName: 'Balasubramanian Sethuraman',
    buyerId: 'BUYER-BULK-06',
    buyerName: 'Tamil Nadu Civil Supplies / Mid-Day Meal Procurement',
    crop: 'Paddy',
    variety: 'BPT 5204 Sona Masuri',
    quantityKg: 6000,
    pricePerKg: 26.5,
    totalValue: 159000,
    status: 'Completed',
    date: '14 Sep 2026',
    deliveryLocation: 'Central Grain Warehouse, Trichy',
    farmerLocation: 'Thiruvaiyaru, Thanjavur',
    fpoName: 'Cauvery Delta Agro Federation',
    qualityGrade: 'Grade A',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-09',
        farmerName: 'Balasubramanian Sethuraman',
        farmerLocation: 'Thiruvaiyaru, Thanjavur',
        produceListingId: 'LST-TN-109',
        contributedQuantityKg: 6000,
        collectedQuantityKg: 6000,
        collectionStatus: 'FULLY_COLLECTED',
        collectedAt: '14 Sep 2026, 05:30 AM',
        agreedPricePerKg: 26.5,
        settlementAmount: 141810,
        settlementStatus: 'COMPLETED',
        farmerUtr: 'UTR-FARM-PDY-107',
        settledAt: '14 Sep 2026, 10:00 AM',
        notes: 'BPT 5204 Sona Masuri — moisture 13.8%. Aflatoxin ND.'
      }
    ],
    collectionStatus: 'Fully Collected',
    collectedQuantityKg: 6000,
    remainingCollectionKg: 0,
    qualityStatus: 'Passed',
    acceptedQuantityKg: 5820,
    rejectedQuantityKg: 180,
    packingStatus: 'Packed',
    packedQuantityKg: 5820,
    crateCount: 232,
    packageType: '25 kg Jute Grain Sacks with Tamper-Evident QR Label',
    isReadyForTransport: true,
    transportStatus: 'Delivered',
    inspectionMetrics: {
      sugarBrix: 0,
      firmnessKgCm: 0,
      pesticideResidueTest: 'PASS - Standard Compliant',
      moistureContent: '13.8%',
      verifiedGrade: 'Grade A',
      inspectorName: 'M. Chandrasekaran (APMC Lab)',
      inspectionDate: '14 Sep 2026, 06:00 AM',
      hubLocation: 'Thiruvaiyaru Grain & Vegetable Hub',
      status: 'PASSED',
      acceptedQuantityKg: 5820,
      rejectedQuantityKg: 180,
      rejectionReason: '180 kg chaff and moisture-excess rejected at QC',
      inspectionNotes: 'Bulk lot 97% Grade A. 3% reject removed. Net 5,820 kg dispatched.'
    },
    transportDetails: {
      carrierName: 'Sundar Transport & Cold Chain',
      vehicleNumber: 'TN-45-AGRI-7721',
      driverName: 'Anbarasan Ravi',
      driverPhone: '+91 97890 12344',
      vehicleType: 'Ashok Leyland 10-Tonne Grain Carrier',
      departureTime: '14 Sep 2026, 07:00 AM',
      estimatedArrival: '14 Sep 2026, 09:30 AM',
      assignedAt: '2026-09-14 06:45',
      temperatureC: 'Ambient'
    },
    buyerConfirmation: {
      orderId: 'ORD-TN-2026-107',
      deliveredQuantityKg: 5820,
      receivedQuantityKg: 5820,
      acceptedQuantityKg: 5820,
      rejectedQuantityKg: 0,
      acceptanceStatus: 'ACCEPTED_FULL',
      issuesReported: 'All 232 sacks received intact. Moisture ≤14% verified on-site.',
      receiverName: 'M. Sadasivam (Civil Supplies In-Charge)',
      receiverRole: 'Grain Procurement Officer',
      confirmedAt: '2026-09-14 09:45',
      signatureOrOtp: 'OTP-CONFIRMED-730192'
    },
    feedbackSubmitted: true,
    timeline: [
      { step: 'DEMAND_CREATED', title: 'Institutional Demand Published (6,000 kg Paddy)', location: 'TN Civil Supplies, Trichy', timestamp: '11 Sep 2026, 09:00 AM', operator: 'M. Sadasivam', completed: true },
      { step: 'SUPPLIERS_MATCHED', title: 'Cauvery Delta FPO — 95% Match Score', location: 'Uzhavan AI Engine', timestamp: '11 Sep 2026, 09:03 AM', operator: 'Algorithmic Router', completed: true },
      { step: 'SUPPLY_CONFIRMED', title: 'Supply Confirmed (6,000 kg Sona Masuri)', location: 'Uzhavan Platform', timestamp: '11 Sep 2026, 10:00 AM', operator: 'Rajagopalan FPO', completed: true },
      { step: 'COLLECTED', title: 'Farm-Gate Collection Complete', location: 'Thiruvaiyaru Farm Gate', timestamp: '14 Sep 2026, 05:30 AM', operator: 'Cauvery Delta Field Crew', completed: true },
      { step: 'QUALITY_VERIFIED', title: 'APMC Quality & Moisture Certified', location: 'Thiruvaiyaru Hub Lab', timestamp: '14 Sep 2026, 06:00 AM', operator: 'M. Chandrasekaran', completed: true },
      { step: 'LOADED_FOR_TRANSPORT', title: '232 Sacks Loaded into Grain Carrier', location: 'Hub Dispatch Bay', timestamp: '14 Sep 2026, 06:45 AM', operator: 'Logistics Crew', completed: true },
      { step: 'IN_TRANSIT', title: 'En Route to Central Grain Warehouse', location: 'Trichy NH-67', timestamp: '14 Sep 2026, 07:00 AM', operator: 'Anbarasan Ravi', completed: true },
      { step: 'DELIVERED', title: 'Delivered at Civil Supplies Warehouse', location: 'Central Grain Warehouse, Trichy', timestamp: '14 Sep 2026, 09:30 AM', operator: 'Dock Receiving Officer', completed: true },
      { step: 'DELIVERY_CONFIRMED', title: 'OTP Acceptance by Civil Supplies', location: 'TN Civil Supplies Trichy', timestamp: '14 Sep 2026, 09:45 AM', operator: 'M. Sadasivam', completed: true },
      { step: 'SETTLEMENT_COMPLETED', title: 'e-RUPI Farmer Payout Completed', location: 'e-RUPI Banking Gateway', timestamp: '14 Sep 2026, 10:00 AM', operator: 'NPCI / RBI Escrow', completed: true }
    ],
    settlementId: 'SETTLE-2026-107'
  },

  // Order 8: Turmeric Order (AI Matching in Progress)
  {
    id: 'ORD-TN-2026-108',
    produceListingId: 'LST-TN-105',
    demandRequestId: 'DEM-TN-105',
    batchId: 'AGP-TUR-2026-108',
    farmerId: 'usr-farmer-05',
    farmerName: 'Arumugam Natarajan',
    buyerId: 'usr-buyer-01',
    buyerName: 'ABC Retail Stores & Consumer Coops',
    crop: 'Turmeric',
    variety: 'Erode Finger Grade A',
    quantityKg: 2500,
    pricePerKg: 90.0,
    totalValue: 225000,
    status: 'Pending',
    date: '15 Sep 2026',
    deliveryLocation: 'Koyambedu Hub, Chennai',
    farmerLocation: 'Bhavani, Erode',
    fpoName: 'Salem Kongu Agri Producers Collective',
    qualityGrade: 'Premium',
    farmerContributions: [
      {
        farmerId: 'usr-farmer-05',
        farmerName: 'Arumugam Natarajan',
        farmerLocation: 'Bhavani, Erode',
        produceListingId: 'LST-TN-105',
        contributedQuantityKg: 2500,
        collectedQuantityKg: 0,
        collectionStatus: 'PENDING',
        notes: 'Erode Finger variety. Curcumin 4.8%. Solar dried below 10% moisture.'
      }
    ],
    collectionStatus: 'Collection Pending',
    collectedQuantityKg: 0,
    remainingCollectionKg: 2500,
    qualityStatus: 'Pending',
    acceptedQuantityKg: 0,
    rejectedQuantityKg: 0,
    packingStatus: 'Packing Pending',
    packedQuantityKg: 0,
    isReadyForTransport: false,
    transportStatus: 'Transport Pending',
    timeline: [
      { step: 'DEMAND_CREATED', title: 'Demand Published (2,500 kg Premium Turmeric)', location: 'ABC Retail Koyambedu', timestamp: '15 Sep 2026, 08:00 AM', operator: 'Anita Sharma', completed: true },
      { step: 'SUPPLIERS_MATCHED', title: 'AI Matching in Progress — 2 Candidates', location: 'Uzhavan AI Engine', timestamp: '15 Sep 2026, 09:00 AM', operator: 'Algorithmic Router', completed: true },
      { step: 'SUPPLY_CONFIRMED', title: 'Awaiting FPO Supply Confirmation', location: 'Salem Kongu FPO', timestamp: 'Pending', operator: 'P. Shanmugasundaram', completed: false }
    ]
  }
];


// ==========================================
// 14. WORKFLOW AGREEMENTS
// ==========================================
export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [
  {
    id: 'AGR-TN-2026-101',
    demandRequestId: 'DEM-BULK-2026-01',
    produceListingId: 'LST-TN-101',
    farmerId: 'usr-fpo-01',
    farmerName: 'Kallakurichi Pasumai & Salem Kongu Collective',
    buyerId: 'usr-bulkbuyer-01',
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    crop: 'Tomato',
    agreedQuantityKg: 5000,
    agreedPricePerKg: 30.5,
    totalAgreedValue: 152500,
    agreementDate: '13 Sep 2026',
    status: 'CONFIRMED'
  },
  {
    id: 'AGR-TN-2026-102',
    demandRequestId: 'DEM-TN-101',
    produceListingId: 'LST-TN-117',
    farmerId: 'usr-farmer-01',
    farmerName: 'Subramaniam Ramasamy',
    buyerId: 'BUYER-BULK-02',
    buyerName: 'Nilgiris Supermarket Supply Chain',
    crop: 'Tomato',
    agreedQuantityKg: 3000,
    agreedPricePerKg: 28.0,
    totalAgreedValue: 84000,
    agreementDate: '13 Sep 2026',
    status: 'CONFIRMED'
  },
  {
    id: 'AGR-TN-2026-103',
    demandRequestId: 'DEM-TN-102',
    produceListingId: 'LST-TN-107',
    farmerId: 'usr-farmer-07',
    farmerName: 'Govindasamy Radhakrishnan',
    buyerId: 'BUYER-BULK-03',
    buyerName: 'MilkyMist Agri & Value Products Ltd.',
    crop: 'Banana',
    agreedQuantityKg: 3200,
    agreedPricePerKg: 25.5,
    totalAgreedValue: 81600,
    agreementDate: '14 Sep 2026',
    status: 'CONFIRMED'
  }
];

// ==========================================
// 15. PRODUCE PASSPORTS (Cryptographic Traceability)
// ==========================================
export const INITIAL_PASSPORTS: ProducePassport[] = [
  DEMO_PRODUCE_PASSPORT,
  {
    batchId: 'AGP-TOM-2026-102',
    crop: 'Tomato',
    variety: 'Grade A Table Fresh',
    farmerOrFpo: 'Subramaniam Ramasamy & Kallakurichi FPO',
    farmLocation: 'Chinnasalem, Kallakurichi, Tamil Nadu',
    harvestDate: '13 Sep 2026',
    quantityKg: 3000,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 5.0,
      firmnessKgCm: 3.6,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '92.0%'
    },
    collectionHub: 'Chinnasalem Agro Consolidation Hub',
    shipmentId: 'SHP-TN-5510',
    vehicleNumber: 'TN-15-AGRI-5510',
    destination: 'Koyambedu Distribution Terminal, Chennai',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-TOM-2026-102',
    currentStatus: 'Delivered',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested at Chinnasalem Fields', location: 'Chinnasalem Farm', timestamp: '13 Sep 2026, 06:30 AM', operator: 'Subramaniam Ramasamy', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Optical Quality Graded', location: 'Chinnasalem Hub Lab', timestamp: '14 Sep 2026, 05:30 AM', operator: 'Dr. R. Malathi', completed: true },
      { step: 'PACKED', title: 'Crated & Tamper Sealed', location: 'Chinnasalem Hub', timestamp: '14 Sep 2026, 05:45 AM', operator: 'FPO Packing Unit', completed: true },
      { step: 'IN_TRANSIT', title: 'In Transit via CoolReefer EV', location: 'NH-79 / NH-48 Express', timestamp: '14 Sep 2026, 05:50 AM', operator: 'Driver: Karthik S.', completed: true },
      { step: 'DELIVERED', title: 'Delivered at Koyambedu Terminal', location: 'Koyambedu Terminal', timestamp: '14 Sep 2026, 06:45 AM', operator: 'Nilgiris Receiving Officer', completed: true }
    ]
  },
  {
    batchId: 'AGP-BAN-2026-103',
    crop: 'Banana',
    variety: 'Grand Naine',
    farmerOrFpo: 'Govindasamy Radhakrishnan & Cauvery Delta FPO',
    farmLocation: 'Musiri, Tiruchirappalli, Tamil Nadu',
    harvestDate: '15 Sep 2026',
    quantityKg: 3200,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 19.5,
      firmnessKgCm: 4.2,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '74.0%'
    },
    collectionHub: 'Thiruvaiyaru Grain & Vegetable Hub',
    shipmentId: 'SHP-TN-5511',
    vehicleNumber: 'TN-45-AGRI-3318',
    destination: 'Perundurai Food Park, Erode',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-BAN-2026-103',
    currentStatus: 'Packed',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested from Musiri Orchard', location: 'Musiri', timestamp: '15 Sep 2026, 05:00 AM', operator: 'Govindasamy Radhakrishnan', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Certified Grade A', location: 'Thiruvaiyaru Hub', timestamp: '15 Sep 2026, 06:15 AM', operator: 'S. Shanmugam', completed: true },
      { step: 'PACKED', title: 'Packed in Ventilated Crates', location: 'Hub Dispatch Bay 2', timestamp: '15 Sep 2026, 06:45 AM', operator: 'Packing Team', completed: true }
    ]
  },
  {
    batchId: 'AGP-ONI-2026-104',
    crop: 'Onion',
    variety: 'Bellary Small',
    farmerOrFpo: 'Marimuthu Karuppan & Cauvery Delta FPO',
    farmLocation: 'Lalgudi, Tiruchirappalli, Tamil Nadu',
    harvestDate: '15 Sep 2026',
    quantityKg: 2800,
    qualityGrade: 'Grade A',
    inspectionMetrics: {
      sugarBrix: 6.8,
      firmnessKgCm: 4.4,
      pesticideResidueTest: 'PASS - Organic / ND',
      moistureContent: '84.0%'
    },
    collectionHub: 'Thiruvaiyaru Grain & Vegetable Hub',
    shipmentId: 'SHP-TN-5512',
    vehicleNumber: 'Pending Allocation',
    destination: 'R.S. Puram Terminal, Coimbatore',
    qrCodeUrl: 'https://uzhavanconnect.gov.in/trace/AGP-ONI-2026-104',
    currentStatus: 'Harvested',
    timeline: [
      { step: 'HARVESTED', title: 'Harvested at Lalgudi Farm', location: 'Lalgudi Farm Fields', timestamp: '15 Sep 2026, 06:00 AM', operator: 'Marimuthu Karuppan', completed: true },
      { step: 'QUALITY_CHECKED', title: 'Undergoing NABL Quality Assay', location: 'Thiruvaiyaru Hub', timestamp: 'Pending', operator: 'Lab Inspector', completed: false }
    ]
  }
];

// ==========================================
// 16. ESCROW SETTLEMENTS
// ==========================================
export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  DEMO_SETTLEMENT,
  {
    id: 'SETTLE-2026-101',
    orderId: 'ORD-TN-2026-101',
    batchId: 'AGP-TOM-2026-101',
    crop: 'Tomato',
    quantityKg: 5000,
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    farmerOrFpoName: 'Kallakurichi Pasumai & Salem Kongu Collective',
    totalOrderValue: 152500,
    farmerAmount: 136000,
    logisticsAmount: 11500,
    platformAmount: 5000,
    farmerRealizationPercentage: 89.18,
    traditionalFarmerEarnings: 90000,
    earningsGainPercentage: 51.11,
    status: 'Buyer Payment Confirmed',
    settlementDate: 'Scheduled Upon Delivery Acceptance',
    utrNumber: 'ESCROW_LOCKED_TXN101',
    paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
    buyerPaymentReference: 'UPI-ERUPI-101-LOCKED',
    buyerPaymentRecordedAt: '2026-09-13 08:30 AM',
    farmerBreakdown: [
      {
        farmerId: 'usr-farmer-01',
        farmerName: 'Subramaniam Ramasamy',
        farmerLocation: 'Chinnasalem, Kallakurichi',
        produceListingId: 'LST-TN-101',
        contributedQuantityKg: 1200,
        collectedQuantityKg: 1200,
        agreedPricePerKg: 30.5,
        grossAmount: 36600,
        netFarmerAmount: 32640,
        status: 'PENDING',
        bankAccountMasked: 'SBI **** **** 6821'
      },
      {
        farmerId: 'usr-farmer-02',
        farmerName: 'K. Velusamy',
        farmerLocation: 'Pennagaram, Villupuram',
        produceListingId: 'LST-TN-102',
        contributedQuantityKg: 1000,
        collectedQuantityKg: 1000,
        agreedPricePerKg: 30.0,
        grossAmount: 30000,
        netFarmerAmount: 26750,
        status: 'PENDING',
        bankAccountMasked: 'Canara **** **** 4109'
      },
      {
        farmerId: 'usr-farmer-03',
        farmerName: 'Meenakshi Sundaram',
        farmerLocation: 'Valapadi, Salem',
        produceListingId: 'LST-TN-103',
        contributedQuantityKg: 1800,
        collectedQuantityKg: 1800,
        agreedPricePerKg: 30.5,
        grossAmount: 54900,
        netFarmerAmount: 48960,
        status: 'PENDING',
        bankAccountMasked: 'HDFC **** **** 9032'
      },
      {
        farmerId: 'usr-farmer-12',
        farmerName: 'Vijayakumar Nachimuthu',
        farmerLocation: 'Annur, Coimbatore',
        produceListingId: 'LST-TN-112',
        contributedQuantityKg: 1000,
        collectedQuantityKg: 1000,
        agreedPricePerKg: 30.5,
        grossAmount: 31000,
        netFarmerAmount: 27650,
        status: 'PENDING',
        bankAccountMasked: 'Indian Bank **** **** 1198'
      }
    ]
  },
  {
    id: 'SETTLE-2026-106',
    orderId: 'ORD-TN-2026-106',
    batchId: 'AGP-GND-2026-106',
    crop: 'Groundnut',
    quantityKg: 3500,
    buyerName: 'WayCool Agri Processors & Distribution Ltd.',
    farmerOrFpoName: 'Palanivel Chinnasamy & Cauvery Delta FPO',
    totalOrderValue: 227500,
    farmerAmount: 202850,
    logisticsAmount: 17500,
    platformAmount: 7150,
    farmerRealizationPercentage: 89.17,
    traditionalFarmerEarnings: 126000,
    earningsGainPercentage: 60.99,
    status: 'PENDING',
    settlementDate: 'Scheduled upon collection (21 Sep 2026)',
    utrNumber: 'ESCROW_LOCKED_TXN106',
    paymentMode: 'UPI e-RUPI Programmable Escrow (Prototype Simulator)',
    buyerPaymentReference: 'UPI-ERUPI-106-LOCKED',
    buyerPaymentRecordedAt: '2026-09-15 11:00 AM',
    farmerBreakdown: [
      {
        farmerId: 'usr-farmer-14',
        farmerName: 'Palanivel Chinnasamy',
        farmerLocation: 'Usilampatti, Madurai',
        produceListingId: 'LST-TN-114',
        contributedQuantityKg: 3500,
        collectedQuantityKg: 0,
        agreedPricePerKg: 65.0,
        grossAmount: 227500,
        netFarmerAmount: 202850,
        status: 'PENDING',
        bankAccountMasked: 'IOB **** **** 3321'
      }
    ]
  },
  {
    id: 'SETTLE-2026-107',
    orderId: 'ORD-TN-2026-107',
    batchId: 'AGP-PDY-2026-107',
    crop: 'Paddy',
    quantityKg: 5820,
    buyerName: 'Tamil Nadu Civil Supplies / Mid-Day Meal Procurement',
    farmerOrFpoName: 'Balasubramanian Sethuraman & Cauvery Delta FPO',
    totalOrderValue: 154230,
    farmerAmount: 141810,
    logisticsAmount: 8820,
    platformAmount: 3600,
    farmerRealizationPercentage: 91.95,
    traditionalFarmerEarnings: 87300,
    earningsGainPercentage: 62.45,
    status: 'COMPLETED',
    settlementDate: '2026-09-14 10:00 AM',
    utrNumber: 'AGRITXN20260914PDY107',
    paymentMode: 'Bank RTGS / Direct NEFT Batch',
    buyerPaymentReference: 'RTGS-GOV-TN-730192-CONFIRMED',
    buyerPaymentRecordedAt: '2026-09-14 09:50 AM',
    fpoSettledAt: '2026-09-14 09:55 AM',
    farmerSettledAt: '2026-09-14 10:00 AM',
    farmerBreakdown: [
      {
        farmerId: 'usr-farmer-09',
        farmerName: 'Balasubramanian Sethuraman',
        farmerLocation: 'Thiruvaiyaru, Thanjavur',
        produceListingId: 'LST-TN-109',
        contributedQuantityKg: 5820,
        collectedQuantityKg: 5820,
        agreedPricePerKg: 26.5,
        grossAmount: 154230,
        netFarmerAmount: 141810,
        status: 'COMPLETED',
        utrNumber: 'UTR-FARM-PDY-107',
        settledAt: '2026-09-14 10:00 AM',
        bankAccountMasked: 'Indian Bank **** **** 8842'
      }
    ]
  }
];

// ==========================================
// 17. CROP RECOMMENDATIONS
// ==========================================
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

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // ── FARMER notifications ─────────────────────────────────────────────────
  {
    id: 'NOTIF-TN-001',
    title: '✅ Payment Received: ₹75,000',
    message: 'Escrow settlement for 3,000 kg Tomato (Batch AGP-TOM-2026-102) has been credited to your SBI account **** 6821 via e-RUPI. Earnings: 89.3% net realization vs. 45% APMC baseline.',
    timestamp: '2026-09-14 07:15 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    targetRole: 'FARMER',
    userId: 'usr-farmer-01',
    read: false,
    type: 'SETTLEMENT',
    priority: 'SUCCESS',
    actionTab: 'orders',
    actionLabel: 'View Settlement',
    entityId: 'SETTLE-2026-102',
    entityType: 'settlement'
  },
  {
    id: 'NOTIF-TN-002',
    title: '🚚 Your produce is In Transit',
    message: 'Batch AGP-TOM-2026-101 (1,200 kg Tomato) loaded on CoolReefer EV TN-15-AGRI-5510. Driver: Karthik Subramanian (+91 98410 44021). ETA at WayCool Ambattur: 07:15 AM.',
    timestamp: '2026-09-15 05:30 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 17,
    targetRole: 'FARMER',
    userId: 'usr-farmer-01',
    read: false,
    type: 'LOGISTICS',
    priority: 'INFO',
    actionTab: 'orders',
    actionLabel: 'Track Shipment',
    entityId: 'ORD-TN-2026-101',
    entityType: 'order'
  },
  {
    id: 'NOTIF-TN-003',
    title: '🌾 New Demand Match: Banana 3,200 kg',
    message: 'MilkyMist Agri requires 3,200 kg Grand Naine Banana at ₹26/kg (max). Your listing LST-TN-107 is a 91% AI match. FPO Cauvery Delta has confirmed. Collection: Today 05:00 AM.',
    timestamp: '2026-09-14 10:30 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    targetRole: 'FARMER',
    userId: 'usr-farmer-07',
    read: true,
    type: 'MATCH',
    priority: 'SUCCESS',
    actionTab: 'orders',
    actionLabel: 'View Match',
    entityId: 'ORD-TN-2026-103',
    entityType: 'order'
  },

  // ── FPO_AGGREGATOR notifications ──────────────────────────────────────────
  {
    id: 'NOTIF-TN-004',
    title: '⚠️ FPO Approval Required: Chilli Order',
    message: 'Demand DEM-TN-104 from Ananda Grand Hospitality (1,200 kg Chilli at ₹54/kg) is pending FPO approval. Farmer Chellappa Thevar (Melur) has been matched at 87% score. Action required within 4 hours.',
    timestamp: '2026-09-14 12:00 PM',
    createdAt: Date.now() - 1000 * 60 * 60 * 35,
    targetRole: 'FPO_AGGREGATOR',
    userId: 'usr-fpo-01',
    read: false,
    type: 'ORDERS',
    priority: 'WARNING',
    actionTab: 'orders',
    actionLabel: 'Review & Approve',
    entityId: 'DEM-TN-104',
    entityType: 'demand'
  },
  {
    id: 'NOTIF-TN-005',
    title: '✅ Bulk Order Confirmed: 5,000 kg Tomato',
    message: 'WayCool order ORD-TN-2026-101 (₹1,52,500) confirmed. 4 farmers allocated: Subramaniam (1,200 kg), Velusamy (1,000 kg), Meenakshi (1,800 kg), Vijayakumar (1,000 kg). Dispatch window: 15 Sep, 05:30 AM.',
    timestamp: '2026-09-13 08:00 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 63,
    targetRole: 'FPO_AGGREGATOR',
    userId: 'usr-fpo-01',
    read: true,
    type: 'ORDERS',
    priority: 'SUCCESS',
    actionTab: 'orders',
    actionLabel: 'View Order',
    entityId: 'ORD-TN-2026-101',
    entityType: 'order'
  },
  {
    id: 'NOTIF-TN-006',
    title: '🔬 Quality Check Pending: Onion 2,800 kg',
    message: 'Batch AGP-ONI-2026-104 (Marimuthu Karuppan, Lalgudi) has arrived at Thiruvaiyaru Hub. NABL quality assay due. Please initiate inspection to unblock packing and transport assignment.',
    timestamp: '2026-09-15 06:00 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 17,
    targetRole: 'FPO_AGGREGATOR',
    userId: 'usr-fpo-03',
    read: false,
    type: 'ORDERS',
    priority: 'URGENT',
    actionTab: 'orders',
    actionLabel: 'Start Quality Check',
    entityId: 'ORD-TN-2026-104',
    entityType: 'order'
  },

  // ── LOGISTICS notifications ───────────────────────────────────────────────
  {
    id: 'NOTIF-TN-007',
    title: '🚛 New Dispatch Assignment: CoolReefer TN-15-AGRI-5510',
    message: '5,000 kg Tomato (4-stop multi-farmer route) assigned. Route: Chinnasalem → Pennagaram → Consolidation Hub → WayCool Ambattur. Distance: 74.2 km. Temp: 4°C. Depart: 05:30 AM.',
    timestamp: '2026-09-15 03:45 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 19,
    targetRole: 'LOGISTICS',
    userId: 'usr-logistics-01',
    read: false,
    type: 'LOGISTICS',
    priority: 'URGENT',
    actionTab: 'logistics',
    actionLabel: 'Start Route',
    entityId: 'ORD-TN-2026-101',
    entityType: 'order'
  },
  {
    id: 'NOTIF-TN-008',
    title: '📦 Banana Batch Ready for Pickup: 128 crates',
    message: 'Batch AGP-BAN-2026-103 packed at Thiruvaiyaru Hub. 128 cushioned crates (3,200 kg Grand Naine). Transport to Perundurai Food Park pending vehicle assignment. Packing time: 15 Sep, 06:45 AM.',
    timestamp: '2026-09-15 06:45 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
    targetRole: 'LOGISTICS',
    userId: 'usr-logistics-01',
    read: false,
    type: 'LOGISTICS',
    priority: 'WARNING',
    actionTab: 'logistics',
    actionLabel: 'Assign Vehicle',
    entityId: 'ORD-TN-2026-103',
    entityType: 'order'
  },

  // ── BULK_BUYER notifications ──────────────────────────────────────────────
  {
    id: 'NOTIF-TN-009',
    title: '🚚 Shipment En Route: 5,000 kg Tomato',
    message: 'CoolReefer EV TN-15-AGRI-5510 is on NH-48. Current speed: 52 km/h. Reefer temp: 4.2°C ✅. Remaining: 18.2 km. ETA: 07:15 AM at Ambattur Processing Terminal. OTP delivery confirmation ready.',
    timestamp: '2026-09-15 06:50 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
    targetRole: 'BULK_BUYER',
    userId: 'usr-bulkbuyer-01',
    read: false,
    type: 'LOGISTICS',
    priority: 'INFO',
    actionTab: 'orders',
    actionLabel: 'Track Live',
    entityId: 'ORD-TN-2026-101',
    entityType: 'order'
  },
  {
    id: 'NOTIF-TN-010',
    title: '🤝 Supply Confirmed: Groundnut 3,500 kg',
    message: 'Demand DEM-TN-107 supply confirmed. Kallakurichi Pasumai FPO will supply 3,500 kg TMV-7 Groundnut at ₹65/kg. Total: ₹2,27,500. Scheduled delivery: 21 Sep 2026, Ambattur Terminal.',
    timestamp: '2026-09-15 10:30 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    targetRole: 'BULK_BUYER',
    userId: 'usr-bulkbuyer-01',
    read: false,
    type: 'ORDERS',
    priority: 'SUCCESS',
    actionTab: 'orders',
    actionLabel: 'View Order',
    entityId: 'ORD-TN-2026-106',
    entityType: 'order'
  },

  // ── ADMIN notifications ───────────────────────────────────────────────────
  {
    id: 'NOTIF-TN-011',
    title: '📊 Daily Platform Report: 16 Sep 2026',
    message: 'Today: 5 active shipments, ₹4.58 Lakh in escrow, 8 orders across lifecycle, 42% reduction in post-harvest loss vs. APMC baseline. 2 FPO approvals pending. Platform health: ✅ Nominal.',
    timestamp: '2026-09-16 07:00 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
    targetRole: 'ADMIN',
    userId: 'usr-ops-01',
    read: false,
    type: 'SYSTEM',
    priority: 'INFO',
    actionTab: 'admin',
    actionLabel: 'View Reports',
    entityId: '',
    entityType: 'report'
  },

  // ── RETAIL_BUYER notifications ────────────────────────────────────────────
  {
    id: 'NOTIF-TN-012',
    title: '🔍 AI Match Ready: Turmeric 2,500 kg',
    message: 'Your demand DEM-TN-105 (2,500 kg Premium Erode Turmeric at ₹92/kg) has 2 supplier matches. Salem Kongu FPO: 72% score (backup). Bhavani cluster available immediately. Review and confirm.',
    timestamp: '2026-09-15 09:00 AM',
    createdAt: Date.now() - 1000 * 60 * 60 * 13,
    targetRole: 'RETAIL_BUYER',
    userId: 'usr-buyer-01',
    read: false,
    type: 'MATCH',
    priority: 'SUCCESS',
    actionTab: 'smart-match',
    actionLabel: 'Review Matches',
    entityId: 'DEM-TN-105',
    entityType: 'demand'
  }
];

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
    id: 'BUYER-BULK-05',
    name: 'Chef K. Venkatesan (Ananda Grand)',
    role: 'BULK_BUYER',
    phone: '+91 98406 44556',
    email: 'ananda.procurement@anandagrand.in',
    location: 'Guindy Central Commissary, Chennai',
    status: 'ACTIVE',
    joinedDate: '25 Feb 2026',
    permissions: ROLE_PERMISSIONS.BULK_BUYER
  },
  {
    id: 'BUYER-BULK-06',
    name: 'M. Sadasivam (TN Civil Supplies)',
    role: 'BULK_BUYER',
    phone: '+91 98407 55667',
    email: 'tncsc.procurement@tn.gov.in',
    location: 'Central Grain Warehouse, Trichy',
    status: 'ACTIVE',
    joinedDate: '01 Jan 2026',
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
