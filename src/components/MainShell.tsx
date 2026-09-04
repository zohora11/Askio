import React from 'react';
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
  Crown, 
  Settings, 
  Bot, 
  Plus,
  Compass,
  LogOut
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
import { SubscriptionModal } from './SubscriptionModal';

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
    setSubscriptionModalOpen,
    setAuthModalOpen 
  } = useApp();

  const navItems = [
    { id: 'home', label: language === 'bn' ? 'হোম' : 'Home', icon: Home },
    { id: 'search', label: language === 'bn' ? 'অনুসন্ধান' : 'Search', icon: Search },
    { id: 'ai', label: language === 'bn' ? 'এআই গাইড' : 'AI Guide', icon: Sparkles },
    { id: 'goals', label: language === 'bn' ? 'লক্ষ্য' : 'Goals', icon: Target },
    { id: 'health', label: language === 'bn' ? 'স্বাস্থ্য' : 'Health', icon: HeartPulse },
    { id: 'library', label: language === 'bn' ? 'লাইব্রেরি' : 'Library', icon: Bookmark },
    { id: 'profile', label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* --- TOP APPBAR --- */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          {/* Askio Logo */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center font-black text-lg tracking-tighter shadow-md group-hover:scale-105 transition-transform">
              a.
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
                Askio
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 -mt-1">
                AI Knowledge
              </span>
            </div>
          </div>
        </div>

        {/* Global Quick Search (Desktop) */}
        <div 
          onClick={() => setActiveTab('search')}
          className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl text-xs text-zinc-400 w-80 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-300"
        >
          <Search className="w-4 h-4 text-zinc-400" />
          <span>Search 14,000+ guides, eye health, topics...</span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-mono">⌘K</span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Landing Page button */}
          {onOpenLandingPage && (
            <button
              id="appbar-landing-btn"
              onClick={onOpenLandingPage}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
              title="View Public Landing Page"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Landing Page</span>
            </button>
          )}

          {/* Micro-subscription badge */}
          <button
            id="appbar-subscription-btn"
            onClick={() => setSubscriptionModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>৳2/day Premium</span>
          </button>

          {/* Language Switch */}
          <button
            id="appbar-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-zinc-700 dark:text-zinc-300"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Notifications Bell with Unread Counter */}
          <button
            id="appbar-notification-btn"
            onClick={() => setActiveTab('notifications')}
            className="relative p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
            title="Notification Center"
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
            onClick={() => {
              if (user.isLoggedIn) setActiveTab('profile');
              else setAuthModalOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all"
          >
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shadow-2xs"
            />
          </div>
        </div>
      </header>

      {/* --- DESKTOP NAVIGATION RAIL + MAIN CONTENT --- */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 gap-8">
        {/* Desktop Navigation Rail (Hidden on mobile) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-1.5 sticky top-24 self-start">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1">
            Menu Navigation
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
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
            <button
              id="desktop-nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all w-full text-left ${
                activeTab === 'settings'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
            </button>

            {onOpenLandingPage && (
              <button
                id="desktop-nav-landing-page"
                onClick={onOpenLandingPage}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all w-full text-left text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Landing Page</span>
              </button>
            )}
          </div>

          {/* Micro-Subscription Banner in Desktop Rail */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
            <div className="flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Crown className="w-3.5 h-3.5" />
              <span>Askio Micro-Plan</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-2.5">
              Get unlimited AI guidance for only ৳2 / day.
            </p>
            <button
              onClick={() => setSubscriptionModalOpen(true)}
              className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors shadow-xs"
            >
              Subscribe ৳2
            </button>
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

      {/* --- 3D FLOATING AI QUICK ACTION BUTTON --- */}
      {activeTab !== 'ai' && (
        <button
          id="floating-3d-ai-btn"
          onClick={() => setActiveTab('ai')}
          className="fixed bottom-20 sm:bottom-8 right-6 z-40 p-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-400/40 flex items-center gap-2.5 group cursor-pointer"
          style={{
            boxShadow: '0 20px 35px -10px rgba(16, 185, 129, 0.45), 0 8px 16px -4px rgba(0, 0, 0, 0.2)'
          }}
          title="Open Askio AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide pr-1">
            Ask AI
          </span>
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
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
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
    </div>
  );
};
