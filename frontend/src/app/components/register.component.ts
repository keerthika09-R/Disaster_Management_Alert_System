import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const COUNTRY_STATES: { [key: string]: string[] } = {
  'India': ['Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Assam', 'Chhattisgarh', 'Jammu and Kashmir'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
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
    <div class="auth-split">
      <div class="auth-sidebar">
        <div class="auth-sidebar-content">
          <div class="auth-logo-text">DMAS</div>
          <div class="auth-subtitle">Disaster Monitoring & Alert System</div>
          <p class="auth-desc">
            Register for access to real-time disaster reporting and administrative verification. 
            Select your professional role and region to begin.
          </p>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-card" style="max-width: 580px;">
          <h2>Create Account</h2>
          
          <div *ngIf="errorMsg" class="card" style="padding: 12px; background: var(--danger-bg); color: var(--danger); border-color: var(--danger); margin-bottom: 20px; font-size: 0.85rem;">
            {{ errorMsg }}
          </div>
          <div *ngIf="successMsg" class="card" style="padding: 12px; background: var(--success-bg); color: var(--success); border-color: var(--success); margin-bottom: 20px; font-size: 0.85rem;">
            {{ successMsg }}
          </div>

          <div class="form-row">
            <div class="form-group">
                <label class="form-label">Full Name</label>
                <input class="form-input" type="text" [(ngModel)]="form.fullName" placeholder="John Doe" />
            </div>
            <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input class="form-input" type="text" [(ngModel)]="form.phoneNumber" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
                <label class="form-label">Email Address</label>
                <input class="form-input" type="email" [(ngModel)]="form.email" placeholder="official@agency.gov" />
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input class="form-input" type="password" [(ngModel)]="form.password" placeholder="Min. 6 characters" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
                <label class="form-label">Country</label>
                <select class="form-input" [(ngModel)]="form.country" (ngModelChange)="onCountryChange()">
                    <option value="">Select Country</option>
                    <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">State / Region</label>
                <select class="form-input" [(ngModel)]="form.state" [disabled]="!form.country">
                    <option value="">Select State</option>
                    <option *ngFor="let s of availableStates" [value]="s">{{ s }}</option>
                </select>
            </div>
          </div>

          <div class="form-group">
              <label class="form-label">City / District</label>
              <input class="form-input" type="text" [(ngModel)]="form.city" placeholder="City name" />
          </div>

          <div class="form-row" style="margin-bottom: 32px;">
            <div class="form-group">
                <label class="form-label">Role</label>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn btn-sm btn-outline" style="flex: 1;" [class.btn-primary]="form.role==='CITIZEN'" (click)="form.role='CITIZEN'">Citizen</button>
                  <button type="button" class="btn btn-sm btn-outline" style="flex: 1;" [class.btn-primary]="form.role==='RESPONDER'" (click)="form.role='RESPONDER'">Responder</button>
                  <button type="button" class="btn btn-sm btn-outline" style="flex: 1;" [class.btn-primary]="form.role==='ADMIN'" (click)="form.role='ADMIN'">Administrator</button>
                </div>
            </div>
            <div class="form-group" *ngIf="form.role==='ADMIN' || form.role==='RESPONDER'">
                <label class="form-label">System Security Key</label>
                <input class="form-input" type="password" [(ngModel)]="form.secretKey" placeholder="Required for privileged roles" />
            </div>
          </div>

          <button class="btn btn-primary btn-full" (click)="register()" [disabled]="loading" style="height: 44px;">
              {{ loading ? 'Processing Registration...' : 'Securely Register' }}
          </button>

          <div style="margin-top: 24px; text-align: center; font-size: 0.9rem;">
            <span style="color: var(--text-muted);">Already Have Access?</span> 
            <a routerLink="/login" style="color: var(--primary); font-weight: 600; margin-left: 6px;">Sign In</a>
          </div>
        </div>
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
        this.successMsg = 'Account established successfully. Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || err.error || 'Server error during registration.';
      }
    });
  }
}
