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
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

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
    ProfileComponent,
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