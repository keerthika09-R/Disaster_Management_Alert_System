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
        request.setAssignedResponderEmail(null);

        HelpRequest saved = helpRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    public ResponseEntity<List<HelpRequest>> getAllRequests() {
        return ResponseEntity.ok(helpRequestRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelpRequest> getRequestById(@PathVariable Long id) {
        return helpRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/responder/{email}")
    public ResponseEntity<List<HelpRequest>> getRequestsByResponder(@PathVariable String email) {
        return ResponseEntity.ok(helpRequestRepository.findByAssignedResponderEmail(email));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<HelpRequest> assignRequest(@PathVariable Long id, @RequestParam String responderEmail) {
        return helpRequestRepository.findById(id).map(request -> {
            request.setAssignedResponderEmail(responderEmail);
            request.setStatus("ASSIGNED");
            return ResponseEntity.ok(helpRequestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HelpRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return helpRequestRepository.findById(id).map(request -> {
            request.setStatus(status);
            return ResponseEntity.ok(helpRequestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/report")
    public ResponseEntity<HelpRequest> submitReport(
            @PathVariable Long id, 
            @RequestParam String reportText, 
            @RequestParam(required = false) String reportImageUrl) {
        return helpRequestRepository.findById(id).map(request -> {
            request.setReportText(reportText);
            request.setReportImageUrl(reportImageUrl);
            request.setStatus("PENDING_VERIFICATION");
            return ResponseEntity.ok(helpRequestRepository.save(request));
        }).orElse(ResponseEntity.notFound().build());
    }
}
