package com.condominio.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationDTO {
    private UUID id;
    private UUID commonAreaId;
    private UUID userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String purpose;
    private LocalDateTime createdAt;
}
