package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.RescueTask;

public interface RescueTaskRepository extends JpaRepository<RescueTask, Long> {

    List<RescueTask> findAllByOrderByUpdatedAtDesc();

    List<RescueTask> findByAssignedResponderEmailOrderByUpdatedAtDesc(String assignedResponderEmail);

    List<RescueTask> findByZoneOrderByUpdatedAtDesc(String zone);

    List<RescueTask> findByDisasterIdOrderByUpdatedAtDesc(Long disasterId);
}
