import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-split">
      <div class="auth-sidebar">
        <div class="auth-sidebar-content">
          <div class="auth-logo-text">DMAS</div>
          <div class="auth-subtitle">Disaster Monitoring & Alert System</div>
          <p class="auth-desc">
            A secure, authoritative platform for critical event monitoring and region-based emergency broadcasting.
          </p>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-card">
          <h2>Sign In</h2>
          
          <form (ngSubmit)="login()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-input" type="email" placeholder="e.g. administrator@dmas.gov" 
                [(ngModel)]="email" name="email" required />
            </div>
            
            <div class="form-group" style="margin-bottom: 24px;">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" placeholder="Enter your password" 
                [(ngModel)]="password" name="password" required />
            </div>

            <div *ngIf="error" class="card" style="padding: 12px; background: var(--danger-bg); color: var(--danger); border-color: var(--danger); margin-bottom: 20px; font-size: 0.85rem;">
              {{ error }}
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading" style="height: 44px;">
              {{ loading ? 'Authenticating...' : 'Sign In to Dashboard' }}
            </button>
          </form>

          <div style="margin-top: 24px; text-align: center; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">New to the system?</span> 
            <a routerLink="/register" style="color: var(--primary); font-weight: 600; margin-left: 6px;">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  `
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
        this.error = 'Access denied. Please check your credentials.';
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }
}
