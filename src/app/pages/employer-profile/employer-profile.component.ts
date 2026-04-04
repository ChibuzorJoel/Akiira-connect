// src/app/pages/employer-profile/employer-profile.component.ts
import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-employer-profile',
  templateUrl: './employer-profile.component.html',
  styleUrls: ['./employer-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployerProfileComponent implements OnInit {

  activeTab    = 'details';
  saveSuccess  = '';
  isSaving     = false;

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
    let saved: any = {};
    try { saved = JSON.parse(localStorage.getItem('akiira_company_profile') || '{}'); } catch {}

    this.detailsForm = this.fb.group({
      companyName: [saved.companyName || '', Validators.required],
      tagline:     [saved.tagline     || ''],
      website:     [saved.website     || ''],
      companySize: [saved.companySize || ''],
      industry:    [saved.industry    || ''],
      founded:     [saved.founded     || ''],
      location:    [saved.location    || ''],
    });

    this.aboutForm = this.fb.group({
      description: [saved.description || ''],
      mission:     [saved.mission     || ''],
      culture:     [saved.culture     || ''],
    });

    this.linksForm = this.fb.group({
      linkedin:  [saved.linkedin  || ''],
      twitter:   [saved.twitter   || ''],
      github:    [saved.github    || ''],
      glassdoor: [saved.glassdoor || ''],
    });

    this.hiringForm = this.fb.group({
      hiringVolume: [saved.hiringVolume || ''],
      budgetRange:  [saved.budgetRange  || ''],
      remotePolicy: [saved.remotePolicy || 'Remote (Global)'],
    });

    this.hiringRoles        = saved.hiringRoles        || [];
    this.selectedContractTypes = saved.contractTypes   || ['Full-time','Contract'];
  }

  setTab(id: string): void { this.activeTab = id; this.cdr.markForCheck(); }

  save(): void {
    this.isSaving = true; this.cdr.markForCheck();
    const profile = {
      ...this.detailsForm.value,
      ...this.aboutForm.value,
      ...this.linksForm.value,
      ...this.hiringForm.value,
      hiringRoles:   this.hiringRoles,
      contractTypes: this.selectedContractTypes,
    };
    localStorage.setItem('akiira_company_profile', JSON.stringify(profile));
    setTimeout(() => {
      this.isSaving    = false;
      this.saveSuccess = 'Company profile saved!';
      this.cdr.markForCheck();
      setTimeout(() => { this.saveSuccess = ''; this.cdr.markForCheck(); }, 3000);
    }, 900);
  }

  addRole(r?: string): void {
    const role = (r || this.newRole).trim();
    if (role && !this.hiringRoles.includes(role)) {
      this.hiringRoles = [...this.hiringRoles, role];
      this.newRole = '';
      this.cdr.markForCheck();
    }
  }
  removeRole(r: string): void { this.hiringRoles = this.hiringRoles.filter(x => x !== r); this.cdr.markForCheck(); }
  hasRole(r: string): boolean { return this.hiringRoles.includes(r); }
  toggleContract(t: string): void {
    this.selectedContractTypes = this.selectedContractTypes.includes(t)
      ? this.selectedContractTypes.filter(x => x !== t)
      : [...this.selectedContractTypes, t];
    this.cdr.markForCheck();
  }

  get descLength(): number { return this.aboutForm?.get('description')?.value?.length || 0; }
}