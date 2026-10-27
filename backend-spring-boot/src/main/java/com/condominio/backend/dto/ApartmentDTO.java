package com.condominio.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ApartmentDTO {
    private UUID id;
    private String buildingId;
    private Integer number;
    private String status;
    private Double monthlyFee;
    private List<OccupantDTO> occupants;
    private List<PaymentDTO> payments;
}
