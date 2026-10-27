package com.condominio.backend.controller;

import com.condominio.backend.dto.OccupantDTO;
import com.condominio.backend.service.OccupantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/occupants")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class OccupantController {

    private final OccupantService occupantService;

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<OccupantDTO>> getOccupants(@PathVariable UUID apartmentId) {
        return ResponseEntity.ok(occupantService.getOccupantsByApartment(apartmentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<OccupantDTO> createOccupant(
            @RequestParam UUID apartmentId,
            @RequestParam String fullName,
            @RequestParam(required = false) String documentId,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "owner") String occupantType,
            @RequestParam(defaultValue = "true") boolean isPrimary) {
        return ResponseEntity.ok(occupantService.createOccupant(
                apartmentId, fullName, documentId, phone, email, occupantType, isPrimary));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<OccupantDTO> updateOccupant(
            @PathVariable UUID id,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String documentId,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String occupantType,
            @RequestParam(required = false) Boolean isPrimary) {
        return ResponseEntity.ok(occupantService.updateOccupant(
                id, fullName, documentId, phone, email, occupantType, isPrimary));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOccupant(@PathVariable UUID id) {
        occupantService.deleteOccupant(id);
        return ResponseEntity.noContent().build();
    }
}
