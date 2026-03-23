package com.example.demo.controller;

import com.example.demo.Entity.IncidentReport;
import com.example.demo.dto.IncidentReportDTO;
import com.example.demo.service.IncidentReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class IncidentReportController {

    @Autowired
    private IncidentReportService incidentReportService;

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IncidentReport submitReport(
            @RequestParam("rescueTaskId") Long rescueTaskId,
            @RequestParam("reportText") String reportText,
            @RequestParam("imageFile") MultipartFile imageFile
    ) {
        IncidentReportDTO dto = new IncidentReportDTO();
        dto.setRescueTaskId(rescueTaskId);
        dto.setReportText(reportText);

        return incidentReportService.submitReport(dto, imageFile);
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
