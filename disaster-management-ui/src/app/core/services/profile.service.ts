import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private API = "http://localhost:8082/api/profile";

  constructor(private http: HttpClient) { }

  getProfile(): Observable<any> {
    return this.http.get(this.API);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(this.API, data);
  }

}
