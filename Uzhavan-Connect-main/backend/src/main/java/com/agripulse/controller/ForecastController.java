package com.agripulse.controller;

import com.agripulse.entity.Forecast;
import com.agripulse.service.ForecastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forecasts")
@Tag(name = "Demand Forecasting", description = "AI predicted commodity demand and regional shortages")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @GetMapping
    @Operation(summary = "Get all forecasts or filter by product")
    public ResponseEntity<List<Forecast>> getForecasts(@RequestParam(required = false) String product) {
        if (product != null && !product.isBlank()) {
            return ResponseEntity.ok(forecastService.getForecastsByProduct(product));
        }
        return ResponseEntity.ok(forecastService.getAllForecasts());
    }

    @PostMapping("/generate")
    @Operation(summary = "Trigger AI demand forecasting model generation")
    public ResponseEntity<Forecast> generateForecast(@RequestBody Map<String, String> body) {
        String product = body.getOrDefault("product", "Tomato");
        String location = body.getOrDefault("location", "Chennai");
        return ResponseEntity.ok(forecastService.generateForecast(product, location));
    }
}
