package com.condominio.backend.controller;

import com.condominio.backend.dto.CommonAreaDTO;
import com.condominio.backend.service.CommonAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/common-areas")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CommonAreaController {

    private final CommonAreaService commonAreaService;

    @GetMapping
    public ResponseEntity<List<CommonAreaDTO>> getAll(@RequestParam(defaultValue = "true") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(commonAreaService.getAllActive());
        }
        return ResponseEntity.ok(commonAreaService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonAreaDTO> create(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "1") Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String imageUrl) {
        return ResponseEntity.ok(commonAreaService.createCommonArea(
                name, description, capacity, location, imageUrl));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonAreaDTO> update(
            @PathVariable UUID id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(commonAreaService.updateCommonArea(
                id, name, description, capacity, location, imageUrl, isActive));
    }
}
