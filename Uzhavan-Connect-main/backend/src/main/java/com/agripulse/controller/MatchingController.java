package com.agripulse.controller;

import com.agripulse.entity.Match;
import com.agripulse.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@Tag(name = "Matching Engine", description = "Multi-attribute ranking and matching between demand and supply")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping
    @Operation(summary = "Get all matches or matches for a specific demand")
    public ResponseEntity<List<Match>> getMatches(@RequestParam(required = false) UUID demandId) {
        if (demandId != null) {
            return ResponseEntity.ok(matchingService.getMatchesForDemand(demandId));
        }
        return ResponseEntity.ok(matchingService.getAllMatches());
    }

    @PostMapping("/run")
    @Operation(summary = "Run multi-attribute matching algorithm for a given demand request")
    public ResponseEntity<List<Match>> runMatching(@RequestBody Map<String, String> body) {
        UUID demandId = UUID.fromString(body.get("demandId"));
        return ResponseEntity.ok(matchingService.runMatching(demandId));
    }
}
