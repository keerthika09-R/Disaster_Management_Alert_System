

import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    email: '',
    password: ''
  };

  message = '';
  isError = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  login() {

    this.authService.login(this.loginData).subscribe({

      next: (response: any) => {

        this.tokenService.saveToken(response.token);
        this.tokenService.saveRole(response.role);
        if (response.id) {
          this.tokenService.saveUserId(response.id);
        }

        if (response.role === "ADMIN")
          this.router.navigate(['/admin/dashboard']);

        else if (response.role === "RESPONDER")
          this.router.navigate(['/responder/dashboard']);

        else
          this.router.navigate(['/citizen/dashboard']);

      },

      error: (error: any) => {

        this.message = "Invalid email or password";
        this.isError = true;

      }

    });

  }

}
