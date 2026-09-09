package com.agripulse.service;

import com.agripulse.dto.PriceOfferDTO;
import com.agripulse.entity.DemandRequest;
import com.agripulse.entity.PriceOffer;
import com.agripulse.entity.User;
import com.agripulse.repository.DemandRequestRepository;
import com.agripulse.repository.PriceOfferRepository;
import com.agripulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PricingService {

    private final PriceOfferRepository priceOfferRepository;
    private final DemandRequestRepository demandRequestRepository;
    private final UserRepository userRepository;

    public PricingService(
        PriceOfferRepository priceOfferRepository,
        DemandRequestRepository demandRequestRepository,
        UserRepository userRepository
    ) {
        this.priceOfferRepository = priceOfferRepository;
        this.demandRequestRepository = demandRequestRepository;
        this.userRepository = userRepository;
    }

    public List<PriceOffer> getOffersForDemand(UUID demandId) {
        return priceOfferRepository.findByDemandId(demandId);
    }

    public List<PriceOffer> getAllOffers() {
        return priceOfferRepository.findAll();
    }

    @Transactional
    public PriceOffer submitOffer(PriceOfferDTO dto, UUID farmerId) {
        DemandRequest demand = demandRequestRepository.findById(dto.demandId())
            .orElseThrow(() -> new IllegalArgumentException("Demand not found: " + dto.demandId()));

        User farmer = userRepository.findById(farmerId)
            .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        PriceOffer offer = new PriceOffer();
        offer.setDemand(demand);
        offer.setFarmer(farmer);
        offer.setQuantity(dto.quantity());
        offer.setPricePerKg(dto.pricePerKg());
        offer.setQuality(dto.quality() != null ? dto.quality() : "Grade A");
        offer.setReadinessDate(dto.readinessDate());
        offer.setStatus("SUBMITTED");
        offer.setCreatedAt(LocalDateTime.now());

        return priceOfferRepository.save(offer);
    }

    @Transactional
    public PriceOffer acceptOffer(UUID offerId) {
        PriceOffer offer = priceOfferRepository.findById(offerId)
            .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        offer.setStatus("SELECTED");
        
        DemandRequest demand = offer.getDemand();
        if (demand != null) {
            demand.setStatus("MATCHED");
            demandRequestRepository.save(demand);
        }

        return priceOfferRepository.save(offer);
    }
}
