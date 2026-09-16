package com.agripulse.controller;

import com.agripulse.entity.Settlement;
import com.agripulse.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/settlements")
@Tag(name = "Settlements & Earnings", description = "Transparent fee breakdowns and farmer net realization")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping
    @Operation(summary = "Get all settlement records")
    public ResponseEntity<List<Settlement>> getAllSettlements() {
        return ResponseEntity.ok(settlementService.getAllSettlements());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get settlement record by ID")
    public ResponseEntity<Settlement> getSettlementById(@PathVariable UUID id) {
        return ResponseEntity.ok(settlementService.getSettlementById(id));
    }
}
