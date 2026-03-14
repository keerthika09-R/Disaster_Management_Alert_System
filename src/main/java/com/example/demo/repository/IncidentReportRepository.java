package com.example.demo.repository;

import com.example.demo.Entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByRescueTaskId(Long rescueTaskId);
}
