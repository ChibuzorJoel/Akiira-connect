// src/app/pages/company-onboarding/company-onboarding.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

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

  // ── Complete ─────────────────────────────────────────────────
  complete(): void {
    this.saving = true;
    this.cdr.markForCheck();

    // Store company profile data
    const profile = {
      companyName:   this.step1.value.companyName,
      tagline:       this.step1.value.tagline,
      website:       this.step1.value.website,
      companySize:   this.step1.value.companySize,
      industry:      this.step1.value.industry,
      founded:       this.step1.value.founded,
      location:      this.step1.value.location,
      description:   this.step2.value.description,
      mission:       this.step2.value.mission,
      culture:       this.step2.value.culture,
      hiringVolume:  this.step3.value.hiringVolume,
      budgetRange:   this.step3.value.budgetRange,
      remotePolicy:  this.step3.value.remotePolicy,
      contractTypes: this.selectedContractTypes,
      hiringRoles:   this.hiringRoles,
      linkedin:      this.step4.value.linkedin,
      twitter:       this.step4.value.twitter,
      github:        this.step4.value.github,
      glassdoor:     this.step4.value.glassdoor,
    };

    localStorage.setItem('akiira_company_profile', JSON.stringify(profile));
    localStorage.setItem('akiira_onboarded', 'true');
    localStorage.removeItem('akiira_company_reg');

    setTimeout(() => {
      this.saving = false;
      this.cdr.markForCheck();
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  skip(): void {
    localStorage.setItem('akiira_onboarded', 'true');
    this.router.navigate(['/dashboard']);
  }

  get descLength(): number { return this.step2?.get('description')?.value?.length || 0; }
}