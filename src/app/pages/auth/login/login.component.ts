// src/app/features/auth/login/login.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule }             from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl
} from '@angular/forms';
import { Subject }                  from 'rxjs';
import { takeUntil, finalize }      from 'rxjs/operators';

import { AuthService }              from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading    = false;
  showPassword = false;
  serverError  = '';
  returnUrl    = '/dashboard';

  private destroy$ = new Subject<void>();

  // Testimonials that rotate on the left panel
  readonly testimonials = [
    {
      text:    'Landed a $140K remote role at Stripe in 3 weeks. The swipe-to-apply feature is unlike anything else.',
      name:    'Tunde Adeyemi',
      role:    'Senior Frontend Engineer',
      avatar:  'TA',
      color:   '#6366f1',
    },
    {
      text:    'Applied to 12 jobs on a Sunday. Had 3 responses by Tuesday. Found my Notion contract in 10 days.',
      name:    'Priya Sharma',
      role:    'UX Designer · Notion',
      avatar:  'PS',
      color:   '#0ea5e9',
    },
    {
      text:    'Negotiated $30K above my ask using the salary guide. Best career move I\'ve made.',
      name:    'Marcus Chen',
      role:    'ML Engineer · Scale AI',
      avatar:  'MC',
      color:   '#10b981',
    },
  ];

  activeTestimonial = 0;
  private testiTimer!: ReturnType<typeof setInterval>;

  constructor(
    private fb:    FormBuilder,
    private auth:  AuthService,
    private router: Router,
    private route:  ActivatedRoute,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Build form
    this.form = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Rotate testimonials
    this.testiTimer = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 4500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.testiTimer);
  }

  // ── Getters ──────────────────────────────────
  get email():      AbstractControl { return this.form.get('email')!; }
  get password():   AbstractControl { return this.form.get('password')!; }
  get rememberMe(): AbstractControl { return this.form.get('rememberMe')!; }

  fieldError(field: 'email' | 'password'): string {
    const c = this.form.get(field)!;
    if (!c.touched || c.valid) return '';
    if (c.hasError('required')) return `${field === 'email' ? 'Email' : 'Password'} is required`;
    if (c.hasError('email'))    return 'Please enter a valid email address';
    if (c.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  isFieldInvalid(field: 'email' | 'password'): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.invalid;
  }

  isFieldValid(field: 'email' | 'password'): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.valid;
  }

  // ── Submit ────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) return;

    this.isLoading   = true;
    this.serverError = '';
    this.cdr.markForCheck();

    const credentials = this.form.value;

    // ── Use mockLogin during development ──
    // Switch to this.auth.login(credentials) when backend is ready
    this.auth.mockLogin(credentials)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (msg: string) => { this.serverError = msg; this.cdr.markForCheck(); },
      });
  }

  loginWithGoogle(): void {
    this.auth.loginWithGoogle();
  }

  setTestimonial(i: number): void {
    this.activeTestimonial = i;
    clearInterval(this.testiTimer);
    this.testiTimer = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 4500);
  }
}