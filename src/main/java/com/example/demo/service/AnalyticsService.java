package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.dto.AnalyticsDTO;
import com.example.demo.repository.DisasterRepository;
import com.example.demo.repository.RescueTaskRepository;
import com.example.demo.repository.AlertAcknowledgmentRepository;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private RescueTaskRepository rescueTaskRepository;

    @Autowired
    private AlertAcknowledgmentRepository alertAcknowledgmentRepository;

    public AnalyticsDTO getDashboardAnalytics() {
        AnalyticsDTO dto = new AnalyticsDTO();
        
        List<DisasterEvent> allDisasters = disasterRepository.findAll();
        
        // Count Floods Handled
        long floods = allDisasters.stream()
            .filter(d -> d.getDisasterType() != null && d.getDisasterType().equalsIgnoreCase("Flood"))
            .count();
        dto.setTotalFloods(floods);

        // Count Fires Suppressed
        long fires = allDisasters.stream()
            .filter(d -> d.getDisasterType() != null && d.getDisasterType().equalsIgnoreCase("Fire"))
            .count();
        dto.setTotalFires(fires);

        // Compute average response time in minutes
        List<DisasterEvent> resolvedEvents = allDisasters.stream()
            .filter(d -> "RESOLVED".equalsIgnoreCase(d.getStatus()) && d.getResolvedAt() != null && d.getCreatedAt() != null)
            .collect(Collectors.toList());

        if (!resolvedEvents.isEmpty()) {
            long totalMinutes = 0;
            for (DisasterEvent event : resolvedEvents) {
                totalMinutes += Duration.between(event.getCreatedAt(), event.getResolvedAt()).toMinutes();
            }
            dto.setAvgResponseTimeMinutes(totalMinutes / resolvedEvents.size());
        } else {
            dto.setAvgResponseTimeMinutes(0); // fallback if no completed data
        }

        // Responders Deployed (total count of assigned rescue tasks)
        long respondersDeployed = rescueTaskRepository.count();
        dto.setTotalRespondersDeployed(respondersDeployed);

        // Map layout: Location -> Count
        Map<String, Long> byRegion = allDisasters.stream()
            .filter(d -> d.getLocation() != null && !d.getLocation().isEmpty())
            .collect(Collectors.groupingBy(DisasterEvent::getLocation, Collectors.counting()));
        dto.setAlertsByRegion(byRegion);

        // Notification insights: Alerts Broadcasted vs Acknowledged
        long broadcasted = allDisasters.stream()
            .filter(d -> !"PENDING".equalsIgnoreCase(d.getStatus()))
            .count();
        dto.setAlertsBroadcasted(broadcasted);

        long acknowledged = alertAcknowledgmentRepository.count();
        dto.setAlertsAcknowledged(acknowledged);

        return dto;
    }
}
