package com.agripulse.service;

import com.agripulse.dto.DemandDTO;
import com.agripulse.entity.DemandRequest;
import com.agripulse.entity.User;
import com.agripulse.repository.DemandRequestRepository;
import com.agripulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DemandService {

    private final DemandRequestRepository demandRepository;
    private final UserRepository userRepository;

    public DemandService(DemandRequestRepository demandRepository, UserRepository userRepository) {
        this.demandRepository = demandRepository;
        this.userRepository = userRepository;
    }

    public List<DemandRequest> getAllDemands(String status) {
        if (status != null && !status.isBlank()) {
            return demandRepository.findByStatus(status);
        }
        return demandRepository.findAll();
    }

    public List<DemandRequest> getBuyerDemands(UUID buyerId) {
        return demandRepository.findByBuyerId(buyerId);
    }

    public DemandRequest getDemandById(UUID id) {
        return demandRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Demand not found: " + id));
    }

    @Transactional
    public DemandRequest createDemand(DemandDTO dto, UUID buyerId) {
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new IllegalArgumentException("Buyer not found: " + buyerId));

        DemandRequest req = new DemandRequest();
        req.setBuyer(buyer);
        req.setProduct(dto.product());
        req.setQuantity(dto.quantity());
        req.setLocation(dto.location());
        req.setRequiredDate(dto.requiredDate());
        req.setQuality(dto.quality() != null ? dto.quality() : "Grade A");
        req.setStatus("OPEN");
        req.setCreatedAt(LocalDateTime.now());

        return demandRepository.save(req);
    }
}
