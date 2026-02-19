import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-brand">
          <h1>🛡️ Disaster<span>AlertHub</span></h1>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email</label>
            <input class="form-control" type="email" placeholder="you@example.com"
              [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input class="form-control" type="password" placeholder="Enter password"
              [(ngModel)]="password" name="password" required />
          </div>

          <div *ngIf="error" class="alert-msg alert-error">{{ error }}</div>
          <div *ngIf="success" class="alert-msg alert-success">{{ success }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">Don't have an account? <a routerLink="/register">Register</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    this.error = '';
    this.success = '';
    this.loading = true;

    this.http.post('http://localhost:8443/api/auth/login',
      { email: this.email, password: this.password },
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: (res: any) => {
        this.success = 'Login successful!';
        localStorage.setItem('jwt_token', res.token);
        localStorage.setItem('user_role', res.role);
        localStorage.setItem('user_email', this.email);
        setTimeout(() => this.router.navigate(['/dashboard']), 600);
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }
}
