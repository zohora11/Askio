import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  cleanupLegacyOtpStorage,
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
  markLocalSubscriber,
  clearSubscriptionSession,
  recordSubscriptionCheckTimestamp,
  isSubscriptionRecheckDue
} from '../services/bdapps';
import { clearDeviceTrustForPhone } from '../services/deviceTrust';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { saveActivitiesToFirestore, loadActivitiesFromFirestore } from '../services/firebase';
import { triggerApkDownload, ASKIO_APK_URL } from '../constants/branding';

interface UndoState {
  item: NotificationItem;
  index: number;
}

export type NavigationStackEntry = 
  | { type: 'tab'; tab: string }
  | { type: 'resource'; resource: Resource; fromTab: string }
  | { type: 'reader'; resource: Resource; fromTab: string };

interface AppContextType {
  // Navigation & History
  activeTab: string;
  setActiveTab: (tab: string, replace?: boolean) => void;
  navigationStack: NavigationStackEntry[];
  canGoBack: boolean;
  goBack: () => void;

  // PDF & Document Reader
  readingResource: Resource | null;
  openPdfReader: (resource: Resource) => void;
  closePdfReader: () => void;
  
  // User & Auth
  user: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
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
  authModalNotice: string | null;
  setAuthModalNotice: (notice: string | null) => void;
  toastMessage: { text: string; type?: 'info' | 'success' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearToast: () => void;
  handleDownloadApk: () => void;
  isApkModalOpen: boolean;
  setApkModalOpen: (open: boolean) => void;
  pendingApkDownload: boolean;
  setPendingApkDownload: (pending: boolean) => void;
  
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
  const userName = trimmed ? trimmed.split(' ')[0] : (lang === 'bn' ? 'ইউজার' : 'User');
  if (lang === 'bn') {
    return `হ্যালো ${userName}! 👋 আমি আপনার জিনি, আপনার ব্যক্তিগত গাইডেন্স সহকারী। আজ আপনি কী অন্বেষণ করতে চান?`;
  }
  return `Hello ${userName}! 👋 I am your Genie, your personal guidance assistant. What would you like to explore today?`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & History
  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'search', 'ai', 'goals', 'health', 'library', 'profile', 'notifications', 'settings', 'landing'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'home';
  });
  const [navigationStack, setNavigationStack] = useState<NavigationStackEntry[]>([]);
  const [readingResource, setReadingResource] = useState<Resource | null>(null);
  const ignoreNextPopStateRef = useRef<boolean>(false);
  const isExecutingGoBackRef = useRef<boolean>(false);
  
  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('askio_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        const initialAvatar = parsed.avatar || DEFAULT_AVATAR;

        const loggedIn = parsed.isLoggedIn ?? false;
        const cleanPlan = (loggedIn && (!parsed.membershipPlan || parsed.membershipPlan.toLowerCase().includes('unsub') || parsed.membershipPlan.toLowerCase().includes('free')))
          ? 'BDApps Daily (৳2.78/day)'
          : (parsed.membershipPlan || (loggedIn ? 'BDApps Daily (৳2.78/day)' : 'Free Tier'));

        return {
          ...parsed,
          avatar: initialAvatar,
          isLoggedIn: loggedIn,
          isPremium: loggedIn ? true : (parsed.isPremium ?? false),
          membershipPlan: cleanPlan
        };
      } catch (e) { /* ignore */ }
    }
    // Check if BDApps session exists for returning subscriber
    const sessionRaw = localStorage.getItem('askio_bdapps_session');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        if (session && session.subscribed && session.mobileNumber) {
          const cachedAvatar = DEFAULT_AVATAR;
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
      avatar: DEFAULT_AVATAR,
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Free Tier',
      joinedDate: 'September 2026'
    };
  });

  useEffect(() => {
    // Purge any legacy stored OTPs or temporary reset keys on startup
    cleanupLegacyOtpStorage();
  }, []);

  useEffect(() => {
    localStorage.setItem('askio_user', JSON.stringify(user));
  }, [user]);

  // Sync user profile (including avatar) from Firestore whenever user logs in or on mount
  useEffect(() => {
    let unsubscribe: () => void;

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
        if (!fsUser) {
          const byIdent = await findUserByPhoneOrEmail(identifier);
          if (byIdent) {
            fsUser = byIdent;
          }
        }

        if (fsUser) {
          setUser(prev => {
            return {
              ...prev,
              avatar: fsUser?.avatar || prev.avatar,
              uid: fsUser?.uid || prev.uid,
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

          // 3. Start real-time listener if we have a UID
          const listenUid = fsUser.uid || user.uid;
          if (listenUid) {
            unsubscribe = onSnapshot(doc(db, 'users', listenUid), (docSnap) => {
              if (docSnap.exists()) {
                const liveData = docSnap.data() as FirestoreUserData;
                setUser(prev => {
                  return {
                    ...prev,
                    avatar: liveData.avatar || prev.avatar,
                    fullName: liveData.fullName || prev.fullName,
                    email: liveData.email || prev.email,
                    phone: liveData.phone || prev.phone,
                    age: liveData.age !== undefined ? liveData.age : prev.age,
                    gender: liveData.gender || prev.gender,
                    religion: liveData.religion || prev.religion,
                    bloodGroup: liveData.bloodGroup || prev.bloodGroup,
                    profession: liveData.profession || prev.profession,
                    address: liveData.address || prev.address,
                    city: liveData.city || prev.city
                  };
                });
              }
            }, (err) => {
               console.warn("Realtime listener error:", err);
            });
          }
        }
      } catch (err) {
        console.warn('Sync profile notice:', err);
      }
    };

    syncUserProfile();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user.isLoggedIn, user.uid]);

  // Active BDApps Subscription Guard & Periodic 2-Day Re-check:
  // Verifies subscription status against the real-time BDApps API. If unsubscribed/expired, updates state.
  useEffect(() => {
    if (!user.isLoggedIn || !user.phone) return;

    const checkActiveSubscription = async () => {
      try {
        const cleanMobile = validateMobileNumber(user.phone).cleaned || user.phone;
        const res = await checkSubscription(cleanMobile);
        if (isSubscriptionUnregistered(res)) {
          // Subscription expired or unregistered -> revoke premium access but do not log out forcefully
          console.warn('Subscription is no longer active. Revoking premium access.');
          unmarkLocalSubscriber(cleanMobile);
          clearSubscriptionSession();
          clearDeviceTrustForPhone(cleanMobile);
          setUser(prev => ({
            ...prev,
            isPremium: false,
            membershipPlan: 'Free Tier'
          }));
        } else if (isSubscriptionRegistered(res)) {
          // Subscription verified active in real-time -> record check timestamp and confirm premium status
          markLocalSubscriber(cleanMobile);
          recordSubscriptionCheckTimestamp(cleanMobile);
          setUser(prev => prev.isPremium ? prev : { ...prev, isPremium: true, membershipPlan: 'BDApps Daily (৳2.78/day)' });
        }
      } catch (err) {
        // Transient network error
      }
    };

    // Check after brief delay to avoid race on initial mount
    const timeout = setTimeout(checkActiveSubscription, 1500);
    // Periodic check interval (checks active state and handles 2-day re-verification)
    const interval = setInterval(checkActiveSubscription, 45000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [user.isLoggedIn, user.phone]);

  // Listen to Firebase Auth state changes for real-time authentication & session persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let uData: FirestoreUserData | null = null;
          if (userSnap.exists()) {
            uData = userSnap.data() as FirestoreUserData;
          } else if (firebaseUser.email) {
            uData = await findUserByPhoneOrEmail(firebaseUser.email);
          }

          let resolvedAvatar = uData?.avatar || firebaseUser.photoURL || DEFAULT_AVATAR;

          setUser(prev => ({
            ...prev,
            uid: firebaseUser.uid,
            avatar: resolvedAvatar,
            email: uData?.email || firebaseUser.email || prev.email,
            fullName: uData?.fullName || firebaseUser.displayName || prev.fullName || 'Askio Member',
            phone: uData?.phone || uData?.phoneNumber || prev.phone,
            isPremium: uData?.isPremium ?? true,
            membershipPlan: uData?.membershipPlan || prev.membershipPlan || 'BDApps Daily (৳2.78/day)',
            isLoggedIn: true,
            ...(uData?.age !== undefined && uData?.age !== null ? { age: uData.age } : {}),
            ...(uData?.gender ? { gender: uData.gender } : {}),
            ...(uData?.religion ? { religion: uData.religion } : {}),
            ...(uData?.bloodGroup ? { bloodGroup: uData.bloodGroup } : {}),
            ...(uData?.profession ? { profession: uData.profession } : {}),
            ...(uData?.address ? { address: uData.address } : {}),
            ...(uData?.city ? { city: uData.city } : {})
          }));
        } catch (err) {
          console.warn('Auth state change profile fetch notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auth and APK modal state
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setApkModalOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'phone' | 'otp' | 'register' | 'firebase_login' | 'firebase_register' | 'forgot_password' | 'verify_reset_otp' | 'reset_password'>('phone');
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);
  const [pendingApkDownload, setPendingApkDownload] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('askio_pending_apk_download') === 'true';
    } catch {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMessage({ text, type });
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  const handleDownloadApk = useCallback(() => {
    // STRICT CONSTRAINT: NEVER trigger direct APK download upon clicking Download button!
    // Always open phone number verification modal first.
    setPendingApkDownload(true);
    try {
      sessionStorage.setItem('askio_pending_apk_download', 'true');
    } catch {
      // Safe fallback
    }
    setApkModalOpen(true);
  }, []);

  // If user just logged in and had requested APK download earlier
  useEffect(() => {
    if (user.isLoggedIn && pendingApkDownload) {
      setPendingApkDownload(false);
      try {
        sessionStorage.removeItem('askio_pending_apk_download');
      } catch {
        // Safe fallback
      }
      setAuthModalNotice(null);
      const timer = setTimeout(() => {
        triggerApkDownload();
        showToast(language === 'bn' ? 'লগইন সম্পন্ন! APK ডাউনলোড শুরু হচ্ছে...' : 'Login successful! Starting APK download...', 'success');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user.isLoggedIn, pendingApkDownload, language, showToast]);

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
    if (user.uid) {
      saveActivitiesToFirestore(user.uid, activities);
    }
  }, [activities, user.uid]);

  // Load activities from Firestore when user logs in
  useEffect(() => {
    if (user.uid) {
      loadActivitiesFromFirestore(user.uid).then(remoteActs => {
        if (remoteActs && remoteActs.length > 0) {
          setActivities(remoteActs);
        }
      });
    } else {
      const saved = localStorage.getItem('askio_activities');
      setActivities(saved ? JSON.parse(saved) : INITIAL_ACTIVITIES);
    }
  }, [user.uid]);

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
      timestamp: Date.now(),
      category
    };
    setActivities(prev => [newItem, ...prev.slice(0, 49)]);
  };

  // User Profile
  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (updated.isLoggedIn) {
      setActiveTab('home');
    }
    
    // Save to Firestore asynchronously with full UID, email, and phone resolution
    const identifier = user.email || user.phone || user.uid || auth.currentUser?.uid;
    if (identifier) {
      const next = { ...user, ...updated };
      try {
        const payload: Record<string, any> = {
          uid: next.uid || auth.currentUser?.uid,
          fullName: next.fullName,
          email: next.email,
          phone: next.phone,
          avatar: next.avatar,
          membershipPlan: next.membershipPlan,
          isPremium: next.isPremium
        };
        if (next.age !== undefined && next.age !== null) payload.age = next.age;
        if (next.gender) payload.gender = next.gender;
        if (next.religion) payload.religion = next.religion;
        if (next.bloodGroup) payload.bloodGroup = next.bloodGroup;
        if (next.profession) payload.profession = next.profession;
        if (next.address) payload.address = next.address;
        if (next.city) payload.city = next.city;

        await saveUserProfileToFirestore(
          identifier,
          payload,
          { uid: next.uid || auth.currentUser?.uid, email: next.email, phone: next.phone }
        );
        addActivity('bookmark', `Updated profile information`);
      } catch (err) {
        console.warn('Save to Firestore error:', err);
      }
      
      // Update local state after write
      setUser(prev => ({ ...prev, ...updated }));
    } else {
       // If not logged in, just update local state
       setUser(prev => ({ ...prev, ...updated }));
    }
  };

  const loginWithPhone = (phone: string) => {
    setPendingPhone(phone);
    setAuthView('otp');
  };

  const verifyOtp = (_otp: string): boolean => {
    // OTP verification is performed strictly and directly via real-time BDApps API in OtpVerificationModal
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
    logoutFirebaseUser().catch(() => {});
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

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const selectedResourceRef = useRef(selectedResource);
  selectedResourceRef.current = selectedResource;

  const readingResourceRef = useRef(readingResource);
  readingResourceRef.current = readingResource;

  // Initialize browser history state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentHash = window.location.hash;
    const tabName = currentHash.replace('#', '');
    const validTabs = ['home', 'search', 'ai', 'goals', 'health', 'library', 'profile', 'notifications', 'settings', 'landing'];

    if (currentHash.startsWith('#reader-')) {
      const id = currentHash.replace('#reader-', '');
      const res = MOCK_RESOURCES.find(r => r.id === id);
      if (res) {
        setReadingResource(res);
        window.history.replaceState({ type: 'reader', resourceId: id, tab: 'library', timestamp: Date.now() }, '', currentHash);
        return;
      }
    } else if (currentHash.startsWith('#resource-')) {
      const id = currentHash.replace('#resource-', '');
      const res = MOCK_RESOURCES.find(r => r.id === id);
      if (res) {
        setSelectedResource(res);
        window.history.replaceState({ type: 'resource', resourceId: id, tab: 'library', timestamp: Date.now() }, '', currentHash);
        return;
      }
    }

    const initialTab = validTabs.includes(tabName) ? tabName : 'home';
    if (!window.history.state) {
      window.history.replaceState(
        { type: 'tab', tab: initialTab, timestamp: Date.now() },
        '',
        currentHash && validTabs.includes(tabName) ? currentHash : `#${initialTab}`
      );
    }
  }, []);

  const openResourceDetail = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    addToRecentlyViewed(resource.id);
    const hash = `#resource-${resource.id}`;
    try {
      window.history.pushState(
        { 
          type: 'resource', 
          resourceId: resource.id, 
          tab: activeTabRef.current, 
          timestamp: Date.now() 
        }, 
        '', 
        hash
      );
    } catch (e) {}
  }, [addToRecentlyViewed]);

  const openPdfReader = useCallback((resource: Resource) => {
    setReadingResource(resource);
    addToRecentlyViewed(resource.id);
    const hash = `#reader-${resource.id}`;
    try {
      window.history.pushState(
        { 
          type: 'reader', 
          resourceId: resource.id, 
          tab: activeTabRef.current, 
          timestamp: Date.now() 
        }, 
        '', 
        hash
      );
    } catch (e) {}
  }, [addToRecentlyViewed]);

  const closePdfReader = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#reader-')) {
      window.history.back();
    } else {
      setReadingResource(null);
    }
  }, []);

  const closeResourceDetail = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#resource-')) {
      window.history.back();
    } else {
      setSelectedResource(null);
    }
  }, []);

  const setActiveTab = useCallback((tab: string, replace = false) => {
    // If target tab is already active and no modal/reader is open, do nothing
    if (tab === activeTabRef.current && !selectedResourceRef.current && !readingResourceRef.current) {
      return;
    }

    if (selectedResourceRef.current) setSelectedResource(null);
    if (readingResourceRef.current) setReadingResource(null);

    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });

    const hash = `#${tab}`;
    try {
      if (replace) {
        window.history.replaceState({ type: 'tab', tab, timestamp: Date.now() }, '', hash);
      } else {
        if (window.location.hash !== hash) {
          window.history.pushState({ type: 'tab', tab, timestamp: Date.now() }, '', hash);
        }
      }
    } catch (e) {}
  }, []);

  const canGoBack = Boolean(
    readingResource !== null ||
    selectedResource !== null ||
    isSubscriptionModalOpen ||
    isWellnessModalOpen ||
    isAuthModalOpen ||
    activeTab !== 'home'
  );

  const goBack = useCallback(() => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        if (readingResourceRef.current) {
          setReadingResource(null);
        } else if (selectedResourceRef.current) {
          setSelectedResource(null);
        } else if (activeTabRef.current !== 'home') {
          setActiveTab('home');
        }
      }
    } catch (e) {
      if (readingResourceRef.current) {
        setReadingResource(null);
      } else if (selectedResourceRef.current) {
        setSelectedResource(null);
      } else if (activeTabRef.current !== 'home') {
        setActiveTab('home');
      }
    }
  }, [setActiveTab]);

  // Popstate listener to handle browser back button, Android/iOS back gesture and hardware button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const hash = window.location.hash;

      // 1. If history state object exists:
      if (state && typeof state === 'object') {
        if (state.type === 'reader') {
          const res = MOCK_RESOURCES.find(r => r.id === state.resourceId);
          if (res) {
            setReadingResource(res);
          }
          if (state.tab && state.tab !== activeTabRef.current) {
            setActiveTabState(state.tab);
          }
          return;
        }

        if (state.type === 'resource') {
          setReadingResource(null);
          const res = MOCK_RESOURCES.find(r => r.id === state.resourceId);
          if (res) {
            setSelectedResource(res);
          }
          if (state.tab && state.tab !== activeTabRef.current) {
            setActiveTabState(state.tab);
          }
          return;
        }

        if (state.type === 'tab') {
          setReadingResource(null);
          setSelectedResource(null);
          setSubscriptionModalOpen(false);
          setWellnessModalOpen(false);
          setAuthModalOpen(false);
          if (state.tab && state.tab !== activeTabRef.current) {
            setActiveTabState(state.tab);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          return;
        }
      }

      // 2. Fallback: Parse URL hash if state was not populated
      if (hash.startsWith('#reader-')) {
        const id = hash.replace('#reader-', '');
        const res = MOCK_RESOURCES.find(r => r.id === id);
        if (res) setReadingResource(res);
        return;
      }

      if (hash.startsWith('#resource-')) {
        setReadingResource(null);
        const id = hash.replace('#resource-', '');
        const res = MOCK_RESOURCES.find(r => r.id === id);
        if (res) setSelectedResource(res);
        return;
      }

      // Normal tab hash
      setReadingResource(null);
      setSelectedResource(null);
      setSubscriptionModalOpen(false);
      setWellnessModalOpen(false);
      setAuthModalOpen(false);
      const tabName = hash.replace('#', '');
      const validTabs = ['home', 'search', 'ai', 'goals', 'health', 'library', 'profile', 'notifications', 'settings', 'landing'];
      const targetTab = validTabs.includes(tabName) ? tabName : 'home';

      if (targetTab !== activeTabRef.current) {
        setActiveTabState(targetTab);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
        navigationStack,
        canGoBack,
        goBack,
        readingResource,
        openPdfReader,
        closePdfReader,
        user,
        updateProfile,
        loginWithPhone,
        verifyOtp,
        loginWithEmail,
        registerUser,
        logout,
        isAuthModalOpen,
        setAuthModalOpen,
        isApkModalOpen,
        setApkModalOpen,
        authView,
        setAuthView,
        pendingPhone,
        setPendingPhone,
        authModalNotice,
        setAuthModalNotice,
        toastMessage,
        showToast,
        clearToast,
        handleDownloadApk,
        pendingApkDownload,
        setPendingApkDownload,
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
