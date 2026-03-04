import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  pendingDisasters: any[] = [];
  verifiedDisasters: any[] = [];
  isSyncing = false;

  constructor(private disasterService: DisasterService) { }

  ngOnInit() {
    this.loadDisasters();
  }

  loadDisasters() {
    this.disasterService.getPending().subscribe((res: any) => this.pendingDisasters = res);
    this.disasterService.getVerified().subscribe((res: any) => this.verifiedDisasters = res);
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
