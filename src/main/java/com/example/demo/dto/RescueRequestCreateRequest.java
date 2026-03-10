package com.example.demo.dto;

public class RescueRequestCreateRequest {

    private String location;
    private String emergencyType;
    private String description;
    private Integer numberOfPeople;
    private Integer requiredResponders;

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
}
