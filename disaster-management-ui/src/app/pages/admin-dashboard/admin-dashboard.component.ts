import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

import { MapComponent } from '../../shared/map.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RescueTaskService } from '../../core/services/rescue-task.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MapComponent, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  pendingDisasters: any[] = [];
  verifiedDisasters: any[] = [];
  resolvedDisasters: any[] = [];
  isSyncing = false;

  responders: any[] = [];
  assignModel = {
    disasterEventId: '',
    responderId: '',
    description: ''
  };

  constructor(
    private disasterService: DisasterService,
    private http: HttpClient,
    private rescueTaskService: RescueTaskService
  ) { }

  ngOnInit() {
    this.loadDisasters();
    this.loadResponders();
  }

  loadDisasters() {
    this.disasterService.getPending().subscribe((res: any) => this.pendingDisasters = res);
    this.disasterService.getVerified().subscribe((res: any) => this.verifiedDisasters = res);
    this.disasterService.getResolved().subscribe((res: any) => this.resolvedDisasters = res);
  }

  loadResponders() {
    this.http.get<any[]>('http://localhost:8082/api/users/responders').subscribe({
      next: (res) => this.responders = res,
      error: (err) => console.error('Failed to load responders', err)
    });
  }

  assignTask() {
    if (!this.assignModel.disasterEventId || !this.assignModel.responderId || !this.assignModel.description) {
      alert('Please fill out all fields for assignment');
      return;
    }

    this.rescueTaskService.assignTask(this.assignModel).subscribe({
      next: () => {
        alert('Task assigned to specific zone successfully!');
        this.assignModel = {
          disasterEventId: '',
          responderId: '',
          description: ''
        };
      },
      error: (err) => {
        console.error(err);
        alert('Failed to assign task');
      }
    });
  }

  assignTaskToDisaster(disaster: any) {
    if (!disaster.selectedResponder || !disaster.taskDescription) {
      alert('Please fill out responder and description');
      return;
    }

    const payload = {
      disasterEventId: disaster.id,
      responderId: disaster.selectedResponder,
      description: disaster.taskDescription
    };

    this.rescueTaskService.assignTask(payload).subscribe({
      next: () => {
        alert('Task assigned successfully!');
        disaster.showAssignForm = false;
        disaster.selectedResponder = null;
        disaster.taskDescription = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to assign task');
      }
    });
  }

  resolveDisaster(id: number) {
    this.disasterService.updateStatus(id, 'RESOLVED').subscribe(() => this.loadDisasters());
  }

  deleteDisaster(id: number) {
    if (confirm('Are you sure you want to delete this disaster event entirely? All related assigned tasks and incident reports will be lost.')) {
      this.disasterService.delete(id).subscribe(() => this.loadDisasters());
    }
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
}
