package com.condominio.backend.service;

import com.condominio.backend.dto.PaymentDTO;
import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.Payment;
import com.condominio.backend.repository.ApartmentRepository;
import com.condominio.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApartmentRepository apartmentRepository;

    public List<PaymentDTO> getPaymentsByApartment(UUID apartmentId) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        return paymentRepository.findByApartment(a).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getPendingPayments() {
        return paymentRepository.findByStatus(Payment.PaymentStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentDTO> getOverduePayments() {
        return paymentRepository.findByStatusAndDueDateBefore(
                Payment.PaymentStatus.PENDING, LocalDateTime.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO createPayment(UUID apartmentId, Double amount, String description, LocalDateTime dueDate) {
        Apartment a = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found"));
        Payment p = Payment.builder()
                .apartment(a)
                .amount(amount)
                .description(description)
                .dueDate(dueDate)
                .status(Payment.PaymentStatus.PENDING)
                .build();
        return mapToDTO(paymentRepository.save(p));
    }

    @Transactional
    public PaymentDTO markAsPaid(UUID paymentId) {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        p.setStatus(Payment.PaymentStatus.PAID);
        p.setPaidDate(LocalDateTime.now());
        return mapToDTO(paymentRepository.save(p));
    }

    private PaymentDTO mapToDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setApartmentId(p.getApartment().getId());
        dto.setAmount(p.getAmount());
        dto.setDescription(p.getDescription());
        dto.setDueDate(p.getDueDate());
        dto.setPaidDate(p.getPaidDate());
        dto.setStatus(p.getStatus().name());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setReference(p.getReference());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
