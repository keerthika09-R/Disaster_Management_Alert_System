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
    'France': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine']
};

@Component({
    selector: 'app-dashboard',
    template: `
<div class="app-container">
    <!-- Fixed Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1>DMAS</h1>
            <p>Alert & Response System</p>
        </div>
        <nav class="sidebar-nav">
            <a class="nav-item" [class.active]="view==='home'" (click)="view='home'">Dashboard</a>
            <a class="nav-item" [class.active]="view==='profile'" (click)="view='profile'">Profile</a>

            <ng-container *ngIf="userRole==='ADMIN'">
                <a class="nav-item" routerLink="/disaster-monitor">Disaster Monitor</a>
                <a class="nav-item" [class.active]="view==='responders'" (click)="view='responders'">Responder Regions</a>
                <a class="nav-item" [class.active]="view==='admin-acks'" (click)="view='admin-acks'; loadAcks()">Acknowledgments</a>
                
                <div style="margin: 16px 12px 8px; font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em;">User Management</div>
                <a class="nav-item" [class.active]="view==='users-responders'" (click)="view='users-responders'; loadResponders()">Responders</a>
                <a class="nav-item" [class.active]="view==='users-citizens'" (click)="view='users-citizens'; loadCitizens()">Citizens</a>
            </ng-container>

            <ng-container *ngIf="userRole==='RESPONDER'">
                <a class="nav-item" [class.active]="view==='alerts'" (click)="view='alerts'; loadAlerts()">Active Alerts</a>
            </ng-container>

            <ng-container *ngIf="userRole==='CITIZEN'">
                <a class="nav-item" [class.active]="view==='alerts'" (click)="view='alerts'; loadAlerts()">Alerts Feed</a>
            </ng-container>
        </nav>
        <div class="nav-logout" (click)="logout()">Logout</div>
    </aside>

    <!-- Main Content -->
    <main class="main-panel">
        <header class="top-header">
            <h2>
              <span *ngIf="view==='home'">Dashboard</span>
              <span *ngIf="view==='profile'">Profile Settings</span>
              <span *ngIf="view==='alerts'">{{ userRole === 'CITIZEN' ? 'Alerts Feed' : 'Active Alerts' }}</span>
              <span *ngIf="view==='responders'">Responder Region Management</span>
              <span *ngIf="view==='admin-acks'">Alert Acknowledgments</span>
              <span *ngIf="view==='users-responders'">Responder Management</span>
              <span *ngIf="view==='users-citizens'">Citizen Accounts</span>
            </h2>
            <div style="display: flex; align-items: center; gap: 12px; font-size: 0.85rem;">
               <span style="color: var(--text-muted); font-weight: 500;">{{ userEmail }}</span>
               <span class="badge badge-neutral">{{ userRole }}</span>
            </div>
        </header>

        <div class="content-area">
            
            <div *ngIf="statusMessage" class="card" [style.background]="statusType==='success' ? 'var(--success-bg)' : 'var(--danger-bg)'" 
                 [style.color]="statusType==='success' ? 'var(--success)' : 'var(--danger)'" 
                 style="padding: 12px; margin-bottom: 24px; border: 1px solid currentColor;">
                {{ statusMessage }}
            </div>

            <!-- ============ HOME / STATS (ADMIN) ============ -->
            <div *ngIf="view==='home' && userRole==='ADMIN'">
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-label">Total Events</div>
                        <div class="summary-value">{{ stats.totalEvents || 0 }}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Pending</div>
                        <div class="summary-value" style="color: var(--warning);">{{ stats.pendingEvents || 0 }}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Verified</div>
                        <div class="summary-value" style="color: var(--success);">{{ stats.verifiedEvents || 0 }}</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Rejected</div>
                        <div class="summary-value" style="color: var(--danger);">{{ stats.rejectedEvents || 0 }}</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Recent Verified Disasters</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Location</th><th>Source</th><th>Time</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let e of recentEvents">
                                    <td><strong>{{ e.title }}</strong></td>
                                    <td><span class="badge badge-neutral">{{ e.disasterType }}</span></td>
                                    <td><span class="badge" [ngClass]="sevBadge(e.severity)">{{ e.severity }}</span></td>
                                    <td>{{ e.country || 'N/A' }} <span *ngIf="e.state">· {{ e.state }}</span></td>
                                    <td>{{ e.source }}</td>
                                    <td style="color: var(--text-muted); font-size: 11px;">{{ formatDate(e.eventTime) }}</td>
                                </tr>
                                <tr *ngIf="recentEvents.length===0"><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">No verified events yet.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ============ HOME (CITIZEN / RESPONDER) ============ -->
            <div *ngIf="view==='home' && userRole!=='ADMIN'">
                <div class="summary-grid" style="margin-bottom: 24px;">
                    <div class="summary-card">
                        <div class="summary-label">Active Alerts (Region)</div>
                        <div class="summary-value" [style.color]="alerts.length > 0 ? 'var(--danger)' : 'var(--success)'">
                            {{ alerts.length }}
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">{{ userRole === 'RESPONDER' ? 'My Response Region' : 'My Current Region' }}</div>
                        <div class="summary-value" style="font-size: 1.1rem; padding-top: 8px;">
                            {{ profile.country || 'Not Set' }}
                            <div style="font-size: 0.8rem; opacity: 0.8;">{{ profile.state || '-' }}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Recent Alerts in Your Area</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Type</th><th>Alert Message</th><th>Severity</th><th>Time</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let a of alerts.slice(0, 5)">
                                    <td><span class="badge badge-neutral">{{ a.disasterType }}</span></td>
                                    <td><div style="font-weight: 600;">{{ a.message }}</div></td>
                                    <td><span class="badge" [ngClass]="sevBadge(a.severity)">{{ a.severity }}</span></td>
                                    <td style="color: var(--text-muted); font-size: 11px;">{{ formatDate(a.createdAt) }}</td>
                                </tr>
                                <tr *ngIf="alerts.length===0"><td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted);">No active alerts for your region.</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top: 20px; display: flex; justify-content: center;">
                        <button class="btn btn-outline" (click)="view='alerts'; loadAlerts()">View All Full Alerts</button>
                    </div>
                </div>
            </div>

            <!-- ============ ALERTS (CITIZEN + RESPONDER) ============ -->
            <div *ngIf="view==='alerts'">
                <div class="card" style="padding-bottom: 0;">
                    <div class="card-title">Alerts Feed</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <label class="summary-label">Filter</label>
                            <select class="form-input" style="width: 180px;" [(ngModel)]="alertFilter" (ngModelChange)="applyAlertFilter()">
                                <option value="">All Types</option>
                                <option *ngFor="let t of disasterTypes" [value]="t">{{ t }}</option>
                            </select>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
                           Region: {{ profile.country || '-' }} / {{ profile.state || '-' }}
                        </div>
                    </div>

                    <div *ngFor="let a of filteredAlerts" style="padding: 20px; border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 16px; border-left: 4px solid;"
                         [style.border-left-color]="getSevColor(a.severity)">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; gap: 8px;">
                                <span class="badge" [ngClass]="sevBadge(a.severity)">{{ a.severity }}</span>
                                <span class="badge badge-neutral">{{ a.disasterType }}</span>
                            </div>
                            <span style="font-size: 11px; color: var(--text-muted);">{{ formatDate(a.createdAt) }}</span>
                        </div>
                        <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 8px;">{{ a.message }}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
                           📍 {{ a.country }} · {{ a.state }} <span *ngIf="a.city">· {{ a.city }}</span>
                        </p>
                        
                        <div *ngIf="userRole==='RESPONDER'" style="padding-top: 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                            <button class="btn btn-sm btn-primary" (click)="acknowledgeAlert(a)" *ngIf="!isAcknowledged(a.disasterId)">
                                Acknowledge
                            </button>
                            <span *ngIf="isAcknowledged(a.disasterId)" style="font-size: 0.8rem; color: var(--success); font-weight: 700;">
                               ✓ Acknowledged
                            </span>
                        </div>
                        
                        <div *ngIf="userRole==='CITIZEN'" style="padding: 12px; background: var(--bg-app); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--secondary); border-left: 3px solid var(--accent);">
                           <strong>Safety Tip:</strong> {{ getSafetyTip(a.disasterType) }}
                        </div>
                    </div>

                    <div *ngIf="filteredAlerts.length===0" style="text-align: center; padding: 60px;">
                        <p style="color: var(--text-muted); font-size: 1.1rem;">No alerts for your region.</p>
                    </div>
                </div>
            </div>

            <!-- ============ RESPONDER REGIONS (ADMIN) ============ -->
            <div *ngIf="view==='responders' && userRole==='ADMIN'">
                <div class="card">
                    <div class="card-title">Responder Region Management</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Responder Details</th><th>Phone</th><th>Country</th><th>State</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let r of responders">
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary);">{{ r.fullName || '-' }}</div>
                                        <div style="font-size: 11px; color: var(--text-muted);">{{ r.email }}</div>
                                    </td>
                                    <td style="font-size: 0.85rem; font-weight: 500;">{{ r.phoneNumber || '-' }}</td>
                                    <td>
                                        <select class="form-input" style="height: 32px; padding: 0 8px; font-size: 0.75rem;" 
                                                [(ngModel)]="r.editCountry" (ngModelChange)="onResponderCountryChange(r)">
                                            <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select class="form-input" style="height: 32px; padding: 0 8px; font-size: 0.75rem;" [(ngModel)]="r.editState">
                                            <option *ngFor="let s of (responderStates[r.id] || [])" [value]="s">{{ s }}</option>
                                        </select>
                                    </td>
                                    <td><button class="btn btn-sm btn-primary" (click)="saveResponderRegion(r)">Save</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ============ RESPONDER MANAGEMENT (ADMIN) ============ -->
            <div *ngIf="view==='users-responders'">
                <!-- List View -->
                <div class="card" *ngIf="!selectedUser">
                    <div class="card-title">Responder Directory</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Profile Location</th><th>Deployment</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let r of allResponders">
                                    <td><strong>{{ r.fullName || '-' }}</strong></td>
                                    <td>{{ r.email }}</td>
                                    <td>{{ r.phoneNumber || '-' }}</td>
                                    <td style="font-size: 0.8rem;">{{ r.country }} / {{ r.state }}</td>
                                    <td style="font-size: 0.8rem; color: var(--accent);">{{ r.country }} / {{ r.state }}</td>
                                    <td><span class="badge badge-success">Active</span></td>
                                    <td><button class="btn btn-sm btn-outline" (click)="viewUserProfile(r)">View Details</button></td>
                                </tr>
                                <tr *ngIf="allResponders.length===0"><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">No responders found.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Detail View -->
                <div *ngIf="selectedUser">
                    <button class="btn btn-sm btn-outline" (click)="selectedUser=null" style="margin-bottom: 20px;">← Back to List</button>
                    
                    <div class="card" style="padding: 0; overflow: hidden;">
                        <div style="background: var(--bg-card); padding: 32px; border-bottom: 1px solid var(--border);">
                            <div style="display: flex; gap: 24px; align-items: center;">
                                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                                    {{ selectedUser.fullName?.[0] || 'R' }}
                                </div>
                                <div>
                                    <h3 style="font-size: 1.5rem; margin: 0; color: var(--primary);">{{ selectedUser.fullName || '-' }}</h3>
                                    <p style="margin: 4px 0 0; color: var(--text-muted);">Responder Personnel #{{ selectedUser.id }}</p>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border);">
                            <!-- Personal Info -->
                            <div style="background: white; padding: 32px;">
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px;">Personal Info</h4>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Full Name</label>
                                    <div style="font-weight: 600;">{{ selectedUser.fullName || '-' }}</div>
                                </div>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Email Address</label>
                                    <div style="font-weight: 600;">{{ selectedUser.email }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Phone Number</label>
                                    <div style="font-weight: 600;">{{ selectedUser.phoneNumber || '-' }}</div>
                                </div>
                            </div>

                            <!-- Profile Location -->
                            <div style="background: white; padding: 32px;">
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px;">Profile Location</h4>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Country (Set by user)</label>
                                    <div style="font-weight: 600;">{{ selectedUser.country || '-' }}</div>
                                </div>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">State (Set by user)</label>
                                    <div style="font-weight: 600;">{{ selectedUser.state || '-' }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">City</label>
                                    <div style="font-weight: 600;">{{ selectedUser.city || '-' }}</div>
                                </div>
                            </div>

                            <!-- Deployment Assignment -->
                            <div style="background: white; padding: 32px;">
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px;">Deployment Assignment</h4>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Assigned Country</label>
                                    <div style="font-weight: 600; color: var(--accent);">{{ selectedUser.country || '-' }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Assigned State</label>
                                    <div style="font-weight: 600; color: var(--accent);">{{ selectedUser.state || '-' }}</div>
                                </div>
                            </div>

                            <!-- Activity -->
                            <div style="background: white; padding: 32px;">
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px;">Activity History</h4>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Total Acknowledgments</label>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">{{ selectedUserStats.count || 0 }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="font-size: 0.7rem; opacity: 0.6;">Last Active acknowledgment</label>
                                    <div style="font-weight: 600;">{{ selectedUserStats.lastDate ? formatDate(selectedUserStats.lastDate) : 'No activity recorded' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============ CITIZEN ACCOUNTS (ADMIN) ============ -->
            <div *ngIf="view==='users-citizens'">
               <!-- List View -->
               <div class="card" *ngIf="!selectedUser">
                    <div class="card-title">Citizen Directory</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Country</th><th>State</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let c of allCitizens">
                                    <td><strong>{{ c.fullName || '-' }}</strong></td>
                                    <td>{{ c.email }}</td>
                                    <td>{{ c.country || '-' }}</td>
                                    <td>{{ c.state || '-' }}</td>
                                    <td><span class="badge badge-neutral">Active</span></td>
                                    <td><button class="btn btn-sm btn-outline" (click)="viewUserProfile(c)">View Profile</button></td>
                                </tr>
                                <tr *ngIf="allCitizens.length===0"><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">No citizen accounts found.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Detail View -->
                <div *ngIf="selectedUser">
                    <button class="btn btn-sm btn-outline" (click)="selectedUser=null" style="margin-bottom: 20px;">← Back to Directory</button>
                    
                    <div class="card" style="padding: 32px; max-width: 800px;">
                        <h3 style="font-size: 1.5rem; margin: 0 0 24px; color: var(--primary);">Citizen Profile Detail</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                            <div>
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Personal Info</h4>
                                <div class="form-group" style="margin-bottom: 20px;">
                                    <label class="form-label" style="opacity: 0.6;">Full Name</label>
                                    <div style="font-size: 1.1rem; font-weight: 600;">{{ selectedUser.fullName || '-' }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="opacity: 0.6;">Email Address</label>
                                    <div style="font-size: 1.1rem; font-weight: 600;">{{ selectedUser.email }}</div>
                                </div>
                            </div>

                            <div>
                                <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Profile Location</h4>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="opacity: 0.6;">Country</label>
                                    <div style="font-weight: 600;">{{ selectedUser.country || '-' }}</div>
                                </div>
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label" style="opacity: 0.6;">State</label>
                                    <div style="font-weight: 600;">{{ selectedUser.state || '-' }}</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="opacity: 0.6;">City</label>
                                    <div style="font-weight: 600;">{{ selectedUser.city || '-' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============ PROFILE ============ -->
            <div *ngIf="view==='profile'">
                <div class="card" style="max-width: 600px;">
                    <div class="card-title">Profile Settings</div>
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input class="form-input" type="text" [(ngModel)]="profile.fullName" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input class="form-input" type="text" [(ngModel)]="profile.phoneNumber" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Country</label>
                            <select class="form-input" [(ngModel)]="profile.country" (ngModelChange)="onProfileCountryChange()">
                                <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">State</label>
                            <select class="form-input" [(ngModel)]="profile.state">
                                <option *ngFor="let s of profileStates" [value]="s">{{ s }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">City</label>
                        <input class="form-input" type="text" [(ngModel)]="profile.city" />
                    </div>
                    <button class="btn btn-primary" style="margin-top: 12px;" (click)="saveProfile()">Save Profile</button>
                </div>
            </div>

            <!-- ============ ADMIN ACKS ============ -->
            <div *ngIf="view==='admin-acks' && userRole==='ADMIN'">
                <div class="card">
                    <div class="card-title">Responder Acknowledgments</div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead><tr><th>Disaster ID</th><th>Responder</th><th>Status</th><th>Time</th></tr></thead>
                            <tbody>
                                <tr *ngFor="let a of allAcks">
                                    <td><strong>#{{ a.disasterId }}</strong></td>
                                    <td>{{ a.responderEmail }}</td>
                                    <td><span class="badge badge-success">Acknowledged</span></td>
                                    <td style="color: var(--text-muted); font-size: 11px;">{{ formatDate(a.acknowledgedAt) }}</td>
                                </tr>
                                <tr *ngIf="allAcks.length===0"><td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted);">No acknowledgments yet.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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

    // User Management
    allResponders: any[] = [];
    allCitizens: any[] = [];
    selectedUser: any = null;
    selectedUserStats: any = { count: 0, lastDate: null };

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
        } else {
            this.loadAlerts();
        }
    }

    loadResponders() {
        this.selectedUser = null;
        this.loadAcks(); // Auto-load acknowledgments to ensure stats are fresh
        this.ds.getResponders().subscribe({
            next: (list: any[]) => {
                this.allResponders = (list || []).map((r: any) => ({
                    ...r,
                    email: r.user?.email || '-',
                    id: r.user?.id || r.id
                }));
            }
        });
    }

    loadCitizens() {
        this.selectedUser = null;
        this.ds.getCitizens().subscribe({
            next: (list: any[]) => {
                this.allCitizens = (list || []).map((c: any) => ({
                    ...c,
                    email: c.user?.email || '-',
                    id: c.user?.id || c.id
                }));
            }
        });
    }

    viewUserProfile(user: any) {
        this.selectedUser = user;
        this.selectedUserStats = { count: 0, lastDate: null };

        if (user.user?.role === 'RESPONDER' || this.view === 'users-responders') {
            const email = user.email || user.user?.email;
            const userAcks = this.allAcks.filter(a => a.responderEmail === email);
            this.selectedUserStats.count = userAcks.length;
            if (userAcks.length > 0) {
                const sorted = [...userAcks].sort((a, b) => new Date(b.acknowledgedAt).getTime() - new Date(a.acknowledgedAt).getTime());
                this.selectedUserStats.lastDate = sorted[0].acknowledgedAt;
            }
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
        this.ds.adminUpdateProfile(r.user?.id || r.id, {
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
        this.ds.getAllAcknowledgments().subscribe({
            next: (d: any) => {
                this.allAcks = d || [];
                if (this.selectedUser) this.viewUserProfile(this.selectedUser);
            },
            error: () => { }
        });
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
        if (s === 'CRITICAL') return '#B91C1C';
        if (s === 'HIGH') return '#C2410C';
        if (s === 'MEDIUM') return '#D97706';
        return '#16A34A';
    }

    getSafetyTip(type: string): string {
        const tips: any = {
            'EARTHQUAKE': 'Drop, Cover, and Hold On. Move away from windows.',
            'FLOOD': 'Move to higher ground. Avoid flood waters.',
            'CYCLONE': 'Stay indoors. Stock up on essentials.',
            'STORM': 'Stay indoors. Unplug electronics.',
            'FIRE': 'Evacuate immediately. Stay low.',
            'TSUNAMI': 'Move to high ground immediately.',
            'LANDSLIDE': 'Move away from the path of debris.',
            'DROUGHT': 'Conserve water.'
        };
        return tips[type] || 'Stay alert and follow local instructions.';
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
