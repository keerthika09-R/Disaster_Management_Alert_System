import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {

  api = "http://localhost:8082/api/disasters";

  constructor(private http: HttpClient) { }

  getPending() {
    return this.http.get(this.api + "/pending");
  }

  getVerified() {
    return this.http.get(this.api + "/verified");
  }

  getResolved() {
    return this.http.get(this.api + "/resolved");
  }

  approve(id: number) {
    return this.http.post(this.api + "/" + id + "/approve", {});
  }

  reject(id: number) {
    return this.http.post(this.api + "/" + id + "/reject", {});
  }

  sync() {
    return this.http.post(this.api + "/sync", {}, { responseType: 'text' });
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  updateStatus(id: number, status: string) {
    return this.http.put(`${this.api}/${id}/status?status=${status}`, {});
  }

  acknowledgeTask(id: number) {
    return this.http.post(`http://localhost:8082/api/alerts/acknowledge/${id}`, {}, { responseType: 'text' });
  }

  getAcknowledgedTasks() {
    return this.http.get<any[]>('http://localhost:8082/api/alerts/all-acknowledgments');
  }

  submitHelpRequest(data: any) {
    return this.http.post('http://localhost:8082/api/help-requests/submit', data);
  }

  getAllHelpRequests() {
    return this.http.get<any[]>('http://localhost:8082/api/help-requests/all');
  }

  getHelpRequestsByResponder(email: string) {
    return this.http.get<any[]>(`http://localhost:8082/api/help-requests/responder/${email}`);
  }

  updateHelpRequestStatus(id: number, status: string) {
    return this.http.put(`http://localhost:8082/api/help-requests/${id}/status?status=${status}`, {});
  }
}