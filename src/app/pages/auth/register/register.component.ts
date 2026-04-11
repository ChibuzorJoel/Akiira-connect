// src/app/pages/auth/register/register.component.ts
import {
  Component, OnInit, OnDestroy, AfterViewInit,
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

declare const google: any; // Declare Google SDK

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {

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
      const user = this.auth.currentUser;
      const onboarded = user?.onboarded;
      const role = user?.role;
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

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  ngOnDestroy(): void { 
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  // ── GOOGLE SIGN-IN ──────────────────────────────────────────
  initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: "989749842775-md48k004dh1on5v4tjthf9j3h0emjbop.apps.googleusercontent.com", // Replace with your Client ID
        callback: (response: any) => this.handleGoogleSignIn(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Render the Google button
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
      // If SDK not loaded yet, retry
      setTimeout(() => this.initializeGoogleSignIn(), 500);
    }
  }

  async handleGoogleSignIn(response: any): Promise<void> {
    this.isLoading = true;
    this.serverError = '';
    this.cdr.markForCheck();
    
    try {
      // Decode the JWT token from Google
      const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
      
      console.log('Google user registration:', decodedToken);
      
      // Send to backend
      this.auth.loginWithGoogle({
        email: decodedToken.email,
        fullName: decodedToken.name,
        googleId: decodedToken.sub,
        picture: decodedToken.picture
      }).subscribe({
        next: (result) => {
          this.isLoading = false;
          
          // Redirect based on role and onboarded status
          const onboarded = result.user?.onboarded;
          const role = result.user?.role;
          
          if (!onboarded) {
            this.router.navigate([role === 'employer' ? '/company-onboarding' : '/onboarding']);
          } else {
            this.router.navigate([role === 'employer' ? '/employer-dashboard' : '/dashboard']);
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          this.serverError = error.message || 'Google sign in failed. Please try again.';
          this.cdr.markForCheck();
        }
      });
      
    } catch (error) {
      this.isLoading = false;
      this.serverError = 'Invalid Google response. Please try again.';
      this.cdr.markForCheck();
    }
  }

  loginWithGoogle(): void {
    if (typeof google !== 'undefined') {
      // Show the Google One-Tap UI or trigger the popup
      google.accounts.id.prompt();
    } else {
      this.serverError = 'Google Sign-In is loading. Please try again.';
      this.cdr.markForCheck();
    }
  }

  selectRole(r: 'freelancer' | 'employer'): void { 
    this.selectedRole = r; 
    this.cdr.markForCheck(); 
  }
  
  goStep2(): void { 
    this.currentStep = 2; 
    this.cdr.markForCheck(); 
  }
  
  goStep1(): void { 
    this.currentStep = 1; 
    this.cdr.markForCheck(); 
  }

  inv(form: FormGroup, f: string): boolean { 
    const c = form.get(f)!; 
    return c.touched && c.invalid; 
  }
  
  ok(form: FormGroup, f: string): boolean { 
    const c = form.get(f)!; 
    return c.touched && c.valid && !!c.value; 
  }

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
  submitFreelancer(): void {
    this.fForm.markAllAsTouched();
    if (this.fForm.invalid || this.isLoading) { 
      this.cdr.markForCheck(); 
      return; 
    }

    this.isLoading = true; 
    this.serverError = ''; 
    this.cdr.markForCheck();

    this.auth.register({
      ...this.fForm.value,
      role: 'freelancer' as const,
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => { 
        this.isLoading = false; 
        this.cdr.markForCheck(); 
      })
    ).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: (msg: string) => { 
        this.serverError = msg; 
        this.cdr.markForCheck(); 
      },
    });
  }

  // ── EMPLOYER SUBMIT ──────────────────────────────────────────
  submitEmployer(): void {
    this.eForm.markAllAsTouched();
    if (this.eForm.invalid || this.isLoading) { 
      this.cdr.markForCheck(); 
      return; 
    }

    this.isLoading = true; 
    this.serverError = ''; 
    this.cdr.markForCheck();

    const ev = this.eForm.value;

    this.auth.register({
      fullName:        ev.contactName,
      email:           ev.workEmail,
      password:        ev.password,
      confirmPassword: ev.confirmPassword,
      role:            'employer' as const,
      agreeToTerms:    ev.agreeToTerms,
      companyName:     ev.companyName,
      companySize:     ev.companySize,
      industry:        ev.industry,
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => { 
        this.isLoading = false; 
        this.cdr.markForCheck(); 
      })
    ).subscribe({
      next: () => {
        localStorage.setItem('akiira_company_reg', JSON.stringify({
          companyName: ev.companyName,
          companySize: ev.companySize,
          industry:    ev.industry,
        }));
        this.router.navigate(['/company-onboarding']);
      },
      error: (msg: string) => { 
        this.serverError = msg; 
        this.cdr.markForCheck(); 
      },
    });
  }
}