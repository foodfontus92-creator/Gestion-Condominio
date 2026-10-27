package com.condominio.backend.service;

import com.condominio.backend.dto.CommonAreaDTO;
import com.condominio.backend.entity.CommonArea;
import com.condominio.backend.repository.CommonAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonAreaService {

    private final CommonAreaRepository commonAreaRepository;

    public List<CommonAreaDTO> getAllActive() {
        return commonAreaRepository.findByIsActive(true).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CommonAreaDTO> getAll() {
        return commonAreaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommonAreaDTO createCommonArea(String name, String description, Integer capacity, String location, String imageUrl) {
        CommonArea c = CommonArea.builder()
                .name(name)
                .description(description)
                .capacity(capacity)
                .location(location)
                .imageUrl(imageUrl)
                .isActive(true)
                .build();
        return mapToDTO(commonAreaRepository.save(c));
    }

    @Transactional
    public CommonAreaDTO updateCommonArea(UUID id, String name, String description, Integer capacity, String location, String imageUrl, Boolean isActive) {
        CommonArea c = commonAreaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Common area not found"));
        if (name != null) c.setName(name);
        if (description != null) c.setDescription(description);
        if (capacity != null) c.setCapacity(capacity);
        if (location != null) c.setLocation(location);
        if (imageUrl != null) c.setImageUrl(imageUrl);
        if (isActive != null) c.setActive(isActive);
        return mapToDTO(commonAreaRepository.save(c));
    }

    private CommonAreaDTO mapToDTO(CommonArea c) {
        CommonAreaDTO dto = new CommonAreaDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setCapacity(c.getCapacity());
        dto.setLocation(c.getLocation());
        dto.setImageUrl(c.getImageUrl());
        dto.setActive(c.isActive());
        return dto;
    }
}
