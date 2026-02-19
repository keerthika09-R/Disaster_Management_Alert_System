package com.example.demo.service;

import com.example.demo.Entity.User;
import com.example.demo.Entity.UserProfile;
import com.example.demo.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository profileRepository;

    public UserProfileService(UserProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }


    // GET PROFILE
    public UserProfile getProfile(User user) {

        return profileRepository.findByUser(user)
                .orElseGet(() -> {

                    UserProfile profile = new UserProfile();

                    profile.setUser(user);
                    profile.setFullName("");
                    profile.setPhoneNumber("");
                    profile.setRegion("");
                    profile.setProfileImage("");

                    return profileRepository.save(profile);
                });
    }


    // UPDATE PROFILE
    public UserProfile updateProfile(User user, UserProfile updatedProfile) {

        UserProfile profile = profileRepository.findByUser(user)
                .orElse(new UserProfile());

        profile.setUser(user);

        profile.setFullName(updatedProfile.getFullName());

        profile.setPhoneNumber(updatedProfile.getPhoneNumber());

        profile.setRegion(updatedProfile.getRegion());

        profile.setProfileImage(updatedProfile.getProfileImage());

        return profileRepository.save(profile);
    }

}
