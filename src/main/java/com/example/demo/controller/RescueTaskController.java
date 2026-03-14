package com.example.demo.controller;

import com.example.demo.Entity.RescueTask;
import com.example.demo.dto.RescueTaskDTO;
import com.example.demo.service.RescueTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class RescueTaskController {

    @Autowired
    private RescueTaskService rescueTaskService;

    @PostMapping("/assign")
    public RescueTask assignTask(@RequestBody RescueTaskDTO dto) {
        return rescueTaskService.assignTask(dto);
    }

    @GetMapping("/all")
    public List<RescueTask> getAllTasks() {
        return rescueTaskService.getAllTasks();
    }

    @GetMapping("/responder/{responderId}")
    public List<RescueTask> getTasksByResponder(@PathVariable Long responderId) {
        return rescueTaskService.getTasksByResponder(responderId);
    }

    @GetMapping("/{taskId}")
    public RescueTask getTaskById(@PathVariable Long taskId) {
        return rescueTaskService.getTaskById(taskId);
    }

    @GetMapping("/disaster/{disasterEventId}")
    public List<RescueTask> getTasksByDisasterEvent(@PathVariable Long disasterEventId) {
        return rescueTaskService.getTasksByDisasterEvent(disasterEventId);
    }

    @PutMapping("/{taskId}/status")
    public RescueTask updateTaskStatus(@PathVariable Long taskId, @RequestParam String status) {
        return rescueTaskService.updateTaskStatus(taskId, status);
    }
}
