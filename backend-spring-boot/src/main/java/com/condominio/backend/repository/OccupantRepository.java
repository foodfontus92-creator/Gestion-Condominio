package com.condominio.backend.repository;

import com.condominio.backend.entity.Occupant;
import com.condominio.backend.entity.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OccupantRepository extends JpaRepository<Occupant, UUID> {
    List<Occupant> findByApartment(Apartment apartment);
    List<Occupant> findByApartmentId(UUID apartmentId);
}
