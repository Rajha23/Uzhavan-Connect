package com.agripulse.service;

import com.agripulse.dto.AuthRequest;
import com.agripulse.dto.AuthResponse;
import com.agripulse.dto.RegisterRequest;
import com.agripulse.entity.FarmerProfile;
import com.agripulse.entity.Role;
import com.agripulse.entity.User;
import com.agripulse.repository.FarmerProfileRepository;
import com.agripulse.repository.UserRepository;
import com.agripulse.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
        UserRepository userRepository,
        FarmerProfileRepository farmerProfileRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Enforce restriction: OPERATIONS_ADMIN cannot be registered publicly
        if (request.role() == Role.OPERATIONS_ADMIN) {
            throw new IllegalArgumentException("Registration for " + request.role() + " is restricted. Contact system administration.");
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        if (userRepository.findByMobile(request.mobile()).isPresent()) {
            throw new IllegalArgumentException("Mobile already registered: " + request.mobile());
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setMobile(request.mobile());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // If Farmer, create profile
        if (request.role() == Role.FARMER) {
            FarmerProfile profile = new FarmerProfile();
            profile.setUser(savedUser);
            profile.setVillage(request.village() != null ? request.village() : "Not Specified");
            profile.setDistrict(request.district() != null ? request.district() : "Not Specified");
            profile.setState(request.state() != null ? request.state() : "Not Specified");
            profile.setPincode(request.pincode() != null ? request.pincode() : "000000");
            profile.setMainCrop(request.mainCrop() != null ? request.mainCrop() : "Mixed Crops");
            profile.setFarmSize(request.farmSize() != null ? request.farmSize() : 2.5);
            farmerProfileRepository.save(profile);
        }

        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getMobile(), savedUser.getRole(), savedUser.getStatus());
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.identifier())
            .or(() -> userRepository.findByMobile(request.identifier()));

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email/mobile or password");
        }

        User user = userOpt.get();
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getEmail(), request.password())
        );

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole(), user.getStatus());
    }

    public User getMe(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }
}
