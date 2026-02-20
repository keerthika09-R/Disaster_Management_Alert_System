package com.example.demo.repository;

import com.example.demo.Entity.DisasterEvent;
import com.example.demo.Entity.DisasterType;
import com.example.demo.Entity.EventStatus;
import com.example.demo.Entity.SeverityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DisasterEventRepository extends JpaRepository<DisasterEvent, Long> {

        List<DisasterEvent> findByStatus(EventStatus status);

        List<DisasterEvent> findByStatusOrderByEventTimeDesc(EventStatus status);

        List<DisasterEvent> findByDisasterTypeAndStatus(DisasterType type, EventStatus status);

        List<DisasterEvent> findBySeverityAndStatus(SeverityLevel severity, EventStatus status);

        List<DisasterEvent> findByLocationNameContainingIgnoreCaseAndStatus(String location, EventStatus status);

        @Query("SELECT d FROM DisasterEvent d WHERE d.status = :status " +
                        "AND (:type IS NULL OR d.disasterType = :type) " +
                        "AND (:severity IS NULL OR d.severity = :severity) " +
                        "AND (:location IS NULL OR LOWER(d.locationName) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                        "AND (:startDate IS NULL OR d.eventTime >= :startDate) " +
                        "AND (:endDate IS NULL OR d.eventTime <= :endDate) " +
                        "ORDER BY d.eventTime DESC")
        List<DisasterEvent> findWithFilters(
                        @Param("status") EventStatus status,
                        @Param("type") DisasterType type,
                        @Param("severity") SeverityLevel severity,
                        @Param("location") String location,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        List<DisasterEvent> findByStatusOrderByCreatedAtDesc(EventStatus status);

        @Query("SELECT COUNT(d) FROM DisasterEvent d WHERE d.status = :status")
        long countByStatus(@Param("status") EventStatus status);

        @Query("SELECT d.disasterType, COUNT(d) FROM DisasterEvent d WHERE d.status = 'VERIFIED' GROUP BY d.disasterType")
        List<Object[]> countByDisasterType();

        @Query("SELECT d.severity, COUNT(d) FROM DisasterEvent d WHERE d.status = 'VERIFIED' GROUP BY d.severity")
        List<Object[]> countBySeverity();

        List<DisasterEvent> findBySourceAndTitleAndEventTime(String source, String title, LocalDateTime eventTime);

        List<DisasterEvent> findAllByOrderByCreatedAtDesc();

        // Region-based queries for country+state matching
        List<DisasterEvent> findByStatusAndCountryAndStateOrderByEventTimeDesc(
                        EventStatus status, String country, String state);
}
