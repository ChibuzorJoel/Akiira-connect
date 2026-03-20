import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Category {
  icon: string;
  name: string;
  count: string;
  hot?: boolean;
}

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  salary: string;
  type: string;
  location: string;
  tags: string[];
  posted: string;
  applicants: number;
  featured?: boolean;
  saved?: boolean;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  avatarColor: string;
  text: string;
  hired: string;
  salary: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {

  searchQuery = '';
  searchLocation = 'Remote';
  activeJobType = 'All';
  currentTestimonial = 0;
  private testimonialTimer!: ReturnType<typeof setInterval>;

  jobTypes = ['All', 'Full-time', 'Contract', 'Part-time', 'Freelance'];

  stats: Stat[] = [
    { value: '48K+',  label: 'Remote Jobs',        icon: '💼' },
    { value: '12K+',  label: 'Companies Hiring',   icon: '🏢' },
    { value: '320K+', label: 'Freelancers Hired',  icon: '🌍' },
    { value: '98%',   label: 'Satisfaction Rate',  icon: '⭐' },
  ];

  categories: Category[] = [
    { icon: '💻', name: 'Software Dev',     count: '14,200', hot: true  },
    { icon: '🎨', name: 'Design & UX',      count: '6,800'              },
    { icon: '📊', name: 'Data & Analytics', count: '4,500', hot: true  },
    { icon: '✍️', name: 'Writing',          count: '3,200'              },
    { icon: '📱', name: 'Mobile Dev',       count: '2,900'              },
    { icon: '☁️', name: 'Cloud & DevOps',   count: '2,400'              },
    { icon: '🔒', name: 'Cybersecurity',    count: '1,800'              },
    { icon: '🤖', name: 'AI / ML',          count: '3,600', hot: true  },
    { icon: '📣', name: 'Marketing',        count: '2,100'              },
    { icon: '💰', name: 'Finance',          count: '1,600'              },
  ];

  featuredJobs: Job[] = [
    {
      id: 1, title: 'Senior React Developer', company: 'Stripe',
      logo: 'S', logoColor: '#6366f1',
      salary: '$120K – $160K', type: 'Full-time', location: 'Remote (Global)',
      tags: ['React', 'TypeScript', 'GraphQL'],
      posted: '2h ago', applicants: 43, featured: true, saved: false,
    },
    {
      id: 2, title: 'Product Designer (UI/UX)', company: 'Notion',
      logo: 'N', logoColor: '#0ea5e9',
      salary: '$80 – $120/hr', type: 'Contract', location: 'Remote (US)',
      tags: ['Figma', 'Prototyping', 'User Research'],
      posted: '5h ago', applicants: 28, saved: false,
    },
    {
      id: 3, title: 'Full-Stack Engineer', company: 'Vercel',
      logo: 'V', logoColor: '#10b981',
      salary: '$110K – $150K', type: 'Full-time', location: 'Remote (Global)',
      tags: ['Angular', 'Node.js', 'AWS'],
      posted: '1d ago', applicants: 67, featured: true, saved: false,
    },
    {
      id: 4, title: 'Senior Data Scientist', company: 'Airbnb',
      logo: 'A', logoColor: '#f59e0b',
      salary: '$130K – $180K', type: 'Full-time', location: 'Remote (Global)',
      tags: ['Python', 'SQL', 'Machine Learning'],
      posted: '1d ago', applicants: 102, saved: false,
    },
    {
      id: 5, title: 'DevOps / Cloud Engineer', company: 'Figma',
      logo: 'F', logoColor: '#ec4899',
      salary: '$125K – $165K', type: 'Full-time', location: 'Remote (US/EU)',
      tags: ['Kubernetes', 'AWS', 'Terraform'],
      posted: '2d ago', applicants: 51, saved: false,
    },
    {
      id: 6, title: 'AI/ML Engineer', company: 'OpenAI',
      logo: 'O', logoColor: '#8b5cf6',
      salary: '$160K – $220K', type: 'Full-time', location: 'Remote (Global)',
      tags: ['Python', 'PyTorch', 'LLMs'],
      posted: '3h ago', applicants: 189, featured: true, saved: false,
    },
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Tunde Adeyemi', role: 'Senior Frontend Engineer', company: 'Stripe',
      avatar: 'TA', avatarColor: '#6366f1',
      text: 'RemoteWork completely changed my career. Within 3 weeks I had 4 interviews and landed a $140K remote role at Stripe. The quality of companies on here is unreal.',
      hired: '3 weeks', salary: '$140K',
    },
    {
      name: 'Priya Sharma', role: 'UX Designer', company: 'Notion',
      avatar: 'PS', avatarColor: '#0ea5e9',
      text: 'I was skeptical at first but the filtering is incredible. Found a 100% remote contract with Notion that pays better than my old in-office job. Game changer.',
      hired: '10 days', salary: '$95/hr',
    },
    {
      name: 'Marcus Chen', role: 'ML Engineer', company: 'Scale AI',
      avatar: 'MC', avatarColor: '#10b981',
      text: 'Applied to 6 jobs, got 3 responses, 2 offers. The resume tips and salary guide helped me negotiate $30K more than my initial ask. Absolutely worth it.',
      hired: '2 weeks', salary: '$185K',
    },
  ];

  ngOnInit(): void {
    this.testimonialTimer = setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.testimonialTimer);
  }

  setJobType(type: string): void {
    this.activeJobType = type;
  }

  toggleSave(job: Job, event: Event): void {
    event.stopPropagation();
    job.saved = !job.saved;
  }

  nextTestimonial(): void {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  setTestimonial(i: number): void {
    this.currentTestimonial = i;
  }

  search(): void {
    console.log('Search:', this.searchQuery, this.searchLocation);
    // router.navigate(['/jobs', { q: this.searchQuery }])
  }

  setSearch(term: string): void {
    this.searchQuery = term;
    this.search();
  }
}