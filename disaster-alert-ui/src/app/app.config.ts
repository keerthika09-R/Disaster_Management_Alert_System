import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },

      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },

      // default route
      { path: '', redirectTo: 'login', pathMatch: 'full' },

      // wildcard route
      { path: '**', redirectTo: 'login' }
    ])
  ]
};
