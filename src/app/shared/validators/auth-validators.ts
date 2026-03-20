export class AuthValidators {
}
// src/app/shared/validators/auth.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Password must contain uppercase, lowercase, number, and be 8+ chars */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string;
    if (!v) return null;

    const errors: string[] = [];
    if (v.length < 8)           errors.push('At least 8 characters');
    if (!/[A-Z]/.test(v))       errors.push('One uppercase letter');
    if (!/[a-z]/.test(v))       errors.push('One lowercase letter');
    if (!/[0-9]/.test(v))       errors.push('One number');

    return errors.length ? { strongPassword: { missing: errors } } : null;
  };
}

/** Confirm password must match password */
export function passwordMatchValidator(passwordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get(passwordField)?.value;
    return control.value === password ? null : { passwordMatch: true };
  };
}

/** Password strength score 0-4 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)         score++;
  if (/[A-Z]/.test(password))       score++;
  if (/[0-9]/.test(password))       score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too weak',  color: '#dc2626' },
    { label: 'Weak',      color: '#f59e0b' },
    { label: 'Fair',      color: '#f59e0b' },
    { label: 'Strong',    color: '#16a34a' },
    { label: 'Very strong', color: '#16a34a' },
  ];
  return { score, ...levels[score] };
}