import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card wide">
        <div class="auth-brand">
          <h1>🛡️ Disaster<span>AlertHub</span></h1>
          <p>Create your account</p>
        </div>

        <form (ngSubmit)="register()">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <input class="form-control" placeholder="Your name" [(ngModel)]="form.fullName" name="fullName" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="form-control" type="email" placeholder="you@example.com" [(ngModel)]="form.email" name="email" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Password</label>
              <input class="form-control" type="password" placeholder="Create password" [(ngModel)]="form.password" name="password" required />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input class="form-control" type="tel" placeholder="Phone number" [(ngModel)]="form.phoneNumber" name="phone" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Region</label>
              <select class="form-control" [(ngModel)]="form.region" name="region">
                <option value="">Select region</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select class="form-control" [(ngModel)]="form.role" name="role">
                <option value="CITIZEN">Citizen</option>
                <option value="RESPONDER">Responder</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div class="form-group" *ngIf="form.role==='ADMIN' || form.role==='RESPONDER'">
            <label>Security Key</label>
            <input class="form-control" type="password" placeholder="Enter security key" [(ngModel)]="form.secretKey" name="secretKey" />
          </div>

          <div *ngIf="error" class="alert-msg alert-error">{{ error }}</div>
          <div *ngIf="success" class="alert-msg alert-success">{{ success }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>

        <p class="auth-footer">Already have an account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: any = { fullName: '', email: '', password: '', phoneNumber: '', region: '', role: 'CITIZEN', secretKey: '' };
  error = '';
  success = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) { }

  register() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const body: any = { ...this.form };
    if (body.role === 'CITIZEN') delete body.secretKey;

    this.http.post('http://localhost:8443/api/auth/register', body,
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: () => {
        this.error = 'Registration failed. Check your details.';
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }
}
