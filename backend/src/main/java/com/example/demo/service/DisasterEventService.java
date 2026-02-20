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

    public List<DisasterEvent> getVerifiedEvents(DisasterType type, SeverityLevel severity,
            String location, LocalDateTime startDate, LocalDateTime endDate) {
        return disasterEventRepository.findWithFilters(
                EventStatus.VERIFIED, type, severity, location, startDate, endDate);
    }

    public List<DisasterEvent> getAllVerifiedEvents() {
        return disasterEventRepository.findByStatusOrderByEventTimeDesc(EventStatus.VERIFIED);
    }

    /**
     * Get verified events for a specific country+state (region-based alert)
     */
    public List<DisasterEvent> getVerifiedEventsByRegion(String country, String state) {
        return disasterEventRepository.findByStatusAndCountryAndStateOrderByEventTimeDesc(
                EventStatus.VERIFIED, country, state);
    }

    public Optional<DisasterEvent> getEventById(Long id) {
        return disasterEventRepository.findById(id);
    }

    // ==================== ADMIN APIs ====================

    public List<DisasterEvent> getPendingEvents() {
        return disasterEventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.PENDING);
    }

    public List<DisasterEvent> getAllEvents() {
        return disasterEventRepository.findAllByOrderByCreatedAtDesc();
    }

    public DisasterEvent approveEvent(Long id, String approverEmail) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));
        event.setStatus(EventStatus.VERIFIED);
        event.setApprovedBy(approverEmail);
        event.setApprovedAt(LocalDateTime.now());
        return disasterEventRepository.save(event);
    }

    public DisasterEvent rejectEvent(Long id, String approverEmail) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));
        event.setStatus(EventStatus.REJECTED);
        event.setApprovedBy(approverEmail);
        event.setApprovedAt(LocalDateTime.now());
        return disasterEventRepository.save(event);
    }

    public DisasterEvent updateEvent(Long id, DisasterEventRequest request) {
        DisasterEvent event = disasterEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disaster event not found with id: " + id));

        if (request.getTitle() != null)
            event.setTitle(request.getTitle());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (request.getDisasterType() != null)
            event.setDisasterType(DisasterType.valueOf(request.getDisasterType()));
        if (request.getSeverity() != null)
            event.setSeverity(SeverityLevel.valueOf(request.getSeverity()));
        if (request.getLatitude() != null)
            event.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            event.setLongitude(request.getLongitude());
        if (request.getLocationName() != null)
            event.setLocationName(request.getLocationName());
        if (request.getCountry() != null)
            event.setCountry(request.getCountry());
        if (request.getState() != null)
            event.setState(request.getState());
        if (request.getCity() != null)
            event.setCity(request.getCity());

        return disasterEventRepository.save(event);
    }

    public DisasterEvent createEvent(DisasterEventRequest request, String createdBy) {
        DisasterEvent event = new DisasterEvent();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDisasterType(DisasterType.valueOf(request.getDisasterType()));
        event.setSeverity(SeverityLevel.valueOf(request.getSeverity()));
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setLocationName(request.getLocationName());
        event.setCountry(request.getCountry());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setSource(request.getSource() != null ? request.getSource() : "MANUAL");
        event.setEventTime(LocalDateTime.now());
        event.setCreatedBy(createdBy);
        event.setStatus(EventStatus.PENDING);
        return disasterEventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        disasterEventRepository.deleteById(id);
    }

    // ==================== STATISTICS ====================

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

        Map<String, Long> byType = new HashMap<>();
        try {
            List<Object[]> typeCounts = disasterEventRepository.countByDisasterType();
            for (Object[] row : typeCounts) {
                byType.put(row[0].toString(), (Long) row[1]);
            }
        } catch (Exception e) {
            /* ignore */ }
        stats.put("byType", byType);

        Map<String, Long> bySeverity = new HashMap<>();
        try {
            List<Object[]> severityCounts = disasterEventRepository.countBySeverity();
            for (Object[] row : severityCounts) {
                bySeverity.put(row[0].toString(), (Long) row[1]);
            }
        } catch (Exception e) {
            /* ignore */ }
        stats.put("bySeverity", bySeverity);

        return stats;
    }
}
