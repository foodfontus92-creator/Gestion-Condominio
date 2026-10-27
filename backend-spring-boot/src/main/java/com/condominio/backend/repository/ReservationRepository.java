package com.condominio.backend.repository;

import com.condominio.backend.entity.CommonArea;
import com.condominio.backend.entity.Reservation;
import com.condominio.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByCommonArea(CommonArea commonArea);
    List<Reservation> findByUser(User user);
    List<Reservation> findByCommonAreaIdAndStatusIn(UUID commonAreaId, List<Reservation.ReservationStatus> statuses);
    boolean existsByCommonAreaIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
            UUID commonAreaId, LocalDateTime startTime, LocalDateTime endTime,
            List<Reservation.ReservationStatus> statuses);
    long countByStatus(Reservation.ReservationStatus status);
}
