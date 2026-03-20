// src/app/pages/profile/profile.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../shared/services/auth.service';

export interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  school: string;
  field: string;
  year: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export interface ProfileData {
  fullName:      string;
  headline:      string;
  email:         string;
  phone:         string;
  location:      string;
  website:       string;
  github:        string;
  linkedin:      string;
  bio:           string;
  skills:        string[];
  availability:  'immediate' | 'two-weeks' | 'one-month' | 'not-looking';
  hourlyRate:    string;
  jobTypes:      string[];
  remoteOnly:    boolean;
  experience:    WorkExperience[];
  education:     Education[];
  portfolio:     PortfolioItem[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentUser: AuthUser | null = null;
  activeSection = 'about';
  saveSuccess   = '';
  newSkill      = '';
  editingExp    = -1;
  editingEdu    = -1;

  // Editing flags per section
  editingAbout    = false;
  editingContact  = false;
  editingSkills   = false;
  editingAvail    = false;

  profile: ProfileData = {
    fullName:     '',
    headline:     'Full-Stack Developer · Angular · Node.js · Remote',
    email:        '',
    phone:        '+1 (555) 000-0000',
    location:     'Lagos, Nigeria',
    website:      'https://yourportfolio.dev',
    github:       'github.com/yourhandle',
    linkedin:     'linkedin.com/in/yourname',
    bio:          "I'm a passionate full-stack developer with 5+ years building scalable web applications. I specialise in Angular, React, and Node.js. I thrive in remote-first teams and love shipping clean, well-tested code.",
    skills:       ['Angular', 'TypeScript', 'Node.js', 'React', 'PostgreSQL', 'AWS', 'Docker', 'REST APIs'],
    availability: 'immediate',
    hourlyRate:   '$65',
    jobTypes:     ['Full-time', 'Contract'],
    remoteOnly:   true,
    experience: [
      {
        id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Ltd',
        location: 'Remote', startDate: 'Jan 2022', endDate: '', current: true,
        description: 'Lead frontend development for a SaaS platform serving 50K+ users. Built reusable Angular component library. Improved page load speed by 40%.',
      },
      {
        id: 2, title: 'Full-Stack Developer', company: 'StartupXYZ',
        location: 'Lagos, Nigeria', startDate: 'Mar 2019', endDate: 'Dec 2021', current: false,
        description: 'Built and maintained RESTful APIs with Node.js. Developed React dashboards. Worked with Agile team of 8 engineers.',
      },
    ],
    education: [
      {
        id: 1, degree: "Bachelor's", school: 'University of Lagos',
        field: 'Computer Science', year: '2019',
      },
    ],
    portfolio: [
      {
        id: 1, title: 'Job Board Platform', url: 'https://github.com/yourhandle/job-board',
        description: 'Full-stack Angular + Node.js job board with real-time notifications.',
        tags: ['Angular', 'Node.js', 'PostgreSQL'],
      },
      {
        id: 2, title: 'E-Commerce Dashboard', url: 'https://yourportfolio.dev/ecommerce',
        description: 'React admin dashboard with real-time analytics and inventory management.',
        tags: ['React', 'TypeScript', 'Chart.js'],
      },
    ],
  };

  // Temp copies for editing
  editProfile: Partial<ProfileData> = {};

  readonly availabilityOptions = [
    { value: 'immediate',   label: 'Available immediately',   color: '#16a34a' },
    { value: 'two-weeks',   label: 'Available in 2 weeks',    color: '#2563eb' },
    { value: 'one-month',   label: 'Available in 1 month',    color: '#d97706' },
    { value: 'not-looking', label: 'Not looking right now',   color: '#71717a' },
  ];

  readonly jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  readonly sections = [
    { id: 'about',      label: 'About',       icon: '👤' },
    { id: 'experience', label: 'Experience',   icon: '💼' },
    { id: 'skills',     label: 'Skills',       icon: '⚡' },
    { id: 'portfolio',  label: 'Portfolio',    icon: '🎨' },
    { id: 'education',  label: 'Education',    icon: '🎓' },
    { id: 'settings',   label: 'Availability', icon: '⚙️' },
  ];

  get profileStrength(): number {
    let score = 0;
    if (this.profile.fullName)               score += 10;
    if (this.profile.headline)               score += 10;
    if (this.profile.bio && this.profile.bio.length > 50) score += 15;
    if (this.profile.skills.length >= 3)     score += 15;
    if (this.profile.skills.length >= 6)     score += 5;
    if (this.profile.experience.length >= 1) score += 15;
    if (this.profile.portfolio.length >= 1)  score += 10;
    if (this.profile.github)                 score += 5;
    if (this.profile.linkedin)               score += 5;
    if (this.profile.phone)                  score += 5;
    if (this.profile.website)                score += 5;
    return Math.min(score, 100);
  }

  get strengthLabel(): string {
    const s = this.profileStrength;
    if (s < 40)  return 'Getting started';
    if (s < 65)  return 'Looking good';
    if (s < 85)  return 'Strong profile';
    return 'All-star profile';
  }

  get strengthColor(): string {
    const s = this.profileStrength;
    if (s < 40)  return '#dc2626';
    if (s < 65)  return '#f59e0b';
    if (s < 85)  return '#2563eb';
    return '#16a34a';
  }

  get userInitials(): string {
    const name = this.profile.fullName || this.currentUser?.fullName || 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  get availabilityLabel(): string {
    return this.availabilityOptions.find(o => o.value === this.profile.availability)?.label || '';
  }

  get availabilityColor(): string {
    return this.availabilityOptions.find(o => o.value === this.profile.availability)?.color || '#71717a';
  }

  private subs = new Subscription();

  constructor(
    private auth: AuthService,
    private cdr:  ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.profile.fullName = user.fullName;
          this.profile.email    = user.email;
        }
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  setSection(id: string): void {
    this.activeSection = id;
    this.cancelAllEdits();
    this.cdr.markForCheck();
  }

  // ── About / contact editing ──────────────────────────────────
  startEditAbout(): void {
    this.editProfile = { ...this.profile };
    this.editingAbout = true;
    this.cdr.markForCheck();
  }

  saveAbout(): void {
    Object.assign(this.profile, {
      fullName: this.editProfile.fullName,
      headline: this.editProfile.headline,
      bio:      this.editProfile.bio,
    });
    this.editingAbout = false;
    this.showSaved('About saved!');
  }

  startEditContact(): void {
    this.editProfile = { ...this.profile };
    this.editingContact = true;
    this.cdr.markForCheck();
  }

  saveContact(): void {
    Object.assign(this.profile, {
      phone:    this.editProfile.phone,
      location: this.editProfile.location,
      website:  this.editProfile.website,
      github:   this.editProfile.github,
      linkedin: this.editProfile.linkedin,
    });
    this.editingContact = false;
    this.showSaved('Contact saved!');
  }

  // ── Skills ──────────────────────────────────────────────────
  addSkill(): void {
    const s = this.newSkill.trim();
    if (s && !this.profile.skills.includes(s)) {
      this.profile.skills = [...this.profile.skills, s];
      this.newSkill = '';
      this.showSaved('Skill added!');
    }
  }

  removeSkill(skill: string): void {
    this.profile.skills = this.profile.skills.filter(s => s !== skill);
    this.cdr.markForCheck();
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addSkill(); }
  }

  // ── Availability ────────────────────────────────────────────
  startEditAvail(): void {
    this.editProfile = { ...this.profile, jobTypes: [...this.profile.jobTypes] };
    this.editingAvail = true;
    this.cdr.markForCheck();
  }

  saveAvail(): void {
    Object.assign(this.profile, {
      availability: this.editProfile.availability,
      hourlyRate:   this.editProfile.hourlyRate,
      remoteOnly:   this.editProfile.remoteOnly,
      jobTypes:     this.editProfile.jobTypes,
    });
    this.editingAvail = false;
    this.showSaved('Availability saved!');
  }

  toggleJobType(type: string): void {
    const types = (this.editProfile.jobTypes || []) as string[];
    const idx   = types.indexOf(type);
    if (idx === -1) {
      this.editProfile.jobTypes = [...types, type];
    } else {
      this.editProfile.jobTypes = types.filter(t => t !== type);
    }
    this.cdr.markForCheck();
  }

  isJobTypeSelected(type: string): boolean {
    return ((this.editProfile.jobTypes as string[]) || []).includes(type);
  }

  // ── Experience ──────────────────────────────────────────────
  addExperience(): void {
    const newExp: WorkExperience = {
      id: Date.now(), title: '', company: '', location: 'Remote',
      startDate: '', endDate: '', current: false, description: '',
    };
    this.profile.experience = [newExp, ...this.profile.experience];
    this.editingExp = newExp.id;
    this.cdr.markForCheck();
  }

  saveExperience(exp: WorkExperience): void {
    this.editingExp = -1;
    this.showSaved('Experience saved!');
  }

  removeExperience(id: number): void {
    this.profile.experience = this.profile.experience.filter(e => e.id !== id);
    this.cdr.markForCheck();
  }

  // ── Education ───────────────────────────────────────────────
  addEducation(): void {
    const newEdu: Education = {
      id: Date.now(), degree: '', school: '', field: '', year: '',
    };
    this.profile.education = [newEdu, ...this.profile.education];
    this.editingEdu = newEdu.id;
    this.cdr.markForCheck();
  }

  saveEducation(edu: Education): void {
    this.editingEdu = -1;
    this.showSaved('Education saved!');
  }

  removeEducation(id: number): void {
    this.profile.education = this.profile.education.filter(e => e.id !== id);
    this.cdr.markForCheck();
  }

  // ── Portfolio ───────────────────────────────────────────────
  addPortfolio(): void {
    const item: PortfolioItem = {
      id: Date.now(), title: '', description: '', url: '', tags: [],
    };
    this.profile.portfolio = [item, ...this.profile.portfolio];
    this.cdr.markForCheck();
  }

  removePortfolio(id: number): void {
    this.profile.portfolio = this.profile.portfolio.filter(p => p.id !== id);
    this.cdr.markForCheck();
  }

  // ── Helpers ─────────────────────────────────────────────────
  cancelAllEdits(): void {
    this.editingAbout   = false;
    this.editingContact = false;
    this.editingAvail   = false;
    this.editingExp     = -1;
    this.editingEdu     = -1;
    this.editProfile    = {};
  }

  private showSaved(msg: string): void {
    this.saveSuccess = msg;
    this.cdr.markForCheck();
    setTimeout(() => { this.saveSuccess = ''; this.cdr.markForCheck(); }, 2500);
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
}