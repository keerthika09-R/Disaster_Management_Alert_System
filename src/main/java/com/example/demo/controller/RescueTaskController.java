package com.example.demo.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.RescueTask;
import com.example.demo.dto.AssignRescueTaskRequest;
import com.example.demo.dto.ResponderSummaryResponse;
import com.example.demo.dto.UpdateRescueTaskRequest;
import com.example.demo.service.RescueTaskService;

@RestController
@RequestMapping("/api/tasks")
public class RescueTaskController {

    private final RescueTaskService rescueTaskService;

    public RescueTaskController(RescueTaskService rescueTaskService) {
        this.rescueTaskService = rescueTaskService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RescueTask assignTask(@RequestBody AssignRescueTaskRequest request, Authentication authentication) {
        return rescueTaskService.assignTask(request, authentication.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<RescueTask> getAllTasks() {
        return rescueTaskService.getAllTasks();
    }

    @GetMapping("/zone/{zone}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RescueTask> getTasksByZone(@PathVariable String zone) {
        return rescueTaskService.getTasksByZone(zone);
    }

    @GetMapping("/disaster/{disasterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RescueTask> getTasksByDisaster(@PathVariable Long disasterId) {
        return rescueTaskService.getTasksByDisaster(disasterId);
    }

    @GetMapping("/responders")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ResponderSummaryResponse> getRespondersByZone(@RequestParam String zone) {
        return rescueTaskService.getRespondersByZone(zone);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RESPONDER')")
    public List<RescueTask> getMyTasks(Authentication authentication) {
        return rescueTaskService.getTasksByResponder(authentication.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONDER')")
    public RescueTask updateTask(@PathVariable Long id,
                                 @RequestBody UpdateRescueTaskRequest request,
                                 Authentication authentication) {
        return rescueTaskService.updateTask(id, request, authentication.getName());
    }
}
