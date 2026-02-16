import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>🚨 Register</h2>
          <p>Create your disaster management account</p>
        </div>
        
        <form class="register-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="fullName" class="form-label">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              class="form-input" 
              placeholder="Enter your full name"
              [(ngModel)]="fullName"
              required
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="Enter your email"
              [(ngModel)]="email"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="Enter your password"
              [(ngModel)]="password"
              required
            />
          </div>

          <div class="form-group">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              name="phoneNumber" 
              class="form-input" 
              placeholder="Enter your phone number"
              [(ngModel)]="phoneNumber"
              required
            />
          </div>

          <div class="form-group">
            <label for="region" class="form-label">Region / Location</label>
            <input 
              type="text" 
              id="region" 
              name="region" 
              class="form-input" 
              placeholder="Enter your region/location"
              [(ngModel)]="region"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="role" class="form-label">Role</label>
            <select id="role" name="role" class="form-input" [(ngModel)]="role">
              <option value="CITIZEN">Citizen</option>
              <option value="RESPONDER">Responder</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div class="form-group" *ngIf="role === 'ADMIN' || role === 'RESPONDER'">
            <label for="secretKey" class="form-label">Secret Key</label>
            <input 
              type="password" 
              id="secretKey" 
              name="secretKey" 
              class="form-input" 
              placeholder="Enter secret key"
              [(ngModel)]="secretKey"
              required
            />
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isLoading">
              📝 {{ isLoading ? 'Creating Account...' : 'Register' }}
            </button>
            <a routerLink="/login" class="btn btn-secondary">
              🔐 Login
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f8fafc;
      padding: 2rem;
    }
    
    .register-card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .register-header h2 {
      color: #059669;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
    }
    
    .register-header p {
      color: #64748b;
      margin-top: 0.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .btn {
      padding: 0.75rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      display: block;
    }
    
    .btn-primary {
      background: #10b981;
      color: white;
    }
    
    .btn-primary:hover {
      background: #059669;
    }
    
    .btn-secondary {
      background: #64748b;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #475569;
    }
    
    .error-message {
      color: #dc2626;
      background: #fef2f2;
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    
    .success-message {
      color: #059669;
      background: #f0fdf4;
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    
    @media (max-width: 480px) {
      .register-card {
        margin: 1rem;
        padding: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  phoneNumber = '';
  region = '';
  role = 'CITIZEN';
  secretKey = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const registerData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.role,
      phoneNumber: this.phoneNumber,
      region: this.region,
      secretKey: (this.role === 'ADMIN' || this.role === 'RESPONDER') ? this.secretKey : null
    };

    console.log('Attempting registration with:', registerData);

    this.http.post('http://localhost:8443/api/auth/register', registerData, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage = 'Registration failed. Please check your connection.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
