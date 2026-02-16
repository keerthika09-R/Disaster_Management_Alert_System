package com.example.demo.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.repository.UserProfileRepository;
import com.example.demo.security.JwtUtil;

@Service
public class AuthService {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserService userService,
            UserProfileRepository userProfileRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil) {
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-key:ADMIN-KEY-123}")
    private String adminKey;

    @org.springframework.beans.factory.annotation.Value("${app.security.responder-key:RESCUE-KEY-456}")
    private String responderKey;

    // REGISTER
    @org.springframework.transaction.annotation.Transactional
    public User register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            throw new RuntimeException("Role is required");
        }

        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        String normalizedRole = request.getRole().toUpperCase();

        // Validate Secret Keys for Privileged Roles
        if ("ADMIN".equals(normalizedRole)) {
            if (request.getSecretKey() == null || !request.getSecretKey().equals(adminKey)) {
                throw new RuntimeException("Invalid Admin Secret Key. Access Denied.");
            }
        } else if ("RESPONDER".equals(normalizedRole)) {
            if (request.getSecretKey() == null || !request.getSecretKey().equals(responderKey)) {
                throw new RuntimeException("Invalid Responder Secret Key. Access Denied.");
            }
        } else if (!"CITIZEN".equals(normalizedRole)) {
            throw new RuntimeException("Invalid role. Must be ADMIN, RESPONDER, or CITIZEN");
        }

        try {
            User user = new User();
            user.setEmail(request.getEmail().trim());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(normalizedRole);

            User savedUser = userService.saveUser(user);

            // Create and save UserProfile
            UserProfile profile = new UserProfile();
            profile.setUser(savedUser);
            profile.setFullName(request.getFullName() != null ? request.getFullName() : "");
            profile.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
            profile.setRegion(request.getRegion() != null ? request.getRegion() : "");

            userProfileRepository.save(profile);

            return savedUser;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    // LOGIN
    public JwtResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim(),
                        request.getPassword()));

        User user = userService.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return new JwtResponse(token, user.getRole());
    }
}
