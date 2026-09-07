package com.agripulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DemandDTO(
    UUID id,
    UUID buyerId,
    @NotBlank(message = "Product is required")
    String product,
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    BigDecimal quantity,
    @NotBlank(message = "Location is required")
    String location,
    LocalDate requiredDate,
    String quality,
    String status
) {}
