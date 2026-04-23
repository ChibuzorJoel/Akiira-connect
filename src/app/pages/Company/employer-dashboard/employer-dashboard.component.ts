// src/app/pages/employer-dashboard/employer-dashboard.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

interface JobPosting {
  id:          number;
  title:       string;
  type:        string;
  location:    string;
  applicants:  number;
  newApps:     number;
  status:      'active' | 'paused' | 'closed';
  postedAt:    string;
  salary:      string;
  views:       number;
}

interface Applicant {
  id:          number;
  name:        string;
  initials:    string;
  avatarColor: string;
  role:        string;
  location:    string;
  matchScore:  number;
  appliedAt:   string;
  status:      'new' | 'reviewed' | 'interview' | 'offer' | 'rejected';
  skills:      string[];
}

@Component({
  selector: 'app-employer-dashboard',
  templateUrl: './employer-dashboard.component.html',
  styleUrls: ['./employer-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployerDashboardComponent implements OnInit, OnDestroy {

  activeTab = 'overview';
  currentUser: any = null;
  companyProfile: any = {};

  readonly tabs = [
    { id: 'overview',    label: 'Overview',    icon: '📊' },
    { id: 'jobs',        label: 'My Jobs',      icon: '💼' },
    { id: 'applicants',  label: 'Applicants',   icon: '👥' },
    { id: 'analytics',   label: 'Analytics',    icon: '📈' },
  ];

  readonly stats = [
    { label: 'Active Jobs',     value: '4',    delta: '+1 this week',  icon: '💼', color: '#d97706' },
    { label: 'Total Applicants',value: '128',  delta: '+28 this week', icon: '👥', color: '#0c0c0e' },
    { label: 'Interviews Set',  value: '12',   delta: '+3 this week',  icon: '📅', color: '#d97706' },
    { label: 'Avg. Match Score',value: '87%',  delta: '+4% vs last mo',icon: '🎯', color: '#0c0c0e' },
  ];

  readonly jobPostings: JobPosting[] = [
    { id:1, title:'Senior React Developer',   type:'Full-time', location:'Remote (Global)',  applicants:42, newApps:8,  status:'active', postedAt:'3 days ago', salary:'$120K–$160K', views:1240 },
    { id:2, title:'Backend Engineer (Node.js)',type:'Full-time', location:'Remote (US/EU)',   applicants:28, newApps:5,  status:'active', postedAt:'1 week ago', salary:'$100K–$140K', views:892  },
    { id:3, title:'UI/UX Designer',            type:'Contract',  location:'Remote (Global)', applicants:17, newApps:2,  status:'active', postedAt:'2 weeks ago',salary:'$70–$90/hr',  views:634  },
    { id:4, title:'DevOps Engineer',           type:'Full-time', location:'Remote (US)',     applicants:11, newApps:0,  status:'paused', postedAt:'3 weeks ago',salary:'$130K–$170K', views:445  },
  ];

  readonly applicants: Applicant[] = [
    { id:1, name:'James Whitfield',  initials:'JW', avatarColor:'#d97706', role:'Senior React Developer',    location:'London, UK',        matchScore:96, appliedAt:'2h ago',    status:'new',       skills:['React','TypeScript','GraphQL']      },
    { id:2, name:'Adaeze Okonkwo',   initials:'AO', avatarColor:'#6366f1', role:'UI/UX Designer',             location:'Lagos, Nigeria',    matchScore:92, appliedAt:'5h ago',    status:'new',       skills:['Figma','UX Research','Prototyping']  },
    { id:3, name:'Ravi Shankar',     initials:'RS', avatarColor:'#10b981', role:'Backend Engineer (Node.js)', location:'Pune, India',       matchScore:89, appliedAt:'1d ago',    status:'reviewed',  skills:['Node.js','Go','PostgreSQL']          },
    { id:4, name:'Sofia Andersen',   initials:'SA', avatarColor:'#ec4899', role:'UI/UX Designer',             location:'Copenhagen',        matchScore:88, appliedAt:'1d ago',    status:'interview', skills:['Figma','Webflow','Motion Design']     },
    { id:5, name:'Marcus Teixeira',  initials:'MT', avatarColor:'#8b5cf6', role:'Backend Engineer (Node.js)', location:'São Paulo, Brazil', matchScore:85, appliedAt:'2d ago',    status:'interview', skills:['Python','PyTorch','MLOps']           },
    { id:6, name:'Kwame Mensah',     initials:'KM', avatarColor:'#059669', role:'DevOps Engineer',            location:'Accra, Ghana',      matchScore:82, appliedAt:'3d ago',    status:'reviewed',  skills:['Kubernetes','AWS','Terraform']        },
    { id:7, name:'Tunde Adeyemi',    initials:'TA', avatarColor:'#7d2ae8', role:'Senior React Developer',     location:'Lagos, Nigeria',    matchScore:91, appliedAt:'3d ago',    status:'offer',     skills:['React','Next.js','TypeScript']        },
    { id:8, name:'Ingrid Larsson',   initials:'IL', avatarColor:'#0052cc', role:'UI/UX Designer',             location:'Stockholm, Sweden', matchScore:79, appliedAt:'4d ago',    status:'rejected',  skills:['Adobe XD','Figma','Branding']         },
  ];

  readonly activityFeed = [
    { icon:'🆕', text:'James Whitfield applied for Senior React Developer', time:'2h ago',    type:'apply'     },
    { icon:'📅', text:'Interview scheduled with Sofia Andersen — Tomorrow 10am', time:'4h ago', type:'interview' },
    { icon:'🎯', text:'Your DevOps Engineer job hit 400+ views', time:'6h ago',    type:'milestone' },
    { icon:'💬', text:'Marcus Teixeira sent you a message', time:'1d ago',    type:'message'   },
    { icon:'✅', text:'Offer sent to Tunde Adeyemi', time:'2d ago',    type:'offer'     },
    { icon:'🆕', text:'Adaeze Okonkwo applied for UI/UX Designer', time:'5h ago',    type:'apply'     },
  ];

  filterStatus = 'all';

  get companyName(): string {
    return this.companyProfile?.companyName || this.currentUser?.fullName || 'Your Company';
  }

  get companyInitials(): string {
    const name = this.companyName;
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  get filteredApplicants(): Applicant[] {
    if (this.filterStatus === 'all') return this.applicants;
    return this.applicants.filter(a => a.status === this.filterStatus);
  }

  get totalNewApps(): number {
    return this.jobPostings.reduce((sum, j) => sum + j.newApps, 0);
  }

  private subs = new Subscription();

  constructor(
    private auth:   AuthService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(u => {
        this.currentUser = u;
        this.cdr.markForCheck();
      })
    );
    try {
      this.companyProfile = JSON.parse(localStorage.getItem('akiira_company_profile') || '{}');
    } catch {}
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  setTab(id: string): void    { this.activeTab    = id; this.cdr.markForCheck(); }
  setFilter(f: string): void  { this.filterStatus = f; this.cdr.markForCheck(); }
  goPostJob(): void            { this.router.navigate(['/post-job']); }
  goTalent(): void             { this.router.navigate(['/talent']);   }
  goProfile(): void            { this.router.navigate(['/employer-profile']); }

  statusColor(s: string): string {
    const map: Record<string, string> = {
      new: '#d97706', reviewed: '#0c0c0e',
      interview: '#7c3aed', offer: '#16a34a', rejected: '#dc2626',
    };
    return map[s] || '#a1a1aa';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      new: 'New', reviewed: 'Reviewed',
      interview: 'Interview', offer: 'Offer Sent', rejected: 'Rejected',
    };
    return map[s] || s;
  }

  jobStatusColor(s: string): string {
    return s === 'active' ? '#16a34a' : s === 'paused' ? '#d97706' : '#a1a1aa';
  }

  trackById(_: number, item: any): number { return item.id; }
}