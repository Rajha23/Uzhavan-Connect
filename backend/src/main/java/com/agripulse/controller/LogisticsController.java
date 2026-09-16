package com.agripulse.controller;

import com.agripulse.entity.Route;
import com.agripulse.entity.Shipment;
import com.agripulse.service.LogisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "Logistics & Routes", description = "Shipment management, collection center aggregation, and route optimization")
public class LogisticsController {

    private final LogisticsService logisticsService;

    public LogisticsController(LogisticsService logisticsService) {
        this.logisticsService = logisticsService;
    }

    @GetMapping("/shipments")
    @Operation(summary = "Get all shipments or filter by status (READY, PICKUP, IN_TRANSIT, DELIVERED)")
    public ResponseEntity<List<Shipment>> getShipments(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(logisticsService.getAllShipments(status));
    }

    @GetMapping("/shipments/{id}")
    @Operation(summary = "Get shipment details by ID")
    public ResponseEntity<Shipment> getShipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.getShipmentById(id));
    }

    @PostMapping("/shipments")
    @Operation(summary = "Create shipment from matched demand")
    public ResponseEntity<Shipment> createShipment(@RequestBody Map<String, String> body) {
        UUID matchId = UUID.fromString(body.get("matchId"));
        String vehicle = body.get("vehicle");
        String pickup = body.get("pickupLocation");
        String delivery = body.get("deliveryLocation");
        return ResponseEntity.ok(logisticsService.createShipmentFromMatch(matchId, vehicle, pickup, delivery));
    }

    @PutMapping("/shipments/{id}/status")
    @Operation(summary = "Update shipment status (triggers settlement on DELIVERED)")
    public ResponseEntity<Shipment> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(logisticsService.updateShipmentStatus(id, status));
    }

    @PostMapping("/routes/optimize")
    @Operation(summary = "Optimize delivery route using OR-Tools algorithm")
    public ResponseEntity<Route> optimizeRoute(@RequestBody Map<String, String> body) {
        UUID shipmentId = UUID.fromString(body.get("shipmentId"));
        return ResponseEntity.ok(logisticsService.optimizeRoute(shipmentId));
    }

    @GetMapping("/routes/{id}")
    @Operation(summary = "Get route details by ID")
    public ResponseEntity<Route> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.getRouteById(id));
    }
}
