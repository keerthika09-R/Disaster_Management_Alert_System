package com.example.demo.repository;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUser(User user);

    List<UserProfile> findByRegion(String region);

    boolean existsByUser(User user);

    List<UserProfile> findByUser_Role(String role);

    List<UserProfile> findByUser_RoleAndRegion(String role, String region);

    // Region-based queries for country+state matching
    List<UserProfile> findByCountryAndState(String country, String state);

    List<UserProfile> findByUser_RoleAndCountryAndState(String role, String country, String state);
}
