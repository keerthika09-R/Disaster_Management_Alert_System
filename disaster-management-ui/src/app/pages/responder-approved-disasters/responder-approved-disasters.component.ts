import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { TokenService } from '../../core/services/token.service';
import { Router } from '@angular/router';
import { RescueTaskService } from '../../core/services/rescue-task.service';

@Component({
  selector: 'app-responder-approved-disasters',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './responder-approved-disasters.component.html',
  styleUrls: ['./responder-approved-disasters.component.css']
})
export class ResponderApprovedDisastersComponent implements OnInit {

  verifiedDisasters: any[] = [];
  allVerifiedDisasters: any[] = [];
  responderId: number | null = null;
  responderTasksByDisasterId: Record<number, any> = {};
  joiningDisasterId: number | null = null;

  constructor(
    private disasterService: DisasterService,
    private tokenService: TokenService,
    private rescueTaskService: RescueTaskService,
    private router: Router
  ) { }

  ngOnInit() {
    this.responderId = this.tokenService.getUserId();
    this.loadVerifiedDisasters();
    this.loadResponderTasks();
  }

  loadVerifiedDisasters() {
    this.disasterService.getVerified().subscribe((res: any) => {
      this.allVerifiedDisasters = (res || []).filter((disaster: any) => {
        const status = (disaster?.status || '').toUpperCase();
        return status !== 'RESOLVED' && status !== 'COMPLETED';
      });
      this.applyVisibleDisasters();
    });
  }

  loadResponderTasks() {
    if (!this.responderId) {
      return;
    }

    this.rescueTaskService.getTasksByResponder(this.responderId).subscribe((tasks: any[]) => {
      this.responderTasksByDisasterId = tasks.reduce((acc: Record<number, any>, task: any) => {
        const disasterId = task.disasterEvent?.id;
        if (disasterId) {
          acc[disasterId] = task;
        }
        return acc;
      }, {});
      this.applyVisibleDisasters();
    });
  }

  applyVisibleDisasters() {
    this.verifiedDisasters = this.allVerifiedDisasters.filter((disaster: any) => {
      const existingTask = this.getResponderTask(disaster.id);
      return !existingTask || existingTask.status !== 'COMPLETED';
    });
  }

  getResponderTask(disasterId: number) {
    return this.responderTasksByDisasterId[disasterId] || null;
  }

  engageDisaster(disaster: any) {
    if (!this.responderId) {
      alert('Responder account details were not found. Please log in again.');
      return;
    }

    const existingTask = this.getResponderTask(disaster.id);
    if (existingTask) {
      this.router.navigate(['/responder/task', existingTask.id]);
      return;
    }

    this.joiningDisasterId = disaster.id;

    const payload = {
      disasterEventId: disaster.id,
      responderId: this.responderId,
      description: `Field response for ${disaster.disasterType || 'disaster'} at ${disaster.location || 'affected zone'}`
    };

    this.rescueTaskService.assignTask(payload).subscribe({
      next: (task: any) => {
        this.responderTasksByDisasterId[disaster.id] = task;
        this.joiningDisasterId = null;
        this.router.navigate(['/responder/task', task.id]);
      },
      error: (err) => {
        console.error('Failed to engage disaster', err);
        this.joiningDisasterId = null;
        alert('Failed to join this disaster response.');
      }
    });
  }

  goToAssignments(tab?: 'history') {
    const targetTab = tab === 'history' ? 'history' : 'active';
    this.router.navigate(['/responder/dashboard'], { queryParams: { tab: targetTab } });
  }

}
