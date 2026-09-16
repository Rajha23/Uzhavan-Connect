package com.agripulse.repository;

import com.agripulse.entity.DemandPool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandPoolRepository extends JpaRepository<DemandPool, String> {
    List<DemandPool> findByProductIgnoreCase(String product);
    List<DemandPool> findByStatus(String status);
}
