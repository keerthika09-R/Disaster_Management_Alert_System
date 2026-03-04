package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

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
    public String acknowledge(@PathVariable Long disasterId) {

        AlertAcknowledgment ack = new AlertAcknowledgment();

        ack.setDisasterId(disasterId);
        ack.setResponderEmail("responder@email.com");
        ack.setAcknowledgedAt(LocalDateTime.now());

        repository.save(ack);

        return "Acknowledged";
    }

    @GetMapping("/all-acknowledgments")
    public List<AlertAcknowledgment> getAll() {
        return repository.findAll();
    }
}