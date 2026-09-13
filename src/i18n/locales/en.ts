import { TranslationDictionary } from '../../types/i18n';

export const enTranslations: TranslationDictionary = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    logout: 'Sign Out',
    continue: 'Continue',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    status: 'Status',
    filter: 'Filter',
    all: 'All',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    select: 'Select',
    close: 'Close',
    refresh: 'Refresh',
    confirm: 'Confirm',
    delete: 'Delete',
    actions: 'Actions',
    date: 'Date',
    details: 'Details',
    verified: 'Verified',
    pending: 'Pending',
    completed: 'Completed',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    grade: 'Grade',
    location: 'Location',
    notes: 'Notes',
    offline: 'Offline Field Mode',
    online: 'Connected Online',
    syncing: 'Syncing...'
  },

  nav: {
    dashboard: 'Dashboard',
    myProduce: 'My Produce',
    demandSignals: 'Demand Signals',
    demandForecast: 'Demand Forecast',
    findBuyers: 'My Matches',
    orders: 'Orders',
    logistics: 'Logistics',
    traceability: 'Traceability',
    settlement: 'Earnings & Settlement',
    profile: 'Profile',
    settings: 'Settings',
    language: 'Language',
    reports: 'Reports & KPIs',
    procurement: 'Procurement Console',
    reverseAuction: 'Reverse Auction',
    smartMatching: 'Supplier Matches',
    fleetTelematics: 'Fleet Telematics',
    createDemand: 'Create Demand',
    demandPools: 'Demand Pools',
    bulkAggregation: 'Bulk Aggregation',
    members: 'Members Directory',
    systemMonitoring: 'System Telemetry'
  },

  farmer: {
    myCrops: 'My Harvest Listings',
    addCrop: 'List New Harvest',
    cropName: 'Crop Name',
    variety: 'Variety',
    expectedYield: 'Available Quantity (kg)',
    harvestDate: 'Harvest / Ready Date',
    expectedPrice: 'Expected Price per kg (₹)',
    marketDemand: 'Market Demand Matching',
    matches: 'Direct Buyer Contracts',
    directRealization: 'Net Realization',
    totalListings: 'Total Produce Listed',
    completedOrders: 'Settled Direct Orders',
    quantitySold: 'Dispatched Produce',
    addCropSuccess: 'Produce listed successfully to national marketplace.',
    cropDeleted: 'Listing removed from marketplace.',
    aiMentor: 'AI Agronomist Mentor'
  },

  buyer: {
    createDemand: 'Post Forward Demand',
    demandRequirement: 'Procurement Specifications',
    requiredQuantity: 'Required Volume (kg)',
    maxBudgetPrice: 'Target Gate Price (₹/kg)',
    targetDate: 'Required Delivery Date',
    activeDemands: 'Active Procurement Lots',
    demandPools: 'Aggregated Demand Pools',
    directContracts: 'Direct Supplier Offers',
    receivingHandover: 'Dockside Receiving & QC',
    docksideInspection: 'Dockside Inspection Signoff'
  },

  bulkBuyer: {
    institutionalProcurement: 'Institutional Procurement Console',
    bulkDemand: 'Bulk Demand Aggregation',
    multiSupplierAllocation: 'Multi-Supplier Allocation Matrix',
    reverseAuction: 'Reverse Auction Console',
    coldChainTelematics: 'In-Transit Cold-Chain Telematics',
    receivingDock: 'Receiving Dockside Inspection',
    supplierMatching: 'Supplier Cluster Allocation'
  },

  fpo: {
    microHubAggregation: 'FPO Micro-Hub Aggregation Station',
    farmGateCollection: 'Farm-Gate Collection Queue',
    qualityGradingStation: 'Quality Grading & Assay Station',
    cratingAndSealing: 'Crating & Digital QR Sealing',
    brixTest: 'Brix Sugar Content Test',
    firmnessTest: 'Fruit Firmness Assay',
    pesticideTest: 'Zero-Residue Pesticide Assay',
    bulkConsolidation: 'Bulk Hub Consolidation & Dispatch'
  },

  logistics: {
    fleetTelematics: 'Cold Chain Fleet Telematics',
    vehicleAllocation: 'Vehicle Allocation & Dispatch',
    inTransitCorridors: 'Active Transportation Corridors',
    arrivalHandover: 'Arrival Handover & Chain of Custody',
    gpsTracking: 'Real-Time GPS Tracking',
    coldChainCompliance: 'Reefer Temperature Compliance',
    routeOptimization: 'VRP Multi-Stop Route Optimization'
  },

  admin: {
    apexCommandCenter: 'Ministry Executive Command Center',
    nationalNetworkKpis: 'National Agricultural Network KPIs',
    userRegistry: 'Stakeholder Registry & RBAC',
    rbacPermissions: 'Role-Based Access Governance',
    autonomousEscrowAudit: 'Autonomous Escrow Payout Audit',
    producePassports: 'Cryptographic Batch Passports',
    edgeNodeTelemetry: 'FPO Edge Nodes & Cold Hubs'
  },

  ai: {
    demandIntelligence: 'FastAPI XGBoost Demand Intelligence',
    mlForecasting: 'Predictive Demand Spikes',
    priceOptimization: 'Algorithmic Fair Price Benchmark',
    agronomistMentor: 'AI Agronomist Market Advisor',
    askMentor: 'Ask Agronomist Advisor',
    forecastConfidence: 'Model Confidence',
    recommendedAction: 'Strategic Recommendation'
  },

  traceability: {
    producePassport: 'Digital Produce Passport',
    batchProvenance: 'Complete Batch Provenance Ledger',
    qualityAssays: 'Verified Lab Quality Assays',
    farmOrigin: 'Farm & Farmer Origin',
    digitalQrAudit: 'Digital QR Verification Audit',
    labCertified: 'Certified Grade & Residue-Free'
  },

  settlement: {
    escrowDisbursement: 'Automated Escrow Disbursement',
    directRealization: 'Direct Farmer Realization',
    farmerShare: 'Farmer Direct Payout',
    traditionalComparison: 'APMC Middlemen vs Direct Realization',
    zeroMiddlemen: 'Zero Middlemen Cuts • Zero 90-Day Credit Delay',
    bankUtrReference: 'Bank UTR Reference',
    disbursementSplit: '3-Way Instant Automated Disbursement'
  },

  profile: {
    operationalProfile: 'Operational Agrarian Profile',
    verifiedCredentials: 'e-KYC & Ministry Credentials',
    farmLandholding: 'Farm Landholding (Acres)',
    organization: 'Organization / FPO Collective',
    mobileContact: 'Mobile Contact',
    securityAttributes: 'Security-Protected Attributes',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Profile Changes'
  },

  auth: {
    welcomeTitle: 'Operational Access Portal',
    operationalAccess: 'Demand-First Agricultural Intelligence',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    mobileOrEmail: 'Mobile Number / Registered Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Login to Uzhavan Connect',
    completeRegistration: 'Complete Registration',
    quickDemoLogins: 'SIH Demo Quick-Logins (One-Click)'
  },

  onboarding: {
    welcomeTitle: 'Welcome to UZHAVAN Connect 🌱',
    welcomeSubtitle: 'Choose your preferred language for the entire agricultural platform',
    chooseLanguage: 'Choose Preferred Language',
    changeAnytimeNote: 'You can change this language anytime from Settings or the top bar.',
    searchPlaceholder: 'Search language by name, script, or ISO code (e.g. Tamil, हिन्दी, ta)...',
    continueBtn: 'Continue to Platform →',
    currentSelection: 'Currently Selected'
  },

  landing: {
    heroTitle: 'Sell Directly.',
    heroSubtitle: 'Uzhavan Connect unifies smallholder farmers directly with institutional food processors and retailers using ML demand forecasting, algorithmic matching, fair price discovery, and cold-chain route coordination.',
    earnRealization: 'Sell Directly',

    launchConsole: 'Launch Operational Console',
    registerAccount: 'Register Direct Account',
    directMarket: 'Direct Market',
    demandForecast: 'Demand Forecast',
    autonomousEscrow: 'Autonomous Escrow',
    coldChainVrp: 'Cold Chain VRP',
    traceableCycle: '100% Traceable End-to-End Operating Cycle'
  }
};
