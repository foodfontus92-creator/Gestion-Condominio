package com.condominio.backend.repository;

import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, UUID> {
    List<MaintenanceRequest> findByApartment(Apartment apartment);
    List<MaintenanceRequest> findByStatus(MaintenanceRequest.MaintenanceStatus status);
}
