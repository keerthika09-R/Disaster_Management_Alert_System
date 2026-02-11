package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.ProfileRequest;
import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.service.ProfileService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService,
                             UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<UserProfile> createProfile(
            @PathVariable Long userId,
            @RequestBody ProfileRequest request) {

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = new UserProfile();
        profile.setFullName(request.getFullName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setRegion(request.getRegion());
        profile.setUser(user);

        return ResponseEntity.ok(profileService.saveProfile(profile));
    }
}
