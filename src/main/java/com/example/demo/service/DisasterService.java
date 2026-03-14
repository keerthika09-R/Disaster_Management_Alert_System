package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.IncidentReport;
import com.example.demo.Entity.RescueTask;
import com.example.demo.repository.DisasterRepository;
import com.example.demo.repository.IncidentReportRepository;
import com.example.demo.repository.RescueTaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import jakarta.transaction.Transactional;

@Service
public class DisasterService {

    @Autowired
    private DisasterRepository repository;

    @Autowired
    private RescueTaskRepository rescueTaskRepository;

    @Autowired
    private IncidentReportRepository incidentReportRepository;

    public List<DisasterEvent> getPendingEvents() {
        return repository.findByStatus("PENDING");
    }

    public List<DisasterEvent> getVerifiedEvents() {
        return repository.findByStatus("VERIFIED");
    }

    public List<DisasterEvent> getResolvedEvents() {
        return repository.findByStatus("RESOLVED");
    }

    public DisasterEvent createEvent(DisasterEvent event) {
        event.setStatus("PENDING");
        return repository.save(event);
    }

    public DisasterEvent approveEvent(Long id) {

        DisasterEvent event = repository.findById(id).orElseThrow();
        event.setStatus("VERIFIED");

        return repository.save(event);
    }

    public DisasterEvent rejectEvent(Long id) {

        DisasterEvent event = repository.findById(id).orElseThrow();
        event.setStatus("REJECTED");

        return repository.save(event);
    }

    public DisasterEvent updateEventStatus(Long id, String status) {
        DisasterEvent event = repository.findById(id).orElseThrow();
        event.setStatus(status);
        return repository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        List<RescueTask> tasks = rescueTaskRepository.findByDisasterEventId(id);
        for (RescueTask task : tasks) {
            List<IncidentReport> reports = incidentReportRepository.findByRescueTaskId(task.getId());
            incidentReportRepository.deleteAll(reports);
        }
        rescueTaskRepository.deleteAll(tasks);
        repository.deleteById(id);
    }

    @Scheduled(fixedRate = 86400000) // Runs every 24 hours (86400000 ms)
    @Transactional
    public void cleanupUnverifiedDisasters() {
        List<DisasterEvent> unverifiedEvents = repository.findByStatus("PENDING");
        for (DisasterEvent event : unverifiedEvents) {
            deleteEvent(event.getId());
        }
        System.out.println("Automated Cleanup: Deleted " + unverifiedEvents.size() + " unverified disasters.");
    }

}