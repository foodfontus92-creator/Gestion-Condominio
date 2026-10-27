package com.condominio.backend.controller;

import com.condominio.backend.dto.MaintenanceRequestDTO;
import com.condominio.backend.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<List<MaintenanceRequestDTO>> getOpen() {
        return ResponseEntity.ok(maintenanceService.getOpenMaintenance());
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<MaintenanceRequestDTO>> getByApartment(@PathVariable UUID apartmentId) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceByApartment(apartmentId));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestDTO> create(
            @RequestParam UUID apartmentId,
            @RequestParam UUID reportedById,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam(defaultValue = "MEDIUM") String priority) {
        return ResponseEntity.ok(maintenanceService.createMaintenance(
                apartmentId, reportedById, title, description, priority));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<MaintenanceRequestDTO> update(
            @PathVariable UUID id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, status, priority, assignedTo, notes));
    }
}
