import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  HeartPulse, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ArrowRight, 
  Calendar, 
  Award, 
  RefreshCw, 
  Bot,
  Lightbulb,
  ShieldCheck,
  Check
} from 'lucide-react';

export interface WellnessTip {
  id: string;
  day: string;
  category: { bn: string; en: string };
  title: { bn: string; en: string };
  description: { bn: string; en: string };
  actionableSteps: { bn: string; en: string }[];
  readTime: string;
  doctorNote: { bn: string; en: string };
}

export const DEFAULT_WELLNESS_TIPS: WellnessTip[] = [
  {
    id: 'tip-1',
    day: 'আজকের মূল টিপস',
    category: { bn: 'চোখের যত্ন ও ভিশন প্যাক', en: 'Eye Care & Ergonomics' },
    title: { 
      bn: '২০-২০-২০ আই কেয়ার রুল ও কম্পিউটার ভিশন রিলিফ', 
      en: '20-20-20 Eye Care Rule & Screen Fatigue Relief' 
    },
    description: { 
      bn: 'দীর্ঘক্ষণ ডিজিটাল স্ক্রিনে তাকিয়ে কাজ করলে চোখের ওপর অতিরিক্ত চাপ পড়ে, শুষ্কতা তৈরি হয় এবং মাথাব্যথা হতে পারে। প্রতি ২০ মিনিট পর ২০ ফুট দূরের যেকোনো বস্তুর দিকে অন্তত ২০ সেকেন্ড তাকিয়ে থাকলে চোখের পেশি শিথিল হয়।', 
      en: 'Continuous screen time leads to digital eye strain, dryness, and headaches. Looking at something 20 feet away for 20 seconds every 20 minutes relaxes your eye ciliary muscles.' 
    },
    actionableSteps: [
      { bn: 'প্রতি ২০ মিনিট পর স্ক্রিন থেকে চোখ সরিয়ে ঘরের শেষ প্রান্তে বা জানালায় তাকান।', en: 'Look away from your screen every 20 minutes toward a distant object.' },
      { bn: 'স্ক্রিন দেখার সময় প্রতি মিনিটে স্বাভাবিকের চেয়ে ঘন ঘন চোখের পলক ফেলুন।', en: 'Blink intentionally more frequently to keep your corneas hydrated.' },
      { bn: 'স্ক্রিনের ব্রাইটনেস এবং ঘরের লাইটিংয়ের মধ্যে সামঞ্জস্য বজায় রাখুন।', en: 'Adjust screen brightness to match room ambient lighting levels.' },
      { bn: 'চোখের লেভেল থেকে স্ক্রিন অন্তত ২০-২৪ ইঞ্চি দূরে রাখুন।', en: 'Keep your monitor at least 20-24 inches away, slightly below eye level.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'অপটোমেট্রি পরামর্শ: স্ক্রিনে কাজের সময় ব্লু-লাইট ফিল্টার বা ডার্ক মোড ব্যবহার করলে চোখের ক্লান্তি ৪০% কমে যায়।',
      en: 'Optometry Advice: Using dark mode or warm light filters reduces ocular fatigue significantly during long work sessions.'
    }
  },
  {
    id: 'tip-2',
    day: 'সোমবারের টিপস',
    category: { bn: 'মানসিক প্রশান্তি', en: 'Mindful Breathing' },
    title: { 
      bn: '৪-৭-৮ গভীর শ্বাসের ব্যায়াম ও চাপ কমানোর ট্রিক', 
      en: '4-7-8 Deep Breathing Technique for Stress Relief' 
    },
    description: { 
      bn: 'কাজের মানসিক চাপ বা উদ্বেগ কমাতে ৪-৭-৮ ব্রিদিং টেকনিক একটি অত্যন্ত কার্যকর বিজ্ঞানসম্মত পদ্ধতি। এটি আপনার স্নায়ুতন্ত্রকে শান্ত করে ও রক্তে অক্সিজেনের মাত্রা বৃদ্ধি করে।', 
      en: 'The 4-7-8 breathing technique is a scientifically proven rhythm that calms your parasympathetic nervous system and lowers stress hormones.' 
    },
    actionableSteps: [
      { bn: 'মেরুদণ্ড সোজা করে আরামদায়কভাবে বসুন এবং চোখ বন্ধ করুন।', en: 'Sit comfortably with a straight posture and close your eyes softly.' },
      { bn: '৪ সেকেন্ড ধরে নাক দিয়ে বুক ভরে বাতাস গ্রহণ করুন।', en: 'Inhale quietly through your nose for 4 seconds.' },
      { bn: '৭ সেকেন্ড শ্বাসনালীতে বাতাস আটকে রাখুন।', en: 'Hold your breath comfortably for 7 seconds.' },
      { bn: '৮ সেকেন্ড ধরে মুখ দিয়ে ফুঁ দেওয়ার মতো করে ধীর গতিতে শ্বাস ছাড়ুন।', en: 'Exhale completely through your mouth with a soft whoosh sound for 8 seconds.' }
    ],
    readTime: '৩ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: কাজের মাঝে প্রতিদিন ৩-৫ বার এই ব্যায়াম করলে মনোযোগ ও কর্মক্ষমতা বহুগুণ বৃদ্ধি পায়।',
      en: 'Advice: Performing 3-5 cycles during work breaks sharpens focus and lowers heart rate.'
    }
  },
  {
    id: 'tip-3',
    day: 'মঙ্গলবার টিপস',
    category: { bn: 'পুষ্টি ও হাইড্রেশন', en: 'Hydration & Nutrition' },
    title: { 
      bn: 'ব্রেন পাওয়ার ও শরীরের আর্দ্রতা ধরে রাখতে জলপান অভ্যাস', 
      en: 'Optimal Hydration for Brain Clarity & Metabolism' 
    },
    description: { 
      bn: 'দেহের মাত্র ২% পানির ঘাটতি আপনার মনোযোগ ও স্মৃতিশক্তির গতি কমিয়ে দেয়। সকালে ঘুম থেকে ওঠার সাথে সাথে পানি পান করা মেটাবলিজমকে সক্রিয় করে তোলে।', 
      en: 'Even a 2% drop in hydration affects memory and concentration. Drinking water immediately upon waking boots your metabolic engine.' 
    },
    actionableSteps: [
      { bn: 'সকালে ঘুম থেকে উঠে ১-২ গ্লাস হালকা গরম পানি পান করুন।', en: 'Drink 1-2 glasses of room-temperature or warm water right after waking up.' },
      { bn: 'টেবিলে ওয়াটার বোতল সবসময় দৃশ্যমান স্থানে রাখুন।', en: 'Keep a refillable water bottle right beside your laptop or workstation.' },
      { bn: 'চা বা কফির অতিরিক্ত ক্যাফেইন পরিহার করে ডাবের পানি বা শসার ডিটক্স ওয়াটার গ্রহণ করুন।', en: 'Replace excessive sugary caffeine with cucumber detox water or coconut water.' },
      { bn: 'প্রতিবার খাবারের ৩০ মিনিট আগে পানি পান করার অভ্যাস করুন।', en: 'Drink water 30 minutes before meals to aid digestion.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: প্রাপ্তবয়স্ক ব্যক্তির জন্য প্রতিদিন অন্তত ২.৫ থেকে ৩ লিটার পরিষ্কার পানি পান করা প্রয়োজন।',
      en: 'Advice: Adults require roughly 2.5 to 3 liters of water daily for optimum organ function.'
    }
  },
  {
    id: 'tip-4',
    day: 'বুধবার টিপস',
    category: { bn: 'শারীরিক সুস্থতা', en: 'Workstation Posture' },
    title: { 
      bn: 'ওয়ার্কস্টেশন এরগোনোমিক্স ও ঘাড়-পিঠের ব্যথা প্রতিরোধ', 
      en: 'Ergonomic Seating & Spine Alignment Guide' 
    },
    description: { 
      bn: 'ভুল ভঙ্গিতে বসে কম্পিউটার বা মোবাইল ব্যবহার করলে স্পাইনাল কর্ড এবং ঘাড়ের মাসলে ক্রনিক পেইন তৈরি হয়। সঠিক সিটিং পোসচার আপনার পিঠ ও ঘাড়ের চাপ মুক্ত রাখে।', 
      en: 'Bad posture during sedentary work causes spinal strain and muscle stiffness. Correcting chair height and screen position keeps your spine aligned.' 
    },
    actionableSteps: [
      { bn: 'চেয়ারে এমনভাবে বসুন যেন আপনার দুই পা সমান্তরালভাবে মেঝে স্পর্শ করে।', en: 'Keep feet flat on the floor with knees bent at a 90-degree angle.' },
      { bn: 'ল্যাপটপের নিচে স্ট্যান্ড ব্যবহার করে ডিসপ্লে চোখের লেভেলে নিয়ে আসুন।', en: 'Use a laptop riser so the top third of your display aligns with eye level.' },
      { bn: 'প্রতি ১ ঘণ্টা পর অন্তত ২ মিনিট দাঁড়িয়ে কিছুটা হাঁটাচলা করুন।', en: 'Stand up and stretch for 2 minutes for every hour of seated work.' },
      { bn: 'কীবোর্ডে টাইপ করার সময় কবজি সোজা রাখুন, বাঁকিয়ে রাখবেন না।', en: 'Keep wrists straight and neutral while typing on keyboards.' }
    ],
    readTime: '৩ মিনিট',
    doctorNote: {
      bn: 'অর্থোপেডিক পরামর্শ: ব্যাক পেইন এড়াতে ব্যাকরেস্ট ব্যবহার করুন এবং দীর্ঘক্ষণ একটানা বসা এড়িয়ে চলুন।',
      en: 'Orthopedic Advice: Use lumbar support pillows and avoid sitting continuously for more than 60 minutes.'
    }
  },
  {
    id: 'tip-5',
    day: 'বৃহস্পতিবার টিপস',
    category: { bn: 'ঘুম ও বিশ্রাম', en: 'Sleep Hygiene' },
    title: { 
      bn: 'স্ক্রিন-ফ্রি নাইট ও গভীর ঘুমের ৬টি স্বাস্থ্যকর অভ্যাস', 
      en: 'Screen-Free Night Routines for Deep REM Sleep' 
    },
    description: { 
      bn: 'মোবাইল বা ডিসপ্লের নীল আলো আমাদের শরীরে মেলোটোনিন নামক ঘুমের হরমোন তৈরিতে বাধা দেয়। ঘুমানোর ১ ঘণ্টা আগে ডিজিটাল ডিভাইস বন্ধ করা ঘুমের গুণমান দ্বিগুণ বাড়িয়ে দেয়।', 
      en: 'Screen blue light suppresses melatonin production, disrupting circadian rhythms. Turning off devices 1 hour before bed enhances REM sleep quality.' 
    },
    actionableSteps: [
      { bn: 'রাত ১০টার পর থেকে মোবাইলের ব্লু-লাইট ফিল্টার বা নাইট মোড চালু রাখুন।', en: 'Enable Night Shift or warm screen filters after 9 PM.' },
      { bn: 'শোবার ঘরে আবছা আলো বা সম্পূর্ণ অন্ধকার বজায় রাখুন।', en: 'Keep bedroom dark, cool, and quiet to trigger natural sleepiness.' },
      { bn: 'রাতে ঘুমানোর আগে ভারী তেলযুক্ত খাবার বা ক্যাফেইনযুক্ত ড্রিংক এড়িয়ে চলুন।', en: 'Avoid heavy meals, tea, or coffee 3 hours before sleep.' },
      { bn: 'প্রতিদিন নির্দিষ্ট সময়ে ঘুমাতে যাওয়া এবং ঘুম থেকে ওঠার অভ্যাস গড়ে তুলুন।', en: 'Maintain a consistent sleep and wake schedule every day.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: ৭-৮ ঘণ্টার ভালো ঘুম আপনার রোগ প্রতিরোধ ক্ষমতা এবং পরদিনের মানসিক শক্তি বজায় রাখে।',
      en: 'Advice: 7-8 hours of uninterrupted sleep boosts immunity and emotional resilience.'
    }
  },
  {
    id: 'tip-6',
    day: 'শুক্রবার টিপস',
    category: { bn: 'ফিটনেস ও হাঁটা', en: 'Daily Fitness' },
    title: { 
      bn: 'দৈনিক ৩০ মিনিট হাঁটার চমৎকার স্বাস্থ্য সুফল', 
      en: '30 Minutes Daily Brisk Walking Benefits' 
    },
    description: { 
      bn: 'প্রতিদিন মাত্র ৩০ মিনিট দ্রুত গতিতে হাঁটলে হৃদরোগের ঝুঁকি ৩৫% কমে যায়, মেজাজ ফুরফুরে থাকে এবং শরীরের অতিরিক্ত ক্যালরি বার্ন হয়।', 
      en: 'A daily 30-minute brisk walk reduces cardiovascular risks by 35%, releases endorphins, and maintains healthy blood pressure levels.' 
    },
    actionableSteps: [
      { bn: 'লিফটের বদলে সিঁড়ি ব্যবহার করার অভ্যাস গড়ে তুলুন।', en: 'Take the stairs instead of elevators whenever possible.' },
      { bn: 'বিকেলের মুক্ত বাতাসে কিছুটা সময় হাঁটাহাঁটি করুন।', en: 'Spend 20-30 minutes outdoor walking in fresh open air.' },
      { bn: 'হাঁটার সময় আরামদায়ক কেডস বা স্পোর্টস শু ব্যবহার করুন।', en: 'Wear well-fitted, comfortable walking shoes to protect joints.' },
      { bn: 'হাঁটার গতি এমন রাখুন যেন হালকা ঘাম হয় কিন্তু কথা বলা যায়।', en: 'Maintain a pace where your heart rate rises but you can still converse.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'কারডিওলজি নির্দেশিকা: সপ্তাহে ১৫০ মিনিটের মাঝারি ব্যায়াম হার্টকে সুস্থ ও কর্মক্ষম রাখে।',
      en: 'Cardiology Guidelines: 150 minutes of moderate aerobic exercise per week keeps heart valves strong.'
    }
  },
  {
    id: 'tip-7',
    day: 'শনিবার টিপস',
    category: { bn: 'স্মৃতিশক্তি ও খাবার', en: 'Brain Superfoods' },
    title: { 
      bn: 'স্মৃতিশক্তি বৃদ্ধি ও মস্তিষ্কের কার্যক্ষমতা বাড়াতে সুপারফুড', 
      en: 'Brain Superfoods for Focus, Memory & Longevity' 
    },
    description: { 
      bn: 'আমাদের মস্তিষ্কের কর্মক্ষমতা নির্ভর করে আমরা যা খাই তার ওপর। কাঠবাদাম, আখরোট, ডিমের কুসুম, গ্রিন টি ও কাঁচা ফলমূল ব্রেনের নিউরনের সংযোগ শক্তিশালী করে।', 
      en: 'Your brain consumes 20% of your body calories. Omega-3 rich walnuts, almonds, green tea, and fresh berries sharpen neural connections.' 
    },
    actionableSteps: [
      { bn: 'প্রতিদিন সকালে ৪-৫টি পানিতে ভেজানো কাঠবাদাম ও আখরোট খান।', en: 'Eat 4-5 soaked almonds and walnuts every morning with breakfast.' },
      { bn: 'প্রসেসড স্ন্যাকস বা ভাজাপোড়ার বদলে তাজা ফল বা কাঁচা সবজি বেছে নিন।', en: 'Replace fried snacks with fresh apples, bananas, or seasonal berries.' },
      { bn: 'চা বা কফির বদলে গ্রিন টি গ্রহণ করুন যা অ্যান্টি-অক্সিডেন্টে ভরপুর।', en: 'Drink green tea for rich L-theanine antioxidant benefits.' },
      { bn: 'প্রচুর শাকসবজি ও ওমেগা-৩ সমৃদ্ধ প্রাকৃতিক খাবার গ্রহণ করুন।', en: 'Incorporate leafy greens and healthy fats into lunch and dinner.' }
    ],
    readTime: '৩ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: প্রসেসড সুগার ও প্যাকেটজাত স্ন্যাকস ব্রেন ফগ তৈরি করে, প্রাকৃতিক পুষ্টিকর খাবার তা রোধ করে।',
      en: 'Advice: Cutting refined sugars prevents brain fog and stabilizes blood glucose throughout the day.'
    }
  },
  {
    id: 'tip-8',
    day: 'রোববারের টিপস',
    category: { bn: 'মনোযোগ ও কার্যক্ষমতা', en: 'Deep Focus & Reset' },
    title: { 
      bn: 'পোমোডোরো ফোকাস ও মেটাল ডিটক্স বিরতি', 
      en: 'Pomodoro Focus & 5-Minute Mindful Reset' 
    },
    description: { 
      bn: 'টানা ১ ঘণ্টার বেশি কাজ করলে মস্তিষ্কের প্রাক-ফ্রন্টাল কর্টেক্স ক্লান্ত হয়ে পড়ে। প্রতি ২৫ মিনিট গভীর মনোযোগ দিয়ে কাজ করার পর ৫ মিনিটের সম্পূর্ণ স্ক্রিন-মুক্ত বিরতি নিন।', 
      en: 'After 60+ minutes of continuous cognitive load, your prefrontal cortex fatigues. Work in 25-minute focused bursts followed by a 5-minute screen-free pause.' 
    },
    actionableSteps: [
      { bn: '২৫ মিনিটের জন্য মোবাইলের নোটিফিকেশন সাইলেন্ট রাখুন।', en: 'Silence all non-essential phone and desktop notifications for 25 minutes.' },
      { bn: '৫ মিনিটের বিরতিতে কোনো স্ক্রিনে তাকাবেন না, উঠে একটু পানি খান।', en: 'During the 5-minute break, refrain from any screen; drink water and stretch.' },
      { bn: 'পরপর ৪টি সাইকেল শেষ হলে ১৫-২০ মিনিটের বড় বিরতি নিন।', en: 'Take a longer 15-20 minute break after completing 4 consecutive cycles.' },
      { bn: 'দিনের শুরুতে সবচেয়ে কঠিন কাজটি প্রথম সাইকেলে রাখুন।', en: 'Schedule your most demanding task for your very first focus block.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: ছোট বিরতি ব্রেনকে রিচার্জ করে ও সারাদিনের বার্নআউট শতকরা ৫০ ভাগ পর্যন্ত হ্রাস করে।',
      en: 'Advice: Structured micro-pauses reduce neural burnout by up to 50% across long workdays.'
    }
  },
  {
    id: 'tip-9',
    day: 'সোমবারের টিপস',
    category: { bn: 'স্নায়ু প্রশান্তি', en: 'Nervous System Reset' },
    title: { 
      bn: 'ভ্যাগাস নার্ভ সক্রিয়করণ ও সকালের ঠাণ্ডা জলের স্পর্শ', 
      en: 'Vagus Nerve Activation & Cold Water Splash' 
    },
    description: { 
      bn: 'মুখে এবং চোখে ঠান্ডা পানির হালকা ঝাপটা দিলে আমাদের ভ্যাগাস নার্ভ উদ্দীপিত হয়। এটি সাথে সাথে হার্ট রেট স্বাভাবিক করে এবং উদ্বেগ দূর করে।', 
      en: 'Splashing cool water on your face and eyes stimulates the vagus nerve via the mammalian dive reflex, immediately slowing heart rate and alleviating anxiety.' 
    },
    actionableSteps: [
      { bn: 'কাজের মাঝে মানসিক অস্থিরতা লাগলে মুখে ৩-৪ বার ঠান্ডা পানির ঝাপটা দিন।', en: 'Splash cool water onto your face 3-4 times whenever feeling overwhelmed.' },
      { bn: 'চোখ বন্ধ করে গভীর শ্বাস নিয়ে ধীরে ধীরে শ্বাস ছাড়ুন।', en: 'Close your eyes and exhale through your mouth longer than your inhale.' },
      { bn: 'ঘাড়ের দুপাশে হালকা ম্যাসাজ করে রক্ত সঞ্চালন বাড়ান।', en: 'Gently massage the sides of your neck to ease vagal tension.' },
      { bn: 'কিছুক্ষণ নিরব শান্ত স্থানে স্থিরভাবে বসুন।', en: 'Sit in a quiet space for 2 minutes to restore baseline calm.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: ভ্যাগাস নার্ভ সক্রিয় থাকলে শরীরে কর্টিসল (চাপের হরমোন) দ্রুত কমে যায়।',
      en: 'Advice: Vagal toning triggers the parasympathetic response, reducing cortisol levels rapidly.'
    }
  },
  {
    id: 'tip-10',
    day: 'মঙ্গলবারের টিপস',
    category: { bn: 'সার্কাডিয়ান ছন্দ ও শক্তি', en: 'Circadian Rhythm' },
    title: { 
      bn: 'সকালের প্রাকৃতিক রোদে ১০ মিনিট ও শক্তি সঞ্চয়', 
      en: 'Morning Natural Sunlight & Energy Calibration' 
    },
    description: { 
      bn: 'ঘুম থেকে ওঠার প্রথম ১ ঘণ্টার মধ্যে সকালের সূর্যের আলো চোখে পড়লে শরীরে সার্কাডিয়ান রিদম ঠিক হয়, দিনে সতেজতা বাড়ে এবং রাতে স্বাভাবিক ঘুম আসে।', 
      en: 'Viewing natural morning sunlight within 60 minutes of waking triggers a healthy cortisol pulse, sharpens daytime alertness, and sets your night melatonin timer.' 
    },
    actionableSteps: [
      { bn: 'সকালে ঘুম থেকে উঠে ব্যালকনি বা খোলা জায়গায় ৫-১০ মিনিট হাঁটুন।', en: 'Spend 5-10 minutes outdoors or by an open sunny window each morning.' },
      { bn: 'সানগ্লাস ছাড়া সাধারণ চোখে প্রাকৃতিক আলোর দিকে তাকান (সরাসরি সূর্যের দিকে নয়)।', en: 'Absorb indirect ambient sunlight without sunglasses.' },
      { bn: 'সকালের তাজা বাতাসে বুক ভরে ৩-৪ বার গভীর শ্বাস নিন।', en: 'Take several slow deep breaths in the crisp morning air.' },
      { bn: 'দিনের শুরুতে ঘর বা অফিসের পর্দা খুলে পর্যাপ্ত প্রাকৃতিক আলো প্রবেশ করান।', en: 'Open workspace window blinds to let in abundant natural daylight.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'নিউরোসায়েন্স পরামর্শ: প্রাকৃতিক সকালের আলো রাতের মেলাটোনিন হরমোনের টাইমার ১৪ ঘণ্টা পর অটোমেটিক চালু করে।',
      en: 'Neuroscience Insight: Morning photons set an internal circadian timer that promotes natural sleepiness 14 hours later.'
    }
  },
  {
    id: 'tip-11',
    day: 'বুধবারের টিপস',
    category: { bn: 'পেশি ও জয়েন্ট কেয়ার', en: 'Joint Mobility' },
    title: { 
      bn: 'ডেস্ক স্ট্রেচিং ও কবজির কার্পাল টানেল প্রতিরোধ', 
      en: 'Desk Stretches & Wrist Carpal Tunnel Relief' 
    },
    description: { 
      bn: 'মাউস ও কিবোর্ডে একটানা আঙুল চালালে কবজির মিডিয়ান নার্ভে চাপ পড়ে। প্রতিদিন সহজ ৩টি স্ট্রেচিং আপনার কবজি, কাঁধ এবং আঙুলকে ব্যথামুক্ত রাখে।', 
      en: 'Repetitive typing and mousing cause median nerve compression. Simple daily wrist extensions and shoulder shrugs safeguard against carpal tunnel syndrome.' 
    },
    actionableSteps: [
      { bn: 'হাত সামনের দিকে সোজা করে আঙুলগুলো ওপরের দিকে টেনে ৫ সেকেন্ড ধরে রাখুন।', en: 'Extend your arm forward with palm out; gently pull fingers back for 5 seconds.' },
      { bn: 'কবজি ঘড়ির কাটার দিকে ও বিপরীত দিকে ১০ বার করে ধীরে ধীরে ঘোরান।', en: 'Rotate both wrists slowly in clockwise and counter-clockwise circles 10 times.' },
      { bn: 'কাঁধ ওপরের দিকে উঠিয়ে পেছনের দিকে ঘুরিয়ে শিথিল করুন।', en: 'Roll shoulders upward and backward to release upper trapezius stiffness.' },
      { bn: 'প্রতি ১ ঘণ্টার কাজে হাত ও আঙুল কয়েকবার ঝেড়ে নিন।', en: 'Gently shake out your hands and fingers every hour of typing.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'ফিজিওথেরাপি নির্দেশিকা: কাজের মাঝে নিয়মিত স্ট্রেচিং করলে রিপিটেটিভ স্ট্রেন ইনজুরি (RSI) ৭০% রোধ করা সম্ভব।',
      en: 'Physiotherapy Advice: Micro-stretching reduces Repetitive Strain Injury (RSI) risks by over 70%.'
    }
  },
  {
    id: 'tip-12',
    day: 'বৃহস্পতিবারের টিপস',
    category: { bn: 'ইতিবাচক মানসিক স্বাস্থ্য', en: 'Mindfulness & Gratitude' },
    title: { 
      bn: 'রাতের ৩টি কৃতজ্ঞতা ও মানসিক প্রশান্তির অভ্যাস', 
      en: 'Evening Gratitude Routine for Serene Mental Health' 
    },
    description: { 
      bn: 'সারাদিনের কাজের ক্লান্তি ও নেতিবাচক চিন্তা দূর করতে ঘুমানোর আগে ৩টি ভালো বিষয়ের প্রতি কৃতজ্ঞতা প্রকাশ করুন। এটি ডোপামিন ও সেরোটোনিন বাড়িয়ে মনে গভীর প্রশান্তি আনে।', 
      en: 'Reflecting on 3 specific positive moments before sleeping rewires cognitive bias away from anxiety toward serenity, naturally stimulating dopamine and serotonin.' 
    },
    actionableSteps: [
      { bn: 'ঘুমানোর আগে ডায়রি বা ফোনে সারাদিনের ৩টি ভালো ঘটনার কথা স্মরণ করুন।', en: 'Jot down 3 positive things you felt grateful for today.' },
      { bn: 'নিজের কোনো ছোট সাফল্য বা ভালো কাজের জন্য নিজেকে ধন্যবাদ জানান।', en: 'Acknowledge at least one personal micro-win or kind gesture.' },
      { bn: 'যে বিষয়টি নিয়ন্ত্রণ করা আপনার সাধ্যে নেই, তা ছেড়ে দিয়ে মনকে হালকা করুন।', en: 'Consciously release worries over circumstances outside your control.' },
      { bn: 'শান্ত মনে দুই মিনিট চোখ বন্ধ করে ইতিবাচক চিন্তায় সময় কাটান।', en: 'Spend 2 minutes with eyes closed centering on a peaceful memory.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'মনোবিজ্ঞান পরামর্শ: কৃতজ্ঞতা প্রকাশের অভ্যাস ঘুম আসার সময়কে ২০ মিনিট এগিয়ে আনে এবং রাতের উৎকণ্ঠা কমায়।',
      en: 'Psychology Insight: Daily gratitude practices shorten sleep latency by 20 minutes and reduce ruminative anxiety.'
    }
  },
  {
    id: 'tip-13',
    day: 'শুক্রবার টিপস',
    category: { bn: 'পুষ্টি ও স্লিপ সাইকেল', en: 'Sleep & Nutrition' },
    title: { 
      bn: 'বিকেলের ক্যাফেইন কাট-অফ ও নিরবচ্ছিন্ন গভীর ঘুম', 
      en: 'Afternoon Caffeine Cut-Off for Deep Unbroken Sleep' 
    },
    description: { 
      bn: 'কফির ক্যাফেইনের হাফ-লাইফ প্রায় ৫-৭ ঘণ্টা। বিকেল ৪টার পর চা বা কফি খেলে রাতে ঘুম গভীর হয় না এবং বারবার ঘুম ভেঙে যাওয়ার প্রবণতা তৈরি হয়।', 
      en: 'Caffeine has a half-life of 5-7 hours. Consuming caffeine after 3-4 PM disrupts adenosine sleep pressure, fragmenting deep slow-wave restorative sleep.' 
    },
    actionableSteps: [
      { bn: 'বিকেল ৩টা বা ৪টার পর ক্যাফেইনযুক্ত কফি বা তীব্র চা পরিহার করুন।', en: 'Set a personal caffeine curfew between 3:00 PM and 4:00 PM.' },
      { bn: 'বিকেলে গরম ক্যামোমাইল চা, পুদিনা চা অথবা গরম দুধ বেছে নিন।', en: 'Switch to caffeine-free herbal chamomile, peppermint, or warm milk in the evening.' },
      { bn: 'পর্যাপ্ত পানি পান করে শরীর থেকে টক্সিন বের করে দিন।', en: 'Stay hydrated with plain water to clear metabolites comfortably.' },
      { bn: 'ঘুমানোর ঠিক আগে অতিরিক্ত মিষ্টি বা সোডা জাতীয় খাবার এড়িয়ে চলুন।', en: 'Avoid carbonated sodas and high-sugar desserts close to bedtime.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'স্লিপ মেডিসিন পরামর্শ: বিকেলের ক্যাফেইন বর্জন করলে গভীর (Slow-Wave) ঘুমের পরিমাণ ৩০% বৃদ্ধি পায়।',
      en: 'Sleep Medicine Advice: Eliminating late-day caffeine increases restorative slow-wave sleep by up to 30%.'
    }
  },
  {
    id: 'tip-14',
    day: 'শনিবার টিপস',
    category: { bn: 'ডিজিটাল ডিটক্স', en: 'Digital Detox' },
    title: { 
      bn: 'সাপ্তাহিক ১ ঘণ্টার ডিজিটাল ডিটক্স ও মনের সজীবতা', 
      en: 'Weekly 1-Hour Digital Detox for Mental Clarity' 
    },
    description: { 
      bn: 'সপ্তাহে অন্তত ১ ঘণ্টা সব স্ক্রিন, নোটিফিকেশন ও ফোন সম্পূর্ণ বন্ধ রেখে বই পড়া, প্রকৃতিতে থাকা অথবা পরিবারের সাথে সময় কাটালে মস্তিষ্কে নতুন সজীবতা আসে।', 
      en: 'Unplugging from all screens and notifications for just 60 minutes weekly allows overstimulated dopamine pathways to reset, reviving natural creativity.' 
    },
    actionableSteps: [
      { bn: 'ছুটির দিনে যেকোনো ১ ঘণ্টা ফোন সাইলেন্ট করে দূরে রেখে দিন।', en: 'Set phone on airplane mode and place it in another room for 1 hour.' },
      { bn: 'মুদ্রিত বই পড়ুন, ছবি আঁকুন অথবা কোনো শখের কাজ করুন।', en: 'Read a physical paper book, sketch, or engage in a tactile hands-on hobby.' },
      { bn: 'পরিবারের সদস্য বা বন্ধুদের সাথে স্ক্রিন ছাড়া সামনাসামনি কথা বলুন।', en: 'Have an uninterrupted face-to-face conversation with family or loved ones.' },
      { bn: 'সবুজের কাছাকাছি পার্কে বা গাছপালার মাঝে একটু সময় কাটান।', en: 'Spend mindful time in a park, garden, or quiet green space.' }
    ],
    readTime: '২ মিনিট',
    doctorNote: {
      bn: 'পরামর্শ: ডিজিটাল বিরতি মানসিক চাপ কমিয়ে মনোযোগ ও সৃজনশীল চিন্তার শক্তি দ্বিগুণ করে।',
      en: 'Advice: Screen-free intervals reset dopamine receptors and unlock divergent, creative problem solving.'
    }
  }
];

/**
 * Automatically calculates today's wellness tip based on the local calendar day.
 * Rotates strictly once every 24 hours at 12:00 AM (midnight) in the user's local timezone.
 */
export function getTodaysWellnessTip(tips: WellnessTip[] = DEFAULT_WELLNESS_TIPS): WellnessTip {
  const now = new Date();
  const localYear = now.getFullYear();
  const localMonth = now.getMonth();
  const localDate = now.getDate();
  
  // Local midnight timestamp converted to days since epoch
  const localMidnightUtc = Date.UTC(localYear, localMonth, localDate);
  const dayNumber = Math.floor(localMidnightUtc / (1000 * 60 * 60 * 24));
  
  const index = Math.abs(dayNumber) % tips.length;
  return tips[index];
}

export const DailyWellnessModal: React.FC = () => {
  const { isWellnessModalOpen, setWellnessModalOpen, language, setActiveTab } = useApp();
  const [selectedTipId, setSelectedTipId] = useState<string>(() => getTodaysWellnessTip().id);
  const [completedTipIds, setCompletedTipIds] = useState<string[]>(['tip-1']);
  const [copiedShare, setCopiedShare] = useState(false);
  const [customAiTip, setCustomAiTip] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync selected tip to today's active tip whenever modal opens
  React.useEffect(() => {
    if (isWellnessModalOpen) {
      setSelectedTipId(getTodaysWellnessTip().id);
    }
  }, [isWellnessModalOpen]);

  if (!isWellnessModalOpen) return null;

  const isBn = language === 'bn';
  const currentTip = DEFAULT_WELLNESS_TIPS.find(t => t.id === selectedTipId) || DEFAULT_WELLNESS_TIPS[0];
  const isCompleted = completedTipIds.includes(currentTip.id);

  const toggleComplete = (id: string) => {
    if (completedTipIds.includes(id)) {
      setCompletedTipIds(completedTipIds.filter(item => item !== id));
    } else {
      setCompletedTipIds([...completedTipIds, id]);
    }
  };

  const handleShare = () => {
    const text = `${currentTip.title[isBn ? 'bn' : 'en']} - ${currentTip.description[isBn ? 'bn' : 'en']} (Askio Wellness)`;
    if (navigator.share) {
      navigator.share({
        title: currentTip.title[isBn ? 'bn' : 'en'],
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleGenerateFreshAiTip = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      const tipsList = isBn ? [
        '💡 এখন ১০ মিনিট স্ক্রিন অফ রাখুন: দীর্ঘক্ষণ টানা পড়া বা কাজের পর চোখ বন্ধ করে ১০ মিনিট হালকা মিউজিক শুনুন। এটি মস্তিষ্কের তথ্য প্রক্রিয়াজাতকরণের গতি বাড়ায়।',
        '💧 ১ গ্লাস পানি পান করুন: আপনার শরীর হালকা ডিহাইড্রেটেড হলে মনোযোগ ১৫% কমে যায়। এখনই ১ গ্লাস পানি পান করুন।',
        '🧘 হালকা ঘাড় স্ট্র্যাচ করুন: ঘাড় ডানে-বামে ৫ বার করে ঘুরালে মস্তিষ্কে রক্ত সঞ্চালন তাৎক্ষণিক বৃদ্ধি পায়।',
        '☀️ প্রাকৃতিক আলো নিন: জানালায় দাঁড়িয়ে ৫ মিনিট বিকেলের রোদে থাকুন। এটি সেরোটোনিন হরমোন বাড়িয়ে মন সতেজ রাখে।'
      ] : [
        '💡 Take a 10-minute screen break: Close your eyes and listen to relaxing sounds to consolidate memory.',
        '💧 Drink 1 glass of water right now: Hydration recovers 15% lost focus caused by mild dehydration.',
        '🧘 Gentle Neck Stretches: Slowly roll your neck 5 times clockwise to boost blood flow to brain tissue.',
        '☀️ Natural Sunlight Boost: Step near a window for 5 minutes to release mood-lifting serotonin.'
      ];
      const randomIndex = Math.floor(Math.random() * tipsList.length);
      setCustomAiTip(tipsList[randomIndex]);
      setIsAiLoading(false);
    }, 700);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto cursor-pointer"
      onClick={() => setWellnessModalOpen(false)}
    >
      <div 
        id="daily-wellness-modal"
        className="relative w-full max-w-4xl my-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all cursor-default flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <HeartPulse className="w-6 h-6 text-emerald-100 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isBn ? 'দৈনিক সুস্থতা নির্দেশিকা' : 'Daily Wellness Protocol'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isBn ? 'ডেইলি ওয়েলনেস টিপস' : 'Daily Wellness Tips'}
              </h2>
            </div>
          </div>

          <button
            id="close-wellness-modal-btn"
            onClick={() => setWellnessModalOpen(false)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
            title={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Main Selected Tip Highlight Box */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white dark:from-emerald-950/30 dark:via-zinc-900 dark:to-zinc-900 border-2 border-emerald-300/80 dark:border-emerald-800/80 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
                  {currentTip.day}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  {currentTip.category[isBn ? 'bn' : 'en']}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{currentTip.readTime} {isBn ? 'পড়া' : 'read'}</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
              {currentTip.title[isBn ? 'bn' : 'en']}
            </h3>

            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-5">
              {currentTip.description[isBn ? 'bn' : 'en']}
            </p>

            {/* Actionable Steps List */}
            <div className="bg-white/90 dark:bg-zinc-800/80 border border-emerald-200/80 dark:border-zinc-700/80 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'করণীয় ৪টি সহজ ধাপ:' : '4 Key Action Steps:'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentTip.actionableSteps.map((stepObj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{stepObj[isBn ? 'bn' : 'en']}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor / Expert Clinical Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 mb-5">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                {currentTip.doctorNote[isBn ? 'bn' : 'en']}
              </p>
            </div>

            {/* Action Bar inside Featured Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
              <button
                id="toggle-tip-complete-btn"
                onClick={() => toggleComplete(currentTip.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>{isBn ? 'আজকের টিপস সম্পন্ন হয়েছে ✓' : 'Completed Today ✓'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? 'আজকের টিপস সম্পূর্ণ হিসেবে মার্ক করুন' : 'Mark Completed Today'}</span>
                  </>
                )}
              </button>

              <button
                id="share-wellness-tip-btn"
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{copiedShare ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'শেয়ার করুন' : 'Share Tip')}</span>
              </button>
            </div>
          </div>

          {/* AI Instant Custom Tip Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{isBn ? 'আজকের তাৎক্ষণিক এআই পরামর্শ' : 'Instant AI Wellness Generator'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-xs text-zinc-400">
                  {customAiTip || (isBn ? 'আপনার বর্তমান সময় ও স্বাস্থ্য লক্ষ্যের ওপর ভিত্তি করে টিপস তৈরি করুন।' : 'Generate an instant personalized wellness boost right now.')}
                </p>
              </div>
            </div>

            <button
              id="generate-fresh-ai-tip-btn"
              onClick={handleGenerateFreshAiTip}
              disabled={isAiLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'নতুন এআই টিপস পান' : 'Generate AI Tip'}</span>
            </button>
          </div>

          {/* Daily Tips Week List / Selection Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isBn ? 'সাপ্তাহিক অন্যান্য ওয়েলনেস টিপস' : 'Weekly Wellness Tips Catalog'}</span>
              </h4>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ৭টি স্পেশাল টিপস
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_WELLNESS_TIPS.map((tipItem) => {
                const isSelected = tipItem.id === selectedTipId;
                const isItemCompleted = completedTipIds.includes(tipItem.id);

                return (
                  <div
                    key={tipItem.id}
                    onClick={() => setSelectedTipId(tipItem.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-400 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold ${isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {tipItem.day}
                        </span>
                        {isItemCompleted && (
                          <span className={`flex items-center gap-0.5 text-[10px] font-extrabold ${isSelected ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {isBn ? 'সম্পন্ন' : 'Done'}
                          </span>
                        )}
                      </div>

                      <h5 className={`font-bold text-xs line-clamp-2 ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {tipItem.title[isBn ? 'bn' : 'en']}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-[11px]">
                      <span className={isSelected ? 'text-emerald-100' : 'text-zinc-500 dark:text-zinc-400'}>
                        {tipItem.category[isBn ? 'bn' : 'en']}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isBn ? 'প্রতিনিয়ত নতুন নতুন বৈজ্ঞানিক টিপস আপডেট করা হয়।' : 'Updated daily with verified lifestyle protocols.'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setWellnessModalOpen(false);
                setActiveTab('ai');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{isBn ? 'এআই ডক্টরের পরামর্শ নিন' : 'Ask AI Health Doctor'}</span>
            </button>

            <button
              onClick={() => setWellnessModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
