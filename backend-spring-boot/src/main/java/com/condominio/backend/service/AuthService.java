package com.condominio.backend.service;

import com.condominio.backend.dto.AuthRequest;
import com.condominio.backend.dto.AuthResponse;
import com.condominio.backend.dto.UserDTO;
import com.condominio.backend.entity.User;
import com.condominio.backend.repository.UserRepository;
import com.condominio.backend.security.JwtUtil;
import com.condominio.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        UserDetails userDetails = userRepository.findByEmail(request.getEmail())
                .map(UserDetailsImpl::new)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String jwt = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return new AuthResponse(jwt, mapToDTO(user));
    }

    public AuthResponse register(AuthRequest request, String fullName, String role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .fullName(fullName)
                .role(User.Role.valueOf(role))
                .isActive(true)
                .build();
        userRepository.save(user);
        String jwt = jwtUtil.generateToken(new UserDetailsImpl(user));
        return new AuthResponse(jwt, mapToDTO(user));
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setApartmentId(user.getApartment() != null ? user.getApartment().getId() : null);
        return dto;
    }
}
