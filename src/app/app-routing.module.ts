// src/app/app-routing.module.ts — REPLACE YOUR ENTIRE FILE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }           from './pages/home/home.component';
import { LoginComponent }          from './pages/auth/login/login.component';
import { RegisterComponent }       from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { DashboardComponent }      from './pages/dashboard/dashboard.component';
import { ProfileComponent }        from './pages/profile/profile.component';

import { authGuard, guestGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  // ── Public ─────────────────────────────────────────────────
  {
    path: '',
    component: HomeComponent,
    title: 'Akiira Connect',
  },

  // ── Auth (guests only — logged-in users redirect to dashboard) ──
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard],
        title: 'Sign In — Akiira Connect',
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [guestGuard],
        title: 'Create Account — Akiira Connect',
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Reset Password — Akiira Connect',
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Protected (must be logged in) ───────────────────────────
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard — Akiira Connect',
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'My Profile — Akiira Connect',
  },

  // ── Fallback ────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}