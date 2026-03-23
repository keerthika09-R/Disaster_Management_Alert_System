import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { MapComponent } from '../../shared/map.component';
import { FormsModule } from '@angular/forms';
import { RescueTaskService } from '../../core/services/rescue-task.service';
import { IncidentReportService } from '../../core/services/incident-report.service';
import { UserService } from '../../core/services/user.service'; // Added UserService

export interface AnalyticsData {
  totalFloods: number;
  totalFires: number;
  avgResponseTimeMinutes: number;
  totalRespondersDeployed: number;
  alertsByRegion: { [key: string]: number };
  alertsBroadcasted: number;
  alertsAcknowledged: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MapComponent, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  pendingDisasters: any[] = [];
  verifiedDisasters: any[] = [];
  resolvedDisasters: any[] = [];
  allTasks: any[] = [];
  helpRequests: any[] = [];
  responders: any[] = []; // Moved and kept
  allReports: any[] = []; // Kept from original

  showAssignModal = false; // Added
  selectedDisaster: any = null; // Added
  isSyncing = false;

  analyticsData: AnalyticsData | null = null;
  pollingInterval: any;
  activeTab: string = 'pending';

  assignModel = {
    disasterEventId: '',
    responderId: '',
    description: ''
  };

  constructor(
    private disasterService: DisasterService,
    private rescueTaskService: RescueTaskService,
    private analyticsService: AnalyticsService,
    private incidentReportService: IncidentReportService,
    private userService: UserService // Changed from http to userService
  ) { }

  ngOnInit() {
    this.startPolling(); // New method to encapsulate polling logic
    this.loadAnalytics(); // Fixed method name
    this.loadResponders();
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  // New method to start polling
  startPolling() {
    this.loadDisasters();
    this.loadOperationalData();
    this.loadAnalytics(); // Fixed method name

    this.pollingInterval = setInterval(() => {
      this.loadDisasters();
      this.loadOperationalData();
      this.loadAnalytics();
    }, 10000);
  }



  loadAnalytics() {
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (res) => this.analyticsData = res,
      error: (err) => console.error("Could not load analytics", err)
    });
  }

  loadDisasters() {
    this.disasterService.getPending().subscribe((res: any) => this.pendingDisasters = res);
    this.disasterService.getVerified().subscribe((res: any) => this.verifiedDisasters = this.decorateDisasters(res));
    this.disasterService.getResolved().subscribe((res: any) => this.resolvedDisasters = this.decorateDisasters(res));
    this.disasterService.getAllHelpRequests().subscribe((res: any) => this.helpRequests = res);
  }

  loadOperationalData() {
    this.rescueTaskService.getAllTasks().subscribe({
      next: (res: any[]) => {
        this.allTasks = res;
        this.verifiedDisasters = this.decorateDisasters(this.verifiedDisasters);
        this.resolvedDisasters = this.decorateDisasters(this.resolvedDisasters);
      },
      error: (err) => console.error('Failed to load tasks', err)
    });

    this.incidentReportService.getAllReports().subscribe({
      next: (res: any[]) => {
        this.allReports = res;
        this.verifiedDisasters = this.decorateDisasters(this.verifiedDisasters);
        this.resolvedDisasters = this.decorateDisasters(this.resolvedDisasters);
      },
      error: (err) => console.error('Failed to load incident reports', err)
    });
  }

  loadResponders() {
    this.userService.getResponders().subscribe({
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
        this.loadOperationalData();
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
        this.loadOperationalData();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to assign task');
      }
    });
  }

  assignHelpRequest(reqId: number, responderEmail: string) {
    if (!responderEmail) {
      alert("Please select a responder first!");
      return;
    }
    this.disasterService.assignHelpRequest(reqId, responderEmail).subscribe({
      next: () => {
        alert("Emergency Rescue Request Assigned Successfully!");
        this.loadDisasters();
      },
      error: () => alert("Failed to assign request")
    });
  }

  verifyHelpRequest(reqId: number) {
    this.disasterService.updateHelpRequestStatus(reqId, 'RESOLVED').subscribe({
      next: () => {
        alert("Rescue request verified and resolved!");
        this.loadDisasters();
      },
      error: (err) => {
        console.error("Failed to verify request", err);
        alert("Verification failed.");
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

  getSeverityBadgeClass(severity: string): string {
    if (!severity) return 'badge-low';
    switch (severity.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-low';
    }
  }

  decorateDisasters(disasters: any[] = []): any[] {
    return disasters.map(disaster => {
      const tasks = this.allTasks.filter(task => task.disasterEvent?.id === disaster.id);
      const taskIds = new Set(tasks.map(task => task.id));
      const reports = this.allReports
        .filter(report => taskIds.has(report.rescueTask?.id))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latestReport = reports[0] || null;
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
      const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
      const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;

      return {
        ...disaster,
        assignedTasks: tasks,
        taskSummary: {
          total: tasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
          pending: pendingTasks
        },
        latestReport,
        reportCount: reports.length
      };
    });
  }
}
