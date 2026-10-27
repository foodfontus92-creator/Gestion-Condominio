package com.condominio.backend.service;

import com.condominio.backend.dto.ReservationDTO;
import com.condominio.backend.entity.CommonArea;
import com.condominio.backend.entity.Reservation;
import com.condominio.backend.entity.User;
import com.condominio.backend.repository.CommonAreaRepository;
import com.condominio.backend.repository.ReservationRepository;
import com.condominio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final CommonAreaRepository commonAreaRepository;
    private final UserRepository userRepository;

    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ReservationDTO> getReservationsByUser(UUID userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reservationRepository.findByUser(u).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationDTO createReservation(UUID commonAreaId, UUID userId, LocalDateTime startTime,
                                            LocalDateTime endTime, String purpose) {
        CommonArea c = commonAreaRepository.findById(commonAreaId)
                .orElseThrow(() -> new RuntimeException("Common area not found"));
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Reservation.ReservationStatus> activeStatuses = List.of(
                Reservation.ReservationStatus.PENDING,
                Reservation.ReservationStatus.CONFIRMED
        );
        if (reservationRepository.existsByCommonAreaIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
                commonAreaId, endTime, startTime, activeStatuses)) {
            throw new RuntimeException("Area already reserved for this time slot");
        }

        Reservation r = Reservation.builder()
                .commonArea(c)
                .user(u)
                .startTime(startTime)
                .endTime(endTime)
                .status(Reservation.ReservationStatus.PENDING)
                .purpose(purpose)
                .build();
        return mapToDTO(reservationRepository.save(r));
    }

    @Transactional
    public ReservationDTO updateReservation(UUID id, String status) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        r.setStatus(Reservation.ReservationStatus.valueOf(status));
        return mapToDTO(reservationRepository.save(r));
    }

    private ReservationDTO mapToDTO(Reservation r) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(r.getId());
        dto.setCommonAreaId(r.getCommonArea().getId());
        dto.setUserId(r.getUser().getId());
        dto.setStartTime(r.getStartTime());
        dto.setEndTime(r.getEndTime());
        dto.setStatus(r.getStatus().name());
        dto.setPurpose(r.getPurpose());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
