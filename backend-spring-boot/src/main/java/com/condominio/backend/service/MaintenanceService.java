package com.condominio.backend.service;

import com.condominio.backend.dto.MaintenanceRequestDTO;
import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.MaintenanceRequest;
import com.condominio.backend.entity.User;
import com.condominio.backend.repository.ApartmentRepository;
import com.condominio.backend.repository.MaintenanceRepository;
import com.condominio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;

    public List<MaintenanceRequestDTO> getOpenMaintenance() {
        return maintenanceRepository.findByStatus(MaintenanceRequest.MaintenanceStatus.OPEN).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceRequestDTO> getMaintenanceByApartment(UUID apartmentId) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return maintenanceRepository.findByApartment(a).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceRequestDTO createMaintenance(UUID apartmentId, UUID reportedById, String title,
                                                   String description, String priority) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        User u = userRepository.findById(reportedById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MaintenanceRequest m = MaintenanceRequest.builder()
                .apartment(a)
                .reportedBy(u)
                .title(title)
                .description(description)
                .status(MaintenanceRequest.MaintenanceStatus.OPEN)
                .priority(MaintenanceRequest.MaintenancePriority.valueOf(priority))
                .build();
        return mapToDTO(maintenanceRepository.save(m));
    }

    @Transactional
    public MaintenanceRequestDTO updateMaintenance(UUID id, String status, String priority, String assignedTo, String notes) {
        MaintenanceRequest m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));
        if (status != null) m.setStatus(MaintenanceRequest.MaintenanceStatus.valueOf(status));
        if (priority != null) m.setPriority(MaintenanceRequest.MaintenancePriority.valueOf(priority));
        if (assignedTo != null) m.setAssignedTo(assignedTo);
        if (notes != null) m.setNotes(notes);
        if ("CLOSED".equals(status)) m.setResolvedAt(java.time.LocalDateTime.now());
        return mapToDTO(maintenanceRepository.save(m));
    }

    private MaintenanceRequestDTO mapToDTO(MaintenanceRequest m) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setId(m.getId());
        dto.setApartmentId(m.getApartment().getId());
        dto.setReportedById(m.getReportedBy().getId());
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setStatus(m.getStatus().name());
        dto.setPriority(m.getPriority().name());
        dto.setReportedAt(m.getReportedAt());
        dto.setResolvedAt(m.getResolvedAt());
        dto.setAssignedTo(m.getAssignedTo());
        dto.setNotes(m.getNotes());
        return dto;
    }
}
