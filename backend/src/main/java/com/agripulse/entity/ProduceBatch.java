package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "produce_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduceBatch {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "batch_code", unique = true, nullable = false, length = 128)
    private String batchCode;

    @Column(nullable = false, length = 128)
    private String product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id")
    private User farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fpo_id")
    private Fpo fpo;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(length = 64)
    @Builder.Default
    private String quality = "Grade A";

    @Column(name = "brix_sugar", precision = 4, scale = 2)
    private BigDecimal brixSugar;

    @Column(precision = 4, scale = 2)
    private BigDecimal firmness;

    @Column(name = "pesticide_pass")
    @Builder.Default
    private Boolean pesticidePass = true;

    @Column(name = "collection_center")
    private String collectionCenter;

    @Column(length = 64)
    @Builder.Default
    private String status = "In Transit";

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
