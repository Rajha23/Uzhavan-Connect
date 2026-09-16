import { UserRole } from '../types';

export interface Subsidy {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string[];
  role: UserRole[];
}

export const SUBSIDIES_DATA: Subsidy[] = [
  // FARMER SUBSIDIES
  {
    id: 'f-pm-kisan',
    title: 'Direct Financial Support — PM-KISAN',
    category: 'INCOME SUPPORT',
    description: 'PM-KISAN provides ₹6,000 per year to eligible landholding farmer families, released directly into their bank account in three equal instalments.',
    details: [
      'Requires eKYC completion and a bank account linked to Aadhaar.',
      'Land records must be seeded and verified at the state revenue department level.',
      'Certain categories are excluded by design (e.g., institutional landholders).'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-pmfby',
    title: 'Crop Insurance — PMFBY',
    category: 'RISK COVER',
    description: 'PMFBY protects farmers against yield losses from drought, flood, cyclone, hailstorm, pest attacks and disease.',
    details: [
      'Farmer premium is typically capped around 2% for Kharif, 1.5% for Rabi and up to 5% for annual commercial crops.',
      'Enrolment windows are tied tightly to the sowing season.',
      'Claims depend on localised yield-loss assessment.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-kcc',
    title: 'Agricultural Credit — Kisan Credit Card (KCC)',
    category: 'CREDIT',
    description: 'Provides short-term, revolving working-capital credit for cultivation expenses, post-harvest costs, and marketing.',
    details: [
      'Sanctioned as a flexible credit limit rather than a one-time loan.',
      'Interest subvention schemes bring the effective interest rate meaningfully below standard rates.',
      'Linked to land records and Aadhaar-based identity.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-machinery',
    title: 'Farm Machinery Subsidy',
    category: 'CAPEX',
    description: 'Capital assistance toward tractors, power tillers, seed drills, sprayers, harvesters, and irrigation equipment.',
    details: [
      'Subsidy percentage varies by state and by farmer category (SC/ST, women, small/marginal).',
      'Custom Hiring Centres and Farm Machinery Banks are alternative routes for equipment access.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-irrigation',
    title: 'Irrigation & Water-Saving Support',
    category: 'INFRASTRUCTURE',
    description: 'Support for drip and sprinkler irrigation, micro-irrigation systems and water-harvesting structures (Per Drop More Crop / PMKSY).',
    details: [
      'Subsidy is calculated as a percentage of the approved unit cost per acre.',
      'Often bundled with soil and water testing recommendations.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-inputs',
    title: 'Seeds, Soil & Input Support',
    category: 'INPUTS',
    description: 'Certified seed distribution, soil health cards, subsidised soil testing, and bio-fertilizers.',
    details: [
      'Soil Health Card recommendations support other input subsidy applications.',
      'Certified seed subsidies are usually time-bound to the sowing calendar.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-organic',
    title: 'Sustainable / Organic Farming Support',
    category: 'TRANSITION',
    description: 'Assistance for organic input procurement, composting infrastructure, and certification costs.',
    details: [
      'Support schemes specifically target the cost of organic certification.',
      'Cluster-based approaches (grouping neighbouring farmers) are preferred.'
    ],
    role: ['FARMER']
  },
  {
    id: 'f-allied',
    title: 'Allied Agriculture Support',
    category: 'DIVERSIFICATION',
    description: 'Benefits for dairy, poultry, goat/sheep rearing, fisheries, beekeeping, horticulture and mushroom cultivation.',
    details: [
      'Provides a reliable income stabiliser for farming households.',
      'Run by separate departments (Animal Husbandry, Fisheries, Horticulture).'
    ],
    role: ['FARMER']
  },

  // FPO SUBSIDIES
  {
    id: 'fpo-formation',
    title: 'Formation & Handholding — 10,000 FPO Scheme',
    category: 'INSTITUTION BUILDING',
    description: 'Central support for the formation, promotion and professional handholding of FPOs through Cluster-Based Business Organisations (CBBOs).',
    details: [
      'CBBOs support FPOs through registration, compliance, and initial business planning at little or no cost.',
      'Management-cost support is usually front-loaded and tapers over a multi-year period.'
    ],
    role: ['FPO_AGGREGATOR']
  },
  {
    id: 'fpo-equity',
    title: 'Equity Grant Support',
    category: 'CAPITAL BASE',
    description: 'Matching-equity support designed to strengthen the FPO\'s own capital base so it can raise institutional finance.',
    details: [
      'Structured as a matching grant tied to member contributions.',
      'Improves ability to negotiate loan terms with banks and NBFCs.'
    ],
    role: ['FPO_AGGREGATOR']
  },
  {
    id: 'fpo-credit-guarantee',
    title: 'Credit Guarantee Support',
    category: 'CREDIT ACCESS',
    description: 'Facilitates access to institutional loans for procurement, storage, and processing through a Credit Guarantee Fund mechanism.',
    details: [
      'Reduces lender risk and collateral burden on the FPO.',
      'Capped at a maximum guaranteed loan amount per eligible FPO.'
    ],
    role: ['FPO_AGGREGATOR']
  },
  {
    id: 'fpo-aif',
    title: 'Infrastructure Support — Agriculture Infrastructure Fund (AIF)',
    category: 'INFRASTRUCTURE',
    description: 'Financing support for post-harvest infrastructure such as warehouses, cold storage, collection centres, and pack houses.',
    details: [
      'AIF loans carry interest subvention and a credit guarantee component.',
      'Requires a detailed business plan (Detailed Project Report).'
    ],
    role: ['FPO_AGGREGATOR']
  },
  {
    id: 'fpo-processing',
    title: 'Processing & Value Addition',
    category: 'VALUE ADD',
    description: 'Support for converting raw produce into higher-value products (e.g., tomatoes into pulp/sauce) through processing infrastructure.',
    details: [
      'Often the highest-return category for an FPO after basic aggregation.',
      'Converts low-margin commodities into a branded product business.'
    ],
    role: ['FPO_AGGREGATOR']
  },
  {
    id: 'fpo-market',
    title: 'Market Linkage & Branding',
    category: 'MARKET ACCESS',
    description: 'Helps the FPO build its own brand, product catalogue and direct buyer relationships.',
    details: [
      'Direct linkage to bulk buyers and retailers for favourable price discovery.'
    ],
    role: ['FPO_AGGREGATOR']
  },

  // RETAILER SUBSIDIES
  {
    id: 'ret-working-cap',
    title: 'Working Capital / Business Credit',
    category: 'CASH FLOW',
    description: 'Financing that lets a retailer purchase produce in advance of receiving customer payment, covering inventory.',
    details: [
      'Often available as a revolving credit line.',
      'Interest rates and required collateral improve with MSME/Udyam registration.'
    ],
    role: ['RETAIL_BUYER']
  },
  {
    id: 'ret-msme',
    title: 'MSME / Enterprise Support',
    category: 'FORMALISATION',
    description: 'Formal registration as a micro or small enterprise (Udyam) opens access to institutional credit and digitalisation support.',
    details: [
      'Registration is free and largely self-certified online.',
      'Unlocks collateral-free loans and delayed-payment protection.'
    ],
    role: ['RETAIL_BUYER']
  },
  {
    id: 'ret-processing',
    title: 'Food Processing & Value Addition',
    category: 'VALUE ADD',
    description: 'Support for retailers who clean, cut, package or lightly process produce before resale.',
    details: [
      'Minor processing steps like washing and grading can materially improve shelf life and price.'
    ],
    role: ['RETAIL_BUYER']
  },
  {
    id: 'ret-cold-chain',
    title: 'Cold Storage & Cold-Chain',
    category: 'INFRASTRUCTURE',
    description: 'Financing or assistance for small storage or refrigeration facilities suited to perishable-goods retail.',
    details: [
      'Modest walk-in cooler or refrigerated-display investment reduces spoilage-driven losses.'
    ],
    role: ['RETAIL_BUYER']
  },
  {
    id: 'ret-ecommerce',
    title: 'Digital Commerce Opportunity',
    category: 'MARKET ACCESS',
    description: 'Benefits linked to selling through digital channels, including traceable, farm-sourced product listings.',
    details: [
      'Traceability back to a specific farmer or FPO is a marketing asset.'
    ],
    role: ['RETAIL_BUYER']
  },

  // BULK BUYER SUBSIDIES
  {
    id: 'bb-sampada',
    title: 'Food Processing Infrastructure — PM Kisan SAMPADA',
    category: 'PROCESSING',
    description: 'Support for processing plants, preservation facilities, packaging lines and supply-chain infrastructure.',
    details: [
      'Structured as capital subsidy on eligible project cost.',
      'Favours integrated or cluster-based projects linked to farmer/FPO sourcing.'
    ],
    role: ['BULK_BUYER']
  },
  {
    id: 'bb-cold-chain',
    title: 'Cold Chain Infrastructure — Integrated Cold Chain Scheme',
    category: 'COLD CHAIN',
    description: 'Covers pre-cooling units, multi-temperature cold storage, reefer vehicles and distribution hubs.',
    details: [
      'Spans the full cold-chain, allowing transport assets to be bundled into the same project.'
    ],
    role: ['BULK_BUYER']
  },
  {
    id: 'bb-aif',
    title: 'Warehouse / Agri Infrastructure — AIF',
    category: 'INFRASTRUCTURE',
    description: 'Financing for warehouses, collection centres, sorting and grading facilities available to institutional bulk buyers.',
    details: [
      'Financing facility with interest subvention and credit guarantee.'
    ],
    role: ['BULK_BUYER']
  },
  {
    id: 'bb-working-cap',
    title: 'Working Capital Financing',
    category: 'CASH FLOW',
    description: 'Credit for large-volume produce procurement, inventory holding and processing operations.',
    details: [
      'Warehouse-receipt financing allows borrowing against stored, graded produce.'
    ],
    role: ['BULK_BUYER']
  },
  {
    id: 'bb-export',
    title: 'Export-Oriented Support',
    category: 'EXPORT',
    description: 'Market information, quality and traceability requirements, and documentation support for eligible exporters.',
    details: [
      'Traceability data helps meet the compliance bar of international buyers.'
    ],
    role: ['BULK_BUYER']
  },

  // LOGISTICS SUBSIDIES
  {
    id: 'log-pmksy',
    title: 'Integrated Cold Chain Infrastructure — PMKSY',
    category: 'COLD CHAIN',
    description: 'Covers pre-cooling units, cold storage, reefer vehicles and mobile cooling units.',
    details: [
      'Generally applied for by the organisation operating the cold-chain project.',
      'Reefer vehicles appear directly inside cold-chain infrastructure projects.'
    ],
    role: ['LOGISTICS']
  },
  {
    id: 'log-aif',
    title: 'Agriculture Infrastructure Fund (AIF) — Logistics',
    category: 'VEHICLES & INFRASTRUCTURE',
    description: 'Includes eligible logistics facilities such as insulated vehicles purchased for specified group projects.',
    details: [
      'Eligibility anchored to a project undertaken by an FPO, cooperative or registered farmer group.'
    ],
    role: ['LOGISTICS']
  },
  {
    id: 'log-warehouse',
    title: 'Warehouse & Post-Harvest Infrastructure',
    category: 'INFRASTRUCTURE',
    description: 'Support for collection centres, pack houses, sorting and grading units.',
    details: [
      'Reduces the time produce spends in transit without protection from spoilage.'
    ],
    role: ['LOGISTICS']
  },
  {
    id: 'log-state',
    title: 'State-Level Logistics Schemes',
    category: 'STATE PROGRAMMES',
    description: 'Individual states may run their own transport, cold-chain or infrastructure support programmes.',
    details: [
      'Smaller in scale but can be a better fit for a regional logistics operator.'
    ],
    role: ['LOGISTICS']
  }
];
