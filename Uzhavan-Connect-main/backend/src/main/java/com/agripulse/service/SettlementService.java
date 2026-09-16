package com.agripulse.service;

import com.agripulse.entity.Settlement;
import com.agripulse.entity.Shipment;
import com.agripulse.repository.SettlementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private final SettlementRepository settlementRepository;

    public SettlementService(SettlementRepository settlementRepository) {
        this.settlementRepository = settlementRepository;
    }

    public List<Settlement> getAllSettlements() {
        return settlementRepository.findAll();
    }

    public Settlement getSettlementById(UUID id) {
        return settlementRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Settlement not found: " + id));
    }

    @Transactional
    public Settlement generateSettlementForShipment(Shipment shipment) {
        BigDecimal unitPrice = (shipment.getMatch() != null && shipment.getMatch().getPrice() != null)
            ? shipment.getMatch().getPrice()
            : BigDecimal.valueOf(25.0);

        BigDecimal quantity = shipment.getQuantity() != null ? shipment.getQuantity() : BigDecimal.valueOf(1000.0);
        BigDecimal gross = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        // Transparent transparent cost model
        BigDecimal transportCost = gross.multiply(BigDecimal.valueOf(0.04)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal packagingCost = gross.multiply(BigDecimal.valueOf(0.02)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformCost = gross.multiply(BigDecimal.valueOf(0.015)).setScale(2, RoundingMode.HALF_UP);

        BigDecimal netFarmerAmount = gross.subtract(transportCost).subtract(packagingCost).subtract(platformCost);

        Settlement settlement = new Settlement();
        settlement.setShipment(shipment);
        settlement.setFarmer(shipment.getMatch() != null ? shipment.getMatch().getFarmer() : null);
        settlement.setGrossAmount(gross);
        settlement.setTransportCost(transportCost);
        settlement.setPackagingCost(packagingCost);
        settlement.setPlatformCost(platformCost);
        settlement.setNetFarmerAmount(netFarmerAmount);
        settlement.setStatus("SETTLED");
        settlement.setCreatedAt(LocalDateTime.now());

        return settlementRepository.save(settlement);
    }
}
