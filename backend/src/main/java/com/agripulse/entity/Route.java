package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal distance;

    @Column(name = "distance_saved_km", precision = 8, scale = 2)
    private BigDecimal distanceSavedKm;

    @Column(name = "estimated_time", length = 64)
    private String estimatedTime;

    @Column(name = "vehicle_utilization", precision = 5, scale = 2)
    private BigDecimal vehicleUtilization;

    @Column(name = "route_sequence", columnDefinition = "TEXT")
    private String routeSequence;

    @Column(name = "fuel_cost_saved", precision = 10, scale = 2)
    private BigDecimal fuelCostSaved;

    @Column(length = 32)
    @Builder.Default
    private String status = "OPTIMIZED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
