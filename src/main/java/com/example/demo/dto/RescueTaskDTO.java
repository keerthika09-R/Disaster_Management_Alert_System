package com.example.demo.dto;

public class RescueTaskDTO {
    private Long id;
    private Long disasterEventId;
    private Long responderId;
    private String description;
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDisasterEventId() {
        return disasterEventId;
    }

    public void setDisasterEventId(Long disasterEventId) {
        this.disasterEventId = disasterEventId;
    }

    public Long getResponderId() {
        return responderId;
    }

    public void setResponderId(Long responderId) {
        this.responderId = responderId;
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
}
