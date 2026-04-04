// src/app/app-routing.module.ts — FINAL with company-onboarding route
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }              from './pages/home/home.component';
import { LoginComponent }             from './pages/auth/login/login.component';
import { RegisterComponent }          from './pages/auth/register/register.component';
import { ForgotPasswordComponent }    from './pages/auth/forgot-password/forgot-password.component';
import { OnboardingComponent }        from './pages/onboarding/onboarding.component';
import { CompanyOnboardingComponent } from './pages/company-onboarding/company-onboarding.component';
import { DashboardComponent }         from './pages/dashboard/dashboard.component';
import { ProfileComponent }           from './pages/profile/profile.component';
import { JobsComponent }              from './pages/jobs/jobs.component';
import { JobDetailComponent }         from './pages/job-detail/job-detail.component';
import { SettingsComponent }          from './pages/settings/settings.component';
import { NotFoundComponent }          from './pages/not-found/not-found.component';
import { CompaniesComponent }         from './pages/companies/companies.component';
import { CompanyDetailComponent }     from './pages/company-detail/company-detail.component';
import { ResourcesComponent }         from './pages/resources/resources.component';
import { SalaryGuideComponent }       from './pages/salary-guide/salary-guide.component';
import { PostJobComponent }           from './pages/post-job/post-job.component';
import { TalentComponent }            from './pages/talent/talent.component';
import { PricingComponent }           from './pages/pricing/pricing.component';

import { authGuard, guestGuard, onboardingGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  { path: '',        component: HomeComponent    },
  { path: 'pricing', component: PricingComponent },
  { path: 'auth', children: [
    { path: 'login',           component: LoginComponent,           canActivate: [guestGuard] },
    { path: 'register',        component: RegisterComponent,        canActivate: [guestGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
  ]},
  { path: 'onboarding',         component: OnboardingComponent,        canActivate: [onboardingGuard] },
  { path: 'company-onboarding', component: CompanyOnboardingComponent, canActivate: [onboardingGuard] },
  { path: 'dashboard',     component: DashboardComponent,     canActivate: [authGuard] },
  { path: 'profile',       component: ProfileComponent,       canActivate: [authGuard] },
  { path: 'jobs',          component: JobsComponent,          canActivate: [authGuard] },
  { path: 'jobs/:id',      component: JobDetailComponent,     canActivate: [authGuard] },
  { path: 'companies',     component: CompaniesComponent,     canActivate: [authGuard] },
  { path: 'companies/:id', component: CompanyDetailComponent, canActivate: [authGuard] },
  { path: 'resources',     component: ResourcesComponent,     canActivate: [authGuard] },
  { path: 'salary-guide',  component: SalaryGuideComponent,   canActivate: [authGuard] },
  { path: 'post-job',      component: PostJobComponent,       canActivate: [authGuard] },
  { path: 'talent',        component: TalentComponent,        canActivate: [authGuard] },
  { path: 'settings',      component: SettingsComponent,      canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}