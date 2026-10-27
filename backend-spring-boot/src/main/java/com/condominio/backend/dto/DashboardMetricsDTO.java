package com.condominio.backend.dto;

import lombok.Data;

@Data
public class DashboardMetricsDTO {
    private int totalBuildings;
    private int totalApartments;
    private int activeApartments;
    private int suppressedApartments;
    private int occupiedApartments;
    private int vacantApartments;
    private int pendingPayments;
    private int overduePayments;
    private int openMaintenance;
    private int closedMaintenance;
    private int totalCommonAreas;
    private int confirmedReservations;
}
