import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DisasterService } from '../../core/services/disaster.service';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';

@Component({
  selector: 'app-responder-rescue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './responder-rescue-detail.component.html',
  styleUrls: ['./responder-rescue-detail.component.css']
})
export class ResponderRescueDetailComponent implements OnInit {
  helpRequest: any = null;
  reportText: string = '';
  reportImageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private disasterService: DisasterService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadRequest(+idParam);
    }
  }

  loadRequest(id: number) {
    this.disasterService.getHelpRequestById(id).subscribe({
      next: (data) => {
        this.helpRequest = data;
        if (data.reportText) {
          this.reportText = data.reportText;
        }
        if (data.reportImageUrl) {
          this.reportImageUrl = data.reportImageUrl;
        }
      },
      error: (err) => {
        console.error("Failed to load help request", err);
        alert("Failed to load request details.");
      }
    });
  }

  submitReport() {
    if (!this.reportText) {
      alert("Please provide a report description.");
      return;
    }
    
    this.disasterService.submitHelpRequestReport(this.helpRequest.id, this.reportText, this.reportImageUrl).subscribe({
      next: () => {
        alert("Report submitted successfully! Awaiting Admin Verification.");
        this.router.navigate(['/responder/dashboard']);
      },
      error: (err) => {
        console.error("Failed to submit report", err);
        alert("Failed to submit report.");
      }
    });
  }

  goBack() {
    this.router.navigate(['/responder/dashboard']);
  }
}
