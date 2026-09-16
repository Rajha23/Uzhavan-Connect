package com.agripulse.service;

import com.agripulse.dto.BatchDTO;
import com.agripulse.entity.ProduceBatch;
import com.agripulse.entity.User;
import com.agripulse.repository.ProduceBatchRepository;
import com.agripulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class TraceabilityService {

    private final ProduceBatchRepository batchRepository;
    private final UserRepository userRepository;

    public TraceabilityService(ProduceBatchRepository batchRepository, UserRepository userRepository) {
        this.batchRepository = batchRepository;
        this.userRepository = userRepository;
    }

    public ProduceBatch getBatchByCode(String batchCode) {
        return batchRepository.findByBatchCode(batchCode)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found: " + batchCode));
    }

    @Transactional
    public ProduceBatch createBatch(BatchDTO dto, UUID farmerId) {
        User farmer = userRepository.findById(farmerId)
            .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        String generatedCode = "BATCH-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ProduceBatch batch = new ProduceBatch();
        batch.setBatchCode(generatedCode);
        batch.setProduct(dto.product());
        batch.setFarmer(farmer);
        batch.setQuantity(dto.quantity());
        batch.setHarvestDate(dto.harvestDate() != null ? dto.harvestDate() : LocalDate.now());
        batch.setQuality(dto.quality() != null ? dto.quality() : "Grade A Premium");
        batch.setCollectionCenter(dto.collectionCenter() != null ? dto.collectionCenter() : "Chengalpattu Micro-Hub #4");
        batch.setStatus("HARVESTED");
        batch.setQrCode("https://agripulse-mocha.vercel.app/traceability?batch=" + generatedCode);

        return batchRepository.save(batch);
    }
}
