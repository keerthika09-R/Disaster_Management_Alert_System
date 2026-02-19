package com.example.demo.controller;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.DisasterType;
import com.example.demo.Entity.SeverityLevel;
import com.example.demo.dto.ApiResponse;
import com.example.demo.service.DisasterEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disasters")
public class DisasterEventController {

    private final DisasterEventService disasterEventService;

    public DisasterEventController(DisasterEventService disasterEventService) {
        this.disasterEventService = disasterEventService;
    }

    /**
     * GET /api/disasters - Public endpoint for verified alerts
     * Supports filtering by type, severity, location, and date range
     */
    @GetMapping
    public ResponseEntity<List<DisasterEvent>> getDisasters(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        DisasterType disasterType = null;
        SeverityLevel severityLevel = null;
        LocalDateTime start = null;
        LocalDateTime end = null;

        try {
            if (type != null && !type.isEmpty()) {
                disasterType = DisasterType.valueOf(type.toUpperCase());
            }
        } catch (IllegalArgumentException ignored) {
        }

        try {
            if (severity != null && !severity.isEmpty()) {
                severityLevel = SeverityLevel.valueOf(severity.toUpperCase());
            }
        } catch (IllegalArgumentException ignored) {
        }

        try {
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception ignored) {
        }

        try {
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception ignored) {
        }

        List<DisasterEvent> events = disasterEventService.getVerifiedEvents(
                disasterType, severityLevel, location, start, end);

        return ResponseEntity.ok(events);
    }

    /**
     * GET /api/disasters/all - Get all verified events (no filters)
     */
    @GetMapping("/all")
    public ResponseEntity<List<DisasterEvent>> getAllVerified() {
        return ResponseEntity.ok(disasterEventService.getAllVerifiedEvents());
    }

    /**
     * GET /api/disasters/{id} - Get single event
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDisasterById(@PathVariable Long id) {
        return disasterEventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/disasters/statistics - Dashboard statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(disasterEventService.getStatistics());
    }
}
