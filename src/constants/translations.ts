import { AppLanguage } from '../types';

export const CATEGORY_TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'Books & Literature': 'Books & Literature',
    'PDFs & Research': 'PDFs & Research',
    'Technology & AI': 'Technology & AI',
    'Education & Science': 'Education & Science',
    'Business & Career': 'Business & Career',
    'Productivity & Tools': 'Productivity & Tools',
    'Creative & Design': 'Creative & Design',
    'Finance & Economics': 'Finance & Economics'
  },
  bn: {
    'Books & Literature': 'বই ও সাহিত্য',
    'PDFs & Research': 'পিডিএফ ও গবেষণা',
    'Technology & AI': 'টেকনোলজি ও এআই',
    'Education & Science': 'শিক্ষা ও বিজ্ঞান',
    'Business & Career': 'বিজনেস ও ক্যারিয়ার',
    'Productivity & Tools': 'প্রোডাক্টিভিটি ও টুলস',
    'Creative & Design': 'ক্রিয়েটিভ ও ডিজাইন',
    'Finance & Economics': 'ফাইন্যান্স ও অর্থনীতি'
  }
};

export const FORMAT_TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'All': 'All Formats',
    'Books': 'Books',
    'PDFs': 'PDFs',
    'Videos': 'Videos',
    'Links': 'Drive & Links',
    'Articles': 'Articles',
    'Tools': 'Tools',
    'Talks': 'Audio Talks'
  },
  bn: {
    'All': 'সকল ফরম্যাট',
    'Books': 'বইসমূহ',
    'PDFs': 'পিডিএফ নথি',
    'Videos': 'ভিডিও',
    'Links': 'ড্রাইভ ও লিংক',
    'Articles': 'আর্টিকেল',
    'Tools': 'টুলস',
    'Talks': 'অডিও টক'
  }
};

export const UI_TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.ai': 'Ask Genie',
    'nav.goals': 'Goals',
    'nav.health': 'Discover',
    'nav.library': 'Library',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.landing': 'Landing Page',
    'nav.search_placeholder': 'Search books, PDFs, videos, links or ask AI...',

    // Home
    'home.badge': 'Universal AI Search & Knowledge Engine',
    'home.welcome': 'Welcome to Askio',
    'home.subtitle': 'Search millions of books, PDFs, videos, Drive links, or ask AI anything in English and Bangla.',
    'home.streak_days': 'Days',
    'home.wellness_streak': 'Learning Streak',
    'home.view_goals': 'View Goals',
    'home.daily_tip': 'Featured Search Spotlight',
    'home.explore_all_tips': 'Explore All Spotlights',
    'home.explore_categories': 'Browse Knowledge Domains',
    'home.categories_sub': 'Discover verified resources across 8 primary domains',
    'home.view_all_catalogs': 'View All Catalogs',
    'home.featured_resources': 'Trending Knowledge Items',
    'home.featured_sub': 'Handpicked eBooks, research PDFs, coding videos, and web toolkits',
    'home.see_all_resources': 'See All Items',

    // Quick Prompts
    'home.quick_eye': 'Search PDF Books',
    'home.quick_specialist': 'Video Masterclasses',
    'home.quick_guide': 'Ask AI Guide',

    // Search
    'search.title': 'Search Knowledge Engine',
    'search.input_placeholder': 'Type anything to search: books, PDFs, links, videos, tutorials...',
    'search.filter_format': 'Format Filter:',
    'search.filter_category': 'Category Filter:',
    'search.trending': 'Trending Searches',
    'search.recent': 'Recent Searches',
    'search.clear_recent': 'Clear Recent',
    'search.no_results': 'No matching resources found for your query.',
    'search.try_ai': 'Ask Askio AI to generate or summarize information for this topic',
    'search.results_found': 'results found',
    'search.clear': 'Clear',

    // AI Assistant
    'ai.title': 'Askio Ai Assistant',
    'ai.subtitle': 'Ask Anything You Want',
    'ai.input_placeholder': 'Ask AI anything: book summaries, PDF guides, coding, research...',
    'ai.disclaimer': 'Askio AI outputs are synthesized for educational & general knowledge reference.',

    // Goals
    'goals.title': 'Learning & Study Goals',
    'goals.subtitle': 'Set targets for reading books, watching tutorial videos, and finishing PDF guides.',
    'goals.add_goal': 'Add Goal',
    'goals.new_goal_title': 'Create New Learning Goal',
    'goals.goal_name': 'Goal Title',
    'goals.goal_target': 'Target Modules / Pages',
    'goals.save_goal': 'Save Goal',
    'goals.cancel': 'Cancel',
    'goals.completed': 'Completed Today',
    'goals.mark_complete': 'Mark Completed',

    // Discover / Health
    'health.title': 'Discover & Knowledge Hub',
    'health.subtitle': 'Curated collection of bestselling books, research whitepapers, video courses, and AI tools',
    'health.hotline': 'Universal Knowledge Index',
    'health.call_now': 'Open Search',
    'health.timer_title': 'AI Search & Knowledge Synthesizer',
    'health.timer_sub': 'Search any topic or ask AI for instant summaries in English and Bangla',
    'health.tips_heading': 'Featured Knowledge Spotlights',

    // Library
    'library.title': 'Personal Knowledge Library',
    'library.subtitle': 'Access your saved books, PDFs, videos, links, and AI responses offline',
    'library.bookmarks': 'Saved Items',
    'library.history': 'Recent Searches & Activity',
    'library.empty_bookmarks': 'No saved items yet. Click the bookmark icon on any search item to save it here.',
    'library.empty_history': 'No search history found.',

    // Settings
    'settings.title': 'Settings & Preferences',
    'settings.subtitle': 'Manage app theme, language, search history, and profile settings',
    'settings.appearance': 'App Theme',
    'settings.appearance_sub': 'Choose your visual preference',
    'settings.light_mode': 'Light Mode',
    'settings.dark_mode': 'Dark Mode',
    'settings.system_mode': 'System Default',
    'settings.language': 'Language',
    'settings.language_sub': 'Switch app interface language',
    'settings.english': 'English',
    'settings.bengali': 'বাংলা (Bengali)',
    'settings.account': 'Account & Membership',
    'settings.subscription_title': 'BDApps Subscription',
    'settings.plan_daily': 'Daily Plan: ৳2.78 / day',
    'settings.manage_subscription': 'Manage Subscription',
    'settings.privacy': 'Data & Privacy',
    'settings.tracking': 'Search Activity Tracking',
    'settings.analytics': 'App Analytics',
    'settings.security': 'Security',
    'settings.logout': 'Log Out'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.search': 'সার্চ',
    'nav.ai': 'আস্ক জিনি',
    'nav.goals': 'গোলস',
    'nav.health': 'ডিসকভার',
    'nav.library': 'লাইব্রেরি',
    'nav.profile': 'প্রোফাইল',
    'nav.settings': 'সেটিংস',
    'nav.landing': 'ল্যান্ডিং পেজ',
    'nav.search_placeholder': 'বই, পিডিএফ, ভিডিও, লিংক সার্চ করুন বা এআই-কে জিজ্ঞাসা করুন...',

    // Home
    'home.badge': 'ইউনিভার্সাল এআই সার্চ ও নলেজ ইঞ্জিন',
    'home.welcome': 'আস্কিও অ্যাপে স্বাগতম',
    'home.subtitle': 'যেকোনো বিষয় সার্চ করুন — বই, পিডিএফ, ভিডিও, ড্রাইভ লিঙ্ক, বা এআই-এর কাছে যেকোনো প্রশ্ন করুন।',
    'home.streak_days': 'দিন',
    'home.wellness_streak': 'লার্নিং স্ট্রিক',
    'home.view_goals': 'গোলসমূহ দেখুন',
    'home.daily_tip': 'বিশেষ সার্চ স্পটলাইট',
    'home.explore_all_tips': 'সকল স্পটলাইট দেখুন',
    'home.explore_categories': 'জ্ঞানের ক্যাটাগরি ব্রাউজ করুন',
    'home.categories_sub': '৮টি প্রধান ডোমেইনে যাচাইকৃত সম্পদ ও টিউটোরিয়াল খুঁজুন',
    'home.view_all_catalogs': 'সকল ক্যাটালগ',
    'home.featured_resources': 'জনপ্রিয় তথ্য ও রিসোর্সসমূহ',
    'home.featured_sub': 'নির্বাচিত বই, গবেষণা পিডিএফ, কোডিং ভিডিও ও প্রফেশনাল টিউটোরিয়াল',
    'home.see_all_resources': 'সব দেখুন',

    // Quick Prompts
    'home.quick_eye': 'পিডিএফ বই সার্চ',
    'home.quick_specialist': 'ভিডিও মাস্টারক্লাস',
    'home.quick_guide': 'এআই গাইড চান',

    // Search
    'search.title': 'সার্চ ইঞ্জিন ও জ্ঞান ভাণ্ডার',
    'search.input_placeholder': 'যেকোনো কিছু টাইপ করে সার্চ করুন: বই, পিডিএফ, লিংক, ভিডিও, টিউটোরিয়াল...',
    'search.filter_format': 'ফরম্যাট ফিল্টার:',
    'search.filter_category': 'ক্যাটাগরি ফিল্টার:',
    'search.trending': 'ট্রেন্ডিং সার্চসমূহ',
    'search.recent': 'সাম্প্রতিক সার্চ',
    'search.clear_recent': 'হিস্ট্রি মুছুন',
    'search.no_results': 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো রিসোর্স পাওয়া যায়নি।',
    'search.try_ai': 'আস্কিও এআই-কে বলুন এই বিষয়ে তাৎক্ষণিক সারাংশ তৈরি করে দিতে',
    'search.results_found': 'টি ফলাফল পাওয়া গেছে',
    'search.clear': 'ক্লিয়ার',

    // AI Assistant
    'ai.title': 'Askio Ai Assistant',
    'ai.subtitle': 'Ask Anything You Want',
    'ai.input_placeholder': 'এআই-কে যা ইচ্ছা জিজ্ঞাসা করুন: বইয়ের সামারি, পিডিএফ, কোডিং, গবেষণা...',
    'ai.disclaimer': 'আস্কিও এআই উত্তরসমূহ সাধারণ জ্ঞান ও শিক্ষণীয় উদ্দেশ্যে তৈরি।',

    // Goals
    'goals.title': 'লার্নিং ও স্টাডি গোলস',
    'goals.subtitle': 'বই পড়া, টিউটোরিয়াল দেখা ও নোট তৈরি করার জন্য দৈনিক লক্ষ্য নির্ধারণ করুন।',
    'goals.add_goal': 'নতুন গোল যোগ করুন',
    'goals.new_goal_title': 'নতুন লার্নিং গোল তৈরি করুন',
    'goals.goal_name': 'লক্ষ্যের নাম',
    'goals.goal_target': 'টার্গেট মডিউল / পৃষ্ঠা',
    'goals.save_goal': 'সংরক্ষণ করুন',
    'goals.cancel': 'বাতিল',
    'goals.completed': 'আজ সম্পন্ন হয়েছে',
    'goals.mark_complete': 'সম্পন্ন মার্ক করুন',

    // Discover / Health
    'health.title': 'ডিসকভার ও নলেজ হাব',
    'health.subtitle': 'বস্টসেলিং বই, গবেষণা পিডিএফ, ভিডিও কোর্স ও এআই টুলসের নির্বাচিত কালেকশন',
    'health.hotline': 'ইউনিভার্সাল নলেজ ইনডেক্স',
    'health.call_now': 'সার্চ অপশন খুলুন',
    'health.timer_title': 'এআই সার্চ ও নলেজ সিন্থেসাইজার',
    'health.timer_sub': 'যেকোনো বিষয় সার্চ করুন অথবা এআই-এর কাছে বাংলা বা ইংরেজিতে উত্তর চান',
    'health.tips_heading': 'বিশেষ নলেজ স্পটলাইট',

    // Library
    'library.title': 'ব্যক্তিগত লাইব্রেরি ও সেভ করা আইটেম',
    'library.subtitle': 'আপনার সেভ করা বই, পিডিএফ, ভিডিও, লিংক ও এআই উত্তর অফলাইনে অ্যাক্সেস করুন',
    'library.bookmarks': 'সেভ করা আইটেমসমূহ',
    'library.history': 'সাম্প্রতিক সার্চ হিস্ট্রি',
    'library.empty_bookmarks': 'এখনো কোনো আইটেম সেভ করা হয়নি। সার্চ রিসাল্টের বুকমার্ক আইকনে ক্লিক করে এখানে সেভ করুন।',
    'library.empty_history': 'কোনো সার্চ হিস্ট্রি পাওয়া যায়নি।',

    // Settings
    'settings.title': 'সেটিংস ও কাস্টমাইজেশন',
    'settings.subtitle': 'অ্যাপের থিম, ভাষা, সার্চ হিস্ট্রি ও প্রোফাইল নিয়ন্ত্রণ করুন',
    'settings.appearance': 'অ্যাপ থিম (Appearance)',
    'settings.appearance_sub': 'আপনার পছন্দের কালার মোড বাছুন',
    'settings.light_mode': 'লাইট মোড',
    'settings.dark_mode': 'ডার্ক মোড',
    'settings.system_mode': 'সিস্টেম ডিফল্ট',
    'settings.language': 'ভাষা (Language)',
    'settings.language_sub': 'অ্যাপের ভাষা পরিবর্তন করুন',
    'settings.english': 'English',
    'settings.bengali': 'বাংলা (Bengali)',
    'settings.account': 'একাউন্ট ও মেম্বারশিপ',
    'settings.subscription_title': 'BDApps সাবস্ক্রিপশন',
    'settings.plan_daily': 'দৈনিক প্ল্যান: ৳২.৭৮ / দিন',
    'settings.manage_subscription': 'সাবস্ক্রিপশন ম্যানেজ করুন',
    'settings.privacy': 'ডাটা ও প্রাইভেসি',
    'settings.tracking': 'সার্চ অ্যাক্টিভিটি ট্র্যাকিং',
    'settings.analytics': 'অ্যাপ অ্যানালিটিক্স',
    'settings.security': 'সিকিউরিটি',
    'settings.logout': 'লগ আউট'
  }
};

export function t(key: string, lang: AppLanguage = 'en'): string {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;
}
