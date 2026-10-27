package com.condominio.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MaintenanceRequestDTO {
    private UUID id;
    private UUID apartmentId;
    private UUID reportedById;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private String assignedTo;
    private String notes;
}
