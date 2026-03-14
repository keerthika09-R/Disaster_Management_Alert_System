import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css']
})
export class CitizenDashboardComponent implements OnInit {

  activeAlerts: any[] = [];
  showRescueForm = false;
  showToast = false;

  constructor(private disasterService: DisasterService) { }

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

  toggleRescueForm() {
    this.showRescueForm = !this.showRescueForm;
  }

  submitRescueRequest() {
    // In a complete app, we'd grab values from a form. Sending a dummy for demo.
    const requestData = {
      citizenEmail: 'citizen@example.com',
      location: 'Current GPS Location',
      description: 'Emergency Rescue Needed!'
    };

    this.disasterService.submitHelpRequest(requestData).subscribe({
      next: (res) => {
        alert("Emergency Rescue Request Submitted Successfully! A responder has been assigned.");
        this.showRescueForm = false;
      },
      error: (err) => {
        console.error("Failed to submit request", err);
        alert("Failed to submit emergency request.");
      }
    });
  }
}
