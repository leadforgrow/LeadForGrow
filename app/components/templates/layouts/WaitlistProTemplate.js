"use client";

import React from 'react';
import { ArrowRight, Sparkles, Send, CheckCircle, Menu, X } from 'lucide-react';

export default function WaitlistProTemplate({ content, brandName }) {
  const { hero, valueProp, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#4f46e5";
  const accentColor = theme?.accentColor || "#ef4444";
  const bgColor = theme?.backgroundColor || "#ffffff";
  const textColor = theme?.textColor || "#1e293b";

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 italic gap-2" style={{ backgroundColor: bgColor, color: textColor }}>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 flex items-center justify-between pointer-events-none">
        <div className="text-2xl font-black tracking-tighter uppercase pointer-events-auto" style={{ color: primaryColor }}>{brandName}</div>
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="hidden md:flex items-center gap-8">
            {(navbar?.links || []).map((link, i) => (
              <a key={i} href={link.href} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>
            ))}
          </div>
          <a href={navbar?.ctaHref || "#contact"}>
            <button 
              className="px-6 py-2.5 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              {navbar?.ctaText || "Join List"}
            </button>
          </a>
        </div>
      </nav>

      {/* Gradient Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 px-6 overflow-hidden text-center" style={{ backgroundImage: `linear-gradient(to bottom, ${primaryColor}05, ${bgColor})` }}>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-transparent -z-10" style={{ backgroundImage: `radial-gradient(circle at center, ${primaryColor}10, transparent)` }} />
        <div className="max-w-4xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-slate-100 text-[10px] font-bold uppercase tracking-widest mb-10 animate-bounce" style={{ color: primaryColor }}>
              <Sparkles className="w-4 h-4" /> Next-Gen Platform
           </div>
           <h1 className="text-6xl lg:text-9xl font-black leading-[0.9] mb-10 tracking-tighter" style={{ color: textColor }}>
              {hero.heading}
           </h1>
           <p className="text-xl lg:text-3xl font-medium mb-16 max-w-2xl mx-auto leading-relaxed opacity-40">
              {hero.subheading}
           </p>
           <a 
             href={hero.ctaHref || "#join"} 
             className="px-12 py-6 text-white rounded-[2rem] font-black text-xl hover:opacity-90 shadow-2xl transition-all inline-flex items-center gap-4 active:scale-95"
             style={{ backgroundColor: primaryColor }}
           >
              {hero.ctaText} <ArrowRight className="w-6 h-6" />
           </a>
        </div>
        <div className="max-w-6xl mx-auto mt-20 relative px-6">
           <div className="absolute -inset-10 rounded-[5rem] blur-[120px] opacity-10 -z-10" style={{ backgroundColor: primaryColor }} />
           <img src={hero.visualUrl} className="w-full h-auto rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white" alt="App Preview" />
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 lg:py-48 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1">
             <h2 className="text-4xl lg:text-7xl font-bold mb-10 tracking-tighter leading-none" style={{ color: textColor }}>{valueProp.title}</h2>
             <div className="space-y-8 text-xl font-medium leading-relaxed opacity-60">
                {(valueProp.text || "").split('\n').map((p, i) => (
                    <div key={i} className="flex gap-4">
                        <CheckCircle className="w-6 h-6 shrink-0 mt-1" style={{ color: primaryColor }} />
                        <p>{p}</p>
                    </div>
                ))}
             </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
             <div className="relative">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-50 -z-10" style={{ backgroundColor: `${primaryColor}10` }} />
                <img src={valueProp.visualUrl} className="w-full h-auto rounded-[3rem] shadow-2xl grayscale" alt="Problem Solving" />
             </div>
          </div>
        </div>
      </section>

      {/* The Mega Form */}
      <section id="join" className="py-24 lg:py-48 px-6 rounded-[5.5rem] mx-6 lg:mx-20 text-white text-center relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent -z-0" />
         <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-4xl lg:text-7xl font-bold mb-8 tracking-tighter leading-tight">{form.title}</h2>
            <p className="text-xl text-indigo-100 font-medium mb-16 opacity-80">{form.subtitle}</p>
            <form className="bg-white/10 p-4 rounded-[3.5rem] border border-white/20 flex flex-col sm:flex-row gap-4 shadow-2xl">
               {form.fields.map((f, i) => (
                 <input key={i} type={f.type || "text"} placeholder={f.placeholder} className="flex-1 px-8 py-6 bg-transparent text-white placeholder:text-white/40 outline-none font-bold text-xl" />
               ))}
               <button 
                 className="px-10 py-6 bg-white rounded-[2.5rem] font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                 style={{ color: primaryColor }}
               >
                  {form.buttonText} <Send className="w-6 h-6" />
               </button>
            </form>
         </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-20 px-6 text-center">
         <div className="text-2xl font-black tracking-tighter uppercase mb-6" style={{ color: primaryColor }}>{brandName}</div>
         <div className="flex justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: `${textColor}20` }}>
            {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>)}
         </div>
         <p className="mt-12 text-[10px] font-bold uppercase tracking-widest opacity-20">© {new Date().getFullYear()} POWERED BY {brandName.toUpperCase()}</p>
      </footer>
    </div>
  );
}
