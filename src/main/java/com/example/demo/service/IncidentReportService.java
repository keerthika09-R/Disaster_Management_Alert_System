package com.example.demo.service;

import com.example.demo.Entity.IncidentReport;
import com.example.demo.Entity.RescueTask;
import com.example.demo.dto.IncidentReportDTO;
import com.example.demo.repository.IncidentReportRepository;
import com.example.demo.repository.RescueTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class IncidentReportService {

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    @Autowired
    private RescueTaskRepository rescueTaskRepository;

    @Value("${app.upload.incident-report-dir:uploads/incident-reports}")
    private String incidentReportUploadDir;

    public IncidentReport submitReport(IncidentReportDTO dto, MultipartFile imageFile) {
        IncidentReport report = new IncidentReport();

        RescueTask task = rescueTaskRepository.findById(dto.getRescueTaskId())
                .orElseThrow(() -> new RuntimeException("Rescue Task not found"));

        if (imageFile == null || imageFile.isEmpty()) {
            throw new RuntimeException("Image evidence is required");
        }
        if (imageFile.getContentType() == null || !imageFile.getContentType().startsWith("image/")) {
            throw new RuntimeException("Only image uploads are allowed");
        }

        report.setRescueTask(task);
        report.setReportText(dto.getReportText());
        report.setImageUrl(storeImage(imageFile));
        report.setTimestamp(LocalDateTime.now());

        return incidentReportRepository.save(report);
    }

    private String storeImage(MultipartFile imageFile) {
        try {
            String originalFilename = StringUtils.cleanPath(imageFile.getOriginalFilename() == null
                    ? "evidence"
                    : imageFile.getOriginalFilename());
            String extension = "";
            int extensionIndex = originalFilename.lastIndexOf('.');
            if (extensionIndex >= 0) {
                extension = originalFilename.substring(extensionIndex);
            }

            Path uploadDirectory = Paths.get(incidentReportUploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadDirectory);

            String storedFileName = UUID.randomUUID() + extension;
            Path targetPath = uploadDirectory.resolve(storedFileName);

            Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/incident-reports/" + storedFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store incident report image", ex);
        }
    }

    public List<IncidentReport> getReportsByTask(Long rescueTaskId) {
        return incidentReportRepository.findByRescueTaskId(rescueTaskId);
    }

    public List<IncidentReport> getAllReports() {
        return incidentReportRepository.findAll();
    }
}
