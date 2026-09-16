package com.agripulse.repository;

import com.agripulse.entity.DemandRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandRequestRepository extends JpaRepository<DemandRequest, String> {
    List<DemandRequest> findByBuyerId(String buyerId);
    List<DemandRequest> findByProductIgnoreCase(String product);
    List<DemandRequest> findByStatus(String status);
}
