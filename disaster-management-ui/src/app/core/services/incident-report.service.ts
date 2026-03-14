import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IncidentReportService {
    private apiUrl = 'http://localhost:8082/api/reports';

    constructor(private http: HttpClient) { }

    submitReport(reportData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/submit`, reportData);
    }

    getReportsByTask(taskId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/task/${taskId}`);
    }

    getAllReports(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/all`);
    }
}
