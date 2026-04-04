// src/app/pages/resources/resources.component.ts
import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';

export interface Resource {
  id:       number;
  title:    string;
  excerpt:  string;
  category: string;
  tag:      string;
  readTime: string;
  icon:     string;
  color:    string;
  featured: boolean;
}

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent implements OnInit {

  activeCategory = 'All';
  searchQuery    = '';

  readonly categories = [
    'All', 'Career Tips', 'Salary', 'Remote Work', 'Freelancing', 'Interviews', 'Productivity'
  ];

  readonly resources: Resource[] = [
    { id:1,  title:'How to Negotiate Your Remote Salary Like a Pro',       excerpt:'Learn proven tactics to negotiate 20-40% above initial offers. Includes scripts, timing strategies, and real examples from remote workers.',        category:'Salary',       tag:'Guide',      readTime:'8 min', icon:'💰', color:'#16a34a', featured:true  },
    { id:2,  title:'The Ultimate Remote Job Interview Checklist',           excerpt:'From tech setup to background preparation — everything you need to ace a video interview and stand out from hundreds of applicants.',               category:'Interviews',   tag:'Checklist',  readTime:'5 min', icon:'🎯', color:'#6366f1', featured:true  },
    { id:3,  title:'Building a Remote-First Portfolio That Gets Callbacks', excerpt:'What hiring managers actually look for in 2025. How to structure your portfolio, what projects to include, and how to present them.',              category:'Career Tips',  tag:'Guide',      readTime:'10 min',icon:'🎨', color:'#ec4899', featured:true  },
    { id:4,  title:'Freelance Rate Calculator: What Should You Charge?',   excerpt:'Use our interactive calculator to find your optimal hourly and project rate based on your skills, location, and target income.',                  category:'Freelancing',  tag:'Tool',       readTime:'3 min', icon:'⚡', color:'#f59e0b', featured:false },
    { id:5,  title:'The Remote Work Productivity Stack (2025)',             excerpt:'The exact tools, routines, and systems top remote workers use to stay focused and deliver results — without burning out.',                          category:'Productivity', tag:'Guide',      readTime:'7 min', icon:'🚀', color:'#0ea5e9', featured:false },
    { id:6,  title:'How to Write a Cover Letter That Gets Opened',         excerpt:"Most cover letters are ignored in the first 3 seconds. Here's a proven structure that makes recruiters read every word — with templates included.", category:'Career Tips',  tag:'Template',   readTime:'6 min', icon:'✍️', color:'#8b5cf6', featured:false },
    { id:7,  title:'Remote Work Tax Guide for Freelancers',                excerpt:'Everything you need to know about taxes, deductions, and accounting when you work remotely across multiple countries or states.',                   category:'Freelancing',  tag:'Legal',      readTime:'12 min',icon:'📋', color:'#71717a', featured:false },
    { id:8,  title:'Top 10 Red Flags in Remote Job Postings',              excerpt:'Protect yourself from scams and bad employers. These warning signs appear in every shady remote job posting — learn to spot them instantly.',      category:'Remote Work',  tag:'Safety',     readTime:'4 min', icon:'🛡️', color:'#dc2626', featured:false },
    { id:9,  title:'How to Build Your Personal Brand as a Developer',      excerpt:'GitHub profile, LinkedIn presence, open source contributions — here is exactly how senior developers get inbound job offers.',                   category:'Career Tips',  tag:'Branding',   readTime:'9 min', icon:'🌟', color:'#f59e0b', featured:false },
    { id:10, title:'The Async Communication Playbook',                     excerpt:'How top remote teams communicate without meetings. Loom, Notion, Slack norms, and the art of writing messages that get fast responses.',           category:'Remote Work',  tag:'Guide',      readTime:'6 min', icon:'💬', color:'#10b981', featured:false },
    { id:11, title:'STAR Method Interview Answers (With Examples)',        excerpt:'Behaviour interview questions are predictable. Use this framework with 20 sample answers for the most common remote job interviews.',              category:'Interviews',   tag:'Framework',  readTime:'11 min',icon:'⭐', color:'#6366f1', featured:false },
    { id:12, title:'Remote Freelancing: Client Contracts 101',             excerpt:'Never work without a contract again. Includes a free contract template covering scope, payment terms, IP ownership, and kill fees.',              category:'Freelancing',  tag:'Legal',      readTime:'8 min', icon:'📝', color:'#0052cc', featured:false },
  ];

  get filtered(): Resource[] {
    return this.resources.filter(r => {
      const matchCat = this.activeCategory === 'All' || r.category === this.activeCategory;
      const matchQ   = !this.searchQuery || r.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }

  get featured(): Resource[] { return this.resources.filter(r => r.featured); }

  readonly guides = [
    { icon:'📄', title:'Free Resume Template',           desc:'ATS-optimised Word + Google Docs template used by 40,000+ remote workers.',      cta:'Download Free' },
    { icon:'📊', title:'Salary Benchmark Report 2025',   desc:'Average remote salaries for 80+ roles across engineering, design, and data.',    cta:'View Report'   },
    { icon:'📋', title:'Freelance Contract Template',    desc:'Lawyer-reviewed contract template covering all the bases for freelance work.',    cta:'Get Template'  },
    { icon:'🎙️', title:'Interview Prep Workbook',        desc:'50 common remote interview questions with guidance on how to answer each one.',  cta:'Download PDF'  },
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {}

  setCategory(c: string): void { this.activeCategory = c; this.cdr.markForCheck(); }
  onSearch(): void { this.cdr.markForCheck(); }
  viewSalaryGuide(): void { this.router.navigate(['/salary-guide']); }
  trackById(_: number, r: Resource): number { return r.id; }
}