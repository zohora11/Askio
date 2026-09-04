import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  HeartPulse, 
  BookOpen, 
  Target, 
  Search, 
  Crown, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall,
  Eye,
  Layers,
  Check,
  Bookmark,
  Activity,
  Sliders,
  BellRing
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatbotAvatar } from './ChatbotAvatar';

interface AppDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribeClick: () => void;
}

export const AppDocumentationModal: React.FC<AppDocumentationModalProps> = ({
  isOpen,
  onClose,
  onSubscribeClick
}) => {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!isOpen) return null;

  const isBn = language === 'bn';

  // Specific Functional Modules & Features of Askio
  const features = [
    {
      id: 'ai',
      icon: Sparkles,
      color: 'emerald',
      title: isBn ? '১. Askio AI পার্সোনাল অ্যাসিস্ট্যান্ট' : '1. Askio AI Personal Assistant',
      category: isBn ? 'কৃত্রিম বুদ্ধিমত্তা' : 'AI Intelligence',
      summary: isBn 
        ? 'আপনার সার্বক্ষণিক স্মার্ট এআই পরামর্শক, যা সুনির্দিষ্ট ও কার্যকর সমাধান প্রদান করে।' 
        : 'Your 24/7 smart conversational AI for rapid, contextual recommendations.',
      capabilities: isBn ? [
        'বাংলা ও ইংরেজিতে যেকোনো প্রশ্ন জিজ্ঞেস করা এবং সাবলীল, পরিমিত উত্তর পাওয়া',
        'চোখের ক্লান্তি ও মাথা ব্যথার তাৎক্ষণিক করণীয় জানা',
        'পড়াশোনা, বিসিএস বা পরীক্ষার রুটিন ও স্টাডি স্ট্র্যাটেজি তৈরি',
        'ক্যারিয়ার কাউন্সেলিং, স্কিল ডেভেলপমেন্ট ও কোডিং সমস্যার দিকনির্দেশনা',
        'পূর্ববর্তী প্রশ্ন ও কথোপকথনের হিস্ট্রি সংরক্ষণ ও সহজে পুনরায় দেখা'
      ] : [
        'Ask any question in Bengali or English for crisp, accurate answers',
        'Instant triage & relief steps for digital eye strain & headaches',
        'Personalized study schedules, exam prep & retention tactics',
        'Career development, skill progression & coding advice',
        'Full chat history archive with 1-click continuation'
      ]
    },
    {
      id: 'vision',
      icon: Eye,
      color: 'teal',
      title: isBn ? '২. ২০-২০-২০ আই কেয়ার ও ভিশন ট্র্যাকার' : '2. 20-20-20 Vision Care & Timer',
      category: isBn ? 'চোখের সুরক্ষা' : 'Eye Ergonomics',
      summary: isBn 
        ? 'স্ক্রিনে কাজ করার সময় চোখের সুরক্ষার জন্য বিজ্ঞানসম্মত ২০-২০-২০ ব্রেক টাইমার ও নির্দেশিকা।' 
        : 'Scientifically approved break timers and ocular relaxation routines.',
      capabilities: isBn ? [
        'প্রতি ২০ মিনিট স্ক্রিন ব্যবহারের পর ২০ সেকেন্ডের ব্রেক টাইমার কাউন্টডাউন',
        'চোখের পেশি (Ciliary Muscles) শিথিল করার স্টেপ-বাই-স্টেপ চোখের ব্যায়াম',
        'ড্রাই-আই, চোখের জ্বালাপোড়া ও ব্লার ভিশন প্রতিরোধের সঠিক নিয়মাবলী',
        'স্ক্রিন লাইট, চোখের নিরাপদ দূরত্ব ও সঠিক ভঙ্গি (Posture) গাইড'
      ] : [
        'Interactive 20-minute screen countdown & 20-second relaxation timer',
        'Guided ocular gymnastics for resting fatigued ciliary muscles',
        'Proactive dry-eye mitigation and blink rate reminders',
        'Ergonomic display distances, angles, and blue-light guidelines'
      ]
    },
    {
      id: 'library',
      icon: BookOpen,
      color: 'blue',
      title: isBn ? '৩. কিউরেটেড নলেজ লাইব্রেরি ও বুকমার্কিং' : '3. Curated Knowledge Library & Bookmarks',
      category: isBn ? 'জ্ঞানভাণ্ডার' : 'Knowledge Vault',
      summary: isBn 
        ? '১৪,০০০+ তথ্যবহুল হ্যান্ডবুক, গাইড, পিডিএফ সামারি ও ভিডিও রিসোর্স লাইব্রেরি।' 
        : 'Access thousands of structured guides, books, PDFs, and video summaries.',
      capabilities: isBn ? [
        'স্বাস্থ্য, প্রযুক্তি, ক্যারিয়ার, মানসিক প্রশান্তি সহ ১০+ বিষয়ের গাইড ব্রাউজিং',
        'বুকস, ভিডিও সামারি, পিডিএফ ও রিসার্চ পেপারের ফরম্যাট অনুসারে দেখা',
        'পছন্দের যেকোনো রিসোর্স ১-ক্লিকে বুকমার্ক করে অফলাইনে পড়ার সুযোগ',
        'সম্প্রতি পঠিত হ্যান্ডবুকের হিস্ট্রি পর্যবেক্ষণ ও প্রগ্রেস ট্র্যাকিং'
      ] : [
        'Browse 10+ core domains including Health, Tech, Career & Productivity',
        'Filter by media types: Books, Video Summaries, PDFs & Research Guides',
        '1-click bookmarking to personal reading list for offline access',
        'Track recently read articles and reading progression'
      ]
    },
    {
      id: 'goals',
      icon: Target,
      color: 'purple',
      title: isBn ? '৪. মাই গোলস ও ডেইলি স্ট্রিক ট্র্যাকার' : '4. My Goals & Habit Streak Tracker',
      category: isBn ? 'অভ্যাস ট্র্যাকিং' : 'Streak Engine',
      summary: isBn 
        ? 'প্রতিদিনের লক্ষ্য নির্ধারণ, কাজের অগ্রগতি পরিমাপ ও ধারাবাহিক স্ট্রিক ধরে রাখার সিস্টেম।' 
        : 'Custom milestone setting, completion progress bars, and streak counters.',
      capabilities: isBn ? [
        'নিজের প্রয়োজন অনুযায়ী নতুন দৈনিক বা সাপ্তাহিক লক্ষ্য (Goal) তৈরি করা',
        'টাস্ক সম্পন্ন হলে টিক মার্ক দিয়ে প্রগ্রেস বার ও শতাংশ (Percentage) বৃদ্ধি করা',
        'প্রতিদিনের নিয়মিত কাজের ধারাবাহিকতায় স্ট্রিক কাউন্টার ও মোটিভেশন ব্যাজ অর্জন',
        'পার্সোনাল অ্যাক্টিভিটি হিস্ট্রি ও সাপ্তাহিক কার্যকারিতা রিপোর্ট দেখা'
      ] : [
        'Create custom personal goals with specific target parameters',
        'Toggle tasks as complete to update live progress percentages',
        'Earn streak counts and milestones for continuous daily discipline',
        'View weekly activity charts and productivity statistics'
      ]
    },
    {
      id: 'helpline',
      icon: PhoneCall,
      color: 'rose',
      title: isBn ? '৫. জরুরি হেল্পলাইন ও হেলথ ডিরেক্টরি' : '5. Emergency Helpline & Health Hub',
      category: isBn ? 'জরুরি সেবা' : 'Emergency Services',
      summary: isBn 
        ? 'জাতীয় স্বাস্থ্য ও জরুরি নম্বরে তাত্ক্ষণিক অ্যাক্সেস এবং চিকিৎসকদের ভেরিফাইড গাইডলাইন।' 
        : 'Direct 1-tap dial for emergency numbers and daily wellness protocols.',
      capabilities: isBn ? [
        'সরকারি স্বাস্থ্য বাতায়ন হেল্পলাইন ১৬২৬৩ এ সরাসরি কল করার সুযোগ',
        'জাতীয় জরুরি সেবা ৯৯৯ এ ১-ট্যাপে সরাসরি যোগাযোগ',
        'প্রতিদিনের পর্যাপ্ত পানি পান ও হাইড্রেশন ট্র্যাকিং রুটিন',
        'স্লিপ হাইজিন, কাজের ফাঁকে স্ট্রেচিং এবং চোখের বিশ্রাম কৌশল'
      ] : [
        'Direct 1-tap call to Bangladesh Health Hotline (16263)',
        'Instant emergency dialing for National Police/Ambulance (999)',
        'Daily hydration tracking and water intake guidance',
        'Sleep hygiene, postural ergonomics, and screen detox tips'
      ]
    },
    {
      id: 'search',
      icon: Search,
      color: 'amber',
      title: isBn ? '৬. স্মার্ট সার্চ ও ইনস্ট্যান্ট ফিল্টারিং' : '6. Smart Search & Dynamic Filtering',
      category: isBn ? 'সার্চ ও ফিল্টার' : 'Search Engine',
      summary: isBn 
        ? 'পুরো অ্যাপের রিসোর্স ও গাইড নিমেষেই কিওয়ার্ড দিয়ে খুঁজে বের করার সুবিধা।' 
        : 'Fast keyword autocomplete and category/format filtering across the repository.',
      capabilities: isBn ? [
        'যেকোনো বাংলা বা ইংরেজি শব্দ লিখে ইনস্ট্যান্ট গাইড সার্চ করা',
        'ক্যাটাগরি ভিত্তিক (Technology, Health, Career, Mindfulness) ফিল্টারিং',
        'মিডিয়া টাইপ (Book, PDF, Video, Talk) আলাদা করে বাছাই করার সুবিধা',
        'জনপ্রিয় ও ট্রেন্ডিং টপিকগুলোর তাৎক্ষণিক সাজেশন পাওয়া'
      ] : [
        'Instant real-time search across thousands of guides in Bengali & English',
        'Filter by topical categories (Health, Tech, Career, Mindfulness)',
        'Sort by content formats (PDFs, Books, Video Summaries, Guides)',
        'Trending tags and quick search keyword suggestions'
      ]
    },
    {
      id: 'profile',
      icon: Sliders,
      color: 'indigo',
      title: isBn ? '৭. প্রোফাইল ও মেম্বারশিপ কন্ট্রোল (১-ক্লিক আনসাবস্ক্রাইব)' : '7. Profile & 1-Click Unsubscribe Control',
      category: isBn ? 'মেম্বারশিপ' : 'Account Control',
      summary: isBn 
        ? 'প্রোফাইল সেটিংস পরিবর্তন এবং যেকোনো সময় সম্পূর্ণ স্বচ্ছভাবে সার্ভিস বাতিলের ব্যবস্থা।' 
        : 'Full profile customization and transparent 1-tap subscription cancellation.',
      capabilities: isBn ? [
        'নিজের নাম, ফোন নম্বর ও প্রোফাইল ছবি আপডেট করা',
        'বিডিঅ্যাপস সাবস্ক্রিপশন স্ট্যাটাস (৳২.৭৮/দিন) এবং মেয়াদ দেখা',
        'কোনো জটিলতা ছাড়াই অ্যাপের প্রোফাইল থেকে যেকোনো সময় ১-ক্লিকে Unsubscribe করা',
        'এসএমএস এর মাধ্যমে সার্ভিস বন্ধের বিকল্প নির্দেশনা (STOP ASKIO to 21213)'
      ] : [
        'Update user details, phone number, and account preferences',
        'Inspect BDApps carrier plan (৳2.78 / day) and active status',
        'Instant 1-tap unsubscribe anytime with zero cancellation penalties',
        'Alternative SMS cancellation fallback instructions (STOP ASKIO to 21213)'
      ]
    },
    {
      id: 'accessibility',
      icon: Globe,
      color: 'cyan',
      title: isBn ? '৮. বাংলা-ইংরেজি দ্বিভাষিক রূপান্তর ও আই-সেফ ডার্ক মোড' : '8. Bilingual UI & Eye-Safe Dark Theme',
      category: isBn ? 'ইউজার ইন্টারফেস' : 'Accessibility',
      summary: isBn 
        ? 'সম্পূর্ণ অ্যাপ বাংলায় বা ইংরেজিতে ব্যবহার এবং চোখের আরামদায়ক কালার থিম।' 
        : 'Complete localization in Bengali & English with eye-comfort palettes.',
      capabilities: isBn ? [
        '১-ক্লিকে সম্পূর্ণ অ্যাপ বাংলা অথবা ইংরেজি ভাষায় রূপান্তর করা',
        'চোখের ক্লান্তিহীন ডার্ক মোড, লাইট মোড বা ডিভাইস সিস্টেম থিম নির্বাচন',
        'মোবাইল এবং ডেস্কটপ উভয় ডিভাইসের জন্য দ্রুত ও মসৃণ রেসপন্সিভ ডিজাইন',
        'কম্প্যাক্ট ও দ্রুতগতির লোডিং ইন্টারফেস'
      ] : [
        'Seamless 1-tap toggle between full Bengali and English UI',
        'High-contrast Dark Mode, Light Mode, and System Theme sync',
        'Fully responsive mobile & desktop layout architecture',
        'Ultra-fast client state management and zero lag'
      ]
    }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? features 
    : features.filter(f => f.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        id="app-documentation-modal"
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {isBn ? 'Askio অ্যাপের সকল ফিচার্স ও ব্যবহারের গাইড' : 'Askio App Features & Capability Documentation'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  v2.0 Features
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isBn 
                  ? 'অ্যাপের মাধ্যমে আপনি কি কি কাজ করতে পারবেন তা বিস্তারিত দেখে নিন' 
                  : 'Explore all tools, AI capabilities, tracking features and services available in the app'}
              </p>
            </div>
          </div>

          <button
            id="close-docs-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Category Filter Tabs */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {isBn ? 'সব ফিচার্স (৮টি)' : 'All Features (8)'}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'এআই অ্যাসিস্ট্যান্ট' : 'AI Assistant'}</span>
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vision'
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-teal-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isBn ? 'আই কেয়ার ট্র্যাকার' : 'Vision Timer'}</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isBn ? 'নলেজ লাইব্রেরি' : 'Library'}</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-purple-600'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isBn ? 'মাই গোলস ট্র্যাকার' : 'Goals Tracker'}</span>
          </button>
          <button
            onClick={() => setActiveTab('helpline')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'helpline'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-rose-600'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isBn ? 'জরুরি হেল্পলাইন' : 'Helpline'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 max-h-[calc(85vh-160px)]">
          {/* Quick Summary Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <ChatbotAvatar sizeClassName="w-10 h-10 shrink-0" showOnlineBadge={true} />
            <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <strong className="text-emerald-700 dark:text-emerald-300 font-bold block">
                {isBn ? 'Askio এর মাধ্যমে আপনি যা যা করতে পারবেন:' : 'What you can accomplish inside Askio:'}
              </strong>
              {isBn 
                ? 'এআই পরামর্শ নেওয়া, চোখের ২০-২০-২০ ব্রেক ট্র্যাকিং, ১৪,০০০+ হ্যান্ডবুক পড়া ও বুকমার্ক করা, প্রতিদিনের গোলস ও স্ট্রিক বজায় রাখা এবং জরুরি স্বাস্থ্য হটলাইনে যোগাযোগ—সব এক অ্যাপে।' 
                : 'Consult AI in natural Bengali/English, track 20-20-20 eye rests, bookmark 14,000+ handbooks, track daily habit streaks, and access health helplines.'}
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-700 shadow-2xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {feat.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                        {feat.category}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {feat.summary}
                    </p>

                    <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-700/70 space-y-2">
                      <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                        {isBn ? 'কী কী সুবিধা রয়েছে / কি কি কাজ করা যাবে:' : 'Available Capabilities & Actions:'}
                      </div>
                      {feat.capabilities.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300 leading-snug">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {isBn ? 'সাবস্ক্রিপশন ফি:' : 'Micro-Plan:'} ৳2.78 / {isBn ? 'দিন (ভ্যাটসহ)' : 'day (incl. VAT)'}
            </span>
            <span className="hidden sm:inline"> • {isBn ? 'যেকোনো সময় ১-ক্লিকে বাতিলযোগ্য' : 'Cancel anytime in 1-click'}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>

            <button
              onClick={() => {
                onClose();
                onSubscribeClick();
              }}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? 'সাবস্ক্রাইব করুন (৳২.৭৮)' : 'Subscribe Now (৳2.78)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
