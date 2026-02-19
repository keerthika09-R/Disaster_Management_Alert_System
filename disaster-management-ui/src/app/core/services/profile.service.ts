import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private API = "http://localhost:8082/api/profile";

  constructor(private http: HttpClient) {}

  getProfile() {

    const token = localStorage.getItem("token");

    return this.http.get(this.API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

  }

}
