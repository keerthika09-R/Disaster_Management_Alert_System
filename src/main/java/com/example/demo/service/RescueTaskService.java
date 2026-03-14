package com.example.demo.service;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.RescueTask;
import com.example.demo.Entity.User;
import com.example.demo.dto.RescueTaskDTO;
import com.example.demo.repository.DisasterRepository;
import com.example.demo.repository.RescueTaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RescueTaskService {

    @Autowired
    private RescueTaskRepository rescueTaskRepository;

    @Autowired
    private DisasterRepository disasterRepository;

    @Autowired
    private UserRepository userRepository;

    public RescueTask assignTask(RescueTaskDTO dto) {
        RescueTask task = new RescueTask();

        DisasterEvent event = disasterRepository.findById(dto.getDisasterEventId())
                .orElseThrow(() -> new RuntimeException("Disaster not found"));
        User responder = userRepository.findById(dto.getResponderId())
                .orElseThrow(() -> new RuntimeException("Responder not found"));

        task.setDisasterEvent(event);
        task.setResponder(responder);
        task.setDescription(dto.getDescription());
        task.setStatus("PENDING");

        return rescueTaskRepository.save(task);
    }

    public List<RescueTask> getTasksByResponder(Long responderId) {
        return rescueTaskRepository.findByResponderId(responderId);
    }

    public RescueTask getTaskById(Long taskId) {
        return rescueTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public List<RescueTask> getTasksByDisasterEvent(Long disasterEventId) {
        return rescueTaskRepository.findByDisasterEventId(disasterEventId);
    }

    public List<RescueTask> getAllTasks() {
        return rescueTaskRepository.findAll();
    }

    public RescueTask updateTaskStatus(Long taskId, String status) {
        RescueTask task = rescueTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return rescueTaskRepository.save(task);
    }
}
