import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8082/api/analytics';

  constructor(private http: HttpClient) { }

  getDashboardAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }
}
