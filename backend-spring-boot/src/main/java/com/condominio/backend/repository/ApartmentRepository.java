package com.condominio.backend.repository;

import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
    List<Apartment> findByBuilding(Building building);
    List<Apartment> findByBuildingId(UUID buildingId);
    boolean existsByBuildingAndNumber(Building building, Integer number);
    long countByStatus(String status);
}
