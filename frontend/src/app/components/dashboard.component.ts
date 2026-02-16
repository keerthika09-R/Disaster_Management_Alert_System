import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo">🚨</span>
            <div>
              <h1>Disaster Management System</h1>
              <p>Emergency Response Dashboard</p>
            </div>
          </div>
          <div class="user-section">
            <div class="user-info">
              <div class="user-email">{{ myProfile.fullName || userEmail }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </header>

      <!-- Navigation Tabs -->
      <nav class="dashboard-nav">
        <div class="nav-tabs">
          <button 
            *ngIf="userRole === 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'overview'"
            (click)="activeTab = 'overview'">
            📊 Overview
          </button>
          <button 
            *ngIf="userRole === 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'tasks'"
            (click)="activeTab = 'tasks'">
            📋 Manage Tasks
          </button>
          <button 
            *ngIf="userRole === 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'users'"
            (click)="activeTab = 'users'">
            👥 View Users
          </button>
          <button 
            *ngIf="userRole === 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'alerts'"
            (click)="activeTab = 'alerts'">
            🚨 Broadcast Alerts
          </button>
          <button 
            *ngIf="userRole === 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'all-alerts'"
            (click)="activeTab = 'all-alerts'">
            🔔 All Alerts
          </button>
          <button 
            *ngIf="userRole === 'RESPONDER'"
            class="nav-tab" 
            [class.active]="activeTab === 'my-tasks'"
            (click)="activeTab = 'my-tasks'">
            ✅ My Tasks
          </button>
          <button 
            *ngIf="userRole !== 'ADMIN'"
            class="nav-tab" 
            [class.active]="activeTab === 'my-alerts'"
            (click)="activeTab = 'my-alerts'">
            🔔 My Alerts
          </button>
          <button 
            class="nav-tab" 
            [class.active]="activeTab === 'profile'"
            (click)="activeTab = 'profile'">
            👤 Profile
          </button>
        </div>
      </nav>

      <main class="dashboard-main">
        <!-- ADMIN: Overview -->
        <div *ngIf="userRole === 'ADMIN' && activeTab === 'overview'" class="content-section">
          <h2>System Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-title">Total Users</div>
                <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📋</div>
              <div class="stat-content">
                <div class="stat-title">Total Tasks</div>
                <div class="stat-value">{{ stats.totalTasks || 0 }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🚨</div>
              <div class="stat-content">
                <div class="stat-title">Active Alerts</div>
                <div class="stat-value">{{ stats.activeAlerts || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN: Manage Tasks -->
        <div *ngIf="userRole === 'ADMIN' && activeTab === 'tasks'" class="content-section">
          <h2>Manage Tasks</h2>
          <div class="task-form">
            <h3>Create New Task</h3>
            <div class="form-group">
              <label>Description</label>
              <input type="text" [(ngModel)]="newTask.description" placeholder="Enter task description">
            </div>
            <div class="form-group">
              <label>Assign To</label>
              <select [(ngModel)]="newTask.assignedTo">
                <option value="">Select responder</option>
                <option *ngFor="let responder of responders" [value]="responder.email">
                  {{ responder.fullName || responder.email }}
                </option>
              </select>
            </div>
            <button class="btn-primary" (click)="createTask()">Create Task</button>
          </div>
          
          <div class="task-list">
            <h3>All Tasks</h3>
            <div *ngFor="let task of tasks" class="task-item">
              <div class="task-header">
                <span class="task-title">{{ task.description }}</span>
                <span class="task-status" [class]="'status-' + task.status.toLowerCase()">{{ task.status }}</span>
              </div>
              <div class="task-details">
                <div>Assigned to: {{ task.assignedTo }}</div>
                <div>Created by: {{ task.assignedBy }}</div>
              </div>
              <div class="task-actions">
                <button class="btn-small" (click)="deleteTask(task.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN: View Users -->
        <div *ngIf="userRole === 'ADMIN' && activeTab === 'users'" class="content-section">
          <h2>View Users by Location</h2>
          <div class="location-filter">
            <label>Filter by Location:</label>
            <select [(ngModel)]="selectedLocation" (change)="filterUsers()">
              <option value="">All Locations</option>
              <option *ngFor="let location of locations" [value]="location">{{ location }}</option>
            </select>
          </div>
          
          <div class="users-grid">
            <div *ngFor="let user of filteredUsers" class="user-card">
              <div class="user-header">
                <div class="user-name">{{ user.fullName || user.email }}</div>
                <span class="user-role">{{ user.role }}</span>
              </div>
              <div class="user-details">
                <div>📧 {{ user.email }}</div>
                <div>📱 {{ user.phoneNumber || 'N/A' }}</div>
                <div>📍 {{ user.region || 'N/A' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN: Broadcast Alerts -->
        <div *ngIf="userRole === 'ADMIN' && activeTab === 'alerts'" class="content-section">
          <h2>Broadcast Alerts</h2>
          <div class="alert-form">
            <h3>Create New Alert</h3>
            <div class="form-group">
              <label>Region</label>
              <input type="text" [(ngModel)]="newAlert.region" placeholder="Enter region">
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea [(ngModel)]="newAlert.message" placeholder="Enter alert message"></textarea>
            </div>
            <div class="form-group">
              <label>Severity</label>
              <select [(ngModel)]="newAlert.severity">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <button class="btn-primary" (click)="createAlert()">Broadcast Alert</button>
          </div>
        </div>

        <!-- RESPONDER: My Tasks -->
        <div *ngIf="userRole === 'RESPONDER' && activeTab === 'my-tasks'" class="content-section">
          <h2>My Tasks</h2>
          <div *ngFor="let task of myTasks" class="task-item">
            <div class="task-header">
              <span class="task-title">{{ task.description }}</span>
              <span class="task-status" [class]="'status-' + task.status.toLowerCase()">{{ task.status }}</span>
            </div>
            <div class="task-details">
              <div>Assigned by: {{ task.assignedBy }}</div>
            </div>
            <div class="task-actions">
              <select [(ngModel)]="task.status" (change)="updateTaskStatus(task.id, task.status)">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ADMIN: All Alerts -->
        <div *ngIf="userRole === 'ADMIN' && activeTab === 'all-alerts'" class="content-section">
          <h2>All Alerts</h2>
          <div *ngFor="let alert of alerts" class="alert-item">
            <div class="alert-header">
              <span class="alert-title">{{ alert.region }} Alert</span>
              <span class="alert-severity" [class]="'severity-' + alert.severity.toLowerCase()">{{ alert.severity }}</span>
            </div>
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-meta">
              <div>Created by: {{ alert.createdBy }}</div>
              <div>{{ alert.createdAt | date:'short' }}</div>
            </div>
          </div>
        </div>

        <!-- Profile Section -->
        <div *ngIf="activeTab === 'profile'" class="content-section">
          <h2>My Profile</h2>
          <div class="profile-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="profileForm.fullName" placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" [(ngModel)]="profileForm.phoneNumber" placeholder="Enter your phone number">
            </div>
            <div class="form-group">
              <label>Region</label>
              <select [(ngModel)]="profileForm.region">
                <option value="">Select your region</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="Central">Central</option>
              </select>
            </div>
            <div class="form-group">
              <label>Email (Read-only)</label>
              <input type="email" [value]="userEmail" disabled>
            </div>
            <div class="form-group">
              <label>Role (Read-only)</label>
              <input type="text" [value]="userRole" disabled>
            </div>
            <button class="btn-primary" (click)="updateProfile()">Update Profile</button>
          </div>
        </div>

        <!-- RESPONDER/CITIZEN: My Alerts -->
        <div *ngIf="userRole !== 'ADMIN' && activeTab === 'my-alerts'" class="content-section">
          <h2>Alerts in Your Area</h2>
          <div *ngFor="let alert of alerts" class="alert-item">
            <div class="alert-header">
              <span class="alert-title">{{ alert.region }} Alert</span>
              <span class="alert-severity" [class]="'severity-' + alert.severity.toLowerCase()">{{ alert.severity }}</span>
            </div>
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-meta">
              <div>Created by: {{ alert.createdBy }}</div>
              <div>{{ alert.createdAt | date:'short' }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .dashboard-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo {
      font-size: 2rem;
    }

    .logo-section h1 {
      margin: 0;
      color: #1a202c;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .logo-section p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      text-align: right;
    }

    .user-email {
      color: #1a202c;
      font-weight: 600;
    }

    .user-role {
      color: #64748b;
      font-size: 0.875rem;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
    }

    .dashboard-nav {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem;
    }

    .nav-tabs {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 0.5rem;
    }

    .nav-tab {
      padding: 1rem 1.5rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: #64748b;
      transition: all 0.3s ease;
    }

    .nav-tab:hover {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .nav-tab.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .dashboard-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .content-section h2 {
      margin: 0 0 1.5rem 0;
      color: #1a202c;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-title {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      color: #1a202c;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .task-item,
    .alert-item,
    .user-card {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1rem;
    }

    .task-header,
    .alert-header,
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .task-title,
    .alert-title,
    .user-name {
      font-weight: 600;
      color: #1a202c;
    }

    .task-status,
    .alert-severity,
    .user-role {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-pending,
    .severity-low {
      background: #fef3c7;
      color: #92400e;
    }

    .status-in_progress,
    .severity-medium {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-completed,
    .severity-high {
      background: #dcfce7;
      color: #166534;
    }

    .severity-critical {
      background: #fee2e2;
      color: #dc2626;
    }

    .task-details,
    .alert-meta,
    .user-details {
      color: #64748b;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .task-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .btn-small {
      padding: 0.25rem 0.75rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .location-filter {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .alert-message {
      color: #374151;
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .profile-form {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .profile-form .form-group {
      margin-bottom: 1.5rem;
    }

    .profile-form label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }

    .profile-form input,
    .profile-form select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .profile-form input:disabled {
      background-color: #f3f4f6;
      color: #6b7280;
      cursor: not-allowed;
    }

    .profile-form .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .profile-form .btn-primary:hover {
      background: #2563eb;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-tabs {
        flex-wrap: wrap;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .profile-form {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  userEmail: string = '';
  userRole: string = '';
  activeTab: string = 'overview';
  stats: any = {};
  tasks: any[] = [];
  myTasks: any[] = [];
  users: any[] = [];
  alerts: any[] = [];
  regions: string[] = [];
  selectedRegion: string = '';
  newTask: any = { description: '', assignedTo: '' };
  newAlert: any = { region: '', message: '', severity: 'MEDIUM' };
  myProfile: any = {};
  profileForm: any = {
    fullName: '',
    phoneNumber: '',
    region: ''
  };
  userRegion: string = '';
  filteredUsers: any[] = [];
  locations: string[] = [];
  responders: any[] = [];
  selectedLocation: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.userRole = localStorage.getItem('user_role') || 'CITIZEN';
    this.userEmail = localStorage.getItem('user_email') || '';

    // Set default tab based on role
    if (this.userRole === 'ADMIN') {
      this.activeTab = 'overview';
    } else if (this.userRole === 'RESPONDER') {
      this.activeTab = 'my-tasks';
    } else {
      this.activeTab = 'my-alerts';
    }

    this.loadData();
  }

  loadData() {
    this.loadMyProfile();
    
    if (this.userRole === 'ADMIN') {
      this.loadAdminData();
      this.loadAllAlerts();
      return;
    }

    if (this.userRole === 'RESPONDER') {
      this.loadMyTasks();
    }
    this.loadMyProfileAndAlerts();
  }

  loadMyProfileAndAlerts() {
    this.http.get('http://localhost:8443/api/profile/my').subscribe({
      next: (profile: any) => {
        this.userRegion = profile?.region || '';
        this.loadAlertsByRegion();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.loadMyAlerts();
      }
    });
  }

  loadAdminData() {
    // Load statistics
    this.http.get('http://localhost:8443/api/tasks/statistics').subscribe({
      next: (data: any) => {
        this.stats.totalTasks = data.totalTasks || 0;
      },
      error: (err) => console.error('Error loading task stats:', err)
    });

    // Load all users
    this.loadUsers();

    // Load all tasks
    this.http.get('http://localhost:8443/api/tasks/all').subscribe({
      next: (data: any) => {
        this.tasks = data || [];
      },
      error: (err) => console.error('Error loading tasks:', err)
    });
  }

  loadUsers() {
    this.http.get('http://localhost:8443/api/users/all').subscribe({
      next: (data: any) => {
        this.users = data || [];
        this.filteredUsers = [...this.users];
        this.stats.totalUsers = this.users.length;
        this.extractLocations();
        this.extractResponders();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.stats.totalUsers = 0;
        // Fallback: try to load from tasks
        this.extractResponders();
      }
    });
  }

  extractLocations() {
    const locations = new Set<string>();
    this.filteredUsers.forEach((user: any) => {
      if (user.region) {
        locations.add(user.region);
      }
    });
    this.locations = Array.from(locations);
  }

  extractResponders() {
    this.responders = this.users.filter((user: any) => user.role === 'RESPONDER');
  }

  filterUsers() {
    if (this.selectedLocation) {
      this.filteredUsers = this.users.filter((user: any) => user.region === this.selectedLocation);
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  loadMyTasks() {
    this.http.get('http://localhost:8443/api/tasks/my-tasks').subscribe({
      next: (data: any) => {
        this.myTasks = data || [];
      },
      error: (err) => console.error('Error loading my tasks:', err)
    });
  }

  loadAllAlerts() {
    this.http.get('http://localhost:8443/api/alerts/all').subscribe({
      next: (data: any) => {
        this.alerts = data || [];
        this.stats.activeAlerts = this.alerts.length;
      },
      error: (err) => console.error('Error loading alerts:', err)
    });
  }

  loadAlertsByRegion() {
    if (!this.userRegion) {
      this.loadMyAlerts();
      return;
    }

    this.http.get(`http://localhost:8443/api/alerts/region/${encodeURIComponent(this.userRegion)}`).subscribe({
      next: (data: any) => {
        this.alerts = data || [];
      },
      error: (err) => {
        console.error('Error loading alerts by region:', err);
        this.loadMyAlerts();
      }
    });
  }

  loadMyAlerts() {
    this.http.get('http://localhost:8443/api/alerts/my-alerts').subscribe({
      next: (data: any) => {
        this.alerts = data || [];
      },
      error: (err) => console.error('Error loading my alerts:', err)
    });
  }

  createTask() {
    if (!this.newTask.description || !this.newTask.assignedTo) {
      alert('Please fill in all fields');
      return;
    }

    this.http.post('http://localhost:8443/api/tasks/create', {
      description: this.newTask.description,
      assignedTo: this.newTask.assignedTo
    }).subscribe({
      next: (response) => {
        console.log('Task created:', response);
        this.newTask = { description: '', assignedTo: '' };
        this.loadAdminData();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        alert('Failed to create task');
      }
    });
  }

  updateTaskStatus(taskId: number, status: string) {
    this.http.put(`http://localhost:8443/api/tasks/${taskId}/status`, {
      status: status
    }).subscribe({
      next: (response) => {
        console.log('Task status updated:', response);
        this.loadMyTasks();
        if (this.userRole === 'ADMIN') {
          this.loadAdminData();
        }
      },
      error: (err) => {
        console.error('Error updating task status:', err);
      }
    });
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.http.delete(`http://localhost:8443/api/tasks/${taskId}`).subscribe({
        next: (response) => {
          console.log('Task deleted:', response);
          this.loadAdminData();
        },
        error: (err) => {
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  createAlert() {
    if (!this.newAlert.region || !this.newAlert.message) {
      alert('Please fill in all fields');
      return;
    }

    this.http.post('http://localhost:8443/api/alerts/create', {
      region: this.newAlert.region,
      message: this.newAlert.message,
      severity: this.newAlert.severity
    }).subscribe({
      next: (response) => {
        console.log('Alert created:', response);
        this.newAlert = { region: '', message: '', severity: 'MEDIUM' };
        if (this.userRole === 'ADMIN') {
          this.loadAllAlerts();
        } else {
          this.loadMyAlerts();
        }
      },
      error: (err) => {
        console.error('Error creating alert:', err);
        alert('Failed to create alert');
      }
    });
  }

  loadMyProfile() {
    this.http.get('http://localhost:8443/api/profile/my').subscribe({
      next: (data: any) => {
        this.myProfile = data;
        this.profileForm = {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          region: data.region
        };
      },
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  updateProfile() {
    if (!this.profileForm.fullName || !this.profileForm.phoneNumber || !this.profileForm.region) {
      alert('Please fill in all fields');
      return;
    }

    this.http.put('http://localhost:8443/api/profile/update', this.profileForm).subscribe({
      next: (response) => {
        console.log('Profile updated:', response);
        alert('Profile updated successfully!');
        this.loadMyProfile();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Failed to update profile');
      }
    });
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    this.router.navigate(['/login']);
  }
}
