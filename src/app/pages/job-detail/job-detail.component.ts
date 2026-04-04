// src/app/pages/job-detail/job-detail.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobsService, Job } from 'src/app/services/jobs.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetailComponent implements OnInit, OnDestroy {

  job:          Job | null = null;
  similarJobs:  Job[]      = [];
  showApplyModal  = false;
  applyStep       = 1;   // 1 = review, 2 = cover letter, 3 = success
  coverLetter     = '';
  isApplying      = false;
  hasApplied      = false;

  private subs = new Subscription();

  get isSaved(): boolean {
    return this.job ? this.jobsSvc.isSaved(this.job.id) : false;
  }

  constructor(
    private route:    ActivatedRoute,
    private router:   Router,
    private jobsSvc:  JobsService,
    private auth:     AuthService,
    private cdr:      ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        this.job        = this.jobsSvc.getJobById(id) || null;
        this.similarJobs = this.jobsSvc.getSimilarJobs(id);
        this.hasApplied = false;
        this.showApplyModal = false;
        this.applyStep  = 1;
        this.coverLetter = '';
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.jobsSvc.savedIds$.subscribe(() => this.cdr.markForCheck())
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  toggleSave(): void {
    if (this.job) { this.jobsSvc.toggleSave(this.job.id); }
  }

  openApply(): void {
    this.applyStep      = 1;
    this.showApplyModal = true;
    this.cdr.markForCheck();
  }

  closeApply(): void {
    this.showApplyModal = false;
    this.cdr.markForCheck();
  }

  nextStep(): void {
    this.applyStep++;
    this.cdr.markForCheck();
  }

  submitApplication(): void {
    this.isApplying = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isApplying  = false;
      this.applyStep   = 3;
      this.hasApplied  = true;
      this.cdr.markForCheck();
    }, 1600);
  }

  viewJob(id: number): void {
    this.router.navigate(['/jobs', id]);
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  get userName(): string {
    return this.auth.currentUser?.fullName || 'there';
  }

  get userInitials(): string {
    const name = this.auth.currentUser?.fullName || '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  get userEmail(): string {
    return this.auth.currentUser?.email || '';
  }

  trackById(_: number, job: Job): number { return job.id; }
}