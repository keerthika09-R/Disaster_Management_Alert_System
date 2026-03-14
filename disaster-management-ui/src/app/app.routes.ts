import { Routes } from '@angular/router';

import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ResponderDashboardComponent } from './pages/responder-dashboard/responder-dashboard.component';
import { ResponderApprovedDisastersComponent } from './pages/responder-approved-disasters/responder-approved-disasters.component';
import { ResponderTaskDetailsComponent } from './pages/responder-task-details/responder-task-details.component';
import { CitizenDashboardComponent } from './pages/citizen-dashboard/citizen-dashboard.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import { ProfileComponent } from './pages/profile/profile.component';


export const routes: Routes = [

  { path: '', component: LandingComponent },

  { path: 'login', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },

  {
    path: 'responder/dashboard',
    component: ResponderDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONDER' }
  },

  {
    path: 'responder/approved',
    component: ResponderApprovedDisastersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONDER' }
  },

  {
    path: 'responder/task/:id',
    component: ResponderTaskDetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONDER' }
  },

  {
    path: 'citizen/dashboard',
    component: CitizenDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'CITIZEN' }
  },

  {
    path: 'profile',
    component: ProfileComponent
  }



];
