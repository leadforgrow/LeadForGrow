"use client";

import React from 'react';
import { ArrowUpRight, ArrowRight, Shield, Star, Globe, Menu, X, Building2 } from 'lucide-react';

export default function AgencyPrimeTemplate({ content, brandName }) {
  const { hero, services, about, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#ffffff";
  const bgColor = theme?.backgroundColor || "#080808";
  const textColor = theme?.textColor || "#ffffff";

  return (
    <div className="min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* High-End Agency Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 lg:px-12 flex items-center justify-between mix-blend-difference">
        <div className="text-2xl font-black tracking-tighter uppercase leading-none" style={{ color: textColor }}>{brandName}</div>
        <div className="flex items-center gap-12">
            <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.4em]">
               {(navbar?.links || []).map((link, i) => (
                 <a key={i} href={link.href} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>
               ))}
            </div>
            <a href={navbar?.ctaHref || "#contact"}>
              <button className="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                {navbar?.ctaText || "Contact Prime"}
              </button>
            </a>
        </div>
      </nav>

      {/* Authority Hero Section */}
      <section className="relative pt-48 pb-24 lg:pt-64 lg:pb-56 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] mb-12 opacity-40">
             <div className="w-12 h-[1px] bg-current opacity-20" /> CREATIVE PARTNER <div className="w-12 h-[1px] bg-current opacity-20" />
          </div>
          <h1 className="text-6xl lg:text-[10rem] font-black leading-[0.85] mb-16 tracking-tighter uppercase italic">
             {(hero.heading || "").split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 0 ? "block" : "block text-transparent stroke-white stroke-2"} style={{ WebkitTextStrokeColor: textColor }}>{word}</span>
             ))}
          </h1>
          <p className="text-xl lg:text-3xl font-medium mb-16 max-w-3xl leading-relaxed opacity-60">
             {hero.subheading}
          </p>
          <a href={hero.ctaHref || "#contact"}>
            <button className="group relative px-12 py-6 bg-transparent border border-white rounded-full font-bold text-xl uppercase tracking-widest overflow-hidden transition-all hover:text-black" style={{ borderColor: textColor, color: textColor }}>
               <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
               {hero.ctaText}
            </button>
          </a>
        </div>
      </section>

      {/* Services Grid - Dark & Structured */}
      <section className="py-24 lg:py-48 px-6 border-y border-white/5 bg-[#0a0a0a]">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
               <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-none mb-10" style={{ color: textColor }}>{services.title}</h2>
               <p className="opacity-40 text-lg font-medium leading-relaxed">We specialize in solving complex problems through modular design and intelligent code.</p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               {services.items.map((item, i) => (
                 <div key={i} className="p-12 border border-white/10 rounded-[3rem] hover:bg-white hover:text-black transition-all duration-700 group">
                    <div className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center mb-10 group-hover:border-black/10">
                       <ArrowUpRight className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold mb-6 tracking-tight uppercase" style={{ color: textColor }}>{item.title}</h3>
                    <p className="opacity-40 font-medium group-hover:text-black/60 transition-colors">{item.description}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* About Prime - Overlapping Design */}
      <section className="py-24 lg:py-48 px-6 relative overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 relative z-10 text-center lg:text-left">
               <h2 className="text-4xl lg:text-8xl font-black mb-12 tracking-tighter leading-none uppercase italic" style={{ color: textColor }}>{about.title}</h2>
               <p className="text-xl lg:text-3xl font-medium leading-relaxed mb-16 italic font-serif opacity-50">"{about.text}"</p>
               <div className="flex justify-center lg:justify-start gap-16">
                  <div>
                    <div className="text-5xl font-black" style={{ color: textColor }}>20+</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-30 font-bold mt-2">Team Experts</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black" style={{ color: textColor }}>99%</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-30 font-bold mt-2">Satisfaction</div>
                  </div>
               </div>
            </div>
            <div className="flex-1 w-full max-w-xl">
               <div className="relative group grayscale hover:grayscale-0 transition-all duration-1000">
                  <div className="absolute -inset-10 bg-white rounded-full blur-[150px] opacity-10 -z-10 group-hover:opacity-20 transition-opacity" />
                  <img src={about.visualUrl} className="w-full h-auto rounded-[4rem] shadow-2xl skew-y-3 group-hover:skew-y-0 transition-transform duration-1000" alt="Prime Vision" />
               </div>
            </div>
         </div>
      </section>

      {/* High-Impact Contact Form */}
      <section className="py-24 lg:py-48 px-6 bg-white text-black rounded-t-[5rem]">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-[7rem] font-black tracking-tighter leading-none mb-12 text-center uppercase italic">{form.title}</h2>
            <div className="space-y-12">
               {form.fields.map((f, i) => (
                 <div key={i} className="group relative">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4 ml-2 group-focus-within:text-black transition-colors">{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} className="w-full bg-transparent border-b-2 border-slate-100 py-6 text-2xl lg:text-4xl font-black outline-none placeholder:text-slate-100 focus:border-black transition-all" />
                 </div>
               ))}
               <button className="w-full py-10 bg-black text-white rounded-full font-black text-3xl uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-6 group active:scale-95 shadow-2xl">
                  {form.buttonText} <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
               </button>
            </div>
         </div>
      </section>

      {/* Dark Footer */}
      <footer className="py-24 px-6 bg-black text-white">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
            <div>
               <div className="text-2xl font-black tracking-widest uppercase mb-6" style={{ color: textColor }}>{brandName}</div>
               <p className="opacity-40 text-sm font-medium leading-relaxed">Top-tier digital solutions for brands that demand more than just standard.</p>
            </div>
            <div className="flex flex-col gap-6">
               <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.5em] mb-4">Quick Links</p>
               {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="text-lg font-bold opacity-50 hover:opacity-100 transition-opacity uppercase" style={{ color: textColor }}>{link.label}</a>)}
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-[10px] font-bold opacity-20 uppercase tracking-[0.5em] mb-6 tracking-widest">Connect</p>
                <div className="text-3xl font-black italic mb-2 tracking-tighter uppercase" style={{ color: textColor }}>{footer.contactInfo?.email}</div>
                <div className="text-lg font-bold opacity-50 tracking-widest">{footer.contactInfo?.phone}</div>
            </div>
         </div>
      </footer>
      
      <style jsx global>{`
        .stroke-white { -webkit-text-stroke: 1px white; }
        .stroke-2 { -webkit-text-stroke-width: 2px; }
      `}</style>
    </div>
  );
}
