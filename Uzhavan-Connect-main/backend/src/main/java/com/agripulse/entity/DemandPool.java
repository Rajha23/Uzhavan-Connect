package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demand_pools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandPool {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 128)
    private String product;

    @Column(name = "total_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalQuantity;

    @Column(nullable = false)
    private String location;

    @Column(name = "required_date", nullable = false)
    private LocalDate requiredDate;

    @Column(length = 32)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "forecast_baseline_kg", precision = 12, scale = 2)
    private BigDecimal forecastBaselineKg;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "pool", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DemandPoolMember> members = new ArrayList<>();
}
