import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { RescueRequestService } from '../../core/services/rescue-request.service';
import { RescueTaskService } from '../../core/services/rescue-task.service';

@Component({
  selector: 'app-responder-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './responder-dashboard.component.html',
  styleUrls: ['./responder-dashboard.component.css']
})
export class ResponderDashboardComponent implements OnInit, OnDestroy {

  assignedTasks: any[] = [];
  acknowledgedIds: number[] = [];
  availableRequests: any[] = [];
  myOperationalTasks: any[] = [];
  private refreshTimer: any;

  constructor(
    private disasterService: DisasterService,
    private rescueRequestService: RescueRequestService,
    private rescueTaskService: RescueTaskService
  ) { }

  ngOnInit() {
    this.loadAcknowledgedTasks();
    this.loadTasks();
    this.loadAvailableRequests();
    this.loadMyOperationalTasks();
    this.refreshTimer = setInterval(() => {
      this.loadAvailableRequests();
    }, 10000);
  }

  loadTasks() {
    // Responders view verified (broadcasted) disasters as their potential tasks
    this.disasterService.getVerified().subscribe((res: any) => {
      this.assignedTasks = (res || []).map((task: any) => ({
        ...task,
        type: task.type || task.disasterType || 'Alert',
        location: task.location || task.city || task.state || task.country || 'Location unavailable',
        description: task.description || task.title || 'No alert details available.',
        severity: task.severity || 'High',
        date: task.date || 'Just Now'
      }));
    });
  }

  acknowledgeTask(id: number) {
    if (this.acknowledgedIds.includes(id)) {
      return;
    }

    this.disasterService.acknowledgeAlert(id).subscribe({
      next: () => {
        this.acknowledgedIds.push(id);
        alert("Task acknowledged. Admin can now see your acceptance.");
      },
      error: () => {
        alert("Failed to acknowledge task.");
      }
    });
  }

  isAcknowledged(id: number): boolean {
    return this.acknowledgedIds.includes(id);
  }

  loadAcknowledgedTasks() {
    this.disasterService.getMyAcknowledgments().subscribe({
      next: (res: any) => {
        this.acknowledgedIds = (res || []).map((ack: any) => ack.disasterId);
      },
      error: () => {
        this.acknowledgedIds = [];
      }
    });
  }

  loadAvailableRequests() {
    this.rescueRequestService.getAvailableRequests().subscribe({
      next: (res: any) => {
        this.availableRequests = res || [];
      },
      error: () => {
        this.availableRequests = [];
      }
    });
  }

  acceptRescueRequest(id: number) {
    this.rescueRequestService.acceptRequest(id).subscribe({
      next: () => {
        this.loadAvailableRequests();
        this.loadMyOperationalTasks();
      },
      error: () => {
        alert('This rescue request is no longer available.');
        this.loadAvailableRequests();
      }
    });
  }

  loadMyOperationalTasks() {
    this.rescueTaskService.getMyTasks().subscribe({
      next: (res: any) => {
        this.myOperationalTasks = (res || []).map((task: any) => ({
          ...task,
          nextStatus: task.status,
          nextProgressNote: task.progressNote || ''
        }));
      },
      error: () => {
        this.myOperationalTasks = [];
      }
    });
  }

  updateOperationalTask(task: any) {
    this.rescueTaskService.updateTask(task.id, {
      status: task.nextStatus,
      progressNote: task.nextProgressNote
    }).subscribe({
      next: () => {
        this.loadMyOperationalTasks();
      },
      error: () => {
        alert('Failed to update task progress.');
      }
    });
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

}
