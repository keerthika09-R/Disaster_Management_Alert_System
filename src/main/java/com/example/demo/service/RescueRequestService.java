package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Entity.RescueAssignment;
import com.example.demo.Entity.RescueRequest;
import com.example.demo.dto.RescueRequestCreateRequest;
import com.example.demo.dto.RescueRequestResponse;
import com.example.demo.repository.RescueAssignmentRepository;
import com.example.demo.repository.RescueRequestRepository;

@Service
public class RescueRequestService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PARTIALLY_ASSIGNED = "PARTIALLY_ASSIGNED";
    private static final String STATUS_FULLY_ASSIGNED = "FULLY_ASSIGNED";
    private static final String ASSIGNMENT_ACCEPTED = "ACCEPTED";

    private final RescueRequestRepository rescueRequestRepository;
    private final RescueAssignmentRepository rescueAssignmentRepository;

    public RescueRequestService(RescueRequestRepository rescueRequestRepository,
                                RescueAssignmentRepository rescueAssignmentRepository) {
        this.rescueRequestRepository = rescueRequestRepository;
        this.rescueAssignmentRepository = rescueAssignmentRepository;
    }

    public RescueRequestResponse createRequest(String citizenEmail, RescueRequestCreateRequest request) {
        if (isBlank(request.getLocation()) || isBlank(request.getEmergencyType())) {
            throw new IllegalArgumentException("Location and emergency type are required");
        }

        RescueRequest rescueRequest = new RescueRequest();
        rescueRequest.setCitizenEmail(citizenEmail);
        rescueRequest.setLocation(request.getLocation().trim());
        rescueRequest.setEmergencyType(request.getEmergencyType().trim());
        rescueRequest.setDescription(safeValue(request.getDescription()));
        rescueRequest.setNumberOfPeople(normalizeCount(request.getNumberOfPeople(), 1));
        rescueRequest.setRequiredResponders(normalizeCount(request.getRequiredResponders(), 1));
        rescueRequest.setAcceptedRespondersCount(0);
        rescueRequest.setStatus(STATUS_PENDING);
        rescueRequest.setCreatedAt(LocalDateTime.now());

        return toResponse(rescueRequestRepository.save(rescueRequest), citizenEmail);
    }

    public List<RescueRequestResponse> getCitizenRequests(String citizenEmail) {
        return rescueRequestRepository.findByCitizenEmailOrderByCreatedAtDesc(citizenEmail)
                .stream()
                .map(request -> toResponse(request, null))
                .toList();
    }

    public List<RescueRequestResponse> getAvailableRequests(String responderEmail) {
        return rescueRequestRepository
                .findByStatusInOrderByCreatedAtDesc(List.of(STATUS_PENDING, STATUS_PARTIALLY_ASSIGNED))
                .stream()
                .filter(request -> request.getAcceptedRespondersCount() < request.getRequiredResponders())
                .map(request -> toResponse(request, responderEmail))
                .toList();
    }

    public List<RescueRequestResponse> getAllRequests() {
        return rescueRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(request -> toResponse(request, null))
                .toList();
    }

    @Transactional
    public RescueRequestResponse acceptRequest(Long requestId, String responderEmail) {
        RescueRequest request = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Rescue request not found"));

        if (!(STATUS_PENDING.equals(request.getStatus()) || STATUS_PARTIALLY_ASSIGNED.equals(request.getStatus()))) {
            throw new IllegalStateException("This rescue request is no longer available");
        }

        if (request.getAcceptedRespondersCount() >= request.getRequiredResponders()) {
            request.setStatus(STATUS_FULLY_ASSIGNED);
            rescueRequestRepository.save(request);
            throw new IllegalStateException("Required responder count already reached");
        }

        if (rescueAssignmentRepository.existsByRescueRequestIdAndResponderEmail(requestId, responderEmail)) {
            return toResponse(request, responderEmail);
        }

        RescueAssignment assignment = new RescueAssignment();
        assignment.setRescueRequestId(requestId);
        assignment.setResponderEmail(responderEmail);
        assignment.setStatus(ASSIGNMENT_ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        rescueAssignmentRepository.save(assignment);

        int acceptedCount = request.getAcceptedRespondersCount() + 1;
        request.setAcceptedRespondersCount(acceptedCount);
        request.setStatus(acceptedCount >= request.getRequiredResponders()
                ? STATUS_FULLY_ASSIGNED
                : STATUS_PARTIALLY_ASSIGNED);

        return toResponse(rescueRequestRepository.save(request), responderEmail);
    }

    private RescueRequestResponse toResponse(RescueRequest request, String currentResponderEmail) {
        List<RescueAssignment> assignments = rescueAssignmentRepository.findByRescueRequestId(request.getId());

        RescueRequestResponse response = new RescueRequestResponse();
        response.setId(request.getId());
        response.setCitizenEmail(request.getCitizenEmail());
        response.setLocation(request.getLocation());
        response.setEmergencyType(request.getEmergencyType());
        response.setDescription(request.getDescription());
        response.setNumberOfPeople(request.getNumberOfPeople());
        response.setRequiredResponders(request.getRequiredResponders());
        response.setAcceptedRespondersCount(request.getAcceptedRespondersCount());
        response.setStatus(request.getStatus());
        response.setCreatedAt(request.getCreatedAt());
        response.setAcceptedByCurrentResponder(currentResponderEmail != null
                && assignments.stream().anyMatch(assignment -> assignment.getResponderEmail().equals(currentResponderEmail)));
        response.setAcceptedResponders(assignments.stream().map(this::toAssignmentResponse).toList());
        return response;
    }

    private RescueRequestResponse.ResponderAcceptanceResponse toAssignmentResponse(RescueAssignment assignment) {
        RescueRequestResponse.ResponderAcceptanceResponse response =
                new RescueRequestResponse.ResponderAcceptanceResponse();
        response.setResponderEmail(assignment.getResponderEmail());
        response.setStatus(assignment.getStatus());
        response.setAcceptedAt(assignment.getAcceptedAt());
        return response;
    }

    private int normalizeCount(Integer value, int fallback) {
        return value == null || value < 1 ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String safeValue(String value) {
        return value == null ? "" : value.trim();
    }
}
