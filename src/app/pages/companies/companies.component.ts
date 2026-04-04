// src/app/pages/companies/companies.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { CompaniesService, Company } from 'src/app/services/companies.service'; 

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesComponent implements OnInit {

  searchQuery     = '';
  activeIndustry  = 'All';
  activeSize      = 'All';
  sortBy          = 'Featured';
  remoteOnly      = false;
  sidebarOpen     = false;

  allCompanies:      Company[] = [];
  filteredCompanies: Company[] = [];

  readonly industries  = this.svc.industries;
  readonly sizes       = this.svc.sizes;
  readonly sortOptions = ['Featured', 'Most Jobs', 'Top Rated', 'A–Z'];

  constructor(
    private svc:    CompaniesService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.allCompanies      = this.svc.getAll();
    this.filteredCompanies = this.sort([...this.allCompanies]);
  }

  applyFilters(): void {
    let results = this.svc.filter(this.allCompanies, {
      query:    this.searchQuery,
      industry: this.activeIndustry,
      size:     this.activeSize,
      remote:   this.remoteOnly ? true : undefined,
    });
    this.filteredCompanies = this.sort(results);
    this.cdr.markForCheck();
  }

  private sort(list: Company[]): Company[] {
    switch (this.sortBy) {
      case 'Most Jobs':  return [...list].sort((a, b) => b.openRoles - a.openRoles);
      case 'Top Rated':  return [...list].sort((a, b) => b.rating    - a.rating);
      case 'A–Z':        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:           return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }

  setIndustry(i: string): void { this.activeIndustry = i; this.applyFilters(); }
  setSize(s: string):     void { this.activeSize     = s; this.applyFilters(); }
  setSort(s: string):     void { this.sortBy = s;         this.applyFilters(); }

  clearFilters(): void {
    this.searchQuery = ''; this.activeIndustry = 'All';
    this.activeSize  = 'All'; this.remoteOnly  = false;
    this.sortBy      = 'Featured';
    this.applyFilters();
  }

  viewCompany(id: number): void { this.router.navigate(['/companies', id]); }

  stars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty'
    );
  }

  trackById(_: number, c: Company): number { return c.id; }
}