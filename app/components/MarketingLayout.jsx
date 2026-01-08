'use client';

import React from 'react';
import UserNavbar from '../user/Header';
import { useTheme } from './ThemeContext';

export default function MarketingLayout({ title, subtitle, children, maxWidth = '7xl' }) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden flex flex-col">
      <UserNavbar />

      {/* Hero Header for Marketing Pages */}
      <div className="relative pt-48 pb-24 px-8">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-600 rounded-full opacity-5 blur-3xl dark:opacity-20 animate-pulse"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-purple-500 rounded-full opacity-5 blur-3xl dark:opacity-20 animate-pulse delay-1000"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-10 w-full max-w-${maxWidth} mx-auto px-8 pb-32 flex-grow`}>
        {children}
      </div>

      {/* Footer is handled globally in layout.js but we can add secondary padding here if needed */}
    </div>
  );
}
