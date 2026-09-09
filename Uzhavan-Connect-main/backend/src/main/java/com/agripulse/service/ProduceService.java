package com.agripulse.service;

import com.agripulse.dto.ProduceDTO;
import com.agripulse.entity.ProduceListing;
import com.agripulse.entity.User;
import com.agripulse.repository.ProduceListingRepository;
import com.agripulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProduceService {

    private final ProduceListingRepository produceRepository;
    private final UserRepository userRepository;

    public ProduceService(ProduceListingRepository produceRepository, UserRepository userRepository) {
        this.produceRepository = produceRepository;
        this.userRepository = userRepository;
    }

    public List<ProduceListing> getAllProduce(String status) {
        if (status != null && !status.isBlank()) {
            return produceRepository.findByStatus(status);
        }
        return produceRepository.findAll();
    }

    public List<ProduceListing> getFarmerProduce(UUID farmerId) {
        return produceRepository.findByFarmerId(farmerId);
    }

    @Transactional
    public ProduceListing createProduce(ProduceDTO dto, UUID authenticatedUserId) {
        ProduceListing listing = new ProduceListing();
        User user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + authenticatedUserId));

        listing.setFarmer(user);
        listing.setCrop(dto.crop());
        listing.setQuantity(dto.quantity());
        listing.setQuality(dto.quality() != null ? dto.quality() : "Grade A");
        listing.setExpectedPrice(dto.expectedPrice());
        listing.setAvailableDate(dto.availableDate());
        listing.setLocation(dto.location() != null ? dto.location() : "Local Farm");
        listing.setStatus("AVAILABLE");
        listing.setCreatedAt(LocalDateTime.now());

        return produceRepository.save(listing);
    }

    @Transactional
    public ProduceListing updateProduce(UUID id, ProduceDTO dto) {
        ProduceListing listing = produceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Produce not found: " + id));

        if (dto.crop() != null) listing.setCrop(dto.crop());
        if (dto.quantity() != null) listing.setQuantity(dto.quantity());
        if (dto.expectedPrice() != null) listing.setExpectedPrice(dto.expectedPrice());
        if (dto.quality() != null) listing.setQuality(dto.quality());
        if (dto.status() != null) listing.setStatus(dto.status());

        return produceRepository.save(listing);
    }

    @Transactional
    public void deleteProduce(UUID id) {
        produceRepository.deleteById(id);
    }
}
