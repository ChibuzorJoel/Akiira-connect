// src/app/shared/guards/auth.guard.ts
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }           from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  const onboarded = localStorage.getItem('akiira_onboarded');
  if (!onboarded && state.url !== '/onboarding' && state.url !== '/company-onboarding') {
    const role = auth.currentUser?.role;
    router.navigate([role === 'employer' ? '/company-onboarding' : '/onboarding']);
    return false;
  }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) return true;
  const onboarded = localStorage.getItem('akiira_onboarded');
  if (!onboarded) {
    const role = auth.currentUser?.role;
    router.navigate([role === 'employer' ? '/company-onboarding' : '/onboarding']);
    return false;
  }
  router.navigate(['/dashboard']);
  return false;
};

export const onboardingGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) { router.navigate(['/auth/login']); return false; }
  const onboarded = localStorage.getItem('akiira_onboarded');
  if (onboarded) { router.navigate(['/dashboard']); return false; }
  return true;
};