package com.agripulse.repository;

import com.agripulse.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, String> {
    Optional<FarmerProfile> findByUserId(String userId);
}
