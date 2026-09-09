package com.agripulse.repository;

import com.agripulse.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, String> {
    List<Match> findByDemandId(String demandId);
    List<Match> findByFarmerId(String farmerId);
}
