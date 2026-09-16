package com.agripulse.controller;

import com.agripulse.dto.ProduceDTO;
import com.agripulse.entity.ProduceListing;
import com.agripulse.entity.User;
import com.agripulse.service.AuthService;
import com.agripulse.service.ProduceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/produce")
@Tag(name = "Produce Listings", description = "Farmer and FPO produce listings")
public class ProduceController {

    private final ProduceService produceService;
    private final AuthService authService;

    public ProduceController(ProduceService produceService, AuthService authService) {
        this.produceService = produceService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all produce listings or filter by status")
    public ResponseEntity<List<ProduceListing>> getAllProduce(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(produceService.getAllProduce(status));
    }

    @PostMapping
    @Operation(summary = "Create a new produce listing")
    public ResponseEntity<ProduceListing> createProduce(
        Authentication authentication,
        @Valid @RequestBody ProduceDTO dto
    ) {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(produceService.createProduce(dto, user.getId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing produce listing")
    public ResponseEntity<ProduceListing> updateProduce(
        @PathVariable UUID id,
        @RequestBody ProduceDTO dto
    ) {
        return ResponseEntity.ok(produceService.updateProduce(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a produce listing")
    public ResponseEntity<Void> deleteProduce(@PathVariable UUID id) {
        produceService.deleteProduce(id);
        return ResponseEntity.noContent().build();
    }
}
