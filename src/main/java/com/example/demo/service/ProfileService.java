package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.Entity.UserProfile;
import com.example.demo.repository.UserProfileRepository;

@Service
public class ProfileService {

    private final UserProfileRepository userProfileRepository;

    public ProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile saveProfile(UserProfile profile) {
        return userProfileRepository.save(profile);
    }
}
