import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
  BarChart3,
  History,
  CheckCircle
} from 'lucide-react';
import { UnsubscribeModal } from '../components/UnsubscribeModal';
import { LogoutModal } from '../components/LogoutModal';
import { unsubscribe, clearSubscriptionSession, unmarkLocalSubscriber } from '../services/bdapps';
import { logoutFirebaseUser } from '../services/firebase';
import { clearDeviceTrustForPhone } from '../services/deviceTrust';
import { t } from '../constants/translations';

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

  const [nameInput, setNameInput] = useState(user.fullName);
  const [emailInput, setEmailInput] = useState(user.email);
  const [phoneInput, setPhoneInput] = useState(user.phone);
  const [passwordInput, setPasswordInput] = useState(user.password || '');
  const [avatarInput, setAvatarInput] = useState(user.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Real user stats
  const totalSearches = recentSearches.length;
  const totalBookmarks = bookmarkedIds.length;
  const totalViews = recentlyViewedIds.length;
  const userAiPromptsCount = chatMessages ? chatMessages.filter(m => m.sender === 'user').length : 0;

  // Real Achievements
  const achievements = [
    {
      id: 'bdapps_subscriber',
      titleBn: 'বিডি অ্যাপস সাবস্ক্রাইবার',
      titleEn: 'BDApps Subscriber',
      descBn: 'বিডি অ্যাপস পেমেন্ট সম্পন্ন করে আস্কিও প্রিমিয়াম অ্যাক্সেস সক্রিয় করা',
      descEn: 'Active BDApps payment & premium access',
      unlocked: Boolean(user.isPremium),
      current: user.isPremium ? 1 : 0,
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
    updateProfile({
      fullName: nameInput,
      email: emailInput,
      phone: phoneInput,
      password: passwordInput,
      avatar: avatarInput
    });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          updateProfile({ avatar: result });
          setAvatarInput(result);
          setToastMessage(isBn ? 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!' : 'Profile picture updated successfully!');
          setTimeout(() => setToastMessage(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
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
      <div className="relative rounded-3xl border border-emerald-900/40 dark:border-zinc-800 bg-gradient-to-b from-emerald-600 via-emerald-950 to-zinc-950 px-6 sm:px-10 py-10 sm:py-14 shadow-xl overflow-hidden text-white flex flex-col justify-between min-h-[260px]">
        {/* Top Header Navigation Controls */}
        <div className="flex items-center justify-end z-20 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
              title={isBn ? 'প্রোফাইল শেয়ার করুন' : 'Share Profile'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 sm:p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
              title={t('nav.settings', language)}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Profile Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left z-20">
          {/* Profile Avatar */}
          <div 
            className="relative group cursor-pointer shrink-0"
            onClick={handleTriggerImageUpload}
            title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Profile Photo'}
          >
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-400/80 shadow-2xl group-hover:scale-105 transition-all duration-300"
            />
            <button
              id="avatar-camera-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTriggerImageUpload();
              }}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl border-2 border-white/80 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Meta */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight drop-shadow-md">
                {user.fullName}
              </h1>
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold self-center sm:self-auto">
                <Crown className="w-3.5 h-3.5" />
                <span>Askio Premium</span>
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              {user.email} • <span className="font-mono text-emerald-300">{user.phone}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'সদস্য হয়েছেন:' : 'Member since:'} {user.joinedDate}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
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
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs font-bold border border-emerald-400/30"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রোফাইল এডিট করুন' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* 1. Real Profile Analytics & Overview */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
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
                      {act.timestamp}
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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
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
      <div className="bg-gradient-to-br from-emerald-900/10 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-lg text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{isBn ? 'আপনার সক্রিয় বিডি অ্যাপস সাবস্ক্রিপশন' : 'Your Active BDApps Subscription'}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/40">
                  {isBn ? 'সক্রিয়' : 'Active'}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {isBn ? 'বিডি অ্যাপস পেমেন্ট গেটওয়ে • দৈনিক অটো-রিনিউয়াল' : 'BDApps Payment Gateway • Auto-Renews Daily'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-zinc-400 text-[10px] block">{isBn ? 'প্ল্যানের নাম:' : 'Plan Name:'}</span>
            <strong className="text-emerald-400 font-bold text-sm">BDApps Daily</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-zinc-400 text-[10px] block">{isBn ? 'দৈনিক চার্জ:' : 'Daily Charge:'}</span>
            <strong className="text-white font-bold text-sm">
              {isBn ? '৳২.৭৮ / দিন (ভ্যাটসহ)' : '৳2.78 / day (incl. VAT)'}
            </strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-zinc-400 text-[10px] block">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment Channel:'}</span>
            <strong className="text-amber-300 font-bold text-sm">
              {isBn ? 'রবি / এয়ারটেল ব্যালেন্স' : 'Robi / Airtel Balance'}
            </strong>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                {isBn ? `${user.fullName} এর সক্রিয় অ্যাকাউন্ট` : `Current session active for ${user.fullName}`}
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
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all my-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isBn ? 'প্রোফাইল তথ্য সম্পাদন' : 'Edit Profile Information'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{isBn ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'পূর্ণ নাম' : 'Full Name'}
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
                  {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
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

