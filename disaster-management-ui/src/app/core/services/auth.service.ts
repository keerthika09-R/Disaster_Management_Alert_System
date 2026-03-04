import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8082/api/auth';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.API}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getRole(): string | null {
    return this.tokenService.getRole();
  }

}
