// src/app/pages/not-found/not-found.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent implements OnInit {

  countdown = 10;
  private timer!: ReturnType<typeof setInterval>;

  constructor(
    public  router: Router,
    private cdr:    ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Auto-redirect to home after 10 seconds
    this.timer = setInterval(() => {
      this.countdown--;
      this.cdr.markForCheck();
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.router.navigate(['/']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  goHome():     void { clearInterval(this.timer); this.router.navigate(['/']);      }
  browseJobs(): void { clearInterval(this.timer); this.router.navigate(['/jobs']);  }
  goBack():     void { clearInterval(this.timer); window.history.back();            }
}