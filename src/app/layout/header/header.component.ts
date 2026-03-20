// src/app/layout/header/header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../shared/services/auth.service';

interface NavLink {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  isScrolled       = false;
  isMobileMenuOpen = false;
  isUserMenuOpen   = false;
  unreadMessages   = 3;
  currentTime      = '';

  // ── Real user from AuthService ──────────────────────────────
  currentUser: AuthUser | null = null;

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // First name only (e.g. "Chibuzor")
  get userFirstName(): string {
    if (!this.currentUser?.fullName) return '';
    return this.currentUser.fullName.split(' ')[0];
  }

  // Initials (e.g. "CJ" from "Chibuzor Joel")
  get userInitials(): string {
    if (!this.currentUser?.fullName) return '?';
    const parts = this.currentUser.fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Short display name for avatar button (e.g. "Chibuzor J.")
  get userShortName(): string {
    if (!this.currentUser?.fullName) return '';
    const parts = this.currentUser.fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.';
  }

  readonly navLinks: NavLink[] = [
    { label: 'Find Jobs',  route: '/jobs'      },
    { label: 'Companies',  route: '/companies'  },
    { label: 'Dashboard',  route: '/dashboard'  },
    { label: 'Resources',  route: '/resources'  },
  ];

  private subs = new Subscription();
  private clockInterval!: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private auth:   AuthService,
  ) {}

  ngOnInit(): void {
    // Subscribe to real user state
    this.subs.add(
      this.auth.user$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Close menus on route change
    this.subs.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          this.isMobileMenuOpen = false;
          this.isUserMenuOpen   = false;
        })
    );

    // Live clock
    this.updateClock();
    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.clockInterval);
  }

  private updateClock(): void {
    this.currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 8;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-menu-wrapper')) {
      this.isUserMenuOpen = false;
    }
  }

  toggleMobileMenu(): void { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  toggleUserMenu():   void { this.isUserMenuOpen   = !this.isUserMenuOpen;   }

  postJob():  void { this.router.navigate(['/post-job']);        }
  signIn():   void { this.router.navigate(['/auth/login']);      }
  signUp():   void { this.router.navigate(['/auth/register']);   }

  signOut():  void {
    this.isUserMenuOpen   = false;
    this.isMobileMenuOpen = false;
    this.auth.logout(); // clears localStorage + redirects to /auth/login
  }
}