package com.condominio.backend.controller;

import com.condominio.backend.dto.BuildingDTO;
import com.condominio.backend.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping
    public ResponseEntity<List<BuildingDTO>> getAllBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingDTO> getBuilding(@PathVariable UUID id) {
        return ResponseEntity.ok(buildingService.getBuildingById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BuildingDTO> createBuilding(@RequestParam String code) {
        return ResponseEntity.ok(buildingService.createBuilding(code));
    }

    @PatchMapping("/{id}/suppress")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BuildingDTO> suppressBuilding(@PathVariable UUID id) {
        return ResponseEntity.ok(buildingService.suppressBuilding(id));
    }
}
