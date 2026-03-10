package com.example.demo.dto;

public class ResponderSummaryResponse {

    private String fullName;
    private String email;
    private String region;

    public ResponderSummaryResponse() {
    }

    public ResponderSummaryResponse(String fullName, String email, String region) {
        this.fullName = fullName;
        this.email = email;
        this.region = region;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}
