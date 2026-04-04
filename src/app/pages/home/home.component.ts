// src/app/pages/home/home.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {

  searchQuery    = '';
  searchLocation = 'Remote';
  activeCategory = 'All';

  readonly categories = ['All', 'Engineering', 'Design', 'AI/ML', 'Data', 'DevOps', 'Mobile'];

  readonly stats = [
    { value: '48,200+', label: 'Remote Jobs'       },
    { value: '12,500+', label: 'Companies Hiring'  },
    { value: '320K+',   label: 'Freelancers Hired' },
    { value: '18hrs',   label: 'Avg. Response'     },
  ];

  readonly featuredJobs = [
    { id: 6,  logo: 'O', logoColor: '#8b5cf6', title: 'AI / ML Engineer',          company: 'OpenAI',  salary: '$160K–$220K', tags: ['Python','PyTorch'], matchScore: 91, postedAt: '3h ago'  },
    { id: 1,  logo: 'S', logoColor: '#6366f1', title: 'Senior React Developer',     company: 'Stripe',  salary: '$120K–$160K', tags: ['React','TypeScript'], matchScore: 92, postedAt: '2h ago' },
    { id: 3,  logo: 'V', logoColor: '#10b981', title: 'Full-Stack Engineer',        company: 'Vercel',  salary: '$110K–$150K', tags: ['Angular','Node.js'], matchScore: 95, postedAt: '1d ago' },
    { id: 7,  logo: 'S', logoColor: '#059669', title: 'Frontend Architect',         company: 'Shopify', salary: '$140K–$190K', tags: ['React','Next.js'], matchScore: 87, postedAt: '4h ago'   },
  ];

  readonly testimonials = [
    { name: 'Adaeze Okonkwo', role: 'UX Designer · Notion', avatar: 'AO', color: '#6366f1', text: 'Found my dream remote contract in 6 days. The match score feature is incredibly accurate — every job it recommended was a genuine fit.' },
    { name: 'Marcus Teixeira', role: 'ML Engineer · Scale AI', avatar: 'MT', color: '#0ea5e9', text: "Negotiated $40K above my asking price using the salary guide. This platform completely changed how I approach job hunting." },
    { name: 'Priya Nair', role: 'DevOps Engineer · Figma', avatar: 'PN', color: '#10b981', text: 'Applied to 8 jobs Sunday morning. By Thursday I had 3 interviews. The quick-apply feature saves hours per application.' },
    { name: 'Tunde Adeyemi', role: 'Senior Frontend Dev · GitHub', avatar: 'TA', color: '#f59e0b', text: 'As someone in Lagos, finding legitimate remote work used to be a nightmare. Akiira Connect opened doors I thought were closed to me.' },
  ];

  readonly howItWorks = [
    { step: '01', icon: '👤', title: 'Build your profile',  desc: 'Set up once. Your skills, experience, and preferences create a profile that speaks for you.' },
    { step: '02', icon: '🎯', title: 'Get matched',         desc: 'Our algorithm surfaces roles that genuinely fit your background — with a match score for every job.' },
    { step: '03', icon: '⚡', title: 'Apply in seconds',    desc: 'Quick Apply sends your profile with one click. No reformatting, no re-entering info.' },
    { step: '04', icon: '💬', title: 'Connect directly',    desc: 'Chat directly with hiring managers. No recruiters, no middlemen, no delays.' },
  ];

  readonly companies = [
    { name: 'Stripe',    logo: 'S', color: '#6366f1' },
    { name: 'Vercel',    logo: 'V', color: '#10b981' },
    { name: 'OpenAI',    logo: 'O', color: '#8b5cf6' },
    { name: 'Notion',    logo: 'N', color: '#0ea5e9' },
    { name: 'Figma',     logo: 'F', color: '#ec4899' },
    { name: 'GitHub',    logo: 'G', color: '#24292f' },
    { name: 'Shopify',   logo: 'S', color: '#059669' },
    { name: 'Airbnb',    logo: 'A', color: '#f59e0b' },
    { name: 'Discord',   logo: 'D', color: '#5865f2' },
    { name: 'Linear',    logo: 'L', color: '#5b5bd6' },
    { name: 'Atlassian', logo: 'A', color: '#0052cc' },
    { name: 'Canva',     logo: 'C', color: '#7d2ae8' },
  ];

  activeTestimonial = 0;
  isLoggedIn        = false;
  private subs      = new Subscription();
  private ticker!:   ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private auth:   AuthService,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(u => {
        this.isLoggedIn = !!u;
        this.cdr.markForCheck();
      })
    );
    this.ticker = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearInterval(this.ticker);
  }

  search(): void {
    this.router.navigate(['/jobs'], {
      queryParams: this.searchQuery ? { q: this.searchQuery } : {}
    });
  }

  goToJobs(category?: string): void {
    this.router.navigate(['/jobs'], {
      queryParams: category && category !== 'All' ? { cat: category } : {}
    });
  }

  viewJob(id: number): void { this.router.navigate(['/jobs', id]); }

  setTestimonial(i: number): void {
    this.activeTestimonial = i;
    clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      this.cdr.markForCheck();
    }, 5000);
    this.cdr.markForCheck();
  }
}