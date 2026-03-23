import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API = 'http://localhost:8082/api/users';

  constructor(private http: HttpClient) {}

  getResponders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/responders`);
  }
}
