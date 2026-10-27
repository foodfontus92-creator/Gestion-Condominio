package com.condominio.backend.service;

import com.condominio.backend.entity.*;
import com.condominio.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SeedDataLoader implements CommandLineRunner {

    private final BuildingRepository buildingRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final CommonAreaRepository commonAreaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (buildingRepository.count() > 0) return;

        String[] codes = {"A", "B", "C", "D", "E"};
        for (String code : codes) {
            Building b = Building.builder().code(code).status("active").build();
            b = buildingRepository.save(b);
            for (int n = 101; n <= 109; n++) {
                Apartment apt = Apartment.builder()
                        .building(b)
                        .number(n)
                        .status("active")
                        .monthlyFee(150.0)
                        .build();
                apartmentRepository.save(apt);
            }
        }

        // Users
        User admin = User.builder()
                .email("admin@condominio.com")
                .hashedPassword(passwordEncoder.encode("admin123"))
                .fullName("Administrador Condominio")
                .role(User.Role.ADMIN)
                .isActive(true)
                .build();
        User portero = User.builder()
                .email("portero@condominio.com")
                .hashedPassword(passwordEncoder.encode("portero123"))
                .fullName("Juan Portero")
                .role(User.Role.PORTERO)
                .isActive(true)
                .build();
        User residente = User.builder()
                .email("residente@condominio.com")
                .hashedPassword(passwordEncoder.encode("residente123"))
                .fullName("María Residente")
                .role(User.Role.RESIDENTE)
                .isActive(true)
                .build();
        userRepository.saveAll(List.of(admin, portero, residente));

        // Common areas
        commonAreaRepository.save(CommonArea.builder()
                .name("Quincho").description("Área de parrilla").capacity(20)
                .location("Planta baja").isActive(true).build());
        commonAreaRepository.save(CommonArea.builder()
                .name("Gimnasio").description("Equipos cardio").capacity(10)
                .location("Planta baja").isActive(true).build());
        commonAreaRepository.save(CommonArea.builder()
                .name("Salón de Eventos").description("Salón con cocina").capacity(50)
                .location("Segundo piso").isActive(true).build());
    }
}
