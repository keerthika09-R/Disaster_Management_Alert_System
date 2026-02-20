import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DisasterService } from '../services/disaster.service';

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
  selector: 'app-dashboard',
  template: `
<div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>⚡ DMAS</h2>
            <span class="sidebar-subtitle">Alert & Response System</span>
        </div>
        <nav class="sidebar-nav">
            <a class="nav-item" [class.active]="view==='home'" (click)="view='home'">📊 Dashboard</a>
            <a class="nav-item" [class.active]="view==='profile'" (click)="view='profile'">👤 Profile</a>

            <ng-container *ngIf="userRole==='ADMIN'">
                <a class="nav-item" routerLink="/disaster-monitor">🌍 Disaster Monitor</a>
                <a class="nav-item" [class.active]="view==='responders'" (click)="view='responders'">👥 Responder Regions</a>
                <a class="nav-item" [class.active]="view==='admin-acks'" (click)="view='admin-acks'; loadAcks()">✅ Acknowledgments</a>
            </ng-container>

            <ng-container *ngIf="userRole==='RESPONDER'">
                <a class="nav-item" [class.active]="view==='alerts'" (click)="view='alerts'; loadAlerts()">🔔 Active Alerts</a>
            </ng-container>

            <ng-container *ngIf="userRole==='CITIZEN'">
                <a class="nav-item" [class.active]="view==='alerts'" (click)="view='alerts'; loadAlerts()">📢 Alerts Feed</a>
            </ng-container>

            <a class="nav-item nav-logout" (click)="logout()">🚪 Logout</a>
        </nav>
    </aside>

    <!-- Main -->
    <main class="main-content">
        <div class="top-bar">
            <h1 class="page-title">
                <span *ngIf="view==='home'">Dashboard</span>
                <span *ngIf="view==='profile'">Profile Settings</span>
                <span *ngIf="view==='alerts'">{{ userRole === 'CITIZEN' ? 'Alerts Feed' : 'Active Alerts' }}</span>
                <span *ngIf="view==='responders'">Responder Region Management</span>
                <span *ngIf="view==='admin-acks'">Alert Acknowledgments</span>
            </h1>
            <span class="user-badge">{{ userEmail }} · {{ userRole }}</span>
        </div>

        <div *ngIf="statusMessage" class="status-bar" [ngClass]="statusType">{{ statusMessage }}</div>

        <!-- ============ HOME ============ -->
        <div *ngIf="view==='home'" style="padding: 24px 28px;">

            <!-- ADMIN HOME -->
            <ng-container *ngIf="userRole==='ADMIN'">
                <div class="stats-grid" style="padding: 0; margin-bottom: 24px;">
                    <div class="stat-card"><div class="stat-label">Total Events</div><div class="stat-number">{{ stats.totalEvents || 0 }}</div></div>
                    <div class="stat-card"><div class="stat-label">Pending</div><div class="stat-number" style="color: var(--warning);">{{ stats.pendingEvents || 0 }}</div></div>
                    <div class="stat-card"><div class="stat-label">Verified</div><div class="stat-number" style="color: var(--success);">{{ stats.verifiedEvents || 0 }}</div></div>
                    <div class="stat-card"><div class="stat-label">Rejected</div><div class="stat-number" style="color: var(--danger);">{{ stats.rejectedEvents || 0 }}</div></div>
                </div>
                <div class="card">
                    <h3 class="card-title">Recent Verified Disasters</h3>
                    <table class="data-table">
                        <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Country</th><th>State</th><th>Source</th><th>Time</th></tr></thead>
                        <tbody>
                            <tr *ngFor="let e of recentEvents">
                                <td><strong>{{ e.title }}</strong></td>
                                <td>{{ e.disasterType }}</td>
                                <td><span class="badge" [ngClass]="sevBadge(e.severity)">{{ e.severity }}</span></td>
                                <td>{{ e.country || '-' }}</td>
                                <td>{{ e.state || '-' }}</td>
                                <td>{{ e.source }}</td>
                                <td style="color: var(--text-muted); font-size: 12px;">{{ formatDate(e.eventTime) }}</td>
                            </tr>
                            <tr *ngIf="recentEvents.length===0"><td colspan="7" class="card-empty">No verified events yet.</td></tr>
                        </tbody>
                    </table>
                </div>
            </ng-container>

            <!-- RESPONDER HOME -->
            <ng-container *ngIf="userRole==='RESPONDER'">
                <div class="card">
                    <h3 class="card-title">Welcome, Responder</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        You'll receive region-specific alerts based on your profile location.
                        Check <strong style="color: var(--accent);">Active Alerts</strong> for new disaster notifications in your area.
                    </p>
                    <button class="btn btn-primary" (click)="view='alerts'; loadAlerts()">View Active Alerts →</button>
                </div>
            </ng-container>

            <!-- CITIZEN HOME -->
            <ng-container *ngIf="userRole==='CITIZEN'">
                <div class="card">
                    <h3 class="card-title">Welcome, Citizen</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        Stay informed about disasters in your region.
                        Check <strong style="color: var(--accent);">Alerts Feed</strong> for verified alerts matching your location.
                    </p>
                    <button class="btn btn-primary" (click)="view='alerts'; loadAlerts()">View Alerts Feed →</button>
                </div>
            </ng-container>
        </div>

        <!-- ============ PROFILE ============ -->
        <div *ngIf="view==='profile'" style="padding: 24px 28px;">
            <div class="card" style="max-width: 560px;">
                <h3 class="card-title">Your Profile</h3>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" [(ngModel)]="profile.fullName" />
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" [(ngModel)]="profile.phoneNumber" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Country</label>
                        <select [(ngModel)]="profile.country" (ngModelChange)="onProfileCountryChange()">
                            <option value="">Select Country</option>
                            <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>State</label>
                        <select [(ngModel)]="profile.state" [disabled]="!profile.country">
                            <option value="">Select State</option>
                            <option *ngFor="let s of profileStates" [value]="s">{{ s }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>City / District</label>
                    <input type="text" [(ngModel)]="profile.city" />
                </div>
                <button class="btn btn-primary" (click)="saveProfile()" style="margin-top: 8px;">Save Profile</button>
            </div>
        </div>

        <!-- ============ ALERTS (Citizen + Responder) ============ -->
        <div *ngIf="view==='alerts'" style="padding: 24px 28px;">

            <!-- Filter -->
            <div class="filter-bar" style="margin-bottom: 16px;">
                <div class="filter-row">
                    <select class="filter-input" [(ngModel)]="alertFilter" (ngModelChange)="applyAlertFilter()">
                        <option value="">All Types</option>
                        <option *ngFor="let t of disasterTypes" [value]="t">{{ t }}</option>
                    </select>
                    <span style="color: var(--text-muted); font-size: 13px;">{{ filteredAlerts.length }} alerts in your region</span>
                </div>
            </div>

            <!-- Alert cards -->
            <div *ngFor="let a of filteredAlerts" class="alert-card" [style.border-left-color]="getSevColor(a.severity)">
                <div class="alert-header" style="margin-bottom: 8px;">
                    <span class="badge" [ngClass]="sevBadge(a.severity)">{{ a.severity }}</span>
                    <span class="badge badge-neutral" *ngIf="a.disasterType">{{ a.disasterType }}</span>
                    <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">{{ formatDate(a.createdAt) }}</span>
                </div>
                <p style="color: var(--text-primary); font-weight: 500; margin-bottom: 4px;">{{ a.message }}</p>
                <p style="font-size: 12px; color: var(--text-muted);">
                    📍 {{ a.country || '' }} {{ a.state ? '· ' + a.state : '' }} {{ a.city ? '· ' + a.city : '' }}
                </p>

                <!-- Responder: Acknowledge -->
                <div *ngIf="userRole==='RESPONDER'" style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" (click)="acknowledgeAlert(a)"
                        *ngIf="!isAcknowledged(a.disasterId)" >
                        ✓ Acknowledge
                    </button>
                    <span *ngIf="isAcknowledged(a.disasterId)"
                        style="font-size: 12px; color: var(--success); font-weight: 600;">✓ Acknowledged</span>
                </div>

                <!-- Citizen: Safety -->
                <div *ngIf="userRole==='CITIZEN'" class="safety-box">
                    <strong>Safety:</strong> {{ getSafetyTip(a.disasterType) }}
                </div>
            </div>

            <div *ngIf="filteredAlerts.length===0" class="card" style="text-align: center; padding: 40px;">
                <p style="color: var(--text-muted); font-size: 15px;">No alerts for your region.</p>
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 6px;">Alerts appear here after admin verification.</p>
            </div>
        </div>

        <!-- ============ RESPONDER REGIONS (Admin) ============ -->
        <div *ngIf="view==='responders' && userRole==='ADMIN'" style="padding: 24px 28px;">
            <div class="card">
                <h3 class="card-title">Responder Region Assignment</h3>
                <table class="data-table">
                    <thead>
                        <tr><th>Email</th><th>Name</th><th>Country</th><th>State</th><th>City</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let r of responders">
                            <td><strong>{{ r.email }}</strong></td>
                            <td>{{ r.fullName || '-' }}</td>
                            <td>
                                <select [(ngModel)]="r.editCountry" style="width: 130px;"
                                    (ngModelChange)="onResponderCountryChange(r)">
                                    <option value="">Select</option>
                                    <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                                </select>
                            </td>
                            <td>
                                <select [(ngModel)]="r.editState" style="width: 130px;">
                                    <option value="">Select</option>
                                    <option *ngFor="let s of (responderStates[r.id] || [])" [value]="s">{{ s }}</option>
                                </select>
                            </td>
                            <td><input type="text" [(ngModel)]="r.editCity" style="width: 100px;" placeholder="City" /></td>
                            <td><button class="btn btn-sm btn-primary" (click)="saveResponderRegion(r)">Save</button></td>
                        </tr>
                        <tr *ngIf="responders.length===0"><td colspan="6" class="card-empty">No responders found.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ============ ACKNOWLEDGMENTS (Admin) ============ -->
        <div *ngIf="view==='admin-acks' && userRole==='ADMIN'" style="padding: 24px 28px;">
            <div class="card">
                <h3 class="card-title">All Responder Acknowledgments</h3>
                <table class="data-table">
                    <thead><tr><th>Disaster ID</th><th>Responder</th><th>Status</th><th>Time</th></tr></thead>
                    <tbody>
                        <tr *ngFor="let a of allAcks">
                            <td><strong>#{{ a.disasterId }}</strong></td>
                            <td>{{ a.responderEmail }}</td>
                            <td><span class="badge badge-success">{{ a.status }}</span></td>
                            <td style="color: var(--text-muted); font-size: 12px;">{{ formatDate(a.acknowledgedAt) }}</td>
                        </tr>
                        <tr *ngIf="allAcks.length===0"><td colspan="4" class="card-empty">No acknowledgments yet.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

    </main>
</div>
  `
})
export class DashboardComponent implements OnInit {
  view = 'home';
  userEmail = '';
  userRole = '';
  statusMessage = '';
  statusType = '';

  // Data
  stats: any = {};
  recentEvents: any[] = [];
  alerts: any[] = [];
  filteredAlerts: any[] = [];
  myAcks: any[] = [];
  allAcks: any[] = [];
  responders: any[] = [];
  responderStates: any = {};

  // Profile
  profile: any = { fullName: '', phoneNumber: '', country: '', state: '', city: '' };
  profileStates: string[] = [];

  // Filters
  alertFilter = '';
  countries = Object.keys(COUNTRY_STATES);
  disasterTypes = ['FLOOD', 'CYCLONE', 'EARTHQUAKE', 'FIRE', 'STORM', 'TSUNAMI', 'LANDSLIDE', 'DROUGHT', 'OTHER'];

  constructor(private router: Router, private http: HttpClient, private ds: DisasterService) { }

  ngOnInit() {
    this.userEmail = localStorage.getItem('user_email') || '';
    this.userRole = localStorage.getItem('user_role') || '';
    this.loadDashboard();
    this.loadProfile();
  }

  loadDashboard() {
    if (this.userRole === 'ADMIN') {
      this.ds.getAdminStatistics().subscribe({ next: (d: any) => this.stats = d, error: () => { } });
      this.ds.getVerifiedDisasters().subscribe({ next: (d: any) => this.recentEvents = (d || []).slice(0, 10), error: () => { } });
      this.ds.getResponders().subscribe({
        next: (list: any) => {
          this.responders = (list || []).map((r: any) => ({
            ...r, editCountry: r.country || '', editState: r.state || '', editCity: r.city || ''
          }));
          this.responders.forEach((r: any) => {
            this.responderStates[r.id] = COUNTRY_STATES[r.editCountry] || [];
          });
        }, error: () => { }
      });
    }
  }

  loadProfile() {
    this.ds.getMyProfile().subscribe({
      next: (p: any) => {
        this.profile = {
          fullName: p.fullName || '', phoneNumber: p.phoneNumber || '',
          country: p.country || '', state: p.state || '', city: p.city || ''
        };
        this.profileStates = COUNTRY_STATES[this.profile.country] || [];
      }, error: () => { }
    });
  }

  saveProfile() {
    this.ds.updateProfile(this.profile).subscribe({
      next: () => this.showStatus('Profile updated.', 'success'),
      error: () => this.showStatus('Failed to save profile.', 'error')
    });
  }

  onProfileCountryChange() {
    this.profileStates = COUNTRY_STATES[this.profile.country] || [];
    this.profile.state = '';
  }

  onResponderCountryChange(r: any) {
    this.responderStates[r.id] = COUNTRY_STATES[r.editCountry] || [];
    r.editState = '';
  }

  saveResponderRegion(r: any) {
    this.ds.adminUpdateProfile(r.userId || r.id, {
      country: r.editCountry, state: r.editState, city: r.editCity
    }).subscribe({
      next: () => this.showStatus('Responder region updated.', 'success'),
      error: () => this.showStatus('Failed to update.', 'error')
    });
  }

  loadAlerts() {
    this.ds.getMyAlerts().subscribe({
      next: (d: any) => { this.alerts = d || []; this.applyAlertFilter(); },
      error: () => { }
    });
    if (this.userRole === 'RESPONDER') {
      this.ds.getMyAcknowledgments().subscribe({
        next: (d: any) => this.myAcks = d || [],
        error: () => { }
      });
    }
  }

  applyAlertFilter() {
    this.filteredAlerts = this.alertFilter
      ? this.alerts.filter((a: any) => a.disasterType === this.alertFilter)
      : [...this.alerts];
  }

  acknowledgeAlert(a: any) {
    this.ds.acknowledgeAlert(a.disasterId).subscribe({
      next: () => {
        this.myAcks.push({ disasterId: a.disasterId });
        this.showStatus('Alert acknowledged.', 'success');
      },
      error: (err: any) => this.showStatus(err.error?.message || 'Failed.', 'error')
    });
  }

  isAcknowledged(disasterId: number): boolean {
    return this.myAcks.some((a: any) => a.disasterId === disasterId);
  }

  loadAcks() {
    this.ds.getAllAcknowledgments().subscribe({ next: (d: any) => this.allAcks = d || [], error: () => { } });
  }

  // Helpers
  formatDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  sevBadge(s: string): string {
    if (s === 'CRITICAL' || s === 'HIGH') return 'badge-danger';
    if (s === 'MEDIUM') return 'badge-warning';
    return 'badge-success';
  }

  getSevColor(s: string): string {
    if (s === 'CRITICAL') return '#F87171';
    if (s === 'HIGH') return '#F97316';
    if (s === 'MEDIUM') return '#FBBF24';
    return '#34D399';
  }

  getSafetyTip(type: string): string {
    const tips: any = {
      'EARTHQUAKE': 'Drop, Cover, and Hold On. Move away from windows and heavy objects.',
      'FLOOD': 'Move to higher ground immediately. Avoid walking or driving through flood waters.',
      'CYCLONE': 'Stay indoors away from windows. Stock up on essentials.',
      'STORM': 'Stay indoors. Unplug electronics. Avoid open areas.',
      'FIRE': 'Evacuate immediately. Stay low to avoid smoke inhalation.',
      'TSUNAMI': 'Move to high ground immediately. Stay away from the coast.',
      'LANDSLIDE': 'Move away from the path of debris. Evacuate if ordered.',
      'DROUGHT': 'Conserve water. Follow local water-use restrictions.'
    };
    return tips[type] || 'Stay alert and follow local authority instructions.';
  }

  showStatus(msg: string, type: string) {
    this.statusMessage = msg;
    this.statusType = type;
    setTimeout(() => { this.statusMessage = ''; }, 3500);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
