package com.example.demo.controller;

import com.example.demo.Entity.AlertAcknowledgment;
import com.example.demo.Entity.User;
import com.example.demo.repository.AlertAcknowledgmentRepository;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/acknowledgments")
public class AlertAcknowledgmentController {

    private final AlertAcknowledgmentRepository acknowledgmentRepository;
    private final UserService userService;

    public AlertAcknowledgmentController(AlertAcknowledgmentRepository acknowledgmentRepository,
            UserService userService) {
        this.acknowledgmentRepository = acknowledgmentRepository;
        this.userService = userService;
    }

    /**
     * Responder acknowledges a disaster alert
     */
    @PostMapping("/acknowledge")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<?> acknowledgeAlert(
            @RequestBody Map<String, Long> body,
            Authentication authentication) {

        Long disasterId = body.get("disasterId");
        if (disasterId == null) {
            return ResponseEntity.badRequest().body("disasterId is required");
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already acknowledged
        if (acknowledgmentRepository.existsByDisasterIdAndResponderId(disasterId, user.getId())) {
            return ResponseEntity.ok(Map.of("message", "Already acknowledged"));
        }

        AlertAcknowledgment ack = new AlertAcknowledgment();
        ack.setDisasterId(disasterId);
        ack.setResponderId(user.getId());
        ack.setResponderEmail(email);

        acknowledgmentRepository.save(ack);
        return ResponseEntity.ok(ack);
    }

    /**
     * Get all acknowledgments for a disaster (Admin view)
     */
    @GetMapping("/disaster/{disasterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AlertAcknowledgment>> getByDisaster(@PathVariable Long disasterId) {
        return ResponseEntity.ok(acknowledgmentRepository.findByDisasterId(disasterId));
    }

    /**
     * Get my acknowledgments (Responder view)
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<List<AlertAcknowledgment>> getMyAcknowledgments(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(acknowledgmentRepository.findByResponderId(user.getId()));
    }

    /**
     * Get all acknowledgments (Admin view)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AlertAcknowledgment>> getAll() {
        return ResponseEntity.ok(acknowledgmentRepository.findAll());
    }
}
