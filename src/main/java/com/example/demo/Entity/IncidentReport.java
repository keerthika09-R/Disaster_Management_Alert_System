package com.example.demo.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rescue_task_id")
    private RescueTask rescueTask;

    @Column(length = 1000)
    private String reportText;

    private String imageUrl;

    private LocalDateTime timestamp = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RescueTask getRescueTask() {
        return rescueTask;
    }

    public void setRescueTask(RescueTask rescueTask) {
        this.rescueTask = rescueTask;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
