package com.example.demo.service;

import com.example.demo.Entity.IncidentReport;
import com.example.demo.Entity.RescueTask;
import com.example.demo.dto.IncidentReportDTO;
import com.example.demo.repository.IncidentReportRepository;
import com.example.demo.repository.RescueTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentReportService {

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private RescueTaskRepository rescueTaskRepository;

    public IncidentReport submitReport(IncidentReportDTO dto) {
        IncidentReport report = new IncidentReport();

        RescueTask task = rescueTaskRepository.findById(dto.getRescueTaskId())
                .orElseThrow(() -> new RuntimeException("Rescue Task not found"));

        report.setRescueTask(task);
        report.setReportText(dto.getReportText());
        report.setImageUrl(dto.getImageUrl());
        report.setTimestamp(LocalDateTime.now());

        return incidentReportRepository.save(report);
    }

    public List<IncidentReport> getReportsByTask(Long rescueTaskId) {
        return incidentReportRepository.findByRescueTaskId(rescueTaskId);
    }

    public List<IncidentReport> getAllReports() {
        return incidentReportRepository.findAll();
    }
}
