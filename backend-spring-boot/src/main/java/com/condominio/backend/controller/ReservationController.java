package com.condominio.backend.controller;

import com.condominio.backend.dto.ReservationDTO;
import com.condominio.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<ReservationDTO>> getAll(
            @RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return ResponseEntity.ok(reservationService.getReservationsByUser(userId));
        }
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @PostMapping
    public ResponseEntity<ReservationDTO> create(
            @RequestParam UUID commonAreaId,
            @RequestParam UUID userId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam(required = false) String purpose) {
        return ResponseEntity.ok(reservationService.createReservation(
                commonAreaId, userId, startTime, endTime, purpose));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<ReservationDTO> update(
            @PathVariable UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateReservation(id, status));
    }
}
