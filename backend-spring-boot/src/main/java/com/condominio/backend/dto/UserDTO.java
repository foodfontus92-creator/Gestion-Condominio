package com.condominio.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private boolean isActive;
    private UUID apartmentId;
}
