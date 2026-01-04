"use client";

import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection({ content, variant = 'split', theme = 'light' }) {
  const { heading, subheading, ctaText, visualType, visualUrl } = content;

  const themes = {
    light: 'bg-white text-slate-900',
    dark: 'bg-slate-900 text-white',
    blue: 'bg-blue-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    gradient: 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white'
  };

  const VisualElement = () => (
    <div className="relative group">
      <div className={`absolute -inset-4 rounded-[3rem] blur-3xl opacity-30 -z-10 group-hover:scale-110 transition-transform duration-700 ${theme === 'light' ? 'bg-indigo-500' : 'bg-white'}`}></div>
      <div className={`relative rounded-[2.5rem] border-8 overflow-hidden shadow-2xl aspect-video lg:aspect-square flex items-center justify-center transition-transform duration-700 group-hover:rotate-1 ${theme === 'light' ? 'border-slate-50' : 'border-white/10'}`}>
        {visualType === 'youtube' ? (
          <div className="w-full h-full relative">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${visualUrl}`}
              title="Hero Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="absolute inset-0 bg-slate-900/10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
          </div>
        ) : (
          <img
            src={visualUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'}
            alt="Hero Visual"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        )}
      </div>
    </div>
  );

  if (variant === 'centered') {
    return (
      <section className={`relative py-32 lg:py-48 px-6 text-center overflow-hidden ${themes[theme]}`}>
        {theme === 'gradient' && (
           <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 -z-0"></div>
        )}
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl lg:text-8xl font-black leading-[1] mb-8 tracking-tight animate-scale-up">
            {heading}
          </h1>
          <p className={`text-xl font-medium mb-12 opacity-90 leading-relaxed max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-500' : 'text-indigo-100'}`}>
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className={`px-12 py-6 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 group flex items-center gap-3 ${theme === 'light' ? 'bg-indigo-600 text-white hover:bg-slate-900' : 'bg-white text-indigo-600 hover:bg-indigo-50'}`}>
              {ctaText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-20 relative z-10">
          <VisualElement />
        </div>
        <style jsx>{`
            @keyframes scale-up {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-scale-up { animation: scale-up 0.8s ease-out forwards; }
        `}</style>
      </section>
    );
  }

  if (variant === 'modern') {
     return (
        <section className={`relative min-h-screen pt-40 pb-20 px-6 flex items-center overflow-hidden ${themes[theme]}`}>
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    Launching 2026
                 </div>
                 <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-8">
                    {heading}
                 </h1>
                 <p className="text-xl opacity-80 mb-10 leading-relaxed">
                    {subheading}
                 </p>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button className="px-10 py-5 bg-white text-slate-900 rounded-full font-bold shadow-xl hover:bg-slate-100 transition-all flex items-center gap-2 group">
                       Get Early Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-10 py-5 border border-white/20 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                       <Play className="w-4 h-4 fill-white" /> Watch Demo
                    </button>
                 </div>
              </div>
              <div className="relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
                 <div className="lg:scale-110">
                    <VisualElement />
                 </div>
              </div>
           </div>
        </section>
     )
  }

  return (
    <section className={`relative py-24 lg:py-40 px-6 overflow-hidden ${themes[theme]}`}>
      {theme === 'light' && (
         <>
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10"></div>
         </>
      )}
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] mb-8 tracking-tight animate-slide-in">
            {heading}
          </h1>
          <p className={`text-xl font-medium mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-90 ${theme === 'light' ? 'text-slate-500' : 'text-blue-50'}`}>
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button className={`px-12 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl active:scale-95 group flex items-center gap-2 ${theme === 'light' ? 'bg-indigo-600 text-white hover:bg-slate-900' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
              {ctaText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full max-w-xl">
          <VisualElement />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </section>
  );
}
