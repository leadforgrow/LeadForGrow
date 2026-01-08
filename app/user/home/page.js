'use client';

import React from 'react';
import LeadForGrowHero from './F';
import AgencyOSLanding from './S';
import PricingSection from './P';
import ContactFormSection from './C';
import UserNavbar from '../Header';
import { useTheme } from '../../components/ThemeContext';
import { Moon, Sun, X, Play } from 'lucide-react';

export default function LeadForGrowHeroPage() {
  const { theme, toggleTheme } = useTheme();
  const [showVideo, setShowVideo] = React.useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Navigation */}
      <UserNavbar />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-8 py-20 mt-25">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-purple-600 rounded-full opacity-20 blur-xl dark:opacity-40"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-pink-500 rounded-full opacity-20 blur-xl dark:opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-emerald-400 rounded-full opacity-20 blur-xl dark:opacity-40"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-xl dark:opacity-40"></div>
        
        {/* Profile Images */}
        <div className="absolute top-32 left-20 w-64 h-64 rounded-full overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl z-10 transition-colors duration-500">
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="w-32 h-32 bg-slate-400 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
        
        <div className="absolute top-48 right-24 w-72 h-72 rounded-full overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl z-10 transition-colors duration-500">
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="w-36 h-36 bg-slate-400 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>

        {/* Theme Toggle Badge */}
        <div 
          className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 cursor-pointer group"
          style={{marginTop:"-70px"}}
          onClick={toggleTheme}
        >
          <div className="bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg border border-slate-100 dark:border-slate-700 transition-all duration-500 group-hover:scale-110 active:scale-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${theme === 'dark' ? 'bg-indigo-600 ring-4 ring-indigo-900/20' : 'bg-amber-400 ring-4 ring-amber-100'}`}>
              {theme === 'dark' ? <Moon className="w-8 h-8 text-white" /> : <Sun className="w-8 h-8 text-white" />}
            </div>
          </div>
              <p className="text-center mt-3 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{theme === 'dark' ? 'I am your Lead' : 'I am your Lead'}</p>
          <p className="text-center text-[10px] text-indigo-500 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity mt-1 italic">Click to Switch</p>
        </div>

        {/* Main Content */}
        <div className="relative z-20 text-center pt-40" style={{marginTop:"-130px"}}>
          <h1 className="text-4xl sm:text-7xl md:text-8xl font-serif text-slate-900 dark:text-white leading-tight transition-colors duration-500">
            Turn interest into revenue<br />
            capture every lead<br />
            <span className="block sm:inline">automatically</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-4 font-light transition-colors duration-500">
            Scale your agency — all from one dashboard.
          </p>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 transition-colors duration-500">
            No more juggling tools. No more chaos. This is the platform agencies use to run their entire client operation.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setShowVideo(true)}
              className="bg-white dark:bg-transparent text-slate-900 dark:text-white px-8 py-4 rounded-xl text-lg font-bold border-2 border-slate-900 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center gap-2 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch video
            </button>
          </div>

          <p className="mt-6 text-sm text-slate-400 dark:text-slate-500 font-medium">
            No credit card required • Free 14-day trial
          </p>
        </div>

        {/* Decorative Arrows */}
        <div className="absolute bottom-10 left-12 text-slate-300 dark:text-slate-700">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
        
        <div className="absolute top-72 right-1/3 text-slate-300 dark:text-slate-700 transform rotate-180">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
      </div>

    
      <LeadForGrowHero />
      <AgencyOSLanding />
      <PricingSection />
      <ContactFormSection />

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/HZZpgqgy3kg?autoplay=1" 
              title="Product Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
