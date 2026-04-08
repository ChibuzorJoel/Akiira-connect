// src/app/shared/services/user-profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface UserProfile {
  fullName?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;

  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;

  skills?: string[];
  availability?: string;
  hourlyRate?: string | number;
  jobTypes?: string[];
  remoteOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private STORAGE_KEY = 'akiira_user_profile';
  private API_URL = 'http://localhost:5000/api/auth';
  
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {
    // Load cached profile on init
    this.loadFromCache();
  }

  // ─── LOAD FROM CACHE ─────────────────────────────────────────
  private loadFromCache(): void {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const profile = JSON.parse(cached);
        this.profileSubject.next(profile);
      } catch (e) {
        console.error('Error loading cached profile:', e);
      }
    }
  }

  // ─── GET PROFILE (from backend, fallback to cache) ───────────
  getProfile(): Observable<UserProfile> {
    const token = this.auth.getToken();
    
    if (!token) {
      // Not logged in, return cached or empty
      return of(this.getCachedProfile());
    }

    // Try to get from backend first
    return this.http.get(`${this.API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map((response: any) => {
        let profile: UserProfile = {};
        
        if (response.role === 'freelancer') {
          // Map freelancer profile
          profile = {
            fullName: response.user?.fullName,
            headline: response.profile?.headline,
            bio: response.profile?.bio,
            location: response.profile?.location,
            phone: response.profile?.phone,
            skills: response.profile?.skills,
            availability: response.profile?.availability,
            hourlyRate: response.profile?.hourlyRate,
            jobTypes: response.profile?.jobTypes,
            remoteOnly: response.profile?.remoteOnly,
            github: response.profile?.github,
            linkedin: response.profile?.linkedin,
            twitter: response.profile?.twitter,
            website: response.profile?.website
          };
        } else if (response.role === 'employer') {
          // Map employer profile
          profile = {
            fullName: response.user?.fullName,
            headline: response.company?.companyName,
            bio: response.company?.companyDescription,
            location: response.company?.headquarters,
            // Employer specific fields
            ...response.company
          };
        }
        
        // Update cache
        this.updateCache(profile);
        return profile;
      }),
      catchError((error) => {
        console.error('Error fetching profile from backend:', error);
        // Fallback to cached profile
        return of(this.getCachedProfile());
      })
    );
  }

  // ─── UPDATE PROFILE (sync with backend) ──────────────────────
  update(profile: Partial<UserProfile>): Observable<UserProfile> {
    const token = this.auth.getToken();
    const currentUser = this.auth.currentUser;
    
    if (!token || !currentUser) {
      // Fallback to localStorage only
      this.updateCache(profile);
      return of(this.getCachedProfile());
    }

    // Determine which API endpoint to use
    const endpoint = currentUser.role === 'freelancer' 
      ? `${this.API_URL}/profile/freelancer`
      : `${this.API_URL}/profile/employer`;

    return this.http.put(endpoint, profile, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        // Update local cache with new data
        const currentCache = this.getCachedProfile();
        const updatedProfile = { ...currentCache, ...profile };
        this.updateCache(updatedProfile);
        
        // If onboarding is being completed, also mark user as onboarded
        if (profile.hasOwnProperty('skills') || profile.hasOwnProperty('companyName')) {
          // This might be part of onboarding
          console.log('Profile updated successfully');
        }
      }),
      map(() => {
        // Return merged profile
        return { ...this.getCachedProfile(), ...profile };
      }),
      catchError((error) => {
        console.error('Error updating profile:', error);
        // Still update cache even if backend fails (optimistic update)
        this.updateCache(profile);
        throw error;
      })
    );
  }

  // ─── UPDATE FREELANCER PROFILE (specific) ────────────────────
  updateFreelancerProfile(profileData: any): Observable<any> {
    const token = this.auth.getToken();
    
    if (!token) {
      return of(null);
    }

    return this.http.put(`${this.API_URL}/profile/freelancer`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        // Update cache after successful save
        this.updateCache(profileData);
      }),
      catchError(this.handleError)
    );
  }

  // ─── UPDATE EMPLOYER PROFILE (specific) ──────────────────────
  updateEmployerProfile(profileData: any): Observable<any> {
    const token = this.auth.getToken();
    
    if (!token) {
      return of(null);
    }

    return this.http.put(`${this.API_URL}/profile/employer`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        // Update cache after successful save
        this.updateCache(profileData);
      }),
      catchError(this.handleError)
    );
  }

  // ─── SYNC PROFILE WITH BACKEND ───────────────────────────────
  syncWithBackend(): Observable<UserProfile> {
    const token = this.auth.getToken();
    
    if (!token) {
      return of(this.getCachedProfile());
    }

    return this.http.get(`${this.API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map((response: any) => {
        let profile: UserProfile = {};
        
        if (response.role === 'freelancer' && response.profile) {
          profile = {
            headline: response.profile.headline,
            bio: response.profile.bio,
            location: response.profile.location,
            phone: response.profile.phone,
            skills: response.profile.skills,
            availability: response.profile.availability,
            hourlyRate: response.profile.hourlyRate,
            jobTypes: response.profile.jobTypes,
            remoteOnly: response.profile.remoteOnly,
            github: response.profile.github,
            linkedin: response.profile.linkedin,
            twitter: response.profile.twitter,
            website: response.profile.website
          };
        }
        
        this.updateCache(profile);
        return profile;
      }),
      catchError((error) => {
        console.error('Error syncing profile:', error);
        return of(this.getCachedProfile());
      })
    );
  }

  // ─── CACHE METHODS (fallback) ────────────────────────────────
  getCachedProfile(): UserProfile {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private updateCache(profile: Partial<UserProfile>): void {
    const current = this.getCachedProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.profileSubject.next(updated);
  }

  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.profileSubject.next(null);
  }

  hasCachedProfile(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  // ─── HELPER METHODS ──────────────────────────────────────────
  private handleError(error: any): Observable<never> {
    console.error('Profile service error:', error);
    throw error;
  }
}