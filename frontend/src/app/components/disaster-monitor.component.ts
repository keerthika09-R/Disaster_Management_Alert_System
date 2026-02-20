import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisasterService, DisasterEvent } from '../services/disaster.service';

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
    selector: 'app-disaster-monitor',
    templateUrl: './disaster-monitor.component.html',
    styles: [`
    .tab-btn {
      padding: 10px 18px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
      font-family: var(--font);
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tab-btn:hover { color: var(--text-primary); }
    .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }
    .tab-count {
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 10px;
    }
  `]
})
export class DisasterMonitorComponent implements OnInit {

    activeTab = 'pending';
    statusMessage = '';
    statusType = '';
    syncing = false;

    // Tabs
    tabs = [
        { key: 'pending', label: '⏳ Pending', count: 0 },
        { key: 'verified', label: '✓ Verified', count: 0 },
        { key: 'all', label: '📋 All Events', count: undefined },
        { key: 'create', label: '+ Report Event', count: undefined }
    ];

    // Data
    pendingEvents: DisasterEvent[] = [];
    verifiedEvents: DisasterEvent[] = [];
    allEvents: DisasterEvent[] = [];

    // Pending filters + pagination
    filteredEvents: DisasterEvent[] = [];
    filterType = '';
    filterSeverity = '';
    filterSearch = '';
    currentPage = 1;
    pageSize = 8;
    totalPages = 1;
    pageNumbers: number[] = [];
    paginatedEvents: DisasterEvent[] = [];

    // All tab filters + pagination
    filteredAllEvents: DisasterEvent[] = [];
    allFilterType = '';
    allFilterStatus = '';
    allFilterSearch = '';
    allCurrentPage = 1;
    allTotalPages = 1;
    allPageNumbers: number[] = [];
    paginatedAllEvents: DisasterEvent[] = [];

    // Edit modal
    editModal = false;
    editData: any = {};
    editStates: string[] = [];
    editEventId: number | null = null;

    // Create form
    newEvent: any = {
        title: '', description: '', disasterType: 'EARTHQUAKE', severity: 'MEDIUM',
        country: '', state: '', city: '', locationName: '', latitude: 0, longitude: 0
    };
    newEventStates: string[] = [];

    // Options
    disasterTypes = ['FLOOD', 'CYCLONE', 'EARTHQUAKE', 'FIRE', 'STORM', 'TSUNAMI', 'LANDSLIDE', 'DROUGHT', 'OTHER'];
    severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    countryList = Object.keys(COUNTRY_STATES);

    constructor(private ds: DisasterService, private router: Router) { }

    ngOnInit() { this.loadTab(); }

    goBack() { this.router.navigate(['/dashboard']); }

    loadTab() {
        if (this.activeTab === 'pending') this.loadPending();
        else if (this.activeTab === 'verified') this.loadVerified();
        else if (this.activeTab === 'all') this.loadAll();
    }

    // ── Data loading ──
    loadPending() {
        this.ds.getPendingDisasters().subscribe({
            next: (d: DisasterEvent[]) => {
                this.pendingEvents = d || [];
                this.tabs[0].count = this.pendingEvents.length;
                this.applyFilters();
            }, error: () => { }
        });
    }

    loadVerified() {
        this.ds.getVerifiedDisasters().subscribe({
            next: (d: DisasterEvent[]) => {
                this.verifiedEvents = d || [];
                this.tabs[1].count = this.verifiedEvents.length;
            }, error: () => { }
        });
    }

    loadAll() {
        this.ds.getAllDisasters().subscribe({
            next: (d: DisasterEvent[]) => {
                this.allEvents = d || [];
                this.applyAllFilters();
            }, error: () => { }
        });
    }

    // ── Pending Filters ──
    applyFilters() {
        let list = [...this.pendingEvents];
        if (this.filterType) list = list.filter(e => e.disasterType === this.filterType);
        if (this.filterSeverity) list = list.filter(e => e.severity === this.filterSeverity);
        if (this.filterSearch) {
            const q = this.filterSearch.toLowerCase();
            list = list.filter(e =>
                (e.title || '').toLowerCase().includes(q) ||
                (e.country || '').toLowerCase().includes(q) ||
                (e.state || '').toLowerCase().includes(q)
            );
        }
        this.filteredEvents = list;
        this.currentPage = 1;
        this.updatePagination();
    }

    updatePagination() {
        this.totalPages = Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize));
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        const start = (this.currentPage - 1) * this.pageSize;
        this.paginatedEvents = this.filteredEvents.slice(start, start + this.pageSize);
    }

    goToPage(p: number) {
        if (p < 1 || p > this.totalPages) return;
        this.currentPage = p;
        this.updatePagination();
    }

    // ── All Tab Filters ──
    applyAllFilters() {
        let list = [...this.allEvents];
        if (this.allFilterType) list = list.filter(e => e.disasterType === this.allFilterType);
        if (this.allFilterStatus) list = list.filter(e => e.status === this.allFilterStatus);
        if (this.allFilterSearch) {
            const q = this.allFilterSearch.toLowerCase();
            list = list.filter(e =>
                (e.title || '').toLowerCase().includes(q) ||
                (e.country || '').toLowerCase().includes(q) ||
                (e.state || '').toLowerCase().includes(q)
            );
        }
        this.filteredAllEvents = list;
        this.allCurrentPage = 1;
        this.updateAllPagination();
    }

    updateAllPagination() {
        this.allTotalPages = Math.max(1, Math.ceil(this.filteredAllEvents.length / this.pageSize));
        this.allPageNumbers = Array.from({ length: this.allTotalPages }, (_, i) => i + 1);
        const start = (this.allCurrentPage - 1) * this.pageSize;
        this.paginatedAllEvents = this.filteredAllEvents.slice(start, start + this.pageSize);
    }

    allGoToPage(p: number) {
        if (p < 1 || p > this.allTotalPages) return;
        this.allCurrentPage = p;
        this.updateAllPagination();
    }

    // ── Actions ──
    approve(e: DisasterEvent) {
        this.ds.approveDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event verified and alert broadcast.', 'success'); this.loadPending(); this.loadVerified(); },
            error: () => this.showStatus('Failed to verify.', 'error')
        });
    }

    reject(e: DisasterEvent) {
        this.ds.rejectDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event rejected.', 'info'); this.loadPending(); },
            error: () => this.showStatus('Failed to reject.', 'error')
        });
    }

    deleteEvent(e: DisasterEvent) {
        this.ds.deleteDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event deleted.', 'info'); this.loadAll(); },
            error: () => this.showStatus('Failed to delete.', 'error')
        });
    }

    syncFromApi() {
        this.syncing = true;
        this.ds.syncFromApi().subscribe({
            next: () => {
                this.syncing = false;
                this.showStatus('Sync complete. New events loaded.', 'success');
                this.loadPending();
            },
            error: () => { this.syncing = false; this.showStatus('Sync failed.', 'error'); }
        });
    }

    // ── Edit Modal ──
    openEditModal(e: DisasterEvent) {
        this.editEventId = e.id;
        this.editData = {
            title: e.title, description: e.description, disasterType: e.disasterType,
            severity: e.severity, country: e.country || '', state: e.state || '', city: e.city || '',
            locationName: e.locationName
        };
        this.editStates = COUNTRY_STATES[this.editData.country] || [];
        this.editModal = true;
    }

    onEditCountryChange() {
        this.editStates = COUNTRY_STATES[this.editData.country] || [];
        this.editData.state = '';
    }

    saveEdit() {
        if (!this.editEventId) return;
        this.ds.editDisaster(this.editEventId, this.editData).subscribe({
            next: () => {
                this.editModal = false;
                this.showStatus('Event updated.', 'success');
                this.loadTab();
            },
            error: () => this.showStatus('Failed to update.', 'error')
        });
    }

    // ── Create ──
    onNewCountryChange() {
        this.newEventStates = COUNTRY_STATES[this.newEvent.country] || [];
        this.newEvent.state = '';
    }

    createEvent() {
        this.ds.createDisaster(this.newEvent).subscribe({
            next: () => {
                this.showStatus('Event created.', 'success');
                this.newEvent = {
                    title: '', description: '', disasterType: 'EARTHQUAKE', severity: 'MEDIUM',
                    country: '', state: '', city: '', locationName: '', latitude: 0, longitude: 0
                };
                this.activeTab = 'pending';
                this.loadPending();
            },
            error: () => this.showStatus('Failed to create event.', 'error')
        });
    }

    // ── Helpers ──
    formatDate(d: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    sevBadge(s: string): string {
        if (s === 'CRITICAL' || s === 'HIGH') return 'badge-danger';
        if (s === 'MEDIUM') return 'badge-warning';
        return 'badge-success';
    }

    statusBadge(s: string): string {
        if (s === 'VERIFIED') return 'badge-success';
        if (s === 'PENDING') return 'badge-warning';
        return 'badge-danger';
    }

    showStatus(msg: string, type: string) {
        this.statusMessage = msg;
        this.statusType = type;
        setTimeout(() => { this.statusMessage = ''; }, 3500);
    }
}
