package com.agripulse.dto;

import com.agripulse.entity.Role;
import java.util.UUID;

public record AuthResponse(
    String token,
    String type,
    UUID userId,
    String name,
    String email,
    String mobile,
    Role role,
    String status
) {
    public AuthResponse(String token, UUID userId, String name, String email, String mobile, Role role, String status) {
        this(token, "Bearer", userId, name, email, mobile, role, status);
    }
}
