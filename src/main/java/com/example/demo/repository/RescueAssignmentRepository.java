package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Entity.RescueAssignment;

public interface RescueAssignmentRepository extends JpaRepository<RescueAssignment, Long> {

    List<RescueAssignment> findByRescueRequestId(Long rescueRequestId);

    boolean existsByRescueRequestIdAndResponderEmail(Long rescueRequestId, String responderEmail);
}
