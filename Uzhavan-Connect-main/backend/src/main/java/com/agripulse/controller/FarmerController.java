package com.agripulse.controller;

import com.agripulse.entity.FarmerProfile;
import com.agripulse.entity.User;
import com.agripulse.repository.FarmerProfileRepository;
import com.agripulse.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
@Tag(name = "Farmer", description = "Farmer profile management")
public class FarmerController {

    private final FarmerProfileRepository farmerProfileRepository;
    private final AuthService authService;

    public FarmerController(FarmerProfileRepository farmerProfileRepository, AuthService authService) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.authService = authService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get farmer profile for logged in user")
    public ResponseEntity<FarmerProfile> getProfile(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        return farmerProfileRepository.findByUserId(user.getId())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    @Operation(summary = "Update farmer profile")
    public ResponseEntity<FarmerProfile> updateProfile(Authentication authentication, @RequestBody FarmerProfile updated) {
        User user = authService.getUserByEmail(authentication.getName());
        FarmerProfile profile = farmerProfileRepository.findByUserId(user.getId())
            .orElseGet(() -> {
                FarmerProfile newProf = new FarmerProfile();
                newProf.setUser(user);
                return newProf;
            });

        if (updated.getVillage() != null) profile.setVillage(updated.getVillage());
        if (updated.getDistrict() != null) profile.setDistrict(updated.getDistrict());
        if (updated.getState() != null) profile.setState(updated.getState());
        if (updated.getPincode() != null) profile.setPincode(updated.getPincode());
        if (updated.getMainCrop() != null) profile.setMainCrop(updated.getMainCrop());
        if (updated.getFarmSize() != null) profile.setFarmSize(updated.getFarmSize());

        return ResponseEntity.ok(farmerProfileRepository.save(profile));
    }
}
