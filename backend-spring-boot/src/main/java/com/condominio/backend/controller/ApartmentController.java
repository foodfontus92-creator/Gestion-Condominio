package com.condominio.backend.controller;

import com.condominio.backend.dto.ApartmentDTO;
import com.condominio.backend.service.ApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/apartments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ApartmentController {

    private final ApartmentService apartmentService;

    @GetMapping("/building/{buildingId}")
    public ResponseEntity<List<ApartmentDTO>> getApartmentsByBuilding(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(apartmentService.getApartmentsByBuilding(buildingId));
    }

    @PatchMapping("/{id}/suppress")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<ApartmentDTO> suppressApartment(@PathVariable UUID id) {
        return ResponseEntity.ok(apartmentService.suppressApartment(id));
    }
}
