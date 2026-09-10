package com.agripulse.service;

import com.agripulse.entity.DemandPool;
import com.agripulse.entity.DemandPoolMember;
import com.agripulse.entity.DemandRequest;
import com.agripulse.repository.DemandPoolRepository;
import com.agripulse.repository.DemandRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DemandPoolService {

    private final DemandPoolRepository demandPoolRepository;
    private final DemandRequestRepository demandRequestRepository;

    public DemandPoolService(DemandPoolRepository demandPoolRepository, DemandRequestRepository demandRequestRepository) {
        this.demandPoolRepository = demandPoolRepository;
        this.demandRequestRepository = demandRequestRepository;
    }

    public List<DemandPool> getAllPools() {
        return demandPoolRepository.findAll();
    }

    @Transactional
    public DemandPool createPool(String product, String location, LocalDate requiredDate) {
        DemandPool pool = new DemandPool();
        pool.setProduct(product);
        pool.setLocation(location);
        pool.setRequiredDate(requiredDate);
        pool.setTotalQuantity(BigDecimal.ZERO);
        pool.setStatus("ACTIVE");
        return demandPoolRepository.save(pool);
    }

    @Transactional
    public DemandPool joinPool(UUID poolId, UUID demandRequestId) {
        DemandPool pool = demandPoolRepository.findById(poolId)
            .orElseThrow(() -> new IllegalArgumentException("Demand pool not found: " + poolId));

        DemandRequest req = demandRequestRepository.findById(demandRequestId)
            .orElseThrow(() -> new IllegalArgumentException("Demand request not found: " + demandRequestId));

        DemandPoolMember member = new DemandPoolMember();
        member.setDemandPool(pool);
        member.setDemandRequest(req);
        pool.getMembers().add(member);

        // Update total quantity
        BigDecimal newTotal = pool.getTotalQuantity().add(req.getQuantity());
        pool.setTotalQuantity(newTotal);

        req.setStatus("POOLED");
        demandRequestRepository.save(req);

        return demandPoolRepository.save(pool);
    }
}
