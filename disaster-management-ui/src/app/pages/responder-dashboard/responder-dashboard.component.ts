import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

import { RescueTaskService } from '../../core/services/rescue-task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-responder-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './responder-dashboard.component.html',
  styleUrls: ['./responder-dashboard.component.css']
})
export class ResponderDashboardComponent implements OnInit, OnDestroy {

  assignedTasks: any[] = [];
  completedTasks: any[] = [];
  assignedEmergencyRescues: any[] = [];
  responderId: number | null = null;
  responderEmail: string | null = null;
  reportModel: any = {};
  
  activeTab: string = 'active';
  pollingInterval: any;

  constructor(
    private rescueTaskService: RescueTaskService,
    private disasterService: DisasterService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.responderId = this.tokenService.getUserId();
    this.responderEmail = this.tokenService.getEmail();
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      this.activeTab = tab === 'history' ? 'history' : 'active';
    });
    this.loadTasks();

    this.pollingInterval = setInterval(() => {
      this.loadTasks();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadTasks() {
    if (this.responderId) {
      this.rescueTaskService.getTasksByResponder(this.responderId).subscribe((res: any) => {
        this.assignedTasks = res.filter((task: any) => task.status !== 'COMPLETED');
        this.completedTasks = res.filter((task: any) => task.status === 'COMPLETED');
      });
    }
    if (this.responderEmail) {
      this.disasterService.getHelpRequestsByResponder(this.responderEmail).subscribe((res: any) => {
        this.assignedEmergencyRescues = res.filter((req: any) => req.status !== 'RESOLVED' && req.status !== 'COMPLETED');
      });
    }
  }

  viewDetails(taskId: number) {
    this.router.navigate(['/responder/task', taskId]);
  }

  resolveRescueRequest(reqId: number) {
    this.disasterService.updateHelpRequestStatus(reqId, 'RESOLVED').subscribe({
      next: () => {
        alert('Emergency Rescue Request marked as RESOLVED!');
        this.loadTasks(); // refresh lists
      },
      error: (err) => {
        console.error(err);
        alert('Failed to resolve rescue request.');
      }
    });
  }

  goToApprovedDisasters() {
    this.router.navigate(['/responder/approved']);
  }
}
