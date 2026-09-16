package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "produce_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduceListing {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fpo_id")
    private Fpo fpo;

    @Column(nullable = false, length = 128)
    private String crop;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(length = 64)
    @Builder.Default
    private String quality = "Standard";

    @Column(name = "expected_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal expectedPrice;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(nullable = false)
    private String location;

    @Column(length = 32)
    @Builder.Default
    private String status = "AVAILABLE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
