package com.condominio.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "occupants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Occupant {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    private String documentId;

    private String phone;

    private String email;

    @Column(nullable = false)
    private String occupantType = "owner";

    @Column(nullable = false)
    private boolean isPrimary = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;
}
