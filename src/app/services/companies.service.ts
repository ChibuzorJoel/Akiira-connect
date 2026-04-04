// src/app/shared/services/companies.service.ts
import { Injectable } from '@angular/core';

export interface Company {
  id:          number;
  name:        string;
  logo:        string;
  logoColor:   string;
  tagline:     string;
  description: string;
  industry:    string;
  size:        string;
  founded:     string;
  location:    string;
  website:     string;
  openRoles:   number;
  totalHired:  number;
  rating:      number;
  reviews:     number;
  verified:    boolean;
  featured:    boolean;
  remote:      boolean;
  tags:        string[];
  benefits:    string[];
  techStack:   string[];
  culture:     string[];
  jobs:        CompanyJob[];
  socialLinks: { twitter?: string; linkedin?: string; github?: string; };
}

export interface CompanyJob {
  id:       number;
  title:    string;
  type:     string;
  salary:   string;
  location: string;
  posted:   string;
}

const COMPANIES: Company[] = [
  {
    id: 1, name: 'Stripe', logo: 'S', logoColor: '#6366f1',
    tagline: 'Economic infrastructure for the internet',
    description: 'Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use Stripe software to accept payments and manage their businesses online.',
    industry: 'FinTech', size: '5,000–10,000', founded: '2010', location: 'San Francisco, CA',
    website: 'stripe.com', openRoles: 12, totalHired: 284, rating: 4.8, reviews: 1240,
    verified: true, featured: true, remote: true,
    tags: ['FinTech', 'Payments', 'API', 'Global'],
    benefits: ['Full health coverage', '$3,000 home office stipend', 'Equity package', 'Unlimited PTO', '$2,500 learning budget', 'Annual team retreats'],
    techStack: ['React', 'TypeScript', 'Ruby', 'Go', 'Scala', 'PostgreSQL'],
    culture: ['Remote-first', 'High autonomy', 'Ship fast', 'Data-driven'],
    socialLinks: { twitter: 'https://twitter.com/stripe', linkedin: 'https://linkedin.com/company/stripe', github: 'https://github.com/stripe' },
    jobs: [
      { id: 1,  title: 'Senior React Developer',   type: 'Full-time', salary: '$120K–$160K', location: 'Remote (Global)', posted: '2h ago'  },
      { id: 11, title: 'Backend Engineer (Go)',     type: 'Full-time', salary: '$130K–$170K', location: 'Remote (Global)', posted: '3d ago'  },
      { id: 12, title: 'Staff Data Engineer',       type: 'Full-time', salary: '$150K–$200K', location: 'Remote (US)',     posted: '5d ago'  },
    ],
  },
  {
    id: 2, name: 'Vercel', logo: 'V', logoColor: '#10b981',
    tagline: 'The platform for frontend developers',
    description: 'Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration. Vercel enables teams to iterate quickly and develop, preview, and ship delightful user experiences.',
    industry: 'Developer Tools', size: '500–1,000', founded: '2015', location: 'Remote-first',
    website: 'vercel.com', openRoles: 8, totalHired: 156, rating: 4.9, reviews: 430,
    verified: true, featured: true, remote: true,
    tags: ['Developer Tools', 'Cloud', 'Frontend', 'Edge'],
    benefits: ['100% remote forever', 'Competitive equity', 'Top equipment', 'Flexible hours', 'Annual retreat', 'Learning budget'],
    techStack: ['Next.js', 'Node.js', 'TypeScript', 'Rust', 'Go', 'AWS'],
    culture: ['Fully distributed', 'Async-first', 'Open source', 'Developer obsessed'],
    socialLinks: { twitter: 'https://twitter.com/vercel', github: 'https://github.com/vercel' },
    jobs: [
      { id: 3, title: 'Full-Stack Engineer',     type: 'Full-time', salary: '$110K–$150K', location: 'Remote (Global)', posted: '1d ago' },
      { id: 13, title: 'Infrastructure Engineer', type: 'Full-time', salary: '$140K–$180K', location: 'Remote (Global)', posted: '4d ago' },
    ],
  },
  {
    id: 3, name: 'OpenAI', logo: 'O', logoColor: '#8b5cf6',
    tagline: 'Ensuring AI benefits all of humanity',
    description: 'OpenAI is an AI research and deployment company whose mission is to ensure that artificial general intelligence benefits all of humanity. We build safe and beneficial AI systems and make them available to the world.',
    industry: 'Artificial Intelligence', size: '1,000–2,000', founded: '2015', location: 'San Francisco, CA',
    website: 'openai.com', openRoles: 24, totalHired: 89, rating: 4.7, reviews: 612,
    verified: true, featured: true, remote: true,
    tags: ['AI/ML', 'Research', 'LLMs', 'Safety'],
    benefits: ['Top-of-market comp', 'Equity in frontier AI', 'Unlimited GPU access', 'Research budget', 'Premium health', 'Catered meals'],
    techStack: ['Python', 'PyTorch', 'C++', 'CUDA', 'Kubernetes', 'Azure'],
    culture: ['Mission-driven', 'Research excellence', 'High impact', 'Collaborative'],
    socialLinks: { twitter: 'https://twitter.com/openai', github: 'https://github.com/openai' },
    jobs: [
      { id: 6,  title: 'AI / ML Engineer',         type: 'Full-time', salary: '$160K–$220K', location: 'Remote (Global)', posted: '3h ago'  },
      { id: 14, title: 'Research Engineer',         type: 'Full-time', salary: '$180K–$250K', location: 'Remote (US)',     posted: '1d ago'  },
      { id: 15, title: 'Safety Researcher',         type: 'Full-time', salary: '$150K–$210K', location: 'Remote (US)',     posted: '3d ago'  },
    ],
  },
  {
    id: 4, name: 'Notion', logo: 'N', logoColor: '#0ea5e9',
    tagline: 'The all-in-one workspace for teams',
    description: 'Notion is a new tool that blends your everyday work apps into one. It\'s the all-in-one workspace for you and your team. Used by 30M+ people and teams at companies like Nike, McDonald\'s and Figma.',
    industry: 'Productivity', size: '500–1,000', founded: '2016', location: 'San Francisco, CA',
    website: 'notion.so', openRoles: 6, totalHired: 203, rating: 4.6, reviews: 890,
    verified: true, featured: false, remote: true,
    tags: ['SaaS', 'Productivity', 'Collaboration', 'Design'],
    benefits: ['Competitive salary', 'Notion credits', 'Remote-friendly', 'Generous PTO', 'Health & dental', 'Home office budget'],
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Electron', 'Redis'],
    culture: ['User obsessed', 'Craft focused', 'Remote friendly', 'Collaborative'],
    socialLinks: { twitter: 'https://twitter.com/NotionHQ' },
    jobs: [
      { id: 2,  title: 'Product Designer (UI/UX)', type: 'Contract',  salary: '$80–$120/hr',  location: 'Remote (US)',     posted: '5h ago'  },
      { id: 16, title: 'Frontend Engineer',        type: 'Full-time', salary: '$110K–$145K',  location: 'Remote (Global)', posted: '6d ago'  },
    ],
  },
  {
    id: 5, name: 'Figma', logo: 'F', logoColor: '#ec4899',
    tagline: 'Where teams design together',
    description: 'Figma is the collaborative design tool that brings teams together. Design, prototype, and gather feedback all in one place — from anywhere in the world. Used by 4M+ designers at the world\'s top companies.',
    industry: 'Design Tools', size: '1,000–2,000', founded: '2012', location: 'San Francisco, CA',
    website: 'figma.com', openRoles: 9, totalHired: 178, rating: 4.8, reviews: 720,
    verified: true, featured: false, remote: true,
    tags: ['Design Tools', 'SaaS', 'Collaboration', 'WebGL'],
    benefits: ['Equity + salary', 'Design credits', 'Remote work', 'Learning stipend', 'Wellness perks', 'Premium healthcare'],
    techStack: ['TypeScript', 'React', 'WebAssembly', 'Rust', 'C++', 'WebGL'],
    culture: ['Design-led', 'High craft', 'Inclusive', 'Move fast'],
    socialLinks: { twitter: 'https://twitter.com/figma', github: 'https://github.com/figma' },
    jobs: [
      { id: 5,  title: 'DevOps / Cloud Engineer',  type: 'Full-time', salary: '$125K–$165K', location: 'Remote (US/EU)', posted: '2d ago'  },
      { id: 17, title: 'Staff Engineer (WebGL)',    type: 'Full-time', salary: '$160K–$210K', location: 'Remote (US)',    posted: '5d ago'  },
    ],
  },
  {
    id: 6, name: 'GitHub', logo: 'G', logoColor: '#24292f',
    tagline: 'Where the world builds software',
    description: 'GitHub is where over 100 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs, features and more.',
    industry: 'Developer Tools', size: '2,000–5,000', founded: '2008', location: 'Remote-first',
    website: 'github.com', openRoles: 15, totalHired: 412, rating: 4.5, reviews: 1850,
    verified: true, featured: false, remote: true,
    tags: ['Developer Tools', 'Open Source', 'Git', 'AI (Copilot)'],
    benefits: ['Microsoft benefits', 'Remote forever', 'Stock options', 'Generous PTO', '401k matching', 'Learning budget'],
    techStack: ['Ruby', 'Go', 'React', 'TypeScript', 'MySQL', 'Elasticsearch'],
    culture: ['Open source first', 'Remote native', 'Mission driven', 'Diverse team'],
    socialLinks: { twitter: 'https://twitter.com/github', github: 'https://github.com/github' },
    jobs: [
      { id: 10, title: 'Site Reliability Engineer', type: 'Full-time', salary: '$130K–$175K', location: 'Remote (US)',     posted: '1d ago' },
      { id: 18, title: 'Security Engineer',         type: 'Full-time', salary: '$140K–$185K', location: 'Remote (Global)', posted: '3d ago' },
    ],
  },
  {
    id: 7, name: 'Shopify', logo: 'S', logoColor: '#059669',
    tagline: 'Making commerce better for everyone',
    description: 'Shopify is a leading global commerce company providing trusted tools to start, grow, market, and manage a retail business of any size. Shopify powers millions of businesses in more than 175 countries.',
    industry: 'E-Commerce', size: '10,000+', founded: '2006', location: 'Ottawa, Canada',
    website: 'shopify.com', openRoles: 18, totalHired: 634, rating: 4.4, reviews: 2100,
    verified: true, featured: false, remote: true,
    tags: ['E-Commerce', 'SaaS', 'Payments', 'Global'],
    benefits: ['Equity + bonus', 'Digital by default', 'Unlimited PTO', '$2,000 wellness', 'Parental leave', 'Home office budget'],
    techStack: ['Ruby on Rails', 'React', 'TypeScript', 'Go', 'GraphQL', 'MySQL'],
    culture: ['Digital by default', 'Trust & autonomy', 'Impact driven', 'Merchant obsessed'],
    socialLinks: { twitter: 'https://twitter.com/shopify', github: 'https://github.com/shopify' },
    jobs: [
      { id: 7,  title: 'Frontend Architect',       type: 'Full-time', salary: '$140K–$190K', location: 'Remote (Global)', posted: '4h ago' },
      { id: 19, title: 'Senior Rails Engineer',    type: 'Full-time', salary: '$120K–$160K', location: 'Remote (Global)', posted: '2d ago' },
    ],
  },
  {
    id: 8, name: 'Linear', logo: 'L', logoColor: '#5b5bd6',
    tagline: 'The issue tracker for high-performance teams',
    description: 'Linear helps streamline software projects, sprints, tasks, and bug tracking. It\'s built for high-performance teams who demand speed and precision in their tools.',
    industry: 'Developer Tools', size: '50–200', founded: '2019', location: 'Remote-first',
    website: 'linear.app', openRoles: 5, totalHired: 42, rating: 4.9, reviews: 180,
    verified: true, featured: false, remote: true,
    tags: ['Developer Tools', 'SaaS', 'Productivity', 'B2B'],
    benefits: ['Competitive salary', 'Equity package', 'Remote native', 'Top equipment', '$3K office setup', 'Flexible hours'],
    techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'WebSockets'],
    culture: ['Small team big impact', 'Craft obsessed', 'Async first', 'No meetings'],
    socialLinks: { twitter: 'https://twitter.com/linear' },
    jobs: [
      { id: 8, title: 'Backend Engineer (Node.js)', type: 'Full-time', salary: '$100K–$140K', location: 'Remote (US/EU)', posted: '6h ago' },
    ],
  },
  {
    id: 9, name: 'Airbnb', logo: 'A', logoColor: '#f59e0b',
    tagline: 'Belong anywhere',
    description: 'Airbnb is an online marketplace that connects people who want to rent out their homes with people looking for accommodations in that locale. Used by 4M+ hosts and 1B+ guests across 220 countries.',
    industry: 'Travel / Marketplace', size: '5,000–10,000', founded: '2008', location: 'San Francisco, CA',
    website: 'airbnb.com', openRoles: 11, totalHired: 289, rating: 4.3, reviews: 1600,
    verified: true, featured: false, remote: true,
    tags: ['Travel', 'Marketplace', 'Mobile', 'Global'],
    benefits: ['Travel credits', 'Competitive equity', 'Remote-friendly', 'Health & dental', 'Wellness stipend', 'Learning budget'],
    techStack: ['Java', 'React', 'Swift', 'Kotlin', 'Python', 'Airflow'],
    culture: ['Mission driven', 'Belong anywhere', 'Data informed', 'Diverse team'],
    socialLinks: { twitter: 'https://twitter.com/airbnb', github: 'https://github.com/airbnb' },
    jobs: [
      { id: 4,  title: 'Senior Data Scientist',  type: 'Full-time', salary: '$130K–$180K', location: 'Remote (Global)', posted: '1d ago' },
      { id: 20, title: 'iOS Engineer',            type: 'Full-time', salary: '$125K–$165K', location: 'Remote (US)',     posted: '4d ago' },
    ],
  },
  {
    id: 10, name: 'Atlassian', logo: 'A', logoColor: '#0052cc',
    tagline: 'Unleashing the potential of every team',
    description: 'Atlassian makes tools like Jira, Confluence, and Trello that help teams collaborate and ship great work. 10M+ users across 250,000+ organizations rely on Atlassian daily.',
    industry: 'Enterprise SaaS', size: '10,000+', founded: '2002', location: 'Sydney, Australia',
    website: 'atlassian.com', openRoles: 22, totalHired: 521, rating: 4.2, reviews: 3100,
    verified: true, featured: false, remote: true,
    tags: ['Enterprise SaaS', 'Collaboration', 'B2B', 'ITSM'],
    benefits: ['Generous equity', 'Work from anywhere', 'Volunteer days', 'Generous PTO', 'Health benefits', 'Learning allowance'],
    techStack: ['Java', 'React', 'TypeScript', 'Go', 'PostgreSQL', 'AWS'],
    culture: ['Play as a team', 'Open company', 'Build with heart', 'Balanced life'],
    socialLinks: { twitter: 'https://twitter.com/Atlassian', github: 'https://github.com/atlassian' },
    jobs: [
      { id: 9,  title: 'Angular Developer',        type: 'Contract',  salary: '$95K–$130K',  location: 'Remote (Global)', posted: '12h ago' },
      { id: 21, title: 'Senior Java Engineer',     type: 'Full-time', salary: '$120K–$160K', location: 'Remote (AU/US)', posted: '2d ago'  },
    ],
  },
  {
    id: 11, name: 'Discord', logo: 'D', logoColor: '#5865f2',
    tagline: 'Your place to talk, hang, and belong',
    description: 'Discord is the easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities. 200M+ monthly active users worldwide.',
    industry: 'Communication / Gaming', size: '500–1,000', founded: '2015', location: 'San Francisco, CA',
    website: 'discord.com', openRoles: 7, totalHired: 134, rating: 4.5, reviews: 560,
    verified: true, featured: false, remote: true,
    tags: ['Gaming', 'Communication', 'Mobile', 'WebRTC'],
    benefits: ['Competitive salary', 'Equity package', 'Remote flexible', 'Gaming perks', 'Health coverage', 'Team events'],
    techStack: ['React', 'React Native', 'Python', 'Rust', 'Elixir', 'WebRTC'],
    culture: ['Fun & inclusive', 'Community first', 'Remote friendly', 'Build what you love'],
    socialLinks: { twitter: 'https://twitter.com/discord', github: 'https://github.com/discord' },
    jobs: [
      { id: 11, title: 'Mobile Engineer (RN)',     type: 'Full-time', salary: '$110K–$150K', location: 'Remote (Global)', posted: '8h ago' },
    ],
  },
  {
    id: 12, name: 'Canva', logo: 'C', logoColor: '#7d2ae8',
    tagline: 'Design for everyone',
    description: 'Canva is a graphic design platform used to create social media graphics, presentations, posters, documents and other visual content. 150M+ monthly active users across 190+ countries.',
    industry: 'Design / Creative', size: '2,000–5,000', founded: '2012', location: 'Sydney, Australia',
    website: 'canva.com', openRoles: 14, totalHired: 376, rating: 4.6, reviews: 980,
    verified: true, featured: false, remote: true,
    tags: ['Design', 'SaaS', 'AI', 'Creative'],
    benefits: ['Equity + salary', 'Canva Pro access', 'Remote work', 'Learning budget', 'Wellness perks', 'Parental leave'],
    techStack: ['Java', 'React', 'TypeScript', 'Python', 'GraphQL', 'GCP'],
    culture: ['Be a good person', 'Set audacious goals', 'Make complex simple', 'Own what you do'],
    socialLinks: { twitter: 'https://twitter.com/canva', github: 'https://github.com/canva' },
    jobs: [
      { id: 12, title: 'Technical Writer',         type: 'Full-time', salary: '$70K–$95K',   location: 'Remote (Global)', posted: '2d ago' },
      { id: 22, title: 'Senior Android Engineer',  type: 'Full-time', salary: '$115K–$155K', location: 'Remote (AU/EU)', posted: '5d ago' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class CompaniesService {

  getAll(): Company[] { return COMPANIES; }

  getById(id: number): Company | undefined {
    return COMPANIES.find(c => c.id === id);
  }

  filter(companies: Company[], opts: {
    query?:    string;
    industry?: string;
    size?:     string;
    remote?:   boolean;
  }): Company[] {
    return companies.filter(c => {
      if (opts.query) {
        const q = opts.query.toLowerCase();
        if (!c.name.toLowerCase().includes(q) &&
            !c.tagline.toLowerCase().includes(q) &&
            !c.tags.some(t => t.toLowerCase().includes(q))) return false;
      }
      if (opts.industry && opts.industry !== 'All' && c.industry !== opts.industry) return false;
      if (opts.size     && opts.size     !== 'All' && c.size     !== opts.size)     return false;
      if (opts.remote !== undefined && c.remote !== opts.remote) return false;
      return true;
    });
  }

  readonly industries = ['All', 'Engineering', 'FinTech', 'Developer Tools', 'Artificial Intelligence', 'Productivity', 'Design Tools', 'E-Commerce', 'Travel / Marketplace', 'Enterprise SaaS', 'Communication / Gaming', 'Design / Creative'];
  readonly sizes      = ['All', '50–200', '500–1,000', '1,000–2,000', '2,000–5,000', '5,000–10,000', '10,000+'];
}