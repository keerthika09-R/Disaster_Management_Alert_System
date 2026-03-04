package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.repository.DisasterRepository;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class DisasterApiService {

    @Autowired
    private DisasterRepository repository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Synchronize disaster events from the USGS Earthquake API.
     */
    public void syncEarthquakes() {
        String url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=10&minmagnitude=4.5";

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode features = root.path("features");

            for (JsonNode feature : features) {
                JsonNode properties = feature.path("properties");

                String location = properties.path("place").asText();
                double magnitude = properties.path("mag").asDouble();
                long timeMillis = properties.path("time").asLong();

                String date = Instant.ofEpochMilli(timeMillis)
                        .atZone(ZoneId.systemDefault())
                        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

                String description = "Magnitude " + magnitude + " earthquake detected.";
                String severity = magnitude >= 6.0 ? "Critical" : "High";

                DisasterEvent event = new DisasterEvent();
                event.setDisasterType("Earthquake");
                event.setLocation(location);
                event.setDescription(date + " | " + description);
                event.setSeverity(severity);
                event.setStatus("PENDING");

                // Check if already exists by location and description to prevent duplicates
                if (repository.findByStatus("PENDING").stream()
                        .noneMatch(e -> e.getLocation().equals(location)
                                && e.getDescription().equals(event.getDescription()))) {
                    repository.save(event);
                }
            }

            System.out.println("Successfully synced earthquakes.");

        } catch (Exception e) {
            System.err.println("Error syncing earthquake data: " + e.getMessage());
        }
    }
}
