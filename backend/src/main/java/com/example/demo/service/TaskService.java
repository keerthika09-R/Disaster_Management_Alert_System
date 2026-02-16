package com.example.demo.service;

import com.example.demo.Entity.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    // Assign new task to responder
    public Task assignTask(String taskDescription, String assignedTo, String assignedBy) {
        // Validate that the assigned user exists and is a responder
        com.example.demo.Entity.User assignedUser = userRepository.findByEmail(assignedTo)
                .orElseThrow(() -> new RuntimeException("User with email " + assignedTo + " not found"));

        if (!"RESPONDER".equals(assignedUser.getRole().toString())) {
            throw new RuntimeException("User " + assignedTo + " is not a RESPONDER. Cannot assign task.");
        }

        // Generate unique task ID
        String taskId = "TASK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Task task = new Task(taskId, taskDescription, assignedTo, assignedBy);

        return taskRepository.save(task);
    }

    // Update task status
    public Task updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    // Get tasks assigned to specific responder
    public List<Task> getTasksForResponder(String responderEmail) {
        return taskRepository.findByAssignedTo(responderEmail);
    }

    // Get all tasks for admin
    public List<Task> getAllTasks() {
        return taskRepository.findAllTasksOrdered();
    }

    // Get pending tasks
    public List<Task> getPendingTasks() {
        return taskRepository.findPendingTasks();
    }

    // Get tasks created by admin
    public List<Task> getTasksByAdmin(String adminEmail) {
        return taskRepository.findByAssignedBy(adminEmail);
    }

    // Get task statistics
    public TaskStatistics getTaskStatistics() {
        TaskStatistics stats = new TaskStatistics();
        stats.setTotalTasks(taskRepository.count());
        stats.setPendingTasks(taskRepository.countByStatus("PENDING"));
        stats.setInProgressTasks(taskRepository.countByStatus("IN_PROGRESS"));
        stats.setCompletedTasks(taskRepository.countByStatus("COMPLETED"));
        return stats;
    }

    // Get responder statistics
    public ResponderStatistics getResponderStatistics(String responderEmail) {
        ResponderStatistics stats = new ResponderStatistics();
        stats.setTotalTasks(taskRepository.countByAssignedTo(responderEmail));
        stats.setPendingTasks((long) taskRepository.findByAssignedToAndStatus(responderEmail, "PENDING").size());
        stats.setInProgressTasks((long) taskRepository.findByAssignedToAndStatus(responderEmail, "IN_PROGRESS").size());
        stats.setCompletedTasks((long) taskRepository.findByAssignedToAndStatus(responderEmail, "COMPLETED").size());
        return stats;
    }

    // Delete task
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    // Inner classes for statistics
    public static class TaskStatistics {
        private Long totalTasks;
        private Long pendingTasks;
        private Long inProgressTasks;
        private Long completedTasks;

        // Getters and Setters
        public Long getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(Long totalTasks) {
            this.totalTasks = totalTasks;
        }

        public Long getPendingTasks() {
            return pendingTasks;
        }

        public void setPendingTasks(Long pendingTasks) {
            this.pendingTasks = pendingTasks;
        }

        public Long getInProgressTasks() {
            return inProgressTasks;
        }

        public void setInProgressTasks(Long inProgressTasks) {
            this.inProgressTasks = inProgressTasks;
        }

        public Long getCompletedTasks() {
            return completedTasks;
        }

        public void setCompletedTasks(Long completedTasks) {
            this.completedTasks = completedTasks;
        }
    }

    public static class ResponderStatistics {
        private Long totalTasks;
        private Long pendingTasks;
        private Long inProgressTasks;
        private Long completedTasks;

        // Getters and Setters
        public Long getTotalTasks() {
            return totalTasks;
        }

        public void setTotalTasks(Long totalTasks) {
            this.totalTasks = totalTasks;
        }

        public Long getPendingTasks() {
            return pendingTasks;
        }

        public void setPendingTasks(Long pendingTasks) {
            this.pendingTasks = pendingTasks;
        }

        public Long getInProgressTasks() {
            return inProgressTasks;
        }

        public void setInProgressTasks(Long inProgressTasks) {
            this.inProgressTasks = inProgressTasks;
        }

        public Long getCompletedTasks() {
            return completedTasks;
        }

        public void setCompletedTasks(Long completedTasks) {
            this.completedTasks = completedTasks;
        }
    }
}
