package com.agripulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "demand_pool_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandPoolMember {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pool_id", nullable = false)
    private DemandPool pool;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demand_request_id", nullable = false)
    private DemandRequest demandRequest;

    @Column(name = "contribution_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal contributionKg;
}
