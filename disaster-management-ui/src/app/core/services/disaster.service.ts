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

  approve(id: number) {
    return this.http.post(this.api + "/" + id + "/approve", {});
  }

  reject(id: number) {
    return this.http.post(this.api + "/" + id + "/reject", {});
  }

  sync() {
    return this.http.post(this.api + "/sync", {}, { responseType: 'text' });
  }
}