package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.service.DisasterService;
import com.example.demo.service.DisasterApiService;
import com.example.demo.repository.DisasterRepository;

@RestController
@RequestMapping("/api/disasters")
public class DisasterController {

    @Autowired
    private DisasterService service;

    // service used to sync with external disaster API
    @Autowired
    private DisasterApiService disasterApiService;

    @Autowired
    private DisasterRepository disasterRepository;

    @GetMapping("/all")
    public List<DisasterEvent> getAllEvents() {
        return disasterRepository.findAll();
    }

    @GetMapping("/pending")
    public List<DisasterEvent> getPending() {
        return service.getPendingEvents();
    }

    @GetMapping("/verified")
    public List<DisasterEvent> getVerified() {
        return service.getVerifiedEvents();
    }

    @GetMapping("/resolved")
    public List<DisasterEvent> getResolved() {
        return service.getResolvedEvents();
    }

    @PostMapping("/create")
    public DisasterEvent create(@RequestBody DisasterEvent event) {
        return service.createEvent(event);
    }

    @PostMapping("/{id}/approve")
    public DisasterEvent approve(@PathVariable Long id) {
        return service.approveEvent(id);
    }

    @PostMapping("/{id}/reject")
    public DisasterEvent reject(@PathVariable Long id) {
        return service.rejectEvent(id);
    }

    @PostMapping("/sync")
    public String syncEvents() {
        disasterApiService.syncEarthquakes();
        return "Disaster events synced";
    }

    @DeleteMapping("/{id}")
    public void deleteDisaster(@PathVariable Long id) {
        service.deleteEvent(id);
    }

    @PutMapping("/{id}/status")
    public DisasterEvent updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateEventStatus(id, status);
    }

}