import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,

  
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerData = {
    fullName: '',
    email: '',
    password: '',
    role: ''
  };

  message = '';
  isError = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {

    this.authService.register(this.registerData).subscribe({

      next: (response: any) => {

        this.message = "Registration successful ✓";
        this.isError = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);

      },

      error: (error: any) => {

        this.message =
          error.error?.message ||
          "Registration failed";

        this.isError = true;

      }

    });

  }

}
