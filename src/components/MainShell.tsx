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
    setAuthModalOpen 
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* --- TOP APPBAR --- */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          {/* Askio Logo */}
          <AppLogo 
            id="brand-logo"
            onClick={() => {
              setActiveTab('home');
              setIsMobileMenuOpen(false);
            }}
            subtitle={language === 'bn' ? 'সার্চ ও এআই ইঞ্জিন' : 'AI Search Engine'}
            imgClassName="h-9 w-auto"
          />
        </div>

        {/* Global Quick Search (Desktop) */}
        <div 
          onClick={() => setActiveTab('search')}
          className="hidden md:flex items-center gap-2 bg-zinc-100/80 dark:bg-zinc-800/80 px-4 py-2 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 w-80 cursor-pointer hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="truncate">{t('nav.search_placeholder', language)}</span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">⌘K</span>
        </div>

        {/* Desktop Header Actions (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* Landing Page button */}
          {onOpenLandingPage && (
            <button
              id="appbar-landing-btn"
              onClick={onOpenLandingPage}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
              title={t('nav.landing', language)}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{t('nav.landing', language)}</span>
            </button>
          )}

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            id="appbar-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center text-zinc-700 dark:text-zinc-300 cursor-pointer"
            title={theme === 'dark' ? (language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode') : (language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode')}
            aria-label="Toggle App Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>

          {/* Language Switch */}
          <button
            id="appbar-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Notifications Bell with Unread Counter */}
          <button
            id="appbar-notification-btn"
            onClick={() => setActiveTab('notifications')}
            className="relative p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-zinc-600 dark:text-zinc-300 cursor-pointer"
            title={t('nav.notifications', language)}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile Avatar Quick Navigation */}
          <div
            id="appbar-avatar-btn"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all"
          >
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shadow-2xs"
            />
          </div>
        </div>

        {/* Mobile Three-Lines Hamburger Menu Button (visible on mobile only) */}
        <div className="md:hidden flex items-center">
          <button
            id="mobile-hamburger-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center"
            aria-label="Toggle Mobile Menu"
            title={language === 'bn' ? 'মেনু খুলুন' : 'Open Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-500" />
            ) : (
              <>
                <Menu className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                )}
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- MOBILE THREE-LINES SLIDE-DOWN DRAWER MENU --- */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-x-0 top-[57px] z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            id="mobile-drawer-panel"
            className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl rounded-b-3xl space-y-3 max-h-[85vh] overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Profile Option */}
            <div 
              id="mobile-menu-profile"
              onClick={() => {
                setActiveTab('profile');
                setIsMobileMenuOpen(false);
              }}
              className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {user.fullName}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.phone || user.email || (language === 'bn' ? 'প্রোফাইল দেখতে ট্যাপ করুন' : 'Tap to view profile')}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shrink-0 flex items-center gap-1">
                <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2 pt-1">
              {/* 2. Notifications Option */}
              <button
                id="mobile-menu-notifications"
                onClick={() => {
                  setActiveTab('notifications');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
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

              {/* 3. Theme Toggler */}
              <button
                id="mobile-menu-theme"
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                  </div>
                  <span>{language === 'bn' ? 'থিম টোগলার (Dark/Light)' : 'Theme Mode'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs uppercase">
                  {theme === 'dark' ? (language === 'bn' ? 'ডার্ক' : 'Dark') : (language === 'bn' ? 'লাইট' : 'Light')}
                </span>
              </button>

              {/* 4. Language Setting */}
              <button
                id="mobile-menu-language"
                onClick={() => {
                  setLanguage(language === 'en' ? 'bn' : 'en');
                }}
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>{language === 'bn' ? 'ল্যাঙ্গুয়েজ সেটিং' : 'Language Setting'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  {language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
                </span>
              </button>

              {/* 5. Landing Page Option */}
              {onOpenLandingPage && (
                <button
                  id="mobile-menu-landing-page"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLandingPage();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-left text-emerald-900 dark:text-emerald-200 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span>{language === 'bn' ? 'ল্যান্ডিং পেজে যাওয়ার অপশন' : 'Go to Landing Page'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DESKTOP NAVIGATION RAIL + MAIN CONTENT --- */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 gap-8">
        {/* Desktop Navigation Rail (Hidden on mobile) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-1.5 sticky top-24 self-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-1">
            {language === 'bn' ? 'মেনু নেভিগেশন' : 'Menu Navigation'}
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`desktop-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <button
              id="desktop-nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all w-full text-left ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('nav.settings', language)}</span>
            </button>

            {onOpenLandingPage && (
              <button
                id="desktop-nav-landing-page"
                onClick={onOpenLandingPage}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all w-full text-left text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>{t('nav.landing', language)}</span>
              </button>
            )}
          </div>
        </aside>

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
          className="fixed bottom-20 sm:bottom-8 right-5 sm:right-7 z-40 group cursor-pointer"
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

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <nav 
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 flex items-center justify-around shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* --- GLOBAL POPUP MODALS --- */}
      <ResourceDetailModal />
      <AuthModal />
      <SubscriptionModal />
      <DailyWellnessModal />
    </div>
  );
};
