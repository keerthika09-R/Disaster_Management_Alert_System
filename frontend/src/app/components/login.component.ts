import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">⚡</div>
          <h1>Disaster Management</h1>
          <p>Alert & Response System</p>
        </div>

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input class="form-input" type="email" placeholder="you@example.com"
              [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" placeholder="Enter your password"
              [(ngModel)]="password" name="password" required />
          </div>

          <div *ngIf="error" class="msg msg-error">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading"
            style="margin-top: 8px; padding: 12px;">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-logo {
      font-size: 36px;
      margin-bottom: 12px;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    this.error = '';
    this.loading = true;

    this.http.post('http://localhost:8443/api/auth/login',
      { email: this.email, password: this.password }
    ).subscribe({
      next: (res: any) => {
        localStorage.setItem('jwt_token', res.token);
        localStorage.setItem('user_role', res.role);
        localStorage.setItem('user_email', this.email);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Invalid email or password.';
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }
}
