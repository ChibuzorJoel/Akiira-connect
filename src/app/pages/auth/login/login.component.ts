// src/app/pages/auth/login/login.component.ts
import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';

declare const google: any; // Declare Google SDK

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {

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

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.ticker);
  }

  initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "989749842775-md48k004dh1on5v4tjthf9j3h0emjbop.apps.googleusercontent.com",
        callback: (response: any) => this.handleGoogleSignIn(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false
      });
      
      const googleBtn = document.getElementById('google-btn');
      if (googleBtn) {
        google.accounts.id.renderButton(
          googleBtn,
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
      }
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 500);
    }
  }

  handleGoogleSignIn(response: any): void {
    this.isLoading = true;
    this.serverError = '';
    this.cdr.markForCheck();
    
    try {
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      
      console.log('Google user:', decodedToken);
      
      this.auth.loginWithGoogle({
        email: decodedToken.email,
        fullName: decodedToken.name,
        googleId: decodedToken.sub,
        picture: decodedToken.picture
      }).subscribe({
        next: (result) => {
          this.isLoading = false;
          console.log('Login result:', result);
          
          // ✅ ADDED: Redirect logic
          if (this.returnUrl && this.returnUrl.startsWith('/') && !this.returnUrl.startsWith('/auth')) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this._redirectByRole();
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          this.serverError = error.message || 'Google sign in failed';
          this.cdr.markForCheck();
        }
      });
    } catch (error) {
      this.isLoading = false;
      this.serverError = 'Invalid Google response';
      this.cdr.markForCheck();
    }
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

    this.auth.login(this.form.value).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (response) => {
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

  // ── Role-based redirect ──────────────────────────────────────
  private _redirectByRole(): void {
    const user = this.auth.currentUser;
    const onboarded = user?.onboarded;
    const isEmployer = user?.role === 'employer';

    if (!onboarded) {
      this.router.navigate([isEmployer ? '/company-onboarding' : '/onboarding']);
    } else {
      this.router.navigate([isEmployer ? '/employer-dashboard' : '/dashboard']);
    }
  }
}