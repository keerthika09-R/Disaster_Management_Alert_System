import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RescueTaskService {
    private apiUrl = 'http://localhost:8082/api/tasks';

    constructor(private http: HttpClient) { }

    assignTask(taskData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/assign`, taskData);
    }

    getTasksByResponder(responderId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/responder/${responderId}`);
    }

    getTasksByDisasterEvent(disasterEventId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/disaster/${disasterEventId}`);
    }

    getTaskById(taskId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${taskId}`);
    }

    getAllTasks(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/all`);
    }

    updateTaskStatus(taskId: number, status: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${taskId}/status?status=${status}`, {});
    }
}
