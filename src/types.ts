export type FormatType = 'All' | 'Books' | 'PDFs' | 'Videos' | 'Links' | 'Articles' | 'Tools' | 'Talks';

export type CategoryDomain = 
  | 'Books & Literature'
  | 'PDFs & Research'
  | 'Technology & AI'
  | 'Education & Science'
  | 'Business & Career'
  | 'Productivity & Tools'
  | 'Creative & Design'
  | 'Finance & Economics'
  | 'General Knowledge'
  | 'Self Growth';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: CategoryDomain;
  format: Exclude<FormatType, 'All'>;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  rating: number;
  reviewCount: number;
  imageUrl: string;
  hashtags: string[];
  durationOrPages: string;
  dateAdded: string;
  featured?: boolean;
  contentUrl?: string;
  keyTakeaways?: string[];
}

export interface KnowledgeSpotlight {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tag: string;
  description: string;
  actionableSteps: string[];
  durationMinutes: number;
  iconName: string;
  badgeColor: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Technology' | 'Books' | 'Career' | 'Productivity';
  progress: number; // 0 - 100
  totalModules: number;
  completedModules: number;
  streakDays: number;
  deadlineDate: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'search' | 'bookmark' | 'view' | 'goal' | 'ai';
  title: string;
  timestamp: string;
  category?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Recommendations' | 'Goal Milestones' | 'Wellness' | 'Library Updates';
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  relatedResourceId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextResource?: {
    id: string;
    title: string;
    category: string;
  };
}

export interface UserProfile {
  uid?: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  avatar: string;
  isLoggedIn: boolean;
  isPremium: boolean;
  membershipPlan?: string;
  joinedDate: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'bn';
