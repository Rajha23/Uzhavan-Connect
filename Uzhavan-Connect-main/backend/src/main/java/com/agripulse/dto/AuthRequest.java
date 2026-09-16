package com.agripulse.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @NotBlank(message = "Identifier (Email or Mobile) is required")
    String identifier,

    @NotBlank(message = "Password is required")
    String password
) {}
