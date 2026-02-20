package com.example.demo.service;

import com.example.demo.Entity.*;
import com.example.demo.repository.DisasterEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DisasterApiService {

    private final DisasterEventRepository disasterEventRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // USGS Earthquake API - free, no key needed
    private static final String USGS_API_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

    // OpenWeather Reverse Geocoding API (free tier, same API key)
    private static final String REVERSE_GEO_URL = "https://api.openweathermap.org/geo/1.0/reverse?lat=%.4f&lon=%.4f&limit=1&appid=%s";

    // OpenWeather One Call API 3.0 - Severe Weather Alerts
    @Value("${openweather.api.key:}")
    private String openWeatherApiKey;

    // Monitor these cities for weather alerts (lat,lon pairs)
    private static final double[][] MONITOR_LOCATIONS = {
            { 28.6139, 77.2090 }, // Delhi, India
            { 19.0760, 72.8777 }, // Mumbai, India
            { 13.0827, 80.2707 }, // Chennai, India
            { 22.5726, 88.3639 }, // Kolkata, India
            { 12.9716, 77.5946 }, // Bangalore, India
            { 40.7128, -74.0060 }, // New York, USA
            { 34.0522, -118.2437 }, // Los Angeles, USA
            { 51.5074, -0.1278 }, // London, UK
            { 35.6762, 139.6503 }, // Tokyo, Japan
            { -33.8688, 151.2093 } // Sydney, Australia
    };

    private static final String[][] MONITOR_LOCATION_NAMES = {
            { "India", "Delhi", "New Delhi" },
            { "India", "Maharashtra", "Mumbai" },
            { "India", "Tamil Nadu", "Chennai" },
            { "India", "West Bengal", "Kolkata" },
            { "India", "Karnataka", "Bangalore" },
            { "United States", "New York", "New York City" },
            { "United States", "California", "Los Angeles" },
            { "United Kingdom", "England", "London" },
            { "Japan", "Tokyo", "Tokyo" },
            { "Australia", "New South Wales", "Sydney" }
    };

    // ============ Country code → Full name standardization ============
    private static final Map<String, String> COUNTRY_CODE_MAP = new HashMap<>();
    static {
        COUNTRY_CODE_MAP.put("US", "United States");
        COUNTRY_CODE_MAP.put("IN", "India");
        COUNTRY_CODE_MAP.put("GB", "United Kingdom");
        COUNTRY_CODE_MAP.put("UK", "United Kingdom");
        COUNTRY_CODE_MAP.put("JP", "Japan");
        COUNTRY_CODE_MAP.put("AU", "Australia");
        COUNTRY_CODE_MAP.put("CA", "Canada");
        COUNTRY_CODE_MAP.put("DE", "Germany");
        COUNTRY_CODE_MAP.put("FR", "France");
        COUNTRY_CODE_MAP.put("CN", "China");
        COUNTRY_CODE_MAP.put("BR", "Brazil");
        COUNTRY_CODE_MAP.put("RU", "Russia");
        COUNTRY_CODE_MAP.put("MX", "Mexico");
        COUNTRY_CODE_MAP.put("ID", "Indonesia");
        COUNTRY_CODE_MAP.put("PH", "Philippines");
        COUNTRY_CODE_MAP.put("NZ", "New Zealand");
        COUNTRY_CODE_MAP.put("CL", "Chile");
        COUNTRY_CODE_MAP.put("PE", "Peru");
        COUNTRY_CODE_MAP.put("CO", "Colombia");
        COUNTRY_CODE_MAP.put("AR", "Argentina");
        COUNTRY_CODE_MAP.put("TR", "Turkey");
        COUNTRY_CODE_MAP.put("IR", "Iran");
        COUNTRY_CODE_MAP.put("AF", "Afghanistan");
        COUNTRY_CODE_MAP.put("PK", "Pakistan");
        COUNTRY_CODE_MAP.put("BD", "Bangladesh");
        COUNTRY_CODE_MAP.put("MM", "Myanmar");
        COUNTRY_CODE_MAP.put("TH", "Thailand");
        COUNTRY_CODE_MAP.put("VN", "Vietnam");
        COUNTRY_CODE_MAP.put("IT", "Italy");
        COUNTRY_CODE_MAP.put("ES", "Spain");
        COUNTRY_CODE_MAP.put("PT", "Portugal");
        COUNTRY_CODE_MAP.put("GR", "Greece");
        COUNTRY_CODE_MAP.put("EC", "Ecuador");
        COUNTRY_CODE_MAP.put("CR", "Costa Rica");
        COUNTRY_CODE_MAP.put("GT", "Guatemala");
        COUNTRY_CODE_MAP.put("PA", "Panama");
        COUNTRY_CODE_MAP.put("HT", "Haiti");
        COUNTRY_CODE_MAP.put("TW", "Taiwan");
        COUNTRY_CODE_MAP.put("PG", "Papua New Guinea");
        COUNTRY_CODE_MAP.put("FJ", "Fiji");
        COUNTRY_CODE_MAP.put("TO", "Tonga");
        COUNTRY_CODE_MAP.put("VU", "Vanuatu");
        COUNTRY_CODE_MAP.put("SB", "Solomon Islands");
        COUNTRY_CODE_MAP.put("WS", "Samoa");
        COUNTRY_CODE_MAP.put("NP", "Nepal");
        COUNTRY_CODE_MAP.put("KE", "Kenya");
        COUNTRY_CODE_MAP.put("ZA", "South Africa");
        COUNTRY_CODE_MAP.put("NG", "Nigeria");
        COUNTRY_CODE_MAP.put("EG", "Egypt");
        COUNTRY_CODE_MAP.put("SA", "Saudi Arabia");
        COUNTRY_CODE_MAP.put("AE", "United Arab Emirates");
        COUNTRY_CODE_MAP.put("PR", "United States"); // Puerto Rico → US
    }

    // US state abbreviation → full name
    private static final Map<String, String> US_STATE_MAP = new HashMap<>();
    static {
        US_STATE_MAP.put("AL", "Alabama");
        US_STATE_MAP.put("AK", "Alaska");
        US_STATE_MAP.put("AZ", "Arizona");
        US_STATE_MAP.put("AR", "Arkansas");
        US_STATE_MAP.put("CA", "California");
        US_STATE_MAP.put("CO", "Colorado");
        US_STATE_MAP.put("CT", "Connecticut");
        US_STATE_MAP.put("DE", "Delaware");
        US_STATE_MAP.put("FL", "Florida");
        US_STATE_MAP.put("GA", "Georgia");
        US_STATE_MAP.put("HI", "Hawaii");
        US_STATE_MAP.put("ID", "Idaho");
        US_STATE_MAP.put("IL", "Illinois");
        US_STATE_MAP.put("IN", "Indiana");
        US_STATE_MAP.put("IA", "Iowa");
        US_STATE_MAP.put("KS", "Kansas");
        US_STATE_MAP.put("KY", "Kentucky");
        US_STATE_MAP.put("LA", "Louisiana");
        US_STATE_MAP.put("ME", "Maine");
        US_STATE_MAP.put("MD", "Maryland");
        US_STATE_MAP.put("MA", "Massachusetts");
        US_STATE_MAP.put("MI", "Michigan");
        US_STATE_MAP.put("MN", "Minnesota");
        US_STATE_MAP.put("MS", "Mississippi");
        US_STATE_MAP.put("MO", "Missouri");
        US_STATE_MAP.put("MT", "Montana");
        US_STATE_MAP.put("NE", "Nebraska");
        US_STATE_MAP.put("NV", "Nevada");
        US_STATE_MAP.put("NH", "New Hampshire");
        US_STATE_MAP.put("NJ", "New Jersey");
        US_STATE_MAP.put("NM", "New Mexico");
        US_STATE_MAP.put("NY", "New York");
        US_STATE_MAP.put("NC", "North Carolina");
        US_STATE_MAP.put("ND", "North Dakota");
        US_STATE_MAP.put("OH", "Ohio");
        US_STATE_MAP.put("OK", "Oklahoma");
        US_STATE_MAP.put("OR", "Oregon");
        US_STATE_MAP.put("PA", "Pennsylvania");
        US_STATE_MAP.put("RI", "Rhode Island");
        US_STATE_MAP.put("SC", "South Carolina");
        US_STATE_MAP.put("SD", "South Dakota");
        US_STATE_MAP.put("TN", "Tennessee");
        US_STATE_MAP.put("TX", "Texas");
        US_STATE_MAP.put("UT", "Utah");
        US_STATE_MAP.put("VT", "Vermont");
        US_STATE_MAP.put("VA", "Virginia");
        US_STATE_MAP.put("WA", "Washington");
        US_STATE_MAP.put("WV", "West Virginia");
        US_STATE_MAP.put("WI", "Wisconsin");
        US_STATE_MAP.put("WY", "Wyoming");
        US_STATE_MAP.put("DC", "Washington");
    }

    public DisasterApiService(DisasterEventRepository disasterEventRepository) {
        this.disasterEventRepository = disasterEventRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Scheduled job: fetch from USGS every 5 minutes
     */
    @Scheduled(fixedRate = 300000)
    public void fetchAndStoreEarthquakes() {
        try {
            List<DisasterEvent> events = fetchEarthquakes();
            int saved = 0;
            for (DisasterEvent event : events) {
                // Skip events with no country/state (reverse geocoding failed)
                if (event.getCountry() == null || event.getCountry().isEmpty()
                        || "Unknown".equals(event.getCountry())) {
                    System.out.println("[DisasterApiService] Skipping event with unknown location: "
                            + event.getTitle());
                    continue;
                }
                List<DisasterEvent> existing = disasterEventRepository
                        .findBySourceAndTitleAndEventTime(event.getSource(), event.getTitle(), event.getEventTime());
                if (existing.isEmpty()) {
                    disasterEventRepository.save(event);
                    saved++;
                }
            }
            System.out.println("[DisasterApiService] USGS: fetched " + events.size() + ", saved " + saved + " new");
        } catch (Exception e) {
            System.err.println("[DisasterApiService] Error fetching USGS: " + e.getMessage());
        }
    }

    /**
     * Scheduled job: fetch from OpenWeather every 5 minutes (if API key is set)
     */
    @Scheduled(fixedRate = 300000, initialDelay = 30000)
    public void fetchAndStoreWeatherAlerts() {
        if (openWeatherApiKey == null || openWeatherApiKey.isEmpty()) {
            System.out.println("[DisasterApiService] OpenWeather: API key not configured, skipping");
            return;
        }

        int totalSaved = 0;
        for (int i = 0; i < MONITOR_LOCATIONS.length; i++) {
            try {
                List<DisasterEvent> events = fetchWeatherAlerts(
                        MONITOR_LOCATIONS[i][0], MONITOR_LOCATIONS[i][1],
                        MONITOR_LOCATION_NAMES[i][0], MONITOR_LOCATION_NAMES[i][1], MONITOR_LOCATION_NAMES[i][2]);
                for (DisasterEvent event : events) {
                    List<DisasterEvent> existing = disasterEventRepository
                            .findBySourceAndTitleAndEventTime(event.getSource(), event.getTitle(),
                                    event.getEventTime());
                    if (existing.isEmpty()) {
                        disasterEventRepository.save(event);
                        totalSaved++;
                    }
                }
            } catch (Exception e) {
                System.err.println("[DisasterApiService] OpenWeather error for " +
                        MONITOR_LOCATION_NAMES[i][2] + ": " + e.getMessage());
            }
        }
        System.out.println("[DisasterApiService] OpenWeather: saved " + totalSaved + " weather alerts");
    }

    // ==================== USGS EARTHQUAKE ====================

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
                        if (event != null)
                            events.add(event);
                    } catch (Exception e) {
                        System.err.println("[DisasterApiService] Error parsing USGS feature: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[DisasterApiService] Error fetching from USGS API: " + e.getMessage());
        }
        return events;
    }

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

        SeverityLevel severity = categorizeSeverity(magnitude);

        String description = String.format(
                "Earthquake of magnitude %.1f detected. Location: %s. Depth: %.1f km.",
                magnitude, place, coordinates.size() > 2 ? coordinates.get(2).asDouble() : 0);

        // ──────────────────────────────────────────────────────
        // REVERSE GEOCODE: lat/lon → country, state, city
        // Uses OpenWeather Geocoding API for accurate results
        // Falls back to USGS place string parsing if API unavailable
        // ──────────────────────────────────────────────────────
        String[] locationParts = reverseGeocode(latitude, longitude);
        String country = locationParts[0];
        String state = locationParts[1];
        String city = locationParts[2];

        // If reverse geocoding failed, try fallback from USGS place string
        if ("Unknown".equals(country)) {
            country = extractCountryFromPlace(place);
            state = extractStateFromPlace(place, country);
            city = extractCityFromPlace(place);
        }

        // Final validation: don't save with null/empty country
        if (country == null || country.isEmpty()) {
            country = "Unknown";
        }
        if (state == null || state.isEmpty()) {
            state = "Unknown";
        }

        DisasterEvent event = new DisasterEvent();
        event.setTitle(title);
        event.setDescription(description);
        event.setDisasterType(DisasterType.EARTHQUAKE);
        event.setSeverity(severity);
        event.setLatitude(latitude);
        event.setLongitude(longitude);
        event.setLocationName(place);
        event.setCountry(country);
        event.setState(state);
        event.setCity(city != null ? city : "");
        event.setSource("USGS");
        event.setEventTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(timeMs), ZoneId.systemDefault()));
        event.setStatus(EventStatus.PENDING);
        event.setCreatedBy("SYSTEM");

        return event;
    }

    // ==================== REVERSE GEOCODING ====================

    /**
     * Reverse geocode lat/lon using OpenWeather Geocoding API.
     * Returns [country, state, city].
     * Falls back to ["Unknown","Unknown",""] if API key is missing or call fails.
     */
    private String[] reverseGeocode(double lat, double lon) {
        String[] result = { "Unknown", "Unknown", "" };

        if (openWeatherApiKey == null || openWeatherApiKey.isEmpty()) {
            return result;
        }

        try {
            String url = String.format(REVERSE_GEO_URL, lat, lon, openWeatherApiKey);
            String response = restTemplate.getForObject(url, String.class);
            if (response == null)
                return result;

            JsonNode root = objectMapper.readTree(response);
            if (!root.isArray() || root.size() == 0)
                return result;

            JsonNode location = root.get(0);

            // Extract country code → standardize to full name
            String countryCode = location.has("country") ? location.get("country").asText() : "";
            result[0] = standardizeCountryName(countryCode);

            // Extract state
            String stateName = location.has("state") ? location.get("state").asText() : "";
            if (stateName.isEmpty() && location.has("name")) {
                stateName = location.get("name").asText();
            }
            // Standardize US state abbreviations
            if ("United States".equals(result[0]) && stateName.length() == 2
                    && US_STATE_MAP.containsKey(stateName.toUpperCase())) {
                stateName = US_STATE_MAP.get(stateName.toUpperCase());
            }
            result[1] = stateName.isEmpty() ? "Unknown" : stateName;

            // Extract city (from "name" field if different from state)
            String cityName = location.has("name") ? location.get("name").asText() : "";
            if (cityName.equals(result[1])) {
                // If city same as state, try local_names or leave empty
                cityName = "";
            }
            result[2] = cityName;

            System.out.println("[ReverseGeocode] " + lat + "," + lon + " → "
                    + result[0] + " / " + result[1] + " / " + result[2]);

        } catch (Exception e) {
            System.err.println("[ReverseGeocode] Failed for " + lat + "," + lon + ": " + e.getMessage());
        }

        return result;
    }

    /**
     * Standardize country codes and names to consistent full names.
     * Example: "US" → "United States", "IN" → "India"
     */
    private String standardizeCountryName(String countryInput) {
        if (countryInput == null || countryInput.isEmpty())
            return "Unknown";

        String trimmed = countryInput.trim();

        // Check if it's a 2-letter code
        String upper = trimmed.toUpperCase();
        if (COUNTRY_CODE_MAP.containsKey(upper)) {
            return COUNTRY_CODE_MAP.get(upper);
        }

        // Already a full name? Check known values
        for (String fullName : COUNTRY_CODE_MAP.values()) {
            if (fullName.equalsIgnoreCase(trimmed)) {
                return fullName; // Return the canonical casing
            }
        }

        // Return as-is if we don't recognize it (capitalize first letter)
        if (trimmed.length() <= 3) {
            return trimmed.toUpperCase(); // Short code we don't know
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1);
    }

    // ==================== USGS PLACE STRING FALLBACKS ====================

    /**
     * Fallback: Extract country name from USGS place string.
     * USGS format: "5km SSW of City, Region" or "5km SSW of City, Country"
     * Used only when reverse geocoding is unavailable.
     */
    private String extractCountryFromPlace(String place) {
        if (place == null)
            return "Unknown";
        String[] parts = place.split(",");
        if (parts.length >= 2) {
            String lastPart = parts[parts.length - 1].trim();
            // Check if it's a US state name
            if (isUSState(lastPart)) {
                return "United States";
            }
            // Check if it's a known country code
            String standardized = standardizeCountryName(lastPart);
            if (!"Unknown".equals(standardized) && !standardized.equals(lastPart.toUpperCase())) {
                return standardized;
            }
            return lastPart;
        }
        return "Unknown";
    }

    /**
     * Fallback: Extract state from USGS place string
     */
    private String extractStateFromPlace(String place, String country) {
        if (place == null)
            return "Unknown";
        String[] parts = place.split(",");
        if (parts.length >= 2) {
            String lastPart = parts[parts.length - 1].trim();
            // If country is US and last part is a US state, return it directly
            if ("United States".equals(country) && isUSState(lastPart)) {
                return lastPart;
            }
            // For non-US, the last part is usually the country, not state
            // If there's a middle part, that might be the state/region
            if (parts.length >= 3) {
                return parts[parts.length - 2].trim();
            }
            return lastPart;
        }
        return "Unknown";
    }

    /**
     * Fallback: Extract city from USGS place string
     */
    private String extractCityFromPlace(String place) {
        if (place == null)
            return "";
        // USGS format: "123km SSW of CityName, Region"
        String[] ofParts = place.split(" of ");
        if (ofParts.length >= 2) {
            String afterOf = ofParts[ofParts.length - 1];
            String[] commaParts = afterOf.split(",");
            return commaParts[0].trim();
        }
        return "";
    }

    /**
     * Check if a string is a known US state name
     */
    private boolean isUSState(String s) {
        if (s == null)
            return false;
        String[] usStates = {
                "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
                "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
                "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
                "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
                "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
                "New Hampshire", "New Jersey", "New Mexico", "New York",
                "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
                "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
                "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
                "West Virginia", "Wisconsin", "Wyoming",
                // Also handle USGS abbreviations
                "CA", "Puerto Rico", "U.S. Virgin Islands"
        };
        for (String state : usStates) {
            if (state.equalsIgnoreCase(s))
                return true;
        }
        // Also check the abbreviation map
        return US_STATE_MAP.containsKey(s.toUpperCase());
    }

    // ==================== OPENWEATHER ====================

    public List<DisasterEvent> fetchWeatherAlerts(double lat, double lon,
            String country, String state, String city) {
        List<DisasterEvent> events = new ArrayList<>();
        try {
            String url = String.format(
                    "https://api.openweathermap.org/data/3.0/onecall?lat=%.4f&lon=%.4f&exclude=minutely,hourly,daily&appid=%s",
                    lat, lon, openWeatherApiKey);

            String response = restTemplate.getForObject(url, String.class);
            if (response == null)
                return events;

            JsonNode root = objectMapper.readTree(response);
            JsonNode alerts = root.get("alerts");

            if (alerts != null && alerts.isArray()) {
                for (JsonNode alert : alerts) {
                    try {
                        DisasterEvent event = parseWeatherAlert(alert, lat, lon, country, state, city);
                        if (event != null)
                            events.add(event);
                    } catch (Exception e) {
                        System.err.println("[DisasterApiService] Error parsing weather alert: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[DisasterApiService] Error fetching OpenWeather for " + city + ": " + e.getMessage());
        }
        return events;
    }

    private DisasterEvent parseWeatherAlert(JsonNode alert, double lat, double lon,
            String country, String state, String city) {
        String eventName = alert.has("event") ? alert.get("event").asText() : "Weather Alert";
        String sender = alert.has("sender_name") ? alert.get("sender_name").asText() : "OpenWeather";
        String desc = alert.has("description") ? alert.get("description").asText() : "";
        long startMs = alert.has("start") ? alert.get("start").asLong() * 1000 : System.currentTimeMillis();

        // Auto-categorize disaster type
        DisasterType type = categorizeByDescription(eventName + " " + desc);
        SeverityLevel severity = categorizeWeatherSeverity(eventName);

        // Standardize country name for consistency
        String standardizedCountry = standardizeCountryName(country);

        String title = eventName + " - " + city + ", " + state;

        DisasterEvent event = new DisasterEvent();
        event.setTitle(title);
        event.setDescription(desc.length() > 500 ? desc.substring(0, 500) : desc);
        event.setDisasterType(type);
        event.setSeverity(severity);
        event.setLatitude(lat);
        event.setLongitude(lon);
        event.setLocationName(city + ", " + state + ", " + standardizedCountry);
        event.setCountry(standardizedCountry);
        event.setState(state);
        event.setCity(city);
        event.setSource("OPENWEATHER");
        event.setEventTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(startMs), ZoneId.systemDefault()));
        event.setStatus(EventStatus.PENDING);
        event.setCreatedBy("SYSTEM");

        return event;
    }

    /**
     * Categorize weather alert severity based on event name keywords
     */
    private SeverityLevel categorizeWeatherSeverity(String eventName) {
        if (eventName == null)
            return SeverityLevel.MEDIUM;
        String lower = eventName.toLowerCase();

        if (lower.contains("extreme") || lower.contains("tornado") || lower.contains("hurricane")
                || lower.contains("typhoon") || lower.contains("tsunami")) {
            return SeverityLevel.CRITICAL;
        }
        if (lower.contains("severe") || lower.contains("flood warning") || lower.contains("cyclone")) {
            return SeverityLevel.HIGH;
        }
        if (lower.contains("warning") || lower.contains("watch") || lower.contains("storm")) {
            return SeverityLevel.MEDIUM;
        }
        return SeverityLevel.LOW;
    }

    // ==================== SHARED HELPERS ====================

    private SeverityLevel categorizeSeverity(double magnitude) {
        if (magnitude >= 7.0)
            return SeverityLevel.CRITICAL;
        if (magnitude >= 5.0)
            return SeverityLevel.HIGH;
        if (magnitude >= 4.0)
            return SeverityLevel.MEDIUM;
        return SeverityLevel.LOW;
    }

    public static DisasterType categorizeByDescription(String description) {
        if (description == null)
            return DisasterType.OTHER;
        String lower = description.toLowerCase();

        if (lower.contains("earthquake") || lower.contains("seismic") || lower.contains("quake"))
            return DisasterType.EARTHQUAKE;
        if (lower.contains("flood") || lower.contains("inundation") || lower.contains("water level"))
            return DisasterType.FLOOD;
        if (lower.contains("cyclone") || lower.contains("hurricane") || lower.contains("typhoon"))
            return DisasterType.CYCLONE;
        if (lower.contains("fire") || lower.contains("wildfire") || lower.contains("blaze"))
            return DisasterType.FIRE;
        if (lower.contains("storm") || lower.contains("thunder") || lower.contains("tornado"))
            return DisasterType.STORM;
        if (lower.contains("tsunami") || lower.contains("tidal wave"))
            return DisasterType.TSUNAMI;
        if (lower.contains("landslide") || lower.contains("mudslide"))
            return DisasterType.LANDSLIDE;
        if (lower.contains("drought") || lower.contains("dry spell"))
            return DisasterType.DROUGHT;

        return DisasterType.OTHER;
    }
}
