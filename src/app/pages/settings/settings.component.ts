// src/app/pages/settings/settings.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {

  currentUser: AuthUser | null = null;
  activeSection = 'account';
  saveSuccess   = '';
  showDeleteConfirm = false;
  showPasswordFields = false;

  // Account form
  editName  = '';
  editEmail = '';

  // Password form
  currentPassword = '';
  newPassword     = '';
  confirmPassword = '';
  showCurrent     = false;
  showNew         = false;
  showConfirm     = false;

  // Notifications
  notifications = {
    newMessages:      true,
    applicationUpdates: true,
    jobRecommendations: true,
    weeklyDigest:     false,
    marketingEmails:  false,
  };

  // Privacy
  privacy = {
    profileVisible:    true,
    showSalaryExpect:  false,
    allowRecruiterMsg: true,
    showOnlineStatus:  true,
  };

  readonly sections = [
    { id: 'account',       icon: '👤', label: 'Account'       },
    { id: 'password',      icon: '🔒', label: 'Password'      },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'privacy',       icon: '🛡️', label: 'Privacy'       },
    { id: 'danger',        icon: '⚠️', label: 'Danger Zone'   },
  ];

  private subs = new Subscription();

  get userInitials(): string {
    const n = this.currentUser?.fullName || '?';
    const p = n.trim().split(' ');
    return p.length === 1
      ? p[0].charAt(0).toUpperCase()
      : (p[0].charAt(0) + p[p.length - 1].charAt(0)).toUpperCase();
  }

  constructor(
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(u => {
        this.currentUser = u;
        if (u) {
          this.editName  = u.fullName;
          this.editEmail = u.email;
        }
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  setSection(id: string): void { this.activeSection = id; this.cdr.markForCheck(); }

  saveAccount(): void {
    // In real app: call API to update name/email
    this.showSaved('Account settings saved!');
  }

  savePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.showSaved('Passwords do not match.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.showSaved('Password must be at least 8 characters.');
      return;
    }
    this.currentPassword = '';
    this.newPassword     = '';
    this.confirmPassword = '';
    this.showPasswordFields = false;
    this.showSaved('Password updated successfully!');
  }

  saveNotifications(): void { this.showSaved('Notification preferences saved!'); }
  savePrivacy():       void { this.showSaved('Privacy settings saved!'); }

  signOut(): void { this.auth.logout(); }

  deleteAccount(): void {
    // In real app: call delete API then logout
    this.auth.logout();
  }

  private showSaved(msg: string): void {
    this.saveSuccess = msg;
    this.cdr.markForCheck();
    setTimeout(() => { this.saveSuccess = ''; this.cdr.markForCheck(); }, 3000);
  }
}