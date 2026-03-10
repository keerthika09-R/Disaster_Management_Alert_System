package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.repository.DisasterRepository;

@Service
public class DisasterService {

    @Autowired
    private DisasterRepository repository;

    public List<DisasterEvent> getPendingEvents() {
        return repository.findByStatus("PENDING");
    }

    public List<DisasterEvent> getVerifiedEvents() {
        return repository.findByStatus("VERIFIED");
    }

    public DisasterEvent getEventById(Long id) {
        return repository.findById(id).orElseThrow();
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

}
