import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProfileService } from '../../core/services/profile.service';
import { NavbarComponent } from '../../shared/navbar.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};
  editableProfile: any = {};
  isEditing = false;
  isSaving = false;
  message = '';
  errorMessage = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({

      next: (data) => {
        this.profile = data;
        this.editableProfile = {
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          region: data.region || '',
          profileImage: data.profileImage || ''
        };
        console.log("PROFILE:", data);
      },

      error: (err) => {
        console.error("Profile load failed", err);
      }

    });
  }

  startEditing() {
    this.message = '';
    this.errorMessage = '';
    this.isEditing = true;
    this.editableProfile = {
      fullName: this.profile.fullName || '',
      phoneNumber: this.profile.phoneNumber || '',
      region: this.profile.region || '',
      profileImage: this.profile.profileImage || ''
    };
  }

  cancelEditing() {
    this.isEditing = false;
    this.message = '';
    this.errorMessage = '';
  }

  saveProfile() {
    this.isSaving = true;
    this.message = '';
    this.errorMessage = '';

    this.profileService.updateProfile(this.editableProfile).subscribe({
      next: (updatedProfile) => {
        this.profile = {
          ...this.profile,
          ...updatedProfile
        };
        this.editableProfile = {
          fullName: updatedProfile.fullName || '',
          phoneNumber: updatedProfile.phoneNumber || '',
          region: updatedProfile.region || '',
          profileImage: updatedProfile.profileImage || ''
        };
        this.isSaving = false;
        this.isEditing = false;
        this.message = 'Profile updated successfully.';
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Profile update failed.';
        console.error('Profile update failed', err);
      }
    });
  }

}
