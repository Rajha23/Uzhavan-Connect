package com.agripulse.service;

import com.agripulse.entity.Forecast;
import com.agripulse.repository.ForecastRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ForecastService {

    private final ForecastRepository forecastRepository;
    private final RestTemplate restTemplate;

    @Value("${agripulse.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public ForecastService(ForecastRepository forecastRepository) {
        this.forecastRepository = forecastRepository;
        this.restTemplate = new RestTemplate();
    }

    public List<Forecast> getAllForecasts() {
        return forecastRepository.findAll();
    }

    public List<Forecast> getForecastsByProduct(String product) {
        return forecastRepository.findByProduct(product);
    }

    @Transactional
    public Forecast generateForecast(String product, String location) {
        double predictedQty = 8500.0;
        double confidence = 0.82;
        String modelVersion = "XGBoost-Demand-v2.1-Demo";

        try {
            Map<String, Object> req = Map.of(
                "crop", product != null ? product : "Tomato",
                "location", location != null ? location : "Chennai",
                "season", "Kharif-Summer",
                "current_price", 26.0
            );
            Map<?, ?> response = restTemplate.postForObject(aiServiceUrl + "/api/forecasts/predict", req, Map.class);
            if (response != null && response.containsKey("predicted_demand_kg")) {
                predictedQty = ((Number) response.get("predicted_demand_kg")).doubleValue();
                confidence = ((Number) response.get("confidence")).doubleValue();
                modelVersion = (String) response.get("model_version");
            }
        } catch (Exception e) {
            // Demonstration data pipeline fallback if AI microservice is warming up
            predictedQty = 8500.0;
            confidence = 0.82;
        }

        Forecast forecast = new Forecast();
        forecast.setProduct(product != null ? product : "Tomato");
        forecast.setLocation(location != null ? location : "Chennai");
        forecast.setForecastDate(LocalDate.now().plusDays(7));
        forecast.setPredictedQuantity(BigDecimal.valueOf(predictedQty));
        forecast.setConfidence(BigDecimal.valueOf(confidence));
        forecast.setModelVersion(modelVersion);
        forecast.setCreatedAt(LocalDateTime.now());

        return forecastRepository.save(forecast);
    }
}
