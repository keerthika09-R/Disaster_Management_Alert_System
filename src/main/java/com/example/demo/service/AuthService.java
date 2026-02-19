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
import com.example.demo.security.JwtUtil;

@Service
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserService userService,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {

        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }


    // =====================================================
    // REGISTER USER
    // =====================================================
    public User register(RegisterRequest request) {

    if (userService.existsByEmail(request.getEmail())) {
        throw new RuntimeException("Email already exists");
    }

    String normalizedRole = request.getRole().toUpperCase();

    User user = new User();

    user.setFullName(request.getFullName());   // FIXED

    user.setEmail(request.getEmail());

    user.setPassword(passwordEncoder.encode(request.getPassword()));

    user.setRole(normalizedRole);

    return userService.saveUser(user);
}




    // =====================================================
    // LOGIN USER
    // =====================================================
    public JwtResponse login(LoginRequest request) {

        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Email: " + request.getEmail());


        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }


        // Authenticate user
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail().trim(),
                                request.getPassword()
                        )
                );


        // Fetch user from DB
        User user = userService.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));


        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );


        System.out.println("LOGIN SUCCESSFUL: " + user.getEmail());


        // Return response
        return new JwtResponse(token, user.getRole());
    }
}
