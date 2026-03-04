import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

@Component({
  selector: 'app-responder-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './responder-dashboard.component.html',
  styleUrls: ['./responder-dashboard.component.css']
})
export class ResponderDashboardComponent implements OnInit {

  assignedTasks: any[] = [];
  acknowledgedIds: number[] = [];

  constructor(private disasterService: DisasterService) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    // Responders view verified (broadcasted) disasters as their potential tasks
    this.disasterService.getVerified().subscribe((res: any) => {
      this.assignedTasks = res;
    });
  }

  acknowledgeTask(id: number) {
    // In a real API, this would post an acknowledgment to a new endpoint.
    // For now we simulate acknowledgment on the UI.
    if (!this.acknowledgedIds.includes(id)) {
      this.acknowledgedIds.push(id);
      alert("Task Acknowledged! Admin has been notified of your deployment.");
    }
  }

  isAcknowledged(id: number): boolean {
    return this.acknowledgedIds.includes(id);
  }

}
