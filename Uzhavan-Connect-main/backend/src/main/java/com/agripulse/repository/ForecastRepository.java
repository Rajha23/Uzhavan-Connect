package com.agripulse.repository;

import com.agripulse.entity.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, String> {
    List<Forecast> findByProductIgnoreCase(String product);
    Optional<Forecast> findFirstByProductIgnoreCaseOrderByCreatedAtDesc(String product);
}
