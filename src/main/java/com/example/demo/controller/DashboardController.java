package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Entity.User;
import com.example.demo.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final UserService userService;

    public DashboardController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminDashboard(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "ADMIN");
        response.put("access", "Full system control - manage users, assign tasks, configure alerts");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/responder/dashboard")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<Map<String, String>> responderDashboard(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Responder Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "RESPONDER");
        response.put("access", "View assigned rescue operations, update status, communicate with admin");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citizen/dashboard")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> citizenDashboard(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Citizen Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "CITIZEN");
        response.put("access", "View disaster alerts, request emergency help, share location");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAllUsers() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "All users list - Admin only access");
        response.put("action", "View and manage all system users");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/assign-task")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> assignRescueTask(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rescue task assigned successfully");
        response.put("assignedTo", request.get("responderId"));
        response.put("task", request.get("taskDescription"));
        response.put("assignedBy", "Admin");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/responder/update-status")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<Map<String, String>> updateRescueStatus(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rescue status updated successfully");
        response.put("taskId", request.get("taskId"));
        response.put("status", request.get("status"));
        response.put("updatedBy", "Responder");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/citizen/request-help")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> requestEmergencyHelp(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Emergency help request received");
        response.put("location", request.get("location"));
        response.put("emergencyType", request.get("emergencyType"));
        response.put("status", "Request forwarded to responders");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citizen/alerts")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> getDisasterAlerts() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Disaster alerts for your region");
        response.put("alerts", "Flood warning: High water levels in your area");
        response.put("action", "Move to higher ground immediately");
        return ResponseEntity.ok(response);
    }
}
