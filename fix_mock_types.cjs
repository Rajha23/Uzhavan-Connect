const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const replacements = [
  {
    start: 'export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [',
    end: 'export const FARMER_OFFERS_DATA: FarmerOfferItem[] = [',
    replacement: `export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [
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
];\n\n`
  },
  {
    start: 'export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [',
    end: 'export const INITIAL_DEMAND_POOL: DemandPool = {',
    replacement: `export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
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
];\n\n`
  },
  {
    start: 'export const INITIAL_DEMAND_POOL: DemandPool = {',
    end: 'export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [',
    replacement: `export const INITIAL_DEMAND_POOL: DemandPool = {
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
};\n\n`
  },
  {
    start: 'export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [',
    end: 'export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [',
    replacement: `export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [
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
];\n\n`
  },
  {
    start: 'export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [',
    end: 'export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [',
    replacement: `export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [];\n\n`
  },
  {
    start: 'export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [',
    end: 'export const CANDIDATE_MICRO_HUBS: MicroHub[] = [',
    replacement: `export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [
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
    matchedDemandId: 'DR-TOMATO-01'
  }
];\n\n`
  },
  {
    start: 'export const CANDIDATE_MICRO_HUBS: MicroHub[] = [',
    end: 'export const OPTIMIZED_ROUTE_PLAN: RoutePlan = {',
    replacement: `export const CANDIDATE_MICRO_HUBS: MicroHub[] = [];\n\n`
  },
  {
    start: 'export const INITIAL_ORDERS: WorkflowOrder[] = [',
    end: 'export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [',
    replacement: `export const INITIAL_ORDERS: WorkflowOrder[] = [
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
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  }
];\n\n`
  },
  {
    start: 'export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [',
    end: 'export const INITIAL_PASSPORTS: ProducePassport[] = [',
    replacement: `export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [];\n\n`
  },
  {
    start: 'export const INITIAL_PASSPORTS: ProducePassport[] = [',
    end: 'export const INITIAL_SETTLEMENTS: SettlementRecord[] = [',
    replacement: `export const INITIAL_PASSPORTS: ProducePassport[] = [
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
    logisticsProvider: 'Vayulogix Transport',
    vehicleId: 'TN-45-AT-9080',
    currentLocation: 'Trichy Highway (In Transit)',
    destination: 'Chennai, TN',
    departureTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 86400000).toISOString(),
    status: 'In Transit',
    blockchainTxHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    nfcTagId: 'NFC-TOMATO-01'
  }
];\n\n`
  },
  {
    start: 'export const INITIAL_SETTLEMENTS: SettlementRecord[] = [',
    end: 'export const CROP_RECOMMENDATIONS: CropRecommendation[] = [',
    replacement: `export const INITIAL_SETTLEMENTS: SettlementRecord[] = [
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
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];\n\n`
  }
];

let newContent = content;
replacements.forEach(({ start, end, replacement }) => {
  const startIndex = newContent.indexOf(start);
  const endIndex = newContent.indexOf(end);
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    newContent = newContent.substring(0, startIndex) + replacement + newContent.substring(endIndex);
  } else {
    console.log('Failed to find', start.substring(0, 30));
  }
});
fs.writeFileSync('src/data/mockData.ts', newContent);
