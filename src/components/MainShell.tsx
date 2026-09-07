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
import { PdfReaderModal } from './PdfReaderModal';
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
    { id: 'goals', label: language === 'bn' ? 'গোলস' : 'Goals', icon: Target },
    { id: 'health', label: language === 'bn' ? 'ডিসকভার' : 'Discover', icon: Compass },
    { id: 'library', label: t('nav.library', language), icon: Bookmark },
    { id: 'profile', label: t('nav.profile', language), icon: User },
  ];

  // Primary sidebar navigation items for laptop screens (Library is now the last primary item)
  const sidebarPrimaryItems = [
    { id: 'home', label: t('nav.home', language), icon: Home },
    { id: 'search', label: t('nav.search', language), icon: Search },
    { id: 'ai', label: t('nav.ai', language), icon: Sparkles },
    { id: 'goals', label: language === 'bn' ? 'গোলস' : 'Goals', icon: Target },
    { id: 'health', label: language === 'bn' ? 'ডিসকভার' : 'Discover', icon: Compass },
    { id: 'library', label: t('nav.library', language), icon: Bookmark },
  ];

  return (
    <div className="h-[100dvh] w-full overflow-hidden relative bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* --- LAPTOP/DESKTOP LEFT SIDEBAR NAVIGATION (FIXED ON LEFT) --- */}
      <aside
        id="desktop-left-sidebar"
        className="fixed top-0 left-0 bottom-0 w-64 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl backdrop-saturate-150 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[4px_0_24px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)] hidden lg:flex flex-col justify-between p-4 select-none transition-colors"
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="px-2 pt-1 pb-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80">
          <AppLogo 
            id="sidebar-brand-logo"
            onClick={() => setActiveTab('home')}
            subtitle={language === 'bn' ? 'রিসোর্স ও এআই হাব' : 'Resource & AI Hub'}
            subtitleClassName="text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5 truncate"
            imgClassName="h-9 w-auto"
          />
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 py-3.5 space-y-1 overflow-y-auto">
          {/* Top Primary Items: Home, Search, Ask AI, Goals, Discover, Library, Profile */}
          {sidebarPrimaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.22)]'
                    : 'text-zinc-600 dark:text-zinc-400 font-semibold hover:font-bold hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.4)] border-l-4 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-110'}`} />
                <span className="truncate group-hover:tracking-tight">{item.label}</span>
                {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Horizontal Divider Line as requested by user */}
          <div className="my-2.5 mx-1 border-t border-zinc-200 dark:border-zinc-800/80" />

          {/* Landing Page Button */}
          {onOpenLandingPage && (
            <button
              id="sidebar-nav-landing"
              onClick={onOpenLandingPage}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold hover:font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.4)] border-l-4 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 cursor-pointer group"
              title={language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Page'}
            >
              <Globe className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="truncate">{language === 'bn' ? 'ল্যান্ডিং পেজ' : 'Landing Page'}</span>
            </button>
          )}

          {/* Settings Button (Sits at the very bottom of the navigation list) */}
          <button
            id="sidebar-nav-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer group ${
              activeTab === 'settings'
                ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.22)]'
                : 'text-zinc-600 dark:text-zinc-400 font-semibold hover:font-bold hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.4)] border-l-4 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
            title={t('nav.settings', language)}
          >
            <Settings className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'settings' ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-110'}`} />
            <span className="truncate">{t('nav.settings', language)}</span>
          </button>
        </nav>

        {/* Bottom Profile / Quick Info Card (Direct shortcut to Profile Screen) */}
        <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <div 
            id="sidebar-bottom-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 border group ${
              activeTab === 'profile'
                ? 'bg-emerald-500/15 dark:bg-emerald-500/25 border-emerald-500/60 shadow-[0_4px_16px_rgba(16,185,129,0.22)]'
                : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)]'
            }`}
            title={language === 'bn' ? 'প্রোফাইল স্ক্রিনে যান' : 'Go to Profile Screen'}
          >
            <div className="relative shrink-0">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={user.fullName || 'User'}
                className={`w-9 h-9 rounded-xl object-cover ring-2 transition-all ${
                  activeTab === 'profile' ? 'ring-emerald-500 shadow-xs' : 'ring-emerald-500/30 group-hover:ring-emerald-500'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate transition-colors ${
                activeTab === 'profile' ? 'text-emerald-700 dark:text-emerald-300' : 'text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              }`}>
                {user.fullName || (language === 'bn' ? 'ব্যবহারকারী' : 'Askio User')}
              </p>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                  {language === 'bn' ? 'সাবস্ক্রাইবড' : 'Subscribed'}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
                  {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- TOP FLOATING GLASS APPBAR (FIXED ON TOP ACROSS ALL SCREENS) --- */}
      <header 
        id="floating-top-appbar"
        className="fixed top-3 z-30 transition-all inset-x-3 sm:inset-x-6 lg:inset-x-auto lg:left-70 lg:right-6 lg:max-w-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl backdrop-saturate-150 border border-zinc-200/75 dark:border-zinc-800/75 shadow-[0_8px_30px_rgb(0,0,0,0.07)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] rounded-2xl sm:rounded-3xl px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4"
      >
        {/* Far Left: App Logo on Mobile/Tablet, Active Breadcrumb on Laptop */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="lg:hidden">
            <AppLogo 
              id="brand-logo"
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              subtitle={language === 'bn' ? 'রিসোর্স ও এআই হাব' : 'Resource & AI Hub'}
              subtitleClassName="hidden sm:inline text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5 truncate"
              imgClassName="h-8 sm:h-9 md:h-10 w-auto"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
              Askio
            </span>
            <span className="text-zinc-400 dark:text-zinc-600 font-normal">/</span>
            <span className="capitalize font-extrabold text-zinc-800 dark:text-zinc-100">
              {sidebarPrimaryItems.find(i => i.id === activeTab)?.label || (activeTab === 'settings' ? t('nav.settings', language) : activeTab === 'profile' ? t('nav.profile', language) : activeTab)}
            </span>
          </div>
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
      <div id="main-scroll-container" className="flex-1 overflow-y-auto flex flex-col w-full">
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 lg:pl-70 lg:pr-8 pt-20 sm:pt-24 pb-28 sm:pb-32 lg:pb-12 transition-all">
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
      </div>

      {/* --- 3D FLOATING GENIE QUICK ACTION BUTTON (ULTRA-PREMIUM GLASS CAPSULE) --- */}
      {activeTab !== 'ai' && (
        <button
          id="floating-3d-genie-btn"
          onClick={() => setActiveTab('ai')}
          className="absolute bottom-24 sm:bottom-28 lg:bottom-8 right-4 sm:right-6 z-40 group cursor-pointer"
          title={language === 'bn' ? 'Askio জিনি সহকারীর সাথে কথা বলুন' : 'Open Askio Genie'}
          aria-label="Open Askio Genie"
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
                {language === 'bn' ? 'Ask জিনি' : 'Ask Genie'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            </div>
          </div>
        </button>
      )}

      {/* --- FLOATING GLASS BOTTOM NAVIGATION BAR (FIXED FOR TABLET & MOBILE, HIDDEN ON LAPTOP) --- */}
      <nav 
        id="floating-bottom-nav"
        className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-0 sm:mx-auto z-40 lg:hidden bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl backdrop-saturate-150 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)] rounded-2xl sm:rounded-3xl px-2 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 flex items-center justify-between sm:justify-center gap-1 sm:gap-4 md:gap-6 w-[calc(100%-24px)] sm:w-fit max-w-lg sm:max-w-xl md:max-w-2xl transition-all select-none"
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
              className={`${item.id === 'ai' ? 'hidden sm:flex' : 'flex'} flex-col items-center justify-center px-1.5 min-[375px]:px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold scale-105 shadow-[0_4px_16px_rgba(16,185,129,0.3)] dark:shadow-[0_4px_16px_rgba(16,185,129,0.25)] border border-emerald-500/30'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:shadow-[0_4px_14px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.4)] hover:scale-105 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60'
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 transition-all ${isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'group-hover:scale-110 group-hover:text-zinc-950 dark:group-hover:text-white'}`} />
              <span className={`text-[9px] min-[375px]:text-[10px] sm:text-[11px] md:text-xs mt-0.5 sm:mt-1 tracking-tight whitespace-nowrap transition-all ${
                isActive 
                  ? 'font-extrabold text-emerald-600 dark:text-emerald-400' 
                  : 'font-medium group-hover:font-extrabold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* --- GLOBAL POPUP MODALS --- */}
      <PdfReaderModal />
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
