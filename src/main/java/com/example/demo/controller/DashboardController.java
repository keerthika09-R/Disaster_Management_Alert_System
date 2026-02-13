package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Entity.User;
import com.example.demo.Entity.Task;
import com.example.demo.service.UserService;
import com.example.demo.service.TaskService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final UserService userService;
    private final TaskService taskService;

    public DashboardController(UserService userService, TaskService taskService) {
        this.userService = userService;
        this.taskService = taskService;
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "ADMIN");
        response.put("access", "Full system control - manage users, assign tasks, configure alerts");
        
        // Real task statistics
        TaskService.TaskStatistics stats = taskService.getTaskStatistics();
        response.put("taskStatistics", stats);
        response.put("recentTasks", taskService.getAllTasks().subList(0, Math.min(5, taskService.getAllTasks().size())));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/responder/dashboard")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<Map<String, Object>> responderDashboard(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Responder Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "RESPONDER");
        response.put("access", "View assigned rescue operations, update status, communicate with admin");
        
        // Real task data for responder
        String responderEmail = authentication.getName();
        List<Task> assignedTasks = taskService.getTasksForResponder(responderEmail);
        TaskService.ResponderStatistics stats = taskService.getResponderStatistics(responderEmail);
        
        response.put("assignedTasks", assignedTasks);
        response.put("taskStatistics", stats);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citizen/dashboard")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> citizenDashboard(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Citizen Dashboard");
        response.put("user", authentication.getName());
        response.put("role", "CITIZEN");
        response.put("access", "View disaster alerts, request emergency help, share location");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAllUsers() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "All users list - Admin only access");
        response.put("action", "View and manage all system users");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/assign-task")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignRescueTask(@RequestBody Map<String, String> request, Authentication authentication) {
        String taskDescription = request.get("taskDescription");
        String assignedTo = request.get("responderId");
        String assignedBy = authentication.getName();
        
        // Save task to database
        Task task = taskService.assignTask(taskDescription, assignedTo, assignedBy);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Rescue task assigned successfully");
        response.put("task", task);
        response.put("assignedTo", assignedTo);
        response.put("assignedBy", assignedBy);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/responder/update-status")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<Map<String, Object>> updateRescueStatus(@RequestBody Map<String, String> request) {
        Long taskId = Long.parseLong(request.get("taskId"));
        String status = request.get("status");
        
        // Update task in database
        Task updatedTask = taskService.updateTaskStatus(taskId, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Rescue status updated successfully");
        response.put("task", updatedTask);
        response.put("taskId", taskId);
        response.put("status", status);
        response.put("updatedBy", "Responder");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/citizen/request-help")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> requestEmergencyHelp(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Emergency help request received");
        response.put("location", request.get("location"));
        response.put("emergencyType", request.get("emergencyType"));
        response.put("status", "Request forwarded to responders");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citizen/alerts")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> getDisasterAlerts() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Disaster alerts for your region");
        response.put("alerts", "Flood warning: High water levels in your area");
        response.put("action", "Move to higher ground immediately");
        return ResponseEntity.ok(response);
    }
}
