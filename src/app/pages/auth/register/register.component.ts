// src/app/pages/auth/register/register.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import {
  strongPasswordValidator,
  passwordMatchValidator,
  getPasswordStrength,
} from '../../../shared/validators/auth.validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy {

  currentStep   = 1;
  selectedRole: 'freelancer' | 'employer' = 'freelancer';

  // Freelancer form
  fForm!: FormGroup;
  showFPw  = false;
  showFCpw = false;

  // Employer / company form
  eForm!: FormGroup;
  showEPw  = false;
  showECpw = false;

  isLoading   = false;
  serverError = '';

  private destroy$ = new Subject<void>();

  get pwStrength() {
    const f = this.selectedRole === 'freelancer' ? this.fForm : this.eForm;
    return getPasswordStrength(f?.get('password')?.value || '');
  }

  get pwReqs() {
    const f = this.selectedRole === 'freelancer' ? this.fForm : this.eForm;
    const v = f?.get('password')?.value || '';
    return [
      { label: '8+ characters', met: v.length >= 8 },
      { label: 'Uppercase',     met: /[A-Z]/.test(v) },
      { label: 'Lowercase',     met: /[a-z]/.test(v) },
      { label: 'Number',        met: /[0-9]/.test(v) },
    ];
  }

  readonly companySizes = [
    '1–10 (Startup)','11–50','51–200','201–500','501–1,000','1,001–5,000','5,000+'
  ];
  readonly industries = [
    'Technology','FinTech','Healthcare','E-Commerce','Education',
    'Media & Entertainment','SaaS','AI / Machine Learning',
    'Developer Tools','Design / Creative','Marketing','Other'
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Already logged in → redirect to correct place
    if (this.auth.isLoggedIn) {
      const onboarded = localStorage.getItem('akiira_onboarded');
      const role      = this.auth.currentUser?.role;
      if (!onboarded) {
        this.router.navigate([role === 'employer' ? '/company-onboarding' : '/onboarding']);
      } else {
        this.router.navigate([role === 'employer' ? '/employer-dashboard' : '/dashboard']);
      }
      return;
    }

    // ── Freelancer form ──────────────────────────────────────
    this.fForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator('password')]],
      agreeToTerms:    [false, Validators.requiredTrue],
    });

    // ── Employer / company form ──────────────────────────────
    this.eForm = this.fb.group({
      companyName:     ['', [Validators.required, Validators.minLength(2)]],
      contactName:     ['', [Validators.required, Validators.minLength(2)]],
      workEmail:       ['', [Validators.required, Validators.email]],
      companySize:     ['', Validators.required],
      industry:        ['', Validators.required],
      password:        ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator('password')]],
      agreeToTerms:    [false, Validators.requiredTrue],
    });

    this.fForm.get('password')!.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.fForm.get('confirmPassword')!.updateValueAndValidity(); this.cdr.markForCheck(); });

    this.eForm.get('password')!.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.eForm.get('confirmPassword')!.updateValueAndValidity(); this.cdr.markForCheck(); });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  selectRole(r: 'freelancer' | 'employer'): void { this.selectedRole = r; this.cdr.markForCheck(); }
  goStep2(): void { this.currentStep = 2; this.cdr.markForCheck(); }
  goStep1(): void { this.currentStep = 1; this.cdr.markForCheck(); }

  inv(form: FormGroup, f: string): boolean { const c = form.get(f)!; return c.touched && c.invalid; }
  ok (form: FormGroup, f: string): boolean { const c = form.get(f)!; return c.touched && c.valid && !!c.value; }

  err(form: FormGroup, field: string): string {
    const c = form.get(field)!;
    if (!c.touched || c.valid) return '';
    if (c.hasError('required'))       return 'Required';
    if (c.hasError('email'))          return 'Invalid email address';
    if (c.hasError('minlength'))      return 'Too short';
    if (c.hasError('strongPassword')) return 'Password too weak';
    if (c.hasError('passwordMatch'))  return 'Passwords do not match';
    return 'Invalid';
  }

  // ── FREELANCER SUBMIT ────────────────────────────────────────
  // Registers → saves role as 'freelancer' → navigates to /onboarding
  submitFreelancer(): void {
    this.fForm.markAllAsTouched();
    if (this.fForm.invalid || this.isLoading) { this.cdr.markForCheck(); return; }

    this.isLoading = true; this.serverError = ''; this.cdr.markForCheck();

    this.auth.mockRegister({
      ...this.fForm.value,
      role: 'freelancer' as const,
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next:  () => this.router.navigate(['/onboarding']),       // ← freelancer wizard
      error: (msg: string) => { this.serverError = msg; this.cdr.markForCheck(); },
    });
  }

  // ── EMPLOYER SUBMIT ──────────────────────────────────────────
  // Registers → saves role as 'employer' → navigates to /company-onboarding
  submitEmployer(): void {
    this.eForm.markAllAsTouched();
    if (this.eForm.invalid || this.isLoading) { this.cdr.markForCheck(); return; }

    this.isLoading = true; this.serverError = ''; this.cdr.markForCheck();

    const ev = this.eForm.value;

    this.auth.mockRegister({
      fullName:        ev.contactName,
      email:           ev.workEmail,
      password:        ev.password,
      confirmPassword: ev.confirmPassword,
      role:            'employer' as const,          // ← role stored in registry
      agreeToTerms:    ev.agreeToTerms,
      companyName:     ev.companyName,
      companySize:     ev.companySize,
      industry:        ev.industry,
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: () => {
        // Stash company info for the wizard to pre-fill
        localStorage.setItem('akiira_company_reg', JSON.stringify({
          companyName: ev.companyName,
          companySize: ev.companySize,
          industry:    ev.industry,
        }));
        this.router.navigate(['/company-onboarding']);           // ← employer wizard
      },
      error: (msg: string) => { this.serverError = msg; this.cdr.markForCheck(); },
    });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }
}