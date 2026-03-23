package com.example.demo.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String citizenEmail;

    private String location;

    @Column(length = 500)
    private String description;

    // e.g., PENDING, ASSIGNED, RESOLVED
    private String status = "PENDING";

    private String assignedResponderEmail;

    @Column(length = 1000)
    private String reportText;

    private String reportImageUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedResponderEmail() {
        return assignedResponderEmail;
    }

    public void setAssignedResponderEmail(String assignedResponderEmail) {
        this.assignedResponderEmail = assignedResponderEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getReportText() {
        return reportText;
    }

    public void setReportText(String reportText) {
        this.reportText = reportText;
    }

    public String getReportImageUrl() {
        return reportImageUrl;
    }

    public void setReportImageUrl(String reportImageUrl) {
        this.reportImageUrl = reportImageUrl;
    }
}
