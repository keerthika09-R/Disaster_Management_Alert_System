package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.example.demo.Entity.AlertAcknowledgment;

public interface AlertAcknowledgmentRepository
        extends JpaRepository<AlertAcknowledgment, Long> {

    List<AlertAcknowledgment> findByDisasterId(Long disasterId);

    boolean existsByDisasterIdAndResponderEmail(Long disasterId, String responderEmail);

    List<AlertAcknowledgment> findByResponderEmail(String responderEmail);

}
