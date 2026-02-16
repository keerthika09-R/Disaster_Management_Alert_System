package com.example.demo.controller;

import com.example.demo.Entity.Alert;
import com.example.demo.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Alert> createAlert(@RequestBody Map<String, String> request, Authentication authentication) {
        String region = request.get("region");
        String message = request.get("message");
        String severity = request.get("severity");
        String createdBy = authentication.getName();

        return ResponseEntity.ok(alertService.createAlert(region, message, severity, createdBy));
    }

    @GetMapping("/region/{region}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Alert>> getAlertsByRegion(@PathVariable String region) {
        return ResponseEntity.ok(alertService.getAlertsByRegion(region));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/my-alerts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Alert>> getMyAlerts(Authentication authentication) {
        return ResponseEntity.ok(alertService.getAlertsForUser(authentication.getName()));
    }
}
