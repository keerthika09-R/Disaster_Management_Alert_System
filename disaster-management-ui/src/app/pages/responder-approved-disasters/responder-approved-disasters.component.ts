import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar.component';
import { DisasterService } from '../../core/services/disaster.service';
import { TokenService } from '../../core/services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-responder-approved-disasters',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './responder-approved-disasters.component.html',
  styleUrls: ['./responder-approved-disasters.component.css']
})
export class ResponderApprovedDisastersComponent implements OnInit {

  verifiedDisasters: any[] = [];
  responderId: number | null = null;

  constructor(
    private disasterService: DisasterService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.responderId = this.tokenService.getUserId();
    this.loadVerifiedDisasters();
  }

  loadVerifiedDisasters() {
    this.disasterService.getVerified().subscribe((res: any) => {
      this.verifiedDisasters = res;
    });
  }

  goToAssignments(tab?: 'history') {
    const targetTab = tab === 'history' ? 'history' : 'active';
    this.router.navigate(['/responder/dashboard'], { queryParams: { tab: targetTab } });
  }

}
