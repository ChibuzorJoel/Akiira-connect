// src/app/shared/guards/auth.guard.ts
import { inject }         from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }    from '../services/auth.service';

/**
 * Use on protected routes:
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) return true;

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: window.location.pathname }
  });
  return false;
};

/**
 * Redirect already-logged-in users away from auth pages:
 * { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] }
 */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) return true;

  router.navigate(['/dashboard']);
  return false;
};