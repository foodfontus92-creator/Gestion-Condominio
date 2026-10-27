package com.condominio.backend.service;

import com.condominio.backend.dto.DashboardMetricsDTO;
import com.condominio.backend.entity.*;
import com.condominio.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final BuildingRepository buildingRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final OccupantRepository occupantRepository;
    private final PaymentRepository paymentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final CommonAreaRepository commonAreaRepository;
    private final ReservationRepository reservationRepository;

    public DashboardMetricsDTO getMetrics() {
        DashboardMetricsDTO m = new DashboardMetricsDTO();
        m.setTotalBuildings((int) buildingRepository.count());
        m.setTotalApartments((int) apartmentRepository.count());
        m.setActiveApartments((int) apartmentRepository.countByStatus("active"));
        m.setSuppressedApartments((int) apartmentRepository.countByStatus("suppressed"));
        
        long occupied = occupantRepository.findAll().stream()
                .filter(Occupant::isPrimary)
                .map(Occupant::getApartment)
                .distinct()
                .count();
        m.setOccupiedApartments((int) occupied);
        m.setVacantApartments(m.getActiveApartments() - (int) occupied);
        
        m.setPendingPayments((int) paymentRepository.findByStatus(Payment.PaymentStatus.PENDING).size());
        m.setOverduePayments((int) paymentRepository.findByStatusAndDueDateBefore(
                Payment.PaymentStatus.PENDING, LocalDateTime.now()).size());
        
        m.setOpenMaintenance((int) maintenanceRepository.findByStatus(MaintenanceRequest.MaintenanceStatus.OPEN).size());
        m.setClosedMaintenance((int) maintenanceRepository.findByStatus(MaintenanceRequest.MaintenanceStatus.CLOSED).size());
        
        m.setTotalCommonAreas((int) commonAreaRepository.count());
        m.setConfirmedReservations((int) reservationRepository.countByStatus(Reservation.ReservationStatus.CONFIRMED));
        
        return m;
    }
}
