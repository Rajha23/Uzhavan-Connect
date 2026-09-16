package com.agripulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProduceDTO(
    UUID id,
    UUID farmerId,
    UUID fpoId,
    @NotBlank(message = "Crop name is required")
    String crop,
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    BigDecimal quantity,
    String quality,
    @NotNull(message = "Expected price is required")
    @Positive(message = "Expected price must be greater than 0")
    BigDecimal expectedPrice,
    LocalDate availableDate,
    String location,
    String status
) {}
