package com.agripulse.controller;

import com.agripulse.dto.BatchDTO;
import com.agripulse.entity.ProduceBatch;
import com.agripulse.entity.User;
import com.agripulse.service.AuthService;
import com.agripulse.service.TraceabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batches")
@Tag(name = "Product Traceability", description = "Digital Produce Passport and Batch QR tracking")
public class TraceabilityController {

    private final TraceabilityService traceabilityService;
    private final AuthService authService;

    public TraceabilityController(TraceabilityService traceabilityService, AuthService authService) {
        this.traceabilityService = traceabilityService;
        this.authService = authService;
    }

    @GetMapping("/{batchCode}")
    @Operation(summary = "Public lookup of produce batch lifecycle and authenticity by batch code")
    public ResponseEntity<ProduceBatch> getBatchByCode(@PathVariable String batchCode) {
        return ResponseEntity.ok(traceabilityService.getBatchByCode(batchCode));
    }

    @PostMapping
    @Operation(summary = "Generate a new produce batch with QR code identifier")
    public ResponseEntity<ProduceBatch> createBatch(
        Authentication authentication,
        @Valid @RequestBody BatchDTO dto
    ) {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(traceabilityService.createBatch(dto, user.getId()));
    }
}
