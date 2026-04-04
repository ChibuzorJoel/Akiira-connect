// src/app/pages/salary-guide/salary-guide.component.ts
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

export interface SalaryRole {
  title:    string;
  category: string;
  min:      number;
  mid:      number;
  max:      number;
  yoy:      number;
  demand:   'High' | 'Very High' | 'Medium';
}

@Component({
  selector: 'app-salary-guide',
  templateUrl: './salary-guide.component.html',
  styleUrls:  ['./salary-guide.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalaryGuideComponent {

  activeCategory = 'All';
  searchQuery    = '';

  readonly categories = ['All','Engineering','Design','Data & AI','DevOps','Product','Marketing'];

  readonly roles: SalaryRole[] = [
    { title:'Senior React Developer',      category:'Engineering', min:110, mid:145, max:185, yoy:12, demand:'Very High' },
    { title:'Full-Stack Engineer',         category:'Engineering', min:95,  mid:130, max:165, yoy:10, demand:'Very High' },
    { title:'Angular Developer',           category:'Engineering', min:90,  mid:120, max:155, yoy:8,  demand:'High'      },
    { title:'Backend Engineer (Node.js)',  category:'Engineering', min:95,  mid:125, max:160, yoy:9,  demand:'Very High' },
    { title:'Frontend Architect',          category:'Engineering', min:130, mid:165, max:210, yoy:14, demand:'High'      },
    { title:'Mobile Engineer (RN)',        category:'Engineering', min:100, mid:135, max:170, yoy:11, demand:'High'      },
    { title:'Software Engineer (Go)',      category:'Engineering', min:120, mid:155, max:195, yoy:15, demand:'Very High' },
    { title:'UX/UI Designer',             category:'Design',      min:75,  mid:105, max:140, yoy:7,  demand:'High'      },
    { title:'Product Designer',           category:'Design',      min:80,  mid:115, max:150, yoy:8,  demand:'High'      },
    { title:'Design System Lead',         category:'Design',      min:110, mid:145, max:185, yoy:12, demand:'Medium'    },
    { title:'AI / ML Engineer',           category:'Data & AI',   min:140, mid:185, max:240, yoy:28, demand:'Very High' },
    { title:'Data Scientist',             category:'Data & AI',   min:115, mid:155, max:200, yoy:18, demand:'Very High' },
    { title:'Data Engineer',              category:'Data & AI',   min:110, mid:145, max:185, yoy:16, demand:'Very High' },
    { title:'ML Research Engineer',       category:'Data & AI',   min:160, mid:210, max:270, yoy:30, demand:'Very High' },
    { title:'DevOps / SRE',              category:'DevOps',       min:115, mid:150, max:195, yoy:13, demand:'Very High' },
    { title:'Cloud Architect',            category:'DevOps',      min:140, mid:180, max:230, yoy:14, demand:'High'      },
    { title:'Security Engineer',          category:'DevOps',      min:120, mid:160, max:210, yoy:17, demand:'Very High' },
    { title:'Product Manager',            category:'Product',     min:105, mid:145, max:190, yoy:9,  demand:'High'      },
    { title:'Technical Product Manager',  category:'Product',     min:120, mid:160, max:205, yoy:11, demand:'High'      },
    { title:'Growth Marketer',            category:'Marketing',   min:70,  mid:100, max:135, yoy:6,  demand:'Medium'    },
    { title:'Content Strategist',         category:'Marketing',   min:60,  mid:85,  max:115, yoy:4,  demand:'Medium'    },
    { title:'Technical Writer',           category:'Marketing',   min:65,  mid:90,  max:120, yoy:5,  demand:'Medium'    },
  ];

  get filtered(): SalaryRole[] {
    return this.roles.filter(r => {
      const matchCat = this.activeCategory === 'All' || r.category === this.activeCategory;
      const matchQ   = !this.searchQuery   || r.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }

  constructor(private cdr: ChangeDetectorRef) {}

  setCategory(c: string): void { this.activeCategory = c; this.cdr.markForCheck(); }
  onSearch():              void { this.cdr.markForCheck(); }

  demandColor(d: SalaryRole['demand']): string {
    return { 'Very High': '#16a34a', 'High': '#2563eb', 'Medium': '#f59e0b' }[d];
  }

  barWidth(val: number, role: SalaryRole): string {
    const range = role.max - role.min;
    return ((val - role.min) / range * 100) + '%';
  }

  formatK(n: number): string { return '$' + n + 'K'; }
}