package com.example.demo.service;

import com.example.demo.Entity.Alert;
import com.example.demo.Entity.User;
import com.example.demo.repository.AlertRepository;
import com.example.demo.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserService userService;
    private final UserProfileRepository userProfileRepository;

    public AlertService(AlertRepository alertRepository, UserService userService,
            UserProfileRepository userProfileRepository) {
        this.alertRepository = alertRepository;
        this.userService = userService;
        this.userProfileRepository = userProfileRepository;
    }

    public Alert createAlert(String region, String message, String severity, String createdBy) {
        Alert alert = new Alert(region, message, severity, createdBy);
        return alertRepository.save(alert);
    }

    public List<Alert> getAlertsByRegion(String region) {
        return alertRepository.findByRegion(region);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public List<Alert> getAlertsForUser(String email) {
        // 1. Find User by Email
        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            return getAllAlerts(); // Fallback
        }

        // 2. Find User Profile to get Region
        return userProfileRepository.findByUser(user)
                .map(profile -> {
                    String region = profile.getRegion();
                    if (region == null || region.isEmpty()) {
                        return getAllAlerts();
                    }
                    return alertRepository.findByRegion(region);
                })
                .orElse(getAllAlerts()); // If no profile, show filters
    }
}
