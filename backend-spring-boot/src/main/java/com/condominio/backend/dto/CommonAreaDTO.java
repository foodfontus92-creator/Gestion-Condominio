package com.condominio.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CommonAreaDTO {
    private UUID id;
    private String name;
    private String description;
    private Integer capacity;
    private String location;
    private String imageUrl;
    private boolean isActive;
}
