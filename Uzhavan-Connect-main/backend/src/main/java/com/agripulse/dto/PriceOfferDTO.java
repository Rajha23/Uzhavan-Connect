package com.agripulse.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PriceOfferDTO(
    UUID id,
    @NotNull(message = "Demand ID is required")
    UUID demandId,
    UUID farmerId,
    UUID fpoId,
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    BigDecimal quantity,
    @NotNull(message = "Price per kg is required")
    @Positive(message = "Price per kg must be positive")
    BigDecimal pricePerKg,
    String quality,
    LocalDate readinessDate,
    String status
) {}
