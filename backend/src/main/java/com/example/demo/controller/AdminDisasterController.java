package com.example.demo.controller;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.DisasterEventRequest;
import com.example.demo.service.AlertService;
import com.example.demo.service.DisasterApiService;
import com.example.demo.service.DisasterEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/disasters")
public class AdminDisasterController {

    private final DisasterEventService disasterEventService;
    private final DisasterApiService disasterApiService;
    private final AlertService alertService;

    public AdminDisasterController(DisasterEventService disasterEventService,
            DisasterApiService disasterApiService,
            AlertService alertService) {
        this.disasterEventService = disasterEventService;
        this.disasterApiService = disasterApiService;
        this.alertService = alertService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getPendingAlerts() {
        return ResponseEntity.ok(disasterEventService.getPendingEvents());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getAllAlerts() {
        return ResponseEntity.ok(disasterEventService.getAllEvents());
    }

    /**
     * Approve = Verify the disaster details.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> approveAlert(
            @PathVariable Long id, Authentication authentication) {
        DisasterEvent event = disasterEventService.approveEvent(id, authentication.getName());

        return ResponseEntity.ok(ApiResponse.success("Alert verified and marked for broadcast", event));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> rejectAlert(
            @PathVariable Long id, Authentication authentication) {
        DisasterEvent event = disasterEventService.rejectEvent(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Alert rejected", event));
    }

    @PutMapping("/{id}/edit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> editAlert(
            @PathVariable Long id, @RequestBody DisasterEventRequest request) {
        DisasterEvent event = disasterEventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Alert updated successfully", event));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> createAlert(
            @RequestBody DisasterEventRequest request, Authentication authentication) {
        DisasterEvent event = disasterEventService.createEvent(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Disaster event created successfully", event));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteAlert(@PathVariable Long id) {
        disasterEventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted", "Deleted event " + id));
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> syncFromApi() {
        disasterApiService.fetchAndStoreEarthquakes();
        disasterApiService.fetchAndStoreWeatherAlerts();
        return ResponseEntity.ok(ApiResponse.success("Sync completed", "Data synced from USGS + OpenWeather APIs"));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(disasterEventService.getStatistics());
    }
}
