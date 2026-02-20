package com.example.demo.service;

import com.example.demo.Entity.Alert;
import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
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

    /**
     * Create a region-based alert from a verified disaster event.
     * This alert will only be visible to users in the same country+state.
     */
    public Alert createAlertFromDisaster(DisasterEvent disaster, String createdBy) {
        Alert alert = new Alert();
        alert.setDisasterId(disaster.getId());
        alert.setMessage(disaster.getTitle() + " - " + disaster.getDescription());
        alert.setSeverity(disaster.getSeverity().name());
        alert.setDisasterType(disaster.getDisasterType().name());
        alert.setCountry(disaster.getCountry());
        alert.setState(disaster.getState());
        alert.setCity(disaster.getCity());
        alert.setRegion(disaster.getLocationName());
        alert.setCreatedBy(createdBy);
        return alertRepository.save(alert);
    }

    /**
     * Legacy: create alert with just region string
     */
    public Alert createAlert(String region, String message, String severity, String createdBy) {
        Alert alert = new Alert(region, message, severity, createdBy);
        return alertRepository.save(alert);
    }

    /**
     * Get alerts for a user's region (country+state match)
     */
    public List<Alert> getAlertsForUser(String email) {
        User user = userService.findByEmail(email).orElse(null);
        if (user == null)
            return getAllAlerts();

        return userProfileRepository.findByUser(user)
                .map(profile -> {
                    String country = profile.getCountry();
                    String state = profile.getState();
                    if (country != null && !country.isEmpty() && state != null && !state.isEmpty()) {
                        return alertRepository.findByCountryAndStateOrderByCreatedAtDesc(country, state);
                    }
                    // Fallback to old region-based lookup
                    String region = profile.getRegion();
                    if (region != null && !region.isEmpty()) {
                        return alertRepository.findByRegion(region);
                    }
                    return getAllAlerts();
                })
                .orElse(getAllAlerts());
    }

    public List<Alert> getAlertsByRegion(String region) {
        return alertRepository.findByRegion(region);
    }

    public List<Alert> getAlertsByCountryAndState(String country, String state) {
        return alertRepository.findByCountryAndStateOrderByCreatedAtDesc(country, state);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }
}
