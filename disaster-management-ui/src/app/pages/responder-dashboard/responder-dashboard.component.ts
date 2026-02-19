import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../../shared/navbar.component';

@Component({
  selector: 'app-responder-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    NavbarComponent
  ],

  templateUrl: './responder-dashboard.component.html',
  styleUrls: ['./responder-dashboard.component.css']
})
export class ResponderDashboardComponent {}
