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
  Sparkles
} from 'lucide-react';
import { UnsubscribeModal } from '../components/UnsubscribeModal';
import { unsubscribe, clearSubscriptionSession, unmarkLocalSubscriber } from '../services/bdapps';

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
    setSubscriptionModalOpen 
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState(user.fullName);
  const [emailInput, setEmailInput] = useState(user.email);
  const [phoneInput, setPhoneInput] = useState(user.phone);
  const [passwordInput, setPasswordInput] = useState(user.password || '');
  const [avatarInput, setAvatarInput] = useState(user.avatar);

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
    // Directly redirect to landing page by ending the session
    updateProfile({
      isLoggedIn: false,
      isPremium: false,
      membershipPlan: 'Unsubscribed'
    });
    return true;
  };
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    const newUrl = prompt('Enter a new image URL for your avatar:', user.avatar);
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
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Facebook-Style Avatar Pen Overlay */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl"
              />
              {/* Circular edit pen badge positioned over avatar */}
              <button
                id="avatar-pen-badge"
                onClick={handleAvatarChangePrompt}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-lg border-2 border-white dark:border-zinc-900 transition-colors cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {/* User Name with Secondary Quick-Edit Icon */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {user.fullName}
                </h1>
                <button
                  id="quick-edit-name-btn"
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                  title="Quick edit profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.email} • {user.phone}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Member since {user.joinedDate}
                </span>

                {user.isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>{user.membershipPlan}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSubscriptionModalOpen(true)}
                    className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:underline"
                  >
                    Upgrade (৳2/day)
                  </button>
                )}
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
              <span>Edit Profile</span>
            </button>

            <button
              id="logout-btn"
              onClick={logout}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Activity Stats (MyActivityScreen section) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Personal Activity Stats
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
              Total Searches
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
              Saved Bookmarks
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
              Recent Views
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subscription & Membership Management Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              user.isPremium 
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}>
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                Subscription & Membership
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                BDApps Telco Micro-Billing & Member Status
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            user.isPremium
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {user.isPremium ? 'Active Premium' : 'Free Tier'}
          </span>
        </div>

        {user.isPremium ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">Current Plan:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.membershipPlan || 'Daily Micro (৳2.78/day)'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">Subscribed Phone (Carrier):</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{user.phone} (Robi / Cirkle)</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">Billing Model:</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">৳2.78 / day auto-deducted from mobile balance</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-zinc-400">
                Cancel your daily telco plan anytime. When clicked, you will be prompted to confirm.
              </p>

              <button
                id="profile-unsubscribe-btn"
                onClick={() => setIsUnsubscribeModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Unsubscribe from Askio</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You are currently on the Free Tier with limited AI guidance queries and catalog downloads.
            </p>
            <button
              id="profile-upgrade-btn"
              onClick={() => setSubscriptionModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Askio Premium (৳2.78/day)</span>
            </button>
          </div>
        )}
      </div>

      {/* Chronological Activity Log */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Chronological Activity Log
        </h3>

        <div className="space-y-3">
          {activities.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <h5 className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {act.title}
                  </h5>
                  {act.category && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {act.category}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-zinc-400 shrink-0">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Account Session & Log Out Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                Account & Session
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Current session active for {user.fullName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              Logged in as: <span className="font-mono text-zinc-900 dark:text-zinc-100">{user.email || user.phone}</span>
            </p>
            <p>
              Logging out will securely terminate your session on this device and return you to the Askio landing page.
            </p>
          </div>

          <button
            id="profile-main-logout-btn"
            onClick={logout}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of Askio</span>
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

      {/* In-App Edit Profile Sheet / Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            id="edit-profile-sheet"
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Edit Profile Information
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
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="profile-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="profile-email-input"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="profile-phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="profile-password-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  id="profile-avatar-input"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
