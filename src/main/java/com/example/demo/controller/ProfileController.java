package com.example.demo.controller;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.dto.ProfileResponse;
import com.example.demo.service.UserProfileService;
import com.example.demo.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserService userService;
    private final UserProfileService profileService;

    public ProfileController(UserService userService,
                             UserProfileService profileService) {

        this.userService = userService;
        this.profileService = profileService;
    }


    // GET PROFILE
    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {

        String email = authentication.getName();

        User user = userService.findByEmail(email).orElseThrow();

        UserProfile profile = profileService.getProfile(user);

        return new ProfileResponse(
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getRegion(),
                profile.getProfileImage(),
                user.getEmail(),
                user.getRole()
        );
    }


    // UPDATE PROFILE
    @PutMapping
    public UserProfile updateProfile(
            Authentication authentication,
            @RequestBody UserProfile updatedProfile) {

        String email = authentication.getName();

        User user = userService.findByEmail(email).orElseThrow();

        return profileService.updateProfile(user, updatedProfile);
    }

}
