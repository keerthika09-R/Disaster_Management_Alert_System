package com.example.demo.dto;

public class ProfileResponse {

    private String fullName;
    private String phoneNumber;
    private String region;
    private String profileImage;

    private String email;
    private String role;


    // Constructor
    public ProfileResponse(String fullName,
                           String phoneNumber,
                           String region,
                           String profileImage,
                           String email,
                           String role) {

        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.region = region;
        this.profileImage = profileImage;
        this.email = email;
        this.role = role;
    }


    // Getters
    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getRegion() {
        return region;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }


    // Setters 
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
