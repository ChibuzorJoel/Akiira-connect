// src/app/app-routing.module.ts
// ================================================================
// REPLACE YOUR ENTIRE app-routing.module.ts WITH THIS FILE
// ================================================================
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }           from './pages/home/home.component';
import { LoginComponent }          from './pages/auth/login/login.component';
import { RegisterComponent }       from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '',                component: HomeComponent },
  { path: 'auth/login',      component: LoginComponent },
  { path: 'auth/register',   component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
   // Protected
   { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], title: 'Dashboard — Akiira Connect' },
  { path: '**',              redirectTo: '' },
];

// ✅ THIS CLASS IS THE FIX — was missing before
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}