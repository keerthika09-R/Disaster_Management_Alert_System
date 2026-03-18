package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Entity.User;
import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.RescueTask;
import com.example.demo.repository.DisasterRepository;
import com.example.demo.repository.RescueTaskRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;

import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final UserService userService;
    private final DisasterRepository disasterRepository;
    private final RescueTaskRepository rescueTaskRepository;
    private final UserRepository userRepository;

    public DashboardController(
            UserService userService,
            DisasterRepository disasterRepository,
            RescueTaskRepository rescueTaskRepository,
            UserRepository userRepository) {
        this.userService = userService;
        this.disasterRepository = disasterRepository;
        this.rescueTaskRepository = rescueTaskRepository;
        this.userRepository = userRepository;
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

    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminAnalytics() {
        List<DisasterEvent> disasters = disasterRepository.findAll();
        List<RescueTask> tasks = rescueTaskRepository.findAll();

        Map<String, Long> disastersByType = groupAndSort(
                disasters.stream().map(DisasterEvent::getDisasterType).toList(),
                "Unknown");

        Map<String, Long> disastersByLocation = groupAndSort(
                disasters.stream().map(this::resolveLocationLabel).toList(),
                "Unknown");

        Map<String, Long> taskStatusBreakdown = groupAndSort(
                tasks.stream().map(RescueTask::getStatus).toList(),
                "UNASSIGNED");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalDisasters", disasters.size());
        response.put("activeAlerts", disasters.stream().filter(disaster -> "VERIFIED".equalsIgnoreCase(disaster.getStatus())).count());
        response.put("resolvedDisasters", disasters.stream().filter(disaster -> "RESOLVED".equalsIgnoreCase(disaster.getStatus())).count());
        response.put("totalTasks", tasks.size());
        response.put("completedTasks", tasks.stream().filter(task -> "COMPLETED".equalsIgnoreCase(task.getStatus())).count());
        response.put("inProgressTasks", tasks.stream().filter(task -> "IN_PROGRESS".equalsIgnoreCase(task.getStatus())).count());
        response.put("respondersAvailable", userRepository.countByRole("RESPONDER"));
        response.put("disastersByType", disastersByType);
        response.put("disastersByLocation", disastersByLocation);
        response.put("taskStatusBreakdown", taskStatusBreakdown);
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

    private Map<String, Long> groupAndSort(List<String> values, String fallback) {
        return values.stream()
                .map(value -> normalize(value, fallback))
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry.comparingByKey()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (left, right) -> left,
                        LinkedHashMap::new));
    }

    private String resolveLocationLabel(DisasterEvent disaster) {
        if (disaster == null) {
            return "Unknown";
        }
        return normalize(
                firstNonBlank(disaster.getCity(), disaster.getState(), disaster.getCountry(), disaster.getLocation()),
                "Unknown");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    private String normalize(String value, String fallback) {
        if (Objects.isNull(value) || value.trim().isEmpty()) {
            return fallback;
        }
        return value.trim();
    }
}
