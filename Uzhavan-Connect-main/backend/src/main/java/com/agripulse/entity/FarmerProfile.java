package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfile {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String village;
    private String district;
    private String state;
    private String pincode;

    @Column(name = "main_crop")
    private String mainCrop;

    @Column(name = "farm_size", precision = 10, scale = 2)
    private BigDecimal farmSize;

    @Column(name = "fpo_id", length = 64)
    private String fpoId;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = new BigDecimal("4.90");

    @Column(name = "total_listings")
    @Builder.Default
    private Integer totalListings = 0;

    @Column(name = "completed_orders")
    @Builder.Default
    private Integer completedOrders = 0;

    @Column(name = "quantity_sold_kg", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal quantitySoldKg = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
