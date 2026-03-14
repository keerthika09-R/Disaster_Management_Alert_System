package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.Entity.HelpRequest;

import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
    List<HelpRequest> findByAssignedResponderEmail(String email);

    List<HelpRequest> findByStatus(String status);
}
