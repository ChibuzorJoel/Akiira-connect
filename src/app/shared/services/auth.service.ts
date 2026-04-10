// src/app/shared/services/auth.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// BACKEND INTEGRATION Node.js + MongoDB Atlas
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthUser {
  id?:          string;
  fullName:     string;
  email:        string;
  role:         'freelancer' | 'employer';
  companyName?: string;
  onboarded?:   boolean;
  token:        string;
  expiresAt?:   number;
}

// ─── Storage keys ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'akiira_token';
const USER_KEY  = 'akiira_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API_URL = 'https://akiira-connect.onrender.com/api/auth';
  
  private _user$ = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this._user$.asObservable();

  get isLoggedIn(): boolean { 
    return !!this._user$.value && !!this.getToken(); 
  }
  
  get currentUser(): AuthUser | null { 
    return this._user$.value; 
  }
  
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  // ─── LOAD STORED SESSION ──────────────────────────────────────────────────
  private loadStoredUser(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(USER_KEY);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this._user$.next(user);
      } catch {
        this.logout();
      }
    }
  }

  // ─── REAL LOGIN ──────────────────────────────────────────────────────────
  login(credentials: { email: string; password: string; rememberMe?: boolean }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.handleAuthResponse(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ─── REAL REGISTER ───────────────────────────────────────────────────────
  register(payload: {
    fullName?:       string;
    email:           string;
    password:        string;
    confirmPassword: string;
    role:            'freelancer' | 'employer';
    agreeToTerms:    boolean;
    companyName?:    string;
    companySize?:    string;
    industry?:       string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, payload).pipe(
      tap((response: any) => {
        if (response.token) {
          this.handleAuthResponse(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ─── GET CURRENT USER (validate token) ───────────────────────────────────
  getCurrentUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    
    return this.http.get(`${this.API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        if (response.user) {
          const user: AuthUser = {
            ...response.user,
            token: token
          };
          this._user$.next(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }),
      catchError(this.handleError)
    );
  }

  // ─── COMPLETE ONBOARDING ─────────────────────────────────────────────────
  completeOnboarding(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    
    return this.http.post(`${this.API_URL}/complete-onboarding`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        if (response.user) {
          const currentUser = this.currentUser;
          if (currentUser) {
            const updatedUser = { ...currentUser, onboarded: true };
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            this._user$.next(updatedUser);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  // ─── UPDATE FREELANCER PROFILE ───────────────────────────────────────────
  updateFreelancerProfile(profileData: {
    headline?: string;
    bio?: string;
    location?: string;
    phone?: string;
    skills?: string[];
    hourlyRate?: number;
    availability?: string;
    jobTypes?: string[];
    remoteOnly?: boolean;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  }): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    
    return this.http.put(`${this.API_URL}/profile/freelancer`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ─── UPDATE EMPLOYER PROFILE ─────────────────────────────────────────────
  updateEmployerProfile(profileData: {
    companyWebsite?: string;
    companyDescription?: string;
    companyLogo?: string;
    headquarters?: string;
    foundedYear?: number;
    hiringRoles?: string[];
    remotePolicy?: string;
    companySize?: string;
    industry?: string;
  }): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    
    return this.http.put(`${this.API_URL}/profile/employer`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ─── GET USER PROFILE ────────────────────────────────────────────────────
  getUserProfile(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => 'No token found');
    }
    
    return this.http.get(`${this.API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ─── GOOGLE LOGIN (will implement OAuth later) ───────────────────────────
  loginWithGoogle(): void {
    // For now, redirect to backend Google OAuth
    window.location.href = `${this.API_URL}/google`;
  }

  // ─── PASSWORD RESET (real backend) ───────────────────────────────────────
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.API_URL}/verify-otp`, { email, otp }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, { email, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user$.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────
  private handleAuthResponse(response: any): void {
    // Store token
    localStorage.setItem(TOKEN_KEY, response.token);
    
    // Store user
    const user: AuthUser = {
      id: response.user.id,
      fullName: response.user.fullName,
      email: response.user.email,
      role: response.user.role,
      onboarded: response.user.onboarded || false,
      token: response.token
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid request';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Make sure the backend is running on port 5000';
    }
    
    console.error('Auth error:', errorMessage);
    return throwError(() => errorMessage);
  }
}