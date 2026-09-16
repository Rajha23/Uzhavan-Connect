const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const replacements = [
  {
    start: 'export const INITIAL_DEMAND_POOL: DemandPool = {',
    end: 'export const INITIAL_FARMER_LISTINGS: ProduceListing[] = [',
    replacement: `export const INITIAL_DEMAND_POOL: DemandPool = {
  totalActiveDemands: 1,
  totalVolumeRequired: 5000,
  topDemandedCrops: [{ crop: 'Tomato', volume: 5000, averageTargetPrice: 40 }],
  regionalHotspots: [{ location: 'Chennai', demandCount: 1 }],
  demands: [
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
  ]
};\n\n`
  },
  {
    start: 'export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [',
    end: 'export const SMART_MATCH_SUPPLIERS: SmartMatchSupplier[] = [',
    replacement: `export const INITIAL_AUCTION_OFFERS: ReverseAuctionOffer[] = [];\n\n`
  },
  {
    start: 'export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [',
    end: 'export const INITIAL_PASSPORTS: ProducePassport[] = [',
    replacement: `export const INITIAL_AGREEMENTS: WorkflowAgreement[] = [];\n\n`
  },
  {
    start: 'export const CANDIDATE_MICRO_HUBS: MicroHub[] = [',
    end: 'export const OPTIMIZED_ROUTE_PLAN: RoutePlan = {',
    replacement: `export const CANDIDATE_MICRO_HUBS: MicroHub[] = [];\n\n`
  }
];

let newContent = content;
replacements.forEach(({ start, end, replacement }) => {
  const startIndex = newContent.indexOf(start);
  const endIndex = newContent.indexOf(end);
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    newContent = newContent.substring(0, startIndex) + replacement + newContent.substring(endIndex);
  }
});
fs.writeFileSync('src/data/mockData.ts', newContent);
