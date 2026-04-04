// src/app/features/auth/forgot-password/forgot-password.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule, Router }  from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder,
  FormGroup, Validators, AbstractControl
} from '@angular/forms';
import { Subject }       from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService }   from '../../../shared/services/auth.service';
import {
  strongPasswordValidator,
  passwordMatchValidator
} from '../../../shared/validators/auth.validators';

export type ForgotStep = 'email' | 'otp' | 'reset' | 'success';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  // ── Step state ──────────────────────────────
  currentStep: ForgotStep = 'email';
  isLoading    = false;
  serverError  = '';
  sentEmail    = '';     // stored to show in OTP step

  // ── OTP ─────────────────────────────────────
  otpDigits    = ['', '', '', '', '', ''];  // 6-digit OTP
  otpError     = '';
  resendCooldown = 0;
  private resendTimer!: ReturnType<typeof setInterval>;

  // ── Password visibility ──────────────────────
  showPassword  = false;
  showConfirm   = false;

  // ── Forms ────────────────────────────────────
  emailForm!:  FormGroup;
  resetForm!:  FormGroup;

  private destroy$ = new Subject<void>();

  // ── Step metadata ────────────────────────────
  readonly steps: Record<ForgotStep, { title: string; sub: string; num: number }> = {
    email:   { title: 'Forgot your password?', sub: "No worries. Enter your email and we'll send you a reset code.", num: 1 },
    otp:     { title: 'Check your inbox',      sub: "We've sent a 6-digit code to your email address.",             num: 2 },
    reset:   { title: 'Create new password',   sub: 'Choose a strong password for your Akiira Connect account.',   num: 3 },
    success: { title: 'Password updated!',     sub: "You're all set. Sign in with your new password.",              num: 4 },
  };

  get step() { return this.steps[this.currentStep]; }

  get passwordStrengthScore(): number {
    const v = this.resetForm?.get('password')?.value || '';
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }

  get passwordStrengthLabel(): string {
    return ['', 'Too weak', 'Weak', 'Strong', 'Very strong'][this.passwordStrengthScore];
  }

  get passwordStrengthColor(): string {
    return ['', '#dc2626', '#f59e0b', '#16a34a', '#16a34a'][this.passwordStrengthScore];
  }

  get passwordRequirements() {
    const v = this.resetForm?.get('password')?.value || '';
    return [
      { label: 'At least 8 characters',   met: v.length >= 8 },
      { label: 'One uppercase letter',     met: /[A-Z]/.test(v) },
      { label: 'One number',               met: /[0-9]/.test(v) },
      { label: 'One special character',    met: /[^A-Za-z0-9]/.test(v) },
    ];
  }

  constructor(
    private fb:    FormBuilder,
    private auth:  AuthService,
    private router: Router,
    private cdr:   ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      password:        ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator('password')]],
    });

    // Re-validate confirm when password changes
    this.resetForm.get('password')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetForm.get('confirmPassword')!.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.resendTimer);
  }

  // ── STEP 1: Send email ───────────────────────
  onSendEmail(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid || this.isLoading) return;

    this.isLoading   = true;
    this.serverError = '';
    this.cdr.markForCheck();

    // Mock API call — replace with: this.authService.forgotPassword(email)
    setTimeout(() => {
      this.sentEmail   = this.emailForm.value.email;
      this.isLoading   = false;
      this.currentStep = 'otp';
      this.startResendCooldown();
      this.cdr.markForCheck();
    }, 1400);
  }

  // ── STEP 2: Verify OTP ───────────────────────
  get fullOtp(): string { return this.otpDigits.join(''); }

  onOtpInput(event: Event, index: number): void {
    const input  = event.target as HTMLInputElement;
    const value  = input.value.replace(/\D/g, '');   // digits only
    this.otpError = '';

    // Handle paste of full code
    if (value.length === 6) {
      this.otpDigits = value.split('');
      this.cdr.markForCheck();
      this.focusOtpField(5);
      return;
    }

    // Single digit input
    this.otpDigits[index] = value.slice(-1);
    this.cdr.markForCheck();
    if (value && index < 5) {
      this.focusOtpField(index + 1);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        this.otpDigits[index - 1] = '';
        this.focusOtpField(index - 1);
      } else {
        this.otpDigits[index] = '';
      }
      this.otpError = '';
      this.cdr.markForCheck();
    }
    if (event.key === 'ArrowLeft'  && index > 0) this.focusOtpField(index - 1);
    if (event.key === 'ArrowRight' && index < 5) this.focusOtpField(index + 1);
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6);
    this.otpDigits = digits.split('').concat(Array(6).fill('')).slice(0, 6);
    this.cdr.markForCheck();
    this.focusOtpField(Math.min(digits.length, 5));
  }

  private focusOtpField(index: number): void {
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
      inputs[index]?.focus();
      inputs[index]?.select();
    }, 0);
  }

  onVerifyOtp(): void {
    if (this.fullOtp.length !== 6) {
      this.otpError = 'Please enter the complete 6-digit code.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.otpError  = '';
    this.cdr.markForCheck();

    // Mock OTP verify — replace with: this.authService.verifyOtp(this.sentEmail, this.fullOtp)
    // Mock: any 6-digit code works in dev. Real: check against server.
    setTimeout(() => {
      this.isLoading = false;
      if (this.fullOtp === '000000') {
        // Simulate wrong code
        this.otpError = 'Incorrect code. Please try again or request a new one.';
        this.otpDigits = ['', '', '', '', '', ''];
        this.focusOtpField(0);
      } else {
        this.currentStep = 'reset';
      }
      this.cdr.markForCheck();
    }, 1200);
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;
    this.isLoading = true;
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError  = '';
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isLoading = false;
      this.startResendCooldown();
      this.cdr.markForCheck();
    }, 1000);
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      this.cdr.markForCheck();
      if (this.resendCooldown <= 0) clearInterval(this.resendTimer);
    }, 1000);
  }

  // ── STEP 3: Reset password ───────────────────
  onResetPassword(): void {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid || this.isLoading) return;

    this.isLoading   = true;
    this.serverError = '';
    this.cdr.markForCheck();

    // Mock reset — replace with: this.authService.resetPassword(this.sentEmail, this.fullOtp, newPassword)
    setTimeout(() => {
      this.isLoading   = false;
      this.currentStep = 'success';
      this.cdr.markForCheck();
    }, 1400);
  }

  // ── Helpers ──────────────────────────────────
  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field)!;
    return c.touched && c.invalid;
  }

  isValid(form: FormGroup, field: string): boolean {
    const c = form.get(field)!;
    return c.touched && c.valid && !!c.value;
  }

  fieldError(form: FormGroup, field: string): string {
    const c = form.get(field)!;
    if (!c.touched || c.valid) return '';
    if (c.hasError('required'))      return 'This field is required';
    if (c.hasError('email'))         return 'Please enter a valid email address';
    if (c.hasError('strongPassword')) return 'Password does not meet all requirements';
    if (c.hasError('passwordMatch')) return 'Passwords do not match';
    return 'Invalid value';
  }

  maskEmail(email: string): string {
    if (!email) return '';
    const [local, domain] = email.split('@');
    const masked = local.slice(0, 2) + '•••' + local.slice(-1);
    return `${masked}@${domain}`;
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }

  changeEmail(): void {
    this.currentStep = 'email';
    this.otpDigits   = ['', '', '', '', '', ''];
    this.otpError    = '';
    clearInterval(this.resendTimer);
    this.resendCooldown = 0;
    this.cdr.markForCheck();
  }
}