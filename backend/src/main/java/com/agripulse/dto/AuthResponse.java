package com.agripulse.dto;

import com.agripulse.entity.Role;

public record AuthResponse(
    String token,
    String type,
    String userId,
    String name,
    String email,
    String mobile,
    Role role,
    String status
) {
    public AuthResponse(String token, String userId, String name, String email, String mobile, Role role, String status) {
        this(token, "Bearer", userId, name, email, mobile, role, status);
    }
}
