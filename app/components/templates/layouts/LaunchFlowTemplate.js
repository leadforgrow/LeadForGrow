"use client";

import React from 'react';
import { ArrowRight, Rocket, Play, Zap, Star, Menu, X } from 'lucide-react';

export default function LaunchFlowTemplate({ content, brandName }) {
  const { hero, highlights, whyMatters, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#8b5cf6";
  const accentColor = theme?.accentColor || "#06b6d4";
  const bgColor = theme?.backgroundColor || "#050505";
  const textColor = theme?.textColor || "#ffffff";

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500/30 overflow-x-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Tech Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5 px-6 py-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="text-2xl font-black tracking-tighter uppercase">{brandName}</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          {(navbar?.links || []).map((link, i) => (
             <a key={i} href={link.href} className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>
          ))}
          <a href={navbar?.ctaHref || "#contact"}>
            <button 
              className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
              style={{ '--hover-bg': primaryColor }}
            >
              {navbar?.ctaText || "Join Pre-Launch"}
            </button>
          </a>
        </div>
        <button className="lg:hidden" style={{ color: textColor }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
           {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Futuristic Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-40 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[150px] -z-10" style={{ backgroundColor: `${primaryColor}10` }} />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-12 animate-fade-in">
             <Rocket className="w-4 h-4" style={{ color: primaryColor }} /> New Era of Tech
          </div>
          <h1 className="text-6xl lg:text-9xl font-black leading-[0.95] mb-12 tracking-tight tracking-tighter animate-scale-up" style={{ color: textColor }}>
             {hero.heading}
          </h1>
          <p className="text-xl lg:text-3xl font-medium mb-16 max-w-3xl leading-relaxed opacity-50">
             {hero.subheading}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
             <a href={hero.ctaHref || "#contact"} className="w-full sm:w-auto">
               <button 
                 className="w-full px-12 py-6 text-white rounded-full font-black text-xl hover:bg-white hover:text-black transition-all active:scale-95 group flex items-center gap-4"
                 style={{ backgroundColor: primaryColor, boxShadow: `0 0 50px ${primaryColor}40` }}
               >
                  {hero.ctaText} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
               </button>
             </a>
             <button className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 rounded-full font-black text-xl hover:bg-white/10 transition-all flex items-center gap-3">
                <Play className="w-5 h-5" style={{ fill: textColor }} /> Watch Demo
             </button>
          </div>

          <div className="w-full max-w-6xl relative group">
             <div className="absolute -inset-1 rounded-[3.5rem] blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }} />
             <div className="relative bg-black rounded-[3rem] overflow-hidden border border-white/10 aspect-video">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${hero.visualUrl}`}
                    title="Launch Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
             </div>
          </div>
        </div>
      </section>

      {/* Tech Highlights Grid */}
      <section id="features" className="py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-bold mb-24 tracking-tighter text-center uppercase" style={{ color: textColor }}>{highlights.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            {highlights.items.map((item, i) => {
              const Icon = { Rocket, Star, Zap }[item.icon] || Zap;
              return (
                <div key={i} className="text-center group">
                   <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto transition-all duration-500 group-hover:rotate-12" style={{ '--hover-bg': primaryColor }}>
                      <Icon className="w-10 h-10 transition-colors group-hover:text-white" style={{ color: primaryColor }} />
                   </div>
                   <h3 className="text-2xl font-bold mb-6 tracking-tight uppercase transition-colors" style={{ color: textColor }}>{item.title}</h3>
                   <p className="text-lg font-medium leading-relaxed uppercase text-sm tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Matters - Dark Content Block */}
      <section className="py-24 lg:py-40 px-6 rounded-[5rem] mx-6" style={{ backgroundColor: primaryColor }}>
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1">
               <h2 className="text-4xl lg:text-7xl font-bold text-white mb-10 tracking-tighter leading-none uppercase">{whyMatters.title}</h2>
               <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-12 opacity-80">{(whyMatters.text || "")}</p>
               <div className="flex gap-10">
                  <div>
                    <div className="text-4xl font-black">100%</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-bold mt-2 text-white">Open Source</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black">2026</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 font-bold mt-2 text-white">v1.0 Beta</div>
                  </div>
               </div>
            </div>
            <div className="flex-1 w-full max-w-lg relative">
               <img src={whyMatters.visualUrl} className="w-full h-auto rounded-[3.5rem] shadow-2xl scale-110" alt="Tech Visual" />
               <div className="absolute inset-0 bg-black/20 rounded-[3.5rem]" />
            </div>
         </div>
      </section>

      {/* Waitlist Form - Minimal Dark */}
      <section id="waitlist" className="py-24 lg:py-56 px-6">
         <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl lg:text-7xl font-bold mb-10 tracking-tighter uppercase" style={{ color: textColor }}>{form.title}</h2>
            <p className="text-xl font-medium mb-16 opacity-50">{form.subtitle}</p>
            <form className="space-y-4">
               {form.fields.map((f, i) => (
                 <input key={i} type={f.type || "text"} placeholder={f.placeholder} className="w-full px-10 py-6 bg-white/5 border-2 border-white/10 focus:border-white rounded-3xl outline-none text-white font-bold transition-all uppercase tracking-widest text-sm" />
               ))}
               <button className="w-full py-7 text-white rounded-3xl font-black text-2xl transition-all uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>{form.buttonText}</button>
            </form>
         </div>
      </section>

      {/* Futuristic Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-2xl font-black tracking-widest uppercase" style={{ color: textColor }}>{brandName}</div>
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: `${textColor}40` }}>
               {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="hover:text-white transition-colors">{link.label}</a>)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-20">SYSTEM STATUS: ACTIVE</div>
         </div>
      </footer>

      <style jsx>{`
         @keyframes scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
         @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
         .animate-scale-up { animation: scale-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
         .animate-fade-in { animation: fade-in 1s 0.3s forwards; opacity: 0; }
      `}</style>
    </div>
  );
}
