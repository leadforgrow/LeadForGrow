"use client";

import React from 'react';
import { ArrowRight, Zap, CheckCircle, Menu, X } from 'lucide-react';

export default function QuickLeadTemplate({ content, brandName }) {
  const { hero, description, form, footer, navbar, theme } = content;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const primaryColor = theme?.primaryColor || "#4f46e5";
  const accentColor = theme?.accentColor || "#6366f1";
  const bgColor = theme?.backgroundColor || "#ffffff";
  const textColor = theme?.textColor || "#1e293b";

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100" style={{ backgroundColor: bgColor, color: textColor }}>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 lg:px-12 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-slate-100">
        <div className="text-xl font-bold tracking-tighter" style={{ color: primaryColor }}>{brandName}</div>
        <div className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-[0.2em]" style={{ color: `${textColor}80` }}>
          {(navbar?.links || [{ label: "How it works", href: "#about" }]).map((link, i) => (
            <a key={i} href={link.href} className="hover:text-indigo-600 transition-colors" style={{ '--hover-color': primaryColor }}>{link.label}</a>
          ))}
          <a href={navbar?.ctaHref || "#contact"}>
            <button 
              className="px-6 py-3 text-white rounded-lg font-bold hover:shadow-xl transition-all active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              {navbar?.ctaText || "Inquire Now"}
            </button>
          </a>
        </div>
        <button className="md:hidden" style={{ color: textColor }} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Hero Section - Centered & Clean */}
      <section className="pt-40 pb-20 px-6 text-center bg-white rounded-b-[4rem] shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
            <Zap className="w-3 h-3" style={{ fill: primaryColor }} /> Fast Inquiries
          </div>
          <h1 className="text-5xl lg:text-8xl font-black leading-[1] mb-8 tracking-tighter uppercase italic skew-x-[-2deg]" style={{ color: textColor }}>
             {hero.heading}
          </h1>
          <p className="text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed opacity-70">
            {hero.subheading}
          </p>
          
          <a href={hero.ctaHref || "#contact"} className="mb-12 inline-block">
            <button 
              className="px-10 py-5 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest"
              style={{ backgroundColor: primaryColor }}
            >
              {hero.ctaText} <ArrowRight className="w-6 h-6" />
            </button>
          </a>

          <div className="relative max-w-5xl mx-auto mt-16 group">
             <div className="absolute -inset-10 rounded-[5rem] blur-3xl opacity-30 -z-10 animate-pulse" style={{ backgroundColor: `${primaryColor}20` }}></div>
             <img src={hero.visualUrl} className="w-full h-auto rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000" alt="QuickHero" />
          </div>
        </div>
      </section>

      {/* Simplified Description */}
      <section id="about" className="py-24 lg:py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
             <h2 className="text-4xl lg:text-5xl font-bold mb-10 tracking-tight">{description.title}</h2>
             <div className="space-y-8">
                {(description.text || "").split('\n').map((p, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}10` }}>
                            <CheckCircle className="w-4 h-4" style={{ color: accentColor }} />
                        </div>
                        <p className="text-lg font-medium leading-relaxed opacity-70">{p}</p>
                    </div>
                ))}
             </div>
          </div>
          <div className="flex-1">
             <div className="p-8 bg-white rounded-[3rem] shadow-xl border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${primaryColor}05` }}></div>
                <img src={description.visualUrl} className="w-full h-auto rounded-[2rem] relative z-10" alt="Quick Feature" />
             </div>
          </div>
        </div>
      </section>

      {/* Form Section - Direct & Urgent */}
      <section id="contact" className="py-24 lg:py-40 px-6 rounded-[5rem] mx-6 lg:mx-12 overflow-hidden relative" style={{ backgroundColor: primaryColor }}>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white/10 blur-[150px] -z-0"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl lg:text-7xl font-bold text-white mb-6 uppercase tracking-tight">{form.title}</h2>
          <p className="text-white/60 text-lg font-medium mb-16">{form.subtitle}</p>
          
          <form className="space-y-4 text-left max-w-xl mx-auto">
            {form.fields.map((field, i) => (
              <input key={i} type={field.type || "text"} placeholder={field.placeholder} className="w-full px-8 py-6 bg-white/5 border-2 border-white/10 focus:border-white rounded-2xl outline-none text-white transition-all font-bold placeholder:text-white/20" />
            ))}
            <button className="w-full py-6 bg-white text-slate-900 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-2xl active:scale-95 group uppercase tracking-widest pt-7" style={{ color: primaryColor }}>
              {form.buttonText} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center">
         <div className="text-2xl font-black tracking-tighter mb-6 uppercase" style={{ color: primaryColor }}>{brandName}</div>
         <p className="text-sm font-bold uppercase tracking-widest opacity-40">Minimal. Fast. Effective.</p>
         <div className="flex justify-center gap-6 mt-8 mb-12">
            {(footer.links || []).map((link, i) => (
               <a key={i} href={link.href || "#"} className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">{link.label}</a>
            ))}
         </div>
         <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em]">© {new Date().getFullYear()} {brandName.toUpperCase()} ENGINE</div>
      </footer>
    </div>
  );
}
