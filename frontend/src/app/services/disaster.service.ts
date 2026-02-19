import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DisasterEvent {
    id: number;
    title: string;
    description: string;
    disasterType: string;
    severity: string;
    latitude: number;
    longitude: number;
    locationName: string;
    source: string;
    eventTime: string;
    status: string;
    createdAt: string;
    createdBy: string;
    approvedBy: string;
    approvedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DisasterService {
    private baseUrl = 'http://localhost:8443/api';

    constructor(private http: HttpClient) { }

    // Public endpoints
    getVerifiedDisasters(filters?: any): Observable<DisasterEvent[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.type) params = params.set('type', filters.type);
            if (filters.severity) params = params.set('severity', filters.severity);
            if (filters.location) params = params.set('location', filters.location);
        }
        return this.http.get<DisasterEvent[]>(`${this.baseUrl}/disasters`, { params });
    }

    getStatistics(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/disasters/statistics`);
    }

    // Admin endpoints
    getPendingDisasters(): Observable<DisasterEvent[]> {
        return this.http.get<DisasterEvent[]>(`${this.baseUrl}/admin/disasters/pending`);
    }

    getAllDisasters(): Observable<DisasterEvent[]> {
        return this.http.get<DisasterEvent[]>(`${this.baseUrl}/admin/disasters/all`);
    }

    approveDisaster(id: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/disasters/${id}/approve`, {});
    }

    rejectDisaster(id: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/disasters/${id}/reject`, {});
    }

    editDisaster(id: number, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/admin/disasters/${id}/edit`, data);
    }

    createDisaster(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/disasters/create`, data);
    }

    deleteDisaster(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/admin/disasters/${id}`);
    }

    syncFromApi(): Observable<any> {
        return this.http.post(`${this.baseUrl}/admin/disasters/sync`, {});
    }

    getAdminStatistics(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/admin/disasters/statistics`);
    }
}
