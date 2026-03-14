import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { TokenService } from '../core/services/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router, private tokenService: TokenService) {}

  isResponder(): boolean {
    return this.tokenService.getRole() === 'RESPONDER';
  }

  logout() {

    localStorage.clear();

    this.router.navigate(['/login']);

  }

}
