// src/app/pages/onboarding/onboarding.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent implements OnInit, OnDestroy {

  currentStep = 1;
  totalSteps  = 5;
  saving      = false;
  newSkill    = '';
  skills: string[] = [];
  errorMessage = '';

  // ── Forms per step ──────────────────────────────────────────
  step1!: FormGroup;
  step2!: FormGroup;
  step3!: FormGroup;
  step4!: FormGroup;

  readonly stepMeta = [
    { n:1, icon:'👤', title:'Your Identity',     sub:'Let employers know who you are' },
    { n:2, icon:'✍️',  title:'About You',         sub:'Tell your story in your own words' },
    { n:3, icon:'💼', title:'Work Preferences',  sub:'What kind of work are you looking for?' },
    { n:4, icon:'🔗', title:'Links & Portfolio', sub:'Show off your best work' },
    { n:5, icon:'⚡', title:'Skills & Expertise',sub:'Add the skills that define you' },
  ];

  readonly jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  readonly availabilityOpts  = [
    { value:'immediate',   label:'Available immediately', color:'#16a34a' },
    { value:'two-weeks',   label:'Available in 2 weeks',  color:'#2563eb' },
    { value:'one-month',   label:'Available in 1 month',  color:'#d97706' },
    { value:'not-looking', label:'Not looking right now', color:'#71717a' },
  ];

  readonly popularSkills = [
    'JavaScript','TypeScript','React','Angular','Vue.js','Node.js',
    'Python','Go','Rust','Java','C#','.NET','PHP','Ruby',
    'AWS','GCP','Azure','Docker','Kubernetes','Terraform',
    'PostgreSQL','MySQL','MongoDB','Redis','GraphQL','REST APIs',
    'Figma','Adobe XD','UX Research','Product Design','Branding',
    'Machine Learning','PyTorch','TensorFlow','Data Science','SQL',
    'DevOps','CI/CD','Linux','Git','Agile','Scrum',
  ];

  readonly categoryOptions = [
    'Engineering','Design','Data & AI','DevOps','Product','Marketing','Sales','Operations'
  ];

  selectedJobTypes: string[] = [];
  saveSuccess = '';

  private subs = new Subscription();

  get step() { return this.stepMeta[this.currentStep - 1]; }
  get progress() { return ((this.currentStep - 1) / this.totalSteps) * 100; }

  get currentUser() { return this.auth.currentUser; }

  get firstName(): string {
    const name = this.currentUser?.fullName;
    return name ? name.split(' ')[0] : 'there';
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private profileSvc: UserProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;

    this.step1 = this.fb.group({
      fullName: [user?.fullName || '', [Validators.required, Validators.minLength(2)]],
      headline: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      location: ['', Validators.required],
      phone: [''],
    });

    this.step2 = this.fb.group({
      bio: ['', [Validators.required, Validators.minLength(80), Validators.maxLength(600)]],
    });

    this.step3 = this.fb.group({
      availability: ['immediate', Validators.required],
      hourlyRate: ['', [Validators.required, Validators.min(10)]],
      category: ['Engineering', Validators.required],
      remoteOnly: [true],
    });

    this.step4 = this.fb.group({
      website: [''],
      github: [''],
      linkedin: [''],
      twitter: [''],
    });
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  next(): void {
    const form = this.currentForm();
    if (form) {
      form.markAllAsTouched();
      if (form.invalid) { 
        this.cdr.markForCheck(); 
        return; 
      }
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.cdr.markForCheck();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prev(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.cdr.markForCheck();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private currentForm(): FormGroup | null {
    const map: Record<number, FormGroup> = {
      1: this.step1,
      2: this.step2,
      3: this.step3,
      4: this.step4,
    };
    return map[this.currentStep] || null;
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.touched && c.invalid);
  }

  addSkill(skill?: string): void {
    const s = (skill || this.newSkill).trim();
    if (s && !this.skills.includes(s) && this.skills.length < 20) {
      this.skills = [...this.skills, s];
      this.newSkill = '';
      this.cdr.markForCheck();
    }
  }

  removeSkill(s: string): void {
    this.skills = this.skills.filter(x => x !== s);
    this.cdr.markForCheck();
  }

  hasSkill(s: string): boolean { return this.skills.includes(s); }

  onSkillKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  toggleJobType(t: string): void {
    this.selectedJobTypes = this.selectedJobTypes.includes(t)
      ? this.selectedJobTypes.filter(x => x !== t)
      : [...this.selectedJobTypes, t];
    this.cdr.markForCheck();
  }

  // ✅ UPDATED: Complete onboarding with backend API
  complete(): void {
    // Validate skills
    if (this.skills.length === 0) {
      this.showSaved('Please add at least one skill.', 'error');
      return;
    }

    // Validate hourly rate
    if (!this.step3.value.hourlyRate || this.step3.value.hourlyRate < 10) {
      this.showSaved('Please enter a valid hourly rate (minimum $10).', 'error');
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    // Prepare profile data for backend
    const profileData = {
      headline: this.step1.value.headline,
      bio: this.step2.value.bio,
      location: this.step1.value.location,
      phone: this.step1.value.phone,
      skills: this.skills,
      availability: this.step3.value.availability,
      hourlyRate: this.step3.value.hourlyRate,
      jobTypes: this.selectedJobTypes,
      remoteOnly: this.step3.value.remoteOnly,
      website: this.step4.value.website,
      github: this.step4.value.github,
      linkedin: this.step4.value.linkedin,
      twitter: this.step4.value.twitter
    };

    // Step 1: Update profile via backend API
    this.auth.updateFreelancerProfile(profileData).subscribe({
      next: () => {
        // Step 2: Mark onboarding as complete
        this.auth.completeOnboarding().subscribe({
          next: () => {
            // Also update local profile service for backward compatibility
            this.profileSvc.update(profileData);
            
            this.saving = false;
            this.showSaved('Profile completed successfully! Redirecting...', 'success');
            
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error completing onboarding:', error);
            this.saving = false;
            this.showSaved(error || 'Error completing onboarding. Please try again.', 'error');
            this.cdr.markForCheck();
          }
        });
      },
      error: (error) => {
        console.error('Error saving profile:', error);
        this.saving = false;
        this.showSaved(error || 'Error saving profile. Please try again.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ UPDATED: Skip onboarding
  skip(): void {
    if (confirm('Are you sure you want to skip? You can complete your profile later from your dashboard.')) {
      this.saving = true;
      
      this.auth.completeOnboarding().subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error skipping onboarding:', error);
          this.saving = false;
          this.showSaved('Error. Please try again.', 'error');
        }
      });
    }
  }

  // ✅ UPDATED: Show success or error message
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

  get bioLength(): number {
    return this.step2?.get('bio')?.value?.length || 0;
  }
}