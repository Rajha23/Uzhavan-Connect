package com.agripulse.repository;

import com.agripulse.entity.ProduceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduceListingRepository extends JpaRepository<ProduceListing, String> {
    List<ProduceListing> findByFarmerId(String farmerId);
    List<ProduceListing> findByCropIgnoreCase(String crop);
    List<ProduceListing> findByStatus(String status);
}
