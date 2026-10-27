package com.condominio.backend.service;

import com.condominio.backend.dto.OccupantDTO;
import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.Occupant;
import com.condominio.backend.repository.ApartmentRepository;
import com.condominio.backend.repository.OccupantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OccupantService {

    private final OccupantRepository occupantRepository;
    private final ApartmentRepository apartmentRepository;

    public List<OccupantDTO> getOccupantsByApartment(UUID apartmentId) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return occupantRepository.findByApartment(a).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OccupantDTO createOccupant(UUID apartmentId, String fullName, String documentId,
                                      String phone, String email, String occupantType, boolean isPrimary) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        Occupant o = Occupant.builder()
                .apartment(a)
                .fullName(fullName)
                .documentId(documentId)
                .phone(phone)
                .email(email)
                .occupantType(occupantType)
                .isPrimary(isPrimary)
                .build();
        return mapToDTO(occupantRepository.save(o));
    }

    @Transactional
    public OccupantDTO updateOccupant(UUID id, String fullName, String documentId, String phone,
                                      String email, String occupantType, Boolean isPrimary) {
        Occupant o = occupantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Occupant not found"));
        if (fullName != null) o.setFullName(fullName);
        if (documentId != null) o.setDocumentId(documentId);
        if (phone != null) o.setPhone(phone);
        if (email != null) o.setEmail(email);
        if (occupantType != null) o.setOccupantType(occupantType);
        if (isPrimary != null) o.setPrimary(isPrimary);
        return mapToDTO(occupantRepository.save(o));
    }

    @Transactional
    public void deleteOccupant(UUID id) {
        occupantRepository.deleteById(id);
    }

    private OccupantDTO mapToDTO(Occupant o) {
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
}
