package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.incident-report-dir:uploads/incident-reports}")
    private String incidentReportUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(incidentReportUploadDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/incident-reports/**")
                .addResourceLocations(uploadPath.toUri().toString());
    }
}
