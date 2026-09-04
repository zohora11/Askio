import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Resource, 
  Goal, 
  NotificationItem, 
  UserProfile, 
  ChatMessage, 
  ActivityLogItem, 
  ThemeMode, 
  AppLanguage,
  FormatType 
} from '../types';
import { 
  MOCK_RESOURCES, 
  INITIAL_GOALS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITIES, 
  TRENDING_SEARCHES 
} from '../data/mockData';

interface UndoState {
  item: NotificationItem;
  index: number;
}

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // User & Auth
  user: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  loginWithPhone: (phone: string) => void;
  verifyOtp: (otp: string) => boolean;
  loginWithEmail: (email: string, pass: string) => boolean;
  registerUser: (name: string, email: string, phone: string, pass: string) => boolean;
  logout: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authView: 'login' | 'phone' | 'otp' | 'register';
  setAuthView: (view: 'login' | 'phone' | 'otp' | 'register') => void;
  pendingPhone: string;
  
  // Library & Bookmarks
  bookmarkedIds: string[];
  toggleBookmark: (resourceId: string) => void;
  isBookmarked: (resourceId: string) => boolean;
  recentlyViewedIds: string[];
  addToRecentlyViewed: (resourceId: string) => void;
  clearRecentlyViewed: () => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFormat: FormatType;
  setSelectedFormat: (format: FormatType) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Detail Modal
  selectedResource: Resource | null;
  setSelectedResource: (resource: Resource | null) => void;
  openResourceDetail: (resource: Resource) => void;
  
  // AI Guidance Engine
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, contextResource?: Resource) => void;
  clearChatHistory: () => void;
  isAiGenerating: boolean;
  askAiAboutResource: (resource: Resource) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  incrementGoalProgress: (goalId: string) => void;
  deleteGoal: (goalId: string) => void;
  
  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markAllNotificationsUnread: () => void;
  deleteNotification: (id: string) => void;
  undoNotificationDelete: () => void;
  canUndoNotification: boolean;
  
  // Activity Stats
  activities: ActivityLogItem[];
  addActivity: (type: ActivityLogItem['type'], title: string, category?: string) => void;
  
  // Settings & Preferences
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activityTrackingEnabled: boolean;
  setActivityTrackingEnabled: (enabled: boolean) => void;
  analyticsConsent: boolean;
  setAnalyticsConsent: (enabled: boolean) => void;
  
  // Subscription
  isSubscriptionModalOpen: boolean;
  setSubscriptionModalOpen: (open: boolean) => void;
  upgradeToPremium: () => void;
  cancelPremium: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('askio_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return {
          ...parsed,
          isLoggedIn: parsed.isLoggedIn ?? false
        };
      } catch (e) { /* ignore */ }
    }
    // Check if BDApps session exists for returning subscriber
    const sessionRaw = localStorage.getItem('askio_bdapps_session');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session && session.subscribed && session.mobileNumber) {
          return {
            fullName: 'Subscriber User',
            email: 'user@askio.ai',
            phone: session.mobileNumber,
            password: '',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            isLoggedIn: true,
            isPremium: true,
            membershipPlan: 'Daily Micro (৳2.78/day)',
            joinedDate: 'September 2026'
          };
        }
      } catch (e) { /* ignore */ }
    }
    // Default for new users on a fresh device: not logged in so they see the Landing Page first!
    return {
      fullName: 'Fatema Tuz Zohora',
      email: 'fatematuzzohora004@gmail.com',
      phone: '01812345678',
      password: 'password123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isLoggedIn: false,
      isPremium: true,
      membershipPlan: 'Daily Micro (৳2.78/day)',
      joinedDate: 'August 2026'
    };
  });

  useEffect(() => {
    localStorage.setItem('askio_user', JSON.stringify(user));
  }, [user]);

  // Auth modal state
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'phone' | 'otp' | 'register'>('login');
  const [pendingPhone, setPendingPhone] = useState<string>('+880 ');

  // Bookmarks & History
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('askio_bookmarks');
    return saved ? JSON.parse(saved) : ['res-1', 'res-3'];
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('askio_history');
    return saved ? JSON.parse(saved) : ['res-1', 'res-2', 'res-5'];
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('All');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('askio_recent_searches');
    return saved ? JSON.parse(saved) : ['Eye exercises for screen fatigue', '20-20-20 rule', 'TypeScript Agentic AI'];
  });

  // Detail Modal
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // AI Guidance Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello Fatema! 👋 I am Askio AI, your personal guidance engine. How can I support your eye care, learning, or career growth today?',
      timestamp: 'Just now'
    }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Goals
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('askio_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('askio_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [undoDelete, setUndoDelete] = useState<UndoState | null>(null);

  // Activities
  const [activities, setActivities] = useState<ActivityLogItem[]>(() => {
    const saved = localStorage.getItem('askio_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Preferences - Default to dark mode, supports dark, light, and system
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('askio_theme') as ThemeMode;
    return saved || 'dark';
  });
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('askio_language') as AppLanguage;
    return saved || 'en';
  });
  const [activityTrackingEnabled, setActivityTrackingEnabled] = useState<boolean>(true);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);

  // Subscription Modal
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('askio_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem('askio_history', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  useEffect(() => {
    localStorage.setItem('askio_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem('askio_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('askio_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('askio_activities', JSON.stringify(activities));
  }, [activities]);

  // Apply Theme with system preference listener
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyCurrentTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // 'system' mode: follow system preferences
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyCurrentTheme();
    localStorage.setItem('askio_theme', theme);

    // Listen for system theme changes if theme is set to 'system'
    const handleChange = () => {
      if (theme === 'system') {
        applyCurrentTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (t: ThemeMode) => setThemeState(t);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('askio_language', lang);
  };

  const addActivity = (type: ActivityLogItem['type'], title: string, category?: string) => {
    if (!activityTrackingEnabled) return;
    const newItem: ActivityLogItem = {
      id: 'act-' + Date.now(),
      type,
      title,
      timestamp: 'Just now',
      category
    };
    setActivities(prev => [newItem, ...prev.slice(0, 49)]);
  };

  // User Profile
  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updated }));
    addActivity('bookmark', `Updated profile information`);
  };

  const loginWithPhone = (phone: string) => {
    setPendingPhone(phone);
    setAuthView('otp');
  };

  const verifyOtp = (otp: string): boolean => {
    if (otp.length >= 4) {
      setUser(prev => ({
        ...prev,
        isLoggedIn: true,
        phone: pendingPhone
      }));
      setAuthModalOpen(false);
      addActivity('search', `Signed in via Phone verification (${pendingPhone})`);
      return true;
    }
    return false;
  };

  const loginWithEmail = (email: string, _pass: string): boolean => {
    setUser(prev => ({
      ...prev,
      email,
      isLoggedIn: true
    }));
    setAuthModalOpen(false);
    addActivity('search', `Signed in with Email: ${email}`);
    return true;
  };

  const registerUser = (name: string, email: string, phone: string, pass: string): boolean => {
    setUser({
      fullName: name,
      email,
      phone,
      password: pass,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isLoggedIn: true,
      isPremium: false,
      membershipPlan: 'Free Tier',
      joinedDate: 'September 2026'
    });
    setAuthModalOpen(false);
    addActivity('search', `Registered new account: ${name}`);
    return true;
  };

  const logout = () => {
    setUser(prev => {
      const updated = { ...prev, isLoggedIn: false };
      localStorage.setItem('askio_user', JSON.stringify(updated));
      return updated;
    });
    setActiveTab('home');
    addActivity('bookmark', 'Logged out of Askio');
  };

  // Bookmarks
  const toggleBookmark = (resourceId: string) => {
    const res = MOCK_RESOURCES.find(r => r.id === resourceId);
    setBookmarkedIds(prev => {
      const exists = prev.includes(resourceId);
      if (exists) {
        addActivity('bookmark', `Removed bookmark: "${res?.title || 'Resource'}"`);
        return prev.filter(id => id !== resourceId);
      } else {
        addActivity('bookmark', `Bookmarked: "${res?.title || 'Resource'}"`, res?.category);
        return [...prev, resourceId];
      }
    });
  };

  const isBookmarked = (resourceId: string) => bookmarkedIds.includes(resourceId);

  // History
  const addToRecentlyViewed = (resourceId: string) => {
    const res = MOCK_RESOURCES.find(r => r.id === resourceId);
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== resourceId);
      return [resourceId, ...filtered.slice(0, 30)];
    });
    if (res) {
      addActivity('view', `Viewed "${res.title}"`, res.category);
    }
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
  };

  const openResourceDetail = (resource: Resource) => {
    setSelectedResource(resource);
    addToRecentlyViewed(resource.id);
  };

  // Search History
  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== clean.toLowerCase());
      return [clean, ...filtered.slice(0, 9)];
    });
    addActivity('search', `Searched for "${clean}"`);
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches(prev => prev.filter(q => q !== query));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // AI Chat Guidance
  const sendChatMessage = async (text: string, contextResource?: Resource) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
      contextResource: contextResource ? {
        id: contextResource.id,
        title: contextResource.title,
        category: contextResource.category
      } : undefined
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsAiGenerating(true);
    addActivity('ai', `Asked Askio AI: "${text.substring(0, 35)}..."`);

    try {
      // Collect recent conversation history for multi-turn context
      const history = chatMessages
        .filter(m => m.id !== 'msg-init')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: text.trim(),
          history,
          contextResource: contextResource ? {
            id: contextResource.id,
            title: contextResource.title,
            category: contextResource.category,
            format: contextResource.format,
            description: contextResource.description,
            author: contextResource.author
          } : undefined
        })
      });

      const contentType = response.headers.get('content-type') || '';
      let reply = '';

      if (!response.ok) {
        let errorMsg = language === 'bn' 
          ? `সার্ভার সংযোগে ত্রুটি (${response.status})` 
          : `Server error (${response.status})`;
        if (contentType.includes('application/json')) {
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch {
            // ignore
          }
        } else {
          const textErr = await response.text().catch(() => '');
          if (textErr && !textErr.includes('<!DOCTYPE') && !textErr.includes('<html')) {
            errorMsg = textErr.slice(0, 100);
          }
        }
        throw new Error(errorMsg);
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        reply = data.reply || '';
      } else {
        const rawText = await response.text();
        try {
          const parsed = JSON.parse(rawText);
          reply = parsed.reply || '';
        } catch {
          if (rawText && !rawText.includes('<!DOCTYPE') && !rawText.includes('<html')) {
            reply = rawText.trim();
          } else {
            reply = language === 'bn'
              ? 'আমি আপনার বার্তাটি পেয়েছি। অনুগ্রহ করে আপনার প্রশ্নটি আবার পাঠান।'
              : 'I received your inquiry. Please try sending your message again.';
          }
        }
      }

      const aiReply = reply || (language === 'bn'
        ? 'আমি আপনার বার্তাটি পেয়েছি। অনুগ্রহ করে প্রশ্নটি পুনরায় করুন।'
        : 'I received your question. Please try asking again.');

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiReply,
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI generation error:", err);
      let userFriendlyMessage = language === 'bn'
        ? 'এআই সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার পাঠান।'
        : 'Unable to connect to the Askio AI engine right now. Please check your connection and try again.';

      if (err?.message && !err.message.includes('JSON.parse') && !err.message.includes('unexpected character')) {
        userFriendlyMessage = err.message;
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: `⚠️ **Askio AI Notice**: ${userFriendlyMessage}`,
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const askAiAboutResource = (resource: Resource) => {
    setSelectedResource(null);
    setActiveTab('ai');
    sendChatMessage(`Could you analyze this resource and summarize key takeaways for me?`, resource);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'msg-init-reset',
        sender: 'ai',
        text: 'Chat history cleared. How can I assist your learning today?',
        timestamp: 'Just now'
      }
    ]);
  };

  // Goals
  const addGoal = (newGoalData: Omit<Goal, 'id'>) => {
    const created: Goal = {
      ...newGoalData,
      id: 'goal-' + Date.now()
    };
    setGoals(prev => [created, ...prev]);
    addActivity('goal', `Created goal: "${created.title}"`, created.category);
  };

  const incrementGoalProgress = (goalId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextCompleted = Math.min(g.totalModules, g.completedModules + 1);
        const nextProgress = Math.round((nextCompleted / g.totalModules) * 100);
        addActivity('goal', `Completed module in "${g.title}" (${nextProgress}%)`);
        return {
          ...g,
          completedModules: nextCompleted,
          progress: nextProgress,
          streakDays: g.streakDays + 1
        };
      }
      return g;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // Notifications
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAllNotificationsUnread = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: false })));
  };

  const deleteNotification = (id: string) => {
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      setUndoDelete({ item: notifications[idx], index: idx });
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const undoNotificationDelete = () => {
    if (undoDelete) {
      setNotifications(prev => {
        const copy = [...prev];
        copy.splice(undoDelete.index, 0, undoDelete.item);
        return copy;
      });
      setUndoDelete(null);
    }
  };

  // Subscription
  const upgradeToPremium = () => {
    setUser(prev => ({
      ...prev,
      isPremium: true,
      membershipPlan: 'Daily Micro (৳2/day)'
    }));
    setSubscriptionModalOpen(false);
    addActivity('bookmark', `Subscribed to Askio Premium Daily Micro plan (৳2/day)`);
  };

  const cancelPremium = () => {
    setUser(prev => ({
      ...prev,
      isPremium: false,
      membershipPlan: 'Free Tier'
    }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        updateProfile,
        loginWithPhone,
        verifyOtp,
        loginWithEmail,
        registerUser,
        logout,
        isAuthModalOpen,
        setAuthModalOpen,
        authView,
        setAuthView,
        pendingPhone,
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
        recentlyViewedIds,
        addToRecentlyViewed,
        clearRecentlyViewed,
        searchQuery,
        setSearchQuery,
        selectedFormat,
        setSelectedFormat,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        selectedResource,
        setSelectedResource,
        openResourceDetail,
        chatMessages,
        sendChatMessage,
        clearChatHistory,
        isAiGenerating,
        askAiAboutResource,
        goals,
        addGoal,
        incrementGoalProgress,
        deleteGoal,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsRead,
        markAllNotificationsUnread,
        deleteNotification,
        undoNotificationDelete,
        canUndoNotification: undoDelete !== null,
        activities,
        addActivity,
        theme,
        setTheme,
        language,
        setLanguage,
        activityTrackingEnabled,
        setActivityTrackingEnabled,
        analyticsConsent,
        setAnalyticsConsent,
        isSubscriptionModalOpen,
        setSubscriptionModalOpen,
        upgradeToPremium,
        cancelPremium
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
