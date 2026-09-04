/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">a.</span>
          </div>
          <span className="font-semibold text-xl tracking-tight">Askio</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <a href="#" className="hover:text-zinc-900 transition-colors">Product</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Solutions</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Log in
          </button>
          <button className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-600 mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Askio AI 2.0 is now available</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 max-w-3xl leading-[1.1] mb-6">
          Find the answers you need, instantly.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mb-12">
          Askio connects you to the world's knowledge. Type any question and get synthesized, accurate answers in milliseconds.
        </p>

        {/* Search Input Mock */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="What do you want to know?" 
            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pl-12 pr-32 text-lg shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all placeholder:text-zinc-400"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-colors">
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-32 text-left">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <Zap className="w-5 h-5 text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Lightning Fast</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Powered by advanced neural search, Askio retrieves and synthesizes information before you even finish typing.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <Shield className="w-5 h-5 text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Verified Sources</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Every answer is backed by verified citations. Dive deeper into the source material with a single click.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <Sparkles className="w-5 h-5 text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">AI Synthesized</h3>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Complex topics are broken down into easy-to-understand summaries, saving you hours of reading.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
