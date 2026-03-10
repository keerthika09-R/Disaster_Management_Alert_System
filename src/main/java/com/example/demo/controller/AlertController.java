package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.Entity.AlertAcknowledgment;
import com.example.demo.repository.AlertAcknowledgmentRepository;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertAcknowledgmentRepository repository;

    @PostMapping("/acknowledge/{disasterId}")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<String> acknowledge(@PathVariable Long disasterId, Authentication authentication) {
        String responderEmail = authentication.getName();

        if (repository.existsByDisasterIdAndResponderEmail(disasterId, responderEmail)) {
            return ResponseEntity.ok("Already acknowledged");
        }

        AlertAcknowledgment ack = new AlertAcknowledgment();

        ack.setDisasterId(disasterId);
        ack.setResponderEmail(responderEmail);
        ack.setAcknowledgedAt(LocalDateTime.now());

        repository.save(ack);

        return ResponseEntity.ok("Acknowledged");
    }

    @GetMapping("/all-acknowledgments")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AlertAcknowledgment> getAll() {
        return repository.findAll();
    }

    @GetMapping("/my-acknowledgments")
    @PreAuthorize("hasRole('RESPONDER')")
    public List<AlertAcknowledgment> getMyAcknowledgments(Authentication authentication) {
        return repository.findByResponderEmail(authentication.getName());
    }

    @GetMapping("/disaster/{disasterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AlertAcknowledgment> getByDisasterId(@PathVariable Long disasterId) {
        return repository.findByDisasterId(disasterId);
    }
}
