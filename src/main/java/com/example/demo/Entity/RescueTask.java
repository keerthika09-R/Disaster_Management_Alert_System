package com.example.demo.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class RescueTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long disasterId;
    private Long rescueRequestId;
    private String zone;
    private String assignedResponderEmail;
    private String assignedByAdminEmail;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String progressNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getAssignedByAdminEmail() {
        return assignedByAdminEmail;
    }

    public void setAssignedByAdminEmail(String assignedByAdminEmail) {
        this.assignedByAdminEmail = assignedByAdminEmail;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProgressNote() {
        return progressNote;
    }

    public void setProgressNote(String progressNote) {
        this.progressNote = progressNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
