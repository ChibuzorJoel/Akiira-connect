// src/app/app-routing.module.ts — COMPLETE FINAL
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }              from './pages/home/home.component';
import { LoginComponent }             from './pages/auth/login/login.component';
import { RegisterComponent }          from './pages/auth/register/register.component';
import { ForgotPasswordComponent }    from './pages/auth/forgot-password/forgot-password.component';
import { OnboardingComponent } from './pages/Individual/onboarding/onboarding.component';
import { CompanyOnboardingComponent } from './pages/Company/company-onboarding/company-onboarding.component';
import { DashboardComponent } from './pages/Individual/dashboard/dashboard.component';
import { ProfileComponent } from './pages/Individual/profile/profile.component';
import { JobsComponent }              from './pages/jobs/jobs.component';
import { JobDetailComponent }         from './pages/job-detail/job-detail.component';
import { SalaryGuideComponent }       from './pages/salary-guide/salary-guide.component';
import { ResourcesComponent }         from './pages/resources/resources.component';
import { CompaniesComponent } from './pages/Company/companies/companies.component';
import { CompanyDetailComponent } from './pages/Company/company-detail/company-detail.component';
import { TalentComponent }            from './pages/talent/talent.component';
import { PostJobComponent }           from './pages/post-job/post-job.component';
import { SettingsComponent }          from './pages/settings/settings.component';
import { PricingComponent }           from './pages/pricing/pricing.component';
import { NotFoundComponent }          from './pages/not-found/not-found.component';
import { MessagesComponent }          from './pages/messages/messages.component';
import { EmployerDashboardComponent } from './pages/Company/employer-dashboard/employer-dashboard.component';
import { EmployerProfileComponent } from './pages/Company/employer-profile/employer-profile.component';

import { authGuard, guestGuard, onboardingGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  // ── Public ──────────────────────────────────────────
  { path: '',        component: HomeComponent    },
  { path: 'pricing', component: PricingComponent },

  // ── Auth ─────────────────────────────────────────────
  { path: 'auth', children: [
    { path: 'login',           component: LoginComponent,        canActivate: [guestGuard] },
    { path: 'register',        component: RegisterComponent,     canActivate: [guestGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  ]},

  // ── Onboarding ───────────────────────────────────────
  { path: 'onboarding',         component: OnboardingComponent,        canActivate: [onboardingGuard] },
  { path: 'company-onboarding', component: CompanyOnboardingComponent, canActivate: [onboardingGuard] },

  // ── FREELANCER routes ─────────────────────────────────
  { path: 'dashboard',   component: DashboardComponent,   canActivate: [authGuard] },
  { path: 'profile',     component: ProfileComponent,     canActivate: [authGuard] },
  { path: 'jobs',        component: JobsComponent,        canActivate: [authGuard] },
  { path: 'jobs/:id',    component: JobDetailComponent,   canActivate: [authGuard] },
  { path: 'salary-guide',component: SalaryGuideComponent, canActivate: [authGuard] },
  { path: 'resources',   component: ResourcesComponent,   canActivate: [authGuard] },

  // ── EMPLOYER routes ───────────────────────────────────
  { path: 'employer-dashboard', component: EmployerDashboardComponent, canActivate: [authGuard] },
  { path: 'employer-profile',   component: EmployerProfileComponent,   canActivate: [authGuard] },

  // ── SHARED routes (both roles) ────────────────────────
  { path: 'companies',     component: CompaniesComponent,    canActivate: [authGuard] },
  { path: 'companies/:id', component: CompanyDetailComponent,canActivate: [authGuard] },
  { path: 'talent',        component: TalentComponent,       canActivate: [authGuard] },
  { path: 'post-job',      component: PostJobComponent,      canActivate: [authGuard] },
  { path: 'messages',      component: MessagesComponent,     canActivate: [authGuard] },
  { path: 'settings',      component: SettingsComponent,     canActivate: [authGuard] },

  // ── 404 ──────────────────────────────────────────────
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}