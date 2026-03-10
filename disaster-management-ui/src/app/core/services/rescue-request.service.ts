import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RescueRequestService {

  private api = 'http://localhost:8082/api/rescue-requests';

  constructor(private http: HttpClient) {}

  createRequest(payload: any) {
    return this.http.post(this.api, payload);
  }

  getMyRequests() {
    return this.http.get(this.api + '/my');
  }

  getAvailableRequests() {
    return this.http.get(this.api + '/available');
  }

  acceptRequest(id: number) {
    return this.http.post(this.api + '/' + id + '/accept', {});
  }

  getAllRequests() {
    return this.http.get(this.api);
  }
}
