package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RescueRequestResponse {

    private Long id;
    private String citizenEmail;
    private String location;
    private String emergencyType;
    private String description;
    private Integer numberOfPeople;
    private Integer requiredResponders;
    private Integer acceptedRespondersCount;
    private String status;
    private LocalDateTime createdAt;
    private boolean acceptedByCurrentResponder;
    private List<ResponderAcceptanceResponse> acceptedResponders;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public void setCitizenEmail(String citizenEmail) {
        this.citizenEmail = citizenEmail;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
        this.emergencyType = emergencyType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getNumberOfPeople() {
        return numberOfPeople;
    }

    public void setNumberOfPeople(Integer numberOfPeople) {
        this.numberOfPeople = numberOfPeople;
    }

    public Integer getRequiredResponders() {
        return requiredResponders;
    }

    public void setRequiredResponders(Integer requiredResponders) {
        this.requiredResponders = requiredResponders;
    }

    public Integer getAcceptedRespondersCount() {
        return acceptedRespondersCount;
    }

    public void setAcceptedRespondersCount(Integer acceptedRespondersCount) {
        this.acceptedRespondersCount = acceptedRespondersCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isAcceptedByCurrentResponder() {
        return acceptedByCurrentResponder;
    }

    public void setAcceptedByCurrentResponder(boolean acceptedByCurrentResponder) {
        this.acceptedByCurrentResponder = acceptedByCurrentResponder;
    }

    public List<ResponderAcceptanceResponse> getAcceptedResponders() {
        return acceptedResponders;
    }

    public void setAcceptedResponders(List<ResponderAcceptanceResponse> acceptedResponders) {
        this.acceptedResponders = acceptedResponders;
    }

    public static class ResponderAcceptanceResponse {
        private String responderEmail;
        private String status;
        private LocalDateTime acceptedAt;

        public String getResponderEmail() {
            return responderEmail;
        }

        public void setResponderEmail(String responderEmail) {
            this.responderEmail = responderEmail;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getAcceptedAt() {
            return acceptedAt;
        }

        public void setAcceptedAt(LocalDateTime acceptedAt) {
            this.acceptedAt = acceptedAt;
        }
    }
}
