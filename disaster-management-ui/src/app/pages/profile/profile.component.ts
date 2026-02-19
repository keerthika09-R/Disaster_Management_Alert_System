import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileService } from '../../core/services/profile.service';
import { NavbarComponent } from '../../shared/navbar.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],   
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {};

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({

      next: (data) => {
        this.profile = data;
        console.log("PROFILE:", data);
      },

      error: (err) => {
        console.error("Profile load failed", err);
      }

    });
  }

}
