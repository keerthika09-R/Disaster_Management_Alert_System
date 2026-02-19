import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- Top Nav -->
    <nav class="top-nav">
      <div class="nav-brand">
        <div class="nav-logo">🛡️</div>
        <div class="nav-title">Disaster<span>AlertHub</span></div>
      </div>
      <div class="nav-links">
        <button class="nav-link" [class.active]="page==='home'" (click)="page='home'">Home</button>
        <button class="nav-link" [class.active]="page==='alerts'" (click)="page='alerts'; loadAlerts()">Alerts</button>
        <button class="nav-link" *ngIf="role==='ADMIN' || role==='RESPONDER'" [class.active]="page==='tasks'" (click)="page='tasks'; loadTasks()">Tasks</button>
        <button class="nav-link" *ngIf="role==='ADMIN'" [class.active]="page==='users'" (click)="page='users'; loadUsers()">Users</button>
        <button class="nav-link" [class.active]="page==='profile'" (click)="page='profile'; loadProfile()">Profile</button>
        <button class="nav-link" (click)="goToMonitor()">🌍 Monitor</button>
      </div>
      <div class="nav-right">
        <span class="nav-user">{{ email }}</span>
        <div class="nav-avatar">{{ email.charAt(0).toUpperCase() }}</div>
        <button class="nav-logout" (click)="logout()">Logout</button>
      </div>
    </nav>

    <div class="page-container">
      <!-- ===== HOME ===== -->
      <div *ngIf="page==='home'">
        <div class="page-title-row">
          <div>
            <h1 class="page-title">Welcome back, {{ email.split('@')[0] }}</h1>
            <p class="page-sub">Role: {{ role }} &bull; Dashboard overview</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#fee2e2;">🚨</div>
            <div><div class="stat-num">{{ myAlerts.length }}</div><div class="stat-label">My Alerts</div></div>
          </div>
          <div class="stat-card" *ngIf="role==='ADMIN'">
            <div class="stat-icon" style="background:#dbeafe;">👥</div>
            <div><div class="stat-num">{{ allUsers.length }}</div><div class="stat-label">Users</div></div>
          </div>
          <div class="stat-card" *ngIf="role==='ADMIN' || role==='RESPONDER'">
            <div class="stat-icon" style="background:#fef3c7;">📋</div>
            <div><div class="stat-num">{{ allTasks.length }}</div><div class="stat-label">Tasks</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#d1fae5;">✅</div>
            <div><div class="stat-num">{{ completedTasks }}</div><div class="stat-label">Completed</div></div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <div class="card">
              <div class="card-header"><div class="card-title">Recent Alerts</div></div>
              <div *ngIf="myAlerts.length===0" class="card-empty">No alerts at this time.</div>
              <div *ngFor="let a of myAlerts.slice(0,5)" class="list-item">
                <div class="list-dot" [ngClass]="{'dot-red':a.severity==='CRITICAL'||a.severity==='HIGH','dot-amber':a.severity==='MEDIUM','dot-green':a.severity==='LOW'}"></div>
                <div>
                  <div class="list-text">{{ a.message || a.region }}</div>
                  <div class="list-meta">{{ a.severity }} &bull; {{ a.region }} &bull; {{ a.createdAt | date:'medium' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="card contact-card">
              <div class="card-header"><div class="card-title">🆘 Emergency Contacts</div></div>
              <div class="contact-item"><span class="contact-name">Police</span><button class="contact-btn">📞</button></div>
              <div class="contact-item"><span class="contact-name">Fire Dept</span><button class="contact-btn">📞</button></div>
              <div class="contact-item"><span class="contact-name">Ambulance</span><button class="contact-btn">📞</button></div>
            </div>
            <div class="info-bar">🛡️ For emergencies, always dial your local emergency number.</div>
          </div>
        </div>
      </div>

      <!-- ===== ALERTS ===== -->
      <div *ngIf="page==='alerts'">
        <div class="page-title-row">
          <div>
            <h1 class="page-title">Alerts</h1>
            <p class="page-sub">{{ role==='ADMIN' ? 'All system alerts' : 'Alerts for your region' }}</p>
          </div>
          <button *ngIf="role==='ADMIN'" class="btn-primary btn-sm" (click)="showCreateAlert=true">+ Create Alert</button>
        </div>

        <!-- Admin Create Alert Form -->
        <div *ngIf="showCreateAlert && role==='ADMIN'" class="card">
          <div class="card-header"><div class="card-title">Create New Alert</div></div>
          <div class="card-body">
            <div class="inline-form">
              <select class="form-control" [(ngModel)]="newAlert.region">
                <option value="">Region</option>
                <option value="North">North</option><option value="South">South</option>
                <option value="East">East</option><option value="West">West</option>
                <option value="Central">Central</option>
              </select>
              <select class="form-control" [(ngModel)]="newAlert.severity">
                <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
              </select>
              <input class="form-control" placeholder="Alert message" [(ngModel)]="newAlert.message" />
              <button class="btn-primary btn-sm" (click)="createAlert()">Send</button>
              <button class="btn-outline" (click)="showCreateAlert=false">Cancel</button>
            </div>
          </div>
        </div>

        <div *ngIf="statusMsg" class="alert-msg" [ngClass]="statusType==='success'?'alert-success':'alert-error'">{{ statusMsg }}</div>

        <div class="card">
          <div *ngIf="myAlerts.length===0" class="card-empty">No alerts found.</div>
          <div *ngFor="let a of myAlerts" class="list-item">
            <div class="list-dot" [ngClass]="{'dot-red':a.severity==='CRITICAL'||a.severity==='HIGH','dot-amber':a.severity==='MEDIUM','dot-green':a.severity==='LOW'}"></div>
            <div style="flex:1">
              <div class="list-text">{{ a.message }}</div>
              <div class="list-meta">{{ a.severity }} &bull; {{ a.region }} &bull; {{ a.createdBy }} &bull; {{ a.createdAt | date:'medium' }}</div>
            </div>
            <span class="pill" [ngClass]="{'pill-red':a.severity==='CRITICAL'||a.severity==='HIGH','pill-amber':a.severity==='MEDIUM','pill-green':a.severity==='LOW'}">{{ a.severity }}</span>
          </div>
        </div>
      </div>

      <!-- ===== TASKS ===== -->
      <div *ngIf="page==='tasks'">
        <div class="page-title-row">
          <div>
            <h1 class="page-title">Tasks</h1>
            <p class="page-sub">{{ role==='ADMIN' ? 'Manage rescue task assignments' : 'Your assigned tasks' }}</p>
          </div>
          <button *ngIf="role==='ADMIN'" class="btn-primary btn-sm" (click)="showCreateTask=true">+ Assign Task</button>
        </div>

        <!-- Admin Create Task Form -->
        <div *ngIf="showCreateTask && role==='ADMIN'" class="card">
          <div class="card-header"><div class="card-title">Assign New Task</div></div>
          <div class="card-body">
            <div class="inline-form">
              <input class="form-control" placeholder="Task title" [(ngModel)]="newTask.title" />
              <input class="form-control" placeholder="Description" [(ngModel)]="newTask.description" />
              <input class="form-control" placeholder="Responder email" [(ngModel)]="newTask.assignedTo" />
              <select class="form-control" [(ngModel)]="newTask.priority">
                <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
              </select>
              <button class="btn-primary btn-sm" (click)="createTask()">Create</button>
              <button class="btn-outline" (click)="showCreateTask=false">Cancel</button>
            </div>
          </div>
        </div>

        <div *ngIf="statusMsg" class="alert-msg" [ngClass]="statusType==='success'?'alert-success':'alert-error'">{{ statusMsg }}</div>

        <div class="card">
          <div *ngIf="allTasks.length===0" class="card-empty">No tasks found.</div>
          <table *ngIf="allTasks.length>0">
            <thead>
              <tr>
                <th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th>
                <th *ngIf="role==='RESPONDER'">Action</th>
                <th *ngIf="role==='ADMIN'">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of allTasks">
                <td><strong>{{ t.title }}</strong><br><small style="color:var(--text-muted)">{{ t.description }}</small></td>
                <td>{{ t.assignedTo }}</td>
                <td>
                  <span class="pill" [ngClass]="{'pill-amber':t.status==='PENDING','pill-blue':t.status==='ONGOING'||t.status==='IN_PROGRESS','pill-green':t.status==='COMPLETED','pill-red':t.status==='CANCELLED'}">{{ t.status }}</span>
                </td>
                <td>{{ t.priority }}</td>
                <td *ngIf="role==='RESPONDER'">
                  <select class="form-control" style="width:auto;padding:0.3rem 0.5rem;font-size:0.8rem" [(ngModel)]="t._newStatus" (change)="updateTaskStatus(t)">
                    <option value="" disabled selected>Update</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </td>
                <td *ngIf="role==='ADMIN'">
                  <button class="btn-danger-sm" (click)="deleteTask(t.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== USERS (Admin only) ===== -->
      <div *ngIf="page==='users'">
        <div class="page-title-row">
          <div>
            <h1 class="page-title">Users</h1>
            <p class="page-sub">All registered users</p>
          </div>
        </div>

        <div class="card">
          <div *ngIf="allUsers.length===0" class="card-empty">No users found.</div>
          <table *ngIf="allUsers.length>0">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Region</th><th>Phone</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of allUsers">
                <td>{{ u.fullName || u.name || '-' }}</td>
                <td>{{ u.email }}</td>
                <td><span class="pill pill-blue">{{ u.role }}</span></td>
                <td>{{ u.region || u.location || '-' }}</td>
                <td>{{ u.phoneNumber || u.phone || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== PROFILE ===== -->
      <div *ngIf="page==='profile'">
        <div class="page-title-row">
          <div>
            <h1 class="page-title">My Profile</h1>
            <p class="page-sub">View and update your details</p>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-control" [(ngModel)]="profile.fullName" />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-control" [value]="email" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone</label>
                <input class="form-control" [(ngModel)]="profile.phoneNumber" />
              </div>
              <div class="form-group">
                <label>Region</label>
                <select class="form-control" [(ngModel)]="profile.region">
                  <option value="">Select region</option>
                  <option value="North">North</option><option value="South">South</option>
                  <option value="East">East</option><option value="West">West</option>
                  <option value="Central">Central</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <input class="form-control" [(ngModel)]="profile.address" placeholder="Your address" />
            </div>
            <div *ngIf="statusMsg" class="alert-msg" [ngClass]="statusType==='success'?'alert-success':'alert-error'" style="margin-top:1rem">{{ statusMsg }}</div>
            <button class="btn-primary btn-sm" style="margin-top:1rem" (click)="updateProfile()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = 'http://localhost:8443/api';
  page = 'home';
  email = '';
  role = '';

  // Data
  myAlerts: any[] = [];
  allTasks: any[] = [];
  allUsers: any[] = [];
  profile: any = {};
  completedTasks = 0;

  // Forms
  showCreateAlert = false;
  showCreateTask = false;
  newAlert: any = { region: '', severity: 'MEDIUM', message: '' };
  newTask: any = { title: '', description: '', assignedTo: '', priority: 'MEDIUM' };
  statusMsg = '';
  statusType = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    const token = localStorage.getItem('jwt_token');
    if (!token) { this.router.navigate(['/login']); return; }
    this.email = localStorage.getItem('user_email') || '';
    this.role = localStorage.getItem('user_role') || '';

    this.loadAlerts();
    if (this.role === 'ADMIN' || this.role === 'RESPONDER') this.loadTasks();
    if (this.role === 'ADMIN') this.loadUsers();
    this.loadProfile();
  }

  // ── Alerts ──
  loadAlerts() {
    const url = this.role === 'ADMIN'
      ? `${this.api}/alerts/all`
      : `${this.api}/alerts/my-alerts`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => { this.myAlerts = data || []; },
      error: () => { this.myAlerts = []; }
    });
  }

  createAlert() {
    this.http.post(`${this.api}/alerts/create`, this.newAlert).subscribe({
      next: () => {
        this.showStatus('Alert created successfully!', 'success');
        this.showCreateAlert = false;
        this.newAlert = { region: '', severity: 'MEDIUM', message: '' };
        this.loadAlerts();
      },
      error: () => { this.showStatus('Failed to create alert.', 'error'); }
    });
  }

  // ── Tasks ──
  loadTasks() {
    const url = this.role === 'ADMIN'
      ? `${this.api}/tasks/all`
      : `${this.api}/tasks/my-tasks`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.allTasks = (data || []).map(t => ({ ...t, _newStatus: '' }));
        this.completedTasks = this.allTasks.filter(t => t.status === 'COMPLETED').length;
      },
      error: () => { this.allTasks = []; }
    });
  }

  createTask() {
    this.http.post(`${this.api}/tasks/create`, this.newTask).subscribe({
      next: () => {
        this.showStatus('Task assigned successfully!', 'success');
        this.showCreateTask = false;
        this.newTask = { title: '', description: '', assignedTo: '', priority: 'MEDIUM' };
        this.loadTasks();
      },
      error: () => { this.showStatus('Failed to create task.', 'error'); }
    });
  }

  updateTaskStatus(task: any) {
    if (!task._newStatus) return;
    this.http.put(`${this.api}/tasks/${task.id}/status`, { status: task._newStatus }).subscribe({
      next: () => { this.showStatus('Task updated!', 'success'); this.loadTasks(); },
      error: () => { this.showStatus('Failed to update task.', 'error'); }
    });
  }

  deleteTask(id: number) {
    if (!confirm('Delete this task?')) return;
    this.http.delete(`${this.api}/tasks/${id}`).subscribe({
      next: () => { this.showStatus('Task deleted.', 'success'); this.loadTasks(); },
      error: () => { this.showStatus('Failed to delete.', 'error'); }
    });
  }

  // ── Users (Admin) ──
  loadUsers() {
    this.http.get<any[]>(`${this.api}/users/all`).subscribe({
      next: (data) => { this.allUsers = data || []; },
      error: () => { this.allUsers = []; }
    });
  }

  // ── Profile ──
  loadProfile() {
    this.http.get(`${this.api}/profile/my`).subscribe({
      next: (data: any) => { this.profile = data || {}; },
      error: () => { }
    });
  }

  updateProfile() {
    this.http.put(`${this.api}/profile/update`, this.profile).subscribe({
      next: () => { this.showStatus('Profile updated!', 'success'); },
      error: () => { this.showStatus('Failed to update profile.', 'error'); }
    });
  }

  // ── Navigation ──
  goToMonitor() { this.router.navigate(['/disaster-monitor']); }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    this.router.navigate(['/login']);
  }

  showStatus(msg: string, type: string) {
    this.statusMsg = msg;
    this.statusType = type;
    setTimeout(() => { this.statusMsg = ''; }, 3000);
  }
}
