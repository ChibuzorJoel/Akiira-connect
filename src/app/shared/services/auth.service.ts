
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'freelancer' | 'employer';
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'freelancer' | 'employer';
  agreeToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'akiira_token';
  private readonly USER_KEY = 'akiira_user';

  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this.userSubject.asObservable();
  readonly isLoggedIn$ = this.user$.pipe(map(u => !!u));

  get currentUser(): AuthUser | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  constructor(private http: HttpClient, private router: Router) {}

  login(creds: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API + '/login', creds).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.persistSession(res.user, creds.rememberMe);
        }
      }),
      catchError(err => throwError(() => err.error?.message || 'Login failed.'))
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.API + '/register', data).pipe(
      tap(res => {
        if (res.success && res.user) {
          this.persistSession(res.user, false);
        }
      }),
      catchError(err => throwError(() => err.error?.message || 'Registration failed.'))
    );
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(this.API + '/forgot-password', { email })
      .pipe(catchError(err => throwError(() => err.error?.message || 'Failed.')));
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; resetToken: string }> {
    return this.http
      .post<{ success: boolean; resetToken: string }>(this.API + '/verify-otp', { email, otp })
      .pipe(catchError(err => throwError(() => err.error?.message || 'Invalid code.')));
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(this.API + '/reset-password', { email, otp, newPassword })
      .pipe(catchError(err => throwError(() => err.error?.message || 'Reset failed.')));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  loginWithGoogle(): void {
    window.location.href = this.API + '/google';
  }

  mockLogin(creds: LoginCredentials): Observable<AuthResponse> {
    const svc = this;
    return new Observable(observer => {
      setTimeout(() => {
        if (creds.email && creds.password.length >= 6) {
          const user: AuthUser = {
            id: 'usr_' + Math.random().toString(36).slice(2),
            fullName: 'Alex Kowalski',
            email: creds.email,
            role: 'freelancer',
            token: 'mock_' + Date.now(),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          svc.persistSession(user, creds.rememberMe);
          observer.next({ success: true, user });
          observer.complete();
        } else {
          observer.error('Invalid email or password.');
        }
      }, 1200);
    });
  }

  mockRegister(data: RegisterData): Observable<AuthResponse> {
    const svc = this;
    return new Observable(observer => {
      setTimeout(() => {
        if (data.email && data.password === data.confirmPassword) {
          const user: AuthUser = {
            id: 'usr_' + Math.random().toString(36).slice(2),
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            token: 'mock_' + Date.now(),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          svc.persistSession(user, false);
          observer.next({ success: true, user });
          observer.complete();
        } else {
          observer.error('Registration failed.');
        }
      }, 1400);
    });
  }

  mockForgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        if (email && email.includes('@')) {
          observer.next({ success: true, message: 'Code sent to ' + email });
          observer.complete();
        } else {
          observer.error('Please enter a valid email address.');
        }
      }, 1400);
    });
  }

  mockVerifyOtp(email: string, otp: string): Observable<{ success: boolean; resetToken: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        if (otp === '000000') {
          observer.error('Incorrect code.');
        } else if (otp.length === 6) {
          observer.next({ success: true, resetToken: 'mock_reset_' + Date.now() });
          observer.complete();
        } else {
          observer.error('Enter the complete 6-digit code.');
        }
      }, 1200);
    });
  }

  mockResetPassword(email: string, otp: string, newPassword: string): Observable<{ success: boolean }> {
    return new Observable(observer => {
      setTimeout(() => {
        if (newPassword && newPassword.length >= 8) {
          observer.next({ success: true });
          observer.complete();
        } else {
          observer.error('Password must be at least 8 characters.');
        }
      }, 1400);
    });
  }

  private persistSession(user: AuthUser, remember: boolean): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, user.token);
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
      if (!raw) { return null; }
      const user: AuthUser = JSON.parse(raw);
      if (user.expiresAt && Date.now() > user.expiresAt) {
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}