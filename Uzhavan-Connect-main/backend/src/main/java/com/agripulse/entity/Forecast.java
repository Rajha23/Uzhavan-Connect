package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Forecast {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 128)
    private String product;

    @Column(nullable = false)
    private String location;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "predicted_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal predictedQuantity;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "current_supply", precision = 12, scale = 2)
    private BigDecimal currentSupply;

    @Column(name = "shortage_gap", precision = 12, scale = 2)
    private BigDecimal shortageGap;

    @Column(name = "model_version", length = 64)
    @Builder.Default
    private String modelVersion = "v2.4-XGBoost-Ensemble";

    @Column(name = "trend_signal", length = 32)
    @Builder.Default
    private String trendSignal = "HIGH";

    @Column(name = "recommended_action", columnDefinition = "TEXT")
    private String recommendedAction;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
