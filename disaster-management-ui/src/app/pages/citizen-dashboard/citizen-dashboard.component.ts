import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { RescueRequestService } from '../../core/services/rescue-request.service';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css']
})
export class CitizenDashboardComponent implements OnInit, OnDestroy {

  activeAlerts: any[] = [];
  myRescueRequests: any[] = [];
  showRescueForm = false;
  showToast = false;
  private refreshTimer: any;
  formMessage = '';
  formError = '';
  isSubmitting = false;
  rescueForm = {
    location: '',
    emergencyType: 'Medical Emergency',
    description: '',
    numberOfPeople: 1,
    requiredResponders: 1
  };

  constructor(
    private disasterService: DisasterService,
    private rescueRequestService: RescueRequestService
  ) { }

  ngOnInit() {
    this.loadAlerts();
    this.loadMyRequests();
    this.refreshTimer = setInterval(() => this.loadMyRequests(), 10000);
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
    this.formMessage = '';
    this.formError = '';
  }

  submitRescueRequest() {
    this.isSubmitting = true;
    this.formMessage = '';
    this.formError = '';

    this.rescueRequestService.createRequest(this.rescueForm).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formMessage = 'Emergency rescue request submitted.';
        this.showRescueForm = false;
        this.rescueForm = {
          location: '',
          emergencyType: 'Medical Emergency',
          description: '',
          numberOfPeople: 1,
          requiredResponders: 1
        };
        this.loadMyRequests();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err?.error?.message || 'Failed to submit rescue request.';
      }
    });
  }

  loadMyRequests() {
    this.rescueRequestService.getMyRequests().subscribe({
      next: (res: any) => {
        this.myRescueRequests = res || [];
      },
      error: () => {
        this.myRescueRequests = [];
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
