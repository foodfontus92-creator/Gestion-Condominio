package com.condominio.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BuildingDTO {
    private UUID id;
    private String code;
    private String status;
    private List<ApartmentDTO> apartments;
}
