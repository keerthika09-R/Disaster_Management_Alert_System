package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.RescueTask;
import com.example.demo.Entity.UserProfile;
import com.example.demo.dto.AssignRescueTaskRequest;
import com.example.demo.dto.ResponderSummaryResponse;
import com.example.demo.dto.UpdateRescueTaskRequest;
import com.example.demo.repository.RescueTaskRepository;
import com.example.demo.repository.UserProfileRepository;
import com.example.demo.repository.UserRepository;

@Service
public class RescueTaskService {

    private static final Set<String> VALID_STATUSES =
            Set.of("ASSIGNED", "ACCEPTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED");

    private final RescueTaskRepository rescueTaskRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public RescueTaskService(RescueTaskRepository rescueTaskRepository,
                             UserProfileRepository userProfileRepository,
                             UserRepository userRepository) {
        this.rescueTaskRepository = rescueTaskRepository;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public RescueTask assignTask(AssignRescueTaskRequest request, String adminEmail) {
        if (isBlank(request.getAssignedResponderEmail()) || isBlank(request.getZone()) || isBlank(request.getTitle())) {
            throw new IllegalArgumentException("Zone, responder email, and title are required");
        }

        userRepository.findByEmail(request.getAssignedResponderEmail())
                .filter(user -> "RESPONDER".equalsIgnoreCase(user.getRole()))
                .orElseThrow(() -> new IllegalArgumentException("Assigned user is not a responder"));

        RescueTask task = new RescueTask();
        task.setDisasterId(request.getDisasterId());
        task.setRescueRequestId(request.getRescueRequestId());
        task.setZone(request.getZone().trim());
        task.setAssignedResponderEmail(request.getAssignedResponderEmail().trim());
        task.setAssignedByAdminEmail(adminEmail);
        task.setTitle(request.getTitle().trim());
        task.setDescription(safeValue(request.getDescription()));
        task.setPriority(isBlank(request.getPriority()) ? "MEDIUM" : request.getPriority().trim().toUpperCase());
        task.setStatus("ASSIGNED");
        task.setProgressNote("");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return rescueTaskRepository.save(task);
    }

    public List<RescueTask> getAllTasks() {
        return rescueTaskRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<RescueTask> getTasksByResponder(String responderEmail) {
        return rescueTaskRepository.findByAssignedResponderEmailOrderByUpdatedAtDesc(responderEmail);
    }

    public List<RescueTask> getTasksByZone(String zone) {
        return rescueTaskRepository.findByZoneOrderByUpdatedAtDesc(zone);
    }

    public List<RescueTask> getTasksByDisaster(Long disasterId) {
        return rescueTaskRepository.findByDisasterIdOrderByUpdatedAtDesc(disasterId);
    }

    public RescueTask updateTask(Long taskId, UpdateRescueTaskRequest request, String responderEmail) {
        RescueTask task = rescueTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!responderEmail.equalsIgnoreCase(task.getAssignedResponderEmail())) {
            throw new IllegalStateException("You can update only your own tasks");
        }

        String status = isBlank(request.getStatus()) ? task.getStatus() : request.getStatus().trim().toUpperCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid task status");
        }

        task.setStatus(status);
        task.setProgressNote(safeValue(request.getProgressNote()));
        task.setUpdatedAt(LocalDateTime.now());
        return rescueTaskRepository.save(task);
    }

    public List<ResponderSummaryResponse> getRespondersByZone(String zone) {
        return userProfileRepository.findByRegionContainingIgnoreCase(zone.trim()).stream()
                .filter(profile -> profile.getUser() != null
                        && "RESPONDER".equalsIgnoreCase(profile.getUser().getRole()))
                .map(this::toResponderSummary)
                .toList();
    }

    private ResponderSummaryResponse toResponderSummary(UserProfile profile) {
        return new ResponderSummaryResponse(
                safeValue(profile.getFullName()),
                profile.getUser().getEmail(),
                safeValue(profile.getRegion())
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String safeValue(String value) {
        return value == null ? "" : value.trim();
    }
}
