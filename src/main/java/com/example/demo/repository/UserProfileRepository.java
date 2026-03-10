package com.example.demo.repository;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserProfileRepository
        extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUser(User user);

    List<UserProfile> findByRegionContainingIgnoreCase(String region);

}
