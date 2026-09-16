export interface Scheme {
  id: string;
  name: string;
  description: string;
}

export interface RoleSchemes {
  role: string;
  schemes: Scheme[];
  keyBenefits: string;
}

export const SCHEMES_DATA: Record<string, RoleSchemes> = {
  FARMER: {
    role: 'FARMERS',
    schemes: [
      { id: 'f1', name: 'PM-KISAN', description: 'Direct income support to eligible landholding farmer families.' },
      { id: 'f2', name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', description: 'Crop insurance support against specified crop losses and risks.' },
      { id: 'f3', name: 'Kisan Credit Card (KCC)', description: 'Access to agricultural credit for cultivation and related needs.' },
      { id: 'f4', name: 'e-NAM', description: 'Online agricultural market platform supporting wider market access and price discovery.' },
      { id: 'f5', name: 'Soil Health Card Scheme', description: 'Provides soil nutrient information and fertilizer-use recommendations.' }
    ],
    keyBenefits: 'Income support • Crop-risk protection • Easier credit • Better price discovery • Improved farm-input decisions'
  },
  FPO_AGGREGATOR: {
    role: 'FPOs / AGGREGATORS',
    schemes: [
      { id: 'fpo1', name: 'Formation & Promotion of 10,000 FPOs', description: 'Supports formation, capacity building, management and market linkages for Farmer Producer Organisations.' },
      { id: 'fpo2', name: 'Agriculture Infrastructure Fund (AIF)', description: 'Financing support for post-harvest infrastructure such as warehouses, cold storage and related facilities.' },
      { id: 'fpo3', name: 'e-NAM', description: 'Provides a digital marketplace and helps connect producer organisations with buyers.' },
      { id: 'fpo4', name: 'FPO support / equity and credit facilitation', description: 'Helps strengthen collective procurement, aggregation and bargaining capacity.' }
    ],
    keyBenefits: 'Collective bargaining • Bulk aggregation • Infrastructure access • Better buyer connections • Professionalisation'
  },
  LOGISTICS: {
    role: 'LOGISTICS / TRANSPORT',
    schemes: [
      { id: 'l1', name: 'Agriculture Infrastructure Fund (AIF)', description: 'Supports eligible post-harvest and agricultural infrastructure that can improve storage and movement.' },
      { id: 'l2', name: 'PM Gati Shakti', description: 'National framework aimed at improving multimodal connectivity and logistics efficiency.' },
      { id: 'l3', name: 'Integrated Cold Chain / food-processing infrastructure support', description: 'Supports eligible cold-chain infrastructure to reduce post-harvest losses and maintain product quality.' },
      { id: 'l4', name: 'Digital logistics integration', description: 'Uzhavan Connect can complement schemes by enabling route planning, load matching, tracking and delivery coordination.' }
    ],
    keyBenefits: 'Reduced wastage • Better storage • Efficient transport • Improved delivery planning • Stronger supply-chain connectivity'
  },
  RETAIL_BUYER: {
    role: 'RETAILERS',
    schemes: [
      { id: 'r1', name: 'e-NAM / Digital market linkages', description: 'Can support sourcing and price discovery through digital agricultural markets where applicable.' },
      { id: 'r2', name: 'ONDC', description: 'Open digital commerce network that can enable participating sellers and buyers to access digital commerce channels.' },
      { id: 'r3', name: 'Agriculture Infrastructure Fund (AIF)', description: 'Can support eligible storage and post-harvest infrastructure used in the supply chain.' },
      { id: 'r4', name: 'Food-processing / cold-chain support', description: 'Relevant to eligible businesses handling and storing food products.' }
    ],
    keyBenefits: 'Wider supplier access • Digital procurement • Better inventory availability • Improved storage and quality'
  },
  BULK_BUYER: {
    role: 'BULK BUYERS',
    schemes: [
      { id: 'b1', name: 'e-NAM', description: 'Provides access to a wider network of agricultural sellers and transparent price discovery.' },
      { id: 'b2', name: '10,000 FPO Scheme / FPO market linkage', description: 'Strengthens direct connections between organised producer groups and institutional buyers.' },
      { id: 'b3', name: 'Agriculture Infrastructure Fund (AIF)', description: 'Supports eligible warehouses, storage and post-harvest infrastructure that can facilitate planned procurement.' },
      { id: 'b4', name: 'Digital procurement through Uzhavan Connect', description: 'Can match bulk demand with aggregated supply, quantity, quality and delivery requirements.' }
    ],
    keyBenefits: 'Reliable bulk supply • Competitive procurement • Better planning • Reduced coordination time • Transparent transactions'
  }
};
