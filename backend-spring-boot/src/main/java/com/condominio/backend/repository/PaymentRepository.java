package com.condominio.backend.repository;

import com.condominio.backend.entity.Apartment;
import com.condominio.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByApartment(Apartment apartment);
    List<Payment> findByApartmentId(UUID apartmentId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByStatusAndDueDateBefore(Payment.PaymentStatus status, LocalDateTime date);
}
