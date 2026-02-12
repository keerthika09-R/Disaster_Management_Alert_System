import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // User object (matches your HTML)
  user = {
    fullName: '',
    email: '',
    password: ''
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // REGISTER FUNCTION
  register() {

    this.auth.register(this.user).subscribe({

      next: (response) => {

        alert('Account created successfully');

        // redirect to login page
        this.router.navigate(['/login']);

      },

      error: (error) => {

        console.error(error);

        alert('Signup failed');

      }

    });

  }

  // GOOGLE SIGNUP
  googleSignup(){
    window.location.href =
    "http://localhost:8080/oauth2/authorization/google";
  }

  // FACEBOOK SIGNUP
  facebookSignup(){
    window.location.href =
    "http://localhost:8080/oauth2/authorization/facebook";
  }

}