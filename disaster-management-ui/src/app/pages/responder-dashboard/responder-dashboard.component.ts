import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

import { RescueTaskService } from '../../core/services/rescue-task.service';
import { Router } from '@angular/router';
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
  responderId: number | null = null;
  reportModel: any = {};
  
  activeTab: string = 'active';
  pollingInterval: any;

  constructor(
    private rescueTaskService: RescueTaskService,
    private disasterService: DisasterService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.responderId = this.tokenService.getUserId();
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
  }

  viewDetails(taskId: number) {
    this.router.navigate(['/responder/task', taskId]);
  }
}
