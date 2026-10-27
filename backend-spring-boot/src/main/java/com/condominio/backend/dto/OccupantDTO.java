package com.condominio.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class OccupantDTO {
    private UUID id;
    private String fullName;
    private String documentId;
    private String phone;
    private String email;
    private String occupantType;
    private boolean isPrimary;
    private UUID apartmentId;
}
