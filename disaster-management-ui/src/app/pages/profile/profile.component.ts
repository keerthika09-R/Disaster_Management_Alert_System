import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { NavbarComponent } from '../../shared/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],   
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};
  isUpdating: boolean = false;
  successMessage: string = '';

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        if (!this.profile.fullName && data.email) {
          this.profile.fullName = data.email.split('@')[0];
        }
      },
      error: (err) => console.error("Profile load failed", err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    this.isUpdating = true;
    this.successMessage = '';
    
    this.profileService.updateProfile(this.profile).subscribe({
      next: (res) => {
        this.isUpdating = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isUpdating = false;
        console.error("Update failed", err);
      }
    });
  }
}
