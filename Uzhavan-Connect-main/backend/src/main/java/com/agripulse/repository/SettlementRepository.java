package com.agripulse.repository;

import com.agripulse.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, String> {
    List<Settlement> findByFarmerId(String farmerId);
}
