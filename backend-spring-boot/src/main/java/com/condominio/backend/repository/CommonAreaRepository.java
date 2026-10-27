package com.condominio.backend.repository;

import com.condominio.backend.entity.CommonArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommonAreaRepository extends JpaRepository<CommonArea, UUID> {
    List<CommonArea> findByIsActive(boolean isActive);
}
