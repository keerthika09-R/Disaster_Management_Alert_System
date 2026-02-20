import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const COUNTRY_STATES: { [key: string]: string[] } = {
  'India': ['Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Assam', 'Chhattisgarh', 'Jammu and Kashmir'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Japan': ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu', 'Tokyo'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Ontario', 'Quebec', 'Saskatchewan'],
  'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'Lower Saxony', 'North Rhine-Westphalia', 'Saxony'],
  'France': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine'],
  'China': ['Beijing', 'Shanghai', 'Guangdong', 'Sichuan', 'Zhejiang', 'Jiangsu', 'Shandong'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná']
};

@Component({
  selector: 'app-register',
  template: `
<div class="auth-page">
    <div class="auth-card" style="max-width: 480px;">
        <div class="auth-header">
            <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
            <h1>Create Account</h1>
            <p>Join the Disaster Management System</p>
        </div>

        <div *ngIf="errorMsg" class="msg msg-error">{{ errorMsg }}</div>
        <div *ngIf="successMsg" class="msg msg-success">{{ successMsg }}</div>

        <div class="form-row">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="form.fullName" placeholder="John Doe" />
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" [(ngModel)]="form.phoneNumber" placeholder="+1 234 567 890" />
            </div>
        </div>

        <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" placeholder="you@example.com" />
        </div>

        <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" placeholder="Minimum 6 characters" />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Country</label>
                <select [(ngModel)]="form.country" (ngModelChange)="onCountryChange()">
                    <option value="">Select Country</option>
                    <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                </select>
            </div>
            <div class="form-group">
                <label>State</label>
                <select [(ngModel)]="form.state" [disabled]="!form.country">
                    <option value="">Select State</option>
                    <option *ngFor="let s of availableStates" [value]="s">{{ s }}</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>City / District</label>
            <input type="text" [(ngModel)]="form.city" placeholder="Enter city or district" />
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="form.role">
                    <option value="CITIZEN">Citizen</option>
                    <option value="RESPONDER">Responder</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
            <div class="form-group" *ngIf="form.role==='ADMIN' || form.role==='RESPONDER'">
                <label>Security Key</label>
                <input type="password" [(ngModel)]="form.secretKey" placeholder="Required" />
            </div>
        </div>

        <button class="btn btn-primary btn-full" (click)="register()" [disabled]="loading"
            style="margin-top: 8px; padding: 12px;">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <p class="auth-footer">Already have an account? <a routerLink="/login">Sign in</a></p>
    </div>
</div>
    `
})
export class RegisterComponent {
  form: any = {
    fullName: '', email: '', phoneNumber: '', password: '',
    country: '', state: '', city: '', role: 'CITIZEN', secretKey: ''
  };
  loading = false;
  errorMsg = '';
  successMsg = '';

  countries = Object.keys(COUNTRY_STATES);
  availableStates: string[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  onCountryChange() {
    this.availableStates = COUNTRY_STATES[this.form.country] || [];
    this.form.state = '';
  }

  register() {
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;
    this.http.post('http://localhost:8443/api/auth/register', this.form).subscribe({
      next: () => {
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || err.error || 'Registration failed.';
      }
    });
  }
}
