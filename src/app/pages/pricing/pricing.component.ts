// src/app/pages/pricing/pricing.component.ts
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {

  annual = true;

  readonly plans = [
    {
      name: 'Free',
      icon: '🌱',
      price: { monthly: 0, annual: 0 },
      description: 'Everything you need to get started finding remote work.',
      cta: 'Get Started Free',
      ctaRoute: '/auth/register',
      highlight: false,
      badge: null,
      features: [
        { text: 'Browse all remote jobs',         included: true  },
        { text: 'Apply to 5 jobs/month',          included: true  },
        { text: 'Basic profile page',             included: true  },
        { text: 'Job match score',                included: true  },
        { text: 'Email notifications',            included: true  },
        { text: 'Quick Apply',                    included: false },
        { text: 'Priority in search results',     included: false },
        { text: 'Direct recruiter messages',      included: false },
        { text: 'Salary insights',                included: false },
        { text: 'Advanced analytics',             included: false },
      ],
    },
    {
      name: 'Pro',
      icon: '⚡',
      price: { monthly: 19, annual: 12 },
      description: 'For serious remote job seekers who want an edge.',
      cta: 'Start 14-Day Free Trial',
      ctaRoute: '/auth/register',
      highlight: true,
      badge: 'Most Popular',
      features: [
        { text: 'Browse all remote jobs',         included: true  },
        { text: 'Unlimited applications',         included: true  },
        { text: 'Enhanced profile + portfolio',   included: true  },
        { text: 'AI job match score',             included: true  },
        { text: 'Real-time notifications',        included: true  },
        { text: 'Quick Apply (1-click)',          included: true  },
        { text: 'Priority in search results',     included: true  },
        { text: 'Direct recruiter messages',      included: true  },
        { text: 'Full salary insights',           included: true  },
        { text: 'Application analytics',          included: false },
      ],
    },
    {
      name: 'Elite',
      icon: '👑',
      price: { monthly: 49, annual: 32 },
      description: 'For top freelancers who want to dominate the remote market.',
      cta: 'Start 14-Day Free Trial',
      ctaRoute: '/auth/register',
      highlight: false,
      badge: 'Best Value',
      features: [
        { text: 'Everything in Pro',              included: true  },
        { text: 'Unlimited applications',         included: true  },
        { text: 'Featured profile badge',         included: true  },
        { text: 'Top of search results',          included: true  },
        { text: '1-on-1 career coaching call',    included: true  },
        { text: 'Resume & profile review',        included: true  },
        { text: 'Interview prep resources',       included: true  },
        { text: 'Advanced analytics dashboard',   included: true  },
        { text: 'Dedicated account manager',      included: true  },
        { text: 'Custom profile URL',             included: true  },
      ],
    },
  ];

  readonly faqs = [
    { q: 'Can I cancel anytime?',                         a: 'Yes. Cancel anytime from your account settings. No cancellation fees, no questions asked. Your access continues until the end of your billing period.' },
    { q: 'Is the 14-day trial really free?',              a: 'Completely free. No credit card required for the trial. You only pay if you decide to continue after the 14 days.' },
    { q: "What happens when my trial ends?",              a: "You're automatically moved to the Free plan. You won't be charged unless you actively upgrade to a paid plan." },
    { q: 'Do you offer refunds?',                         a: "If you're not satisfied within 30 days of your first payment, we'll refund you in full. No questions asked." },
    { q: 'Can I switch plans later?',                     a: 'Yes, upgrade or downgrade at any time. Upgrades are prorated to the day. Downgrades take effect at the next billing cycle.' },
    { q: 'Is there a plan for employers / companies?',    a: 'Yes — we have separate employer plans for posting jobs and browsing talent. Click "Post a Job" in the header to see employer pricing.' },
  ];

  openFaqs = new Set<number>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  toggleAnnual(): void { this.annual = !this.annual; this.cdr.markForCheck(); }
  toggleFaq(i: number): void {
    this.openFaqs.has(i) ? this.openFaqs.delete(i) : this.openFaqs.add(i);
    this.cdr.markForCheck();
  }

  price(plan: typeof this.plans[0]): string {
    const p = this.annual ? plan.price.annual : plan.price.monthly;
    return p === 0 ? 'Free' : '$' + p;
  }

  navigate(route: string): void { this.router.navigate([route]); }
}