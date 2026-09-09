package com.agripulse.controller;

import com.agripulse.entity.DemandPool;
import com.agripulse.service.DemandPoolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/demand-pools")
@Tag(name = "Demand Pooling", description = "Demand pooling to combine orders for scale and transport efficiency")
public class DemandPoolController {

    private final DemandPoolService poolService;

    public DemandPoolController(DemandPoolService poolService) {
        this.poolService = poolService;
    }

    @GetMapping
    @Operation(summary = "Get all demand pools")
    public ResponseEntity<List<DemandPool>> getAllPools() {
        return ResponseEntity.ok(poolService.getAllPools());
    }

    @PostMapping
    @Operation(summary = "Create a new demand pool")
    public ResponseEntity<DemandPool> createPool(@RequestBody Map<String, Object> body) {
        String product = (String) body.get("product");
        String location = (String) body.get("location");
        LocalDate date = body.get("requiredDate") != null ? LocalDate.parse(body.get("requiredDate").toString()) : LocalDate.now().plusDays(3);
        return ResponseEntity.ok(poolService.createPool(product, location, date));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join an existing demand pool with a demand request")
    public ResponseEntity<DemandPool> joinPool(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        UUID demandId = UUID.fromString(body.get("demandRequestId"));
        return ResponseEntity.ok(poolService.joinPool(id, demandId));
    }
}
