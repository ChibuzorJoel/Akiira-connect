// src/app/pages/auth/login/login.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {

  form!:            FormGroup;
  isLoading       = false;
  showPassword    = false;
  serverError     = '';
  activeTestimonial = 0;

  private destroy$  = new Subject<void>();
  private ticker!:   ReturnType<typeof setInterval>;
  private returnUrl = '';

  readonly testimonials = [
    { text: 'Found my dream remote contract in 6 days. The match score is incredibly accurate — every job it recommended was a genuine fit.',  name: 'Adaeze Okonkwo', role: 'UX Designer · Notion',           avatar: 'AO', color: '#6366f1' },
    { text: 'Negotiated $40K above my asking price using the salary guide. This platform completely changed how I approach job hunting.',       name: 'Marcus Teixeira', role: 'ML Engineer · Scale AI',         avatar: 'MT', color: '#0ea5e9' },
    { text: 'Applied to 8 jobs Sunday morning. By Thursday I had 3 interviews. The quick-apply feature saves hours per application.',           name: 'Priya Nair',     role: 'DevOps Engineer · Figma',         avatar: 'PN', color: '#10b981' },
    { text: 'As someone in Lagos, finding legitimate remote work used to be a nightmare. Akiira Connect opened doors I thought were closed.', name: 'Tunde Adeyemi',  role: 'Senior Frontend Dev · GitHub',    avatar: 'TA', color: '#d97706' },
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private route:  ActivatedRoute,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Already logged in — redirect immediately
    if (this.auth.isLoggedIn) {
      this._redirectByRole();
      return;
    }

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '';

    this.form = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    this.ticker = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.ticker);
  }

  // ── Field helpers ────────────────────────────────────────────
  isFieldInvalid(f: string): boolean { const c = this.form.get(f)!; return c.touched && c.invalid; }
  isFieldValid(f:   string): boolean { const c = this.form.get(f)!; return c.touched && c.valid && !!c.value; }

  fieldError(field: string): string {
    const c = this.form.get(field)!;
    if (!c.touched || c.valid) return '';
    if (c.hasError('required'))  return 'This field is required';
    if (c.hasError('email'))     return 'Please enter a valid email address';
    if (c.hasError('minlength')) return 'Password must be at least 6 characters';
    return 'Invalid value';
  }

  setTestimonial(i: number): void {
    this.activeTestimonial = i;
    clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 5000);
    this.cdr.markForCheck();
  }

  // ── Submit ───────────────────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading) { this.cdr.markForCheck(); return; }

    this.isLoading   = true;
    this.serverError = '';
    this.cdr.markForCheck();

    this.auth.mockLogin(this.form.value).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: () => {
        // Use returnUrl only if safe (not an auth page)
        if (this.returnUrl && this.returnUrl.startsWith('/') && !this.returnUrl.startsWith('/auth')) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }
        this._redirectByRole();
      },
      error: (msg: string) => {
        this.serverError = msg || 'Incorrect email or password.';
        this.cdr.markForCheck();
      },
    });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }

  // ── Role-based redirect ──────────────────────────────────────
  // ┌───────────────────────────────────────────────────────────┐
  // │ Not onboarded?                                            │
  // │   employer   → /company-onboarding                       │
  // │   freelancer → /onboarding                               │
  // │                                                           │
  // │ Onboarded?                                                │
  // │   employer   → /employer-dashboard   🏢                   │
  // │   freelancer → /dashboard            🧑‍💻                   │
  // └───────────────────────────────────────────────────────────┘
  private _redirectByRole(): void {
    const user      = this.auth.currentUser;
    const onboarded = localStorage.getItem('akiira_onboarded');
    const isEmployer = user?.role === 'employer';

    if (!onboarded) {
      this.router.navigate([isEmployer ? '/company-onboarding' : '/onboarding']);
    } else {
      this.router.navigate([isEmployer ? '/employer-dashboard' : '/dashboard']);
    }
  }
}