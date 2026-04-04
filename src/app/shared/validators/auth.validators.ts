// src/app/shared/validators/auth.validators.ts
// Note: file name is auth.validators.ts (with a dot, not a hyphen)
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ─── Strong password validator ────────────────────────────────────────────────
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value || '';
    if (!v) return null; // let required handle empty
    const valid =
      v.length >= 8 &&
      /[A-Z]/.test(v) &&
      /[a-z]/.test(v) &&
      /[0-9]/.test(v);
    return valid ? null : { strongPassword: true };
  };
}

// ─── Password match validator ─────────────────────────────────────────────────
export function passwordMatchValidator(passwordField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const pw = parent.get(passwordField)?.value;
    return pw && control.value && pw !== control.value
      ? { passwordMatch: true }
      : null;
  };
}

// ─── Password strength helper ─────────────────────────────────────────────────
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '#e4e4e7' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak',   color: '#dc2626' };
  if (score <= 3) return { score: 2, label: 'Fair',   color: '#d97706' };
  if (score <= 4) return { score: 3, label: 'Good',   color: '#2563eb' };
                  return { score: 4, label: 'Strong', color: '#16a34a' };
}