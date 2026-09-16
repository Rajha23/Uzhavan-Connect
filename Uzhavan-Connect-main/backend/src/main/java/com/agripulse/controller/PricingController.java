package com.agripulse.controller;

import com.agripulse.dto.PriceOfferDTO;
import com.agripulse.entity.PriceOffer;
import com.agripulse.entity.User;
import com.agripulse.service.AuthService;
import com.agripulse.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/offers")
@Tag(name = "Price Discovery & Offers", description = "Farmer price offers and buyer acceptance workflows")
public class PricingController {

    private final PricingService pricingService;
    private final AuthService authService;

    public PricingController(PricingService pricingService, AuthService authService) {
        this.pricingService = pricingService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get all offers or filter by demand ID")
    public ResponseEntity<List<PriceOffer>> getOffers(@RequestParam(required = false) UUID demandId) {
        if (demandId != null) {
            return ResponseEntity.ok(pricingService.getOffersForDemand(demandId));
        }
        return ResponseEntity.ok(pricingService.getAllOffers());
    }

    @PostMapping
    @Operation(summary = "Submit a price offer from a farmer/FPO for a buyer demand")
    public ResponseEntity<PriceOffer> submitOffer(
        Authentication authentication,
        @Valid @RequestBody PriceOfferDTO dto
    ) {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(pricingService.submitOffer(dto, user.getId()));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Buyer accepts a farmer price offer")
    public ResponseEntity<PriceOffer> acceptOffer(@PathVariable UUID id) {
        return ResponseEntity.ok(pricingService.acceptOffer(id));
    }
}
