// src/app/features/auth/register/register.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Subject }        from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService }    from '../../../shared/services/auth.service';
import {
  strongPasswordValidator,
  passwordMatchValidator,
  getPasswordStrength,
} from '../../../shared/validators/auth-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading     = false;
  showPassword  = false;
  showConfirm   = false;
  serverError   = '';
  currentStep   = 1;  // 1 = account type, 2 = details
  selectedRole: 'freelancer' | 'employer' = 'freelancer';

  get passwordStrength() {
    return getPasswordStrength(this.password?.value || '');
  }

  private destroy$ = new Subject<void>();

  constructor(
    private fb:    FormBuilder,
    private auth:  AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.form = this.fb.group({
      role:            ['freelancer', Validators.required],
      fullName:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator('password')]],
      agreeToTerms:    [false, Validators.requiredTrue],
    });

    // Re-validate confirmPassword whenever password changes
    this.form.get('password')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.get('confirmPassword')!.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Getters ──────────────────────────────────
  get fullName():        AbstractControl { return this.form.get('fullName')!; }
  get email():           AbstractControl { return this.form.get('email')!; }
  get password():        AbstractControl { return this.form.get('password')!; }
  get confirmPassword(): AbstractControl { return this.form.get('confirmPassword')!; }
  get agreeToTerms():    AbstractControl { return this.form.get('agreeToTerms')!; }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.invalid;
  }

  isFieldValid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.valid && c.value;
  }

  fieldError(field: string): string {
    const c = this.form.get(field)!;
    if (!c.touched || c.valid) return '';

    const labels: Record<string, string> = {
      fullName: 'Full name', email: 'Email',
      password: 'Password', confirmPassword: 'Passwords',
    };

    if (c.hasError('required'))       return `${labels[field] || 'Field'} is required`;
    if (c.hasError('email'))          return 'Please enter a valid email address';
    if (c.hasError('minlength'))      return `${labels[field]} must be at least ${c.errors!['minlength'].requiredLength} characters`;
    if (c.hasError('strongPassword')) return 'Password does not meet requirements';
    if (c.hasError('passwordMatch'))  return 'Passwords do not match';
    return 'Invalid value';
  }

  get passwordRequirements() {
    const v = this.password?.value || '';
    return [
      { label: 'At least 8 characters', met: v.length >= 8 },
      { label: 'One uppercase letter',  met: /[A-Z]/.test(v) },
      { label: 'One lowercase letter',  met: /[a-z]/.test(v) },
      { label: 'One number',            met: /[0-9]/.test(v) },
    ];
  }

  // ── Role selection ────────────────────────────
  selectRole(role: 'freelancer' | 'employer'): void {
    this.selectedRole = role;
    this.form.patchValue({ role });
    this.cdr.markForCheck();
  }

  // ── Step navigation ───────────────────────────
  goToStep2(): void {
    // Validate only role on step 1
    this.currentStep = 2;
    this.cdr.markForCheck();
  }

  // ── Submit ────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;

    this.isLoading   = true;
    this.serverError = '';
    this.cdr.markForCheck();

    this.auth.mockRegister(this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (msg: string) => { this.serverError = msg; this.cdr.markForCheck(); },
      });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }
}