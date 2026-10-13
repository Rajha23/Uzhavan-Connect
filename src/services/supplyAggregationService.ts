import { ProduceListing, AggregatedSupplyLot, SupplyContribution } from '../types';
import { QualityVerificationStatus } from '../types/quality';

/**
 * Geographic corridor resolver for Tamil Nadu agricultural supply chains
 */
export const getAgriculturalCorridor = (location: string = ''): string => {
  const loc = location.toLowerCase();
  if (loc.includes('chinnasalem') || loc.includes('kallakurichi') || loc.includes('villupuram') || loc.includes('pennagaram')) {
    return 'Chinnasalem - Kallakurichi Corridor';
  }
  if (loc.includes('salem') || loc.includes('valapadi') || loc.includes('attur') || loc.includes('namakkal') || loc.includes('rasipuram')) {
    return 'Salem - Central Agro Corridor';
  }
  if (loc.includes('coimbatore') || loc.includes('pollachi') || loc.includes('annur') || loc.includes('erode') || loc.includes('bhavani')) {
    return 'Coimbatore - Kongu Corridor';
  }
  if (loc.includes('dharmapuri') || loc.includes('krishnagiri') || loc.includes('hosur')) {
    return 'Dharmapuri - Krishnagiri Corridor';
  }
  if (loc.includes('thanjavur') || loc.includes('thiruvaiyaru') || loc.includes('kumbakonam') || loc.includes('trichy') || loc.includes('tiruchirappalli')) {
    return 'Cauvery Delta Corridor';
  }
  if (loc.includes('madurai') || loc.includes('melur') || loc.includes('usilampatti') || loc.includes('dindigul')) {
    return 'Madurai - South Corridor';
  }
  if (loc.includes('chennai') || loc.includes('kanchipuram') || loc.includes('chengalpattu') || loc.includes('sriperumbudur')) {
    return 'Chennai Metropolitan Corridor';
  }

  // Fallback to district/city token
  const firstWord = location.split(',')[0].split(' ')[0].trim();
  return `${firstWord || 'Regional'} Agro Corridor`;
};

/**
 * Normalizes harvest/availability dates into standard format YYYY-MM-DD
 */
const parseDate = (d?: string): Date => {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

/**
 * Difference in days between two date strings
 */
const getDayDifference = (d1: string, d2: string): number => {
  const t1 = parseDate(d1).getTime();
  const t2 = parseDate(d2).getTime();
  return Math.abs(Math.round((t1 - t2) / (1000 * 60 * 60 * 24)));
};

/**
 * Identifies and proposes compatible farmer produce supply lots.
 * 
 * Evaluates:
 * 1. Commodity & Variety compatibility
 * 2. Quality Grade compatibility
 * 3. Geographic Corridor collection feasibility
 * 4. Harvest / Availability Window alignment (<= 7 days gap)
 * 5. Available (unreserved) net quantity calculation
 * 6. Verification integrity preservation (never automatically upgrading status)
 */
export const identifyCompatibleSupplyLots = (
  listings: ProduceListing[]
): AggregatedSupplyLot[] => {
  // 1. Filter only active, available listings with unallocated positive quantity
  const eligibleListings = listings.filter((l) => {
    const allocated = l.allocatedQuantityKg || 0;
    const netAvailable = l.quantityKg - allocated;
    const isAvailableStatus =
      l.status === 'Listed' ||
      l.status === 'AVAILABLE' ||
      l.status === 'Matched';

    return (
      netAvailable > 0 &&
      isAvailableStatus &&
      l.status !== 'Completed' &&
      l.status !== 'Delivered' &&
      l.status !== 'Reserved' &&
      l.status !== 'DISPATCHED' &&
      l.status !== 'SETTLED'
    );
  });

  if (eligibleListings.length === 0) return [];

  // 2. Group candidate listings by Commodity + Grade + Geographic Corridor
  const candidateGroups = new Map<string, ProduceListing[]>();

  eligibleListings.forEach((listing) => {
    const cropKey = listing.crop.trim().toLowerCase();
    const gradeKey = listing.grade || 'Grade A';
    const corridor = getAgriculturalCorridor(listing.location);
    const key = `${cropKey}__${gradeKey}__${corridor}`;

    if (!candidateGroups.has(key)) {
      candidateGroups.set(key, []);
    }
    candidateGroups.get(key)!.push(listing);
  });

  const proposedLots: AggregatedSupplyLot[] = [];

  // 3. For each group, cluster by overlapping availability window (within 7 days)
  candidateGroups.forEach((groupItems) => {
    // Need at least 2 farmer contributions or a substantial smallholder cluster to aggregate
    if (groupItems.length < 2) return;

    // Sort by availability date ascending
    groupItems.sort((a, b) => {
      const da = parseDate(a.availabilityDate || a.harvestDate).getTime();
      const db = parseDate(b.availabilityDate || b.harvestDate).getTime();
      return da - db;
    });

    // Sub-cluster by temporal window (<= 7 days gap)
    const clusters: ProduceListing[][] = [];
    let currentCluster: ProduceListing[] = [groupItems[0]];

    for (let i = 1; i < groupItems.length; i++) {
      const prevDate = groupItems[i - 1].availabilityDate || groupItems[i - 1].harvestDate;
      const currDate = groupItems[i].availabilityDate || groupItems[i].harvestDate;

      if (getDayDifference(prevDate, currDate) <= 7) {
        currentCluster.push(groupItems[i]);
      } else {
        if (currentCluster.length >= 2) {
          clusters.push(currentCluster);
        }
        currentCluster = [groupItems[i]];
      }
    }
    if (currentCluster.length >= 2) {
      clusters.push(currentCluster);
    }

    // 4. Construct AggregatedSupplyLot for each cluster
    clusters.forEach((clusterListings) => {
      const first = clusterListings[0];
      const crop = first.crop;
      const grade = first.grade || 'Grade A';
      const corridor = getAgriculturalCorridor(first.location);

      let totalAvailable = 0;
      let totalInitial = 0;
      let totalValueWeighted = 0;
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      const dates = clusterListings.map((l) => l.availabilityDate || l.harvestDate).filter(Boolean);
      dates.sort();
      const startDate = dates[0] || new Date().toISOString().split('T')[0];
      const endDate = dates[dates.length - 1] || startDate;

      let hasSelfDeclared = false;
      let hasCollectionVerified = false;
      let hasBuyerConfirmed = false;

      const contributions: SupplyContribution[] = clusterListings.map((l) => {
        const netAvailable = Math.max(0, l.quantityKg - (l.allocatedQuantityKg || 0));
        totalAvailable += netAvailable;
        totalInitial += l.initialQuantityKg || l.quantityKg;

        const price = l.expectedPricePerKg || 30;
        totalValueWeighted += price * netAvailable;
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);

        const vStatus: QualityVerificationStatus =
          l.qualityRecord?.status || 'SELF_DECLARED';

        if (vStatus === 'COLLECTION_VERIFIED' || vStatus === 'QR_GENERATED' || vStatus === 'DISPATCHED') {
          hasCollectionVerified = true;
        } else if (vStatus === 'BUYER_CONFIRMED') {
          hasBuyerConfirmed = true;
        } else {
          hasSelfDeclared = true;
        }

        const vLabel =
          vStatus === 'COLLECTION_VERIFIED' ? 'Collection-verified' :
          vStatus === 'BUYER_CONFIRMED' ? 'Buyer-confirmed' : 'Farmer-declared';

        return {
          listingId: l.id,
          farmerId: l.farmerId,
          farmerName: l.farmerName,
          location: l.location,
          fpoName: l.fpoName,
          availableKg: netAvailable,
          pricePerKg: price,
          harvestDate: l.harvestDate,
          availabilityDate: l.availabilityDate || l.harvestDate,
          verificationStatus: vStatus,
          verificationLabel: vLabel
        };
      });

      if (totalAvailable <= 0) return;

      const avgPrice = Math.round((totalValueWeighted / totalAvailable) * 100) / 100;
      const uniqueFarmers = new Set(clusterListings.map((l) => l.farmerId)).size;
      const commonFpo = clusterListings.find((l) => l.fpoName)?.fpoName || 'Regional Aggregation FPO Hub';

      // 5. Verification status summary preservation (CRITICAL RULE: NEVER AUTO-UPGRADE)
      let overallStatus: 'SELF_DECLARED' | 'COLLECTION_VERIFIED' | 'MIXED' | 'BUYER_CONFIRMED';
      let overallLabel: string;
      let desc: string;

      if (hasCollectionVerified && !hasSelfDeclared) {
        overallStatus = 'COLLECTION_VERIFIED';
        overallLabel = 'Collection-verified';
        desc = 'All constituent farm-gate lots have been verified during collection with documented quality metrics.';
      } else if (hasCollectionVerified && hasSelfDeclared) {
        overallStatus = 'MIXED';
        overallLabel = 'Mixed verification status';
        desc = 'Constituent farmer contributions have varied verification levels: some farm-gate verified, some self-declared.';
      } else if (hasBuyerConfirmed && !hasSelfDeclared && !hasCollectionVerified) {
        overallStatus = 'BUYER_CONFIRMED';
        overallLabel = 'Buyer-confirmed';
        desc = 'Constituent lots confirmed by buyers in previous staging.';
      } else {
        overallStatus = 'SELF_DECLARED';
        overallLabel = 'Farmer-declared';
        desc = 'Constituent produce information provided by farmers, awaiting farm-gate collection inspection.';
      }

      // Generate deterministic readable ID
      const cropCode = crop.slice(0, 3).toUpperCase();
      const corrCode = corridor.split(' ')[0].slice(0, 3).toUpperCase();
      const lotId = `LOT-${cropCode}-${corrCode}-${Math.round(totalAvailable)}`;

      const villages = Array.from(new Set(clusterListings.map((l) => l.location.split(',')[0].trim()))).join(', ');
      const compatibilityReasons: string[] = [
        `Commodity & Grade Alignment: ${crop} (${grade}) conforming to uniform institutional standards`,
        `Geographic Route Viability: ${corridor} (${villages}) accessible for single-loop collection`,
        `Synchronized Availability Window: ${startDate} to ${endDate} (${getDayDifference(startDate, endDate)} days variance)`,
        `Multi-Smallholder Consolidation: ${uniqueFarmers} farmers grouped to satisfy bulk procurement demand`
      ];

      proposedLots.push({
        id: lotId,
        crop,
        variety: first.variety || 'Commercial Hybrid',
        grade: grade as any,
        corridor,
        fpoHub: commonFpo,
        availabilityStartDate: startDate,
        availabilityEndDate: endDate,
        totalAvailableKg: totalAvailable,
        initialTotalKg: totalInitial,
        minPricePerKg: minPrice === Infinity ? avgPrice : minPrice,
        maxPricePerKg: maxPrice === -Infinity ? avgPrice : maxPrice,
        avgPricePerKg: avgPrice,
        farmersCount: uniqueFarmers,
        constituentListingIds: clusterListings.map((l) => l.id),
        contributions,
        verificationSummary: {
          hasSelfDeclared,
          hasCollectionVerified,
          hasBuyerConfirmed,
          overallStatus,
          overallLabel,
          description: desc
        },
        compatibilityReasons,
        status: 'PROPOSED'
      });
    });
  });

  return proposedLots;
};
