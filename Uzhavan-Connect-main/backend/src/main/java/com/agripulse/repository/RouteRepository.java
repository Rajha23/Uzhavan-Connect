package com.agripulse.repository;

import com.agripulse.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, String> {
    Optional<Route> findByShipmentId(String shipmentId);
}
