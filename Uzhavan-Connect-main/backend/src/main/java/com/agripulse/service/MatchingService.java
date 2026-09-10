package com.agripulse.service;

import com.agripulse.entity.DemandRequest;
import com.agripulse.entity.Match;
import com.agripulse.entity.ProduceListing;
import com.agripulse.repository.DemandRequestRepository;
import com.agripulse.repository.MatchRepository;
import com.agripulse.repository.ProduceListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class MatchingService {

    private final MatchRepository matchRepository;
    private final DemandRequestRepository demandRequestRepository;
    private final ProduceListingRepository produceListingRepository;

    public MatchingService(
        MatchRepository matchRepository,
        DemandRequestRepository demandRequestRepository,
        ProduceListingRepository produceListingRepository
    ) {
        this.matchRepository = matchRepository;
        this.demandRequestRepository = demandRequestRepository;
        this.produceListingRepository = produceListingRepository;
    }

    public List<Match> getMatchesForDemand(UUID demandId) {
        return matchRepository.findByDemandId(demandId);
    }

    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @Transactional
    public List<Match> runMatching(UUID demandId) {
        DemandRequest demand = demandRequestRepository.findById(demandId)
            .orElseThrow(() -> new IllegalArgumentException("Demand not found: " + demandId));

        // Find available produce listings matching product
        List<ProduceListing> listings = produceListingRepository.findByStatus("AVAILABLE");
        List<Match> generatedMatches = new ArrayList<>();

        for (ProduceListing listing : listings) {
            if (listing.getCrop().equalsIgnoreCase(demand.getProduct())) {
                // Multi-attribute scoring
                // 1. Price score (lower price gives higher score, baseline 30 INR/kg)
                double priceVal = listing.getExpectedPrice().doubleValue();
                double priceScore = Math.max(0.0, Math.min(100.0, 100.0 - (priceVal - 20.0) * 3.0));

                // 2. Distance score (simulate regional proximity based on location strings)
                double distanceKm = listing.getLocation().equalsIgnoreCase(demand.getLocation()) ? 15.0 : 65.0;
                double distanceScore = Math.max(0.0, 100.0 - (distanceKm * 0.8));

                // 3. Quality score
                double qualityScore = listing.getQuality().equalsIgnoreCase("Grade A") ? 95.0 : 80.0;

                // 4. Reliability & Capacity score
                double reliabilityScore = 90.0;
                double capacityRatio = Math.min(1.0, listing.getQuantity().doubleValue() / demand.getQuantity().doubleValue());
                double capacityScore = capacityRatio * 100.0;

                // Total weighted Match Score
                double matchScore = (priceScore * 0.30) + (distanceScore * 0.25) + 
                                    (qualityScore * 0.20) + (reliabilityScore * 0.15) + 
                                    (capacityScore * 0.10);

                Match match = new Match();
                match.setDemand(demand);
                match.setFarmer(listing.getFarmer());
                match.setQuantity(listing.getQuantity().min(demand.getQuantity()));
                match.setPrice(listing.getExpectedPrice());
                match.setDistance(BigDecimal.valueOf(distanceKm));
                match.setQualityScore(BigDecimal.valueOf(qualityScore));
                match.setReliabilityScore(BigDecimal.valueOf(reliabilityScore));
                match.setCapacityScore(BigDecimal.valueOf(capacityScore));
                match.setMatchScore(BigDecimal.valueOf(Math.round(matchScore * 10.0) / 10.0));
                match.setStatus("SUGGESTED");

                generatedMatches.add(matchRepository.save(match));
            }
        }

        generatedMatches.sort(Comparator.comparing(Match::getMatchScore).reversed());
        return generatedMatches;
    }
}
