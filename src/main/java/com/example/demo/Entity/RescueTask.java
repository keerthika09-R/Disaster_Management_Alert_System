package com.example.demo.Entity;

import jakarta.persistence.*;

@Entity
public class RescueTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "disaster_event_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private DisasterEvent disasterEvent;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responder_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password" })
    private User responder;

    private String description;

    // PENDING, IN_PROGRESS, COMPLETED
    private String status = "PENDING";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DisasterEvent getDisasterEvent() {
        return disasterEvent;
    }

    public void setDisasterEvent(DisasterEvent disasterEvent) {
        this.disasterEvent = disasterEvent;
    }

    public User getResponder() {
        return responder;
    }

    public void setResponder(User responder) {
        this.responder = responder;
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
