import React, { useState } from 'react';
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
  Moon
} from 'lucide-react';
import { UnsubscribeModal } from '../components/UnsubscribeModal';
import { unsubscribe, clearSubscriptionSession, unmarkLocalSubscriber } from '../services/bdapps';
import { logoutFirebaseUser } from '../services/firebase';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState(user.fullName);
  const [emailInput, setEmailInput] = useState(user.email);
  const [phoneInput, setPhoneInput] = useState(user.phone);
  const [passwordInput, setPasswordInput] = useState(user.password || '');
  const [avatarInput, setAvatarInput] = useState(user.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleConfirmUnsubscribe = async (): Promise<boolean> => {
    try {
      await unsubscribe(user.phone);
    } catch (err) {
      console.warn('BDApps unsubscribe error handled:', err);
    }
    unmarkLocalSubscriber(user.phone);
    clearSubscriptionSession();
    cancelPremium();
    setIsUnsubscribeModalOpen(false);
    updateProfile({
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Unsubscribed'
    });
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

  const handleAvatarChangePrompt = () => {
    const newUrl = prompt(
      isBn ? 'আপনার প্রোফাইল ছবির জন্য একটি ইমেজ ইউআরএল দিন:' : 'Enter a new image URL for your avatar:',
      user.avatar
    );
    if (newUrl && newUrl.trim()) {
      setAvatarInput(newUrl.trim());
      updateProfile({ avatar: newUrl.trim() });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Card Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Decorative backdrop banner */}
        <div className="h-32 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-zinc-900 mb-6 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title={t('nav.settings', language)}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar & Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl"
              />
              <button
                id="avatar-pen-badge"
                onClick={handleAvatarChangePrompt}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg border-2 border-white dark:border-zinc-900 transition-colors cursor-pointer"
                title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Profile Photo'}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {user.fullName}
                </h1>
                <button
                  id="quick-edit-name-btn"
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                  title={isBn ? 'প্রোফাইল সম্পাদন' : 'Quick edit profile'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.email} • {user.phone}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  {isBn ? 'সদস্য হয়েছেন' : 'Member since'} {user.joinedDate}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isBn ? 'সক্রিয় ব্যবহারকারী' : 'Active Member'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="edit-profile-sheet-btn"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}</span>
            </button>

            <button
              id="logout-btn"
              onClick={async () => {
                await logoutFirebaseUser();
                logout();
              }}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
              title={isBn ? 'লগ আউট' : 'Sign Out'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Activity Stats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {isBn ? 'ব্যক্তিগত অ্যাক্টিভিটি পরিসংখ্যান' : 'Personal Activity Stats'}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
            <div className="w-8 h-8 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <Search className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {recentSearches.length * 3 + 12}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {isBn ? 'মোট অনুসন্ধান' : 'Total Searches'}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
            <div className="w-8 h-8 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {bookmarkedIds.length}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {isBn ? 'সংরক্ষিত বুকমার্ক' : 'Saved Bookmarks'}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
            <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Eye className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {recentlyViewedIds.length}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {isBn ? 'সাম্প্রতিক পঠিত' : 'Recent Views'}
            </span>
          </div>
        </div>
      </div>

      {/* Theme & Language Preferences */}
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

      {/* Account & Session Management Section */}
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              {isBn ? 'লগইন অ্যাকাউন্ট:' : 'Logged in as:'} <span className="font-mono text-zinc-900 dark:text-zinc-100">{user.email || user.phone}</span>
            </p>
            <p>
              {isBn 
                ? 'লগআউট করলে এই ডিভাইসের সেশন বন্ধ হবে এবং আপনাকে ল্যান্ডিং পেজে ফিরিয়ে নেওয়া হবে।' 
                : 'Logging out will securely terminate your session on this device and return you to the landing page.'}
            </p>
          </div>

          <button
            id="profile-main-logout-btn"
            onClick={logout}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? 'Askio থেকে লগআউট করুন' : 'Log Out of Askio'}</span>
          </button>
        </div>
      </div>

      {/* Unsubscribe Confirmation Modal */}
      <UnsubscribeModal
        isOpen={isUnsubscribeModalOpen}
        onClose={() => setIsUnsubscribeModalOpen(false)}
        mobileNumber={user.phone}
        onConfirmUnsubscribe={handleConfirmUnsubscribe}
      />

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
