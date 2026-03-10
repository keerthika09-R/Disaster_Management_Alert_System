import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { RescueRequestService } from '../../core/services/rescue-request.service';
import { RescueTaskService } from '../../core/services/rescue-task.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  pendingDisasters: any[] = [];
  verifiedDisasters: any[] = [];
  rescueRequests: any[] = [];
  assignedTasks: any[] = [];
  respondersForZone: any[] = [];
  isSyncing = false;
  taskMessage = '';
  taskError = '';
  assignmentForm = {
    disasterId: null as number | null,
    rescueRequestId: null as number | null,
    zone: '',
    assignedResponderEmail: '',
    title: '',
    description: '',
    priority: 'MEDIUM'
  };
  private refreshTimer: any;

  constructor(
    private router: Router,
    private disasterService: DisasterService,
    private rescueRequestService: RescueRequestService,
    private rescueTaskService: RescueTaskService
  ) { }

  ngOnInit() {
    this.loadDisasters();
    this.loadRescueRequests();
    this.loadAssignedTasks();
    this.refreshTimer = setInterval(() => this.loadRescueRequests(), 10000);
  }

  loadDisasters() {
    this.disasterService.getPending().subscribe((res: any) => {
      this.pendingDisasters = res || [];
    });

    this.disasterService.getVerified().subscribe((res: any) => {
      const verified = res || [];

      this.disasterService.getAcknowledgments().subscribe({
        next: (acks: any) => {
          const acknowledgments = acks || [];
          this.verifiedDisasters = verified.map((disaster: any) => ({
            ...disaster,
            acknowledgments: acknowledgments.filter((ack: any) => ack.disasterId === disaster.id)
          }));
        },
        error: () => {
          this.verifiedDisasters = verified.map((disaster: any) => ({
            ...disaster,
            acknowledgments: []
          }));
        }
      });
    });
  }

  syncAPI() {
    this.isSyncing = true;
    this.disasterService.sync().subscribe({
      next: () => {
        this.isSyncing = false;
        this.loadDisasters();
      },
      error: () => {
        this.isSyncing = false;
        alert("Sync failed. Check backend.");
      }
    });
  }

  approveDisaster(id: number) {
    this.disasterService.approve(id).subscribe(() => this.loadDisasters());
  }

  rejectDisaster(id: number) {
    this.disasterService.reject(id).subscribe(() => this.loadDisasters());
  }

  loadRescueRequests() {
    this.rescueRequestService.getAllRequests().subscribe({
      next: (res: any) => {
        this.rescueRequests = res || [];
      },
      error: () => {
        this.rescueRequests = [];
      }
    });
  }

  loadAssignedTasks() {
    this.rescueTaskService.getAllTasks().subscribe({
      next: (res: any) => {
        this.assignedTasks = res || [];
      },
      error: () => {
        this.assignedTasks = [];
      }
    });
  }

  onZoneChange() {
    const zone = this.assignmentForm.zone?.trim();
    this.assignmentForm.assignedResponderEmail = '';
    this.respondersForZone = [];

    if (!zone) {
      return;
    }

    this.rescueTaskService.getRespondersByZone(zone).subscribe({
      next: (res: any) => {
        this.respondersForZone = res || [];
      },
      error: () => {
        this.respondersForZone = [];
      }
    });
  }

  viewAlertDetails(disaster: any) {
    this.router.navigate(['/admin/alerts', disaster.id]);
  }

  prepareTaskForRequest(request: any) {
    this.taskMessage = '';
    this.taskError = '';
    this.assignmentForm = {
      disasterId: null,
      rescueRequestId: request.id,
      zone: request.location || '',
      assignedResponderEmail: '',
      title: `${request.emergencyType || 'Rescue'} support`,
      description: request.description || '',
      priority: 'HIGH'
    };
    this.onZoneChange();
  }

  assignTask() {
    this.taskMessage = '';
    this.taskError = '';

    this.rescueTaskService.assignTask(this.assignmentForm).subscribe({
      next: () => {
        this.taskMessage = 'Task assigned successfully.';
        this.loadAssignedTasks();
      },
      error: (err) => {
        this.taskError = err?.error?.message || 'Task assignment failed.';
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
