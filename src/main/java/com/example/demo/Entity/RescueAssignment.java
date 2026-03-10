package com.example.demo.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class RescueAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long rescueRequestId;
    private String responderEmail;
    private String status;
    private LocalDateTime acceptedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRescueRequestId() {
        return rescueRequestId;
    }

    public void setRescueRequestId(Long rescueRequestId) {
        this.rescueRequestId = rescueRequestId;
    }

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
