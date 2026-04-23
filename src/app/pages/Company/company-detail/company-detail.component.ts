// src/app/pages/company-detail/company-detail.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CompaniesService, Company } from 'src/app/services/companies.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailComponent implements OnInit, OnDestroy {

  company:  Company | null = null;
  activeTab = 'overview';
  following = false;

  readonly tabs = [
    { id: 'overview', label: 'Overview'  },
    { id: 'jobs',     label: 'Open Roles' },
    { id: 'culture',  label: 'Culture'    },
    { id: 'benefits', label: 'Benefits'   },
  ];

  private subs = new Subscription();

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private svc:    CompaniesService,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const id      = Number(params.get('id'));
        this.company  = this.svc.getById(id) || null;
        this.activeTab = 'overview';
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  setTab(id: string): void { this.activeTab = id; this.cdr.markForCheck(); }
  toggleFollow():    void { this.following = !this.following; this.cdr.markForCheck(); }
  goBack():          void { this.router.navigate(['/companies']); }
  viewJob(id: number): void { this.router.navigate(['/jobs', id]); }

  stars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty'
    );
  }
}