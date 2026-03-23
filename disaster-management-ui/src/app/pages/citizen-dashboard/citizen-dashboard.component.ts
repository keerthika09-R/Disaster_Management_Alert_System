import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { TokenService } from '../../core/services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css']
})
export class CitizenDashboardComponent implements OnInit {

  activeAlerts: any[] = [];
  showToast = false;
  activeTab = 'alerts';
  
  rescueModel = {
    location: '',
    type: 'Trapped in Flood',
    people: 1
  };

  constructor(
    private disasterService: DisasterService,
    private tokenService: TokenService
  ) { }

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.disasterService.getVerified().subscribe((res: any) => {
      this.activeAlerts = res;
      if (this.activeAlerts.length > 0) {
        this.triggerEmergencyToast();
      }
    });
  }

  triggerEmergencyToast() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  submitRescueRequest() {
    if (!this.rescueModel.location) {
      alert("Please provide your location details.");
      return;
    }
    
    const requestData = {
      citizenEmail: this.tokenService.getEmail() || 'anonymous@citizen.com',
      location: this.rescueModel.location,
      description: `Emergency Type: ${this.rescueModel.type}. People affected: ${this.rescueModel.people}.`
    };

    this.disasterService.submitHelpRequest(requestData).subscribe({
      next: (res) => {
        alert("Emergency Rescue Request Submitted Successfully! Authorities are reviewing it for assignment.");
        this.rescueModel.location = '';
        this.rescueModel.people = 1;
      },
      error: (err) => {
        console.error("Failed to submit request", err);
        alert("Failed to submit emergency request.");
      }
    });
  }
}
