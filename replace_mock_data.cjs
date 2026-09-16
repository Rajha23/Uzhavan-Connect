const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const replacements = [
  {
    start: 'export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [',
    end: 'export const FARMER_OFFERS_DATA: FarmerOfferItem[] = [',
    replacement: `export const BUYER_DEMAND_OPPORTUNITIES: BuyerDemandOpportunity[] = [
  {
    id: 'BDO-TOMATO-01',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    crop: 'Tomato',
    variety: 'Hybrid',
    requiredQuantityKg: 5000,
    fulfilledQuantityKg: 0,
    targetPricePerKg: 35,
    maxPricePerKg: 40,
    deliveryLocation: 'Chennai',
    expectedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'open',
    qualityRequirements: ['Grade A', 'Firm', 'Red', 'Brix > 4.5']
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
    crop: 'Tomato',
    variety: 'Hybrid',
    quantityKg: 5000,
    fulfilledQuantityKg: 0,
    maxTargetPricePerKg: 40,
    qualityRequirement: 'Grade A',
    location: 'Chennai',
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'open',
    bids: [],
    createdAt: new Date().toISOString()
  }
];\n\n`
  },
  {
    start: 'export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [',
    end: 'export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [',
    replacement: `export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [
  {
    id: 'PL-TOMATO-01',
    farmerId: 'usr_farmer_1',
    farmerName: 'Ramu',
    fpoId: 'fpo_1',
    fpoName: 'GreenHarvest FPO',
    crop: 'Tomato',
    variety: 'Hybrid',
    quantityKg: 5000,
    expectedPricePerKg: 30,
    harvestDate: new Date().toISOString().split('T')[0],
    location: 'Madurai',
    status: 'active',
    grade: 'Grade A',
    certificationStatus: 'verified'
  }
];\n\n`
  },
  {
    start: 'export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [',
    end: 'export const CANDIDATE_MICRO_HUBS: MicroHub[] = [',
    replacement: `export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [
  {
    id: 'SMS-TOMATO-01',
    demandId: 'DR-TOMATO-01',
    fpoId: 'fpo_1',
    fpoName: 'GreenHarvest FPO',
    crop: 'Tomato',
    matchedQuantityKg: 5000,
    proposedPricePerKg: 35,
    distanceKm: 250,
    logisticsCostPerKg: 3,
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'pending',
    confidenceScore: 98,
    farmersIncluded: ['usr_farmer_1'],
    matchReasons: ['Exact grade match', 'Optimal logistics distance', 'Price within limits']
  }
];\n\n`
  },
  {
    start: 'export const INITIAL_ORDERS: WorkflowOrder[] = [',
    end: 'export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [',
    replacement: `export const INITIAL_ORDERS: WorkflowOrder[] = [
  {
    id: 'ORD-TOMATO-01',
    fpoId: 'fpo_1',
    fpoName: 'GreenHarvest FPO',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    crop: 'Tomato',
    quantityKg: 5000,
    pricePerKg: 35,
    status: 'fpo_shipped',
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    location: 'Chennai',
    paymentStatus: 'escrow_locked',
    totalAmount: 175000,
    createdAt: new Date().toISOString(),
    logs: [
      { timestamp: new Date().toISOString(), action: 'Order created via Smart Match' },
      { timestamp: new Date().toISOString(), action: 'Funds locked in Escrow' },
      { timestamp: new Date().toISOString(), action: 'Logistics Vayulogix assigned' },
      { timestamp: new Date().toISOString(), action: 'Shipment dispatched' }
    ],
    qualityGrade: 'Grade A',
    carrierId: 'logistics_1',
    farmerShares: [
      { farmerId: 'usr_farmer_1', farmerName: 'Ramu', quantityKg: 5000, agreedPricePerKg: 30 }
    ],
    logisticsDetails: {
      providerId: 'logistics_1',
      providerName: 'Vayulogix Transport',
      vehicleType: 'Refrigerated Truck (Medium)',
      cost: 15000,
      pickupDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'in_transit'
    }
  }
];\n\n`
  },
  {
    start: 'export const INITIAL_PASSPORTS: ProducePassport[] = [',
    end: 'export const INITIAL_SETTLEMENTS: SettlementRecord[] = [',
    replacement: `export const INITIAL_PASSPORTS: ProducePassport[] = [
  {
    id: 'PP-TOMATO-01',
    orderId: 'ORD-TOMATO-01',
    crop: 'Tomato',
    quantityKg: 5000,
    originFpoId: 'fpo_1',
    originFpoName: 'GreenHarvest FPO',
    originFarmers: [
      { farmerId: 'usr_farmer_1', farmerName: 'Ramu', location: 'Madurai', contributionKg: 5000 }
    ],
    certifications: ['Organic Certified', 'Grade A Verified', 'NABL Brix > 4.5'],
    timeline: [
      { status: 'harvested', date: new Date().toISOString(), location: 'Madurai', actor: 'Ramu (Farmer)' },
      { status: 'graded', date: new Date().toISOString(), location: 'GreenHarvest Hub', actor: 'GreenHarvest FPO' },
      { status: 'dispatched', date: new Date().toISOString(), location: 'GreenHarvest Hub', actor: 'Vayulogix Transport' },
      { status: 'in_transit', date: new Date().toISOString(), location: 'Trichy Highway', actor: 'Vayulogix Transport' }
    ],
    status: 'in_transit',
    qualityMetrics: { brixLevel: 4.8, moistureContent: '95%', pesticideResidue: '0.01ppm (Safe)' },
    environmentalData: { averageGrowingTemp: '28°C', rainfallDuringCycle: '120mm' },
    coldChainData: [{ timestamp: new Date().toISOString(), temperature: '12°C', humidity: '85%' }]
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
    fpoId: 'fpo_1',
    fpoName: 'GreenHarvest FPO',
    buyerId: 'usr_retail_1',
    buyerName: 'Reliance Fresh',
    totalOrderValue: 175000,
    logisticsCost: 15000,
    fpoMargin: 10000,
    farmerPayoutTotal: 150000,
    farmerAllocations: [
      { farmerId: 'usr_farmer_1', farmerName: 'Ramu', amount: 150000, status: 'pending_transfer' }
    ],
    fpoStatus: 'pending_transfer',
    logisticsStatus: 'pending_transfer',
    overallStatus: 'escrow_locked',
    escrowReference: 'ESC-TOMATO-01',
    createdAt: new Date().toISOString()
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
    console.log('Failed to find start or end for:', start.substring(0, 50));
  }
});

fs.writeFileSync('src/data/mockData.ts', newContent);
console.log('Successfully updated mockData.ts');
