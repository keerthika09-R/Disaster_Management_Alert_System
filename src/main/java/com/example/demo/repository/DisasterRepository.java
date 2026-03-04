package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.example.demo.Entity.DisasterEvent;

public interface DisasterRepository extends JpaRepository<DisasterEvent, Long> {

    List<DisasterEvent> findByStatus(String status);

}