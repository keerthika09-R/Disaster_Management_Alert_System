import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisasterService, DisasterEvent } from '../services/disaster.service';

const COUNTRY_STATES: { [key: string]: string[] } = {
    'India': ['Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Assam', 'Chhattisgarh', 'Jammu and Kashmir'],
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Japan': ['Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu', 'Tokyo'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Ontario', 'Quebec', 'Saskatchewan'],
    'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'Lower Saxony', 'North Rhine-Westphalia', 'Saxony'],
    'France': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine']
};

@Component({
    selector: 'app-disaster-monitor',
    templateUrl: './disaster-monitor.component.html',
    styles: []
})
export class DisasterMonitorComponent implements OnInit {

    activeTab = 'pending';
    statusMessage = '';
    statusType = '';
    syncing = false;

    // Tabs
    tabs = [
        { key: 'pending', label: 'Pending Review', count: 0 },
        { key: 'verified', label: 'Verified Alerts', count: 0 },
        { key: 'all', label: 'All Events', count: undefined },
        { key: 'create', label: 'Report New Event', count: undefined }
    ];

    // Data
    pendingEvents: DisasterEvent[] = [];
    verifiedEvents: DisasterEvent[] = [];
    allEvents: DisasterEvent[] = [];

    // Filter params
    filterType = '';
    filterSeverity = '';
    filterSearch = '';
    filteredEvents: DisasterEvent[] = [];

    // Pagination (Pending)
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;
    pageNumbers: number[] = [];
    paginatedEvents: DisasterEvent[] = [];

    // All tab filters
    filteredAllEvents: DisasterEvent[] = [];
    allFilterType = '';
    allFilterStatus = '';
    allFilterSearch = '';

    // Pagination (All)
    allCurrentPage = 1;
    allTotalPages = 1;
    allPageNumbers: number[] = [];
    paginatedAllEvents: DisasterEvent[] = [];

    // Editing
    editModal = false;
    editData: any = {};
    editEventId: number | null = null;
    editStates: string[] = [];

    // Creation
    newEvent: any = {
        title: '', description: '', disasterType: 'EARTHQUAKE', severity: 'MEDIUM',
        country: 'United States', state: '', city: '', locationName: '', latitude: 0, longitude: 0
    };
    newEventStates: string[] = [];

    // Constants
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

    approve(e: DisasterEvent) {
        this.ds.approveDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event verified.', 'success'); this.loadPending(); this.loadVerified(); },
            error: () => this.showStatus('Failed to verify.', 'error')
        });
    }

    reject(e: DisasterEvent) {
        this.ds.rejectDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event rejected.', 'success'); this.loadPending(); },
            error: () => this.showStatus('Failed to reject.', 'error')
        });
    }

    deleteEvent(e: DisasterEvent) {
        this.ds.deleteDisaster(e.id).subscribe({
            next: () => { this.showStatus('Event deleted.', 'success'); this.loadAll(); },
            error: () => this.showStatus('Deletion failed.', 'error')
        });
    }

    syncFromApi() {
        this.syncing = true;
        this.ds.syncFromApi().subscribe({
            next: () => {
                this.syncing = false;
                this.showStatus('Synchronization complete.', 'success');
                this.loadPending();
            },
            error: () => { this.syncing = false; this.showStatus('Sync failed.', 'error'); }
        });
    }

    openEditModal(e: DisasterEvent) {
        this.editEventId = e.id;
        this.editData = { ...e };
        this.editStates = COUNTRY_STATES[this.editData.country] || [];
        this.editModal = true;
    }

    saveEdit() {
        if (!this.editEventId) return;
        this.ds.editDisaster(this.editEventId, this.editData).subscribe({
            next: () => { this.editModal = false; this.showStatus('Event updated.', 'success'); this.loadTab(); },
            error: () => this.showStatus('Update failed.', 'error')
        });
    }

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
                    country: 'United States', state: '', city: '', locationName: '', latitude: 0, longitude: 0
                };
                this.activeTab = 'pending';
                this.loadPending();
            },
            error: () => this.showStatus('Submission failed.', 'error')
        });
    }

    formatDate(d: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
