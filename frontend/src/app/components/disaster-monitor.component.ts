import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DisasterService, DisasterEvent } from '../services/disaster.service';

@Component({
    selector: 'app-disaster-monitor',
    templateUrl: './disaster-monitor.component.html',
    styleUrls: ['./disaster-monitor.component.css']
})
export class DisasterMonitorComponent implements OnInit {
    userEmail = '';
    userRole = '';
    activeTab = 'live-dashboard';
    myProfile: any = {};

    // Data
    verifiedEvents: DisasterEvent[] = [];
    pendingEvents: DisasterEvent[] = [];
    allEvents: DisasterEvent[] = [];
    stats: any = {};
    filteredEvents: DisasterEvent[] = [];

    // Filters
    filterType = '';
    filterSeverity = '';
    filterLocation = '';

    // Create form
    showCreateForm = false;
    showEditModal = false;
    editingEvent: DisasterEvent | null = null;
    createForm: any = {
        title: '', description: '', disasterType: 'EARTHQUAKE',
        severity: 'MEDIUM', latitude: null, longitude: null,
        locationName: '', source: 'MANUAL'
    };

    // State
    isLoading = false;
    isSyncing = false;
    statusMessage = '';
    statusType = '';

    disasterTypes = ['FLOOD', 'CYCLONE', 'EARTHQUAKE', 'FIRE', 'STORM', 'TSUNAMI', 'LANDSLIDE', 'DROUGHT', 'OTHER'];
    severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    constructor(
        private router: Router,
        private http: HttpClient,
        private disasterService: DisasterService
    ) { }

    ngOnInit() {
        const token = localStorage.getItem('jwt_token');
        if (!token) { this.router.navigate(['/login']); return; }
        this.userEmail = localStorage.getItem('user_email') || '';
        this.userRole = localStorage.getItem('user_role') || '';
        this.loadProfile();
        this.loadDashboardData();
    }

    loadProfile() {
        this.http.get('http://localhost:8443/api/profile/my').subscribe({
            next: (data: any) => { this.myProfile = data; },
            error: () => { }
        });
    }

    loadDashboardData() {
        this.isLoading = true;
        this.disasterService.getVerifiedDisasters().subscribe({
            next: (data: DisasterEvent[]) => { this.verifiedEvents = data; this.filteredEvents = data; this.isLoading = false; },
            error: () => { this.isLoading = false; }
        });
        this.disasterService.getStatistics().subscribe({
            next: (data: any) => { this.stats = data; },
            error: () => { }
        });
        if (this.userRole === 'ADMIN') {
            this.disasterService.getPendingDisasters().subscribe({
                next: (data: DisasterEvent[]) => { this.pendingEvents = data; },
                error: () => { }
            });
            this.disasterService.getAllDisasters().subscribe({
                next: (data: DisasterEvent[]) => { this.allEvents = data; },
                error: () => { }
            });
        }
    }

    applyFilters() {
        const filters: any = {};
        if (this.filterType) filters.type = this.filterType;
        if (this.filterSeverity) filters.severity = this.filterSeverity;
        if (this.filterLocation) filters.location = this.filterLocation;
        this.disasterService.getVerifiedDisasters(filters).subscribe({
            next: (data: DisasterEvent[]) => { this.filteredEvents = data; },
            error: () => { }
        });
    }

    clearFilters() {
        this.filterType = '';
        this.filterSeverity = '';
        this.filterLocation = '';
        this.filteredEvents = this.verifiedEvents;
    }

    approveEvent(id: number) {
        this.disasterService.approveDisaster(id).subscribe({
            next: () => { this.showStatus('Alert approved & published!', 'success'); this.loadDashboardData(); },
            error: () => { this.showStatus('Failed to approve', 'error'); }
        });
    }

    rejectEvent(id: number) {
        this.disasterService.rejectDisaster(id).subscribe({
            next: () => { this.showStatus('Alert rejected', 'info'); this.loadDashboardData(); },
            error: () => { this.showStatus('Failed to reject', 'error'); }
        });
    }

    deleteEvent(id: number) {
        if (!confirm('Delete this event permanently?')) return;
        this.disasterService.deleteDisaster(id).subscribe({
            next: () => { this.showStatus('Event deleted', 'info'); this.loadDashboardData(); },
            error: () => { this.showStatus('Failed to delete', 'error'); }
        });
    }

    syncApi() {
        this.isSyncing = true;
        this.disasterService.syncFromApi().subscribe({
            next: () => { this.isSyncing = false; this.showStatus('Synced from USGS API!', 'success'); this.loadDashboardData(); },
            error: () => { this.isSyncing = false; this.showStatus('Sync failed', 'error'); }
        });
    }

    submitCreate() {
        this.disasterService.createDisaster(this.createForm).subscribe({
            next: () => {
                this.showStatus('Event created!', 'success');
                this.createForm = { title: '', description: '', disasterType: 'EARTHQUAKE', severity: 'MEDIUM', latitude: null, longitude: null, locationName: '', source: 'MANUAL' };
                this.loadDashboardData();
            },
            error: () => { this.showStatus('Failed to create', 'error'); }
        });
    }

    openEditModal(event: DisasterEvent) {
        this.editingEvent = { ...event };
        this.showEditModal = true;
    }

    closeEditModal() { this.showEditModal = false; this.editingEvent = null; }

    submitEdit() {
        if (!this.editingEvent) return;
        this.disasterService.editDisaster(this.editingEvent.id, this.editingEvent).subscribe({
            next: () => { this.showStatus('Event updated!', 'success'); this.closeEditModal(); this.loadDashboardData(); },
            error: () => { this.showStatus('Failed to update', 'error'); }
        });
    }

    showStatus(msg: string, type: string) {
        this.statusMessage = msg;
        this.statusType = type;
        setTimeout(() => { this.statusMessage = ''; }, 3500);
    }

    getTypeIcon(type: string): string {
        const icons: any = { EARTHQUAKE: '🌍', FLOOD: '🌊', CYCLONE: '🌀', FIRE: '🔥', STORM: '⛈️', TSUNAMI: '🌊', LANDSLIDE: '⛰️', DROUGHT: '☀️', OTHER: '⚠️' };
        return icons[type] || '⚠️';
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    getPageTitle(): string {
        const t: any = { 'live-dashboard': 'Live Dashboard', 'pending-review': 'Pending Review', 'all-events': 'All Events', 'create-event': 'Create Event', 'profile': 'Profile' };
        return t[this.activeTab] || 'Disaster Monitor';
    }

    getPageSubtitle(): string {
        const s: any = { 'live-dashboard': 'Real-time disaster monitoring from USGS API', 'pending-review': 'Review and verify incoming alerts', 'all-events': 'Complete event history', 'create-event': 'Manually report a disaster', 'profile': 'Your account details' };
        return s[this.activeTab] || '';
    }

    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        this.router.navigate(['/login']);
    }

    goToDashboard() { this.router.navigate(['/dashboard']); }
}
