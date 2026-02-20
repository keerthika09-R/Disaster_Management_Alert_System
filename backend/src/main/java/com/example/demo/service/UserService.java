package com.example.demo.service;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Get all users with their profiles
    public List<Map<String, Object>> getAllUsersWithProfiles() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());

            // Try to get user profile
            Optional<UserProfile> profile = userProfileRepository.findByUser(user);
            if (profile.isPresent()) {
                UserProfile p = profile.get();
                userMap.put("fullName", p.getFullName());
                userMap.put("phoneNumber", p.getPhoneNumber());
                userMap.put("country", p.getCountry());
                userMap.put("state", p.getState());
                userMap.put("city", p.getCity());
                userMap.put("region", p.getRegion());
            } else {
                userMap.put("fullName", null);
                userMap.put("phoneNumber", null);
                userMap.put("country", null);
                userMap.put("state", null);
                userMap.put("city", null);
                userMap.put("region", null);
            }

            result.add(userMap);
        }

        return result;
    }

    // Get user with profile by email
    public Map<String, Object> getUserWithProfile(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            return null;
        }

        Map<String, Object> userMap = new HashMap<>();
        User u = user.get();
        userMap.put("id", u.getId());
        userMap.put("email", u.getEmail());
        userMap.put("role", u.getRole());

        // Get user profile
        Optional<UserProfile> profile = userProfileRepository.findByUser(u);
        if (profile.isPresent()) {
            UserProfile p = profile.get();
            userMap.put("fullName", p.getFullName());
            userMap.put("phoneNumber", p.getPhoneNumber());
            userMap.put("country", p.getCountry());
            userMap.put("state", p.getState());
            userMap.put("city", p.getCity());
            userMap.put("region", p.getRegion());
        }

        return userMap;
    }

    // Get all unique locations
    public List<String> getAllLocations() {
        List<UserProfile> profiles = userProfileRepository.findAll();
        Set<String> locations = profiles.stream()
                .map(UserProfile::getRegion)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return new ArrayList<>(locations);
    }

    // Get users by location
    public List<Map<String, Object>> getUsersByLocation(String location) {
        List<UserProfile> profiles = userProfileRepository.findByRegion(location);
        List<Map<String, Object>> result = new ArrayList<>();

        for (UserProfile profile : profiles) {
            User user = profile.getUser();
            if (user != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole());
                userMap.put("fullName", profile.getFullName());
                userMap.put("phoneNumber", profile.getPhoneNumber());
                userMap.put("region", profile.getRegion());
                result.add(userMap);
            }
        }

        return result;
    }
}
