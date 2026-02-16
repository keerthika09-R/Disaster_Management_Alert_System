package com.example.demo.controller;

import com.example.demo.Entity.Task;
import com.example.demo.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Get all tasks (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    // Get tasks assigned to current responder
    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<List<Task>> getMyTasks(Authentication authentication) {
        String responderEmail = authentication.getName();
        List<Task> tasks = taskService.getTasksForResponder(responderEmail);
        return ResponseEntity.ok(tasks);
    }

    // Get pending tasks (Admin only)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Task>> getPendingTasks() {
        List<Task> tasks = taskService.getPendingTasks();
        return ResponseEntity.ok(tasks);
    }

    // Create new task (Admin only)
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Map<String, String> request, Authentication authentication) {
        String description = request.get("description");
        String assignedTo = request.get("assignedTo");
        String assignedBy = authentication.getName();

        Task task = taskService.assignTask(description, assignedTo, assignedBy);
        return ResponseEntity.ok(task);
    }

    // Update task status (Responder only)
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        Task task = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(task);
    }

    // Get task statistics (Admin only)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskService.TaskStatistics> getTaskStatistics() {
        TaskService.TaskStatistics stats = taskService.getTaskStatistics();
        return ResponseEntity.ok(stats);
    }

    // Get responder statistics (Responder only)
    @GetMapping("/my-statistics")
    @PreAuthorize("hasRole('RESPONDER')")
    public ResponseEntity<TaskService.ResponderStatistics> getMyStatistics(Authentication authentication) {
        String responderEmail = authentication.getName();
        TaskService.ResponderStatistics stats = taskService.getResponderStatistics(responderEmail);
        return ResponseEntity.ok(stats);
    }

    // Delete task (Admin only)
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Task deleted successfully");
        response.put("taskId", taskId.toString());

        return ResponseEntity.ok(response);
    }
}
