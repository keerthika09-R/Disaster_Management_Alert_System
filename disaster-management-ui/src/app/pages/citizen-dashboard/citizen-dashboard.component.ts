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
    alert("Emergency Rescue Request Submitted Successfully!");
    this.showRescueForm = false;
  }
}
