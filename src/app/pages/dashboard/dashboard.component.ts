// src/app/pages/dashboard/dashboard.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

export type DashTab = 'overview' | 'applications' | 'saved' | 'messages';

export interface Application {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  salary: string;
  type: string;
  appliedDate: string;
  status: 'applied' | 'review' | 'interview' | 'offer' | 'rejected';
}

export interface SavedJob {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  salary: string;
  location: string;
  tags: string[];
  savedDate: string;
  matchScore: number;
}

export interface Message {
  id: number;
  from: string;
  company: string;
  logo: string;
  logoColor: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  thread: { sender: 'me' | 'them'; text: string; time: string }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {

  activeTab: DashTab = 'overview';
  activeMessageId    = 1;
  messageInput       = '';
  profileStrength    = 74;

  private subs = new Subscription();

  readonly stats = [
    { icon: '📨', label: 'Applied',       value: 12,  change: '+3 this week',  up: true  },
    { icon: '📞', label: 'Interviews',    value: 3,   change: '+1 this week',  up: true  },
    { icon: '👁️', label: 'Profile Views', value: 284, change: '+42 this week', up: true  },
    { icon: '🔖', label: 'Saved Jobs',    value: 8,   change: '2 expire soon', up: false },
  ];

  readonly applications: Application[] = [
    { id: 1, title: 'Senior React Developer',    company: 'Stripe',    logo: 'S', logoColor: '#6366f1', salary: '$120K–$160K', type: 'Full-time', appliedDate: 'Mar 8, 2025',  status: 'interview' },
    { id: 2, title: 'Full-Stack Engineer',        company: 'Vercel',    logo: 'V', logoColor: '#10b981', salary: '$110K–$150K', type: 'Full-time', appliedDate: 'Mar 5, 2025',  status: 'review'    },
    { id: 3, title: 'Frontend Developer',         company: 'GitHub',    logo: 'G', logoColor: '#24292f', salary: '$95K–$130K',  type: 'Full-time', appliedDate: 'Mar 1, 2025',  status: 'interview' },
    { id: 4, title: 'Angular Developer',          company: 'Atlassian', logo: 'A', logoColor: '#0052cc', salary: '$90K–$125K',  type: 'Contract',  appliedDate: 'Feb 28, 2025', status: 'applied'   },
    { id: 5, title: 'UI/UX Engineer',             company: 'Linear',    logo: 'L', logoColor: '#5b5bd6', salary: '$80K–$110K',  type: 'Full-time', appliedDate: 'Feb 22, 2025', status: 'applied'   },
    { id: 6, title: 'React Native Developer',     company: 'Discord',   logo: 'D', logoColor: '#5865f2', salary: '$100K–$140K', type: 'Full-time', appliedDate: 'Feb 18, 2025', status: 'rejected'  },
    { id: 7, title: 'Backend Engineer (Node.js)', company: 'Shopify',   logo: 'S', logoColor: '#059669', salary: '$115K–$155K', type: 'Full-time', appliedDate: 'Feb 10, 2025', status: 'offer'     },
  ];

  savedJobs: SavedJob[] = [
    { id: 1, title: 'Senior React Developer', company: 'Stripe',  logo: 'S', logoColor: '#6366f1', salary: '$120K–$160K', location: 'Remote (Global)', tags: ['React','TypeScript','GraphQL'], savedDate: '2 days ago',  matchScore: 92 },
    { id: 2, title: 'Product Designer',       company: 'Notion',  logo: 'N', logoColor: '#0ea5e9', salary: '$80–$120/hr', location: 'Remote (US)',     tags: ['Figma','Prototyping','UX'],    savedDate: '3 days ago',  matchScore: 88 },
    { id: 3, title: 'Full-Stack Engineer',    company: 'Vercel',  logo: 'V', logoColor: '#10b981', salary: '$110K–$150K', location: 'Remote (Global)', tags: ['Angular','Node.js','AWS'],     savedDate: '5 days ago',  matchScore: 95 },
    { id: 4, title: 'AI / ML Engineer',       company: 'OpenAI',  logo: 'O', logoColor: '#8b5cf6', salary: '$160K–$220K', location: 'Remote (Global)', tags: ['Python','PyTorch','LLMs'],     savedDate: '1 week ago',  matchScore: 79 },
    { id: 5, title: 'DevOps Engineer',        company: 'Figma',   logo: 'F', logoColor: '#ec4899', salary: '$125K–$165K', location: 'Remote (US/EU)', tags: ['Kubernetes','AWS','Terraform'], savedDate: '1 week ago',  matchScore: 82 },
    { id: 6, title: 'Data Scientist',         company: 'Airbnb',  logo: 'A', logoColor: '#f59e0b', salary: '$130K–$180K', location: 'Remote (Global)', tags: ['Python','SQL','ML'],           savedDate: '2 weeks ago', matchScore: 85 },
  ];

  readonly messages: Message[] = [
    {
      id: 1, from: 'Sarah Chen', company: 'Stripe', logo: 'S', logoColor: '#6366f1',
      preview: "Let's schedule an interview for Wednesday",
      time: '2h ago', unread: 2, online: true,
      thread: [
        { sender: 'them', text: 'Hi! Thanks for applying to the Senior React Developer role. Your profile looks great!', time: '10:30 AM' },
        { sender: 'them', text: "We'd love to schedule a 30-min call this week. Are you available Wednesday or Thursday?", time: '10:31 AM' },
        { sender: 'me',   text: "Hi Sarah! Absolutely, I'm very interested. Wednesday at 2 PM PST works perfectly for me.", time: '11:15 AM' },
        { sender: 'them', text: "Perfect! I've sent a calendar invite to your email. Looking forward to chatting!", time: '11:20 AM' },
        { sender: 'them', text: "Let's schedule an interview for Wednesday at 2 PM PST. Does that still work?", time: '2h ago' },
      ],
    },
    {
      id: 2, from: 'Mark Lee', company: 'Vercel', logo: 'V', logoColor: '#10b981',
      preview: "Thanks for applying! We'll be in touch…",
      time: '1d ago', unread: 0, online: false,
      thread: [
        { sender: 'them', text: "Hi! Thanks for applying to the Full-Stack Engineer role at Vercel.", time: 'Yesterday' },
        { sender: 'them', text: "We'll be in touch soon. Feel free to check out our engineering blog!", time: '1d ago' },
      ],
    },
    {
      id: 3, from: 'Amara Osei', company: 'GitHub', logo: 'G', logoColor: '#24292f',
      preview: 'We loved your portfolio — next steps?',
      time: '2d ago', unread: 1, online: true,
      thread: [
        { sender: 'them', text: "Hey! Our team reviewed your application and loved your GitHub portfolio!", time: '2d ago' },
        { sender: 'them', text: "Would you be up for a quick technical screen next week?", time: '2d ago' },
      ],
    },
  ];

  readonly profileTips = [
    { done: true,  text: 'Add profile photo'       },
    { done: true,  text: 'Set availability status' },
    { done: true,  text: 'Add 5+ skills'           },
    { done: true,  text: 'Link GitHub / portfolio' },
    { done: false, text: 'Add work experience'     },
    { done: false, text: 'Write a bio'             },
  ];

  readonly activity = [
    { icon: '🎯', text: 'Interview scheduled with Stripe for Wed 15 Mar', time: '2h ago',  color: '#16a34a' },
    { icon: '👁️', text: 'Vercel viewed your profile',                      time: '5h ago',  color: '#2563eb' },
    { icon: '✨', text: 'Shopify sent you an offer!',                       time: '1d ago',  color: '#f59e0b' },
    { icon: '📩', text: 'New message from Amara at GitHub',                 time: '2d ago',  color: '#8b5cf6' },
    { icon: '✓',  text: 'Applied to Angular Developer at Atlassian',       time: '3d ago',  color: '#71717a' },
  ];

  // ✅ FIX: compute firstName as a safe string property — no optional chaining in template
  get firstName(): string {
    const name = this.auth.currentUser?.fullName || 'Alex';
    return name.split(' ')[0];
  }

  get userInitial(): string {
    return (this.auth.currentUser?.fullName || 'A').charAt(0).toUpperCase();
  }

  get activeMessage(): Message | undefined {
    return this.messages.find(m => m.id === this.activeMessageId);
  }

  get totalUnread(): number {
    return this.messages.reduce((sum, m) => sum + m.unread, 0);
  }

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  setTab(tab: DashTab): void     { this.activeTab = tab; this.cdr.markForCheck(); }

  setActiveMessage(id: number): void {
    this.activeMessageId = id;
    const msg = this.messages.find(m => m.id === id);
    if (msg) { msg.unread = 0; }
    this.cdr.markForCheck();
  }

  sendMessage(): void {
    const text = this.messageInput.trim();
    if (!text || !this.activeMessage) { return; }
    this.activeMessage.thread.push({ sender: 'me', text, time: 'Just now' });
    this.messageInput = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      const el = document.querySelector('.msg-thread-body');
      if (el) { el.scrollTop = el.scrollHeight; }
    }, 50);
  }

  removeSaved(id: number): void {
    this.savedJobs = this.savedJobs.filter(j => j.id !== id);
    this.cdr.markForCheck();
  }

  statusLabel(status: Application['status']): string {
    const map: Record<Application['status'], string> = {
      applied:   '📩 Applied',
      review:    '👀 In Review',
      interview: '🎯 Interview',
      offer:     '🎉 Offer',
      rejected:  '✕ Closed',
    };
    return map[status];
  }

  statusClass(status: Application['status']): string {
    const map: Record<Application['status'], string> = {
      applied:   'status-applied',
      review:    'status-review',
      interview: 'status-interview',
      offer:     'status-offer',
      rejected:  'status-rejected',
    };
    return map[status];
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
}