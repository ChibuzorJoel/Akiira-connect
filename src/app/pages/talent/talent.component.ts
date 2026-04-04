// src/app/pages/talent/talent.component.ts
import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

export interface Freelancer {
  id:           number;
  name:         string;
  initials:     string;
  avatarColor:  string;
  headline:     string;
  location:     string;
  hourlyRate:   string;
  availability: string;
  availColor:   string;
  skills:       string[];
  rating:       number;
  reviews:      number;
  hiredCount:   number;
  responseTime: string;
  bio:          string;
  category:     string;
  featured:     boolean;
}

@Component({
  selector: 'app-talent',
  templateUrl: './talent.component.html',
  styleUrls: ['./talent.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TalentComponent implements OnInit {

  searchQuery    = '';
  activeCategory = 'All';
  activeAvail    = 'All';
  sortBy         = 'Featured';
  sidebarOpen    = false;
  maxRate        = 200;

  readonly categories   = ['All', 'Engineering', 'Design', 'Data & AI', 'DevOps', 'Product', 'Marketing'];
  readonly availOptions = ['All', 'Immediate', '2 Weeks', '1 Month'];
  readonly sortOptions  = ['Featured', 'Top Rated', 'Lowest Rate', 'Most Hired'];

  readonly freelancers: Freelancer[] = [
    { id:1,  name:'Adaeze Okonkwo',   initials:'AO', avatarColor:'#6366f1', headline:'Senior UX Designer · Figma · Research · Systems', location:'Lagos, Nigeria',    hourlyRate:'$85/hr',  availability:'Immediate', availColor:'#16a34a', skills:['Figma','UX Research','Prototyping','Design Systems'], rating:4.9, reviews:47, hiredCount:38, responseTime:'< 2hrs', bio:'5 years designing complex SaaS products. Ex-Intercom.', category:'Design',      featured:true  },
    { id:2,  name:'Marcus Teixeira',  initials:'MT', avatarColor:'#10b981', headline:'ML Engineer · PyTorch · LLMs · Production AI',    location:'São Paulo, Brazil', hourlyRate:'$120/hr', availability:'Immediate', availColor:'#16a34a', skills:['Python','PyTorch','LLMs','MLOps'],                    rating:4.8, reviews:31, hiredCount:22, responseTime:'< 4hrs', bio:'Built ML pipelines serving 10M+ predictions/day.', category:'Data & AI', featured:true  },
    { id:3,  name:'James Whitfield',  initials:'JW', avatarColor:'#f59e0b', headline:'Senior React Developer · TypeScript · Node.js',   location:'London, UK',        hourlyRate:'$95/hr',  availability:'2 Weeks',   availColor:'#2563eb', skills:['React','TypeScript','Node.js','GraphQL'],             rating:5.0, reviews:62, hiredCount:54, responseTime:'< 1hr',  bio:'Shipped 12+ production SaaS apps for startups.', category:'Engineering', featured:true },
    { id:4,  name:'Priya Nair',       initials:'PN', avatarColor:'#ec4899', headline:'DevOps Engineer · Kubernetes · AWS · Terraform',  location:'Bangalore, India',  hourlyRate:'$75/hr',  availability:'Immediate', availColor:'#16a34a', skills:['Kubernetes','AWS','Terraform','Docker'],              rating:4.7, reviews:28, hiredCount:19, responseTime:'< 3hrs', bio:'Zero-downtime infra for teams at scale.', category:'DevOps', featured:false },
    { id:5,  name:'Chisom Eze',       initials:'CE', avatarColor:'#8b5cf6', headline:'Full-Stack Engineer · Angular · .NET · Azure',    location:'Abuja, Nigeria',    hourlyRate:'$65/hr',  availability:'Immediate', availColor:'#16a34a', skills:['Angular','TypeScript','.NET','Azure'],                rating:4.9, reviews:39, hiredCount:31, responseTime:'< 2hrs', bio:'Enterprise apps, clean architecture, fast delivery.', category:'Engineering', featured:false },
    { id:6,  name:'Sofia Andersen',   initials:'SA', avatarColor:'#0ea5e9', headline:'Product Designer · Branding · Webflow · Motion',  location:'Copenhagen, Denmark',hourlyRate:'$90/hr',  availability:'2 Weeks',   availColor:'#2563eb', skills:['Figma','Webflow','Branding','Motion Design'],         rating:4.8, reviews:22, hiredCount:17, responseTime:'< 5hrs', bio:'Craft-first designer with a knack for brand storytelling.', category:'Design', featured:false },
    { id:7,  name:'Kwame Mensah',     initials:'KM', avatarColor:'#059669', headline:'Data Engineer · dbt · Snowflake · Airflow',       location:'Accra, Ghana',      hourlyRate:'$70/hr',  availability:'Immediate', availColor:'#16a34a', skills:['Python','dbt','Snowflake','Airflow'],                  rating:4.7, reviews:18, hiredCount:14, responseTime:'< 4hrs', bio:'Data pipelines that actually run reliably.', category:'Data & AI', featured:false },
    { id:8,  name:'Lena Fischer',     initials:'LF', avatarColor:'#dc2626', headline:'Technical Writer · API Docs · Developer Portals', location:'Berlin, Germany',   hourlyRate:'$55/hr',  availability:'1 Month',   availColor:'#d97706', skills:['Technical Writing','API Docs','Markdown','Git'],       rating:4.6, reviews:15, hiredCount:12, responseTime:'< 6hrs', bio:'Docs that developers actually read and love.', category:'Marketing', featured:false },
    { id:9,  name:'Tunde Adeyemi',    initials:'TA', avatarColor:'#7d2ae8', headline:'Senior Frontend Dev · React · Next.js · Perf',   location:'Lagos, Nigeria',    hourlyRate:'$80/hr',  availability:'Immediate', availColor:'#16a34a', skills:['React','Next.js','Performance','TypeScript'],          rating:4.9, reviews:54, hiredCount:42, responseTime:'< 2hrs', bio:'Core Web Vitals obsessed. Lighthouse 100 or bust.', category:'Engineering', featured:false },
    { id:10, name:'Amara Diallo',     initials:'AD', avatarColor:'#0052cc', headline:'Product Manager · B2B SaaS · Roadmaps · Agile',  location:'Dakar, Senegal',    hourlyRate:'$85/hr',  availability:'2 Weeks',   availColor:'#2563eb', skills:['Product Strategy','Roadmapping','Agile','Figma'],      rating:4.8, reviews:21, hiredCount:16, responseTime:'< 3hrs', bio:'0→1 products and scaling B2B SaaS teams.', category:'Product', featured:false },
    { id:11, name:'Ravi Shankar',     initials:'RS', avatarColor:'#5865f2', headline:'Backend Engineer · Go · PostgreSQL · Microservices',location:'Pune, India',    hourlyRate:'$70/hr',  availability:'Immediate', availColor:'#16a34a', skills:['Go','PostgreSQL','Redis','gRPC'],                      rating:4.7, reviews:33, hiredCount:25, responseTime:'< 3hrs', bio:'High-throughput APIs, clean code, thorough tests.', category:'Engineering', featured:false },
    { id:12, name:'Ingrid Larsson',   initials:'IL', avatarColor:'#16a34a', headline:'Growth Marketer · SEO · Paid Ads · Analytics',   location:'Stockholm, Sweden', hourlyRate:'$60/hr',  availability:'1 Month',   availColor:'#d97706', skills:['SEO','Google Ads','Analytics','CRO'],                  rating:4.5, reviews:12, hiredCount:9,  responseTime:'< 8hrs', bio:'Growth experiments that compound over time.', category:'Marketing', featured:false },
  ];

  allFiltered: Freelancer[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.applyFilters(); }

  applyFilters(): void {
    let result = this.freelancers.filter(f => {
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        if (!f.name.toLowerCase().includes(q) &&
            !f.headline.toLowerCase().includes(q) &&
            !f.skills.some(s => s.toLowerCase().includes(q))) return false;
      }
      if (this.activeCategory !== 'All' && f.category !== this.activeCategory) return false;
      if (this.activeAvail    !== 'All' && f.availability !== this.activeAvail)  return false;
      const rate = parseInt(f.hourlyRate.replace(/\D/g,''));
      if (rate > this.maxRate) return false;
      return true;
    });

    switch (this.sortBy) {
      case 'Top Rated':   result = result.sort((a,b) => b.rating    - a.rating);    break;
      case 'Lowest Rate': result = result.sort((a,b) => parseInt(a.hourlyRate) - parseInt(b.hourlyRate)); break;
      case 'Most Hired':  result = result.sort((a,b) => b.hiredCount - a.hiredCount); break;
      default:            result = result.sort((a,b) => (b.featured?1:0)-(a.featured?1:0));
    }
    this.allFiltered = result;
    this.cdr.markForCheck();
  }

  setCategory(c: string): void { this.activeCategory = c; this.applyFilters(); }
  setAvail(a: string):     void { this.activeAvail    = a; this.applyFilters(); }
  setSort(s: string):      void { this.sortBy = s;         this.applyFilters(); }
  clearFilters(): void {
    this.searchQuery = ''; this.activeCategory = 'All';
    this.activeAvail = 'All'; this.maxRate = 200; this.sortBy = 'Featured';
    this.applyFilters();
  }

  stars(r: number): string[] {
    return Array.from({length:5},(_,i) => i < Math.floor(r) ? 'full' : i < r ? 'half' : 'empty');
  }

  trackById(_: number, f: Freelancer): number { return f.id; }
}