import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { RescueTaskService } from '../../core/services/rescue-task.service';

@Component({
  selector: 'app-admin-alert-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './admin-alert-detail.component.html',
  styleUrls: ['./admin-alert-detail.component.css']
})
export class AdminAlertDetailComponent implements OnInit {

  disaster: any = null;
  acknowledgments: any[] = [];
  tasks: any[] = [];
  respondersForZone: any[] = [];
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

  constructor(
    private route: ActivatedRoute,
    private disasterService: DisasterService,
    private rescueTaskService: RescueTaskService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(id)) {
      this.loadAlertDetail(id);
    }
  }

  loadAlertDetail(id: number) {
    this.disasterService.getById(id).subscribe((res: any) => {
      this.disaster = res;
      this.assignmentForm = {
        disasterId: res.id,
        rescueRequestId: null,
        zone: res.location || '',
        assignedResponderEmail: '',
        title: `${res.disasterType || 'Emergency'} response`,
        description: res.description || '',
        priority: (res.severity || 'MEDIUM').toUpperCase()
      };
      this.onZoneChange();
    });

    this.disasterService.getAcknowledgmentsByDisaster(id).subscribe((res: any) => {
      this.acknowledgments = res || [];
    });

    this.loadTasks(id);
  }

  loadTasks(id: number) {
    this.rescueTaskService.getTasksByDisaster(id).subscribe((res: any) => {
      this.tasks = res || [];
    });
  }

  onZoneChange() {
    const zone = this.assignmentForm.zone?.trim();
    this.assignmentForm.assignedResponderEmail = '';
    this.respondersForZone = [];

    if (!zone) {
      return;
    }

    this.rescueTaskService.getRespondersByZone(zone).subscribe((res: any) => {
      this.respondersForZone = res || [];
    });
  }

  assignTask() {
    this.taskMessage = '';
    this.taskError = '';

    this.rescueTaskService.assignTask(this.assignmentForm).subscribe({
      next: () => {
        this.taskMessage = 'Task assigned successfully.';
        this.loadTasks(this.assignmentForm.disasterId as number);
      },
      error: (err) => {
        this.taskError = err?.error?.message || 'Task assignment failed.';
      }
    });
  }
}
