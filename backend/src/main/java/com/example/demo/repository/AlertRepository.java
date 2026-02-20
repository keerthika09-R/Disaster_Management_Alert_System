package com.example.demo.repository;

import com.example.demo.Entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByRegion(String region);

    List<Alert> findByCountryAndStateOrderByCreatedAtDesc(String country, String state);

    List<Alert> findAllByOrderByCreatedAtDesc();
}
