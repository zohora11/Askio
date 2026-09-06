import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Search, 
  Sparkles, 
  Target, 
  HeartPulse, 
  Bookmark, 
  User, 
  Bell, 
  Globe, 
  Settings, 
  Bot, 
  Plus,
  Compass,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { HomeScreen } from '../screens/HomeScreen';
import { AiAssistantScreen } from '../screens/AiAssistantScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ResourceDetailModal } from './ResourceDetailModal';
import { AuthModal } from './AuthModal';
import { AppLogo } from './AppLogo';
import { ChatbotAvatar } from './ChatbotAvatar';
import { SubscriptionModal } from './SubscriptionModal';
import { DailyWellnessModal } from './DailyWellnessModal';
import { LogoutModal } from './LogoutModal';
import { logoutFirebaseUser } from '../services/firebase';
import { t } from '../constants/translations';

interface MainShellProps {
  onOpenLandingPage?: () => void;
}

export const MainShell: React.FC<MainShellProps> = ({ onOpenLandingPage }) => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    unreadNotificationsCount, 
    language, 
    setLanguage, 
    theme,
    setTheme,
    setSubscriptionModalOpen,
    setAuthModalOpen,
    logout
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const navItems = [
    { id: 'home', label: t('nav.home', language), icon: Home },
    { id: 'search', label: t('nav.search', language), icon: Search },
    { id: 'ai', label: t('nav.ai', language), icon: Sparkles },
    { id: 'goals', label: t('nav.goals', language), icon: Target },
    { id: 'health', label: t('nav.health', language), icon: Compass },
    { id: 'library', label: t('nav.library', language), icon: Bookmark },
    { id: 'profile', label: t('nav.profile', language), icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* --- TOP FLOATING GLASS APPBAR (OPTIMIZED FOR TABLET, MOBILE & DESKTOP) --- */}
      <header 
        id="floating-top-appbar"
        className="fixed top-3 inset-x-3 sm:inset-x-6 max-w-7xl mx-auto z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl backdrop-saturate-150 border border-zinc-200/75 dark:border-zinc-800/75 shadow-[0_8px_30px_rgb(0,0,0,0.07)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] rounded-2xl sm:rounded-3xl px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all"
      >
        {/* Far Left: App Logo & App Name (Askio) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <AppLogo 
            id="brand-logo"
            onClick={() => {
              setActiveTab('home');
              setIsMobileMenuOpen(false);
            }}
            subtitle={language === 'bn' ? 'স্মার্ট হাব' : 'Smart Hub'}
            subtitleClassName="hidden lg:inline text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5 truncate"
            imgClassName="h-8 sm:h-9 md:h-10 w-auto"
          />
        </div>

        {/* Right Side: Quick Search Bar on the right, and Three-Bar Menu on the far right */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Quick Search Bar */}
          <div 
            id="header-quick-search"
            onClick={() => {
              setActiveTab('search');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs text-zinc-500 dark:text-zinc-400 w-32 xs:w-44 sm:w-56 md:w-64 lg:w-72 cursor-pointer transition-all border border-zinc-200/70 dark:border-zinc-700/70 shadow-2xs"
            title={t('nav.search_placeholder', language)}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 dark:text-zinc-400 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs font-medium">
              {t('nav.search_placeholder', language)}
            </span>
            <span className="hidden md:inline-block ml-auto px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700/80 text-[9px] sm:text-[10px] font-mono text-zinc-600 dark:text-zinc-300 shrink-0">⌘K</span>
          </div>

          {/* Far Right: Three-Bars Menu Button ("থ্রি বার") */}
          <button
            id="three-bars-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            aria-label="Toggle Menu"
            title={language === 'bn' ? 'থ্রি-বার মেনু' : 'Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-emerald-500" />
            ) : (
              <>
                <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-zinc-800 dark:text-zinc-200" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                )}
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- THREE-BAR FLOATING GLASS MENU POPOVER / DRAWER --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            id="three-bar-drawer-panel"
            className="fixed top-16 sm:top-18 md:top-20 right-3 sm:right-6 md:right-8 w-[calc(100%-24px)] max-w-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl rounded-3xl space-y-2.5 max-h-[85vh] overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Menu Title & Close Button */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {language === 'bn' ? 'মেনু ও সেটিংস' : 'Menu & Settings'}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Profile Option */}
            <div 
              id="menu-profile-card"
              onClick={() => {
                setActiveTab('profile');
                setIsMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={user.avatar} 
                  alt={user.fullName || 'User'} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {user.fullName || (language === 'bn' ? 'ব্যবহারকারী' : 'Askio User')}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.phone || user.email || (language === 'bn' ? 'প্রোফাইল দেখতে ট্যাপ করুন' : 'Tap to view profile')}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shrink-0 flex items-center gap-1">
                <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* 2. BDApps Subscription Status */}
            <div 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSubscriptionModalOpen(true);
              }}
              className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                    {language === 'bn' ? 'BDApps সাবস্ক্রিপশন' : 'BDApps Subscription'}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {user.membershipPlan || '৳২.৭৮/দিন (সক্রিয়)'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>

            {/* 3. Notifications Option */}
            <button
              id="menu-notifications-btn"
              onClick={() => {
                setActiveTab('notifications');
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span>{language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</span>
              </div>
              {unreadNotificationsCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-xs">
                  {unreadNotificationsCount} {language === 'bn' ? 'নতুন' : 'new'}
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {/* 4. Theme Toggler (Dark/Light) */}
            <button
              id="menu-theme-btn"
              onClick={() => {
                toggleTheme();
              }}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                </div>
                <span>{language === 'bn' ? 'থিম টগলার' : 'Theme Mode'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs uppercase">
                {theme === 'dark' ? (language === 'bn' ? 'ডার্ক' : 'Dark') : (language === 'bn' ? 'লাইট' : 'Light')}
              </span>
            </button>

            {/* 5. Language Switcher */}
            <button
              id="menu-language-btn"
              onClick={() => {
                setLanguage(language === 'en' ? 'bn' : 'en');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <span>{language === 'bn' ? 'ল্যাঙ্গুয়েজ' : 'Language'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                {language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
              </span>
            </button>

            {/* 6. Landing Page Option */}
            {onOpenLandingPage && (
              <button
                id="menu-landing-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLandingPage();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-left text-emerald-900 dark:text-emerald-200 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span>{language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Page'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}

            {/* 7. Settings Option */}
            <button
              id="menu-settings-btn"
              onClick={() => {
                setActiveTab('settings');
                setIsMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <span>{t('nav.settings', language)}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            {/* 8. PROMINENT LOGOUT OPTION (লগআউট অপশন) */}
            <button
              id="menu-logout-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between text-left text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>{language === 'bn' ? 'লগআউট অপশন' : 'Log Out'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT CONTAINER (SCROLLS UNDERNEATH FIXED FLOATING BARS) --- */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto px-3 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-28 sm:pb-32">
        {/* Dynamic Route View Render */}
        <main className="flex-1 w-full min-w-0">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'search' && <SearchScreen />}
          {activeTab === 'ai' && <AiAssistantScreen />}
          {activeTab === 'goals' && <GoalsScreen />}
          {activeTab === 'health' && <HealthScreen />}
          {activeTab === 'library' && <LibraryScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
          {activeTab === 'notifications' && <NotificationScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* --- 3D FLOATING AI QUICK ACTION BUTTON (ULTRA-PREMIUM GLASS CAPSULE) --- */}
      {activeTab !== 'ai' && (
        <button
          id="floating-3d-ai-btn"
          onClick={() => setActiveTab('ai')}
          className="fixed bottom-24 sm:bottom-24 right-4 sm:right-6 z-40 group cursor-pointer"
          title={language === 'bn' ? 'Askio এআই সহকারীর সাথে কথা বলুন' : 'Open Askio AI Assistant'}
          aria-label="Open Askio AI Assistant"
        >
          {/* Ambient Breathing Glow Behind Capsule */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-60 group-hover:opacity-100 blur-md group-hover:blur-lg transition-all duration-500 animate-pulse pointer-events-none" />

          {/* Main Floating Capsule */}
          <div className="relative flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-zinc-950/85 dark:bg-black/90 backdrop-blur-xl border border-emerald-400/50 shadow-[0_12px_32px_-4px_rgba(16,185,129,0.45),0_4px_16px_rgba(0,0,0,0.5)] group-hover:border-emerald-300 group-hover:scale-105 active:scale-95 transition-all duration-300">
            {/* Holographic light reflection streak */}
            <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent pointer-events-none" />

            {/* AI Avatar with Glowing Halo Ring */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-600/40 via-teal-500/30 to-emerald-400/20 p-0.5 border border-emerald-400/40 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                <ChatbotAvatar sizeClassName="w-7 h-7 sm:w-8 sm:h-8" showOnlineBadge={false} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-950 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
            </div>

            {/* Label & Sparkle Badge */}
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white group-hover:text-emerald-300 transition-colors">
                {language === 'bn' ? 'আস্ক এআই' : 'Ask AI'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            </div>
          </div>
        </button>
      )}

      {/* --- FLOATING GLASS BOTTOM NAVIGATION BAR (FIXED ACROSS ALL SCREENS) --- */}
      <nav 
        id="floating-bottom-nav"
        className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl backdrop-saturate-150 border border-zinc-200/70 dark:border-zinc-800/70 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)] rounded-2xl sm:rounded-3xl px-2 sm:px-4 py-2 flex items-center justify-between sm:justify-center gap-1 sm:gap-2 max-w-lg sm:max-w-xl md:max-w-2xl w-auto transition-all"
        aria-label="Main Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`floating-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center px-2 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold scale-105 shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* --- GLOBAL POPUP MODALS --- */}
      <ResourceDetailModal />
      <AuthModal />
      <SubscriptionModal />
      <DailyWellnessModal />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logoutFirebaseUser();
          logout();
        }}
      />
    </div>
  );
};
