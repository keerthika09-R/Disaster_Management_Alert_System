import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IncidentReportService {
    private apiUrl = 'http://localhost:8082/api/reports';

    constructor(private http: HttpClient) { }

    submitReport(reportData: { rescueTaskId: number; reportText: string; imageFile: File }): Observable<any> {
        const formData = new FormData();
        formData.append('rescueTaskId', reportData.rescueTaskId.toString());
        formData.append('reportText', reportData.reportText);
        formData.append('imageFile', reportData.imageFile);
        return this.http.post(`${this.apiUrl}/submit`, formData);
    }

    getReportsByTask(taskId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/task/${taskId}`);
    }

    getAllReports(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/all`);
    }
}
