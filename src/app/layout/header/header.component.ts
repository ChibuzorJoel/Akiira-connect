// src/app/layout/header/header.component.ts
import {
  Component, OnInit, OnDestroy, HostListener,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../shared/services/auth.service';

interface NavLink {
  label:  string;
  route:  string;
  exact?: boolean;
  roles?: ('freelancer' | 'employer' | 'guest')[];  // who sees this link
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls:  ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {

  isScrolled      = false;
  isUserMenuOpen  = false;
  isMobileMenuOpen = false;
  currentTime     = '';
  unreadMessages  = 3;
  currentUser: AuthUser | null = null;
  isLoggedIn      = false;

  private subs    = new Subscription();
  private ticker!: ReturnType<typeof setInterval>;
  private clock!:  ReturnType<typeof setInterval>;

  // ── All possible nav links with role restrictions ──────────────────────
  private readonly allNavLinks: NavLink[] = [
    // Shared public link
    { label: 'Home',          route: '/',             exact: true,  roles: ['guest'] },

    // ── FREELANCER links ─────────────────────────────
    { label: 'Find Jobs',     route: '/jobs',                       roles: ['freelancer'] },
    { label: 'Companies',     route: '/companies',                  roles: ['freelancer'] },
    { label: 'Salary Guide',  route: '/salary-guide',               roles: ['freelancer'] },
    { label: 'Resources',     route: '/resources',                  roles: ['freelancer'] },

    // ── EMPLOYER links ───────────────────────────────
    { label: 'Post a Job',    route: '/post-job',                   roles: ['employer'] },
    { label: 'Browse Talent', route: '/talent',                     roles: ['employer'] },
    { label: 'Companies',     route: '/companies',                  roles: ['employer'] },
    { label: 'Pricing',       route: '/pricing',                    roles: ['employer'] },

    // ── GUEST links ──────────────────────────────────
    { label: 'Find Jobs',     route: '/jobs',                       roles: ['guest'] },
    { label: 'Companies',     route: '/companies',                  roles: ['guest'] },
    { label: 'Pricing',       route: '/pricing',                    roles: ['guest'] },
  ];

  // Computed based on current role
  get navLinks(): NavLink[] {
    const role = this.currentUser?.role;
    const key  = !this.isLoggedIn ? 'guest' : (role === 'employer' ? 'employer' : 'freelancer');
    return this.allNavLinks.filter(l => l.roles?.includes(key as any));
  }

  // ── User display helpers ───────────────────────────────────────────────
  get userInitials(): string {
    const name  = this.currentUser?.fullName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get userShortName(): string {
    return this.currentUser?.fullName?.split(' ')[0] || '';
  }

  get isEmployer(): boolean {
    return this.currentUser?.role === 'employer';
  }

  get isFreelancer(): boolean {
    return this.isLoggedIn && !this.isEmployer;
  }

  // ── Employer quick-stats from localStorage ─────────────────────────────
  get companyName(): string {
    try {
      const p = JSON.parse(localStorage.getItem('akiira_company_profile') || '{}');
      return p.companyName || this.currentUser?.fullName || '';
    } catch { return ''; }
  }

  constructor(
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.subs.add(
      this.auth.user$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn  = !!user;
        this.cdr.markForCheck();
      })
    );

    // Live clock
    this.updateClock();
    this.clock = setInterval(() => { this.updateClock(); this.cdr.markForCheck(); }, 60_000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.clock);
  }

  private updateClock(): void {
    const now  = new Date();
    const h    = now.getHours().toString().padStart(2,'0');
    const m    = now.getMinutes().toString().padStart(2,'0');
    this.currentTime = `${h}:${m}`;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrolled = window.scrollY > 20;
    if (scrolled !== this.isScrolled) {
      this.isScrolled = scrolled;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isUserMenuOpen) {
      const t = e.target as HTMLElement;
      if (!t.closest('.user-menu-wrapper')) {
        this.isUserMenuOpen = false;
        this.cdr.markForCheck();
      }
    }
  }

  toggleUserMenu():   void { this.isUserMenuOpen   = !this.isUserMenuOpen;   this.cdr.markForCheck(); }
  toggleMobileMenu(): void { this.isMobileMenuOpen = !this.isMobileMenuOpen; this.cdr.markForCheck(); }

  signIn():  void { this.router.navigate(['/auth/login']);    }
  signUp():  void { this.router.navigate(['/auth/register']); }
  postJob(): void { this.router.navigate(['/post-job']);       }
  applyNow():void { this.router.navigate(['/jobs']);           }

  signOut(): void {
    this.auth.logout();
    this.isUserMenuOpen   = false;
    this.isMobileMenuOpen = false;
    this.cdr.markForCheck();
  }
}