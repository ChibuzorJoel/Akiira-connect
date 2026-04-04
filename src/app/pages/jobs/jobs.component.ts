// src/app/pages/jobs/jobs.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobsService, Job } from 'src/app/services/jobs.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsComponent implements OnInit, OnDestroy {

  // Search & filter state
  searchQuery  = '';
  activeType   = 'All';
  activeCategory = 'All';
  salaryMin    = 0;
  sortBy       = 'Relevant';
  sidebarOpen  = false;

  allJobs:      Job[] = [];
  filteredJobs: Job[] = [];

  readonly categories = this.jobsSvc.categories;
  readonly jobTypes   = this.jobsSvc.jobTypes;
  readonly sortOptions = ['Relevant', 'Newest', 'Salary'];

  private subs = new Subscription();

  constructor(
    private jobsSvc: JobsService,
    private router:  Router,
    private cdr:     ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.allJobs      = this.jobsSvc.getAllJobs();
    this.filteredJobs = [...this.allJobs];

    this.subs.add(
      this.jobsSvc.savedIds$.subscribe(() => this.cdr.markForCheck())
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  applyFilters(): void {
    this.filteredJobs = this.jobsSvc.filterJobs(this.allJobs, {
      query:     this.searchQuery,
      type:      this.activeType,
      category:  this.activeCategory,
      salaryMin: this.salaryMin * 1000,
    });

    if (this.sortBy === 'Salary') {
      this.filteredJobs = [...this.filteredJobs].sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (this.sortBy === 'Newest') {
      // Keep original order (already newest first)
    } else {
      this.filteredJobs = [...this.filteredJobs].sort((a, b) => b.matchScore - a.matchScore);
    }

    this.cdr.markForCheck();
  }

  setType(t: string):     void { this.activeType     = t; this.applyFilters(); }
  setCategory(c: string): void { this.activeCategory = c; this.applyFilters(); }
  setSort(s: string):     void { this.sortBy = s;         this.applyFilters(); }
  clearFilters():         void {
    this.activeType = 'All'; this.activeCategory = 'All';
    this.salaryMin  = 0; this.sortBy = 'Relevant';
    this.applyFilters();
  }

  onSearch(): void { this.applyFilters(); }

  toggleSave(event: Event, jobId: number): void {
    event.stopPropagation();
    this.jobsSvc.toggleSave(jobId);
    this.cdr.markForCheck();
  }

  isSaved(jobId: number): boolean { return this.jobsSvc.isSaved(jobId); }

  viewJob(jobId: number): void { this.router.navigate(['/jobs', jobId]); }

  trackById(_: number, job: Job): number { return job.id; }
}