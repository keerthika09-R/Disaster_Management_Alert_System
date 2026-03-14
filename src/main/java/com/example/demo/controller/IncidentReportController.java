package com.example.demo.controller;

import com.example.demo.Entity.IncidentReport;
import com.example.demo.dto.IncidentReportDTO;
import com.example.demo.service.IncidentReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class IncidentReportController {

    @Autowired
    private IncidentReportService incidentReportService;

    @PostMapping("/submit")
    public IncidentReport submitReport(@RequestBody IncidentReportDTO dto) {
        return incidentReportService.submitReport(dto);
    }

    @GetMapping("/task/{taskId}")
    public List<IncidentReport> getReportsByTask(@PathVariable Long taskId) {
        return incidentReportService.getReportsByTask(taskId);
    }

    @GetMapping("/all")
    public List<IncidentReport> getAllReports() {
        return incidentReportService.getAllReports();
    }
}
