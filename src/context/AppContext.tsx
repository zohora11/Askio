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
import { 
  saveUserProfileToFirestore, 
  findUserByPhoneOrEmail, 
  isCustomAvatar, 
  DEFAULT_AVATAR,
  logoutFirebaseUser,
  auth,
  db,
  FirestoreUserData
} from '../services/firebase';
import { 
  validateMobileNumber,
  checkSubscription,
  isSubscriptionRegistered,
  isSubscriptionUnregistered,
  isInitialChargingPending,
  unmarkLocalSubscriber,
  clearSubscriptionSession
} from '../services/bdapps';
import { clearDeviceTrustForPhone } from '../services/deviceTrust';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  authView: 'login' | 'phone' | 'otp' | 'register' | 'firebase_login' | 'firebase_register' | 'forgot_password' | 'verify_reset_otp' | 'reset_password';
  setAuthView: (view: 'login' | 'phone' | 'otp' | 'register' | 'firebase_login' | 'firebase_register' | 'forgot_password' | 'verify_reset_otp' | 'reset_password') => void;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
  
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

  // Wellness Modal
  isWellnessModalOpen: boolean;
  setWellnessModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dynamic helper for AI welcome greeting with real user name
export const getAiWelcomeGreeting = (fullName?: string, lang: AppLanguage = 'en') => {
  const trimmed = (fullName || '').trim();
  const firstName = trimmed ? trimmed.split(' ')[0] : '';
  if (lang === 'bn') {
    return firstName
      ? `হ্যালো ${firstName}! 👋 আমি Askio AI, আপনার ব্যক্তিগত লার্নিং ও গাইডেন্স সহকারী। আজ আপনাকে কীভাবে সহায়তা করতে পারি?`
      : `হ্যালো! 👋 আমি Askio AI, আপনার ব্যক্তিগত লার্নিং ও গাইডেন্স সহকারী। আজ আপনাকে কীভাবে সহায়তা করতে পারি?`;
  }
  return firstName
    ? `Hello ${firstName}! 👋 I am Askio AI, your personal guidance engine. How can I support your eye care, learning, or career growth today?`
    : `Hello! 👋 I am Askio AI, your personal guidance engine. How can I support your eye care, learning, or career growth today?`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('askio_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        const cachedCustomAvatar = localStorage.getItem('askio_custom_avatar') ||
          (parsed.email ? localStorage.getItem(`askio_avatar_email_${parsed.email.toLowerCase()}`) : null) ||
          (parsed.phone ? localStorage.getItem(`askio_avatar_phone_${parsed.phone}`) : null);

        const initialAvatar = isCustomAvatar(parsed.avatar)
          ? parsed.avatar
          : (isCustomAvatar(cachedCustomAvatar || '') ? cachedCustomAvatar! : (parsed.avatar || DEFAULT_AVATAR));

        return {
          ...parsed,
          avatar: initialAvatar,
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
          const cachedAvatar = localStorage.getItem(`askio_avatar_phone_${session.mobileNumber}`) || localStorage.getItem('askio_custom_avatar') || DEFAULT_AVATAR;
          return {
            fullName: '',
            email: 'user@askio.ai',
            phone: session.mobileNumber,
            password: '',
            avatar: cachedAvatar,
            isLoggedIn: true,
            isPremium: true,
            membershipPlan: 'BDApps Daily (৳2.78/day)',
            joinedDate: 'September 2026'
          };
        }
      } catch (e) { /* ignore */ }
    }
    // Default for new users on a fresh device: not logged in with clean state
    return {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      avatar: localStorage.getItem('askio_custom_avatar') || DEFAULT_AVATAR,
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Free Tier',
      joinedDate: 'September 2026'
    };
  });

  useEffect(() => {
    localStorage.setItem('askio_user', JSON.stringify(user));
  }, [user]);

  // Sync user profile (including avatar) from Firestore whenever user logs in or on mount
  useEffect(() => {
    const syncUserProfile = async () => {
      if (!user.isLoggedIn) return;
      const identifier = user.email || user.phone || user.uid;
      if (!identifier) return;

      try {
        let fsUser: FirestoreUserData | null = null;

        // 1. Check direct UID in Firestore
        if (user.uid) {
          try {
            const userSnap = await getDoc(doc(db, 'users', user.uid));
            if (userSnap.exists()) {
              fsUser = userSnap.data() as FirestoreUserData;
            }
          } catch { /* ignore */ }
        }

        // 2. Lookup by email or phone if needed
        if (!fsUser || !isCustomAvatar(fsUser.avatar)) {
          const byIdent = await findUserByPhoneOrEmail(identifier);
          if (byIdent) {
            fsUser = fsUser ? { ...fsUser, ...byIdent, avatar: isCustomAvatar(byIdent.avatar) ? byIdent.avatar : fsUser.avatar } : byIdent;
          }
        }

        if (fsUser) {
          setUser(prev => {
            // NEVER replace a custom avatar with a default placeholder!
            const finalAvatar = isCustomAvatar(fsUser?.avatar)
              ? fsUser!.avatar!
              : (isCustomAvatar(prev.avatar) ? prev.avatar : (fsUser?.avatar || prev.avatar));

            return {
              ...prev,
              avatar: finalAvatar,
              fullName: fsUser?.fullName || prev.fullName,
              email: fsUser?.email || prev.email,
              phone: fsUser?.phone || prev.phone,
              age: fsUser?.age !== undefined ? fsUser.age : prev.age,
              gender: fsUser?.gender || prev.gender,
              religion: fsUser?.religion || prev.religion,
              bloodGroup: fsUser?.bloodGroup || prev.bloodGroup,
              profession: fsUser?.profession || prev.profession,
              address: fsUser?.address || prev.address,
              city: fsUser?.city || prev.city
            };
          });

          // If local state has a custom avatar but Firestore had a default, save it back to Firestore
          if (isCustomAvatar(user.avatar) && (!fsUser.avatar || !isCustomAvatar(fsUser.avatar))) {
            saveUserProfileToFirestore(
              identifier,
              { avatar: user.avatar },
              { uid: user.uid, email: user.email, phone: user.phone }
            ).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Sync profile notice:', err);
      }
    };

    syncUserProfile();
  }, [user.isLoggedIn, user.email, user.phone, user.uid]);

  // Active BDApps Subscription Guard:
  // If user is logged in, verify their subscription. If unsubscribed, immediately log them out!
  useEffect(() => {
    if (!user.isLoggedIn || !user.phone) return;

    const checkActiveSubscription = async () => {
      try {
        const cleanMobile = validateMobileNumber(user.phone).cleaned || user.phone;
        const res = await checkSubscription(cleanMobile);
        if (isSubscriptionUnregistered(res)) {
          // Immediately kick out unsubscribed user
          console.warn('Subscription is no longer active. Revoking access.');
          unmarkLocalSubscriber(cleanMobile);
          clearSubscriptionSession();
          clearDeviceTrustForPhone(cleanMobile);
          await logoutFirebaseUser();
          setUser({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            isLoggedIn: false,
            isPremium: false,
            membershipPlan: 'Free Tier',
            joinedDate: 'September 2026'
          });
          localStorage.removeItem('askio_user');
          setActiveTab('home');
        }
      } catch (err) {
        // Transient network error
      }
    };

    // Check after brief delay to avoid race on initial mount
    const timeout = setTimeout(checkActiveSubscription, 1500);
    const interval = setInterval(checkActiveSubscription, 45000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.phone]);

  // Listen to Firebase Auth state changes for real-time authentication & avatar persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let resolvedAvatar = isCustomAvatar(firebaseUser.photoURL || '') ? firebaseUser.photoURL! : '';

          if (userSnap.exists()) {
            const uData = userSnap.data() as FirestoreUserData;
            if (isCustomAvatar(uData.avatar)) {
              resolvedAvatar = uData.avatar!;
            }
          }

          if (!resolvedAvatar && firebaseUser.email) {
            const byEmail = await findUserByPhoneOrEmail(firebaseUser.email);
            if (byEmail && isCustomAvatar(byEmail.avatar)) {
              resolvedAvatar = byEmail.avatar!;
            }
          }

          if (resolvedAvatar) {
            setUser(prev => ({
              ...prev,
              uid: firebaseUser.uid,
              avatar: resolvedAvatar,
              email: prev.email || firebaseUser.email || '',
              fullName: prev.fullName || firebaseUser.displayName || prev.fullName,
              isLoggedIn: true
            }));
          }
        } catch (err) {
          console.warn('Auth state change profile fetch notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auth modal state
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'phone' | 'otp' | 'register' | 'firebase_login' | 'firebase_register' | 'forgot_password' | 'verify_reset_otp' | 'reset_password'>('phone');
  const [pendingPhone, setPendingPhone] = useState<string>('');

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        text: getAiWelcomeGreeting(user.fullName, 'en'),
        timestamp: 'Just now'
      }
    ];
  });
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

  // Dynamically update chatbot greeting message to match logged-in user name & language
  useEffect(() => {
    setChatMessages(prev => {
      const initIdx = prev.findIndex(m => m.id === 'msg-init' || m.id === 'msg-init-reset');
      if (initIdx !== -1) {
        const next = [...prev];
        next[initIdx] = {
          ...next[initIdx],
          text: getAiWelcomeGreeting(user.fullName, language)
        };
        return next;
      }
      return prev;
    });
  }, [user.fullName, language]);

  // Subscription Modal
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);

  // Wellness Modal
  const [isWellnessModalOpen, setWellnessModalOpen] = useState<boolean>(false);

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
    if (updated.isLoggedIn) {
      setActiveTab('home');
    }
    setUser(prev => {
      const next = { ...prev, ...updated };
      // Secure local caching for custom avatar across sessions
      if (next.avatar && isCustomAvatar(next.avatar)) {
        try {
          localStorage.setItem('askio_custom_avatar', next.avatar);
          if (next.phone) localStorage.setItem(`askio_avatar_phone_${next.phone}`, next.avatar);
          if (next.email) localStorage.setItem(`askio_avatar_email_${next.email.toLowerCase()}`, next.avatar);
        } catch { /* ignore storage quota */ }
      }
      // Save to Firestore asynchronously with full UID, email, and phone resolution
      const identifier = next.email || next.phone || next.uid || auth.currentUser?.uid;
      if (identifier) {
        saveUserProfileToFirestore(
          identifier,
          {
            uid: next.uid || auth.currentUser?.uid,
            fullName: next.fullName,
            email: next.email,
            phone: next.phone,
            avatar: next.avatar,
            membershipPlan: next.membershipPlan,
            isPremium: next.isPremium,
            age: next.age,
            gender: next.gender,
            religion: next.religion,
            bloodGroup: next.bloodGroup,
            profession: next.profession,
            address: next.address,
            city: next.city
          },
          { uid: next.uid || auth.currentUser?.uid, email: next.email, phone: next.phone }
        ).catch(err => console.warn('Save to Firestore error:', err));
      }
      return next;
    });
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
      setActiveTab('home');
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
    setActiveTab('home');
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
    setActiveTab('home');
    setAuthModalOpen(false);
    addActivity('search', `Registered new account: ${name}`);
    return true;
  };

  const logout = () => {
    if (user.phone) {
      unmarkLocalSubscriber(user.phone);
      clearDeviceTrustForPhone(user.phone);
    }
    clearSubscriptionSession();
    setUser({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Free Tier',
      joinedDate: 'September 2026'
    });
    localStorage.removeItem('askio_user');
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

      const endpoint = `/api/chat`;

      const payload = {
        message: text.trim(),
        history,
        userName: user.fullName?.trim() || undefined,
        contextResource: contextResource ? {
          id: contextResource.id,
          title: contextResource.title,
          category: contextResource.category,
          format: contextResource.format,
          description: contextResource.description,
          author: contextResource.author
        } : undefined
      };

      // Resilient fetch with automatic single retry for server boot/cold starts
      let response: Response | null = null;
      let lastFetchErr: any = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          // Break early if successful or normal client response
          if (response.ok || (response.status >= 400 && response.status < 500)) {
            break;
          }

          // If cold-starting on Render or temporary proxy delay (502/503/504), retry once after 1.5s
          if (attempt === 0 && (response.status === 502 || response.status === 503 || response.status === 504)) {
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }
        } catch (fetchErr: any) {
          lastFetchErr = fetchErr;
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }
        }
      }

      if (!response) {
        throw new Error(
          language === 'bn'
            ? 'সার্ভারে সংযোগ করা যায়নি। অনুগ্রহ করে ইন্টারনেট কানেকশন বা সার্ভার স্ট্যাটাস চেক করুন।'
            : (lastFetchErr?.message || 'Unable to connect to the backend server. Please verify your connection.')
        );
      }

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
            // fallback
          }
        } else {
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            errorMsg = language === 'bn'
              ? 'সার্ভার বুট হচ্ছে বা সাময়িক বিলম্ব হচ্ছে (HTTP ' + response.status + ')। অনুগ্রহ করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন।'
              : `Server is warming up or temporarily busy (HTTP ${response.status}). Please retry in a few moments.`;
          } else if (response.status === 404) {
            errorMsg = language === 'bn'
              ? 'এআই এন্ডপয়েন্ট পাওয়া যায়নি (HTTP 404)। Render-এ এটি Web Service হিসেবে ডিপ্লয় করা ও চালু রয়েছে কিনা চেক করুন।'
              : 'AI server endpoint not found (HTTP 404). Please ensure the backend is deployed as a Web Service.';
          }
        }
        throw new Error(errorMsg);
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        reply = data.reply || '';
      } else {
        const rawText = await response.text();
        try {
          const parsed = JSON.parse(rawText);
          if (parsed.error) throw new Error(parsed.error);
          reply = parsed.reply || '';
        } catch (parseErr: any) {
          if (parseErr.message && !parseErr.message.includes('JSON')) {
            throw parseErr;
          }
          if (rawText && !rawText.includes('<!DOCTYPE') && !rawText.includes('<html')) {
            reply = rawText.trim();
          } else {
            throw new Error(
              language === 'bn'
                ? 'সার্ভার থেকে এপিআইয়ের বদলে ওয়েবপেজ (HTML) পাওয়া গেছে। আপনি যদি Render বা Vercel-এ হোস্ট করে থাকেন, তবে নিশ্চিত করুন এটি "Web Service" হিসেবে চলছে, "Static Site" হিসেবে নয়।'
                : 'API returned an HTML webpage instead of JSON. If deployed on Render/Vercel, ensure it is configured as a "Web Service" (Node.js) and not a "Static Site".'
            );
          }
        }
      }

      if (!reply) {
        throw new Error(
          language === 'bn'
            ? 'এআই থেকে উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'No response received from AI engine. Please try again.'
        );
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
        timestamp: 'Just now'
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn("AI generation notice:", err?.message || err);
      let userFriendlyMessage = language === 'bn'
        ? 'এআই সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        : 'Unable to connect to the Askio AI engine right now. Please try again.';

      if (err?.message && !err.message.includes('JSON.parse') && !err.message.includes('unexpected character')) {
        userFriendlyMessage = err.message;
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: `⚠️ **Askio AI Notice**: ${userFriendlyMessage}`,
        timestamp: 'Just now',
        isError: true
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
        text: getAiWelcomeGreeting(user.fullName, language),
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
      membershipPlan: 'BDApps Daily (৳2.78/day)'
    }));
    setSubscriptionModalOpen(false);
    addActivity('bookmark', `Subscribed to Askio Premium BDApps Daily plan (৳2.78/day)`);
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
        setPendingPhone,
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
        cancelPremium,
        isWellnessModalOpen,
        setWellnessModalOpen
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
