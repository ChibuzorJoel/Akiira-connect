// src/app/pages/employer-profile/employer-profile.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-employer-profile',
  templateUrl: './employer-profile.component.html',
  styleUrls: ['./employer-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployerProfileComponent implements OnInit, OnDestroy {

  activeTab    = 'details';
  saveSuccess  = '';
  isSaving     = false;
  errorMessage = '';
  isLoading    = true;

  readonly tabs = [
    { id: 'details',  label: 'Company Details' },
    { id: 'about',    label: 'About & Culture' },
    { id: 'links',    label: 'Links & Social'  },
    { id: 'hiring',   label: 'Hiring Prefs'    },
  ];

  detailsForm!:  FormGroup;
  aboutForm!:    FormGroup;
  linksForm!:    FormGroup;
  hiringForm!:   FormGroup;

  readonly companySizes  = ['1–10 (Startup)','11–50','51–200','201–500','501–1,000','1,001–5,000','5,000+'];
  readonly industries    = ['Technology','FinTech','Healthcare','E-Commerce','Education','Media & Entertainment','SaaS','AI / Machine Learning','Developer Tools','Design / Creative','Marketing','Other'];
  readonly remotePolicies = ['Remote (Global)','Remote (US only)','Remote (EU only)','Remote (US/EU)','Hybrid','On-site only'];

  hiringRoles: string[]        = [];
  newRole                      = '';
  selectedContractTypes: string[] = ['Full-time','Contract'];

  readonly contractTypes = ['Full-time','Part-time','Contract','Freelance','Internship'];
  readonly roleOptions   = ['Frontend Developer','Backend Engineer','Full-Stack Engineer','React Developer','Angular Developer','ML Engineer','Data Scientist','DevOps / SRE','Product Designer','UX Researcher','Product Manager','Technical Writer'];

  private subs = new Subscription();

  get companyName(): string { return this.detailsForm?.get('companyName')?.value || 'Your Company'; }
  get companyInitials(): string {
    const n = this.companyName.trim().split(' ');
    return n.length === 1 ? n[0][0].toUpperCase() : (n[0][0] + n[1][0]).toUpperCase();
  }

  get profileStrength(): number {
    let score = 0;
    if (this.detailsForm?.get('companyName')?.value)  score += 20;
    if (this.detailsForm?.get('tagline')?.value)       score += 10;
    if (this.detailsForm?.get('website')?.value)       score += 10;
    if (this.aboutForm?.get('description')?.value?.length > 80) score += 20;
    if (this.linksForm?.get('linkedin')?.value)        score += 15;
    if (this.hiringRoles.length > 0)                   score += 15;
    if (this.hiringForm?.get('hiringVolume')?.value)   score += 10;
    return score;
  }

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
    private cdr:  ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfileFromBackend();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initForms(): void {
    this.detailsForm = this.fb.group({
      companyName: ['', Validators.required],
      tagline:     [''],
      website:     [''],
      companySize: [''],
      industry:    [''],
      founded:     [''],
      location:    [''],
    });

    this.aboutForm = this.fb.group({
      description: [''],
      mission:     [''],
      culture:     [''],
    });

    this.linksForm = this.fb.group({
      linkedin:  [''],
      twitter:   [''],
      github:    [''],
      glassdoor: [''],
    });

    this.hiringForm = this.fb.group({
      hiringVolume: [''],
      budgetRange:  [''],
      remotePolicy: ['Remote (Global)'],
    });
  }

  private loadProfileFromBackend(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.auth.getUserProfile().subscribe({
      next: (response) => {
        if (response.success && response.company) {
          // Populate forms with backend data
          this.detailsForm.patchValue({
            companyName: response.company.companyName || '',
            tagline: response.company.tagline || '',
            website: response.company.companyWebsite || '',
            companySize: response.company.companySize || '',
            industry: response.company.industry || '',
            founded: response.company.foundedYear || '',
            location: response.company.headquarters || '',
          });

          this.aboutForm.patchValue({
            description: response.company.companyDescription || '',
            mission: response.company.mission || '',
            culture: response.company.culture || '',
          });

          this.linksForm.patchValue({
            linkedin: response.company.linkedin || '',
            twitter: response.company.twitter || '',
            github: response.company.github || '',
            glassdoor: response.company.glassdoor || '',
          });

          this.hiringForm.patchValue({
            hiringVolume: response.company.hiringVolume || '',
            budgetRange: response.company.budgetRange || '',
            remotePolicy: response.company.remotePolicy || 'Remote (Global)',
          });

          this.hiringRoles = response.company.hiringRoles || [];
          this.selectedContractTypes = response.company.contractTypes || ['Full-time', 'Contract'];
        }
        
        // Also try to load from localStorage as fallback
        this.loadFromLocalStorageFallback();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employer profile:', error);
        // Fallback to localStorage if backend fails
        this.loadFromLocalStorageFallback();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadFromLocalStorageFallback(): void {
    try {
      const saved = JSON.parse(localStorage.getItem('akiira_company_profile') || '{}');
      
      // Only apply if form fields are empty
      if (!this.detailsForm.get('companyName')?.value && saved.companyName) {
        this.detailsForm.patchValue({
          companyName: saved.companyName || '',
          tagline: saved.tagline || '',
          website: saved.website || '',
          companySize: saved.companySize || '',
          industry: saved.industry || '',
          founded: saved.founded || '',
          location: saved.location || '',
        });

        this.aboutForm.patchValue({
          description: saved.description || '',
          mission: saved.mission || '',
          culture: saved.culture || '',
        });

        this.linksForm.patchValue({
          linkedin: saved.linkedin || '',
          twitter: saved.twitter || '',
          github: saved.github || '',
          glassdoor: saved.glassdoor || '',
        });

        this.hiringForm.patchValue({
          hiringVolume: saved.hiringVolume || '',
          budgetRange: saved.budgetRange || '',
          remotePolicy: saved.remotePolicy || 'Remote (Global)',
        });

        this.hiringRoles = saved.hiringRoles || [];
        this.selectedContractTypes = saved.contractTypes || ['Full-time', 'Contract'];
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  setTab(id: string): void { 
    this.activeTab = id; 
    this.cdr.markForCheck(); 
  }

  save(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const profileData = {
      companyWebsite: this.detailsForm.value.website,
      companyDescription: this.aboutForm.value.description,
      headquarters: this.detailsForm.value.location,
      foundedYear: this.detailsForm.value.founded ? parseInt(this.detailsForm.value.founded) : undefined,
      hiringRoles: this.hiringRoles,
      remotePolicy: this.hiringForm.value.remotePolicy,
      companySize: this.detailsForm.value.companySize,
      industry: this.detailsForm.value.industry,
      tagline: this.detailsForm.value.tagline,
      mission: this.aboutForm.value.mission,
      culture: this.aboutForm.value.culture,
      hiringVolume: this.hiringForm.value.hiringVolume,
      budgetRange: this.hiringForm.value.budgetRange,
      contractTypes: this.selectedContractTypes,
      linkedin: this.linksForm.value.linkedin,
      twitter: this.linksForm.value.twitter,
      github: this.linksForm.value.github,
      glassdoor: this.linksForm.value.glassdoor
    };

    this.auth.updateEmployerProfile(profileData).subscribe({
      next: () => {
        // Also save to localStorage as backup
        const backupProfile = {
          ...this.detailsForm.value,
          ...this.aboutForm.value,
          ...this.linksForm.value,
          ...this.hiringForm.value,
          hiringRoles: this.hiringRoles,
          contractTypes: this.selectedContractTypes,
        };
        localStorage.setItem('akiira_company_profile', JSON.stringify(backupProfile));
        
        this.isSaving = false;
        this.saveSuccess = 'Company profile saved successfully!';
        this.cdr.markForCheck();
        
        setTimeout(() => { 
          this.saveSuccess = ''; 
          this.cdr.markForCheck(); 
        }, 3000);
      },
      error: (error) => {
        console.error('Error saving employer profile:', error);
        this.isSaving = false;
        this.errorMessage = error || 'Error saving profile. Please try again.';
        this.cdr.markForCheck();
        
        setTimeout(() => { 
          this.errorMessage = ''; 
          this.cdr.markForCheck(); 
        }, 3000);
      }
    });
  }

  addRole(r?: string): void {
    const role = (r || this.newRole).trim();
    if (role && !this.hiringRoles.includes(role) && this.hiringRoles.length < 15) {
      this.hiringRoles = [...this.hiringRoles, role];
      this.newRole = '';
      this.cdr.markForCheck();
    }
  }

  removeRole(r: string): void { 
    this.hiringRoles = this.hiringRoles.filter(x => x !== r); 
    this.cdr.markForCheck(); 
  }

  hasRole(r: string): boolean { 
    return this.hiringRoles.includes(r); 
  }

  toggleContract(t: string): void {
    this.selectedContractTypes = this.selectedContractTypes.includes(t)
      ? this.selectedContractTypes.filter(x => x !== t)
      : [...this.selectedContractTypes, t];
    this.cdr.markForCheck();
  }

  get descLength(): number { 
    return this.aboutForm?.get('description')?.value?.length || 0; 
  }
}