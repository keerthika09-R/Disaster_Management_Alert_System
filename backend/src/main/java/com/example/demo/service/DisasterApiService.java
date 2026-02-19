package com.example.demo.service;

import com.example.demo.Entity.*;
import com.example.demo.repository.DisasterEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class DisasterApiService {

    private final DisasterEventRepository disasterEventRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // USGS Earthquake API - free, no key needed
    private static final String USGS_API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

    public DisasterApiService(DisasterEventRepository disasterEventRepository) {
        this.disasterEventRepository = disasterEventRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Scheduled job to fetch earthquake data every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void fetchAndStoreEarthquakes() {
        try {
            List<DisasterEvent> events = fetchEarthquakes();
            for (DisasterEvent event : events) {
                // Check if duplicate exists
                List<DisasterEvent> existing = disasterEventRepository
                        .findBySourceAndTitleAndEventTime(event.getSource(), event.getTitle(), event.getEventTime());
                if (existing.isEmpty()) {
                    disasterEventRepository.save(event);
                }
            }
            System.out.println("[DisasterApiService] Fetched " + events.size() + " earthquake events");
        } catch (Exception e) {
            System.err.println("[DisasterApiService] Error fetching earthquakes: " + e.getMessage());
        }
    }

    /**
     * Fetch earthquakes from USGS API
     */
    public List<DisasterEvent> fetchEarthquakes() {
        List<DisasterEvent> events = new ArrayList<>();

        try {
            String response = restTemplate.getForObject(USGS_API_URL, String.class);
            if (response == null)
                return events;

            JsonNode root = objectMapper.readTree(response);
            JsonNode features = root.get("features");

            if (features != null && features.isArray()) {
                for (JsonNode feature : features) {
                    try {
                        DisasterEvent event = parseEarthquakeFeature(feature);
                        if (event != null) {
                            events.add(event);
                        }
                    } catch (Exception e) {
                        System.err.println("[DisasterApiService] Error parsing feature: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[DisasterApiService] Error fetching from USGS API: " + e.getMessage());
        }

        return events;
    }

    /**
     * Parse a single GeoJSON earthquake feature into a DisasterEvent
     */
    private DisasterEvent parseEarthquakeFeature(JsonNode feature) {
        JsonNode properties = feature.get("properties");
        JsonNode geometry = feature.get("geometry");

        if (properties == null || geometry == null)
            return null;

        String title = properties.has("title") ? properties.get("title").asText() : "Unknown Earthquake";
        String place = properties.has("place") ? properties.get("place").asText() : "Unknown Location";
        double magnitude = properties.has("mag") ? properties.get("mag").asDouble() : 0;
        long timeMs = properties.has("time") ? properties.get("time").asLong() : System.currentTimeMillis();

        JsonNode coordinates = geometry.get("coordinates");
        double longitude = coordinates.get(0).asDouble();
        double latitude = coordinates.get(1).asDouble();

        // Determine severity based on magnitude
        SeverityLevel severity = categorizeSeverity(magnitude);

        // Build description
        String description = String.format(
                "Earthquake of magnitude %.1f detected. Location: %s. Depth: %.1f km.",
                magnitude,
                place,
                coordinates.size() > 2 ? coordinates.get(2).asDouble() : 0);

        DisasterEvent event = new DisasterEvent();
        event.setTitle(title);
        event.setDescription(description);
        event.setDisasterType(DisasterType.EARTHQUAKE);
        event.setSeverity(severity);
        event.setLatitude(latitude);
        event.setLongitude(longitude);
        event.setLocationName(place);
        event.setSource("USGS");
        event.setEventTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(timeMs), ZoneId.systemDefault()));
        event.setStatus(EventStatus.PENDING);
        event.setCreatedBy("SYSTEM");

        return event;
    }

    /**
     * Categorize earthquake severity based on magnitude
     */
    private SeverityLevel categorizeSeverity(double magnitude) {
        if (magnitude >= 7.0)
            return SeverityLevel.CRITICAL;
        if (magnitude >= 5.0)
            return SeverityLevel.HIGH;
        if (magnitude >= 4.0)
            return SeverityLevel.MEDIUM;
        return SeverityLevel.LOW;
    }

    /**
     * Auto-categorize disaster type based on keywords in description
     */
    public static DisasterType categorizeByDescription(String description) {
        if (description == null)
            return DisasterType.OTHER;
        String lower = description.toLowerCase();

        if (lower.contains("earthquake") || lower.contains("seismic") || lower.contains("quake")) {
            return DisasterType.EARTHQUAKE;
        }
        if (lower.contains("flood") || lower.contains("inundation") || lower.contains("water level")) {
            return DisasterType.FLOOD;
        }
        if (lower.contains("cyclone") || lower.contains("hurricane") || lower.contains("typhoon")) {
            return DisasterType.CYCLONE;
        }
        if (lower.contains("fire") || lower.contains("wildfire") || lower.contains("blaze")) {
            return DisasterType.FIRE;
        }
        if (lower.contains("storm") || lower.contains("thunder") || lower.contains("tornado")) {
            return DisasterType.STORM;
        }
        if (lower.contains("tsunami") || lower.contains("tidal wave")) {
            return DisasterType.TSUNAMI;
        }
        if (lower.contains("landslide") || lower.contains("mudslide")) {
            return DisasterType.LANDSLIDE;
        }
        if (lower.contains("drought") || lower.contains("dry spell")) {
            return DisasterType.DROUGHT;
        }

        return DisasterType.OTHER;
    }
}
