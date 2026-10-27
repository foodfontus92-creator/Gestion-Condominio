package com.condominio.backend.service;

import com.condominio.backend.dto.BuildingDTO;
import com.condominio.backend.entity.Building;
import com.condominio.backend.repository.BuildingRepository;
import com.condominio.backend.dto.OccupantDTO;
import com.condominio.backend.dto.PaymentDTO;
import com.condominio.backend.dto.ApartmentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public List<BuildingDTO> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public BuildingDTO getBuildingById(UUID id) {
        Building b = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found"));
        return mapToDTO(b);
    }

    @Transactional
    public BuildingDTO createBuilding(String code) {
        if (buildingRepository.existsByCode(code)) {
            throw new RuntimeException("Building code already exists");
        }
        Building b = Building.builder()
                .code(code)
                .status("active")
                .build();
        return mapToDTO(buildingRepository.save(b));
    }

    @Transactional
    public BuildingDTO suppressBuilding(UUID id) {
        Building b = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found"));
        b.setStatus("suppressed");
        return mapToDTO(buildingRepository.save(b));
    }

    private BuildingDTO mapToDTO(Building b) {
        BuildingDTO dto = new BuildingDTO();
        dto.setId(b.getId());
        dto.setCode(b.getCode());
        dto.setStatus(b.getStatus());
        if (b.getApartments() != null) {
            dto.setApartments(b.getApartments().stream()
                    .map(this::mapApartmentToDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ApartmentDTO mapApartmentToDTO(com.condominio.backend.entity.Apartment a) {
        ApartmentDTO dto = new ApartmentDTO();
        dto.setId(a.getId());
        dto.setBuildingId(a.getBuilding().getId().toString());
        dto.setNumber(a.getNumber());
        dto.setStatus(a.getStatus());
        dto.setMonthlyFee(a.getMonthlyFee());
        if (a.getOccupants() != null) {
            dto.setOccupants(a.getOccupants().stream().map(this::mapOccupantToDTO).collect(Collectors.toList()));
        }
        if (a.getPayments() != null) {
            dto.setPayments(a.getPayments().stream().map(this::mapPaymentToDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    private OccupantDTO mapOccupantToDTO(com.condominio.backend.entity.Occupant o) {
        OccupantDTO dto = new OccupantDTO();
        dto.setId(o.getId());
        dto.setFullName(o.getFullName());
        dto.setDocumentId(o.getDocumentId());
        dto.setPhone(o.getPhone());
        dto.setEmail(o.getEmail());
        dto.setOccupantType(o.getOccupantType());
        dto.setPrimary(o.isPrimary());
        dto.setApartmentId(o.getApartment().getId());
        return dto;
    }

    private PaymentDTO mapPaymentToDTO(com.condominio.backend.entity.Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setApartmentId(p.getApartment().getId());
        dto.setAmount(p.getAmount());
        dto.setDescription(p.getDescription());
        dto.setDueDate(p.getDueDate());
        dto.setPaidDate(p.getPaidDate());
        dto.setStatus(p.getStatus().name());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setReference(p.getReference());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
