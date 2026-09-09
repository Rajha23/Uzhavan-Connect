package com.agripulse.controller;

import com.agripulse.dto.DemandDTO;
import com.agripulse.entity.DemandRequest;
import com.agripulse.entity.User;
import com.agripulse.service.AuthService;
import com.agripulse.service.DemandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/demands")
@Tag(name = "Demand Requests", description = "Buyer and Retailer demand orders")
public class DemandController {

    private final DemandService demandService;
    private final AuthService authService;

    public DemandController(DemandService demandService, AuthService authService) {
        this.demandService = demandService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all demands or filter by status")
    public ResponseEntity<List<DemandRequest>> getAllDemands(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(demandService.getAllDemands(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get demand by ID")
    public ResponseEntity<DemandRequest> getDemandById(@PathVariable UUID id) {
        return ResponseEntity.ok(demandService.getDemandById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new demand request")
    public ResponseEntity<DemandRequest> createDemand(
        Authentication authentication,
        @Valid @RequestBody DemandDTO dto
    ) {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(demandService.createDemand(dto, user.getId()));
    }
}
