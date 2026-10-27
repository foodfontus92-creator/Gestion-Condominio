package com.condominio.backend.service;

import com.condominio.backend.dto.ApartmentDTO;
import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.Building;
import com.condominio.backend.repository.ApartmentRepository;
import com.condominio.backend.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final BuildingRepository buildingRepository;

    public List<ApartmentDTO> getApartmentsByBuilding(UUID buildingId) {
        Building b = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Building not found"));
        return apartmentRepository.findByBuilding(b).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApartmentDTO suppressApartment(UUID id) {
        Apartment a = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        a.setStatus("suppressed");
        return mapToDTO(apartmentRepository.save(a));
    }

    private ApartmentDTO mapToDTO(Apartment a) {
        ApartmentDTO dto = new ApartmentDTO();
        dto.setId(a.getId());
        dto.setBuildingId(a.getBuilding().getId().toString());
        dto.setNumber(a.getNumber());
        dto.setStatus(a.getStatus());
        dto.setMonthlyFee(a.getMonthlyFee());
        return dto;
    }
}
