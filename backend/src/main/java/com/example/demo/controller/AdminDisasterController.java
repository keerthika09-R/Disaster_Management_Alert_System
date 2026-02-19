package com.example.demo.controller;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.DisasterEventRequest;
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

    public AdminDisasterController(DisasterEventService disasterEventService,
            DisasterApiService disasterApiService) {
        this.disasterEventService = disasterEventService;
        this.disasterApiService = disasterApiService;
    }

    /**
     * GET /api/admin/disasters/pending - Get all pending alerts for admin review
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getPendingAlerts() {
        return ResponseEntity.ok(disasterEventService.getPendingEvents());
    }

    /**
     * GET /api/admin/disasters/all - Get ALL events (admin view)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DisasterEvent>> getAllAlerts() {
        return ResponseEntity.ok(disasterEventService.getAllEvents());
    }

    /**
     * PUT /api/admin/disasters/{id}/approve - Approve a pending alert
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> approveAlert(
            @PathVariable Long id, Authentication authentication) {
        DisasterEvent event = disasterEventService.approveEvent(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Alert approved and published", event));
    }

    /**
     * PUT /api/admin/disasters/{id}/reject - Reject a pending alert
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> rejectAlert(
            @PathVariable Long id, Authentication authentication) {
        DisasterEvent event = disasterEventService.rejectEvent(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Alert rejected", event));
    }

    /**
     * PUT /api/admin/disasters/{id}/edit - Edit alert details before broadcast
     */
    @PutMapping("/{id}/edit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> editAlert(
            @PathVariable Long id, @RequestBody DisasterEventRequest request) {
        DisasterEvent event = disasterEventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Alert updated successfully", event));
    }

    /**
     * POST /api/admin/disasters/create - Manually create a disaster event
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DisasterEvent>> createAlert(
            @RequestBody DisasterEventRequest request, Authentication authentication) {
        DisasterEvent event = disasterEventService.createEvent(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Disaster event created successfully", event));
    }

    /**
     * DELETE /api/admin/disasters/{id} - Delete an event
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteAlert(@PathVariable Long id) {
        disasterEventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted", "Deleted event " + id));
    }

    /**
     * POST /api/admin/disasters/sync - Manually trigger API sync
     */
    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> syncFromApi() {
        disasterApiService.fetchAndStoreEarthquakes();
        return ResponseEntity.ok(ApiResponse.success("Sync completed", "Data synced from external APIs"));
    }

    /**
     * GET /api/admin/disasters/statistics - Get admin statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(disasterEventService.getStatistics());
    }
}
