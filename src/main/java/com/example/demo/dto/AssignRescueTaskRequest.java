package com.example.demo.dto;

public class AssignRescueTaskRequest {

    private Long disasterId;
    private Long rescueRequestId;
    private String zone;
    private String assignedResponderEmail;
    private String title;
    private String description;
    private String priority;

    public Long getDisasterId() {
        return disasterId;
    }

    public void setDisasterId(Long disasterId) {
        this.disasterId = disasterId;
    }

    public Long getRescueRequestId() {
        return rescueRequestId;
    }

    public void setRescueRequestId(Long rescueRequestId) {
        this.rescueRequestId = rescueRequestId;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getAssignedResponderEmail() {
        return assignedResponderEmail;
    }

    public void setAssignedResponderEmail(String assignedResponderEmail) {
        this.assignedResponderEmail = assignedResponderEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
