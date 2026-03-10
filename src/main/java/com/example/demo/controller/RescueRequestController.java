package com.example.demo.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.RescueRequestCreateRequest;
import com.example.demo.dto.RescueRequestResponse;
import com.example.demo.service.RescueRequestService;

@RestController
@RequestMapping("/api/rescue-requests")
public class RescueRequestController {

    private final RescueRequestService rescueRequestService;

    public RescueRequestController(RescueRequestService rescueRequestService) {
        this.rescueRequestService = rescueRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public RescueRequestResponse createRequest(@RequestBody RescueRequestCreateRequest request,
                                               Authentication authentication) {
        return rescueRequestService.createRequest(authentication.getName(), request);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    public List<RescueRequestResponse> getMyRequests(Authentication authentication) {
        return rescueRequestService.getCitizenRequests(authentication.getName());
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('RESPONDER')")
    public List<RescueRequestResponse> getAvailableRequests(Authentication authentication) {
        return rescueRequestService.getAvailableRequests(authentication.getName());
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('RESPONDER')")
    public RescueRequestResponse acceptRequest(@PathVariable Long id, Authentication authentication) {
        return rescueRequestService.acceptRequest(id, authentication.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<RescueRequestResponse> getAllRequests() {
        return rescueRequestService.getAllRequests();
    }
}
