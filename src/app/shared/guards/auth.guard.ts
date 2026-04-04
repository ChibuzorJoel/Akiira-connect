// src/app/shared/guards/auth.guard.ts
// ─────────────────────────────────────────────────────────────────────────────
// Three guards:
//   authGuard      — protected pages (must be logged in + onboarded)
//   guestGuard     — auth pages (must NOT be logged in)
//   onboardingGuard — onboarding pages (logged in but NOT yet onboarded)
// ─────────────────────────────────────────────────────────────────────────────
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }           from '../services/auth.service';

// ── Shared helper: where should this role go after login? ────────────────────
function dashboardFor(role: string | undefined): string {
  return role === 'employer' ? '/employer-dashboard' : '/dashboard';
}

function onboardingFor(role: string | undefined): string {
  return role === 'employer' ? '/company-onboarding' : '/onboarding';
}

// ── authGuard: pages that require login + completed onboarding ───────────────
// e.g. /dashboard, /jobs, /employer-dashboard, /messages …
export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // 1. Not logged in → login page (with returnUrl so we can redirect after)
  if (!auth.isLoggedIn) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 2. Logged in but haven't finished onboarding → correct wizard
  const onboarded = localStorage.getItem('akiira_onboarded');
  if (!onboarded) {
    router.navigate([onboardingFor(auth.currentUser?.role)]);
    return false;
  }

  return true;
};

// ── guestGuard: auth pages — redirect away if already logged in ──────────────
// e.g. /auth/login, /auth/register
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Not logged in → let them through
  if (!auth.isLoggedIn) return true;

  const onboarded = localStorage.getItem('akiira_onboarded');
  const role      = auth.currentUser?.role;

  // Logged in but not onboarded → correct wizard
  if (!onboarded) {
    router.navigate([onboardingFor(role)]);
    return false;
  }

  // Fully onboarded → correct dashboard
  //   freelancer → /dashboard
  //   employer   → /employer-dashboard
  router.navigate([dashboardFor(role)]);
  return false;
};

// ── onboardingGuard: onboarding pages ───────────────────────────────────────
// e.g. /onboarding, /company-onboarding
// Must be logged in; if already onboarded, redirect to dashboard.
export const onboardingGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Not logged in → login page
  if (!auth.isLoggedIn) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Already onboarded → correct dashboard
  const onboarded = localStorage.getItem('akiira_onboarded');
  if (onboarded) {
    router.navigate([dashboardFor(auth.currentUser?.role)]);
    return false;
  }

  return true;
};