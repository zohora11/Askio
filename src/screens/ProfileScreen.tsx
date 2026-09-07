import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FirestoreUserData } from '../services/firebase';
import { 
  Edit3, 
  Camera, 
  Crown,
  Search, 
  Bookmark, 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  Lock, 
  X, 
  Check, 
  LogOut, 
  Settings, 
  ShieldCheck,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Compass,
  User,
  Globe,
  Sun,
  Moon,
  Award,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Flame,
  FileText,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  History,
  CheckCircle,
  Trash2,
  Upload,
  Heart,
  Droplet,
  Briefcase,
  GraduationCap,
  MapPin,
  Home,
  BookOpen,
  UserCheck,
  ArrowLeft,
  KeyRound,
  EyeOff,
  Loader2
} from 'lucide-react';
import { UnsubscribeModal } from '../components/UnsubscribeModal';
import { LogoutModal } from '../components/LogoutModal';
import { unsubscribe, clearSubscriptionSession, unmarkLocalSubscriber } from '../services/bdapps';
import { logoutFirebaseUser, isCustomAvatar, DEFAULT_AVATAR, uploadAvatarToStorage, changeUserPassword } from '../services/firebase';
import { clearDeviceTrustForPhone } from '../services/deviceTrust';
import { t } from '../constants/translations';
import { optimizeAvatarImage, optimizeAvatarImageAsFile } from '../utils/imageOptimizer';
import { UserProfile } from '../types';

const getTimeAgo = (timestamp: string | number, isBn: boolean): string => {
  if (!timestamp) return isBn ? 'এইমাত্র' : 'Just now';
  
  if (typeof timestamp === 'string') {
    // If it's already a relative string from mock data (e.g., '10 mins ago'), return it
    if (timestamp.includes('ago') || timestamp.includes('Today') || timestamp.includes('Yesterday')) {
      return timestamp;
    }
    // If it's literally 'Just now' or something else
    if (timestamp.toLowerCase() === 'just now') return isBn ? 'এইমাত্র' : 'Just now';
  }

  // Parse ISO string or timestamp
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return String(timestamp);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return isBn ? 'এইমাত্র' : 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isBn ? `${diffInMinutes} মিনিট আগে` : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isBn ? `${diffInHours} ঘণ্টা আগে` : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return isBn ? `${diffInDays} দিন আগে` : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return isBn ? `${diffInWeeks} সপ্তাহ আগে` : `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return isBn ? `${diffInMonths} মাস আগে` : `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

const AVATAR_PRESETS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', label: 'Default' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80', label: 'Avatar 1' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', label: 'Avatar 2' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', label: 'Avatar 3' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80', label: 'Avatar 4' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', label: 'Avatar 5' },
  { id: 'av7', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', label: 'Avatar 6' },
  { id: 'av8', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', label: 'Avatar 7' },
];

export const GENDER_OPTIONS = [
  { value: 'Male', labelBn: 'পুরুষ (Male)', labelEn: 'Male' },
  { value: 'Female', labelBn: 'নারী (Female)', labelEn: 'Female' },
  { value: 'Other', labelBn: 'অন্যান্য (Other)', labelEn: 'Other' }
];

export const RELIGION_OPTIONS = [
  { value: 'Islam', labelBn: 'ইসলাম (Islam)', labelEn: 'Islam' },
  { value: 'Hinduism', labelBn: 'হিন্দুধর্ম (Hinduism)', labelEn: 'Hinduism' },
  { value: 'Christianity', labelBn: 'খ্রিস্টধর্ম (Christianity)', labelEn: 'Christianity' },
  { value: 'Buddhism', labelBn: 'বৌদ্ধধর্ম (Buddhism)', labelEn: 'Buddhism' },
  { value: 'Other', labelBn: 'অন্যান্য (Other)', labelEn: 'Other' }
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const PROFESSION_OPTIONS = [
  { value: 'Student', labelBn: 'শিক্ষার্থী / স্টুডেন্ট', labelEn: 'Student', hintBn: 'বোর্ড পাঠ্যবই, একাডেমি ও স্কলারশিপ কনটেন্ট', hintEn: 'Textbooks, academy & study guides' },
  { value: 'Teacher', labelBn: 'শিক্ষক / শিক্ষাবিদ', labelEn: 'Teacher / Educator', hintBn: 'পাঠদান কৌশল, লেকচার নোট ও গবেষণা পত্র', hintEn: 'Teaching methodology & lecture resources' },
  { value: 'Engineer / Tech', labelBn: 'প্রকৌশলী / আইটি প্রফেশনাল', labelEn: 'Engineer / Tech', hintBn: 'কোডিং, সফটওয়্যার ও এআই টেকনোলজি', hintEn: 'Software, AI, development & cloud' },
  { value: 'Healthcare', labelBn: 'চিকিৎসক / স্বাস্থ্যকর্মী', labelEn: 'Doctor / Healthcare', hintBn: 'চিকিৎসাবিজ্ঞান, হেলথকেয়ার ও সুস্থতা', hintEn: 'Medical literature & wellness guides' },
  { value: 'Business', labelBn: 'ব্যবসায়ী / উদ্যোক্তা', labelEn: 'Business / Entrepreneur', hintBn: 'বিজনেস প্ল্যান, অর্থনীতি ও বাজার ব্যবস্থাপনা', hintEn: 'Business models, economics & trade' },
  { value: 'Govt / Private Service', labelBn: 'চাকরিজীবী (সরকারি/বেসরকারি)', labelEn: 'Govt / Private Service', hintBn: 'ক্যারিয়ার ডেভেলপমেন্ট, স্কিলস ও প্রফেশনাল গ্রোথ', hintEn: 'Professional development & skills' },
  { value: 'Freelancer', labelBn: 'ফ্রিল্যান্সার / ক্রিয়েটর', labelEn: 'Freelancer / Creator', hintBn: 'রিমোট জবস, ক্রিয়েটিভ ডিজাইন ও ফ্রিল্যান্সিং', hintEn: 'Freelance guides & creative skills' },
  { value: 'Other', labelBn: 'অন্যান্য পেশা', labelEn: 'Other Profession', hintBn: 'সাধারণ জ্ঞান ও সার্বিক জীবন দক্ষতা', hintEn: 'General knowledge & self-growth' }
];

export const BANGLADESH_CITIES = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 
  'Rangpur', 'Mymensingh', 'Cumilla', 'Gazipur', 'Narayanganj', 'Bogura', 'Cox\'s Bazar', 'Other'
];

export const getGenderLabel = (val?: string, isBn?: boolean) => {
  if (!val) return isBn ? 'যোগ করুন' : 'Not set';
  const found = GENDER_OPTIONS.find(o => o.value === val);
  return found ? (isBn ? found.labelBn : found.labelEn) : val;
};

export const getReligionLabel = (val?: string, isBn?: boolean) => {
  if (!val) return isBn ? 'যোগ করুন' : 'Not set';
  const found = RELIGION_OPTIONS.find(o => o.value === val);
  return found ? (isBn ? found.labelBn : found.labelEn) : val;
};

export const getProfessionLabel = (val?: string, isBn?: boolean) => {
  if (!val) return isBn ? 'যোগ করুন' : 'Not set';
  const found = PROFESSION_OPTIONS.find(o => o.value === val);
  return found ? (isBn ? found.labelBn : found.labelEn) : val;
};

export const ProfileScreen: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    logout, 
    cancelPremium,
    bookmarkedIds, 
    recentlyViewedIds, 
    recentSearches, 
    activities, 
    chatMessages,
    setActiveTab, 
    setSubscriptionModalOpen,
    language,
    setLanguage,
    theme,
    setTheme
  } = useApp();

  const isBn = language === 'bn';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeActivityTab, setActiveActivityTab] = useState<'all' | 'ai' | 'search' | 'bookmark'>('all');
  const [isPersonalDetailsExpanded, setIsPersonalDetailsExpanded] = useState<boolean>(false);

  // Force re-render periodically so that relative timestamps (e.g. "Just now", "5 minutes ago") update automatically
  const [, setTick] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Profile Views tracking in localStorage
  const [profileViews, setProfileViews] = useState<number>(() => {
    const key = `askio_pv_${user.phone || user.email || 'user'}`;
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    const key = `askio_pv_${user.phone || user.email || 'user'}`;
    setProfileViews(prev => {
      const next = prev + 1;
      localStorage.setItem(key, next.toString());
      return next;
    });
  }, [user.phone, user.email]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editModalFileInputRef = useRef<HTMLInputElement | null>(null);

  const [nameInput, setNameInput] = useState(user.fullName || '');
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [passwordInput, setPasswordInput] = useState(user.password || '');
  const [avatarInput, setAvatarInput] = useState(user.avatar || '');
  const [ageInput, setAgeInput] = useState(user.age !== undefined ? user.age.toString() : '');
  const [genderInput, setGenderInput] = useState(user.gender || '');
  const [religionInput, setReligionInput] = useState(user.religion || '');
  const [bloodGroupInput, setBloodGroupInput] = useState(user.bloodGroup || '');
  const [professionInput, setProfessionInput] = useState(user.profession || '');
  const [addressInput, setAddressInput] = useState(user.address || '');
  const [cityInput, setCityInput] = useState(user.city || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Change Password state
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) {
      setPassError(isBn ? 'বর্তমান পাসওয়ার্ড লিখুন।' : 'Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError(isBn ? 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(isBn ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await changeUserPassword({
        currentPassword,
        newPassword
      });
      setPassSuccess(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password changed successfully!');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPassSuccess('');
      }, 1500);
    } catch (err: any) {
      console.warn('Change password error:', err);
      if (err.code === 'auth/wrong-password' || err.message?.includes('Current password is incorrect')) {
        setPassError(isBn ? 'বর্তমান পাসওয়ার্ডটি ভুল।' : 'Current password is incorrect.');
      } else {
        setPassError(err.message || (isBn ? 'পাসওয়ার্ড পরিবর্তন করা যায়নি।' : 'Failed to change password.'));
      }
    } finally {
      setPassLoading(false);
    }
  };

  // Keep form inputs synchronized when logged-in user profile updates
  useEffect(() => {
    setNameInput(user.fullName || '');
    setEmailInput(user.email || '');
    setPhoneInput(user.phone || '');
    setPasswordInput(user.password || '');
    setAvatarInput(user.avatar || '');
    setAgeInput(user.age !== undefined && user.age !== null ? user.age.toString() : '');
    setGenderInput(user.gender || '');
    setReligionInput(user.religion || '');
    setBloodGroupInput(user.bloodGroup || '');
    setProfessionInput(user.profession || '');
    setAddressInput(user.address || '');
    setCityInput(user.city || '');
  }, [
    user.fullName, 
    user.email, 
    user.phone, 
    user.password, 
    user.avatar,
    user.age,
    user.gender,
    user.religion,
    user.bloodGroup,
    user.profession,
    user.address,
    user.city
  ]);

  // Load persistent profile details from Firestore directly on mount
  useEffect(() => {
    const fetchPersistentData = async () => {
      if (!user.isLoggedIn || !user.uid) return;
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const uData = userSnap.data() as FirestoreUserData;
          if (uData.age !== undefined && uData.age !== null) setAgeInput(uData.age.toString());
          if (uData.gender) setGenderInput(uData.gender);
          if (uData.religion) setReligionInput(uData.religion);
          if (uData.bloodGroup) setBloodGroupInput(uData.bloodGroup);
          if (uData.profession) setProfessionInput(uData.profession);
          if (uData.address) setAddressInput(uData.address);
          if (uData.city) setCityInput(uData.city);
        }
      } catch (err) {
        console.warn('Failed to fetch persistent profile details', err);
      }
    };
    fetchPersistentData();
  }, [user.isLoggedIn, user.uid]);

  // Real user stats
  const totalSearches = recentSearches.length;
  const totalBookmarks = bookmarkedIds.length;
  const totalViews = recentlyViewedIds.length;
  const userAiPromptsCount = chatMessages ? chatMessages.filter(m => m.sender === 'user').length : 0;

  // Real Achievements
  const isPremiumUnlocked = Boolean(user.isPremium || user.membershipPlan?.toLowerCase().includes('bd') || user.membershipPlan?.toLowerCase().includes('premium'));
  const achievements = [
    {
      id: 'bdapps_subscriber',
      titleBn: 'বিডি অ্যাপস সাবস্ক্রাইবার',
      titleEn: 'BDF Subscriber',
      descBn: 'বিডি অ্যাপস পেমেন্ট সম্পন্ন করে আস্কিও প্রিমিয়াম অ্যাক্সেস সক্রিয় করা',
      descEn: 'Active BDApps payment & premium access',
      unlocked: isPremiumUnlocked,
      current: isPremiumUnlocked ? 1 : 0,
      target: 1,
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      id: 'first_search',
      titleBn: 'প্রথম অন্বেষণকারী',
      titleEn: 'First Explorer',
      descBn: 'আস্কিও প্ল্যাটফর্মে প্রথম যেকোনো অনুসন্ধান সম্পন্ন করা',
      descEn: 'Perform your first search on Askio',
      unlocked: totalSearches > 0,
      current: Math.min(totalSearches, 1),
      target: 1,
      icon: Search,
      color: 'blue'
    },
    {
      id: 'bookmark_scholar',
      titleBn: 'বুকমার্ক স্কলার',
      titleEn: 'Bookmark Scholar',
      descBn: 'কমপক্ষে ৩টি স্টাডি গাইড বা রিসোর্স বুকমার্ক করা',
      descEn: 'Bookmark at least 3 learning guides',
      unlocked: totalBookmarks >= 3,
      current: Math.min(totalBookmarks, 3),
      target: 3,
      icon: Bookmark,
      color: 'amber'
    },
    {
      id: 'ai_power_user',
      titleBn: 'আস্কিও এআই পাওয়ার ইউজার',
      titleEn: 'Askio AI Power User',
      descBn: 'এআই অ্যাসিস্ট্যান্টের সাথে কমপক্ষে ৫টি প্রশ্ন বা পরামর্শ সম্পন্ন করা',
      descEn: 'Ask at least 5 AI guidance prompts',
      unlocked: userAiPromptsCount >= 5,
      current: Math.min(userAiPromptsCount, 5),
      target: 5,
      icon: Sparkles,
      color: 'purple'
    }
  ];

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  const handleConfirmUnsubscribe = async (): Promise<boolean> => {
    try {
      await unsubscribe(user.phone);
    } catch (err) {
      console.warn('BDApps unsubscribe error handled:', err);
    }
    unmarkLocalSubscriber(user.phone);
    clearSubscriptionSession();
    clearDeviceTrustForPhone(user.phone);
    cancelPremium();
    setIsUnsubscribeModalOpen(false);
    updateProfile({
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Unsubscribed'
    });
    await logoutFirebaseUser();
    logout();
    return true;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileUpdates: Partial<UserProfile> = {
      fullName: nameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim(),
      password: passwordInput,
      avatar: avatarInput
    };
    if (ageInput.trim()) profileUpdates.age = ageInput.trim();
    if (genderInput) profileUpdates.gender = genderInput;
    if (religionInput) profileUpdates.religion = religionInput;
    if (bloodGroupInput) profileUpdates.bloodGroup = bloodGroupInput;
    if (professionInput) profileUpdates.profession = professionInput;
    if (addressInput.trim()) profileUpdates.address = addressInput.trim();
    if (cityInput) profileUpdates.city = cityInput;

    updateProfile(profileUpdates);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  const handleTriggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setToastMessage(isBn ? 'ছবি প্রসেস ও ক্লাউডে সেভ করা হচ্ছে...' : 'Uploading and syncing photo...');
        const optimizedFile = await optimizeAvatarImageAsFile(file, 320, 0.85);
        if (user.uid) {
          const downloadUrl = await uploadAvatarToStorage(user.uid, optimizedFile);
          await updateProfile({ avatar: downloadUrl });
          setAvatarInput(downloadUrl);
          setToastMessage(isBn ? 'প্রোফাইল ছবি সফলভাবে ক্লাউডে সেভ হয়েছে!' : 'Profile picture saved across devices!');
          setTimeout(() => setToastMessage(null), 3500);
        } else {
           throw new Error("User UID not found");
        }
      } catch (err) {
        console.error('Avatar upload optimization error:', err);
        setToastMessage(isBn ? 'ছবি আপডেট করা সম্ভব হয়নি। অন্য ছবি দিন।' : 'Could not process photo. Please try another image.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateProfile({ avatar: DEFAULT_AVATAR });
    setAvatarInput(DEFAULT_AVATAR);
    setToastMessage(isBn ? 'প্রোফাইল ছবি মুছে ফেলে ডিফল্ট ছবি সেট করা হয়েছে।' : 'Profile picture reset to default.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleModalImageUpload = () => {
    if (editModalFileInputRef.current) {
      editModalFileInputRef.current.click();
    }
  };

  const handleModalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setToastMessage(isBn ? 'ছবি আপলোড করা হচ্ছে...' : 'Uploading photo...');
        const optimizedFile = await optimizeAvatarImageAsFile(file, 320, 0.85);
        if (user.uid) {
          const downloadUrl = await uploadAvatarToStorage(user.uid, optimizedFile);
          setAvatarInput(downloadUrl);
          setToastMessage(isBn ? 'আপলোড সম্পন্ন!' : 'Upload complete!');
          setTimeout(() => setToastMessage(null), 3500);
        }
      } catch (err) {
        console.error('Modal avatar select error:', err);
        setToastMessage(isBn ? 'আপলোড ব্যর্থ হয়েছে।' : 'Upload failed.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage(isBn ? 'প্রোফাইল লিঙ্ক কপি করা হয়েছে!' : 'Profile link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Filtered Activity List
  const filteredActivities = activities.filter(act => {
    if (activeActivityTab === 'all') return true;
    return act.type === activeActivityTab;
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-xl animate-fade-in flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Image Selection */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Banner Card */}
      <div id="profile-banner-card" className="relative rounded-3xl border border-emerald-400/40 dark:border-emerald-500/50 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 dark:from-[#062c21] dark:via-[#0a3d2e] dark:to-[#041a14] px-6 sm:px-10 py-8 sm:py-12 shadow-lg dark:shadow-[0_16px_40px_-8px_rgba(5,150,105,0.35)] overflow-hidden text-white flex flex-col justify-between min-h-[240px] transition-colors">
        {/* Soft Ambient Glow Elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-400/20 dark:bg-emerald-400/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/20 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent dark:from-emerald-500/15 dark:via-transparent dark:to-transparent pointer-events-none" />

        {/* Top Header Navigation Controls */}
        <div className="flex items-center justify-end z-20 mb-4">
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleShareProfile}
              className="p-2 sm:p-2.5 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/15 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/20 dark:border-white/10 shadow-xs"
              title={isBn ? 'প্রোফাইল শেয়ার করুন' : 'Share Profile'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 sm:p-2.5 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/15 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/20 dark:border-white/10 shadow-xs"
              title={t('nav.settings', language)}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Profile Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left z-20">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center sm:items-start shrink-0">
            <div 
              className="relative group cursor-pointer"
              onClick={handleTriggerImageUpload}
              title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Profile Photo'}
            >
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/90 dark:border-emerald-500/80 shadow-lg group-hover:scale-105 transition-all duration-300"
              />
              <button
                id="avatar-camera-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerImageUpload();
                }}
                title={isBn ? 'ছবি আপলোড করুন' : 'Upload photo'}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-md border-2 border-white dark:border-zinc-900 transition-all cursor-pointer hover:scale-110"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Meta */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
                {user.fullName || (isBn ? 'ব্যবহারকারী' : 'Askio User')}
              </h1>
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[11px] font-bold self-center sm:self-auto backdrop-blur-md">
                <Crown className="w-3.5 h-3.5" />
                <span>Askio Premium</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-emerald-50/90 dark:text-zinc-300 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
              <span>{user.email || (isBn ? 'ইমেইল নেই' : 'No email')}</span>
              <span className="text-white/40 dark:text-zinc-500">•</span>
              <span className="font-mono font-bold text-amber-200 dark:text-emerald-300">{user.phone}</span>
              <span className="text-white/40 dark:text-zinc-500">•</span>
              <span className="inline-flex items-center gap-1 bg-white/20 dark:bg-emerald-900/40 text-white dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-xs border border-white/30 dark:border-emerald-700/60 shadow-2xs backdrop-blur-md">
                <Calendar className="w-3 h-3 text-emerald-200 dark:text-emerald-400" />
                <span>{user.age ? (isBn ? `বয়স: ${user.age} বছর` : `Age: ${user.age} yrs`) : (isBn ? 'বয়স: সেট করুন' : 'Age: Set')}</span>
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 text-white text-[11px] font-medium backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-200 dark:text-emerald-400" />
                <span>{isBn ? 'সদস্য হয়েছেন:' : 'Member since:'} {user.joinedDate}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-white/15 dark:bg-emerald-500/20 text-emerald-100 dark:text-emerald-300 border border-white/20 dark:border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-300 dark:text-amber-400" />
                <span>{isBn ? 'বিডি অ্যাপস ডেইলি (৳২.৭৮/দিন)' : 'BDApps Daily (৳2.78/day)'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Bar inside Banner */}
        <div className="mt-6 flex items-center justify-end z-20">
          <button
            id="edit-profile-sheet-btn"
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs font-extrabold border border-white/80 dark:border-emerald-500 hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700 dark:text-white" />
            <span>{isBn ? 'প্রোফাইল এডিট করুন' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* 0. Personal Details Section (পার্সোনাল ডিটেইলস - হাফ-শো এবং ড্রপডাউন এক্সপ্যান্ড) */}
      <div id="personal-details-section" className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-emerald-900/40 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 sm:space-y-5 transition-all">
        {/* Header with Title on Left, Edit Details and Dropdown Arrow Button on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{isBn ? 'পার্সোনাল ডিটেইলস (ব্যক্তিগত তথ্য)' : 'Personal Details'}</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {isBn ? 'স্মার্ট ফিড' : 'Smart Feed'}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn 
                  ? 'আপনার পেশা ও তথ্যের ওপর ভিত্তি করে Askio AI আপনার ফিড ও রেজাল্ট সাজিয়ে দেয়' 
                  : 'Askio AI personalizes content and study resources based on these traits'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit Details + Dropdown Arrow Button Side by Side */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              id="edit-personal-details-btn"
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-teal-500"
              title={isBn ? 'তথ্য পরিবর্তন করুন' : 'Edit details'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'তথ্য সম্পাদন' : 'Edit Details'}</span>
            </button>

            <button
              id="toggle-personal-details-dropdown"
              onClick={() => setIsPersonalDetailsExpanded(prev => !prev)}
              className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-2xs ${
                isPersonalDetailsExpanded
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
              }`}
              title={isPersonalDetailsExpanded ? (isBn ? 'তথ্য সংক্ষেপ করুন' : 'Collapse details') : (isBn ? 'সম্পূর্ণ তথ্য বিস্তারিত দেখুন' : 'Expand full details')}
              aria-expanded={isPersonalDetailsExpanded}
            >
              <span>{isPersonalDetailsExpanded ? (isBn ? 'সংক্ষেপ করুন' : 'Hide Details') : (isBn ? 'বিস্তারিত দেখুন' : 'View Details')}</span>
              {isPersonalDetailsExpanded ? (
                <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Content Personalization Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-teal-50/30 dark:from-teal-950/40 dark:via-zinc-900 dark:to-emerald-950/20 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-500 text-white shadow-xs shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                {isBn ? 'স্মার্ট কন্টেন্ট রেকমেন্ডেশন ইঞ্জিন' : 'Smart Content Recommendation Engine'}
              </span>
            </div>
            <p className="text-xs text-teal-800/90 dark:text-teal-300/90 mt-0.5 leading-relaxed">
              {user.profession ? (
                isBn ? (
                  <>আপনার পেশা হিসেবে <strong className="font-extrabold text-teal-950 dark:text-teal-100">{getProfessionLabel(user.profession, true)}</strong> নির্বাচন করা আছে। Askio AI আপনার জন্য বোর্ড পাঠ্যবই, গবেষণা ও ক্যারিয়ার গাইড প্রাধান্য দিয়ে কন্টেন্ট প্রস্তুত করছে।</>
                ) : (
                  <>You have selected <strong className="font-extrabold text-teal-950 dark:text-teal-100">{getProfessionLabel(user.profession, false)}</strong>. Askio AI prioritizes relevant books, research papers, and growth guides for you.</>
                )
              ) : (
                isBn ? (
                  <>আপনি কি শিক্ষার্থী, শিক্ষক নাকি কোনো পেশাজীবী? আপনার পেশা ও তথ্য নির্বাচন করুন যাতে Askio AI আপনার পড়াশোনা ও ক্যারিয়ারে সর্বোচ্চ সাহায্য করতে পারে।</>
                ) : (
                  <>Select your profession (Student, Teacher, Tech, Healthcare, Business, etc.) so Askio AI can present the most relevant guides and books for you.</>
                )
              )}
            </p>
          </div>
        </div>

        {/* HALF-SHOW MODE: Sleek, compact summary preview strip when collapsed */}
        {!isPersonalDetailsExpanded ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Snapshot 1: Profession */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'পেশা / ভূমিকা' : 'Profession'}
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {getProfessionLabel(user.profession, isBn)}
                  </span>
                </div>
              </div>

              {/* Snapshot 2: Age & Blood Group */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'বয়স ও রক্তের গ্রুপ' : 'Age & Blood'}
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {user.age ? (isBn ? `${user.age} বছর` : `${user.age} yrs`) : (isBn ? 'বয়স -' : 'Age -')}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    {user.bloodGroup ? (
                      <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold">
                        {user.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'গ্রুপ -' : 'Blood -'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Snapshot 3: City & Address */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'শহর / অবস্থান' : 'City / Location'}
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.city || (isBn ? 'বাংলাদেশ' : 'Bangladesh')}
                  </span>
                </div>
              </div>
            </div>

            {/* Clickable interactive dropdown prompt bar */}
            <div 
              onClick={() => setIsPersonalDetailsExpanded(true)}
              className="p-3 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/40 hover:bg-teal-50/60 dark:hover:bg-teal-950/30 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-between text-xs group"
              title={isBn ? 'সকল ব্যক্তিগত তথ্য দেখতে ক্লিক করুন' : 'Click to view all personal details'}
            >
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium truncate">
                <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="truncate">
                  {isBn 
                    ? 'আরো ৬টি তথ্য (মোবাইল নম্বর, ইমেইল, জেন্ডার, ধর্ম, পূর্ণ ঠিকানা) দেখতে ড্রপডাউনে চাপুন' 
                    : 'Tap to view 6 more traits (Phone, Email, Gender, Religion, Full Address)'}
                </span>
              </div>
              <div className="flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                <span>{isBn ? 'সকল তথ্য দেখুন' : 'View All'}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : (
          /* FULL-SHOW MODE: Comprehensive structured grid with all 10 details */
          <div className="space-y-4 transition-all animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* 1. Full Name */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'পূর্ণ নাম' : 'Full Name'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.fullName || (isBn ? 'দেওয়া হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>

              {/* 2. Phone Number */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.phone || (isBn ? 'দেওয়া হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>

              {/* 3. Email Address */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.email || (isBn ? 'দেওয়া হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>

              {/* 4. Age */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'বয়স' : 'Age'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.age ? (isBn ? `${user.age} বছর` : `${user.age} years`) : (isBn ? 'সেট করা হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>

              {/* 5. Gender */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'জেন্ডার' : 'Gender'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {getGenderLabel(user.gender, isBn)}
                  </span>
                </div>
              </div>

              {/* 6. Religion */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'ধর্ম / বিশ্বাস' : 'Religion'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {getReligionLabel(user.religion, isBn)}
                  </span>
                </div>
              </div>

              {/* 7. Blood Group */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                  </span>
                  <div className="pt-0.5">
                    {user.bloodGroup ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs border border-rose-200 dark:border-rose-800/80">
                        <Droplet className="w-3 h-3 mr-1 text-rose-500 fill-rose-500" />
                        {user.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {isBn ? 'সেট করা হয়নি' : 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 8. Profession */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'পেশা / ভূমিকা' : 'Profession'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {getProfessionLabel(user.profession, isBn)}
                  </span>
                </div>
              </div>

              {/* 9. City / District */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'শহর / জেলা' : 'City / District'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.city || (isBn ? 'সেট করা হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>

              {/* 10. Address (Full Width on lg screens) */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3 sm:col-span-2 lg:col-span-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block truncate">
                    {isBn ? 'বর্তমান ঠিকানা / এলাকা' : 'Address / Area'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                    {user.address || (isBn ? 'সেট করা হয়নি' : 'Not set')}
                  </span>
                </div>
              </div>
            </div>

            {/* Collapse button at the bottom of full-show */}
            <div className="pt-1 flex justify-center">
              <button
                id="collapse-personal-details-bottom-btn"
                onClick={() => setIsPersonalDetailsExpanded(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                <span>{isBn ? 'তথ্য সংক্ষেপ করুন' : 'Hide / Collapse Details'}</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Real Profile Analytics & Overview */}
      <div id="profile-analytics-section" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{isBn ? 'প্রোফাইল অ্যানালিটিক্স ও পরিসংখ্যান' : 'Profile Analytics & Metrics'}</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] font-extrabold">Real-time</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? 'আপনার অ্যাকাউন্টের বাস্তব পরিসংখ্যান ও শিখন সম্পর্কিত ডেটা' : 'Real metrics generated from your actual usage on Askio'}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-1.5 py-0.5 rounded">Searches</span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalSearches}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {isBn ? 'মোট অনুসন্ধান' : 'Total Searches'}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">Bookmarks</span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalBookmarks}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {isBn ? 'সংরক্ষিত বুকমার্ক' : 'Saved Bookmarks'}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">Read</span>
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {totalViews}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              {isBn ? 'পঠিত গাইড' : 'Read Guides'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Real Recent Activities & Update History */}
      <div id="profile-activity-section" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                {isBn ? 'সাম্প্রতিক কার্যকলাপ ও আপডেট হিস্ট্রি' : 'Recent Activity & Update History'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? 'আপনার সাম্প্রতিক অনুসন্ধান, বুকমার্ক ও এআই ব্যবহারের বাস্তব ইতিহাস' : 'Real-time log of your actual queries and actions'}
              </p>
            </div>
          </div>

          {/* Activity Category Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setActiveActivityTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeActivityTab === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {isBn ? 'সব' : 'All'}
            </button>
            <button
              onClick={() => setActiveActivityTab('ai')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeActivityTab === 'ai'
                  ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Askio AI
            </button>
            <button
              onClick={() => setActiveActivityTab('search')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeActivityTab === 'search'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {isBn ? 'সার্চ' : 'Search'}
            </button>
            <button
              onClick={() => setActiveActivityTab('bookmark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeActivityTab === 'bookmark'
                  ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {isBn ? 'বুকমার্ক' : 'Bookmarks'}
            </button>
          </div>
        </div>

        {/* Timeline Log List */}
        <div className="space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.slice(0, 8).map((act) => (
              <div 
                key={act.id}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className={`p-2 rounded-xl shrink-0 ${
                  act.type === 'ai' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400' :
                  act.type === 'search' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400' :
                  act.type === 'bookmark' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                }`}>
                  {act.type === 'ai' && <Sparkles className="w-4 h-4" />}
                  {act.type === 'search' && <Search className="w-4 h-4" />}
                  {act.type === 'bookmark' && <Bookmark className="w-4 h-4" />}
                  {act.type === 'view' && <Eye className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {act.title}
                    </p>
                    <span className="text-[10px] font-medium text-zinc-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(act.timestamp, isBn)}
                    </span>
                  </div>

                  {act.category && (
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 text-[10px] font-medium">
                      {act.category}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs font-medium bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              {isBn 
                ? 'এখনো কোনো সাম্প্রতিক কার্যক্রমের রেকর্ড নেই। আপনি কোনো সার্চ বা এআই সাহায্য নিলে তা এখানে যুক্ত হবে।' 
                : 'No recent activity logged yet. Your searches and AI prompts will appear here dynamically.'}
            </div>
          )}
        </div>
      </div>

      {/* 3. Achievements & Badges (Functional System) */}
      <div id="profile-achievements-section" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  {isBn ? 'অ্যাচিভমেন্টস ও ব্যাজ' : 'Achievements & Badges'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300/60 dark:border-amber-800/60">
                  {unlockedAchievementsCount} / {achievements.length} {isBn ? 'আনলকড' : 'Unlocked'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isBn 
                  ? 'আপনার প্ল্যাটফর্ম ব্যবহার ও অ্যাক্টিভিটি অর্জনের মাধ্যমে ব্যাজসমূহ আনলক হবে' 
                  : 'Earn badges by actively exploring guides, searching, and asking Askio AI'}
              </p>
            </div>
          </div>

          <button
            id="view-all-achievements-btn"
            onClick={() => setIsAchievementsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Award className="w-4 h-4" />
            <span>{isBn ? 'সকল অ্যাচিভমেন্টস দেখুন' : 'View All Achievements'}</span>
          </button>
        </div>

        {/* Display unlocked badges summary preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  ach.unlocked 
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80' 
                    : 'bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 opacity-70'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  ach.unlocked 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isBn ? ach.titleBn : ach.titleEn}
                    </h4>
                    {ach.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{isBn ? 'আনলকড' : 'Unlocked'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200/80 dark:bg-zinc-700/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{ach.current}/{ach.target}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                    {isBn ? ach.descBn : ach.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Subscription Plan Details (No "Micro" terms) */}
      <div id="profile-subscription-card" className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm text-zinc-900 dark:text-white space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{isBn ? 'আপনার সক্রিয় বিডি অ্যাপস সাবস্ক্রিপশন' : 'Your Active BDApps Subscription'}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  {isBn ? 'সক্রিয়' : 'Active'}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? 'বিডি অ্যাপস পেমেন্ট গেটওয়ে • দৈনিক অটো-রিনিউয়াল' : 'BDApps Payment Gateway • Auto-Renews Daily'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block">{isBn ? 'প্ল্যানের নাম:' : 'Plan Name:'}</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">BDApps Daily</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block">{isBn ? 'দৈনিক চার্জ:' : 'Daily Charge:'}</span>
            <strong className="text-zinc-900 dark:text-white font-bold text-sm">
              {isBn ? '৳২.৭৮ / দিন (ভ্যাটসহ)' : '৳2.78 / day (incl. VAT)'}
            </strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Channel:'}</span>
            <strong className="text-amber-600 dark:text-amber-400 font-bold text-sm">
              {isBn ? 'রবি / এয়ারটেল ব্যালেন্স' : 'Robi / Airtel Balance'}
            </strong>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {isBn 
              ? 'আপনার বিডি অ্যাপস সাবস্ক্রিপশন সক্রিয় রয়েছে। আপনি যেকোনো সময় নিচে আনসাবস্ক্রাইব করতে পারবেন।' 
              : 'Your BDApps subscription is active. Manage or unsubscribe anytime below.'}
          </span>
        </div>
      </div>

      {/* 5. Theme & Language Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                {isBn ? 'অ্যাপের থিম ও ভাষা পছন্দ' : 'App Theme & Language'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? 'আপনার পছন্দমতো ভিজ্যুয়াল মোড ও ভাষা পরিবর্তন করুন' : 'Personalize your visual appearance and interface language'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Switcher */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5 block flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{isBn ? 'অ্যাপ থিম (Dark / Light)' : 'App Theme (Dark / Light)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="profile-theme-light-btn"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-amber-600 border border-amber-300 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{isBn ? 'লাইট মোড' : 'Light Mode'}</span>
              </button>
              <button
                type="button"
                id="profile-theme-dark-btn"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/40 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{isBn ? 'ডার্ক মোড' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2.5 block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{isBn ? 'ইন্টারফেস ভাষা (Language)' : 'Interface Language'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="profile-lang-bn-btn"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'bn'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <span>বাংলা (BN)</span>
              </button>
              <button
                type="button"
                id="profile-lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                <span>English (EN)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Account & Session Management Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                {isBn ? 'অ্যাকাউন্ট ও সেশন' : 'Account & Session'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isBn ? `${user.fullName || 'ব্যবহারকারী'} এর সক্রিয় অ্যাকাউন্ট` : `Current session active for ${user.fullName || 'User'}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              {isBn ? 'লগইন অ্যাকাউন্ট:' : 'Logged in as:'} <span className="font-mono text-zinc-900 dark:text-zinc-100">{user.email || user.phone}</span>
            </p>
            <p>
              {isBn 
                ? 'লগআউট করলে এই সেশন বন্ধ হবে। আর আনসাবস্ক্রাইব করলে অ্যাকাউন্ট ও BDApps সাবস্ক্রিপশন সম্পূর্ণ বাতিল হয়ে যাবে।' 
                : 'Logging out terminates your session. Unsubscribing completely cancels your account & BDApps subscription.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* Change Password Option */}
            <button
              id="profile-main-change-password-btn"
              onClick={() => {
                setPassError('');
                setPassSuccess('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsChangePasswordModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-emerald-500" />
              <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
            </button>

            {/* Logout Option */}
            <button
              id="profile-main-logout-btn"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>{isBn ? 'লগ আউট ফ্রম আস্কিও' : 'Log Out from Askio'}</span>
            </button>

            {/* Unsubscribe Option */}
            <button
              id="profile-main-unsubscribe-btn"
              onClick={() => setIsUnsubscribeModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isBn ? 'আনসাবস্ক্রাইব ফ্রম আস্কিও' : 'Unsubscribe from Askio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            id="change-password-modal"
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-change-password-modal-btn"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isBn ? 'আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন' : 'Secure your Askio account'}
                </p>
              </div>
            </div>

            {passError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'বর্তমান পাসওয়ার্ড (Current Password)' : 'Current Password'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current-password-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (Min. 6 characters)'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm New Password'}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="confirm-new-password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  id="submit-change-password-btn"
                  disabled={passLoading || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {passLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isBn ? 'পরিবর্তন হচ্ছে...' : 'Updating...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isBn ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logoutFirebaseUser();
          logout();
        }}
      />

      {/* Unsubscribe Confirmation Modal */}
      <UnsubscribeModal
        isOpen={isUnsubscribeModalOpen}
        onClose={() => setIsUnsubscribeModalOpen(false)}
        mobileNumber={user.phone}
        onConfirmUnsubscribe={handleConfirmUnsubscribe}
      />

      {/* All Achievements Modal */}
      {isAchievementsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setIsAchievementsModalOpen(false)}
        >
          <div 
            id="all-achievements-modal"
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {isBn ? 'সকল অ্যাচিভমেন্টস ও ব্যাজ তালিকা' : 'All Achievements & Badges List'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {isBn ? 'মোট অর্জিত ব্যাজ:' : 'Unlocked count:'} <strong className="text-amber-600 dark:text-amber-400">{unlockedAchievementsCount} / {achievements.length}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAchievementsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div 
                    key={ach.id}
                    className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                      ach.unlocked 
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      ach.unlocked 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                          {isBn ? ach.titleBn : ach.titleEn}
                        </h4>

                        {ach.unlocked ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isBn ? 'আনলকড' : 'Unlocked'}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{isBn ? 'লকড' : 'Locked'} ({ach.current}/{ach.target})</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {isBn ? ach.descBn : ach.descEn}
                      </p>

                      {/* Progress bar */}
                      <div className="pt-1">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              ach.unlocked ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (ach.current / ach.target) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* In-App Edit Profile Modal */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            id="edit-profile-sheet"
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all my-auto cursor-default max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  {isBn ? 'প্রোফাইল ও ব্যক্তিগত তথ্য সম্পাদন' : 'Edit Profile & Personal Details'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isBn ? 'আপনার ব্যক্তিগত বিবরণ ও পছন্দসমূহ আপডেট করুন' : 'Update your personal profile details and preferences'}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{isBn ? 'প্রোফাইল ও ব্যক্তিগত তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile and personal details updated successfully!'}</span>
              </div>
            )}

            {/* Hidden File Input for Modal Image Upload */}
            <input 
              type="file"
              ref={editModalFileInputRef}
              onChange={handleModalFileSelect}
              accept="image/*"
              className="hidden"
            />

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Picture Management Section */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {isBn ? 'প্রোফাইল ছবি' : 'Profile Picture'}
                </label>

                <div className="flex flex-wrap items-center gap-3.5">
                  <img
                    src={avatarInput || DEFAULT_AVATAR}
                    alt="Current avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleModalImageUpload}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload photo'}</span>
                    </button>

                    {avatarInput && avatarInput !== DEFAULT_AVATAR && (
                      <button
                        type="button"
                        onClick={() => setAvatarInput(DEFAULT_AVATAR)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ছবি রিমুভ করুন' : 'Remove photo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                    {isBn ? 'অথবা নিচের যেকোনো একটি অবতার বেছে নিন:' : 'Or choose an avatar preset:'}
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVATAR_PRESETS.map((preset, index) => {
                      const isSelected = avatarInput === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAvatarInput(preset.url)}
                          className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                            isSelected 
                              ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-110 shadow-sm' 
                              : 'opacity-75 hover:opacity-100 hover:scale-105'
                          }`}
                          title={`Avatar ${index + 1}`}
                        >
                          <img
                            src={preset.url}
                            alt={`Avatar ${index + 1}`}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Basic Account Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {isBn ? 'অ্যাকাউন্ট বিবরণ' : 'Account Credentials'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'পূর্ণ নাম' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details Section in Modal */}
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isBn ? 'পার্সোনাল ডিটেইলস (ব্যক্তিগত তথ্য)' : 'Personal Details'}</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold">
                    {isBn ? 'কন্টেন্ট পার্সোনালাইজেশন' : 'Content Targeting'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Profession / Role */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                      <span>{isBn ? 'পেশা / ভূমিকা (Profession)' : 'Profession / Role'}</span>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-normal">
                        {isBn ? '💡 কন্টেন্ট রিকমেন্ডেশনের জন্য গুরুত্বপূর্ণ' : '💡 Used for smart content feed'}
                      </span>
                    </label>
                    <select
                      value={professionInput}
                      onChange={(e) => setProfessionInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">{isBn ? '-- পেশা নির্বাচন করুন --' : '-- Select Profession --'}</option>
                      {PROFESSION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isBn ? opt.labelBn : opt.labelEn}
                        </option>
                      ))}
                    </select>
                    {professionInput && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                        {isBn 
                          ? PROFESSION_OPTIONS.find(p => p.value === professionInput)?.hintBn 
                          : PROFESSION_OPTIONS.find(p => p.value === professionInput)?.hintEn}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'বয়স (Age)' : 'Age'}
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="110"
                      placeholder={isBn ? 'যেমন: ২৪' : 'e.g. 24'}
                      value={ageInput}
                      onChange={(e) => setAgeInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'জেন্ডার (Gender)' : 'Gender'}
                    </label>
                    <select
                      value={genderInput}
                      onChange={(e) => setGenderInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">{isBn ? '-- নির্বাচন করুন --' : '-- Select Gender --'}</option>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isBn ? opt.labelBn : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'ধর্ম (Religion)' : 'Religion'}
                    </label>
                    <select
                      value={religionInput}
                      onChange={(e) => setReligionInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">{isBn ? '-- নির্বাচন করুন --' : '-- Select Religion --'}</option>
                      {RELIGION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isBn ? opt.labelBn : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'রক্তের গ্রুপ (Blood Group)' : 'Blood Group'}
                    </label>
                    <select
                      value={bloodGroupInput}
                      onChange={(e) => setBloodGroupInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">{isBn ? '-- নির্বাচন করুন --' : '-- Select Blood Group --'}</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City / District */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'বর্তমান শহর / জেলা (City)' : 'City / District'}
                    </label>
                    <select
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">{isBn ? '-- শহর নির্বাচন করুন --' : '-- Select City --'}</option>
                      {BANGLADESH_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isBn ? 'বর্তমান ঠিকানা (Address)' : 'Street Address'}
                    </label>
                    <input
                      type="text"
                      placeholder={isBn ? 'বাড়ি, রোড, এলাকা বা গ্রাম' : 'House, street or area'}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

