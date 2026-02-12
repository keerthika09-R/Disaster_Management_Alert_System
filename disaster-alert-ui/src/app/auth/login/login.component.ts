import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    this.authService.login(this.loginData).subscribe({

      next: (response: any) => {

        this.authService.saveToken(response.token);

        alert("Login successful");

        this.router.navigate(['/dashboard']);
      },

      error: () => {
        alert("Invalid email or password");
      }

    });

  }

  googleLogin(){
    alert("Google login coming next step");
  }

  facebookLogin(){
    alert("Facebook login coming next step");
  }

}