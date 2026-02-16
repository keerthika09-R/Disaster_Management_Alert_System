package com.example.demo.repository;

import com.example.demo.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Find tasks assigned to a specific responder
    List<Task> findByAssignedTo(String assignedTo);
    
    // Find tasks created by a specific admin
    List<Task> findByAssignedBy(String assignedBy);
    
    // Find tasks by status
    List<Task> findByStatus(String status);
    
    // Find tasks assigned to responder with specific status
    List<Task> findByAssignedToAndStatus(String assignedTo, String status);
    
    // Find all pending tasks
    @Query("SELECT t FROM Task t WHERE t.status = 'PENDING' ORDER BY t.createdAt DESC")
    List<Task> findPendingTasks();
    
    // Find all tasks for admin dashboard
    @Query("SELECT t FROM Task t ORDER BY t.createdAt DESC")
    List<Task> findAllTasksOrdered();
    
    // Count tasks by status
    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    Long countByStatus(@Param("status") String status);
    
    // Count tasks assigned to responder
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo = :assignedTo")
    Long countByAssignedTo(@Param("assignedTo") String assignedTo);
}
