// src/app/pages/messages/messages.component.ts
import {
  Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

export interface Conversation {
  id:          number;
  name:        string;
  initials:    string;
  avatarColor: string;
  role:        string;        // "Senior React Dev" or "Stripe — Employer"
  lastMessage: string;
  lastTime:    string;
  unread:      number;
  online:      boolean;
  jobTitle?:   string;        // related job if applicable
}

export interface Message {
  id:        number;
  convId:    number;
  sender:    'me' | 'them';
  text:      string;
  time:      string;
  read:      boolean;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('msgEnd') msgEnd!: ElementRef;

  currentUser: any = null;
  isEmployer       = false;
  activeConvId     = 1;
  newMessage       = '';
  searchQuery      = '';
  private subs     = new Subscription();
  private shouldScroll = false;

  readonly conversations: Conversation[] = [
    { id:1, name:'James Whitfield',  initials:'JW', avatarColor:'#d97706', role:'Senior React Developer',    lastMessage:'Thanks! I can start next Monday.',  lastTime:'2m ago',  unread:2, online:true,  jobTitle:'Senior React Developer'    },
    { id:2, name:'Adaeze Okonkwo',   initials:'AO', avatarColor:'#6366f1', role:'UI/UX Designer',             lastMessage:'Can we schedule a call this week?', lastTime:'1h ago',  unread:1, online:true,  jobTitle:'UI/UX Designer'             },
    { id:3, name:'Ravi Shankar',     initials:'RS', avatarColor:'#10b981', role:'Backend Engineer',           lastMessage:'I\'ve reviewed the requirements.',  lastTime:'3h ago',  unread:0, online:false, jobTitle:'Backend Engineer (Node.js)' },
    { id:4, name:'Sofia Andersen',   initials:'SA', avatarColor:'#ec4899', role:'UI/UX Designer',             lastMessage:'Looking forward to the interview!', lastTime:'1d ago',  unread:0, online:true,  jobTitle:'UI/UX Designer'             },
    { id:5, name:'Marcus Teixeira',  initials:'MT', avatarColor:'#8b5cf6', role:'ML Engineer',                lastMessage:'My portfolio is at marcus.dev',     lastTime:'2d ago',  unread:0, online:false, jobTitle:'AI / ML Engineer'           },
    { id:6, name:'Kwame Mensah',     initials:'KM', avatarColor:'#059669', role:'DevOps Engineer',            lastMessage:'I have 4 years with Kubernetes.',   lastTime:'3d ago',  unread:0, online:false, jobTitle:'DevOps Engineer'            },
  ];

  readonly allMessages: Message[] = [
    // Conv 1 — James
    { id:1,  convId:1, sender:'them', text:'Hi! I saw your job posting for Senior React Developer and I\'m very interested. I have 6 years of React experience and have shipped multiple SaaS products.', time:'Mon 10:12', read:true  },
    { id:2,  convId:1, sender:'me',   text:'Hi James! Thanks for reaching out. Your profile looks impressive — especially the work you did at Intercom. Can you tell me a bit more about your experience with TypeScript and GraphQL?', time:'Mon 14:30', read:true  },
    { id:3,  convId:1, sender:'them', text:'Absolutely! I\'ve been using TypeScript since 2019 and it\'s now my default. For GraphQL, I built the entire data layer at Intercom using Apollo Client and loved it. I also have experience setting up code generation with GraphQL Codegen.', time:'Mon 15:05', read:true  },
    { id:4,  convId:1, sender:'me',   text:'That\'s exactly what we need. Would you be available for a 30-minute technical interview this week? We can do Thursday or Friday.', time:'Mon 16:20', read:true  },
    { id:5,  convId:1, sender:'them', text:'Thursday works great for me! Any time after 10am UTC is fine. Really excited about this opportunity.', time:'Mon 17:01', read:true  },
    { id:6,  convId:1, sender:'me',   text:'Perfect. I\'ll send you a calendar invite for Thursday at 11am UTC. The interview will be with our Lead Engineer. Please have your GitHub ready.', time:'Tue 09:15', read:true  },
    { id:7,  convId:1, sender:'them', text:'Thanks! I can start next Monday.', time:'Just now', read:false },
    // Conv 2 — Adaeze
    { id:8,  convId:2, sender:'them', text:'Hello! I applied for the UI/UX Designer role yesterday. I\'d love to discuss how my work at Figma aligns with what you\'re looking for.', time:'Today 09:22', read:true  },
    { id:9,  convId:2, sender:'me',   text:'Hi Adaeze! We reviewed your portfolio and we\'re really impressed. Your design systems work is exactly what we need. Can we schedule a call this week?', time:'Today 10:45', read:false },
    // Conv 3 — Ravi
    { id:10, convId:3, sender:'them', text:'Hi, I\'m applying for the Backend Engineer role. I\'ve reviewed the requirements and I think my experience with Node.js and PostgreSQL is a great fit.', time:'Yesterday', read:true  },
    { id:11, convId:3, sender:'them', text:'I\'ve reviewed the requirements.', time:'Yesterday', read:true  },
    // Conv 4 — Sofia
    { id:12, convId:4, sender:'me',   text:'Hi Sofia! We\'d like to invite you for an interview for the UI/UX Designer position. Are you available this week?', time:'2d ago', read:true  },
    { id:13, convId:4, sender:'them', text:'Looking forward to the interview!', time:'2d ago', read:true  },
  ];

  get activeConv(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeConvId);
  }

  get activeMessages(): Message[] {
    return this.allMessages.filter(m => m.convId === this.activeConvId);
  }

  get filteredConvs(): Conversation[] {
    if (!this.searchQuery) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    );
  }

  get totalUnread(): number {
    return this.conversations.reduce((s,c) => s + c.unread, 0);
  }

  constructor(
    private auth: AuthService,
    private cdr:  ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.auth.user$.subscribe(u => {
        this.currentUser = u;
        this.isEmployer  = u?.role === 'employer';
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  selectConv(id: number): void {
    this.activeConvId  = id;
    this.shouldScroll  = true;
    // Mark as read
    const conv = this.conversations.find(c => c.id === id);
    if (conv) conv.unread = 0;
    this.cdr.markForCheck();
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text) return;
    const newMsg: Message = {
      id:     this.allMessages.length + 1,
      convId: this.activeConvId,
      sender: 'me',
      text,
      time:   'Just now',
      read:   true,
    };
    this.allMessages.push(newMsg);
    const conv = this.conversations.find(c => c.id === this.activeConvId);
    if (conv) { conv.lastMessage = text; conv.lastTime = 'Just now'; }
    this.newMessage   = '';
    this.shouldScroll = true;
    this.cdr.markForCheck();
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  private scrollToBottom(): void {
    try { this.msgEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  getUserInitials(): string {
    const name  = this.currentUser?.fullName || '?';
    const parts = name.trim().split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }
}