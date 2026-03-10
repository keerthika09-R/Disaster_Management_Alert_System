package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.RescueRequest;

public interface RescueRequestRepository extends JpaRepository<RescueRequest, Long> {

    List<RescueRequest> findByCitizenEmailOrderByCreatedAtDesc(String citizenEmail);

    List<RescueRequest> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    List<RescueRequest> findAllByOrderByCreatedAtDesc();
}
