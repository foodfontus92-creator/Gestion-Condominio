package com.condominio.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PaymentDTO {
    private UUID id;
    private UUID apartmentId;
    private Double amount;
    private String description;
    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private String status;
    private String paymentMethod;
    private String reference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
