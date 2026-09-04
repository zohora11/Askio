import { Resource, KnowledgeSpotlight, Goal, NotificationItem, CategoryDomain, ActivityLogItem } from '../types';

export interface CategoryInfo {
  domain: CategoryDomain;
  description: string;
  iconName: string;
  color: string;
  solutionsCount: string;
  guidesCount: string;
  badge: string;
}

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    domain: 'Books & Literature',
    description: 'Bestselling eBooks, classical literature, tech handbooks, and summaries.',
    iconName: 'BookOpen',
    color: 'emerald',
    solutionsCount: '48,200+',
    guidesCount: '12,100+',
    badge: 'Trending',
  },
  {
    domain: 'PDFs & Research',
    description: 'Downloadable PDF guides, scientific whitepapers, cheat sheets, and blueprints.',
    iconName: 'FileText',
    color: 'blue',
    solutionsCount: '35,500+',
    guidesCount: '9,400+',
    badge: 'Verified PDFs',
  },
  {
    domain: 'Technology & AI',
    description: 'Coding masterclasses, AI tools, full-stack frameworks, and cloud architecture.',
    iconName: 'Cpu',
    color: 'indigo',
    solutionsCount: '62,400+',
    guidesCount: '18,900+',
    badge: 'Hot',
  },
  {
    domain: 'Education & Science',
    description: 'STEM fundamentals, physics, mathematics, university lecture notes, and guides.',
    iconName: 'GraduationCap',
    color: 'cyan',
    solutionsCount: '28,600+',
    guidesCount: '7,300+',
    badge: 'Essential',
  },
  {
    domain: 'Business & Career',
    description: 'Startup playbooks, resume blueprints, management frameworks, and interview Q&As.',
    iconName: 'Briefcase',
    color: 'amber',
    solutionsCount: '21,300+',
    guidesCount: '6,800+',
    badge: 'High Impact',
  },
  {
    domain: 'Productivity & Tools',
    description: 'Cheat sheets, timeboxing templates, Notion dashboards, and workflow hacks.',
    iconName: 'Wrench',
    color: 'purple',
    solutionsCount: '19,800+',
    guidesCount: '5,900+',
    badge: 'Tools',
  },
  {
    domain: 'Creative & Design',
    description: 'UI/UX design systems, Figma kits, vector assets, and graphic design guides.',
    iconName: 'Sparkles',
    color: 'rose',
    solutionsCount: '15,700+',
    guidesCount: '4,200+',
    badge: 'Creative',
  },
  {
    domain: 'Finance & Economics',
    description: 'Investment books, personal finance guides, market analysis, and wealth PDFs.',
    iconName: 'TrendingUp',
    color: 'teal',
    solutionsCount: '18,900+',
    guidesCount: '5,200+',
    badge: 'Strategic',
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'The definitive software engineering handbook on writing elegant, maintainable, and robust code. Includes practical refactoring rules.',
    category: 'Books & Literature',
    format: 'Books',
    author: {
      name: 'Robert C. Martin (Uncle Bob)',
      role: 'Master Software Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.9,
    reviewCount: 3840,
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#CleanCode', '#SoftwareArchitecture', '#Books', '#Programming'],
    durationOrPages: '464 Pages',
    dateAdded: '2026-02-10',
    featured: true,
    contentUrl: 'https://github.com/topics/clean-code',
    keyTakeaways: [
      'Meaningful names: Use intention-revealing names for variables and functions.',
      'Functions should be small and do one thing well.',
      'Write unit tests that cover critical edge cases.'
    ]
  },
  {
    id: 'res-2',
    title: 'Complete Modern React 19 & Next.js 15 Video Masterclass',
    description: 'Comprehensive 12-hour full-stack video tutorial covering Server Components, App Router, Zustand, and Tailwind CSS v4.',
    category: 'Technology & AI',
    format: 'Videos',
    author: {
      name: 'Dan Abramov & Team',
      role: 'Senior Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.95,
    reviewCount: 5120,
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#ReactJS', '#NextJS', '#VideoCourse', '#WebDev'],
    durationOrPages: '12h 45m Video',
    dateAdded: '2026-03-01',
    featured: true,
    contentUrl: 'https://react.dev',
    keyTakeaways: [
      'Master React Server Components and server-side data fetching.',
      'Build responsive, production-ready UIs with Tailwind CSS.',
      'Deploy scalable full-stack web applications effortlessly.'
    ]
  },
  {
    id: 'res-3',
    title: 'Full Stack Developer Roadmap 2026 Complete PDF Guide',
    description: 'Downloadable high-resolution PDF roadmap detailing step-by-step learning milestones for Frontend, Backend, DevOps, and AI integrations.',
    category: 'PDFs & Research',
    format: 'PDFs',
    author: {
      name: 'Kamal Hossain',
      role: 'Principal Tech Lead',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.88,
    reviewCount: 2980,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#PDF', '#DeveloperRoadmap', '#FullStack', '#Guide'],
    durationOrPages: '32 Pages PDF',
    dateAdded: '2026-01-20',
    featured: true,
    contentUrl: 'https://roadmap.sh',
    keyTakeaways: [
      'Structured 6-month timeline for beginners and intermediate devs.',
      'Direct downloadable links to free interactive tutorials.',
      'Covers Git, JavaScript/TypeScript, SQL, Docker, and Cloud Run.'
    ]
  },
  {
    id: 'res-4',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    description: 'James Clear’s groundbreaking guide to personal productivity, behavior design, continuous improvement, and daily streaks.',
    category: 'Books & Literature',
    format: 'Books',
    author: {
      name: 'James Clear',
      role: 'Behavioral Scientist & Author',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.97,
    reviewCount: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#AtomicHabits', '#Productivity', '#BookSummary', '#SelfGrowth'],
    durationOrPages: '320 Pages',
    dateAdded: '2026-02-15',
    featured: true,
    contentUrl: 'https://jamesclear.com/atomic-habits',
    keyTakeaways: [
      '1% better every day leads to 37x growth over a year.',
      'Make good habits obvious, attractive, easy, and satisfying.',
      'Focus on systems and identity rather than raw goals alone.'
    ]
  },
  {
    id: 'res-5',
    title: 'Interactive Python Cheat Sheet & Code Reference PDF',
    description: 'Complete 5-page PDF cheat sheet covering Python syntax, Data Structures, Pandas, NumPy, and API requests with real-world examples.',
    category: 'Productivity & Tools',
    format: 'Tools',
    author: {
      name: 'Dr. Rafiqul Islam',
      role: 'Data Science Researcher',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.85,
    reviewCount: 1420,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#Python', '#CheatSheet', '#PDF', '#DataScience'],
    durationOrPages: '5 Page PDF Tool',
    dateAdded: '2026-02-28',
    featured: false,
    contentUrl: 'https://docs.python.org/3/',
    keyTakeaways: [
      'Quick lookup for list comprehensions, lambda functions, and dictionaries.',
      'Data manipulation patterns in Pandas and NumPy.',
      'REST API HTTP calls using requests library.'
    ]
  },
  {
    id: 'res-6',
    title: 'MIT OpenCourseWare: Physics I Mechanics Lecture Series',
    description: 'Free university lecture series from MIT covering Classical Mechanics, Newton’s Laws, Work-Energy Theorems, and Rotational Dynamics.',
    category: 'Education & Science',
    format: 'Videos',
    author: {
      name: 'Prof. Walter Lewin',
      role: 'MIT Physics Professor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.92,
    reviewCount: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#Physics', '#MIT', '#Education', '#Videos'],
    durationOrPages: '35 Lecture Videos',
    dateAdded: '2026-01-14',
    featured: false,
    contentUrl: 'https://ocw.mit.edu',
    keyTakeaways: [
      'Deep intuitive understanding of Newton’s laws and vector calculus.',
      'Demonstrations of physical phenomena and problem-solving techniques.'
    ]
  },
  {
    id: 'res-7',
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    description: 'Classic book offering practical advice for software craftsmanship, avoiding technical debt, career development, and problem solving.',
    category: 'Books & Literature',
    format: 'Books',
    author: {
      name: 'Andrew Hunt & David Thomas',
      role: 'Software Pioneers',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.91,
    reviewCount: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#Programming', '#PragmaticProgrammer', '#Books', '#Tech'],
    durationOrPages: '352 Pages',
    dateAdded: '2026-02-01',
    featured: false,
    contentUrl: 'https://pragprog.com',
    keyTakeaways: [
      'DRY Principle: Don’t Repeat Yourself.',
      'Orthogonality: Eliminate side effects between system modules.',
      'Invest regularly in your knowledge portfolio.'
    ]
  },
  {
    id: 'res-8',
    title: 'Google DeepMind Machine Learning & AI Research Paper Whitepaper',
    description: 'Open-access research paper analyzing breakthroughs in Gemini 3.0 multimodal reasoning, attention mechanisms, and real-time execution.',
    category: 'PDFs & Research',
    format: 'PDFs',
    author: {
      name: 'Google DeepMind Research',
      role: 'AI Scientists',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200'
    },
    rating: 4.96,
    reviewCount: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    hashtags: ['#DeepMind', '#AI', '#ResearchPaper', '#PDF'],
    durationOrPages: '45 Pages PDF',
    dateAdded: '2026-02-20',
    featured: true,
    contentUrl: 'https://arxiv.org',
    keyTakeaways: [
      'Detailed benchmark comparisons across multimodal tasks.',
      'Architecture diagrams and latency optimization strategies.'
    ]
  }
];

export const FEATURED_SPOTLIGHTS: KnowledgeSpotlight[] = [
  {
    id: 'spotlight-1',
    title: 'Full-Stack Developer Roadmap PDF 2026',
    subtitle: 'Free PDF Download & Interactive Checklist',
    category: 'PDFs & Research',
    tag: 'Popular PDF',
    description: 'Download the comprehensive step-by-step roadmap for mastering React, Next.js, Node.js, PostgreSQL, and AI API integrations.',
    actionableSteps: [
      'Review the core JavaScript & TypeScript concepts.',
      'Build 3 real-world full-stack projects.',
      'Master deployment on Cloud Run and Vercel.'
    ],
    durationMinutes: 15,
    iconName: 'FileText',
    badgeColor: 'bg-blue-500'
  },
  {
    id: 'spotlight-2',
    title: 'Atomic Habits Book Summary & Action Plan',
    subtitle: '10-Minute Executive Summary in Bengali & English',
    category: 'Books & Literature',
    tag: 'Bestseller Book',
    description: 'Learn how small 1% daily changes aggregate into massive personal transformation using James Clear’s proven framework.',
    actionableSteps: [
      'Identify your target identity before setting goals.',
      'Use habit stacking: pair a new habit with an existing routine.',
      'Never miss twice — protect your daily streaks.'
    ],
    durationMinutes: 10,
    iconName: 'BookOpen',
    badgeColor: 'bg-emerald-500'
  },
  {
    id: 'spotlight-3',
    title: 'Complete React & Next.js Video Course',
    subtitle: 'Free High-Quality Video Tutorial Series',
    category: 'Technology & AI',
    tag: 'Video Tutorial',
    description: 'Watch step-by-step video guides explaining React Server Components, state management with Zustand, and Tailwind styling.',
    actionableSteps: [
      'Set up a modern Vite or Next.js app template.',
      'Implement responsive Tailwind CSS layouts.',
      'Connect frontend UI with backend Express or Firebase APIs.'
    ],
    durationMinutes: 20,
    iconName: 'Video',
    badgeColor: 'bg-indigo-500'
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Read 20 pages of a Tech/Productivity Book',
    category: 'Books',
    progress: 70,
    totalModules: 10,
    completedModules: 7,
    streakDays: 5,
    deadlineDate: '2026-03-31'
  },
  {
    id: 'goal-2',
    title: 'Complete 1 Video Tutorial on React/Python',
    category: 'Technology',
    progress: 50,
    totalModules: 6,
    completedModules: 3,
    streakDays: 3,
    deadlineDate: '2026-03-25'
  },
  {
    id: 'goal-3',
    title: 'Summarize 1 Research Paper or PDF Guide',
    category: 'Career',
    progress: 80,
    totalModules: 5,
    completedModules: 4,
    streakDays: 7,
    deadlineDate: '2026-03-20'
  }
];

export const SUGGESTED_AI_PROMPTS = [
  {
    label: '📚 Atomic Habits Summary',
    prompt: 'Atomic Habits বইটির মূল সারসংক্ষেপ ও ৫টি কার্যকরী পয়েন্ট বাংলায় বুঝিয়ে বলো।'
  },
  {
    label: '📄 React 19 Roadmap PDF',
    prompt: '২০২৬ সালে রিঅ্যাক্ট ১৯ ও নেক্সট.জেএস শেখার সঠিক রোডম্যাপ ও লিঙ্ক বানিয়ে দাও।'
  },
  {
    label: '💻 Python Data Science Guide',
    prompt: 'পাইথন দিয়ে ডাটা সায়েন্স শেখার জন্য প্রয়োজনীয় লাইব্রেরি ও ফ্রি টিউটোরিয়াল গাইড দাও।'
  },
  {
    label: '💡 BCS Preparation Strategy',
    prompt: 'বিসিএস ও সরকারি চাকরির প্রস্তুতির জন্য সহজ ডেইলি রুটিন ও স্টাডি প্ল্যান তৈরি করে দাও।'
  }
];
export const TRENDING_SEARCHES = [
  'Clean Code PDF book',
  'Python cheat sheet PDF',
  'React Next.js video tutorial',
  'Atomic Habits book summary',
  'Quantum Computing PDF guide',
  'Data Science roadmap 2026',
  'Financial accounting guide',
  'UI/UX Design Figma links'
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New PDF Book Added: Full Stack AI Systems 2026',
    message: 'A brand-new 50-page PDF guide on building LLM applications has been added to the library.',
    category: 'Library Updates',
    timestamp: '10 mins ago',
    read: false,
    actionLabel: 'View Search'
  },
  {
    id: 'notif-2',
    title: 'Daily Reading Streak Milestone 🎉',
    message: 'Great job! You have maintained a 5-day continuous learning streak on Askio.',
    category: 'Goal Milestones',
    timestamp: '2 hours ago',
    read: false,
    actionLabel: 'Check Goals'
  }
];

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'search',
    title: 'Searched for "Full Stack Developer Roadmap PDF"',
    timestamp: 'Today, 10:15 AM'
  },
  {
    id: 'act-2',
    type: 'ai',
    title: 'Asked AI to summarize Clean Code book',
    timestamp: 'Yesterday, 4:30 PM'
  }
];
