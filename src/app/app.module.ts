// src/app/app.module.ts
// ================================================================
// REPLACE YOUR ENTIRE app.module.ts WITH THIS FILE
// ================================================================
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { HttpClientModule,
         HTTP_INTERCEPTORS }    from '@angular/common/http';
import { ReactiveFormsModule }  from '@angular/forms';
import { FormsModule }          from '@angular/forms';

import { AppRoutingModule }     from './app-routing.module';
import { AppComponent }         from './app.component';

// Layout
import { HeaderComponent }      from './layout/header/header.component';
import { FooterComponent }      from './layout/footer/footer.component';

// Pages
import { HomeComponent }           from './pages/home/home.component';
import { LoginComponent }          from './pages/auth/login/login.component';
import { RegisterComponent }       from './pages/auth/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';

// Interceptor
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { DashboardComponent } from './pages/Individual/dashboard/dashboard.component';
import { ProfileComponent } from './pages/Individual/profile/profile.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { JobDetailComponent } from './pages/job-detail/job-detail.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CompaniesComponent } from './pages/Company/companies/companies.component';
import { CompanyDetailComponent } from './pages/Company/company-detail/company-detail.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { SalaryGuideComponent } from './pages/salary-guide/salary-guide.component';
import { PostJobComponent } from './pages/post-job/post-job.component';
import { OnboardingComponent } from './pages/Individual/onboarding/onboarding.component';
import { TalentComponent } from './pages/talent/talent.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { CompanyOnboardingComponent } from './pages/Company/company-onboarding/company-onboarding.component';
import { EmployerDashboardComponent } from './pages/Company/employer-dashboard/employer-dashboard.component';
import { EmployerProfileComponent } from './pages/Company/employer-profile/employer-profile.component';
import { MessagesComponent } from './pages/messages/messages.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    JobsComponent,
    JobDetailComponent,
    SettingsComponent,
    ProfileComponent,
    NotFoundComponent,
    CompaniesComponent,
    CompanyDetailComponent,
    ResourcesComponent,
    SalaryGuideComponent,
    PostJobComponent,
    OnboardingComponent,
    TalentComponent,
    PricingComponent,
    CompanyOnboardingComponent,
    EmployerDashboardComponent,
    EmployerProfileComponent,
    MessagesComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,       // ✅ exports RouterModule → fixes routerLink, router-outlet
    HttpClientModule,
    ReactiveFormsModule,    // ✅ fixes [formGroup], formControlName
    FormsModule,            // ✅ fixes [(ngModel)]
  ],
  providers: [
    {
      provide:  HTTP_INTERCEPTORS,
      useClass: authInterceptor,
      multi:    true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}