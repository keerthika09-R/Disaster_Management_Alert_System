package com.example.demo.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_acknowledgments")
public class AlertAcknowledgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long disasterId;

    @Column(nullable = false)
    private Long responderId;

    @Column(nullable = false)
    private String responderEmail;

    @Column(nullable = false)
    private String status; // ACKNOWLEDGED

    @Column(nullable = false)
    private LocalDateTime acknowledgedAt;

    public AlertAcknowledgment() {
        this.acknowledgedAt = LocalDateTime.now();
        this.status = "ACKNOWLEDGED";
    }

    // Getters and Setters
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

    public Long getResponderId() {
        return responderId;
    }

    public void setResponderId(Long responderId) {
        this.responderId = responderId;
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

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }
}
