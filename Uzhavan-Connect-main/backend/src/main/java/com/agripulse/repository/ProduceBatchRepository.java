package com.agripulse.repository;

import com.agripulse.entity.ProduceBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProduceBatchRepository extends JpaRepository<ProduceBatch, String> {
    Optional<ProduceBatch> findByBatchCode(String batchCode);
}
