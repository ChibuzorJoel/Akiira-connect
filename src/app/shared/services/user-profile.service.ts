// src/app/shared/services/user-profile.service.ts
import { Injectable } from '@angular/core';

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
  hourlyRate?: string;
  jobTypes?: string[];
  remoteOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private STORAGE_KEY = 'akiira_user_profile';

  constructor() {}

  // Get profile
  getProfile(): UserProfile {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  // Update profile (merge with existing)
  update(profile: Partial<UserProfile>): void {
    const current = this.getProfile();

    const updated = {
      ...current,
      ...profile
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  // Clear profile
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if profile exists
  hasProfile(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }
}