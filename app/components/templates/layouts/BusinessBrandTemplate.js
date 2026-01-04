"use client";

import React from 'react';
import { Globe, Building2, Shield, Users, ArrowRight, Menu, X } from 'lucide-react';

export default function BusinessBrandTemplate({ content, brandName }) {
  const { hero, about, services, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#0f172a";
  const accentColor = theme?.accentColor || "#64748b";
  const bgColor = theme?.backgroundColor || "#ffffff";
  const textColor = theme?.textColor || "#0f172a";

  return (
    <div className="min-h-screen font-sans selection:bg-slate-900 selection:text-white" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Formal Corporate Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 py-5 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8" style={{ color: textColor }} />
            <span className="text-xl font-black uppercase tracking-tighter italic" style={{ color: textColor }}>{brandName}</span>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em]">
          {(navbar?.links || []).map((link, i) => (
            <a key={i} href={link.href} className="opacity-40 hover:opacity-100 transition-opacity" style={{ color: textColor }}>{link.label}</a>
          ))}
          <a href={navbar?.ctaHref || "#contact"}>
            <button className="px-8 py-3 bg-slate-900 text-white rounded font-bold hover:bg-slate-700 transition-all uppercase tracking-widest text-[9px]">
              {navbar?.ctaText || "Global Presence"}
            </button>
          </a>
        </div>
        <button className="lg:hidden" style={{ color: textColor }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
           {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Structured Hero Section */}
      <section className="pt-40 pb-24 lg:pt-56 lg:pb-40 px-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100 skew-x-[-15deg] transform origin-top translate-x-32" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="flex-1">
            <h1 className="text-5xl lg:text-8xl font-black leading-[0.95] mb-10 tracking-tighter uppercase italic" style={{ color: textColor }}>
               {hero.heading}
            </h1>
            <p className="text-xl font-medium mb-12 max-w-2xl leading-relaxed opacity-50">
               {hero.subheading}
            </p>
            <a href={hero.ctaHref || "#contact"}>
              <button className="px-10 py-5 bg-slate-900 text-white rounded font-black text-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-4 uppercase tracking-widest shadow-xl">
                 {hero.ctaText} <ArrowRight className="w-6 h-6" />
              </button>
            </a>
          </div>
          <div className="flex-1 w-full max-w-2xl">
             <div className="relative border-t-8 border-l-8 border-slate-900 p-6 pt-12 pl-12 bg-white shadow-2xl skew-y-[-2deg]" style={{ borderColor: textColor }}>
                <img src={hero.visualUrl} className="w-full h-auto rounded-none grayscale" alt="Corporate" />
                <div className="absolute top-0 left-0 bg-slate-900 text-white p-6 font-black text-4xl italic -translate-x-6 -translate-y-6" style={{ backgroundColor: textColor }}>
                   GLOBAL
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Corporate Mission */}
      <section className="py-24 lg:py-48 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-24">
          <div className="flex-1">
             <div className="w-20 h-1 mb-10" style={{ backgroundColor: textColor }} />
             <h2 className="text-4xl lg:text-7xl font-black mb-12 tracking-tighter leading-none uppercase italic" style={{ color: textColor }}>{about.title}</h2>
             <p className="text-xl font-medium leading-relaxed mb-16 opacity-40">{about.text}</p>
             <div className="grid grid-cols-2 gap-12">
                <div>
                   <div className="text-5xl font-black italic tracking-tighter underline decoration-4 decoration-slate-200" style={{ color: textColor }}>1995</div>
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-4">Founded Year</p>
                </div>
                <div>
                   <div className="text-5xl font-black italic tracking-tighter underline decoration-4 decoration-slate-200" style={{ color: textColor }}>5k+</div>
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-4">Employees</p>
                </div>
             </div>
          </div>
          <div className="flex-1 w-full max-w-xl">
             <img src={about.visualUrl} className="w-full h-auto rounded-none shadow-xl border-4 border-slate-50" alt="Mission" />
          </div>
        </div>
      </section>

      {/* Core Solutions Grid */}
      <section className="py-24 lg:py-48 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10">
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">{services.title}</h2>
              <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-sm">
                 <Globe className="w-6 h-6" /> International Standards
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
             {services.items.map((item, i) => (
                <div key={i} className="bg-white/5 p-16 border border-white/10 hover:bg-white hover:text-slate-900 transition-all duration-500 group">
                   <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-12 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <Shield className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic" style={{ color: 'inherit' }}>{item.title}</h3>
                   <p className="text-slate-400 font-medium leading-relaxed group-hover:text-slate-700 transition-colors">{item.description}</p>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* Formal Inquiry Form */}
      <section id="contact" className="py-24 lg:py-48 px-6 bg-slate-50">
         <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
               <h2 className="text-xl font-black uppercase tracking-widest italic text-slate-400 mb-8 underline decoration-2 decoration-slate-200 underline-offset-8">Get in Touch</h2>
               <h3 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none mb-10 uppercase italic" style={{ color: textColor }}>{form.title}</h3>
               <p className="text-lg font-medium opacity-40">Please provide your corporate details for an official follow-up.</p>
            </div>
            <div className="lg:w-2/3 bg-white p-10 lg:p-20 shadow-2xl border border-slate-100">
               <form className="space-y-8">
                  {form.fields.map((f, i) => (
                    <div key={i} className="border-b-2 border-slate-50 focus-within:border-slate-900 transition-colors">
                       <label className="block text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">{f.label}</label>
                       <input type={f.type || "text"} placeholder={f.placeholder} className="w-full bg-transparent py-4 text-xl font-bold outline-none placeholder:text-slate-100" style={{ color: textColor }} />
                    </div>
                  ))}
                  <button className="w-full py-6 bg-slate-900 text-white font-black text-xl hover:bg-slate-700 transition-all shadow-xl uppercase tracking-widest">
                    {form.buttonText}
                  </button>
               </form>
            </div>
         </div>
      </section>

      {/* Formal Footer */}
      <footer className="py-20 px-6 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16">
            <div className="max-w-xs">
                <div className="text-2xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2" style={{ color: textColor }}>
                    <Building2 className="w-6 h-6" /> {brandName}
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Leading the future of industry through innovation, sustainability, and corporate excellence.</p>
            </div>
            <div className="flex gap-24">
               <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: textColor }}>Navigation</p>
                  {(footer.links || []).map((link, i) => <a key={i} href={link.href || "#"} className="block text-sm font-bold opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest" style={{ color: textColor }}>{link.label}</a>)}
               </div>
               <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: textColor }}>Connect</p>
                  <p className="text-sm font-black italic uppercase" style={{ color: textColor }}>{footer.contactInfo?.email}</p>
                  <p className="text-sm font-bold opacity-40" style={{ color: textColor }}>{footer.contactInfo?.phone}</p>
               </div>
            </div>
            <div className="flex flex-col items-end gap-10">
               <div className="flex gap-4">
                  {[1,2,3].map(i => <div key={i} className="w-10 h-10 border border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all cursor-pointer"><Globe className="w-4 h-4" /></div>)}
               </div>
               <p className="text-[10px] font-black opacity-10 uppercase tracking-[0.5em]">© {new Date().getFullYear()} GLOBAL GROUP SERVICES</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
