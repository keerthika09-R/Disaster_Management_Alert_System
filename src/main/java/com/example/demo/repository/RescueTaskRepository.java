package com.example.demo.repository;

import com.example.demo.Entity.RescueTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueTaskRepository extends JpaRepository<RescueTask, Long> {
    List<RescueTask> findByResponderId(Long responderId);

    List<RescueTask> findByDisasterEventId(Long disasterEventId);
}
