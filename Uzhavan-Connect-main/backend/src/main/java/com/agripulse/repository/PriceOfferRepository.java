package com.agripulse.repository;

import com.agripulse.entity.PriceOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceOfferRepository extends JpaRepository<PriceOffer, String> {
    List<PriceOffer> findByDemandId(String demandId);
    List<PriceOffer> findByFarmerId(String farmerId);
}
