// src/app/pages/post-job/post-job.component.ts
import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators
} from '@angular/forms';

@Component({
  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostJobComponent {

  form: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  submitted    = false;

  readonly steps = [
    { n: 1, label: 'Job Details'  },
    { n: 2, label: 'Requirements' },
    { n: 3, label: 'Preview'      },
  ];

  readonly jobTypes   = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  readonly categories = ['Engineering', 'Design', 'Product', 'Data & AI', 'DevOps', 'Marketing', 'Sales', 'Operations', 'Customer Success', 'Legal'];
  readonly remoteOptions = ['Remote (Global)', 'Remote (US only)', 'Remote (EU only)', 'Remote (US/EU)', 'Hybrid', 'On-site'];

  get f() { return this.form.controls; }

  constructor(
    private fb:     FormBuilder,
    private router: Router,
    private cdr:    ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      // Step 1
      jobTitle:    ['', [Validators.required, Validators.minLength(5)]],
      company:     ['', Validators.required],
      category:    ['Engineering', Validators.required],
      jobType:     ['Full-time', Validators.required],
      location:    ['Remote (Global)', Validators.required],
      salaryMin:   ['', Validators.required],
      salaryMax:   ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(100)]],
      // Step 2
      requirements: ['', Validators.required],
      niceToHave:   [''],
      benefits:     [''],
    });
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const s1 = ['jobTitle','company','category','jobType','location','salaryMin','salaryMax','description'];
      s1.forEach(f => this.form.get(f)!.markAsTouched());
      const invalid = s1.some(f => this.form.get(f)!.invalid);
      if (invalid) { this.cdr.markForCheck(); return; }
    }
    this.currentStep++;
    this.cdr.markForCheck();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(): void {
    this.currentStep--;
    this.cdr.markForCheck();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.cdr.markForCheck(); return; }
    this.isSubmitting = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitted    = true;
      this.cdr.markForCheck();
    }, 1800);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field)!;
    return c.touched && c.invalid;
  }
}