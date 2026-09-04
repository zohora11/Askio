import { Resource, WellnessTip, Goal, NotificationItem, CategoryDomain, ActivityLogItem } from '../types';

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
    domain: 'Health',
    description: 'Vision care, wellness, preventive habits, and mental wellness.',
    iconName: 'HeartPulse',
    color: 'emerald',
    solutionsCount: '14,200+',
    guidesCount: '4,100+',
    badge: 'Popular',
  },
  {
    domain: 'Education',
    description: 'STEM fundamentals, study blueprints, and cognitive memory techniques.',
    iconName: 'GraduationCap',
    color: 'blue',
    solutionsCount: '18,500+',
    guidesCount: '6,200+',
    badge: 'Trending',
  },
  {
    domain: 'Career',
    description: 'Resume architecture, interview mastery, and leadership transition.',
    iconName: 'Briefcase',
    color: 'amber',
    solutionsCount: '11,300+',
    guidesCount: '3,800+',
    badge: 'High Impact',
  },
  {
    domain: 'Technology',
    description: 'AI tooling, full-stack systems, cloud architecture, and security.',
    iconName: 'Cpu',
    color: 'indigo',
    solutionsCount: '22,400+',
    guidesCount: '7,900+',
    badge: 'Hot',
  },
  {
    domain: 'Motivation',
    description: 'Morning momentum, resilience frameworks, and inner focus triggers.',
    iconName: 'Flame',
    color: 'rose',
    solutionsCount: '9,800+',
    guidesCount: '2,900+',
    badge: 'Daily',
  },
  {
    domain: 'Productivity',
    description: 'Timeboxing, deep work cycles, Notion workflows, and cognitive energy.',
    iconName: 'Clock',
    color: 'cyan',
    solutionsCount: '15,600+',
    guidesCount: '5,100+',
    badge: 'Essential',
  },
  {
    domain: 'Self Improvement',
    description: 'Habit loops, emotional intelligence, journaling, and self-mastery.',
    iconName: 'Sparkles',
    color: 'purple',
    solutionsCount: '13,700+',
    guidesCount: '4,400+',
    badge: 'Transformative',
  },
  {
    domain: 'Finance',
    description: 'Budgeting, intelligent investments, tax literacy, and crypto safety.',
    iconName: 'TrendingUp',
    color: 'teal',
    solutionsCount: '10,900+',
    guidesCount: '3,200+',
    badge: 'Strategic',
  },
  {
    domain: 'Lifestyle',
    description: 'Ergonomic living, minimalist workspaces, slow living, and travel.',
    iconName: 'Compass',
    color: 'orange',
    solutionsCount: '8,400+',
    guidesCount: '2,600+',
    badge: 'Fresh',
  },
  {
    domain: 'Communication',
    description: 'Persuasive speaking, active listening, negotiation, and storytelling.',
    iconName: 'MessageSquare',
    color: 'violet',
    solutionsCount: '12,100+',
    guidesCount: '3,950+',
    badge: 'Core Skill',
  },
];

export const WELLNESS_TIPS: WellnessTip[] = [
  {
    id: 'tip-1',
    title: 'The 20-20-20 Rule for Digital Eye Strain',
    subtitle: 'Relieve ocular fatigue from screens in 20 seconds',
    category: 'Eye Care',
    tag: 'Vision Health',
    description: 'Every 20 minutes spent looking at a digital screen, look at an object at least 20 feet away for a full 20 seconds. This relaxes your ciliary eye muscles, reducing spasms, headaches, and dry eye syndromes.',
    actionableSteps: [
      'Set an hourly timer or reminder on your workspace toolbar.',
      'Shift gaze to a distant tree, horizon, or distant wall point.',
      'Blink deliberately 10 times to re-coat tear film across your corneas.',
      'Massage your temples gently with two fingers.'
    ],
    durationMinutes: 1,
    iconName: 'Eye',
    badgeColor: 'blue'
  },
  {
    id: 'tip-2',
    title: 'Hydration & Micro-Electrolytes',
    subtitle: 'Re-energize cellular cognitive speed with consistent water intake',
    category: 'Hydration',
    tag: 'Energy',
    description: 'Even a 1.5% drop in body water triggers brain fog and increases fatigue. Keep a 750ml glass carafe at your desk and sip regularly rather than chugging in bulk.',
    actionableSteps: [
      'Drink 300ml of room-temperature water upon waking before caffeine.',
      'Add a pinch of Himalayan pink salt or lemon slice for mineral absorption.',
      'Maintain an intake goal of 2.5 - 3 Liters daily.'
    ],
    durationMinutes: 2,
    iconName: 'Droplets',
    badgeColor: 'teal'
  },
  {
    id: 'tip-3',
    title: 'Regular Exercise & Desk Decompression',
    subtitle: 'Restore spinal alignment and boost endorphin circulation',
    category: 'Fitness',
    tag: 'Mobility',
    description: 'Sedentary work compresses the lumbar spine and reduces hip mobility. Engaging in micro-stretches and brisk walking resets neuromuscular posture.',
    actionableSteps: [
      'Perform 10 desk push-ups or wall slides every 90 minutes.',
      'Stand during phone consultations and audio sync meetings.',
      'Incorporate 30 minutes of moderate cardiovascular movement daily.'
    ],
    durationMinutes: 15,
    iconName: 'Activity',
    badgeColor: 'emerald'
  },
  {
    id: 'tip-4',
    title: 'Circadian Sleep Hygiene',
    subtitle: 'Shield melatonin production for deep restorative delta sleep',
    category: 'Sleep',
    tag: 'Recovery',
    description: 'Blue photon emissions after 9 PM suppress pineal gland melatonin synthesis by up to 50%. A dark, cool bedroom fosters uninterrupted REM phases.',
    actionableSteps: [
      'Dim ambient lights 90 minutes prior to intended sleep time.',
      'Keep room temperature around 18-20°C (65-68°F).',
      'No digital backlit screens in bed; replace with paper books or ambient audio.'
    ],
    durationMinutes: 30,
    iconName: 'Moon',
    badgeColor: 'indigo'
  },
  {
    id: 'tip-5',
    title: 'Mindfulness & Diaphragmatic Breathing',
    subtitle: 'Down-regulate sympathetic nervous system in 3 minutes',
    category: 'Mindfulness',
    tag: 'Mental Clarity',
    description: 'Box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) lowers cortisol, stabilizes heart rate variability (HRV), and enhances executive decision-making.',
    actionableSteps: [
      'Sit upright with feet grounded and hands relaxed on thighs.',
      'Inhale deeply through your nostrils into your belly for 4 counts.',
      'Hold breath gently for 4 counts without straining.',
      'Exhale slowly through parted lips for 4 counts; repeat 5 cycles.'
    ],
    durationMinutes: 5,
    iconName: 'Smile',
    badgeColor: 'purple'
  },
  {
    id: 'tip-6',
    title: 'Balanced Nutrient-Dense Diet',
    subtitle: 'Fuel steady dopamine and sustained glucose levels',
    category: 'Nutrition',
    tag: 'Vitality',
    description: 'High-glycemic meals cause glucose spikes followed by reactive hypoglycemia and afternoon drowsiness. Pair quality complex carbohydrates with lean proteins and healthy omega fats.',
    actionableSteps: [
      'Fill half your plate with colorful fibrous vegetables and dark greens.',
      'Include walnuts, chia seeds, or wild salmon for omega-3 brain nourishment.',
      'Avoid sugary sodas and packaged pastries during working hours.'
    ],
    durationMinutes: 20,
    iconName: 'Apple',
    badgeColor: 'rose'
  },
  {
    id: 'tip-7',
    title: 'Intentional Morning Routine',
    subtitle: 'Anchor your day with proactive clarity instead of reactive alerts',
    category: 'Routine',
    tag: 'Focus',
    description: 'Checking email or social feeds within 10 minutes of waking triggers elevated cortisol and fractures your day into fragmented reactivity. Claim your first hour.',
    actionableSteps: [
      'Delay phone inspection until after hygiene, hydration, and natural sunlight.',
      'Expose eyes to natural indirect sunlight for 10 minutes to sync circadian clocks.',
      'Jot down your single non-negotiable priority for the day.'
    ],
    durationMinutes: 10,
    iconName: 'Sun',
    badgeColor: 'amber'
  },
  {
    id: 'tip-8',
    title: 'Nurturing Social Connection',
    subtitle: 'Combat remote isolation with meaningful reciprocal dialogue',
    category: 'Social',
    tag: 'Community',
    description: 'Human neurobiology requires genuine voice or face-to-face rapport to sustain oxytocin and trust. Loneliness carries health risks comparable to chronic smoking.',
    actionableSteps: [
      'Send one unprompted message of appreciation or check-in to a peer daily.',
      'Engage in shared lunches or brief walks with family or colleagues.',
      'Participate actively in local or community learning circles.'
    ],
    durationMinutes: 15,
    iconName: 'Users',
    badgeColor: 'cyan'
  },
  {
    id: 'tip-9',
    title: 'Cognitive Stress Management',
    subtitle: 'Reframe cognitive stressors through structured compartmentalization',
    category: 'Stress',
    tag: 'Resilience',
    description: 'Unresolved thoughts consume working memory. Performing a "brain dump" into writing transitions intrusive rumination into objective, manageable items.',
    actionableSteps: [
      'Write down whatever is causing anxiety on paper without self-editing.',
      'Categorize into "Directly in my control" vs "Outside my control".',
      'Discard or mentally release the external factors and define 1 micro-step for the controllable items.'
    ],
    durationMinutes: 10,
    iconName: 'ShieldAlert',
    badgeColor: 'orange'
  },
  {
    id: 'tip-10',
    title: 'Smart Energy Snacking',
    subtitle: 'Overcome afternoon brain slumps without caffeine crashes',
    category: 'Snacks',
    tag: 'Nutrition',
    description: 'Refined sugar snacks offer 20 minutes of euphoria followed by 2 hours of lethargy. Choose slow-burning fats and polyphenol-dense whole foods.',
    actionableSteps: [
      'Stock almonds, roasted chickpeas, or pumpkin seeds at your workstation.',
      'Pair dark chocolate (85%+) with green tea for antioxidant L-theanine synergy.',
      'Eat snacks mindfully away from keyboards to register satiety signals.'
    ],
    durationMinutes: 5,
    iconName: 'Cookie',
    badgeColor: 'violet'
  }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'Clinical Guide to Digital Eye Strain & Modern Visual Ergonomics',
    description: 'A comprehensive handbook designed for knowledge workers, developers, and researchers. Explores ciliary muscle mechanics, optimal blue light exposure, monitor focal distance calibration, and verified exercises to reverse visual fatigue and chronic dry eye.',
    category: 'Health',
    format: 'Guides',
    author: {
      name: 'Dr. Sarah Lin, MD',
      role: 'Ophthalmologist & Vision Scientist',
      avatar: 'https://images.unsplash.com/photo-1594824813581-2292f7415496?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 1240,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#EyeHealth', '#Ergonomics', '#VisionCare', '#Wellness'],
    durationOrPages: '42 pages',
    dateAdded: '2026-08-15',
    featured: true,
    keyTakeaways: [
      'The 20-20-20 rule reduces ciliary spasm by up to 68%.',
      'Screen top-edge must align directly with eyebrow line at arm length.',
      'Tear film lipid evaporation increases 3x in air-conditioned office environments.'
    ]
  },
  {
    id: 'res-2',
    title: 'The Deep Focus Architecture: How Top Engineers Outperform Distraction',
    description: 'Master time-boxing, asynchronous workflow protocols, and neurotransmitter management to reach 4+ hours of uninterrupted flow state daily. Includes printable daily planning canvases.',
    category: 'Productivity',
    format: 'Books',
    author: {
      name: 'Elena Rostova',
      role: 'Cognitive Workflow Strategist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.8,
    reviewCount: 2150,
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#DeepWork', '#Productivity', '#TimeManagement', '#Focus'],
    durationOrPages: '210 pages',
    dateAdded: '2026-07-20',
    featured: true,
    keyTakeaways: [
      'Multitasking introduces 23 minutes of attention residue per interruption.',
      'Bimodal scheduling produces the highest volume of high-value cognitive output.',
      'Daily shutdown rituals prevent work anxiety from leaking into evening recovery.'
    ]
  },
  {
    id: 'res-3',
    title: 'Full-Stack Agentic AI Systems with Next.js & TypeScript',
    description: 'Deep dive masterclass on deploying autonomous AI agent loops, tool-calling pipelines, vector embeddings, and real-time streaming architectures with production reliability.',
    category: 'Technology',
    format: 'Videos',
    author: {
      name: 'Marcus Vance',
      role: 'Principal AI Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 3400,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#AI', '#TypeScript', '#Nextjs', '#Architecture'],
    durationOrPages: '3h 45m',
    dateAdded: '2026-08-28',
    featured: true,
    keyTakeaways: [
      'Structured schema validation guarantees dependable AI JSON outputs.',
      'Agent loops need deterministic fallback trees to prevent infinite execution traps.',
      'Server-side credential segregation protects API keys from browser inspection.'
    ]
  },
  {
    id: 'res-4',
    title: 'Executive Communication: The Art of Concise High-Stakes Persuasion',
    description: 'Learn the Minto Pyramid Principle, executive memo drafting, and vocal cadence techniques that command respect in boardroom pitches and team alignments.',
    category: 'Communication',
    format: 'Talks',
    author: {
      name: 'David Chen',
      role: 'Former VP of Strategy, Keynote Speaker',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.7,
    reviewCount: 890,
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#Leadership', '#PublicSpeaking', '#Negotiation'],
    durationOrPages: '52 min',
    dateAdded: '2026-08-01',
    keyTakeaways: [
      'State conclusions and recommendations in the first 30 seconds of any briefing.',
      'Limit supporting arguments to rule of three for optimal cognitive retention.'
    ]
  },
  {
    id: 'res-5',
    title: '60-Second Ocular Acupressure: Instant Vision Relief',
    description: 'Quick vertical reel showing the exact acupressure points around the orbital bone to stimulate blood flow and relieve tension headaches from screen work.',
    category: 'Health',
    format: 'Reels',
    author: {
      name: 'Dr. Tariq Hasan',
      role: 'Holistic Physiotherapist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f41444983a4?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#EyeCare', '#Reel', '#QuickFix', '#HeadacheRelief'],
    durationOrPages: '58 sec',
    dateAdded: '2026-09-01',
    keyTakeaways: [
      'Press the Jingming point (inner corner of eyes) gently for 10 seconds.',
      'Glide index finger over the supraorbital notch to release forehead pressure.'
    ]
  },
  {
    id: 'res-6',
    title: 'Financial Independence Playbook: From Salary to Compounding Portfolio',
    description: 'A comprehensive, math-backed PDF manual on tax-advantaged index funds, risk-adjusted asset allocation, inflation hedging, and automated savings ladders.',
    category: 'Finance',
    format: 'PDFs',
    author: {
      name: 'Amina Chowdhury, CFA',
      role: 'Portfolio Strategist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.8,
    reviewCount: 1480,
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#Investing', '#Finance', '#WealthBuilding', '#Budgeting'],
    durationOrPages: '64 pages',
    dateAdded: '2026-07-11',
    keyTakeaways: [
      'Automate investment transfers on the exact day compensation arrives.',
      'Low-cost global broad-market indices beat 92% of actively managed funds over 15 years.'
    ]
  },
  {
    id: 'res-7',
    title: 'Mastering Difficult Salary & Promotion Negotiations in Tech',
    description: 'Field-tested scripts, counter-offer tactics, and equity compensation breakdowns to maximize your compensation package while preserving executive relationships.',
    category: 'Career',
    format: 'Articles',
    author: {
      name: 'Jordan Belfort-Smyth',
      role: 'Tech Career Coach & Recruiter',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.8,
    reviewCount: 970,
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#CareerGrowth', '#SalaryNegotiation', '#Leadership'],
    durationOrPages: '12 min read',
    dateAdded: '2026-08-14'
  },
  {
    id: 'res-8',
    title: 'Atomic Dopamine: Resetting Motivation When You Feel Burned Out',
    description: 'Explores neurochemical exhaustion, dopamine receptor downregulation, and a 48-hour stimulus fast to rekindle natural drive and curiosity.',
    category: 'Motivation',
    format: 'Videos',
    author: {
      name: 'Dr. Kevin Miller',
      role: 'Neurobiology Researcher',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#Dopamine', '#MentalHealth', '#BurnoutRecovery'],
    durationOrPages: '24 min',
    dateAdded: '2026-08-22'
  },
  {
    id: 'res-9',
    title: 'The Super-Learner Protocol: How to Absorb Complex Subjects 3x Faster',
    description: 'Utilize Feynman technique, spaced repetition Anki architectures, and progressive cognitive summarization to absorb dense technical domains.',
    category: 'Education',
    format: 'Guides',
    author: {
      name: 'Prof. Anika Sharma',
      role: 'Cognitive Science Lecturer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 1820,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#Learning', '#Memory', '#FeynmanTechnique'],
    durationOrPages: '28 pages',
    dateAdded: '2026-08-30'
  },
  {
    id: 'res-10',
    title: 'Minimalist Workspaces: Engineering Environments for Frictionless Thought',
    description: 'Transform your physical desk, cable management, lighting lux levels, and auditory cues into a serene sanctuary for high-leverage intellectual work.',
    category: 'Lifestyle',
    format: 'Articles',
    author: {
      name: 'Kenji Sato',
      role: 'Industrial Designer',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.6,
    reviewCount: 650,
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#DeskSetup', '#Minimalism', '#Workspace'],
    durationOrPages: '9 min read',
    dateAdded: '2026-07-28'
  },
  {
    id: 'res-11',
    title: 'The Emotional Intelligence Edge: Navigating Team Friction with Grace',
    description: 'A deep psychological breakdown of conflict resolution, active empathy, non-violent communication, and managing corporate power dynamics.',
    category: 'Self Improvement',
    format: 'Books',
    author: {
      name: 'Rachel Goldberg, PhD',
      role: 'Organizational Psychologist',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.8,
    reviewCount: 1120,
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#EQ', '#SelfGrowth', '#ConflictResolution'],
    durationOrPages: '190 pages',
    dateAdded: '2026-08-04'
  },
  {
    id: 'res-12',
    title: 'Quick 2-Minute Desk Stretch for Stiff Neck & Trapezius Relief',
    description: 'Follow-along vertical clip demonstrating chin tucks, levator scapulae release, and postural alignment to undo 8 hours of laptop hunched posture.',
    category: 'Health',
    format: 'Reels',
    author: {
      name: 'Dr. Tariq Hasan',
      role: 'Holistic Physiotherapist',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
    },
    rating: 4.9,
    reviewCount: 6400,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    hashtags: ['#PosturalHealth', '#DeskMobility', '#NeckPain'],
    durationOrPages: '1m 45s',
    dateAdded: '2026-09-02'
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Digital Eye Health & Visual Ergonomics Mastery',
    category: 'Health',
    progress: 75,
    totalModules: 8,
    completedModules: 6,
    streakDays: 7,
    deadlineDate: 'Sep 15, 2026'
  },
  {
    id: 'goal-2',
    title: 'Next.js & Agentic AI Architecture Blueprint',
    category: 'Technology',
    progress: 45,
    totalModules: 12,
    completedModules: 5,
    streakDays: 4,
    deadlineDate: 'Sep 30, 2026'
  },
  {
    id: 'goal-3',
    title: 'Executive Communication & Presentation Cadence',
    category: 'Career',
    progress: 90,
    totalModules: 10,
    completedModules: 9,
    streakDays: 12,
    deadlineDate: 'Sep 10, 2026'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Health Guide: Digital Eye Strain',
    message: 'Dr. Sarah Lin published a 42-page blueprint on ciliary ergonomics and blue-light moderation.',
    category: 'Recommendations',
    timestamp: '10 mins ago',
    read: false,
    actionLabel: 'Read Guide',
    relatedResourceId: 'res-1'
  },
  {
    id: 'notif-2',
    title: 'Milestone Reached! 🔥 7-Day Streak',
    message: 'You have consistently logged daily eye exercises and wellness checkpoints for 7 consecutive days!',
    category: 'Goal Milestones',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Midday Wellness Checkpoint',
    message: 'Time for your 20-20-20 rule! Look 20 feet away for 20 seconds to refresh your retinal receptors.',
    category: 'Wellness',
    timestamp: '5 hours ago',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Library Sync Complete',
    message: 'All bookmarked guides and offline PDF collections have been synchronized with your account cloud.',
    category: 'Library Updates',
    timestamp: '1 day ago',
    read: true
  }
];

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'search',
    title: 'Searched for "Digital Eye Strain and 20-20-20 rule"',
    timestamp: 'Today at 08:30 AM',
    category: 'Health'
  },
  {
    id: 'act-2',
    type: 'bookmark',
    title: 'Bookmarked "Clinical Guide to Digital Eye Strain"',
    timestamp: 'Today at 08:35 AM',
    category: 'Health'
  },
  {
    id: 'act-3',
    type: 'ai',
    title: 'Consulted Askio AI Assistant regarding eye fatigue exercises',
    timestamp: 'Yesterday at 04:15 PM',
    category: 'AI Guidance'
  },
  {
    id: 'act-4',
    type: 'goal',
    title: 'Advanced Module 6 in "Digital Eye Health Mastery"',
    timestamp: 'Yesterday at 02:00 PM',
    category: 'Goals'
  },
  {
    id: 'act-5',
    type: 'view',
    title: 'Viewed "Full-Stack Agentic AI Systems with Next.js"',
    timestamp: '2 days ago',
    category: 'Technology'
  }
];

export const TRENDING_SEARCHES = [
  'Eye exercises for screen fatigue',
  'Find vision specialist near me',
  'Book vision guide',
  'Deep focus timeboxing canvas',
  'TypeScript Agentic AI',
  'Emergency health hotline 16263',
  'Stress management box breathing',
  'Salary negotiation scripts'
];

export const SUGGESTED_AI_PROMPTS = [
  {
    label: 'Eye exercises',
    prompt: 'Can you guide me through a 2-minute step-by-step eye exercise routine to relieve screen strain right now?'
  },
  {
    label: 'Find a specialist',
    prompt: 'How do I choose between an optometrist, ophthalmologist, or vision therapist for sudden eye strain?'
  },
  {
    label: 'Book a vision guide',
    prompt: 'I want to schedule a structured consultation and create a personalized 14-day vision wellness guide.'
  },
  {
    label: 'Stress relief (5-min)',
    prompt: 'Teach me the physiological sigh and box breathing method to eliminate immediate work anxiety.'
  },
  {
    label: 'Deep study blueprint',
    prompt: 'How can I apply the Feynman technique and spaced repetition to master dense technical documentation?'
  }
];
