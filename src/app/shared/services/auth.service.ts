// src/app/shared/services/auth.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// KEY FIX: mockLogin now looks up the user in the registry first so that
// employers always come back as employers and freelancers as freelancers.
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthUser {
  fullName:     string;
  email:        string;
  role:         'freelancer' | 'employer';
  companyName?: string;
  token:        string;
  expiresAt:    number;
}

// ─── Storage keys ────────────────────────────────────────────────────────────
const SESSION_KEY  = 'akiira_user';
const TOKEN_KEY    = 'akiira_token';
const REGISTRY_KEY = 'akiira_user_registry';   // email → AuthUser map

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _user$ = new BehaviorSubject<AuthUser | null>(this._loadSession());
  readonly user$ = this._user$.asObservable();

  get isLoggedIn():  boolean         { return !!this._user$.value; }
  get currentUser(): AuthUser | null { return this._user$.value; }
  get token():       string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  constructor(private router: Router) {}

  // ─── MOCK LOGIN ──────────────────────────────────────────────────────────
  // Looks up the email in the registry so the stored role is preserved.
  // If the email has never been registered a demo freelancer session is created.
  mockLogin(creds: { email: string; password: string; rememberMe?: boolean }): Observable<AuthUser> {
    return new Observable(obs => {
      setTimeout(() => {
        if (!creds.email || creds.password.length < 6) {
          obs.error('Invalid email or password.');
          return;
        }

        // ── Try to find a previously registered user ─────────────────────
        const stored = this._findInRegistry(creds.email);

        const user: AuthUser = stored
          ? { ...stored, token: 'mock_' + Date.now(), expiresAt: Date.now() + 30 * 864e5 }
          : {
              // Fallback for demo logins that were never registered
              fullName:  this._nameFromEmail(creds.email),
              email:     creds.email,
              role:      'freelancer',         // default for unknown emails
              token:     'mock_' + Date.now(),
              expiresAt: Date.now() + 30 * 864e5,
            };

        this._persistSession(user, creds.rememberMe ?? false);
        obs.next(user);
        obs.complete();
      }, 900);
    });
  }

  // ─── MOCK REGISTER ───────────────────────────────────────────────────────
  mockRegister(payload: {
    fullName?:       string;
    email:           string;
    password:        string;
    confirmPassword: string;
    role:            'freelancer' | 'employer';
    agreeToTerms:    boolean;
    companyName?:    string;
    companySize?:    string;
    industry?:       string;
  }): Observable<AuthUser> {

    return new Observable(obs => {
      setTimeout(() => {
        // Block duplicate emails
        if (this._findInRegistry(payload.email)) {
          obs.error('An account with this email already exists.');
          return;
        }

        const user: AuthUser = {
          fullName:    payload.fullName || this._nameFromEmail(payload.email),
          email:       payload.email,
          role:        payload.role,              // ← preserved exactly
          companyName: payload.companyName,
          token:       'mock_' + Date.now(),
          expiresAt:   Date.now() + 30 * 864e5,
        };

        // Save to registry so future logins restore the correct role
        this._saveToRegistry(user);

        // Create active session
        this._persistSession(user, false);
        obs.next(user);
        obs.complete();
      }, 900);
    });
  }

  // ─── GOOGLE (mock) ────────────────────────────────────────────────────────
  loginWithGoogle(): void {
    const user: AuthUser = {
      fullName:  'Google User',
      email:     'user@gmail.com',
      role:      'freelancer',
      token:     'google_' + Date.now(),
      expiresAt: Date.now() + 30 * 864e5,
    };
    this._persistSession(user, true);
    this.router.navigate(['/onboarding']);
  }

  // ─── PASSWORD RESET (mock) ────────────────────────────────────────────────
  forgotPassword(email: string): Observable<void> {
    if (!email.includes('@')) return throwError(() => 'Enter a valid email.').pipe(delay(600));
    return new Observable(obs => { setTimeout(() => { obs.next(); obs.complete(); }, 1000); });
  }

  verifyOtp(email: string, otp: string): Observable<void> {
    if (otp === '000000' || otp.length < 4)
      return throwError(() => 'Invalid or incorrect code.').pipe(delay(600));
    return new Observable(obs => { setTimeout(() => { obs.next(); obs.complete(); }, 800); });
  }

  resetPassword(email: string, newPw: string): Observable<void> {
    if (newPw.length < 8)
      return throwError(() => 'Password must be at least 8 characters.').pipe(delay(600));
    return new Observable(obs => { setTimeout(() => { obs.next(); obs.complete(); }, 900); });
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    this._user$.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────
  private _persistSession(user: AuthUser, remember: boolean): void {
    const json = JSON.stringify(user);
    localStorage.setItem(SESSION_KEY, json);
    localStorage.setItem(TOKEN_KEY, user.token);
    if (remember) {
      sessionStorage.setItem(SESSION_KEY, json);
      sessionStorage.setItem(TOKEN_KEY, user.token);
    }
    this._user$.next(user);
  }

  private _loadSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const u: AuthUser = JSON.parse(raw);
      if (u.expiresAt && Date.now() > u.expiresAt) {
        this.logout();
        return null;
      }
      return u;
    } catch { return null; }
  }

  // User registry — persists registered accounts by email
  private _findInRegistry(email: string): AuthUser | null {
    try {
      const reg: Record<string, AuthUser> = JSON.parse(
        localStorage.getItem(REGISTRY_KEY) || '{}'
      );
      return reg[email.toLowerCase()] || null;
    } catch { return null; }
  }

  private _saveToRegistry(user: AuthUser): void {
    try {
      const reg: Record<string, AuthUser> = JSON.parse(
        localStorage.getItem(REGISTRY_KEY) || '{}'
      );
      reg[user.email.toLowerCase()] = user;
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
    } catch {}
  }

  private _nameFromEmail(email: string): string {
    return email.split('@')[0]
      .replace(/[._\-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}