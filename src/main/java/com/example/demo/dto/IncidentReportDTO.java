package com.example.demo.dto;

public class IncidentReportDTO {
    private Long id;
    private Long rescueTaskId;
    private String reportText;
    private String imageUrl;
    private String timestamp;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRescueTaskId() {
        return rescueTaskId;
    }

    public void setRescueTaskId(Long rescueTaskId) {
        this.rescueTaskId = rescueTaskId;
    }

    public String getReportText() {
        return reportText;
    }

    public void setReportText(String reportText) {
        this.reportText = reportText;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
