package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fpo_id")
    private Fpo fpo;

    @Column(name = "gross_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "transport_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal transportCost;

    @Column(name = "packaging_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal packagingCost;

    @Column(name = "platform_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal platformCost;

    @Column(name = "net_farmer_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal netFarmerAmount;

    @Column(name = "farmer_realization_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal farmerRealizationPct = new BigDecimal("85.90");

    @Column(name = "utr_number", length = 128)
    private String utrNumber;

    @Column(length = 32)
    @Builder.Default
    private String status = "SETTLED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
