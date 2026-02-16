package com.example.demo.controller;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Get all users (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userService.getAllUsersWithProfiles();
        return ResponseEntity.ok(users);
    }

    // Get user profile by email (Admin only)
    @GetMapping("/profile/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable String email) {
        Map<String, Object> user = userService.getUserWithProfile(email);
        return ResponseEntity.ok(user);
    }

    // Get all locations (Admin only)
    @GetMapping("/locations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getAllLocations() {
        List<String> locations = userService.getAllLocations();
        return ResponseEntity.ok(locations);
    }

    // Get users by location (Admin only)
    @GetMapping("/location/{location}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getUsersByLocation(@PathVariable String location) {
        List<Map<String, Object>> users = userService.getUsersByLocation(location);
        return ResponseEntity.ok(users);
    }
}
