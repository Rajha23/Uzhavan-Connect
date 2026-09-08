package com.agripulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BatchDTO(
    UUID id,
    String batchCode,
    @NotBlank(message = "Product is required")
    String product,
    UUID farmerId,
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    BigDecimal quantity,
    LocalDate harvestDate,
    String quality,
    String collectionCenter,
    String status,
    String qrCode
) {}
