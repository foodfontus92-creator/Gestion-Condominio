package com.condominio.backend.controller;

import com.condominio.backend.dto.PaymentDTO;
import com.condominio.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<PaymentDTO>> getPayments(@PathVariable UUID apartmentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByApartment(apartmentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<PaymentDTO> createPayment(
            @RequestParam UUID apartmentId,
            @RequestParam Double amount,
            @RequestParam String description,
            @RequestParam LocalDateTime dueDate) {
        return ResponseEntity.ok(paymentService.createPayment(apartmentId, amount, description, dueDate));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<PaymentDTO> markAsPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.markAsPaid(id));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<List<PaymentDTO>> getPending() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'PORTERO')")
    public ResponseEntity<List<PaymentDTO>> getOverdue() {
        return ResponseEntity.ok(paymentService.getOverduePayments());
    }
}
