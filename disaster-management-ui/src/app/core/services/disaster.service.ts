import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {

  api = "http://localhost:8082/api/disasters";
  alertApi = "http://localhost:8082/api/alerts";

  constructor(private http: HttpClient) { }

  getPending() {
    return this.http.get(this.api + "/pending");
  }

  getVerified() {
    return this.http.get(this.api + "/verified");
  }

  getById(id: number) {
    return this.http.get(this.api + "/" + id);
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

  acknowledgeAlert(id: number) {
    return this.http.post(this.alertApi + "/acknowledge/" + id, {}, { responseType: 'text' });
  }

  getAcknowledgments() {
    return this.http.get(this.alertApi + "/all-acknowledgments");
  }

  getMyAcknowledgments() {
    return this.http.get(this.alertApi + "/my-acknowledgments");
  }

  getAcknowledgmentsByDisaster(id: number) {
    return this.http.get(this.alertApi + "/disaster/" + id);
  }
}
