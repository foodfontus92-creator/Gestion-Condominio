package com.condominio.backend.repository;

import com.condominio.backend.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BuildingRepository extends JpaRepository<Building, UUID> {
    Building findByCode(String code);
    boolean existsByCode(String code);
}
