package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.ProfileRequest;
import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.service.ProfileService;
import com.example.demo.service.UserService;

import java.util.List;

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

        @PostMapping("/create")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<UserProfile> createProfile(
                        Authentication authentication,
                        @RequestBody ProfileRequest request) {

                String userEmail = authentication.getName();
                User user = userService.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserProfile profile = new UserProfile();
                profile.setFullName(request.getFullName());
                profile.setPhoneNumber(request.getPhoneNumber());
                profile.setRegion(request.getRegion());
                profile.setUser(user);

                return ResponseEntity.ok(profileService.saveProfile(profile));
        }

        @GetMapping("/my")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<UserProfile> getMyProfile(Authentication authentication) {
                String userEmail = authentication.getName();
                User user = userService.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(profileService.getProfileByUser(user)
                                .orElseThrow(() -> new RuntimeException("Profile not found")));
        }

        @GetMapping("/user/{userId}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long userId) {
                User user = userService.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(profileService.getProfileByUser(user)
                                .orElseThrow(() -> new RuntimeException("Profile not found")));
        }

        @GetMapping("/region/{region}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<UserProfile>> getProfilesByRegion(@PathVariable String region) {
                return ResponseEntity.ok(profileService.getProfilesByRegion(region));
        }

        @GetMapping("/role/{role}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<UserProfile>> getProfilesByRole(@PathVariable String role) {
                return ResponseEntity.ok(profileService.getProfilesByRole(role));
        }

        @GetMapping("/role/{role}/region/{region}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<UserProfile>> getProfilesByRoleAndRegion(
                        @PathVariable String role,
                        @PathVariable String region) {
                return ResponseEntity.ok(profileService.getProfilesByRoleAndRegion(role, region));
        }

        @PutMapping("/update")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<UserProfile> updateProfile(
                        Authentication authentication,
                        @RequestBody ProfileRequest request) {

                String userEmail = authentication.getName();
                User user = userService.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserProfile profile = profileService.getProfileByUser(user)
                                .orElseThrow(() -> new RuntimeException("Profile not found"));

                profile.setFullName(request.getFullName());
                profile.setPhoneNumber(request.getPhoneNumber());
                profile.setRegion(request.getRegion());

                return ResponseEntity.ok(profileService.saveProfile(profile));
        }

        @DeleteMapping("/delete")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<String> deleteProfile(Authentication authentication) {
                String userEmail = authentication.getName();
                User user = userService.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserProfile profile = profileService.getProfileByUser(user)
                                .orElseThrow(() -> new RuntimeException("Profile not found"));

                profileService.deleteProfile(profile.getId());
                return ResponseEntity.ok("Profile deleted successfully");
        }
}
