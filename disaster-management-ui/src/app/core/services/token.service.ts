import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private TOKEN_KEY = 'auth_token';
  private ROLE_KEY = 'user_role';
  private ID_KEY = 'user_id';

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveRole(role: string) {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  saveUserId(id: number) {
    localStorage.setItem(this.ID_KEY, id.toString());
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.ID_KEY);
    return id ? parseInt(id, 10) : null;
  }

  clear() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return this.getToken() != null;
  }
}
