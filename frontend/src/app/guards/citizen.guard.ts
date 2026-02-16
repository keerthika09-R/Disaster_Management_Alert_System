import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class CitizenGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('user_role');
    
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    
    if (userRole !== 'CITIZEN') {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
}
