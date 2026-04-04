// src/app/shared/services/jobs.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Job {
  id:          number;
  title:       string;
  company:     string;
  logo:        string;
  logoColor:   string;
  salary:      string;
  salaryMin:   number;
  salaryMax:   number;
  type:        'Full-time' | 'Contract' | 'Part-time' | 'Freelance';
  location:    string;
  remote:      boolean;
  tags:        string[];
  postedAt:    string;
  applicants:  number;
  featured:    boolean;
  matchScore:  number;
  description: string;
  responsibilities: string[];
  requirements:     string[];
  niceToHave:       string[];
  benefits:         string[];
  category:    string;
}

const ALL_JOBS: Job[] = [
  {
    id: 1, title: 'Senior React Developer', company: 'Stripe', logo: 'S', logoColor: '#6366f1',
    salary: '$120K – $160K', salaryMin: 120000, salaryMax: 160000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['React', 'TypeScript', 'GraphQL'], postedAt: '2h ago', applicants: 43,
    featured: true, matchScore: 92, category: 'Engineering',
    description: "We're looking for a Senior React Developer to join Stripe's frontend platform team. You'll build products used by millions of businesses worldwide to manage their payments and financial operations.",
    responsibilities: [
      'Build and maintain high-performance React applications with TypeScript',
      'Design and implement reusable UI component libraries',
      'Collaborate with designers to implement pixel-perfect interfaces',
      'Write comprehensive unit and integration tests',
      'Participate in code reviews and mentor junior developers',
      'Contribute to frontend architecture decisions',
    ],
    requirements: [
      '5+ years of professional experience with React',
      'Strong TypeScript skills and understanding of type systems',
      'Experience with state management (Redux, Zustand, or similar)',
      'Proficiency with REST APIs and GraphQL',
      'Solid understanding of web performance optimization',
      'Excellent async communication skills',
    ],
    niceToHave: [
      'Experience with Next.js or SSR frameworks',
      'Knowledge of WebAssembly or canvas rendering',
      'Open source contributions',
    ],
    benefits: ['Full health, dental & vision', 'Equity + 401k matching', '$3,000 home office stipend', 'Unlimited PTO', '$2,500 learning budget', 'Work from anywhere'],
  },
  {
    id: 2, title: 'Product Designer (UI/UX)', company: 'Notion', logo: 'N', logoColor: '#0ea5e9',
    salary: '$80 – $120/hr', salaryMin: 80, salaryMax: 120,
    type: 'Contract', location: 'Remote (US)', remote: true,
    tags: ['Figma', 'Prototyping', 'User Research'], postedAt: '5h ago', applicants: 28,
    featured: false, matchScore: 88, category: 'Design',
    description: 'Join the team that designs the all-in-one workspace used by 30M+ people. We need a talented UI/UX designer who can translate complex workflows into delightful, intuitive experiences.',
    responsibilities: ['Design user flows, wireframes, and high-fidelity prototypes in Figma', 'Conduct user research and usability testing', 'Define and maintain our design system', 'Work closely with product and engineering teams'],
    requirements: ['5+ years UX/UI design experience', 'Expert-level Figma proficiency', 'Strong portfolio of complex web applications', 'Experience with design systems'],
    niceToHave: ['Motion design skills', 'Front-end development knowledge'],
    benefits: ['Competitive hourly rate', 'Remote-first culture', 'Flexible hours', 'Access to Notion tooling'],
  },
  {
    id: 3, title: 'Full-Stack Engineer', company: 'Vercel', logo: 'V', logoColor: '#10b981',
    salary: '$110K – $150K', salaryMin: 110000, salaryMax: 150000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['Angular', 'Node.js', 'AWS'], postedAt: '1d ago', applicants: 67,
    featured: true, matchScore: 95, category: 'Engineering',
    description: "Vercel is the platform for frontend developers. We're looking for a Full-Stack Engineer who loves building tools that help developers ship faster.",
    responsibilities: ['Build full-stack features across the Vercel platform', 'Design and implement scalable APIs', 'Optimize performance across frontend and backend', 'Collaborate with a globally distributed team'],
    requirements: ['4+ years full-stack development experience', 'Proficiency in Node.js and a modern frontend framework', 'Experience with cloud platforms (AWS, GCP, or Azure)', 'Strong understanding of CI/CD pipelines'],
    niceToHave: ['Experience with Next.js', 'Knowledge of edge computing', 'Open source contributions'],
    benefits: ['Competitive salary', 'Equity package', 'Fully remote', 'Annual team retreat', 'Top-of-line equipment'],
  },
  {
    id: 4, title: 'Senior Data Scientist', company: 'Airbnb', logo: 'A', logoColor: '#f59e0b',
    salary: '$130K – $180K', salaryMin: 130000, salaryMax: 180000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['Python', 'SQL', 'Machine Learning'], postedAt: '1d ago', applicants: 102,
    featured: false, matchScore: 79, category: 'Data',
    description: "Help us understand how millions of people travel and host. You'll turn complex datasets into insights that drive product decisions at Airbnb.",
    responsibilities: ['Build and deploy ML models that power core product features', 'Conduct statistical analysis of A/B tests', 'Partner with engineering to productionize models', 'Present findings to leadership'],
    requirements: ['5+ years data science experience', 'Expert Python and SQL skills', 'Experience with ML frameworks (PyTorch, TensorFlow, scikit-learn)', 'Strong statistical background'],
    niceToHave: ['Experience with large-scale distributed systems', 'Causal inference expertise'],
    benefits: ['Generous equity', 'Travel credits', 'Remote-friendly', 'World-class team'],
  },
  {
    id: 5, title: 'DevOps / Cloud Engineer', company: 'Figma', logo: 'F', logoColor: '#ec4899',
    salary: '$125K – $165K', salaryMin: 125000, salaryMax: 165000,
    type: 'Full-time', location: 'Remote (US/EU)', remote: true,
    tags: ['Kubernetes', 'AWS', 'Terraform'], postedAt: '2d ago', applicants: 51,
    featured: false, matchScore: 82, category: 'DevOps',
    description: "Figma's infrastructure team keeps the creative platform running for millions of designers. We're looking for a DevOps engineer to help us scale reliably.",
    responsibilities: ['Manage and improve our Kubernetes infrastructure', 'Build and maintain CI/CD pipelines', 'Monitor system health and respond to incidents', 'Automate repetitive operational tasks'],
    requirements: ['4+ years DevOps/SRE experience', 'Strong Kubernetes and Docker knowledge', 'Experience with Terraform or Pulumi', 'AWS or GCP expertise'],
    niceToHave: ['Experience with service meshes', 'Security hardening background'],
    benefits: ['Competitive salary', 'Full remote', 'Design tool credits', 'Health & wellness perks'],
  },
  {
    id: 6, title: 'AI / ML Engineer', company: 'OpenAI', logo: 'O', logoColor: '#8b5cf6',
    salary: '$160K – $220K', salaryMin: 160000, salaryMax: 220000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['Python', 'PyTorch', 'LLMs'], postedAt: '3h ago', applicants: 189,
    featured: true, matchScore: 91, category: 'AI/ML',
    description: "Work at the frontier of AI. OpenAI is looking for ML engineers to help build and deploy the next generation of language models.",
    responsibilities: ['Train and fine-tune large language models', 'Build evaluation frameworks for model quality', 'Optimize inference pipelines for production', 'Collaborate with research teams on new capabilities'],
    requirements: ['5+ years ML engineering experience', 'Deep expertise in PyTorch', 'Experience training large-scale models', 'Strong Python skills'],
    niceToHave: ['Experience with distributed training (DeepSpeed, FSDP)', 'Published ML research'],
    benefits: ['Industry-leading compensation', 'Equity in a frontier AI company', 'Cutting-edge compute access', 'Mission-driven work'],
  },
  {
    id: 7, title: 'Frontend Architect', company: 'Shopify', logo: 'S', logoColor: '#059669',
    salary: '$140K – $190K', salaryMin: 140000, salaryMax: 190000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['React', 'Next.js', 'Performance'], postedAt: '4h ago', applicants: 74,
    featured: false, matchScore: 87, category: 'Engineering',
    description: "Shopify powers 10% of US e-commerce. As a Frontend Architect, you'll set the technical direction for our merchant-facing web experiences.",
    responsibilities: ['Define frontend architecture standards', 'Lead performance optimization initiatives', 'Review and approve major technical decisions', 'Mentor senior engineers'],
    requirements: ['8+ years frontend engineering', 'Deep React and Next.js expertise', 'Track record of large-scale refactors', 'Strong systems thinking'],
    niceToHave: ['E-commerce domain knowledge', 'Experience with GraphQL at scale'],
    benefits: ['Top-tier compensation', 'Remote-first forever', 'Annual professional development budget', 'Generous parental leave'],
  },
  {
    id: 8, title: 'Backend Engineer (Node.js)', company: 'Linear', logo: 'L', logoColor: '#5b5bd6',
    salary: '$100K – $140K', salaryMin: 100000, salaryMax: 140000,
    type: 'Full-time', location: 'Remote (US/EU)', remote: true,
    tags: ['Node.js', 'PostgreSQL', 'Redis'], postedAt: '6h ago', applicants: 38,
    featured: false, matchScore: 84, category: 'Engineering',
    description: 'Linear is the issue tracker that teams actually love. We need a Backend Engineer to help scale our real-time synchronization infrastructure.',
    responsibilities: ['Build and scale real-time sync systems', 'Design database schemas and optimize queries', 'Build developer-facing APIs', 'Improve observability and reliability'],
    requirements: ['4+ years backend engineering', 'Deep Node.js expertise', 'PostgreSQL and Redis experience', 'Understanding of real-time systems'],
    niceToHave: ['Experience with CRDTs', 'Rust knowledge'],
    benefits: ['Competitive salary + equity', 'Small team, big impact', 'Remote-friendly', 'Top-tier tooling'],
  },
  {
    id: 9, title: 'Angular Developer', company: 'Atlassian', logo: 'A', logoColor: '#0052cc',
    salary: '$95K – $130K', salaryMin: 95000, salaryMax: 130000,
    type: 'Contract', location: 'Remote (Global)', remote: true,
    tags: ['Angular', 'TypeScript', 'RxJS'], postedAt: '12h ago', applicants: 29,
    featured: false, matchScore: 93, category: 'Engineering',
    description: "Join Atlassian's Jira team to build features used by millions of software teams worldwide. This is a contract role with a strong possibility of conversion.",
    responsibilities: ['Build new Jira features in Angular', 'Maintain and improve existing components', 'Write comprehensive tests', 'Work with backend APIs'],
    requirements: ['3+ years Angular experience', 'Strong TypeScript and RxJS skills', 'Experience with component testing', 'Jira or project management tool experience preferred'],
    niceToHave: ['Knowledge of Atlassian Design System', 'Agile/Scrum experience'],
    benefits: ['Competitive day rate', 'Possible full-time conversion', 'Remote work', 'Access to Atlassian tools'],
  },
  {
    id: 10, title: 'Site Reliability Engineer', company: 'GitHub', logo: 'G', logoColor: '#24292f',
    salary: '$130K – $175K', salaryMin: 130000, salaryMax: 175000,
    type: 'Full-time', location: 'Remote (US)', remote: true,
    tags: ['SRE', 'Go', 'Kubernetes'], postedAt: '1d ago', applicants: 61,
    featured: false, matchScore: 78, category: 'DevOps',
    description: "GitHub's SRE team keeps the platform reliable for 100M+ developers. We're looking for an experienced SRE to help maintain and improve our infrastructure.",
    responsibilities: ['Maintain and improve platform reliability', 'Respond to and resolve production incidents', 'Build tooling to reduce toil', 'Define SLOs and error budgets'],
    requirements: ['5+ years SRE or systems engineering', 'Strong Go or Python skills', 'Kubernetes expertise', 'On-call experience'],
    niceToHave: ['GitHub platform knowledge', 'Experience with chaos engineering'],
    benefits: ['Microsoft benefits package', 'Remote-friendly', 'Mission-driven work', 'Stock options'],
  },
  {
    id: 11, title: 'Mobile Engineer (React Native)', company: 'Discord', logo: 'D', logoColor: '#5865f2',
    salary: '$110K – $150K', salaryMin: 110000, salaryMax: 150000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['React Native', 'iOS', 'Android'], postedAt: '8h ago', applicants: 55,
    featured: false, matchScore: 76, category: 'Mobile',
    description: "Discord is where communities live. Our mobile apps serve 200M+ monthly users. We need a Mobile Engineer to help ship great experiences on iOS and Android.",
    responsibilities: ['Build features in React Native', 'Optimize app performance and startup time', 'Write automated tests', 'Debug cross-platform issues'],
    requirements: ['4+ years mobile development', 'React Native expertise', 'Understanding of iOS and Android platforms', 'App store submission experience'],
    niceToHave: ['Native iOS or Android experience', 'Real-time communication knowledge'],
    benefits: ['Competitive compensation', 'Remote-first', 'Gaming perks', 'Inclusive culture'],
  },
  {
    id: 12, title: 'Technical Writer', company: 'Canva', logo: 'C', logoColor: '#7d2ae8',
    salary: '$70K – $95K', salaryMin: 70000, salaryMax: 95000,
    type: 'Full-time', location: 'Remote (Global)', remote: true,
    tags: ['Technical Writing', 'API Docs', 'Markdown'], postedAt: '2d ago', applicants: 44,
    featured: false, matchScore: 71, category: 'Content',
    description: "Help millions of designers get the most out of Canva's APIs and developer tools. We're looking for a technical writer who can make complex concepts accessible.",
    responsibilities: ['Write API reference documentation', 'Create tutorials and getting-started guides', 'Maintain developer portal content', 'Work with engineers to document new features'],
    requirements: ['3+ years technical writing', 'Experience documenting REST APIs', 'Familiarity with Markdown and docs-as-code workflows', 'Ability to read basic code'],
    niceToHave: ['Design tool experience', 'Developer background'],
    benefits: ['Remote work', 'Canva Pro access', 'Learning budget', 'Wellbeing perks'],
  },
];

@Injectable({ providedIn: 'root' })
export class JobsService {

  private savedIds = new BehaviorSubject<Set<number>>(new Set());
  readonly savedIds$ = this.savedIds.asObservable();

  getAllJobs(): Job[] {
    return ALL_JOBS;
  }

  getJobById(id: number): Job | undefined {
    return ALL_JOBS.find(j => j.id === id);
  }

  getSimilarJobs(id: number, count = 3): Job[] {
    const job = this.getJobById(id);
    if (!job) return ALL_JOBS.slice(0, count);
    return ALL_JOBS.filter(j => j.id !== id && j.category === job.category).slice(0, count)
      || ALL_JOBS.filter(j => j.id !== id).slice(0, count);
  }

  toggleSave(id: number): boolean {
    const current = new Set(this.savedIds.value);
    if (current.has(id)) {
      current.delete(id);
      this.savedIds.next(current);
      return false;
    }
    current.add(id);
    this.savedIds.next(current);
    return true;
  }

  isSaved(id: number): boolean {
    return this.savedIds.value.has(id);
  }

  filterJobs(jobs: Job[], opts: {
    query?: string;
    type?: string;
    category?: string;
    salaryMin?: number;
    remote?: boolean;
  }): Job[] {
    return jobs.filter(j => {
      if (opts.query) {
        const q = opts.query.toLowerCase();
        if (!j.title.toLowerCase().includes(q) &&
            !j.company.toLowerCase().includes(q) &&
            !j.tags.some(t => t.toLowerCase().includes(q))) {
          return false;
        }
      }
      if (opts.type && opts.type !== 'All' && j.type !== opts.type) return false;
      if (opts.category && opts.category !== 'All' && j.category !== opts.category) return false;
      if (opts.salaryMin && j.salaryMin < opts.salaryMin) return false;
      if (opts.remote !== undefined && j.remote !== opts.remote) return false;
      return true;
    });
  }

  readonly categories = ['All', 'Engineering', 'Design', 'Data', 'DevOps', 'AI/ML', 'Mobile', 'Content'];
  readonly jobTypes   = ['All', 'Full-time', 'Contract', 'Part-time', 'Freelance'];
}