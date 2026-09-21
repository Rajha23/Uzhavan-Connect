package com.agripulse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ml/crop-yield")
@Tag(name = "Crop Yield Prediction", description = "Machine Learning Crop Yield Prediction Module")
public class CropYieldController {

    private final RestTemplate restTemplate;

    @Value("${agripulse.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public CropYieldController() {
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/predict")
    @Operation(summary = "Predict expected crop yield from cultivation parameters")
    public ResponseEntity<?> predictCropYield(@RequestBody Map<String, Object> request) {
        try {
            String targetUrl = aiServiceUrl + "/api/ml/crop-yield/predict";
            Map<?, ?> response = restTemplate.postForObject(targetUrl, request, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", "AI Prediction microservice error: " + e.getMessage(),
                "fallback_available", true
            ));
        }
    }

    @GetMapping("/meta")
    @Operation(summary = "Retrieve supported crop list, states, and model metrics")
    public ResponseEntity<?> getMetadata() {
        try {
            String targetUrl = aiServiceUrl + "/api/ml/crop-yield/meta";
            Map<?, ?> response = restTemplate.getForObject(targetUrl, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "AI Microservice unreachable",
                "detail", e.getMessage()
            ));
        }
    }
}
