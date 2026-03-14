import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RescueTaskService } from '../../core/services/rescue-task.service';
import { IncidentReportService } from '../../core/services/incident-report.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-responder-task-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './responder-task-details.component.html',
  styleUrls: ['./responder-task-details.component.css']
})
export class ResponderTaskDetailsComponent implements OnInit {
  task: any = null;
  reportObj: any = { text: '', imageUrl: '' };
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private rescueTaskService: RescueTaskService,
    private incidentReportService: IncidentReportService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTask(Number(id));
      }
    });
  }

  loadTask(id: number) {
    this.rescueTaskService.getTaskById(id).subscribe({
      next: (res) => {
        this.task = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Failed to load task details.');
      }
    });
  }

  updateStatus(status: string) {
    if (!this.task) return;
    this.rescueTaskService.updateTaskStatus(this.task.id, status).subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.loadTask(this.task.id);
      },
      error: () => alert('Failed to update status.')
    });
  }

  submitReport() {
    if (!this.reportObj.text) {
      alert('Report text is required');
      return;
    }
    const reportData = {
      rescueTaskId: this.task.id,
      reportText: this.reportObj.text,
      imageUrl: this.reportObj.imageUrl || ''
    };
    this.incidentReportService.submitReport(reportData).subscribe({
      next: () => {
        alert('Incident report submitted successfully');
        this.reportObj = { text: '', imageUrl: '' };
      },
      error: () => alert('Failed to submit report')
    });
  }

  goBack() {
    this.location.back();
  }
}
