package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fpos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fpo {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(length = 32)
    private String mobile;

    private String email;
    private String village;
    private String district;
    private String state;

    @Column(name = "registration_number", unique = true, length = 128)
    private String registrationNumber;

    @Column(name = "member_count")
    @Builder.Default
    private Integer memberCount = 125;

    @Column(name = "available_produce_kg", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal availableProduceKg = new BigDecimal("8500.00");

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
