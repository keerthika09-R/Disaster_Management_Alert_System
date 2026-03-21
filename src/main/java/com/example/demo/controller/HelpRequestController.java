package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

import com.example.demo.Entity.HelpRequest;
import com.example.demo.repository.HelpRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.Entity.User;

@RestController
@RequestMapping("/api/help-requests")
@CrossOrigin(origins = "http://localhost:4200")
public class HelpRequestController {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<HelpRequest> submitRequest(@RequestBody HelpRequest request) {
        request.setStatus("PENDING");

        // Basic routing: find all responders and assign to the first one available
        // In a real application, this would calculate nearest geolocation
        List<User> responders = userRepository.findByRole("RESPONDER");
        if (responders != null && !responders.isEmpty()) {
            request.setAssignedResponderEmail(responders.get(0).getEmail());
            request.setStatus("ASSIGNED");
        }

        HelpRequest saved = helpRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/responder/{email}")
    public ResponseEntity<List<HelpRequest>> getAssignedRequests(@PathVariable String email) {
        List<HelpRequest> requests = helpRequestRepository.findByAssignedResponderEmail(email);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/all")
    public ResponseEntity<List<HelpRequest>> getAllRequests() {
        return ResponseEntity.ok(helpRequestRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HelpRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return helpRequestRepository.findById(id).map(request -> {
            request.setStatus(status);
            return ResponseEntity.ok(helpRequestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}
