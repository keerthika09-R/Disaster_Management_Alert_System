package com.example.demo.repository;

import com.example.demo.Entity.AlertAcknowledgment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertAcknowledgmentRepository extends JpaRepository<AlertAcknowledgment, Long> {

    List<AlertAcknowledgment> findByDisasterId(Long disasterId);

    List<AlertAcknowledgment> findByResponderId(Long responderId);

    boolean existsByDisasterIdAndResponderId(Long disasterId, Long responderId);
}
