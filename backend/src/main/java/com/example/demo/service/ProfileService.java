package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.repository.UserProfileRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    private final UserProfileRepository userProfileRepository;

    public ProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile saveProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }

    public Optional<UserProfile> getProfileByUser(User user) {
        return userProfileRepository.findByUser(user);
    }

    public List<UserProfile> getProfilesByRegion(String region) {
        return userProfileRepository.findByRegion(region);
    }

    public Optional<UserProfile> getProfileById(Long id) {
        return userProfileRepository.findById(id);
    }

    public void deleteProfile(Long id) {
        userProfileRepository.deleteById(id);
    }

    public List<UserProfile> getAllProfiles() {
        return userProfileRepository.findAll();
    }

    public List<UserProfile> getProfilesByRole(String role) {
        return userProfileRepository.findByUser_Role(role);
    }

    public List<UserProfile> getProfilesByRoleAndRegion(String role, String region) {
        return userProfileRepository.findByUser_RoleAndRegion(role, region);
    }
}
