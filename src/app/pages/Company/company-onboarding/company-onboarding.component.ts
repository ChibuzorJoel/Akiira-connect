// src/app/pages/company-onboarding/company-onboarding.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-company-onboarding',
  templateUrl: './company-onboarding.component.html',
  styleUrls: ['./company-onboarding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyOnboardingComponent implements OnInit, OnDestroy {

  currentStep = 1;
  totalSteps  = 4;
  saving      = false;
  saveSuccess = '';
  errorMessage = '';

  // Pre-filled from registration
  prefilledCompany = '';
  prefilledSize    = '';
  prefilledIndustry = '';

  step1!: FormGroup; // Company identity
  step2!: FormGroup; // About & description
  step3!: FormGroup; // Hiring preferences
  step4!: FormGroup; // Links & social

  hiringRoles: string[]  = [];
  newRole                = '';

  readonly stepMeta = [
    { n:1, icon:'🏢', title:'Company Identity',    sub:'Tell candidates who you are'          },
    { n:2, icon:'✍️',  title:'About Your Company',  sub:'What makes your company stand out?'  },
    { n:3, icon:'🎯', title:'Hiring Preferences',  sub:'Who are you looking to hire?'         },
    { n:4, icon:'🔗', title:'Links & Presence',    sub:'Help talent find and trust you'       },
  ];

  readonly companySizes  = ['1–10 (Startup)','11–50','51–200','201–500','501–1,000','1,001–5,000','5,000+'];
  readonly industries    = ['Technology','FinTech','Healthcare','E-Commerce','Education','Media & Entertainment','SaaS','AI / Machine Learning','Developer Tools','Design / Creative','Marketing','Other'];
  readonly roleOptions   = ['Frontend Developer','Backend Engineer','Full-Stack Engineer','React Developer','Angular Developer','Node.js Developer','Python Engineer','ML Engineer','Data Scientist','DevOps / SRE','Product Designer','UX Researcher','Product Manager','Technical Writer','Data Analyst','Mobile Developer','Security Engineer','QA Engineer'];
  readonly hiringVolumes = ['1–2 hires', '3–5 hires', '6–10 hires', '10–20 hires', '20+ hires'];
  readonly contractTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  readonly budgetRanges  = ['< $50/hr', '$50–$80/hr', '$80–$120/hr', '$120–$160/hr', '$160K–$200K/yr', '$200K+/yr', 'Flexible / open to discussion'];

  selectedContractTypes: string[] = ['Full-time', 'Contract'];

  get step()     { return this.stepMeta[this.currentStep - 1]; }
  get progress() { return ((this.currentStep - 1) / this.totalSteps) * 100; }
  get currentUser() { return this.auth.currentUser; }

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Load pre-filled data from registration
    try {
      const reg = JSON.parse(localStorage.getItem('akiira_company_reg') || '{}');
      this.prefilledCompany  = reg.companyName  || '';
      this.prefilledSize     = reg.companySize   || '';
      this.prefilledIndustry = reg.industry      || '';
    } catch {}

    this.step1 = this.fb.group({
      companyName:  [this.prefilledCompany,   [Validators.required, Validators.minLength(2)]],
      tagline:      ['',                       [Validators.required, Validators.minLength(10), Validators.maxLength(120)]],
      website:      ['',                       Validators.required],
      companySize:  [this.prefilledSize,       Validators.required],
      industry:     [this.prefilledIndustry,   Validators.required],
      founded:      [''],
      location:     ['',                       Validators.required],
    });

    this.step2 = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(100)]],
      mission:     [''],
      culture:     [''],
    });

    this.step3 = this.fb.group({
      hiringVolume: ['', Validators.required],
      budgetRange:  ['', Validators.required],
      remotePolicy: ['Remote (Global)', Validators.required],
    });

    this.step4 = this.fb.group({
      linkedin: [''],
      twitter:  [''],
      github:   [''],
      glassdoor:[''],
    });
  }

  ngOnDestroy(): void {}

  // ── Navigation ─────────────────────────────────────────────
  next(): void {
    const form = [null, this.step1, this.step2, this.step3, this.step4][this.currentStep];
    if (form) {
      form.markAllAsTouched();
      if (form.invalid) { this.cdr.markForCheck(); return; }
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.cdr.markForCheck();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prev(): void {
    if (this.currentStep > 1) { this.currentStep--; this.cdr.markForCheck(); }
  }

  inv(form: FormGroup, f: string): boolean {
    const c = form.get(f);
    return !!(c && c.touched && c.invalid);
  }

  // ── Roles ───────────────────────────────────────────────────
  addRole(role?: string): void {
    const r = (role || this.newRole).trim();
    if (r && !this.hiringRoles.includes(r) && this.hiringRoles.length < 10) {
      this.hiringRoles = [...this.hiringRoles, r];
      this.newRole = '';
      this.cdr.markForCheck();
    }
  }

  removeRole(r: string): void {
    this.hiringRoles = this.hiringRoles.filter(x => x !== r);
    this.cdr.markForCheck();
  }

  hasRole(r: string): boolean { return this.hiringRoles.includes(r); }

  toggleContractType(t: string): void {
    this.selectedContractTypes = this.selectedContractTypes.includes(t)
      ? this.selectedContractTypes.filter(x => x !== t)
      : [...this.selectedContractTypes, t];
    this.cdr.markForCheck();
  }

  // ── Complete Onboarding with Backend API ────────────────────
  complete(): void {
    // Validate hiring roles
    if (this.hiringRoles.length === 0) {
      this.showSaved('Please add at least one hiring role.', 'error');
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Prepare company profile data for backend
    const profileData = {
      companyWebsite: this.step1.value.website,
      companyDescription: this.step2.value.description,
      headquarters: this.step1.value.location,
      foundedYear: this.step1.value.founded ? parseInt(this.step1.value.founded) : undefined,
      hiringRoles: this.hiringRoles,
      remotePolicy: this.step3.value.remotePolicy,
      companySize: this.step1.value.companySize,
      industry: this.step1.value.industry,
      // Additional fields
      tagline: this.step1.value.tagline,
      mission: this.step2.value.mission,
      culture: this.step2.value.culture,
      hiringVolume: this.step3.value.hiringVolume,
      budgetRange: this.step3.value.budgetRange,
      contractTypes: this.selectedContractTypes,
      linkedin: this.step4.value.linkedin,
      twitter: this.step4.value.twitter,
      github: this.step4.value.github,
      glassdoor: this.step4.value.glassdoor
    };

    // Step 1: Update employer profile via backend API
    this.auth.updateEmployerProfile(profileData).subscribe({
      next: () => {
        // Step 2: Mark onboarding as complete
        this.auth.completeOnboarding().subscribe({
          next: () => {
            // Store in localStorage as backup (optional)
            localStorage.setItem('akiira_company_profile', JSON.stringify(profileData));
            localStorage.removeItem('akiira_company_reg');
            
            this.saving = false;
            this.showSaved('Company profile completed successfully! Redirecting...', 'success');
            
            setTimeout(() => {
              this.router.navigate(['/employer-dashboard']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error completing company onboarding:', error);
            this.saving = false;
            this.showSaved(error || 'Error completing onboarding. Please try again.', 'error');
            this.cdr.markForCheck();
          }
        });
      },
      error: (error) => {
        console.error('Error saving company profile:', error);
        this.saving = false;
        this.showSaved(error || 'Error saving company profile. Please try again.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  // ── Skip Onboarding ─────────────────────────────────────────
  skip(): void {
    if (confirm('Are you sure you want to skip? You can complete your company profile later from your dashboard.')) {
      this.saving = true;
      
      this.auth.completeOnboarding().subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/employer-dashboard']);
        },
        error: (error) => {
          console.error('Error skipping company onboarding:', error);
          this.saving = false;
          this.showSaved('Error. Please try again.', 'error');
        }
      });
    }
  }

  // ── Helper Methods ──────────────────────────────────────────
  private showSaved(msg: string, type: 'success' | 'error' = 'success'): void {
    this.saveSuccess = msg;
    this.errorMessage = type === 'error' ? msg : '';
    this.cdr.markForCheck();
    
    setTimeout(() => {
      this.saveSuccess = '';
      this.errorMessage = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  get descLength(): number { 
    return this.step2?.get('description')?.value?.length || 0; 
  }
}