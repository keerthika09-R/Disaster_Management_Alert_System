package com.example.demo.service;

import com.example.demo.Entity.*;
import com.example.demo.dto.DisasterEventRequest;
import com.example.demo.repository.DisasterEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DisasterEventService {

    private final DisasterEventRepository disasterEventRepository;

    public DisasterEventService(DisasterEventRepository disasterEventRepository) {
        this.disasterEventRepository = disasterEventRepository;
    }

    // ==================== PUBLIC APIs ====================

    /**
     * Get all VERIFIED (public) events with optional filters
     */
    public List<DisasterEvent> getVerifiedEvents(DisasterType type, SeverityLevel severity,
            String location, LocalDateTime startDate,
            LocalDateTime endDate) {
        return disasterEventRepository.findWithFilters(
                EventStatus.VERIFIED, type, severity, location, startDate, endDate);
    }

    /**
     * Get all verified events (no filters)
     */
    public List<DisasterEvent> getAllVerifiedEvents() {
        return disasterEventRepository.findByStatusOrderByEventTimeDesc(EventStatus.VERIFIED);
    }

    /**
     * Get a single event by ID
     */
    public Optional<DisasterEvent> getEventById(Long id) {
        return disasterEventRepository.findById(id);
    }

    // ==================== ADMIN APIs ====================

    /**
     * Get all PENDING events for admin review
     */
    public List<DisasterEvent> getPendingEvents() {
        return disasterEventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.PENDING);
    }

    /**
     * Get ALL events regardless of status (admin view)
     */
    public List<DisasterEvent> getAllEvents() {
        return disasterEventRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Approve (verify) an event
     */
    public DisasterEvent approveEvent(Long id, String approverEmail) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));

        event.setStatus(EventStatus.VERIFIED);
        event.setApprovedBy(approverEmail);
        event.setApprovedAt(LocalDateTime.now());

        return disasterEventRepository.save(event);
    }

    /**
     * Reject an event
     */
    public DisasterEvent rejectEvent(Long id, String approverEmail) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));

        event.setStatus(EventStatus.REJECTED);
        event.setApprovedBy(approverEmail);
        event.setApprovedAt(LocalDateTime.now());

        return disasterEventRepository.save(event);
    }

    /**
     * Edit alert details before broadcast
     */
    public DisasterEvent updateEvent(Long id, DisasterEventRequest request) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));

        if (request.getTitle() != null)
            event.setTitle(request.getTitle());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (request.getDisasterType() != null) {
            event.setDisasterType(DisasterType.valueOf(request.getDisasterType()));
        }
        if (request.getSeverity() != null) {
            event.setSeverity(SeverityLevel.valueOf(request.getSeverity()));
        }
        if (request.getLatitude() != null)
            event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            event.setLongitude(request.getLongitude());
        if (request.getLocationName() != null)
            event.setLocationName(request.getLocationName());

        return disasterEventRepository.save(event);
    }

    /**
     * Admin can manually create a disaster event
     */
    public DisasterEvent createEvent(DisasterEventRequest request, String createdBy) {
        DisasterEvent event = new DisasterEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDisasterType(DisasterType.valueOf(request.getDisasterType()));
        event.setSeverity(SeverityLevel.valueOf(request.getSeverity()));
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setLocationName(request.getLocationName());
        event.setSource(request.getSource() != null ? request.getSource() : "MANUAL");
        event.setEventTime(LocalDateTime.now());
        event.setCreatedBy(createdBy);
        event.setStatus(EventStatus.PENDING);

        return disasterEventRepository.save(event);
    }

    /**
     * Delete an event
     */
    public void deleteEvent(Long id) {
        disasterEventRepository.deleteById(id);
    }

    // ==================== STATISTICS ====================

    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long total = disasterEventRepository.count();
        long pending = disasterEventRepository.countByStatus(EventStatus.PENDING);
        long verified = disasterEventRepository.countByStatus(EventStatus.VERIFIED);
        long rejected = disasterEventRepository.countByStatus(EventStatus.REJECTED);

        stats.put("totalEvents", total);
        stats.put("pendingEvents", pending);
        stats.put("verifiedEvents", verified);
        stats.put("rejectedEvents", rejected);

        // Count by type
        Map<String, Long> byType = new HashMap<>();
        try {
            List<Object[]> typeCounts = disasterEventRepository.countByDisasterType();
            for (Object[] row : typeCounts) {
                byType.put(row[0].toString(), (Long) row[1]);
            }
        } catch (Exception e) {
            // ignore if no data
        }
        stats.put("byType", byType);

        // Count by severity
        Map<String, Long> bySeverity = new HashMap<>();
        try {
            List<Object[]> severityCounts = disasterEventRepository.countBySeverity();
            for (Object[] row : severityCounts) {
                bySeverity.put(row[0].toString(), (Long) row[1]);
            }
        } catch (Exception e) {
            // ignore if no data
        }
        stats.put("bySeverity", bySeverity);

        return stats;
    }
}
